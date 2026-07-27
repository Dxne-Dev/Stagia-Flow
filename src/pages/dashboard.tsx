import * as React from 'react'
import { Link } from 'react-router-dom'
import { Users, FolderKanban, CheckCircle2, Clock, Plus, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Project, Deliverable } from '@/lib/supabase'

interface Stats {
  sessions: number
  projects: number
  deliverables_pending: number
  deliverables_validated: number
}

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [recentProjects, setRecentProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (authLoading) return
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
  }, [profile, authLoading])

  if (loading) {
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

  if (!profile?.organization_id) {
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

  const statCards = [
    { title: 'Sessions actives', value: stats?.sessions ?? 0, icon: Users, color: 'text-blue-500', desc: 'cohortes créées' },
    { title: 'Projets générés', value: stats?.projects ?? 0, icon: FolderKanban, color: 'text-violet-500', desc: 'briefs créés' },
    { title: 'En attente de validation', value: stats?.deliverables_pending ?? 0, icon: Clock, color: 'text-amber-500', desc: 'livrables soumis' },
    { title: 'Livrables validés', value: stats?.deliverables_validated ?? 0, icon: CheckCircle2, color: 'text-emerald-500', desc: 'complétés' },
  ]

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
        {statCards.map((card) => (
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
                <Link to="/projects">
                  Voir tout <ArrowRight className="size-3" />
                </Link>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    draft: { label: 'Brouillon', variant: 'outline' },
    active: { label: 'Actif', variant: 'default' },
    archived: { label: 'Archivé', variant: 'secondary' },
  }
  const s = map[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}
