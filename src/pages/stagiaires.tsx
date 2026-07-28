import * as React from 'react'
import { Users, BookOpen, GraduationCap, FlaskConical, Mail, UserX } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStagiaires, useSessionsList, useAssignSession, useOrganization } from '@/hooks'
import { canAddStagiaire, PLAN_LABELS, PLAN_LIMITS, isLimitError } from '@/lib/plan-utils'
import UpgradeBanner from '@/components/upgrade-banner'
import { toast } from 'sonner'

export default function StagiairesPage() {
  const { profile, loading: authLoading } = useAuth()
  const [page, setPage] = React.useState(0)
  const { data, isLoading } = useStagiaires(profile?.organization_id, page)
  const { data: sessionsData } = useSessionsList(profile?.organization_id)
  const { data: org } = useOrganization(profile?.organization_id)
  const assignSession = useAssignSession()

  const stagiaires = data?.data ?? []
  const sessions = sessionsData ?? []
  const count = data?.count ?? 0
  const hasMore = count != null && (page + 1) * 50 < count

  const plan = org?.plan ?? 'essentiel'
  const stagiaireLimit = canAddStagiaire(plan, count)
  const isAtLimit = !stagiaireLimit.allowed

  const [sessionFilter, setSessionFilter] = React.useState<string>('all')
  const [assigning, setAssigning] = React.useState<string | null>(null)

  const handleLoadMore = () => setPage(p => p + 1)

  const handleAssign = async (stagiaireId: string, sessionId: string) => {
    setAssigning(stagiaireId)
    try {
      await assignSession.mutateAsync({ userId: stagiaireId, sessionId: sessionId || null })
    } catch (e) {
      const msg = isLimitError(e)
      if (msg) toast.error(msg)
      else toast.error('Erreur lors de l\'assignation')
    } finally {
      setAssigning(null)
    }
  }

  const filtered = sessionFilter === 'all'
    ? stagiaires
    : sessionFilter === 'unassigned'
      ? stagiaires.filter(s => !s.session_id)
      : stagiaires.filter(s => s.session_id === sessionFilter)

  if (isLoading || authLoading) return (
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
          <p className="text-muted-foreground text-sm mt-0.5">{count ?? stagiaires.length} stagiaire{stagiaires.length > 1 ? 's' : ''} dans l'organisation</p>
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

      {isAtLimit && (
        <UpgradeBanner message={`Vous avez atteint la limite de ${PLAN_LIMITS[plan].max_stagiaires} stagiaires sur le plan ${PLAN_LABELS[plan]}. Passez à Pro pour des stagiaires illimités.`} />
      )}

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
                        {stagiaire.sessions.academic_year && <span className="ml-1 opacity-70">({stagiaire.sessions.academic_year}e a.)</span>}
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
