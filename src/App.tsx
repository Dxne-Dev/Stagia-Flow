import * as React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import AppLayout from '@/components/app-layout'
import LoginPage from '@/pages/auth/login'
import SignupPage from '@/pages/auth/signup'
import OnboardingPage from '@/pages/onboarding'
import DashboardPage from '@/pages/dashboard'
import OrganizationPage from '@/pages/organization'
import SessionsPage from '@/pages/sessions'
import ProjectsPage from '@/pages/projects'
import MyBriefPage from '@/pages/my-brief'
import MyDeliverablesPage from '@/pages/my-deliverables'
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
          <RequireAuth>
            <AppLayout>
              <OrganizationPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/sessions"
        element={
          <RequireAuth>
            <AppLayout>
              <SessionsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/projects"
        element={
          <RequireAuth>
            <AppLayout>
              <ProjectsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/my-brief"
        element={
          <RequireAuth>
            <AppLayout>
              <MyBriefPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/my-deliverables"
        element={
          <RequireAuth>
            <AppLayout>
              <MyDeliverablesPage />
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
