import * as React from 'react'
import { Plus, Copy, Check, Users, BookOpen, GraduationCap, FlaskConical, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSessions, useCreateSession, useDeleteSession, useOrganization } from '@/hooks'
import { canCreateSession, PLAN_LABELS, PLAN_LIMITS, isLimitError } from '@/lib/plan-utils'
import UpgradeBanner from '@/components/upgrade-banner'
import type { AcademicLevel } from '@/types'

const LEVEL_CONFIG: Record<AcademicLevel, { label: string; icon: React.ElementType; description: string; color: string; years: number[] }> = {
  licence: { label: 'Licence / Bachelor', icon: BookOpen, description: 'Tâches guidées, recherche, rédaction, tests', color: 'text-blue-500', years: [1, 2, 3] },
  master: { label: 'Master', icon: GraduationCap, description: 'Conception, analyse stratégique, développement', color: 'text-violet-500', years: [1, 2] },
  doctorat: { label: 'Doctorat / R&D', icon: FlaskConical, description: 'Études prospectives, recherche appliquée', color: 'text-emerald-500', years: [1, 2, 3] },
}

export default function SessionsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [page, setPage] = React.useState(0)
  const { data, isLoading } = useSessions(profile?.organization_id, page)
  const { data: org } = useOrganization(profile?.organization_id)
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()

  const sessions = data?.data ?? []
  const count = data?.count ?? 0
  const hasMore = count != null && (page + 1) * 20 < count

  const plan = org?.plan ?? 'essentiel'
  const sessionLimit = canCreateSession(plan, count)
  const isAtLimit = !sessionLimit.allowed

  const [open, setOpen] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', academic_level: 'master' as AcademicLevel, academic_year: '' as string, department: '' })
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)

  const handleLoadMore = () => setPage(p => p + 1)

  const handleCreate = async () => {
    if (!profile?.organization_id || !form.name) return
    setCreateError(null)
    setCreating(true)
    try {
      await createSession.mutateAsync({
        organization_id: profile.organization_id,
        name: form.name,
        academic_level: form.academic_level,
        academic_year: form.academic_year ? parseInt(form.academic_year) : null,
        department: form.department || null,
      })
      setForm({ name: '', academic_level: 'master', academic_year: '', department: '' })
      setOpen(false)
    } catch (e) {
      const msg = isLimitError(e)
      setCreateError(msg ?? 'Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/join/${token}`
    navigator.clipboard.writeText(link)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (deleteTarget !== id) return
    await deleteSession.mutateAsync(id)
    setDeleteTarget(null)
  }

  const confirmDelete = (id: string) => setDeleteTarget(id)

  if (isLoading || authLoading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sessions de stage</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Gérez vos cohortes par niveau académique</p>
        </div>
        <div className="flex items-center gap-3">
          {isAtLimit && (
            <span className="text-xs text-muted-foreground">
              Limite atteinte ({count}/{PLAN_LIMITS[plan].max_sessions})
            </span>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={isAtLimit} title={isAtLimit ? `Limite de ${PLAN_LIMITS[plan].max_sessions} sessions atteinte` : ''}>
                <Plus className="size-4" /> Nouvelle session
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une session</DialogTitle>
              <DialogDescription>Définissez une cohorte de stagiaires par niveau académique.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              {createError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{createError}</div>
              )}
              <Field>
                <FieldLabel htmlFor="sname">Nom de la session *</FieldLabel>
                <Input id="sname" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Été 2025 – Ingénierie" />
              </Field>
              <Field>
                <FieldLabel>Niveau académique *</FieldLabel>
                <Select value={form.academic_level} onValueChange={v => setForm(f => ({ ...f, academic_level: v as AcademicLevel, academic_year: '' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVEL_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Année dans le cycle</FieldLabel>
                <Select value={form.academic_year} onValueChange={v => setForm(f => ({ ...f, academic_year: v }))}>
                  <SelectTrigger><SelectValue placeholder="Non spécifiée" /></SelectTrigger>
                  <SelectContent>
                    {LEVEL_CONFIG[form.academic_level].years.map(y => (
                      <SelectItem key={y} value={String(y)}>{y}e année</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="dept">Département (optionnel)</FieldLabel>
                <Input id="dept" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="R&D, Marketing, Tech…" />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={handleCreate} disabled={creating || !form.name}>
                {creating ? 'Création…' : 'Créer la session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      {isAtLimit && (
        <UpgradeBanner message={`Vous avez atteint la limite de ${PLAN_LIMITS[plan].max_sessions} sessions sur le plan ${PLAN_LABELS[plan]}. Passez à Pro pour des sessions illimitées.`} />
      )}

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Aucune session créée</p>
              <p className="text-sm text-muted-foreground mt-1">Créez votre première session pour inviter des stagiaires</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => {
            const cfg = LEVEL_CONFIG[session.academic_level]
            const Icon = cfg.icon
            return (
              <Card key={session.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Icon className={`size-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{session.name}</CardTitle>
                        <CardDescription className="text-xs">{cfg.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{cfg.label}</Badge>
                      {session.academic_year && <Badge variant="outline">{session.academic_year}e année</Badge>}
                      {session.department && <Badge variant="outline">{session.department}</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground">Lien d'invitation :</span>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-64">
                      {`/join/${session.invite_token}`}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleCopyLink(session.invite_token)}>
                      {copied === session.invite_token ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied === session.invite_token ? 'Copié' : 'Copier le lien'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(session.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {hasMore && sessions.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore}>Voir plus</Button>
        </div>
      )}

      <Dialog open={deleteTarget !== null} onOpenChange={o => { if (!o) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette session ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Les projets et stagiaires liés à cette session seront également supprimés.
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
