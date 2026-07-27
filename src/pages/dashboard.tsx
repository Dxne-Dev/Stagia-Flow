import * as React from 'react'
import { Link } from 'react-router-dom'
import { Users, FolderKanban, CheckCircle2, Clock, Plus, TrendingUp, ArrowRight, Briefcase, Upload, FileText, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Project, Deliverable, UserProfile, Session } from '@/lib/supabase'

interface Stats {
  sessions: number
  projects: number
  deliverables_pending: number
  deliverables_validated: number
}

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const isStagiaire = profile?.role === 'stagiaire'

  if (authLoading) return <LoadingSkeleton />
  if (isStagiaire) return <StagiaireDashboard profile={profile} />
  return <ManagerDashboard profile={profile} />
}

function ManagerDashboard({ profile }: { profile: UserProfile | null }) {
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [recentProjects, setRecentProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!profile?.organization_id) { setLoading(false); return }
      const [sessionsRes, projectsRes, deliverablesRes] = await Promise.all([
        supabase.from('sessions').select('id').eq('organization_id', profile.organization_id),
        supabase.from('projects').select('*, sessions!inner(organization_id)').eq('sessions.organization_id', profile.organization_id).order('created_at', { ascending: false }).limit(5),
        supabase.from('deliverables').select('id, status, projects!inner(session_id, sessions!inner(organization_id))'),
      ])
      const sessions = sessionsRes.data ?? []
      const projects = (projectsRes.data ?? []) as Project[]
      const deliverables = (deliverablesRes.data ?? []) as unknown as Deliverable[]
      setStats({
        sessions: sessions.length,
        projects: projects.length,
        deliverables_pending: deliverables.filter(d => d.status === 'submitted' || d.status === 'under_review').length,
        deliverables_validated: deliverables.filter(d => d.status === 'validated').length,
      })
      setRecentProjects(projects)
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) return <LoadingSkeleton />
  if (!profile?.organization_id) return <NoOrgView />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Vue d'ensemble de vos stages en cours</p>
        </div>
        <Button asChild>
          <Link to="/sessions">
            <Plus className="size-4" />
            Nouvelle session
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Sessions actives', value: stats?.sessions ?? 0, icon: Users, color: 'text-blue-500', desc: 'cohortes créées' },
          { title: 'Projets générés', value: stats?.projects ?? 0, icon: FolderKanban, color: 'text-violet-500', desc: 'briefs créés' },
          { title: 'En attente de validation', value: stats?.deliverables_pending ?? 0, icon: Clock, color: 'text-amber-500', desc: 'livrables soumis' },
          { title: 'Livrables validés', value: stats?.deliverables_validated ?? 0, icon: CheckCircle2, color: 'text-emerald-500', desc: 'complétés' },
        ].map(card => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">{card.title}</CardDescription>
                <card.icon className={`size-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Projets récents</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/projects">Voir tout <ArrowRight className="size-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <FolderKanban className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucun projet créé</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/sessions">Créer une session</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentProjects.map(project => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{project.deliverable_type}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { label: 'Créer une session de stage', to: '/sessions', icon: Users },
              { label: 'Gérer les projets & briefs', to: '/projects', icon: FolderKanban },
              { label: 'Modifier le profil organisation', to: '/organization', icon: TrendingUp },
            ].map(item => (
              <Button key={item.to} variant="outline" className="justify-start gap-3" asChild>
                <Link to={item.to}>
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StagiaireDashboard({ profile }: { profile: UserProfile | null }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [project, setProject] = React.useState<Project | null>(null)
  const [deliverable, setDeliverable] = React.useState<Deliverable | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!profile?.session_id) { setLoading(false); return }
      const [sessionRes, projectRes, deliverableRes] = await Promise.all([
        supabase.from('sessions').select('*').eq('id', profile.session_id).maybeSingle(),
        supabase.from('projects').select('*').eq('session_id', profile.session_id).maybeSingle(),
        supabase.from('deliverables').select('*').eq('user_id', profile.id).maybeSingle(),
      ])
      if (sessionRes.data) setSession(sessionRes.data as Session)
      if (projectRes.data) setProject(projectRes.data as Project)
      if (deliverableRes.data) setDeliverable(deliverableRes.data as Deliverable)
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Suivi de votre stage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <Briefcase className="size-3" />
              Session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-semibold truncate">{session?.name ?? 'Non assigné'}</p>
            {session && (
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {session.academic_level === 'licence' ? 'Licence' : session.academic_level === 'master' ? 'Master' : 'Doctorat'}
                {session.department ? ` · ${session.department}` : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <FileText className="size-3" />
              Projet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-semibold truncate">{project?.title ?? 'Aucun projet'}</p>
            {project && (
              <p className="text-xs text-muted-foreground mt-1 capitalize">{project.deliverable_type}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center gap-1.5">
              <Calendar className="size-3" />
              Échéance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {project?.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR') : '—'}
            </p>
            {project?.deadline && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) > 0
                  ? `J-${Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}`
                  : 'Date dépassée'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mon brief</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-brief">Voir <ArrowRight className="size-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {project ? (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Objectif</p>
                  <p className="text-sm">{project.context_objective ?? '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={project.status} />
                  <span className="text-xs text-muted-foreground capitalize">{project.deliverable_type}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Briefcase className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucun brief assigné pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mes livrables</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-deliverables">Voir <ArrowRight className="size-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {deliverable ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <DeliverableStatusBadge status={deliverable.status} />
                  <span className="text-xs text-muted-foreground">
                    Soumis le {new Date(deliverable.submitted_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {deliverable.notes && (
                  <p className="text-sm text-muted-foreground">{deliverable.notes}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucun livrable soumis</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/my-deliverables">Soumettre un livrable</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" className="justify-start gap-3" asChild>
            <Link to="/my-brief"><Briefcase className="size-4 text-muted-foreground" />Consulter mon brief</Link>
          </Button>
          <Button variant="outline" className="justify-start gap-3" asChild>
            <Link to="/my-deliverables"><Upload className="size-4 text-muted-foreground" />Voir mes livrables</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

function NoOrgView() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center">
        <TrendingUp className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">Configuration requise</h2>
      <p className="text-muted-foreground max-w-sm">
        Configurez votre organisation pour commencer à gérer vos stagiaires.
      </p>
      <Button asChild>
        <Link to="/onboarding">Configurer mon organisation</Link>
      </Button>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    draft: { label: 'Brouillon', variant: 'outline' },
    active: { label: 'Actif', variant: 'default' },
    archived: { label: 'Archivé', variant: 'secondary' },
  }
  const s = map[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

function DeliverableStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    submitted: { label: 'Soumis', variant: 'outline' },
    under_review: { label: 'En revue', variant: 'secondary' },
    validated: { label: 'Validé', variant: 'default' },
    rejected: { label: 'Refusé', variant: 'destructive' },
  }
  const s = map[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}