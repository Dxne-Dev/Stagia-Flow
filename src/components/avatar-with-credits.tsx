import * as React from 'react'
import type { Plan } from '@/types'
import { AI_DAILY_LIMITS } from '@/lib/plan-utils'
import { cn } from '@/lib/utils'

interface Props {
  plan: Plan
  usedCredits: number
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const SIZE_MAP = { sm: 28, default: 32, lg: 40 } as const
const RING_WIDTH = 2.5
const SEGMENTS = 5

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

export function AvatarWithCredits({ plan, usedCredits, size = 'default', className }: Props) {
  const px = SIZE_MAP[size]
  const svgSize = px + 12
  const cx = svgSize / 2
  const cy = svgSize / 2
  const ringR = svgSize / 2 - 3
  const avatarR = px / 2
  const totalLimit = AI_DAILY_LIMITS[plan]
  const isUnlimited = totalLimit === Infinity
  const consumed = Math.min(usedCredits, totalLimit)
  const remaining = Math.max(0, totalLimit - consumed)

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: svgSize, height: svgSize }}>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="absolute inset-0">
        {plan === 'essentiel' ? (
          <>
            {Array.from({ length: SEGMENTS }).map((_, i) => {
              const startAngle = i * (360 / SEGMENTS)
              const endAngle = startAngle + (360 / SEGMENTS) - 8
              const isActive = i < remaining
              const d = describeArc(cx, cy, ringR, startAngle, endAngle)
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  strokeWidth={RING_WIDTH}
                  strokeLinecap="round"
                  className={cn(
                    'transition-colors duration-300',
                    isActive
                      ? 'stroke-primary drop-shadow-[0_0_4px_hsl(var(--primary))]'
                      : 'stroke-muted-foreground/30',
                  )}
                />
              )
            })}
          </>
        ) : plan === 'pro' ? (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={ringR}
              fill="none"
              strokeWidth={RING_WIDTH}
              strokeLinecap="round"
              className="stroke-muted-foreground/30"
            />
            {remaining > 0 && (
              <circle
                cx={cx}
                cy={cy}
                r={ringR}
                fill="none"
                strokeWidth={RING_WIDTH}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * ringR}
                strokeDashoffset={2 * Math.PI * ringR * (1 - remaining / totalLimit)}
                className="stroke-primary drop-shadow-[0_0_4px_hsl(var(--primary))] transition-all duration-500 -rotate-90 origin-center"
              />
            )}
          </>
        ) : (
          <circle
            cx={cx}
            cy={cy}
            r={ringR}
            fill="none"
            strokeWidth={RING_WIDTH}
            strokeLinecap="round"
            className="stroke-primary drop-shadow-[0_0_4px_hsl(var(--primary))]"
          />
        )}
      </svg>

      <div
        className="absolute rounded-full bg-muted flex items-center justify-center overflow-hidden"
        style={{ width: px, height: px, top: (svgSize - px) / 2, left: (svgSize - px) / 2 }}
      >
        <svg width={px * 0.55} height={px * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      </div>
    </div>
  )
}
