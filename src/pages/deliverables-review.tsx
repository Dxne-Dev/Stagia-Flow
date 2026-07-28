import * as React from 'react'
import { CheckCircle2, Clock, XCircle, ExternalLink, MessageSquare, FileText } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useDeliverablesReview, useUpdateDeliverableStatus } from '@/hooks'
import type { DeliverableStatus } from '@/types'

type Tab = 'all' | 'pending' | 'validated' | 'rejected'

const STATUS_CONFIG = {
  submitted: { label: 'Soumis', icon: Clock, variant: 'secondary' as const },
  under_review: { label: 'En revue', icon: Clock, variant: 'secondary' as const },
  validated: { label: 'Validé', icon: CheckCircle2, variant: 'default' as const },
  rejected: { label: 'Refusé', icon: XCircle, variant: 'destructive' as const },
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'En attente' },
  { key: 'validated', label: 'Validés' },
  { key: 'rejected', label: 'Refusés' },
]

interface DeliverableWithJoins {
  id: string
  project_id: string
  user_id: string
  file_url: string | null
  notes: string | null
  status: DeliverableStatus
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  projects: { title: string; session_id: string; sessions: { name: string } } | null
  user_profiles: { full_name: string | null; email: string | null } | null
}

export default function DeliverablesReviewPage() {
  const { profile, loading: authLoading } = useAuth()
  const [page, setPage] = React.useState(0)
  const { data, isLoading } = useDeliverablesReview(profile?.organization_id, page)
  const updateStatus = useUpdateDeliverableStatus()

  const deliverables = (data?.data ?? []) as DeliverableWithJoins[]
  const count = data?.count
  const hasMore = count != null && (page + 1) * 20 < count

  const [activeTab, setActiveTab] = React.useState<Tab>('pending')
  const [rejectDialog, setRejectDialog] = React.useState<DeliverableWithJoins | null>(null)
  const [rejectReason, setRejectReason] = React.useState('')

  const handleLoadMore = () => setPage(p => p + 1)

  const handleAction = async (d: DeliverableWithJoins, status: DeliverableStatus) => {
    await updateStatus.mutateAsync({
      id: d.id,
      status,
      reviewedBy: profile!.id,
    })
  }

  const handleReject = () => {
    if (!rejectDialog) return
    handleAction(rejectDialog, 'rejected')
    setRejectDialog(null)
    setRejectReason('')
  }

  const filtered = activeTab === 'all'
    ? deliverables
    : activeTab === 'pending'
      ? deliverables.filter(d => d.status === 'submitted' || d.status === 'under_review')
      : deliverables.filter(d => d.status === activeTab)

  if (isLoading || authLoading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-12 w-96" />
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Révision des livrables</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {count ?? deliverables.length} livrable{deliverables.length > 1 ? 's' : ''} soumis
        </p>
      </div>

      <div className="flex gap-1 rounded-lg border p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Aucun livrable</p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === 'pending' ? 'Aucun livrable en attente de révision' : `Aucun livrable ${activeTab === 'validated' ? 'validé' : 'refusé'}`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(d => {
            const cfg = STATUS_CONFIG[d.status]
            const Icon = cfg.icon
            const initials = (d.user_profiles?.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
            return (
              <Card key={d.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.user_profiles?.full_name ?? 'Nom inconnu'}</p>
                        <p className="text-xs text-muted-foreground truncate">{d.user_profiles?.email ?? '—'}</p>
                      </div>
                    </div>
                    <Badge variant={cfg.variant} className="gap-1 shrink-0">
                      <Icon className="size-3" />
                      {cfg.label}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Projet</span>
                      <p className="font-medium truncate">{d.projects?.title ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Session</span>
                      <p className="truncate">{d.projects?.sessions?.name ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Soumis le</span>
                      <p>{new Date(d.submitted_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    {d.file_url && (
                      <div>
                        <span className="text-xs text-muted-foreground">Fichier</span>
                        <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline truncate">
                          <ExternalLink className="size-3 shrink-0" />
                          <span className="truncate">Voir le livrable</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {d.notes && (
                    <div className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground bg-muted/50 rounded-md p-2.5">
                      <MessageSquare className="size-3.5 mt-0.5 shrink-0" />
                      <p className="text-xs">{d.notes}</p>
                    </div>
                  )}

                  {(d.status === 'submitted' || d.status === 'under_review') && (
                    <div className="mt-3 flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAction(d, 'under_review')}>
                        <Clock className="size-3.5" />
                        Mettre en revue
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleAction(d, 'validated')}>
                        <CheckCircle2 className="size-3.5" />
                        Valider
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setRejectDialog(d); setRejectReason('') }}>
                        <XCircle className="size-3.5" />
                        Refuser
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {hasMore && filtered.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore}>Voir plus</Button>
        </div>
      )}

      <Dialog open={!!rejectDialog} onOpenChange={open => { if (!open) setRejectDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser le livrable</DialogTitle>
            <DialogDescription>
              Indiquez le motif du refus à {rejectDialog?.user_profiles?.full_name ?? 'l\'étudiant'}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Expliquez pourquoi ce livrable est refusé et ce qui est attendu..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Refuser le livrable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
