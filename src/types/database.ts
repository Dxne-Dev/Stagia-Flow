import type { AcademicLevel, UserRole, ProjectStatus, DeliverableStatus, DeliverableType, Plan, SubscriptionStatus } from './enums'

export interface Organization {
  id: string
  name: string
  website_url: string | null
  ai_context_json: Record<string, unknown> | null
  owner_id: string
  plan: Plan
  subscription_status: SubscriptionStatus | null
  created_at: string
}

export interface Session {
  id: string
  organization_id: string
  name: string
  academic_level: AcademicLevel
  academic_year: number | null
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
