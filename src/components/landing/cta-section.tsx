import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function CtaSection() {
  return (
    <section id="cta" className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à simplifier la gestion de vos stages ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Rejoignez les organisations qui utilisent StagePilot au quotidien.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">
                Essai gratuit
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Déjà un compte ? Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
