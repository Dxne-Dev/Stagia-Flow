import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: 'StagePilot nous a fait gagner un temps considérable dans le suivi de nos stagiaires. La génération de briefs par IA est bluffante de pertinence.',
    name: 'Sophie Martin',
    role: 'Responsable RH',
    company: 'Groupe Tech France',
  },
  {
    quote: 'Enfin un outil qui centralise tout : des conventions aux livrables. Mes stagiaires trouvent leur chemin facilement, et je valide en un clic.',
    name: 'Thomas Dubois',
    role: 'Manager Innovation',
    company: 'Digital Solutions',
  },
  {
    quote: 'La visibilité sur l\'avancement des projets est exceptionnelle. Je sais exactement où en est chaque stagiaire sans avoir à relancer.',
    name: 'Camille Petit',
    role: 'Coordinatrice pédagogique',
    company: 'École Supérieure de Management',
  },
  {
    quote: 'Nous avons réduit de 40% le temps passé à gérer les conventions de stage. L\'automatisation des briefs nous fait gagner des heures chaque semaine.',
    name: 'Antoine Lefèvre',
    role: 'Directeur RH',
    company: 'Industrie Solutions',
  },
  {
    quote: 'Les stagiaires arrivent mieux préparés grâce aux briefs détaillés. La qualité des livrables s\'est nettement améliorée depuis que nous utilisons StagePilot.',
    name: 'Marie Laurent',
    role: 'Chef de projet',
    company: 'Agency Web',
  },
  {
    quote: 'La plateforme est intuitive et élégante. Mes équipes l\'ont adoptée sans formation. Le tableau de bord analytics est un vrai plus pour le pilotage.',
    name: 'Jérôme Moreau',
    role: 'CTO',
    company: 'Startup Lab',
  },
]

export default function TestimonialsSection() {
  const items = [...testimonials, ...testimonials]

  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Témoignages
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ils nous font confiance
          </h2>
        </div>

        <div className="overflow-hidden mask-fade-x group -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="flex animate-scroll-testimonials gap-6 px-4 sm:px-6 lg:px-8">
            {items.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="flex w-80 shrink-0 flex-col rounded-xl border border-border bg-card p-6 sm:w-96"
              >
                <Quote className="mb-3 size-5 shrink-0 text-muted-foreground/40" />
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-testimonials {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-testimonials {
          animation: scroll-testimonials 50s linear infinite;
        }
        .group:hover .animate-scroll-testimonials {
          animation-play-state: paused;
        }
        .mask-fade-x {
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }
      `}</style>
    </section>
  )
}
