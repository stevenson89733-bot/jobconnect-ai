export default function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/40 shadow-sm px-4 py-3 animate-pulse">
      {/* Line 1: logo + title + salary chip */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1 max-w-[55%]" />
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-md ml-auto shrink-0" />
        <div className="h-5 w-6 bg-slate-100 dark:bg-slate-700/50 rounded shrink-0" />
        <div className="h-5 w-6 bg-slate-100 dark:bg-slate-700/50 rounded shrink-0" />
      </div>
      {/* Line 2: meta + badges */}
      <div className="flex items-center gap-1.5 mt-2">
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700/80 rounded" />
        <div className="h-3 w-14 bg-slate-100 dark:bg-slate-700/50 rounded" />
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700/80 rounded-full ml-1" />
        <div className="h-4 w-16 bg-slate-100 dark:bg-slate-700/50 rounded-full" />
        <div className="h-4 w-14 bg-slate-100 dark:bg-slate-700/50 rounded-full" />
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg ml-auto" />
      </div>
    </div>
  )
}
