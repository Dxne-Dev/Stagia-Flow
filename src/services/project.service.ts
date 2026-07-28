import { supabase } from '@/lib/supabase'
import type { Project, ProjectStatus, DeliverableType } from '@/types'

export interface ProjectWithSession extends Project {
  sessions?: { name: string; academic_level: string; academic_year: number | null }
}

export const projectService = {
  async getBySessionIds(sessionIds: string[], page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, count, error } = await supabase
      .from('projects')
      .select('*, sessions(name, academic_level, academic_year)', { count: 'exact', head: false })
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return { data: data as ProjectWithSession[], count }
  },

  async getRecentByOrgId(organizationId: string, limit = 5) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, sessions!inner(organization_id)')
      .eq('sessions.organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as Project[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, sessions(name, academic_level)')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data as ProjectWithSession | null
  },

  async getBySessionId(sessionId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle()
    if (error) throw error
    return data as Project | null
  },

  async getActiveBySessionId(sessionId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'active')
    if (error) throw error
    return data as Project[]
  },

  async getBySessionIdNonArchived(sessionId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('session_id', sessionId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Project[]
  },

  async create(project: {
    session_id: string
    title: string
    context_objective: string | null
    instructions: string | null
    deliverable_type: DeliverableType
    deadline: string | null
    status: ProjectStatus
    created_by: string
  }) {
    const { error } = await supabase
      .from('projects')
      .insert(project)
    if (error) throw error
  },

  async updateStatus(id: string, status: ProjectStatus) {
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
