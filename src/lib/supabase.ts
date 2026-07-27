import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadDeliverable(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('deliverables').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('deliverables').getPublicUrl(path)
  return publicUrl
}

export type AcademicLevel = 'licence' | 'master' | 'doctorat'
export type UserRole = 'admin' | 'manager' | 'stagiaire'
export type ProjectStatus = 'draft' | 'active' | 'archived'
export type DeliverableStatus = 'submitted' | 'under_review' | 'validated' | 'rejected'
export type DeliverableType = 'pdf' | 'git' | 'spreadsheet' | 'presentation' | 'other'

export interface Organization {
  id: string
  name: string
  website_url: string | null
  ai_context_json: Record<string, unknown> | null
  owner_id: string
  created_at: string
}

export interface Session {
  id: string
  organization_id: string
  name: string
  academic_level: AcademicLevel
  department: string | null
  invite_token: string
  created_at: string
}

export interface UserProfile {
  id: string
  organization_id: string | null
  session_id: string | null
  role: UserRole
  full_name: string | null
  email: string | null
  created_at: string
}

export interface Project {
  id: string
  session_id: string
  title: string
  context_objective: string | null
  instructions: string | null
  deliverable_type: DeliverableType
  deadline: string | null
  status: ProjectStatus
  created_by: string
  created_at: string
}

export interface Deliverable {
  id: string
  project_id: string
  user_id: string
  file_url: string | null
  notes: string | null
  status: DeliverableStatus
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}
