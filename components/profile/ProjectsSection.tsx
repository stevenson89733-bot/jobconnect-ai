'use client'
import { useState } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import EditableSection from './EditableSection'
import { saveProjects } from '@/app/actions/profileSections'
import type { Project } from '@/lib/profileSections'

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary'

export default function ProjectsSection({ initial }: { initial: Project[] }) {
  const t = useTranslations('profile')
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [editing, setEditing] = useState(false)

  function addItem() {
    setDraft((prev) => [...prev, { id: crypto.randomUUID(), title: '', description: '', link: '', dates: '' }])
  }
  function updateItem(id: string, patch: Partial<Project>) {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  function removeItem(id: string) {
    setDraft((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <EditableSection
      title={t('sectionProjects')}
      editing={editing}
      onEdit={() => { setDraft(saved); setEditing(true) }}
      onCancel={() => { setDraft(saved); setEditing(false) }}
      onSave={async () => {
        const cleaned = draft.filter((p) => p.title.trim())
        const res = await saveProjects(cleaned)
        if (res.ok) { setSaved(cleaned); setDraft(cleaned); setEditing(false) }
        return res
      }}
      renderView={() =>
        saved.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('noProjectsYet')}</p>
        ) : (
          <div className="space-y-4">
            {saved.map((p) => (
              <div key={p.id}>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">{p.title}</h3>
                  {p.dates && <span className="text-xs text-slate-600 dark:text-slate-400">· {p.dates}</span>}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {p.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">{p.description}</p>}
              </div>
            ))}
          </div>
        )
      }
      renderEdit={() => (
        <div className="space-y-4">
          {draft.map((p) => (
            <div key={p.id} className="border border-slate-200 dark:border-slate-700/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={p.title}
                  onChange={(e) => updateItem(p.id, { title: e.target.value })}
                  placeholder={t('projectTitlePlaceholder')}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeItem(p.id)}
                  aria-label={t('removeProject')}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                value={p.dates}
                onChange={(e) => updateItem(p.id, { dates: e.target.value })}
                placeholder={t('projectDatesPlaceholder')}
                className={inputClass}
              />
              <input
                value={p.link}
                onChange={(e) => updateItem(p.id, { link: e.target.value })}
                placeholder={t('projectLinkPlaceholder')}
                type="url"
                className={inputClass}
              />
              <textarea
                value={p.description}
                onChange={(e) => updateItem(p.id, { description: e.target.value })}
                placeholder={t('projectDescriptionPlaceholder')}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          ))}
          <Button variant="outline" size="sm" type="button" onClick={addItem}>
            <Plus className="w-3.5 h-3.5" /> {t('addProject')}
          </Button>
        </div>
      )}
    />
  )
}
