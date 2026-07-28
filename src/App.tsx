import { BrowserRouter, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import { createRoute, NotFoundRoute } from '@/lib/routes'
// AppLayout is used internally by createRoute
import LandingPage from '@/pages/landing'
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
