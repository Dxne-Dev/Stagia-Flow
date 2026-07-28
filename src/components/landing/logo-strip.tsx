import { useTheme } from '@/components/theme-provider'

const logos = [
  { name: 'Google', src: '/svg/google.svg' },
  { name: 'GitHub', src: '/svg/github_light.svg', darkSrc: '/svg/github_dark.svg' },
  { name: 'Vercel', src: '/svg/vercel.svg', darkSrc: '/svg/vercel_dark.svg' },
  { name: 'Figma', src: '/svg/figma.svg' },
  { name: 'Notion', src: '/svg/notion.svg' },
  { name: 'Stripe', src: '/svg/stripe.svg' },
]

export default function LogoStrip() {
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const items = [...logos, ...logos]

  return (
    <section className="border-b border-border py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Utilisé par les équipes de
        </p>
        <div className="overflow-hidden mask-fade-x group">
          <div className="flex animate-scroll">
            {items.map(({ name, src, darkSrc }, i) => (
              <img
                key={`${name}-${i}`}
                src={isDark && darkSrc ? darkSrc : src}
                alt={name}
                className="mx-10 h-7 w-auto shrink-0 opacity-30 grayscale transition-all duration-300"
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .group:hover .animate-scroll {
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
