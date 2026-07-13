import { parseTimeline } from '@/lib/profileSections'

// Pure rendering on top of the existing real Experience/Education text —
// not a separately stored field. Entries stay in the order the candidate
// wrote them (see lib/profileSections.ts for why); a date badge only
// appears when a real leading date was actually parsed out of the text,
// never invented.
export default function Timeline({ text }: { text: string | null | undefined }) {
  const entries = parseTimeline(text)
  if (entries.length === 0) return null

  return (
    <ol className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-1.5 pl-5 space-y-5">
      {entries.map((entry, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
          {entry.dateLabel && (
            <p className="text-xs font-semibold text-primary mb-0.5">{entry.dateLabel}</p>
          )}
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
        </li>
      ))}
    </ol>
  )
}
