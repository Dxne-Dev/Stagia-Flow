import Link from "next/link";

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-[var(--forest)] px-6 py-7 text-[var(--clay)] sm:px-10 sm:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-35 [background:radial-gradient(circle_at_76%_35%,#d6a64a_0,transparent_22rem),radial-gradient(circle_at_8%_90%,#5c8872_0,transparent_28rem)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-fraunces)] text-2xl tracking-tight">
            StagiaFlow
          </span>
          <Link
            className="border-b border-[var(--ochre)] pb-1 text-sm font-medium transition hover:text-[var(--ochre)]"
            href="/connexion"
          >
            Se connecter
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.15fr_.85fr] lg:py-28">
          <div>
            <p className="mb-6 text-xs font-bold tracking-[0.2em] text-[var(--ochre)] uppercase">
              L&apos;expérience de stage, bien orchestrée
            </p>
            <h1 className="max-w-3xl font-[family-name:var(--font-fraunces)] text-5xl leading-[0.96] tracking-[-0.04em] sm:text-7xl">
              Des missions qui font vraiment avancer.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[color:color-mix(in_srgb,var(--clay)_80%,transparent)]">
              Transformez le site de votre entreprise en parcours de stage
              concrets, adaptés aux talents que vous accueillez.
            </p>
            <Link
              className="mt-10 inline-flex items-center gap-3 bg-[var(--ochre)] px-6 py-4 font-semibold text-[var(--ink)] transition hover:bg-[#e1b95f]"
              href="/entreprise/demarrage"
            >
              Créer mon espace entreprise <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="border border-[color:color-mix(in_srgb,var(--clay)_28%,transparent)] bg-[color:color-mix(in_srgb,#0d2922_82%,transparent)] p-7 sm:p-9">
            <p className="text-sm font-bold tracking-[0.15em] text-[var(--ochre)] uppercase">
              Le flux StagiaFlow
            </p>
            <ol className="mt-8 space-y-6">
              {[
                "Votre entreprise est comprise, pas simplement renseignée.",
                "Vos sessions et stagiaires structurent le contexte.",
                "Des projets utiles et éditables émergent au bon niveau.",
              ].map((step, index) => (
                <li className="flex gap-4" key={step}>
                  <span className="font-[family-name:var(--font-fraunces)] text-3xl text-[var(--ochre)]">
                    0{index + 1}
                  </span>
                  <span className="pt-1 text-base leading-6">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
