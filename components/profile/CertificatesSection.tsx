'use client'
import { useState } from 'react'
import { Plus, Trash2, ExternalLink, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EditableSection from './EditableSection'
import { saveCertificates } from '@/app/actions/profileSections'
import type { Certificate } from '@/lib/profileSections'

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary'

export default function CertificatesSection({ initial }: { initial: Certificate[] }) {
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [editing, setEditing] = useState(false)

  function addItem() {
    setDraft((prev) => [...prev, { id: crypto.randomUUID(), name: '', issuer: '', date: '', credentialUrl: '' }])
  }
  function updateItem(id: string, patch: Partial<Certificate>) {
    setDraft((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function removeItem(id: string) {
    setDraft((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <EditableSection
      title="Certificates"
      editing={editing}
      onEdit={() => { setDraft(saved); setEditing(true) }}
      onCancel={() => { setDraft(saved); setEditing(false) }}
      onSave={async () => {
        const cleaned = draft.filter((c) => c.name.trim())
        const res = await saveCertificates(cleaned)
        if (res.ok) { setSaved(cleaned); setDraft(cleaned); setEditing(false) }
        return res
      }}
      renderView={() =>
        saved.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-500">No certificates added yet.</p>
        ) : (
          <div className="space-y-3">
            {saved.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={1.75} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</h3>
                    {c.credentialUrl && (
                      <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {[c.issuer, c.date].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      }
      renderEdit={() => (
        <div className="space-y-4">
          {draft.map((c) => (
            <div key={c.id} className="border border-slate-200 dark:border-slate-700/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={c.name}
                  onChange={(e) => updateItem(c.id, { name: e.target.value })}
                  placeholder="Certificate name"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeItem(c.id)}
                  aria-label="Remove certificate"
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={c.issuer}
                  onChange={(e) => updateItem(c.id, { issuer: e.target.value })}
                  placeholder="Issuer"
                  className={inputClass}
                />
                <input
                  value={c.date}
                  onChange={(e) => updateItem(c.id, { date: e.target.value })}
                  placeholder="Date"
                  className={inputClass}
                />
              </div>
              <input
                value={c.credentialUrl}
                onChange={(e) => updateItem(c.id, { credentialUrl: e.target.value })}
                placeholder="Credential URL (optional)"
                type="url"
                className={inputClass}
              />
            </div>
          ))}
          <Button variant="outline" size="sm" type="button" onClick={addItem}>
            <Plus className="w-3.5 h-3.5" /> Add Certificate
          </Button>
        </div>
      )}
    />
  )
}
