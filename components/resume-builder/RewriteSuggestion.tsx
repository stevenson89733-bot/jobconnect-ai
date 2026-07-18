'use client'
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

// Accept/reject UI for one AI rewrite suggestion — never applied
// automatically. Accepting calls back to the parent with the new text;
// rejecting just dismisses this card locally.
export default function RewriteSuggestion({
  label,
  suggestion,
  onAccept,
}: {
  label: string
  suggestion: string
  onAccept: (text: string) => void
}) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending')
  const t = useTranslations('resumeBuilder')

  if (status === 'accepted') {
    return (
      <div className="rounded-lg border border-green-300 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 p-3 text-xs text-green-700 dark:text-green-400">
        {t('appliedTo', { section: label })}
      </div>
    )
  }
  if (status === 'rejected') return null

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">{label}</p>
      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-3">{suggestion}</p>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => { onAccept(suggestion); setStatus('accepted') }}
        >
          <Check className="w-3.5 h-3.5" /> {t('accept')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setStatus('rejected')}>
          <X className="w-3.5 h-3.5" /> {t('reject')}
        </Button>
      </div>
    </div>
  )
}
