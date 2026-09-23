'use client'
import { useMemo } from 'react'
import type { ApplicationStatus } from '@/lib/applicationStatus'

type Application = {
  status: ApplicationStatus
  created_at: string
  job_id: string
}

type Job = { id: string; title: string }

export default function AnalyticsDashboard({
  applications,
  jobs,
}: {
  applications: Application[]
  jobs: Job[]
}) {
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of applications) {
      map[a.status] = (map[a.status] ?? 0) + 1
    }
    return map
  }, [applications])

  const perJob = useMemo(() => {
    const map: Record<string, { title: string; count: number; interviewed: number }> = {}
    for (const j of jobs) map[j.id] = { title: j.title, count: 0, interviewed: 0 }
    for (const a of applications) {
      if (!map[a.job_id]) map[a.job_id] = { title: a.job_id, count: 0, interviewed: 0 }
      map[a.job_id].count++
      if (a.status === 'interview') map[a.job_id].interviewed++
    }
    return Object.values(map).filter(j => j.count > 0).sort((a, b) => b.count - a.count)
  }, [applications, jobs])

  // Last 7 days trend
  const trend = useMemo(() => {
    const days: { label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dayStr = d.toISOString().slice(0, 10)
      const count = applications.filter(a => a.created_at.slice(0, 10) === dayStr).length
      days.push({ label, count })
    }
    return days
  }, [applications])

  const maxTrend = Math.max(1, ...trend.map(d => d.count))

  const FUNNEL: { status: ApplicationStatus; label: string; color: string }[] = [
    { status: 'submitted', label: 'Submitted', color: 'bg-blue-400' },
    { status: 'viewed',    label: 'Viewed',    color: 'bg-indigo-400' },
    { status: 'interview', label: 'Interview', color: 'bg-emerald-400' },
    { status: 'offer',     label: 'Offer',     color: 'bg-amber-400' },
    { status: 'rejected',  label: 'Rejected',  color: 'bg-red-400' },
  ]
  const total = applications.length || 1

  return (
    <div className="card space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">📈</span>
        <h2 className="font-semibold text-slate-900 dark:text-white">Analytics Dashboard</h2>
        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400">Pro</span>
      </div>

      {/* Funnel */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Application Funnel</h3>
        <div className="space-y-2">
          {FUNNEL.map(({ status, label, color }) => {
            const count = statusCounts[status] ?? 0
            const pct = Math.round((count / total) * 100)
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-20 text-xs text-slate-600 dark:text-slate-400 shrink-0">{label}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 7-day trend */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Applications — Last 7 Days</h3>
        <div className="flex items-end gap-1.5 h-16">
          {trend.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-primary/70 rounded-t"
                style={{ height: `${Math.max(4, (count / maxTrend) * 52)}px` }}
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-job breakdown */}
      {perJob.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">By Job Posting</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {perJob.slice(0, 5).map(j => (
              <div key={j.title} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate mr-4">{j.title}</span>
                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  <span>{j.count} applied</span>
                  {j.interviewed > 0 && <span className="text-emerald-600 dark:text-emerald-400">{j.interviewed} interview</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
