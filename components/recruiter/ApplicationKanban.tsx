'use client'
import Link from 'next/link'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/lib/applicationStatus'

type KanbanApp = {
  id: string
  candidateName: string | null
  candidateEmail: string | null
  candidateId: string
  jobTitle: string
  createdAt: string
  status: ApplicationStatus
}

const COLUMN_CONFIG: Record<ApplicationStatus, { label: string; color: string; dot: string }> = {
  submitted: { label: 'New',        color: 'border-blue-400',   dot: 'bg-blue-400' },
  viewed:    { label: 'Reviewing',  color: 'border-yellow-400', dot: 'bg-yellow-400' },
  interview: { label: 'Interview',  color: 'border-[#57C7E3]',  dot: 'bg-[#57C7E3]' },
  offer:     { label: 'Hired',      color: 'border-green-400',  dot: 'bg-green-400' },
  rejected:  { label: 'Rejected',   color: 'border-slate-400',  dot: 'bg-slate-400' },
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function ApplicationKanban({ applications }: { applications: KanbanApp[] }) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm">No applications yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {APPLICATION_STATUSES.map((status) => {
          const col = COLUMN_CONFIG[status]
          const cards = applications.filter((a) => a.status === status)
          return (
            <div key={status} className="w-[220px] shrink-0 flex flex-col">
              {/* Column header */}
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${col.color}`}>
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  {col.label}
                </span>
                <span className="ml-auto text-xs text-slate-400 font-medium">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2 flex-1">
                {cards.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-6 text-center">
                    <p className="text-xs text-slate-400">No candidates</p>
                  </div>
                ) : (
                  cards.map((app) => (
                    <Link
                      key={app.id}
                      href={`/candidate/${app.candidateId}`}
                      className="block bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#57C7E3] to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {(app.candidateName ?? app.candidateEmail ?? '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-slate-800 dark:text-white truncate">
                            {app.candidateName ?? 'Unknown'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{app.candidateEmail}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{app.jobTitle}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(app.createdAt)}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
