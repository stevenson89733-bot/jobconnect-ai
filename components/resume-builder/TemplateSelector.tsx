import { useTranslations } from 'next-intl'
import type { ResumeTemplateId } from './ResumePreview'

export default function TemplateSelector({
  value,
  onChange,
}: {
  value: ResumeTemplateId
  onChange: (template: ResumeTemplateId) => void
}) {
  const t = useTranslations('resumeBuilder')
  const TEMPLATES: { id: ResumeTemplateId; label: string }[] = [
    { id: 'classic', label: t('templateClassic') },
    { id: 'modern', label: t('templateModern') },
  ]

  return (
    <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5">
      {TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          onClick={() => onChange(tpl.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === tpl.id
              ? 'bg-primary text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {tpl.label}
        </button>
      ))}
    </div>
  )
}
