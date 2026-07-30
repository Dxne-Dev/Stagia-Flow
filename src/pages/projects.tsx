import * as React from 'react'
import { Sparkles, CheckCircle2, RefreshCw, Eye, ChevronDown, ChevronUp, FileText, GitBranch, Table2, Presentation, MoreHorizontal, Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { useSessionsList, useProjects, useUpdateProjectStatus, useDeleteProject, useCreateProject } from '@/hooks'
import { organizationService } from '@/services'
import { projectService } from '@/services'
import { invokeEdgeFunction } from '@/lib/edge-functions'
import { isLimitError, isCreditLimitError } from '@/lib/plan-utils'
import type { DeliverableType, ProjectStatus } from '@/types'
import type { GenerateBriefRequest, GenerateBriefResponse } from '@/types/edge-functions'

const DELIVERABLE_ICONS: Record<DeliverableType, React.ElementType> = {
  pdf: FileText, git: GitBranch, spreadsheet: Table2, presentation: Presentation, other: FileText,
}

const STATUS_MAP: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Brouillon', variant: 'outline' },
  active: { label: 'Actif', variant: 'default' },
  archived: { label: 'Archivé', variant: 'secondary' },
}

interface ProjectWithSession {
  id: string
  session_id: string
  title: string
  context_objective: string | null
  instructions: string | null
  deliverable_type: DeliverableType
  deadline: string | null
  status: ProjectStatus
  created_by: string
  created_at: string
  sessions?: { name: string; academic_level: string; academic_year: number | null }
}

