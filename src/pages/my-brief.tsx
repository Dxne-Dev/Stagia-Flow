import * as React from 'react'
import { BookOpen, GraduationCap, FlaskConical, Calendar, FileText, GitBranch, Table2, Presentation, Target, ListChecks, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { Project, Session, AcademicLevel, DeliverableType } from '@/lib/supabase'

const LEVEL_ICONS: Record<AcademicLevel, React.ElementType> = {
  licence: BookOpen, master: GraduationCap, doctorat: FlaskConical,
}

const DELIVERABLE_LABELS: Record<DeliverableType, string> = {
  pdf: 'Document PDF', git: 'Dépôt Git', spreadsheet: 'Tableau de bord', presentation: 'Présentation', other: 'Autre',
}

const DELIVERABLE_ICONS: Record<DeliverableType, React.ElementType> = {
  pdf: FileText, git: GitBranch, spreadsheet: Table2, presentation: Presentation, other: FileText,
}

export default function MyBriefPage() {
  const { profile } = useAuth()
  const [project, setProject] = React.useState<Project | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      if (!profile?.session_id) { setLoading(false); return }

      const { data: sess } = await supabase.from('sessions').select('*').eq('id', profile.session_id).maybeSingle()
      setSession(sess)

      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('session_id', profile.session_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setProject(proj)
      setLoading(false)
    }
    load()
  }, [profile])

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

  if (!project) {
    return (
      <div className="flex flex-col gap-6">
        {session && <SessionHeader session={session} />}
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Votre brief est en préparation</p>
            <p className="text-sm text-muted-foreground mt-1">Votre manager va bientôt valider votre projet. Revenez dans quelques instants.</p>
          </div>
        </div>
      </div>
    )
  }

  const DelIcon = DELIVERABLE_ICONS[project.deliverable_type] ?? FileText

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {session && <SessionHeader session={session} />}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge>Actif</Badge>
          {project.deadline && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              Deadline : {new Date(project.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="size-4 text-primary" />
            Contexte & Objectif stratégique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{project.context_objective}</p>
        </CardContent>
      </Card>

      {project.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="size-4 text-primary" />
              Consignes & Étapes clés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{project.instructions}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Livrable attendu</CardTitle>
          <CardDescription>Ce que vous devez produire et soumettre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <div className="size-10 rounded-md bg-background border flex items-center justify-center">
              <DelIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{DELIVERABLE_LABELS[project.deliverable_type]}</p>
              {project.deadline && (
                <p className="text-xs text-muted-foreground">
                  À remettre avant le {new Date(project.deadline).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SessionHeader({ session }: { session: Session }) {
  const Icon = LEVEL_ICONS[session.academic_level]
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <Icon className="size-4 text-muted-foreground" />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{session.name}</span>
        <Separator orientation="vertical" className="h-3.5" />
        <span className="text-muted-foreground capitalize">{session.academic_level}</span>
        {session.department && (
          <>
            <Separator orientation="vertical" className="h-3.5" />
            <span className="text-muted-foreground">{session.department}</span>
          </>
        )}
      </div>
    </div>
  )
}
