import { supabase } from '@/lib/supabase'
import type { UserProfile, UserRole } from '@/types'

export const profileService = {
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data as UserProfile | null
  },

  async create(userId: string, role: UserRole = 'admin') {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ id: userId, role })
      .select()
      .maybeSingle()
    if (error) throw error
    return data as UserProfile | null
  },

  async update(userId: string, updates: Partial<Pick<UserProfile, 'organization_id' | 'session_id' | 'full_name' | 'email' | 'role'>>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle()
    if (error) throw error
    return data as UserProfile | null
  },

  async getStagiairesByOrgId(organizationId: string, page = 0, pageSize = 50) {
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, count, error } = await supabase
      .from('user_profiles')
      .select('*, sessions!left(name, academic_level, academic_year)', { count: 'exact', head: false })
      .eq('organization_id', organizationId)
      .eq('role', 'stagiaire')
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return { data: data as (UserProfile & { sessions: { name: string; academic_level: string; academic_year: number | null } | null })[], count }
  },

  async assignSession(userId: string, sessionId: string | null) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ session_id: sessionId })
      .eq('id', userId)
    if (error) throw error
  },
}
