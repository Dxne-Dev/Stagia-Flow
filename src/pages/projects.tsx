import * as React from 'react'
import { Sparkles, CheckCircle2, RefreshCw, Eye, ChevronDown, ChevronUp, FileText, GitBranch, Table2, Presentation, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import type { Project, Session, DeliverableType, ProjectStatus } from '@/lib/supabase'

const DELIVERABLE_ICONS: Record<DeliverableType, React.ElementType> = {
  pdf: FileText, git: GitBranch, spreadsheet: Table2, presentation: Presentation, other: FileText,
}

const STATUS_MAP: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Brouillon', variant: 'outline' },
  active: { label: 'Actif', variant: 'default' },
  archived: { label: 'Archivé', variant: 'secondary' },
}

interface ProjectWithSession extends Project {
  sessions?: { name: string; academic_level: string }
}

export default function ProjectsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [projects, setProjects] = React.useState<ProjectWithSession[]>([])
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [loading, setLoading] = React.useState(true)
  const [generating, setGenerating] = React.useState(false)
  const [genDialogOpen, setGenDialogOpen] = React.useState(false)
  const [selectedSession, setSelectedSession] = React.useState<string>('')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [genError, setGenError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(true)
  const PAGE_SIZE = 20

  const load = React.useCallback(async (pageNum: number) => {
    if (authLoading) return
    if (!profile?.organization_id) { setLoading(false); return }
    const sessRes = await supabase.from('sessions').select('*').eq('organization_id', profile.organization_id)
    const sessionIds = sessRes.data?.map(s => s.id) ?? []
    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const projRes = await supabase
      .from('projects')
      .select('*, sessions(name, academic_level)', { count: 'exact', head: false })
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (pageNum === 0) {
      setProjects((projRes.data ?? []) as ProjectWithSession[])
    } else {
      setProjects(prev => [...prev, ...(projRes.data ?? []) as ProjectWithSession[]])
    }
    setSessions(sessRes.data ?? [])
    setHasMore(projRes.count != null && (pageNum + 1) * PAGE_SIZE < projRes.count)
    setLoading(false)
  }, [profile, authLoading])

  React.useEffect(() => { load(0) }, [load])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    load(nextPage)
  }

  const handleGenerate = async () => {
    if (!selectedSession || !profile?.organization_id) return
    setGenError(null)
    setGenerating(true)

    try {
      const { data: org } = await supabase.from('organizations').select('*').eq('id', profile.organization_id).maybeSingle()
      const { data: sess } = await supabase.from('sessions').select('*').eq('id', selectedSession).maybeSingle()

      if (!org || !sess) throw new Error('Organisation ou session introuvable')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

      const resp = await fetch(`${supabaseUrl}/functions/v1/generate-brief`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: selectedSession, org_context: org.ai_context_json, academic_level: sess.academic_level }),
      })

      if (!resp.ok) throw new Error('Erreur lors de la génération')
      const brief = await resp.json() as { title: string; context_objective: string; instructions: string; deliverable_type: DeliverableType; deadline: string }

      await supabase.from('projects').insert({
        session_id: selectedSession,
        title: brief.title,
        context_objective: brief.context_objective,
        instructions: brief.instructions,
        deliverable_type: brief.deliverable_type ?? 'pdf',
        deadline: brief.deadline ?? null,
        status: 'draft',
      })

      setGenDialogOpen(false)
      setSelectedSession('')
      await load()
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setGenerating(false)
    }
  }

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    await supabase.from('projects').update({ status }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projets & Briefs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Briefs générés par l'IA pour vos sessions</p>
        </div>
        <Button onClick={() => setGenDialogOpen(true)}>
          <Sparkles className="size-4" />
          Générer un brief IA
        </Button>
      </div>

      <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Générer un brief projet
            </DialogTitle>
            <DialogDescription>
              L'IA va créer un brief adapté au niveau académique de la session sélectionnée.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {genError && (
              <div className="mb-3 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{genError}</div>
            )}
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger><SelectValue placeholder="Sélectionner une session" /></SelectTrigger>
              <SelectContent>
                {sessions.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — <span className="capitalize">{s.academic_level}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleGenerate} disabled={generating || !selectedSession}>
              {generating ? <><Spinner className="size-4 mr-1" /> Génération…</> : <><Sparkles className="size-4" /> Générer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Aucun projet généré</p>
              <p className="text-sm text-muted-foreground mt-1">Générez votre premier brief IA pour une session</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map(project => {
            const DelIcon = DELIVERABLE_ICONS[project.deliverable_type] ?? FileText
            const status = STATUS_MAP[project.status]
            const expanded = expandedId === project.id
            return (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <DelIcon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{project.title}</CardTitle>
                        {project.sessions && (
                          <CardDescription className="text-xs">
                            {project.sessions.name} · <span className="capitalize">{project.sessions.academic_level}</span>
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {project.deadline && (
                        <span className="text-xs text-muted-foreground">{new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'active')}>
                            <CheckCircle2 className="size-4" /> Activer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'draft')}>
                            <RefreshCw className="size-4" /> Remettre en brouillon
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'archived')}>
                            Archiver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.context_objective}</p>
                  <button
                    onClick={() => setExpandedId(expanded ? null : project.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Eye className="size-3" />
                    {expanded ? 'Réduire' : 'Voir le brief complet'}
                    {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                  {expanded && (
                    <div className="mt-3">
                      <Separator className="mb-3" />
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contexte & Objectif</p>
                          <p className="text-sm">{project.context_objective}</p>
                        </div>
                        {project.instructions && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Consignes & Étapes</p>
                            <div className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">{project.instructions}</div>
                          </div>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Livrable : <strong className="capitalize text-foreground">{project.deliverable_type}</strong></span>
                          {project.deadline && <span>Deadline : <strong className="text-foreground">{new Date(project.deadline).toLocaleDateString('fr-FR')}</strong></span>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {hasMore && projects.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore}>Voir plus</Button>
        </div>
      )}
    </div>
  )
}
