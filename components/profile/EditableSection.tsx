'use client'
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// One consistent inline-edit pattern reused by every editable section on
// the profile page (Bio, Experience, Education, Skills, Links, and the
// Projects/Certificates/Languages list editors below). The animation is
// purely presentational (Framer Motion height/opacity) — it never delays
// or implies the save itself; `onSave`'s promise is awaited for real
// before the section shows a saved/error state.
export default function EditableSection({
  title,
  description,
  editing,
  renderView,
  renderEdit,
  onEdit,
  onCancel,
  onSave,
}: {
  title: string
  description?: string
  editing: boolean
  renderView: () => ReactNode
  renderEdit: () => ReactNode
  onEdit: () => void
  onCancel: () => void
  onSave: () => Promise<{ ok: boolean; error?: string }>
}) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    try {
      const res = await onSave()
      if (res.ok) {
        setStatus({ type: 'ok', msg: 'Saved.' })
        setTimeout(() => setStatus(null), 2000)
      } else {
        setStatus({ type: 'error', msg: res.error ?? 'Save failed.' })
      }
    } catch {
      setStatus({ type: 'error', msg: 'Save failed — please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>}
          </div>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${title}`}>
              <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} /> Edit
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {renderEdit()}

                {status && (
                  <p className={status.type === 'ok' ? 'text-sm text-green-700 dark:text-green-400' : 'text-sm text-red-600 dark:text-red-400'}>
                    {status.msg}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : <><Check className="w-3.5 h-3.5" /> Save</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderView()}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
