import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import DominoFall from '@/components/landing/domino-fall'

export default function HeroBand() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Nouvelle plateforme disponible
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Du premier jour
              <br />
              <DominoFall text="à la remise" className="text-muted-foreground/60" />
              <br />
              <DominoFall text="du rapport." className="text-muted-foreground/60" />
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Gérez vos stagiaires, leurs projets et leurs livrables en un seul endroit.
              Des briefs générés par IA au suivi des rendus, StagePilot simplifie chaque étape.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Commencer gratuitement
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#features">Voir les fonctionnalités</a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground">Tableau de bord — StagePilot</span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="mb-4 grid grid-cols-4 gap-3">
                  {['Sessions', 'Projets', 'En attente', 'Validés'].map(label => (
                    <div key={label} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-0.5 text-lg font-bold">—</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Projets récents</p>
                    <span className="text-xs text-muted-foreground">Voir tout →</span>
                  </div>
                  {['Développement site vitrine', 'Analyse de données marketing', 'Application mobile React'].map((project, i) => (
                    <div key={i} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
                      <div className="size-2 rounded-full bg-primary/30" />
                      <span className="flex-1 text-sm">{project}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">Actif</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
