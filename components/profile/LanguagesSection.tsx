'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EditableSection from './EditableSection'
import { saveLanguages } from '@/app/actions/profileSections'
import { PROFICIENCY_LEVELS, type Language } from '@/lib/profileSections'

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary'

export default function LanguagesSection({ initial }: { initial: Language[] }) {
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [editing, setEditing] = useState(false)

  function addItem() {
    setDraft((prev) => [...prev, { id: crypto.randomUUID(), name: '', proficiency: 'Conversational' }])
  }
  function updateItem(id: string, patch: Partial<Language>) {
    setDraft((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  function removeItem(id: string) {
    setDraft((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <EditableSection
      title="Languages"
      editing={editing}
      onEdit={() => { setDraft(saved); setEditing(true) }}
      onCancel={() => { setDraft(saved); setEditing(false) }}
      onSave={async () => {
        const cleaned = draft.filter((l) => l.name.trim())
        const res = await saveLanguages(cleaned)
        if (res.ok) { setSaved(cleaned); setDraft(cleaned); setEditing(false) }
        return res
      }}
      renderView={() =>
        saved.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-500">No languages added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {saved.map((l) => (
              <Badge key={l.id}>{l.name} — {l.proficiency}</Badge>
            ))}
          </div>
        )
      }
      renderEdit={() => (
        <div className="space-y-3">
          {draft.map((l) => (
            <div key={l.id} className="flex items-center gap-2">
              <input
                value={l.name}
                onChange={(e) => updateItem(l.id, { name: e.target.value })}
                placeholder="Language"
                className={inputClass}
              />
              <select
                value={l.proficiency}
                onChange={(e) => updateItem(l.id, { proficiency: e.target.value as Language['proficiency'] })}
                className={inputClass}
              >
                {PROFICIENCY_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              <button
                type="button"
                onClick={() => removeItem(l.id)}
                aria-label="Remove language"
                className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" type="button" onClick={addItem}>
            <Plus className="w-3.5 h-3.5" /> Add Language
          </Button>
        </div>
      )}
    />
  )
}
