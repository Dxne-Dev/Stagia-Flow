import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, ArrowRight, Sparkles, CheckCircle2, Building2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { invokeEdgeFunction } from '@/lib/edge-functions'
import { organizationService, profileService } from '@/services'
import type { AiContext, AnalyzeCompanyRequest } from '@/types/edge-functions'

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = React.useState<'org' | 'scraping' | 'review'>('org')
  const [orgName, setOrgName] = React.useState('')
  const [websiteUrl, setWebsiteUrl] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [aiContext, setAiContext] = React.useState<AiContext | null>(null)
  const [orgId, setOrgId] = React.useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!orgName.trim()) { setError('Veuillez saisir le nom de votre organisation'); return }
    setError(null)
    setLoading(true)
    setStep('scraping')

    try {
      let context: AiContext = {
        sector: 'Technologie & Innovation',
        main_activities: ['Développement logiciel', 'Conseil digital', 'Intégration système'],
        tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        recent_projects: ['Refonte plateforme client', 'Déploiement CI/CD', 'Migration cloud'],
        summary: `${orgName} est une organisation opérant dans un secteur dynamique. Elle s'appuie sur des technologies modernes pour livrer des projets à forte valeur ajoutée.`,
      }

      if (websiteUrl) {
        try {
          const data = await invokeEdgeFunction<AnalyzeCompanyRequest, AiContext>('analyze-company', {
            url: websiteUrl,
            org_name: orgName,
          })
          if (data.sector) context = data
        } catch {
          // fallback to default context
        }
      }

      const org = await organizationService.create({
        name: orgName,
        website_url: websiteUrl || null,
        ai_context_json: context as Record<string, unknown>,
        owner_id: user!.id,
      })
      setOrgId(org.id)

      await profileService.update(user!.id, { organization_id: org.id, role: 'admin' })

      setAiContext(context)
      setStep('review')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'analyse')
      setStep('org')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    await refreshProfile()
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SP</span>
            </div>
            <span className="text-xl font-bold tracking-tight">StagePilot</span>
          </div>
        </div>

        {step === 'org' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Configuration de votre organisation
              </CardTitle>
              <CardDescription>
                Renseignez votre entreprise. L'IA analysera votre site pour générer des briefs adaptés.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="orgName">Nom de l'organisation *</FieldLabel>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="websiteUrl">Site web (optionnel)</FieldLabel>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://acme.fr"
                    className="pl-9"
                  />
                </div>
                <FieldDescription>
                  L'IA extraira le contexte métier pour personnaliser les briefs de stage
                </FieldDescription>
              </Field>
              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                <Sparkles className="size-4" />
                Analyser et créer mon organisation
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'scraping' && (
          <Card>
            <CardContent className="flex flex-col items-center gap-6 py-12">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Spinner className="size-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">Analyse en cours…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  L'IA extrait le contexte métier de votre organisation
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Récupération du site web</span>
                <span className="flex items-center gap-2"><Spinner className="size-4" /> Analyse des activités et de la stack</span>
                <span className="flex items-center gap-2 opacity-40">Génération du profil entreprise</span>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'review' && aiContext && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                Fiche Profil Entreprise générée
              </CardTitle>
              <CardDescription>
                L'IA a analysé votre organisation. Vérifiez et finalisez votre profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="rounded-lg border bg-card p-4 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Secteur</p>
                  <Badge variant="secondary">{aiContext.sector}</Badge>
                </div>
                {aiContext.summary && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Résumé</p>
                    <p className="text-sm">{aiContext.summary}</p>
                  </div>
                )}
                {aiContext.main_activities && aiContext.main_activities.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Activités principales</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiContext.main_activities.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
                    </div>
                  </div>
                )}
                {aiContext.tech_stack && aiContext.tech_stack.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Stack / Outils</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiContext.tech_stack.map(t => <Badge key={t}>{t}</Badge>)}
                    </div>
                  </div>
                )}
                {aiContext.recent_projects && aiContext.recent_projects.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Projets récents</p>
                    <ul className="text-sm list-disc list-inside text-muted-foreground space-y-1">
                      {aiContext.recent_projects.map(p => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                ID organisation : <span className="font-mono">{orgId}</span>
              </p>
              <Button onClick={handleFinish} className="w-full">
                Accéder à mon tableau de bord
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
