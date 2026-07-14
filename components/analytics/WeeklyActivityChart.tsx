'use client'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import FadeIn from '@/components/dashboard/FadeIn'
import type { WeekBucket } from '@/lib/weeklyActivity'

// Real per-week bars for applications + saved jobs — heights are
// proportional to genuine counts, never smoothed/interpolated. A brand new
// user will see every bar at zero height, which is why the empty state
// below is an explicit, designed message rather than a bare flat chart
// that could read as broken.
export default function WeeklyActivityChart({ weeks }: { weeks: WeekBucket[] }) {
  const totalActivity = weeks.reduce((sum, w) => sum + w.applications + w.savedJobs, 0)
  const maxValue = Math.max(1, ...weeks.map((w) => Math.max(w.applications, w.savedJobs)))

  return (
    <FadeIn delay={0.1}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" strokeWidth={1.75} />
              Weekly Activity
            </h2>
            {totalActivity > 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Applications</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> Saved Jobs</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-5">Last 8 weeks</p>

          {totalActivity === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your activity will show up here once you start applying to jobs or saving them for later.
              </p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-40">
              {weeks.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="flex items-end gap-0.5 h-full w-full justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(w.applications / maxValue) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      className="w-2.5 rounded-t bg-primary min-h-[2px]"
                      title={`${w.applications} application${w.applications === 1 ? '' : 's'}`}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(w.savedJobs / maxValue) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.04 + 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="w-2.5 rounded-t bg-accent min-h-[2px]"
                      title={`${w.savedJobs} saved job${w.savedJobs === 1 ? '' : 's'}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 whitespace-nowrap">{w.weekLabel}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
