import type { ResumeTemplateId } from './ResumePreview'

const TEMPLATES: { id: ResumeTemplateId; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
]

export default function TemplateSelector({
  value,
  onChange,
}: {
  value: ResumeTemplateId
  onChange: (template: ResumeTemplateId) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === t.id
              ? 'bg-primary text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
