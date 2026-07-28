import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/landing/theme-toggle'
import { LogoIcon } from '@/components/ui/logo-icon'

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <LogoIcon className="size-5" />
          <span className="text-lg font-semibold tracking-tight">StagePilot</span>
        </Link>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {[
            { label: 'Fonctionnalités', href: '#features' },
            { label: 'Tarifs', href: '#pricing' },
            { label: 'Contact', href: '#cta' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/login">Connexion</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Essai gratuit</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
