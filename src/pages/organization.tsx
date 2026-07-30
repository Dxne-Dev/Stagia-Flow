import * as React from 'react'
import { Globe, Pencil, Save, X, Sparkles, RefreshCw, Zap, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { useOrganization, useOrgDailyUsage, useUpdateOrganization } from '@/hooks'
import { invokeEdgeFunction } from '@/lib/edge-functions'
import { PLAN_LABELS, PLAN_PRICES, AI_DAILY_LIMITS, getAnalysisRemaining, isCreditLimitError } from '@/lib/plan-utils'
import type { AiContext, AnalyzeCompanyRequest } from '@/types/edge-functions'

interface OrgContext {
  sector?: string
  summary?: string
  main_activities?: string[]
  tech_stack?: string[]
  recent_projects?: string[]
}

export default function OrganizationPage() {
  const { profile, loading: authLoading } = useAuth()
  const { data: org, isLoading } = useOrganization(profile?.organization_id)
  const updateOrg = useUpdateOrganization()
  const [editing, setEditing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState('')
  const [url, setUrl] = React.useState('')

  React.useEffect(() => {
    if (org) {
      setName(org.name)
      setUrl(org.website_url ?? '')
    }
  }, [org])

  const handleSave = async () => {
    if (!org) return
    setSaving(true)
    await updateOrg.mutateAsync({ id: org.id, name, website_url: url || null })
    setEditing(false)
    setSaving(false)
  }

  const ctx = org?.ai_context_json as OrgContext | null

  const { data: dailyUsage } = useOrgDailyUsage(profile?.organization_id)
  const [regenerating, setRegenerating] = React.useState(false)
  const [regenerateError, setRegenerateError] = React.useState<string | null>(null)

  const handleRegenerate = async () => {
    if (!org || !org.website_url || regenerating) return
    setRegenerating(true)
    setRegenerateError(null)
    try {
      const data = await invokeEdgeFunction<AnalyzeCompanyRequest, AiContext>('analyze-company', {
        url: org.website_url,
        org_name: org.name,
        organization_id: org.id,
      })
      if (data.sector) {
        await updateOrg.mutateAsync({ id: org.id, ai_context_json: data as Record<string, unknown> })
      }
    } catch (e: unknown) {
      const creditMsg = isCreditLimitError(e)
      setRegenerateError(creditMsg ?? (e instanceof Error ? e.message : 'Erreur lors de l\'analyse'))
    } finally {
      setRegenerating(false)
    }
  }

  const plan = org?.plan ?? 'essentiel'
  const dailyLimit = AI_DAILY_LIMITS[plan]
  const usedCredits = dailyUsage ?? 0
  const analysisRemaining = getAnalysisRemaining(org?.analysis_count ?? 3)
  const isUnlimited = dailyLimit === Infinity

  if (authLoading || isLoading) return (
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            Plan & Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant={org.plan === 'essentiel' ? 'outline' : 'default'} className="capitalize text-sm px-3 py-1">
              {PLAN_LABELS[org.plan]}
            </Badge>
            <span className="text-sm text-muted-foreground">{PLAN_PRICES[org.plan]}</span>
          </div>
          {org.plan === 'essentiel' && (
            <Button size="sm" asChild>
              <a href="#pricing"><Zap className="size-4" /> Passer à Pro</a>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            Crédits IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUnlimited ? (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Sparkles className="size-3.5 mr-1.5" />
                Illimité
              </Badge>
              <span className="text-sm text-muted-foreground">Générations IA sans limite</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Générations IA aujourd'hui</span>
                <span className="font-medium tabular-nums">{usedCredits}/{dailyLimit}</span>
              </div>
              <Progress value={(usedCredits / dailyLimit) * 100} className="h-2" />
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
              <div className="flex items-center gap-2">
                {org.website_url && (
                  <span className="text-xs text-muted-foreground tabular-nums">{analysisRemaining.remaining}/{analysisRemaining.remaining + (org?.analysis_count ?? 0)} analyses</span>
                )}
                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={regenerating || !org.website_url || !analysisRemaining.allowed}>
                  {regenerating ? <Spinner className="size-4" /> : <RefreshCw className="size-4" />}
                  Régénérer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {regenerateError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{regenerateError}</div>
            )}
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
            {Array.isArray(ctx.main_activities) && ctx.main_activities.length > 0 && (
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