export default function ProjectsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { data: sessions } = useSessionsList(profile?.organization_id)
  const sessionIds = (sessions ?? []).map(s => s.id)
  const [page, setPage] = React.useState(0)
  const { data, isLoading, refetch } = useProjects(sessionIds, page)
  const updateStatus = useUpdateProjectStatus()
  const deleteProject = useDeleteProject()

  const projects = (data?.data ?? []) as ProjectWithSession[]
  const count = data?.count
  const hasMore = count != null && (page + 1) * 20 < count

  const [generating, setGenerating] = React.useState(false)
  const [genDialogOpen, setGenDialogOpen] = React.useState(false)
  const [selectedSession, setSelectedSession] = React.useState<string>('')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [genError, setGenError] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)

  const [manualTitle, setManualTitle] = React.useState('')
  const [manualContext, setManualContext] = React.useState('')
  const [manualInstructions, setManualInstructions] = React.useState('')
  const [manualDeliverableType, setManualDeliverableType] = React.useState<DeliverableType>('pdf')
  const [manualDeadline, setManualDeadline] = React.useState('')
  const [manualSession, setManualSession] = React.useState('')
  const [manualTab, setManualTab] = React.useState('ai')
  const createProject = useCreateProject()

  const handleLoadMore = () => setPage(p => p + 1)

  const handleGenerate = async () => {
    if (!selectedSession || !profile?.organization_id) return
    setGenError(null)
    setGenerating(true)

    try {
      const org = await organizationService.getById(profile.organization_id)
      const sess = sessions?.find(s => s.id === selectedSession)
      if (!org || !sess) throw new Error('Organisation ou session introuvable')

      const brief = await invokeEdgeFunction<GenerateBriefRequest, GenerateBriefResponse>('generate-brief', {
        session_id: selectedSession,
        org_context: org.ai_context_json,
        academic_level: sess.academic_level,
        academic_year: sess.academic_year,
        organization_id: org.id,
      })

      await projectService.create({
        session_id: selectedSession,
        title: brief.title,
        context_objective: brief.context_objective,
        instructions: brief.instructions,
        deliverable_type: (brief.deliverable_type as DeliverableType) ?? 'pdf',
        deadline: brief.deadline ?? null,
        status: 'draft',
        created_by: user!.id,
      })

      setGenDialogOpen(false)
      setSelectedSession('')
      refetch()
    } catch (e: unknown) {
      const msg = isLimitError(e) ?? isCreditLimitError(e)
      setGenError(msg ?? (e instanceof Error ? e.message : 'Erreur inconnue'))
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmitManual = async () => {
    if (!manualSession || !manualTitle.trim() || !user) return
    try {
      await createProject.mutateAsync({
        session_id: manualSession,
        title: manualTitle.trim(),
        context_objective: manualContext.trim() || null,
        instructions: manualInstructions.trim() || null,
        deliverable_type: manualDeliverableType,
        deadline: manualDeadline || null,
        status: 'draft',
        created_by: user.id,
      })
      setGenDialogOpen(false)
      setManualTitle('')
      setManualContext('')
      setManualInstructions('')
      setManualDeliverableType('pdf')
      setManualDeadline('')
      setManualSession('')
      refetch()
    } catch {
      // handled by react-query
    }
  }

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    await updateStatus.mutateAsync({ id, status })
  }

  const handleDelete = async (id: string) => {
    if (deleteTarget !== id) return
    await deleteProject.mutateAsync(id)
    setDeleteTarget(null)
  }

  const confirmDelete = (id: string) => setDeleteTarget(id)

  if (isLoading || authLoading) return (
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
          <p className="text-muted-foreground text-sm mt-0.5">Briefs projets pour vos sessions</p>
        </div>
        <Button onClick={() => { setGenDialogOpen(true); setManualTab('ai') }}>
          <Plus className="size-4" />
          Nouveau brief
        </Button>
      </div>

      <Dialog open={genDialogOpen} onOpenChange={(open) => {
        setGenDialogOpen(open)
        if (!open) {
          setManualTitle(''); setManualContext(''); setManualInstructions('')
          setManualDeliverableType('pdf'); setManualDeadline(''); setManualSession('')
          setGenError(null)
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              Nouveau brief projet
            </DialogTitle>
          </DialogHeader>
          <Tabs value={manualTab} onValueChange={setManualTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai">
                <Sparkles className="size-3.5 mr-1.5" />
                Génération IA
              </TabsTrigger>
              <TabsTrigger value="manual">
                <FileText className="size-3.5 mr-1.5" />
                Saisie manuelle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="py-4">
              <div className="space-y-4">
                {genError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{genError}</div>
                )}
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une session" /></SelectTrigger>
                    <SelectContent>
                      {sessions?.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — <span className="capitalize">{s.academic_level}</span>
                          {s.academic_year && <span> — {s.academic_year}e année</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  L'IA va créer un brief adapté au niveau académique de la session sélectionnée.
                </p>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setGenDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleGenerate} disabled={generating || !selectedSession}>
                  {generating ? <><Spinner className="size-4 mr-1" /> Génération…</> : <><Sparkles className="size-4" /> Générer</>}
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="manual" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Select value={manualSession} onValueChange={setManualSession}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une session" /></SelectTrigger>
                    <SelectContent>
                      {sessions?.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — <span className="capitalize">{s.academic_level}</span>
                          {s.academic_year && <span> — {s.academic_year}e année</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du projet</Label>
                  <Input id="title" value={manualTitle} onChange={e => setManualTitle(e.target.value)} placeholder="Ex: Application de gestion de stock" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="context">Contexte & Objectif</Label>
                  <Textarea id="context" value={manualContext} onChange={e => setManualContext(e.target.value)} placeholder="Décrivez le contexte et l'objectif du projet…" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Consignes & Étapes</Label>
                  <Textarea id="instructions" value={manualInstructions} onChange={e => setManualInstructions(e.target.value)} placeholder="Décrivez les consignes et les étapes à suivre…" rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de livrable</Label>
                    <Select value={manualDeliverableType} onValueChange={v => setManualDeliverableType(v as DeliverableType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="git">Git</SelectItem>
                        <SelectItem value="spreadsheet">Tableur</SelectItem>
                        <SelectItem value="presentation">Présentation</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline (optionnelle)</Label>
                    <Input id="deadline" type="date" value={manualDeadline} onChange={e => setManualDeadline(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setGenDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSubmitManual} disabled={createProject.isPending || !manualTitle.trim() || !manualSession}>
                  {createProject.isPending ? <><Spinner className="size-4 mr-1" /> Création…</> : <><FileText className="size-4" /> Créer le brief</>}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Aucun brief pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">Créez un brief en utilisant l'IA ou la saisie manuelle</p>
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
                            {project.sessions.academic_year && <span> · {project.sessions.academic_year}e année</span>}
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
                          <DropdownMenuItem variant="destructive" onClick={() => confirmDelete(project.id)}>
                            <Trash2 className="size-4" /> Supprimer
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

      <Dialog open={deleteTarget !== null} onOpenChange={o => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce projet ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le brief et toutes les données associées seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
