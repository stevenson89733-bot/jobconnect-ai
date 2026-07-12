// Real skeleton matching the JobCard layout (logo + title/meta/tags on the
// left, salary/actions on the right) — not a generic spinner.
export default function JobCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="flex gap-1.5 pt-1">
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-32">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
        </div>
      </div>
    </div>
  )
}
