import * as React from 'react'
import { Users, BookOpen, GraduationCap, FlaskConical, Mail, UserX, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UserProfile, Session, AcademicLevel } from '@/lib/supabase'

interface StagiaireWithSession extends UserProfile {
  sessions: Pick<Session, 'name' | 'academic_level'> | null
}

export default function StagiairesPage() {
  const { profile, loading: authLoading } = useAuth()
  const [stagiaires, setStagiaires] = React.useState<StagiaireWithSession[]>([])
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sessionFilter, setSessionFilter] = React.useState<string>('all')
  const [assigning, setAssigning] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(true)
  const PAGE_SIZE = 50

  const load = React.useCallback(async (pageNum: number) => {
    if (authLoading) return
    if (!profile?.organization_id) { setLoading(false); return }
    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const [stagiairesRes, sessionsRes] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*, sessions!left(name, academic_level)', { count: 'exact', head: false })
        .eq('organization_id', profile.organization_id)
        .eq('role', 'stagiaire')
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase
        .from('sessions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name'),
    ])

    if (pageNum === 0) {
      setStagiaires((stagiairesRes.data ?? []) as StagiaireWithSession[])
    } else {
      setStagiaires(prev => [...prev, ...(stagiairesRes.data ?? []) as StagiaireWithSession[]])
    }
    setSessions(sessionsRes.data ?? [])
    setHasMore(stagiairesRes.count != null && (pageNum + 1) * PAGE_SIZE < stagiairesRes.count)
    setLoading(false)
  }, [profile, authLoading])

  React.useEffect(() => { load(0) }, [load])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    load(nextPage)
  }

  const handleAssign = async (stagiaireId: string, sessionId: string) => {
    setAssigning(stagiaireId)
    await supabase.from('user_profiles').update({ session_id: sessionId || null }).eq('id', stagiaireId)
    setAssigning(null)
    await load()
  }

  const filtered = sessionFilter === 'all'
    ? stagiaires
    : stagiaires.filter(s => s.session_id === sessionFilter)

  const LEVEL_LABEL: Record<AcademicLevel, string> = {
    licence: 'Licence',
    master: 'Master',
    doctorat: 'Doctorat',
  }

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stagiaires</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{stagiaires.length} stagiaire{stagiaires.length > 1 ? 's' : ''} dans l'organisation</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sessionFilter} onValueChange={setSessionFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filtrer par session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sessions</SelectItem>
              <SelectItem value="unassigned">Non assignés</SelectItem>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Aucun stagiaire</p>
              <p className="text-sm text-muted-foreground mt-1">
                {sessionFilter !== 'all'
                  ? 'Aucun stagiaire dans cette session'
                  : 'Les stagiaires apparaîtront ici après avoir rejoint via un lien d\'invitation'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map(stagiaire => (
                <div key={stagiaire.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium">
                      {(stagiaire.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{stagiaire.full_name ?? 'Nom inconnu'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="size-3" />
                      <span className="truncate">{stagiaire.email ?? '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {stagiaire.sessions ? (
                      <Badge variant="secondary" className="gap-1.5">
                        {stagiaire.sessions.academic_level === 'licence' ? <BookOpen className="size-3" /> :
                         stagiaire.sessions.academic_level === 'doctorat' ? <FlaskConical className="size-3" /> :
                         <GraduationCap className="size-3" />}
                        {stagiaire.sessions.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Non assigné</Badge>
                    )}
                    <Select
                      value={stagiaire.session_id ?? 'unassign'}
                      onValueChange={v => handleAssign(stagiaire.id, v === 'unassign' ? '' : v)}
                      disabled={assigning === stagiaire.id}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Assigner…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassign">
                          <div className="flex items-center gap-2">
                            <UserX className="size-3" />
                            Retirer de la session
                          </div>
                        </SelectItem>
                        {sessions.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasMore && filtered.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore}>Voir plus</Button>
        </div>
      )}
    </div>
  )
}