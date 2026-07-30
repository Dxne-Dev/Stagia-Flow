import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Essentiel',
    price: 'Gratuit',
    period: '',
    desc: 'Pour découvrir la plateforme avec une organisation.',
    features: ['1 organisation', 'Jusqu\'à 10 stagiaires', '3 sessions actives', '5 générations IA / jour', 'Briefs générés par IA', 'Validation de livrables'],
    cta: 'Commencer gratuitement',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Pro',
    price: '30 000 FCFA',
    period: '/mois',
    desc: 'Pour les équipes RH qui gèrent plusieurs services.',
    features: ['Organisations illimitées', 'Stagiaires illimités', 'Sessions illimitées', '100 générations IA / jour', 'Briefs IA avancés', 'Tableau de bord analytics', 'Support prioritaire'],
    cta: 'Essai gratuit 14 jours',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Entreprise',
    price: 'Sur mesure',
    period: '',
    desc: 'Pour les grands groupes et écoles avec besoins spécifiques.',
    features: ['Tout le plan Pro', 'Générations IA illimitées', 'SSO / SAML', 'API dédiée', 'Intégration LMS', 'SLA garantie', 'Compte dédié'],
    cta: 'Nous contacter',
    href: '#cta',
    featured: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Tarifs
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Un tarif adapté à votre organisation
          </h2>
          <p className="mt-3 text-muted-foreground">
            Commencez gratuitement, passez à Pro quand vous êtes prêt.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 max-w-5xl mx-auto">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-6 sm:p-8 ${
                plan.featured
                  ? 'border-foreground bg-card shadow-md'
                  : 'border-border bg-background'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  Le plus populaire
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button asChild variant={plan.featured ? 'default' : 'outline'} className="w-full">
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
