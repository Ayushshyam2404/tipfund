'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

/**
 * Button hover effect with scale and shadow
 */
export function HoverScaleWrapper({ children, scale = 1.05 }: { children: ReactNode; scale?: number }) {
  return (
    <motion.div whileHover={{ scale }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
      {children}
    </motion.div>
  )
}

/**
 * Stagger children animations
 */
export function StaggerContainer({
  children,
  delay = 0.1,
  delayChildren = 0,
}: {
  children: ReactNode
  delay?: number
  delayChildren?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        staggerChildren: delay,
        delayChildren,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger item (child of StaggerContainer)
 */
export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Celebration animation - for wins/successes
 */
export function CelebrationAnimation() {
  const confetti = Array.from({ length: 30 }, (_, i) => i)
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight : 800

  return (
    <AnimatePresence>
      {confetti.map((i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none"
          initial={{
            x: Math.random() * maxWidth,
            y: -10,
            opacity: 1,
          }}
          animate={{
            y: maxHeight + 20,
            opacity: 0,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            ease: 'easeIn',
          }}
          exit={{ opacity: 0 }}
        >
          <span className="text-2xl">{['🎉', '✨', '🌟', '💎', '🚀'][Math.floor(Math.random() * 5)]}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

/**
 * Disappointment animation - for losses
 */
export function DisappointmentAnimation() {
  return (
    <AnimatePresence>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none left-1/2 top-1/3"
          initial={{
            opacity: 1,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 200,
            y: 100 + Math.random() * 100,
            rotate: Math.random() * 180 - 90,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
          exit={{ opacity: 0 }}
        >
          <span className="text-3xl">{i === 0 ? '💔' : i === 1 ? '😞' : '❌'}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

/**
 * Loading skeleton animation
 */
export function SkeletonLoader({ width = '100%', height = '20px' }: { width?: string; height?: string }) {
  return (
    <motion.div
      className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded"
      style={{ width, height }}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

/**
 * Pulse animation for attention
 */
export function PulseHighlight({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(168, 85, 247, 0.7)',
          '0 0 0 10px rgba(168, 85, 247, 0)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Flip animation for cards
 */
export function FlipCard({
  front,
  back,
  isFlipped,
}: {
  front: ReactNode
  back: ReactNode
  isFlipped: boolean
}) {
  return (
    <motion.div
      initial={false}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ perspective: '1200px' }}
    >
      {!isFlipped ? front : back}
    </motion.div>
  )
}

/**
 * Typewriter effect
 */
export function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const letters = text.split('')

  return (
    <span>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.05,
            delay: delay + i * 0.05,
          }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  )
}

/**
 * Counter animation - animated number transitions
 */
export function CounterAnimation({
  from = 0,
  to,
  duration = 1,
  suffix = '',
}: {
  from?: number
  to: number
  duration?: number
  suffix?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
    >
      {to}
      {suffix}
    </motion.div>
  )
}

/**
 * Slide in from side animation
 */
export function SlideInAnimation({
  children,
  direction = 'left',
  delay = 0,
}: {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
}) {
  const initial = {
    left: { x: -100, opacity: 0 },
    right: { x: 100, opacity: 0 },
    up: { y: 100, opacity: 0 },
    down: { y: -100, opacity: 0 },
  }[direction]

  return (
    <motion.div
      initial={initial}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  )
}
