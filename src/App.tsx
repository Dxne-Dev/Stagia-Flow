import { BrowserRouter, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import { createRoute, NotFoundRoute } from '@/lib/routes'
import { Spinner } from '@/components/ui/spinner'

const LandingPage = lazy(() => import('@/pages/landing'))
const LoginPage = lazy(() => import('@/pages/auth/login'))
const SignupPage = lazy(() => import('@/pages/auth/signup'))
const ConfirmEmailPage = lazy(() => import('@/pages/auth/confirm-email'))
const OnboardingPage = lazy(() => import('@/pages/onboarding'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const OrganizationPage = lazy(() => import('@/pages/organization'))
const SessionsPage = lazy(() => import('@/pages/sessions'))
const ProjectsPage = lazy(() => import('@/pages/projects'))
const MyBriefPage = lazy(() => import('@/pages/my-brief'))
const MyDeliverablesPage = lazy(() => import('@/pages/my-deliverables'))
const SettingsPage = lazy(() => import('@/pages/settings'))
const StagiairesPage = lazy(() => import('@/pages/stagiaires'))
const DeliverablesReviewPage = lazy(() => import('@/pages/deliverables-review'))
const ProjectDetailPage = lazy(() => import('@/pages/project-detail'))
const JoinPage = lazy(() => import('@/pages/join'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><Spinner /></div>}>
      <Routes>
        {createRoute('/', LandingPage, { auth: false, layout: false })}
        {createRoute('/login', LoginPage, { auth: false, layout: false })}
        {createRoute('/signup', SignupPage, { auth: false, layout: false })}
        {createRoute('/confirm-email', ConfirmEmailPage, { auth: false, layout: false })}
        {createRoute('/join/:token', JoinPage, { auth: false, layout: false })}
        {createRoute('/onboarding', OnboardingPage, { auth: 'required', layout: false })}
        {createRoute('/dashboard', DashboardPage, { auth: 'required' })}
        {createRoute('/organization', OrganizationPage, { auth: 'admin', requireOrg: true })}
        {createRoute('/sessions', SessionsPage, { auth: 'admin', requireOrg: true })}
        {createRoute('/projects', ProjectsPage, { auth: 'admin', requireOrg: true })}
        {createRoute('/projects/:id', ProjectDetailPage, { auth: 'admin', requireOrg: true })}
        {createRoute('/stagiaires', StagiairesPage, { auth: 'admin', requireOrg: true })}
        {createRoute('/deliverables', DeliverablesReviewPage, { auth: 'admin', requireOrg: true })}
        {createRoute('/my-brief', MyBriefPage, { auth: 'stagiaire' })}
        {createRoute('/my-deliverables', MyDeliverablesPage, { auth: 'stagiaire' })}
        {createRoute('/settings', SettingsPage, { auth: 'required' })}
        {NotFoundRoute}
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
