

const sections = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Tarifs', href: '#pricing' },
      { label: 'Contact', href: '#cta' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Confidentialité', href: '#' },
      { label: 'CGU', href: '#' },
      { label: 'CGV', href: '#' },
    ],
  },
]

export default function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-primary-foreground">SP</span>
              </div>
              <span className="font-semibold text-sm">StagePilot</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-xs">
              Du premier jour à la remise du rapport. La plateforme complète de gestion de stages.
            </p>
          </div>
          {sections.map(s => (
            <div key={s.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.title}</p>
              <ul className="space-y-2">
                {s.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground/70 transition-colors hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} StagePilot. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
