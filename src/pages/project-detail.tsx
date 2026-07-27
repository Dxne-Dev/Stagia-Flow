import * as React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, GitBranch, Table2, Presentation, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import type { Project, Session } from '@/lib/supabase'

const DELIVERABLE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText, git: GitBranch, spreadsheet: Table2, presentation: Presentation, other: FileText,
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Brouillon', variant: 'outline' },
  active: { label: 'Actif', variant: 'default' },
  archived: { label: 'Archivé', variant: 'secondary' },
}

interface ProjectWithSession extends Project {
  sessions?: { name: string; academic_level: string }
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = React.useState<ProjectWithSession | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      if (!id) { setError('ID du projet manquant'); setLoading(false); return }
      const { data, error: err } = await supabase
        .from('projects')
        .select('*, sessions(name, academic_level)')
        .eq('id', id)
        .maybeSingle()
      if (err) { setError(err.message); setLoading(false); return }
      if (!data) { setError('Projet introuvable'); setLoading(false); return }
      setProject(data as ProjectWithSession)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-destructive font-medium">{error}</p>
      <Button variant="outline" onClick={() => navigate('/projects')}>Retour aux projets</Button>
    </div>
  )

  if (!project) return null

  const DelIcon = DELIVERABLE_ICONS[project.deliverable_type] ?? FileText
  const status = STATUS_MAP[project.status] ?? { label: project.status, variant: 'outline' as const }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects"><ArrowLeft className="size-5" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{project.title}</h1>
          {project.sessions && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {project.sessions.name} · <span className="capitalize">{project.sessions.academic_level}</span>
            </p>
          )}
        </div>
        <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contexte & Objectif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{project.context_objective}</p>
            </CardContent>
          </Card>

          {project.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consignes & Étapes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-4">{project.instructions}</div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <DelIcon className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type de livrable</p>
                  <p className="text-sm font-medium capitalize">{project.deliverable_type}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-medium">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR') : 'Non définie'}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Créé le</p>
                <p className="text-sm font-medium">
                  {new Date(project.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}