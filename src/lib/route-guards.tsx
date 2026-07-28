import * as React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'

function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RequireRole({
  children,
  roles,
  requireOrg,
}: {
  children: React.ReactNode
  roles: string[]
  requireOrg?: boolean
}) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!profile || !profile.role) return <Navigate to="/onboarding" replace />
  if (!roles.includes(profile.role)) {
    if (profile.role === 'stagiaire') return <Navigate to="/my-brief" replace />
    return <Navigate to="/dashboard" replace />
  }
  if (requireOrg && !profile.organization_id) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}
