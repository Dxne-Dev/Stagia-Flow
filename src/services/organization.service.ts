import { supabase } from '@/lib/supabase'
import type { Organization } from '@/types'

export interface OrgDailyUsage {
  id: string
  organization_id: string
  date: string
  ai_calls: number
}

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

  async getDailyUsage(orgId: string) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('org_usage_daily')
      .select('ai_calls')
      .eq('organization_id', orgId)
      .eq('date', today)
      .maybeSingle()
    if (error) throw error
    return (data as { ai_calls: number } | null)?.ai_calls ?? 0
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
