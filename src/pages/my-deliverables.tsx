import * as React from 'react'
import { Plus, Upload, FileText, Link2, CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase, uploadDeliverable } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import type { Deliverable, Project } from '@/lib/supabase'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  submitted: { label: 'Soumis', icon: Clock, variant: 'secondary' },
  under_review: { label: 'En revue', icon: Clock, variant: 'secondary' },
  validated: { label: 'Validé', icon: CheckCircle2, variant: 'default' },
  rejected: { label: 'Rejeté', icon: XCircle, variant: 'destructive' },
}

interface DeliverableWithProject extends Deliverable {
  projects?: { title: string }
}

export default function MyDeliverablesPage() {
  const { user, profile } = useAuth()
  const [deliverables, setDeliverables] = React.useState<DeliverableWithProject[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [form, setForm] = React.useState({ project_id: '', file_url: '', notes: '' })
  const [file, setFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!user || !profile?.session_id) { setLoading(false); return }
    const [delRes, projRes] = await Promise.all([
      supabase.from('deliverables').select('*, projects(title)').eq('user_id', user.id).order('submitted_at', { ascending: false }),
      supabase.from('projects').select('*').eq('session_id', profile.session_id).eq('status', 'active'),
    ])
    setDeliverables((delRes.data ?? []) as DeliverableWithProject[])
    setProjects(projRes.data ?? [])
    setLoading(false)
  }, [user, profile])

  React.useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    if (!user || !form.project_id || (!form.file_url && !form.notes && !file)) return
    setSubmitting(true)
    setUploading(true)
    let fileUrl = form.file_url || null
    if (file) {
      try {
        fileUrl = await uploadDeliverable(file, user.id)
      } catch {
        setUploading(false)
        setSubmitting(false)
        return
      }
    }
    await supabase.from('deliverables').insert({
      project_id: form.project_id,
      user_id: user.id,
      file_url: fileUrl,
      notes: form.notes || null,
    })
    setForm({ project_id: '', file_url: '', notes: '' })
    setFile(null)
    setOpen(false)
    setSubmitting(false)
    setUploading(false)
    await load()
  }

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
  )

  if (!profile?.session_id) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Vous n'êtes assigné à aucune session.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes Livrables</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Soumettez et suivez l'avancement de vos livrables</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Soumettre un livrable
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-4" />
              Soumettre un livrable
            </DialogTitle>
            <DialogDescription>Ajoutez un fichier, un lien ou une note pour votre livrable</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <Field>
              <FieldLabel>Projet *</FieldLabel>
              <select
                value={form.project_id}
                onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
              >
                <option value="">Sélectionner un projet</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </Field>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Fichier (optionnel)</p>
              <label className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors">
                <Upload className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate flex-1">
                  {file ? file.name : 'Choisir un fichier (PDF, Word, PowerPoint, Excel, image…)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.zip"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-muted-foreground">Taille max : 10 Mo</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <span className="relative flex justify-center text-xs text-muted-foreground bg-background px-2">ou un lien</span>
            </div>
            <Field>
              <FieldLabel htmlFor="file_url">URL du livrable</FieldLabel>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="file_url"
                  value={form.file_url}
                  onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
                  placeholder="https://docs.google.com/... ou github.com/..."
                  className="pl-9"
                />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">Notes (optionnel)</FieldLabel>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Décrivez ce que vous avez produit…"
                rows={3}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.project_id || (!form.file_url && !form.notes && !file)}>
              {uploading ? <><Loader2 className="size-4 mr-1 animate-spin" /> Upload…</> : submitting ? 'Envoi…' : 'Soumettre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deliverables.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Aucun livrable soumis</p>
              <p className="text-sm text-muted-foreground mt-1">Soumettez votre premier livrable pour commencer le suivi</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {deliverables.map(d => {
            const cfg = STATUS_CONFIG[d.status]
            const Icon = cfg.icon
            return (
              <Card key={d.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm">{d.projects?.title ?? 'Projet'}</CardTitle>
                      <CardDescription className="text-xs">
                        Soumis le {new Date(d.submitted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </CardDescription>
                    </div>
                    <Badge variant={cfg.variant} className="flex items-center gap-1 shrink-0">
                      <Icon className="size-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                {(d.file_url || d.notes) && (
                  <CardContent>
                    {d.file_url && (
                      <a href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                        <Link2 className="size-3.5" />
                        {d.file_url}
                      </a>
                    )}
                    {d.notes && <p className="text-sm text-muted-foreground mt-1">{d.notes}</p>}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
