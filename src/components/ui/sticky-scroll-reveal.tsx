import React, { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string
    description: string
    content?: React.ReactNode
  }[]
  contentClassName?: string
}) => {
  const { theme } = useTheme()
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [activeCard, setActiveCard] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => {
    setActiveCard(prev => (prev + 1) % content.length)
  }, [content.length])

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(next, 7000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, next])

  const backgroundColors = isDark
    ? ["rgb(20 20 20)", "rgb(26 26 26)", "rgb(16 16 16)"]
    : ["rgb(250 250 250)", "rgb(255 255 255)", "rgb(245 245 245)"]

  const linearGradients = [
    "linear-gradient(to bottom right, rgb(6 182 212), rgb(16 185 129))",
    "linear-gradient(to bottom right, rgb(236 72 153), rgb(99 102 241))",
    "linear-gradient(to bottom right, rgb(249 115 22), rgb(234 179 8))",
  ]

  const [backgroundGradient, setBackgroundGradient] = useState(linearGradients[0])

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length])
  }, [activeCard])

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex justify-center rounded-xl border border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex w-full items-start gap-8 px-4 py-12 sm:px-8 lg:px-12">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCard}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {content[activeCard].title}
              </h3>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
                {content[activeCard].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-2">
            {content.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCard(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeCard
                    ? 'w-6 bg-foreground'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Voir l'étape ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div
          style={{ background: backgroundGradient }}
          className={cn(
            "hidden lg:block h-72 w-96 shrink-0 rounded-xl overflow-hidden shadow-lg sticky top-10",
            contentClassName,
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCard}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full w-full"
            >
              {content[activeCard].content ?? null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
