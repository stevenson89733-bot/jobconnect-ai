import { useTranslations } from 'next-intl'

export type CoverLetterStyle = 'Formal' | 'Conversational' | 'Concise'

export default function StyleSelector({
  value,
  onChange,
}: {
  value: CoverLetterStyle
  onChange: (style: CoverLetterStyle) => void
}) {
  const t = useTranslations('coverLetter')
  const STYLES: { id: CoverLetterStyle; label: string }[] = [
    { id: 'Formal', label: t('styleFormal') },
    { id: 'Conversational', label: t('styleConversational') },
    { id: 'Concise', label: t('styleConcise') },
  ]

  return (
    <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5">
      {STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === s.id
              ? 'bg-primary text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
