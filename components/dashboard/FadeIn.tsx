'use client'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Reusable scroll-in-once fade/slide wrapper used by every dashboard section
// below, so the stagger timing stays consistent without repeating variants.
export default function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
