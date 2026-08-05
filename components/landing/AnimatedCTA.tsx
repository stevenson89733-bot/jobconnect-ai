'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function AnimatedCTA({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(46, 92, 246, 0.4)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="inline-flex rounded-full"
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  )
}
