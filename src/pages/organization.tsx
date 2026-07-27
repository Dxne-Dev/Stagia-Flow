import * as React from 'react'
import { Globe, Pencil, Save, X, Sparkles, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Field, FieldLabel } from '@/components/ui/field'
import type { Organization } from '@/lib/supabase'

export default function OrganizationPage() {
  const { profile, loading: authLoading } = useAuth()
  const [org, setOrg] = React.useState<Organization | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState('')
  const [url, setUrl] = React.useState('')

  React.useEffect(() => {
    const load = async () => {
      if (authLoading) return
      if (!profile?.organization_id) { setLoading(false); return }
      const { data } = await supabase.from('organizations').select('*').eq('id', profile.organization_id).maybeSingle()
      if (data) {
        setOrg(data)
        setName(data.name)
        setUrl(data.website_url ?? '')
      }
      setLoading(false)
    }
    load()
  }, [profile, authLoading])

  const handleSave = async () => {
    if (!org) return
    setSaving(true)
    const { data } = await supabase
      .from('organizations')
      .update({ name, website_url: url || null })
      .eq('id', org.id)
      .select()
      .single()
    if (data) setOrg(data)
    setEditing(false)
    setSaving(false)
  }

  interface OrgContext {
    sector?: string
    summary?: string
    main_activities?: string[]
    tech_stack?: string[]
    recent_projects?: string[]
  }
  const ctx = org?.ai_context_json as OrgContext | null

  if (loading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48" />
    </div>
  )

  if (!org) return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-muted-foreground">Aucune organisation configurée.</p>
      <Button asChild><a href="/onboarding">Configurer</a></Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organisation</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Profil et contexte de votre entreprise</p>
        </div>
        {!editing ? (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              <X className="size-4" /> Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="size-4" /> Enregistrer
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {editing ? (
            <>
              <Field>
                <FieldLabel htmlFor="name">Nom de l'organisation</FieldLabel>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="url">Site web</FieldLabel>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="url" value={url} onChange={e => setUrl(e.target.value)} className="pl-9" placeholder="https://" />
                </div>
              </Field>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Nom</p>
                <p className="font-medium">{org.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Site web</p>
                <p className="font-medium text-primary">{org.website_url ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Créé le</p>
                <p className="font-medium">{new Date(org.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {ctx && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Profil IA
                </CardTitle>
                <CardDescription>Extrait automatiquement depuis votre site web</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="size-4" />
                Régénérer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {ctx.sector && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Secteur</p>
                <Badge variant="secondary">{ctx.sector}</Badge>
              </div>
            )}
            {ctx.summary && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Résumé</p>
                <p className="text-sm">{ctx.summary}</p>
              </div>
            )}
            {Array.isArray(ctx.main_activities) && (ctx.main_activities as string[]).length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Activités principales</p>
                <div className="flex flex-wrap gap-1.5">
                  {ctx.main_activities!.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
                </div>
              </div>
            )}
            {Array.isArray(ctx.tech_stack) && ctx.tech_stack.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Stack / Outils</p>
                <div className="flex flex-wrap gap-1.5">
                  {ctx.tech_stack!.map(t => <Badge key={t}>{t}</Badge>)}
                </div>
              </div>
            )}
            {Array.isArray(ctx.recent_projects) && ctx.recent_projects.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Projets récents</p>
                <ul className="text-sm list-disc list-inside text-muted-foreground space-y-1">
                  {ctx.recent_projects!.map(p => <li key={p}>{p}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
