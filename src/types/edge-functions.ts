export interface AnalyzeCompanyRequest {
  url: string
  org_name: string
  organization_id: string
}

export interface AiContext {
  sector?: string
  main_activities?: string[]
  tech_stack?: string[]
  recent_projects?: string[]
  summary?: string
}

export interface GenerateBriefRequest {
  session_id: string
  org_context: Record<string, unknown> | null
  academic_level: string
  academic_year: number | null
  organization_id: string
}

export interface GenerateBriefResponse {
  title: string
  context_objective: string
  instructions: string
  deliverable_type: string
  deadline: string
  remaining_credits: number
}
