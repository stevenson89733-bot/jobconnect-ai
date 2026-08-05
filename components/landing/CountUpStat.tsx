'use client'
import { useEffect, useRef } from 'react'
import { useInView, animate } from 'framer-motion'

export function CountUpStat({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const el = ref.current
    const controls = animate(0, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate(v) {
        el.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [inView, value])

  return <span ref={ref}>0</span>
}
