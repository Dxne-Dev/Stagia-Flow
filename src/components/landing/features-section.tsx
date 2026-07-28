import { Users, FolderKanban, FileCheck, Sparkles, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Gestion des stagiaires',
    desc: 'Créez des profils, assignez des sessions et suivez chaque stagiaire de son arrivée à sa sortie.',
  },
  {
    icon: FolderKanban,
    title: 'Sessions & Projets',
    desc: 'Organisez les stages par sessions (Licence, Master, Doctorat) et générez des briefs sur mesure.',
  },
  {
    icon: FileCheck,
    title: 'Livrables & Validation',
    desc: 'Collectez les rendus, révisez-les en ligne et validez avec un simple clic. Tout l\'historique conservé.',
  },
  {
    icon: Sparkles,
    title: 'Briefs générés par IA',
    desc: 'L\'IA analyse votre contexte entreprise et rédige des briefs de projet pertinents et structurés.',
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord',
    desc: 'Visualisez en un coup d\'œil l\'avancement des sessions, projets et livrables.',
  },
  {
    icon: Shield,
    title: 'Sécurisé & Conforme',
    desc: 'Hébergement sécurisé, authentification Supabase et contrôle d\'accès par rôles (admin, manager, stagiaire).',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Fonctionnalités
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Tout ce qu&apos;il faut pour gérer vos stages
          </h2>
          <p className="mt-3 text-muted-foreground">
            Une plateforme complète du premier contact à la validation finale.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/20">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-background">
                <f.icon className="size-5 text-foreground" />
              </div>
              <h3 className="mb-1.5 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
