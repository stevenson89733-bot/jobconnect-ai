'use client'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import FadeIn from '@/components/dashboard/FadeIn'
import type { CareerProgressPoint } from '@/lib/careerProgress'

const WIDTH = 600
const HEIGHT = 180
const PAD = { top: 12, right: 12, bottom: 28, left: 12 }
const INNER_W = WIDTH - PAD.left - PAD.right
const INNER_H = HEIGHT - PAD.top - PAD.bottom

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Points are real "Refresh Analysis" runs, evenly spaced by index (not by
// elapsed time) — this is a real trend across real runs, not a
// continuous-time series, so even spacing is the honest representation.
export default function CareerProgressChart({ points }: { points: CareerProgressPoint[] }) {
  const t = useTranslations('analytics')
  const xFor = (i: number) => PAD.left + (points.length <= 1 ? INNER_W / 2 : (i / (points.length - 1)) * INNER_W)
  const yFor = (score: number) => PAD.top + INNER_H - (score / 100) * INNER_H

  const atsPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.atsScore)}`).join(' ')
  const strengthPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.profileStrength)}`).join(' ')

  return (
    <FadeIn delay={0.2}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.75} />
              {t('careerProgress')}
            </h2>
            {points.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> {t('legendAtsScore')}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> {t('legendProfileStrength')}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">{t('careerProgressSubtitle')}</p>

          {points.length < 2 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📈</div>
              {points.length === 1 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('careerProgressSinglePoint', { ats: points[0].atsScore, strength: points[0].profileStrength, date: formatDate(points[0].generatedAt) })}
                </p>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('careerProgressNoPoints')}
                </p>
              )}
            </div>
          ) : (
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none">
              <motion.path
                d={atsPath}
                fill="none"
                className="stroke-primary"
                strokeWidth={2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.path
                d={strengthPath}
                fill="none"
                className="stroke-accent"
                strokeWidth={2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={xFor(i)} cy={yFor(p.atsScore)} r={3.5} className="fill-primary" />
                  <circle cx={xFor(i)} cy={yFor(p.profileStrength)} r={3.5} className="fill-accent" />
                  <text x={xFor(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-slate-600 dark:fill-slate-400" fontSize={10}>
                    {formatDate(p.generatedAt)}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
