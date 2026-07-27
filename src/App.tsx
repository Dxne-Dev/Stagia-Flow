import * as React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import AppLayout from '@/components/app-layout'
import LoginPage from '@/pages/auth/login'
import SignupPage from '@/pages/auth/signup'
import ConfirmEmailPage from '@/pages/auth/confirm-email'
import OnboardingPage from '@/pages/onboarding'
import DashboardPage from '@/pages/dashboard'
import OrganizationPage from '@/pages/organization'
import SessionsPage from '@/pages/sessions'
import ProjectsPage from '@/pages/projects'
import MyBriefPage from '@/pages/my-brief'
import MyDeliverablesPage from '@/pages/my-deliverables'
import SettingsPage from '@/pages/settings'
import StagiairesPage from '@/pages/stagiaires'
import DeliverablesReviewPage from '@/pages/deliverables-review'
import ProjectDetailPage from '@/pages/project-detail'
import JoinPage from '@/pages/join'
import { Spinner } from '@/components/ui/spinner'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireRole({ children, roles, requireOrg }: { children: React.ReactNode; roles: string[]; requireOrg?: boolean }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!profile || !profile.role) return <Navigate to="/onboarding" replace />
  if (!roles.includes(profile.role)) {
    if (profile.role === 'stagiaire') return <Navigate to="/my-brief" replace />
    return <Navigate to="/dashboard" replace />
  }
  if (requireOrg && !profile.organization_id) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function SmartRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.organization_id && profile?.role !== 'stagiaire') return <Navigate to="/onboarding" replace />
  if (profile?.role === 'stagiaire') return <Navigate to="/my-brief" replace />
  return <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SmartRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route path="/join/:token" element={<RequireAuth><JoinPage /></RequireAuth>} />
      <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/organization"
        element={
          <RequireRole roles={['admin', 'manager']} requireOrg>
            <AppLayout>
              <OrganizationPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/sessions"
        element={
          <RequireRole roles={['admin', 'manager']} requireOrg>
            <AppLayout>
              <SessionsPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/projects"
        element={
          <RequireRole roles={['admin', 'manager']} requireOrg>
            <AppLayout>
              <ProjectsPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <RequireRole roles={['admin', 'manager']} requireOrg>
            <AppLayout>
              <ProjectDetailPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/stagiaires"
        element={
          <RequireRole roles={['admin', 'manager']} requireOrg>
            <AppLayout>
              <StagiairesPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/deliverables"
        element={
          <RequireRole roles={['admin', 'manager']} requireOrg>
            <AppLayout>
              <DeliverablesReviewPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/my-brief"
        element={
          <RequireRole roles={['stagiaire']}>
            <AppLayout>
              <MyBriefPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/my-deliverables"
        element={
          <RequireRole roles={['stagiaire']}>
            <AppLayout>
              <MyDeliverablesPage />
            </AppLayout>
          </RequireRole>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
