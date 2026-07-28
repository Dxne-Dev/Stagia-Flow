import { motion } from 'framer-motion'

export default function DominoFall({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const chars = text.split('')
  return (
    <motion.span className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          aria-hidden="true"
          style={{ transformOrigin: 'bottom left', willChange: 'transform, opacity' }}
          initial={{ rotateZ: -90, opacity: 0 }}
          animate={{ rotateZ: 0, opacity: 1 }}
          transition={{
            delay: i * 0.06,
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 1,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}
