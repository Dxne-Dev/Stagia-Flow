import { supabase } from '@/lib/supabase'
import type { Session } from '@/types'

export const sessionService = {
  async getByOrgId(organizationId: string, page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: false })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return { data: data as Session[], count }
  },

  async getAllByOrgId(organizationId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('organization_id', organizationId)
    if (error) throw error
    return data as Session[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data as Session | null
  },

  async create(session: {
    organization_id: string
    name: string
    academic_level: Session['academic_level']
    academic_year: number | null
    department: string | null
  }) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .maybeSingle()
    if (error) throw error
    return data as Session | null
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
