import { supabase } from '@/lib/supabase'
import type { Organization } from '@/types'

export const organizationService = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data as Organization | null
  },

  async create(org: { name: string; website_url: string | null; ai_context_json: Record<string, unknown>; owner_id: string }) {
    const { data, error } = await supabase
      .from('organizations')
      .insert(org)
      .select()
      .single()
    if (error) throw error
    return data as Organization
  },

  async update(id: string, updates: Partial<Pick<Organization, 'name' | 'website_url' | 'ai_context_json'>>) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data as Organization | null
  },
}
