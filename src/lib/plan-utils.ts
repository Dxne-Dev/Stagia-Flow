import type { Plan } from '@/types'

export const PLAN_LIMITS = {
  essentiel: {
    max_sessions: 3,
    max_stagiaires: 10,
    max_projects_per_session: 5,
  },
  pro: {
    max_sessions: Infinity,
    max_stagiaires: Infinity,
    max_projects_per_session: Infinity,
  },
  entreprise: {
    max_sessions: Infinity,
    max_stagiaires: Infinity,
    max_projects_per_session: Infinity,
  },
} as const satisfies Record<Plan, { max_sessions: number; max_stagiaires: number; max_projects_per_session: number }>

export const PLAN_LABELS: Record<Plan, string> = {
  essentiel: 'Essentiel',
  pro: 'Pro',
  entreprise: 'Entreprise',
}

export const PLAN_PRICES: Record<Plan, string> = {
  essentiel: 'Gratuit',
  pro: '30 000 FCFA/mois',
  entreprise: 'Sur mesure',
}

export function canCreateSession(plan: Plan, currentCount: number): { allowed: boolean; remaining: number } {
  const limit = PLAN_LIMITS[plan].max_sessions
  return { allowed: currentCount < limit, remaining: Math.max(0, limit - currentCount) }
}

export function canAddStagiaire(plan: Plan, currentCount: number): { allowed: boolean; remaining: number } {
  const limit = PLAN_LIMITS[plan].max_stagiaires
  return { allowed: currentCount < limit, remaining: Math.max(0, limit - currentCount) }
}

export function canCreateProject(plan: Plan, currentCount: number): { allowed: boolean; remaining: number } {
  const limit = PLAN_LIMITS[plan].max_projects_per_session
  return { allowed: currentCount < limit, remaining: Math.max(0, limit - currentCount) }
}

export const AI_DAILY_LIMITS: Record<Plan, number> = {
  essentiel: 5,
  pro: 100,
  entreprise: Infinity,
}

export const AI_ANALYSIS_LIMIT = 3

export function getRemainingAiCalls(plan: Plan, used: number): { allowed: boolean; remaining: number } {
  const limit = AI_DAILY_LIMITS[plan]
  return { allowed: used < limit, remaining: Math.max(0, limit - used) }
}

export function getAnalysisRemaining(currentCount: number): { allowed: boolean; remaining: number } {
  return { allowed: currentCount < AI_ANALYSIS_LIMIT, remaining: Math.max(0, AI_ANALYSIS_LIMIT - currentCount) }
}

export function isLimitError(error: unknown): string | null {
  if (error instanceof Error && error.message.startsWith('LIMIT_REACHED:')) {
    return error.message.slice('LIMIT_REACHED:'.length)
  }
  return null
}

export function isCreditLimitError(error: unknown): string | null {
  if (error instanceof Error && error.message.startsWith('CREDIT_LIMIT_REACHED:')) {
    return error.message.slice('CREDIT_LIMIT_REACHED:'.length)
  }
  return null
}
