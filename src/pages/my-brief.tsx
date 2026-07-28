import * as React from 'react'
import { BookOpen, GraduationCap, FlaskConical, Calendar, FileText, GitBranch, Table2, Presentation, Target, ListChecks, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useSession, useSessionProjectsNonArchived } from '@/hooks'
import type { AcademicLevel, DeliverableType, ProjectStatus, Project } from '@/types'

const LEVEL_ICONS: Record<AcademicLevel, React.ElementType> = {
  licence: BookOpen, master: GraduationCap, doctorat: FlaskConical,
}

const DELIVERABLE_LABELS: Record<DeliverableType, string> = {
  pdf: 'Document PDF', git: 'Dépôt Git', spreadsheet: 'Tableau de bord', presentation: 'Présentation', other: 'Autre',
}

const DELIVERABLE_ICONS: Record<DeliverableType, React.ElementType> = {
  pdf: FileText, git: GitBranch, spreadsheet: Table2, presentation: Presentation, other: FileText,
}

const STATUS_MAP: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Brouillon', variant: 'outline' },
  active: { label: 'Actif', variant: 'default' },
  archived: { label: 'Archivé', variant: 'secondary' },
}

export default function MyBriefPage() {
  const { profile } = useAuth()
  const { data: session, isLoading: sessionLoading } = useSession(profile?.session_id)
  const { data: projects, isLoading: projectsLoading } = useSessionProjectsNonArchived(profile?.session_id)

  const loading = sessionLoading || projectsLoading

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64" />
      <Skeleton className="h-40" />
    </div>
  )

  if (!profile?.session_id) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="size-12 text-muted-foreground" />
        <div>
          <p className="font-medium">Vous n'êtes assigné à aucune session</p>
          <p className="text-sm text-muted-foreground mt-1">Contactez votre manager pour recevoir un lien d'invitation.</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="size-12 text-muted-foreground" />
        <div>
          <p className="font-medium">Session introuvable</p>
          <p className="text-sm text-muted-foreground mt-1">Une erreur est survenue lors du chargement de votre session.</p>
        </div>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Accordion type="multiple" defaultValue={[session.id]}>
          <AccordionItem value={session.id}>
            <SessionTrigger session={session} />
            <AccordionContent>
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Aucun brief pour le moment</p>
                  <p className="text-sm text-muted-foreground mt-1">Votre manager va bientôt publier un projet. Revenez dans quelques instants.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes briefs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Consultez et gérez vos projets de stage</p>
      </div>

      <Accordion type="multiple" defaultValue={[session.id]}>
        <AccordionItem value={session.id}>
          <SessionTrigger session={session} />
          <AccordionContent>
            <div className="flex flex-col gap-6 pt-4">
              {projects.map(project => (
                <ProjectBrief key={project.id} project={project} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function SessionTrigger({ session }: { session: { name: string; academic_level: AcademicLevel; academic_year: number | null; department: string | null } }) {
  const Icon = LEVEL_ICONS[session.academic_level]
  return (
    <AccordionTrigger className="hover:no-underline">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-left">
          <span className="font-medium">{session.name}</span>
          <Separator orientation="vertical" className="h-3.5" />
          <span className="text-muted-foreground capitalize">{session.academic_level}</span>
          {session.academic_year && (
            <>
              <Separator orientation="vertical" className="h-3.5" />
              <span className="text-muted-foreground">{session.academic_year}e année</span>
            </>
          )}
          {session.department && (
            <>
              <Separator orientation="vertical" className="h-3.5" />
              <span className="text-muted-foreground">{session.department}</span>
            </>
          )}
        </div>
      </div>
    </AccordionTrigger>
  )
}

function ProjectBrief({ project }: { project: Project }) {
  const status = STATUS_MAP[project.status]
  const DelIcon = DELIVERABLE_ICONS[project.deliverable_type] ?? FileText

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          {project.deadline && (
            <CardDescription className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Deadline : {new Date(project.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DelIcon className="size-4 text-primary" />
            Livrable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-sm">{DELIVERABLE_LABELS[project.deliverable_type]}</p>
          {project.deadline && (
            <p className="text-xs text-muted-foreground mt-1">
              À remettre avant le {new Date(project.deadline).toLocaleDateString('fr-FR')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="size-4 text-primary" />
            Contexte & Objectif stratégique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{project.context_objective}</p>
        </CardContent>
      </Card>

      {project.instructions && (
        <>
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ListChecks className="size-4 text-primary" />
                Consignes & Étapes clés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{project.instructions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Détails</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {project.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>{new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <DelIcon className="size-4 text-muted-foreground" />
                <span className="capitalize">{DELIVERABLE_LABELS[project.deliverable_type]}</span>
              </div>
              <Badge variant={status.variant} className="w-fit">{status.label}</Badge>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
