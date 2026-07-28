import { supabase } from '@/lib/supabase'
import type { Deliverable, DeliverableStatus } from '@/types'

export const deliverableService = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data as Deliverable | null
  },

  async getPendingByOrgId(organizationId: string) {
    const { data, error } = await supabase
      .from('deliverables')
      .select('id, status, projects!inner(session_id, sessions!inner(organization_id))')
      .eq('projects.sessions.organization_id', organizationId)
    if (error) throw error
    return data as unknown as Deliverable[]
  },

  async updateStatus(id: string, status: DeliverableStatus, reviewedBy: string) {
    const { error } = await supabase
      .from('deliverables')
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: reviewedBy })
      .eq('id', id)
    if (error) throw error
  },

  async getByUserIdWithProject(userId: string) {
    const { data, error } = await supabase
      .from('deliverables')
      .select('*, projects(title)')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    if (error) throw error
    return data as (Deliverable & { projects: { title: string } | null })[]
  },

  async getByOrgIdWithDetails(organizationId: string, page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, count, error } = await supabase
      .from('deliverables')
      .select('*, projects!inner(title, session_id, sessions!inner(name)), user_profiles!inner(full_name, email)', { count: 'exact', head: false })
      .eq('projects.sessions.organization_id', organizationId)
      .order('submitted_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return { data, count }
  },

  async create(deliverable: {
    project_id: string
    user_id: string
    file_url: string | null
    notes: string | null
  }) {
    const { error } = await supabase
      .from('deliverables')
      .insert(deliverable)
    if (error) throw error
  },

  async uploadFile(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage.from('deliverables').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('deliverables').getPublicUrl(path)
    return publicUrl
  },
}
