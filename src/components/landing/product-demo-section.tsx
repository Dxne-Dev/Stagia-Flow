import { StickyScroll } from '@/components/ui/sticky-scroll-reveal'

const content = [
  {
    title: 'Créez vos sessions en un clic',
    description: 'Définissez les niveaux académiques, les départements et les dates. Lancez une nouvelle cohorte en quelques secondes.',
    content: (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full rounded-lg border border-border bg-background/95 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-40 rounded-md border border-border bg-card" />
            <div className="flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">+ Nouvelle session</div>
          </div>
          <div className="space-y-2">
            {['Licence Informatique · 12 stagiaires', 'Master Data · 8 stagiaires', 'Doctorat IA · 4 stagiaires'].map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className={`size-2 shrink-0 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-violet-500'}`} />
                <span className="flex-1 text-sm">{s}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">Actif</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Suivez les projets en temps réel',
    description: 'Visualisez l\'état d\'avancement de chaque projet, consultez les briefs et gérez les échéances depuis un tableau de bord centralisé.',
    content: (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full rounded-lg border border-border bg-background/95 p-4 backdrop-blur-sm">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {['Brief', 'Livrable', 'Statut'].map(h => (
              <span key={h} className="text-xs font-medium text-muted-foreground">{h}</span>
            ))}
          </div>
          <div className="space-y-2">
            {[
              ['Site vitrine', 'Rapport PDF', 'Actif'],
              ['Analyse data', 'Dashboard', 'Soumis'],
              ['App mobile', 'Code source', 'Validé'],
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 border-t border-border py-2">
                <span className="text-sm">{row[0]}</span>
                <span className="text-sm text-muted-foreground">{row[1]}</span>
                <span className={`text-sm ${i === 2 ? 'text-emerald-600' : i === 1 ? 'text-amber-600' : ''}`}>{row[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Générez des briefs par IA',
    description: 'Notre analyseur extrait le contexte de votre entreprise (secteur, technologies, projets) et génère des briefs de stage pertinents et personnalisés.',
    content: (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full rounded-lg border border-border bg-background/95 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <svg className="size-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-sm font-medium">Brief généré par IA</span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Développement d&apos;un chatbot interne</p>
            <p className="text-xs text-muted-foreground">Contexte : Entreprise en pleine transformation digitale...</p>
            <div className="flex gap-2 pt-1">
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">4 semaines</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">Prototype</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

export default function ProductDemoSection() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Démo
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Découvrez StagePilot en action
          </h2>
          <p className="mt-3 text-muted-foreground">
            Une interface claire pour chaque étape de la gestion de stages.
          </p>
        </div>

        <StickyScroll content={content} />
      </div>
    </section>
  )
}
