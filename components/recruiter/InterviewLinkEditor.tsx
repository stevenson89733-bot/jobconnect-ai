'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function InterviewLinkEditor({
  initialLink,
  isPro,
}: {
  initialLink: string | null
  isPro: boolean
}) {
  const [value, setValue] = useState(initialLink ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  if (!isPro) {
    return (
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">📅</span>
          <h2 className="font-semibold text-slate-900 dark:text-white">Interview Scheduling Link</h2>
          <span className="badge bg-[#57C7E3]/10 text-[#57C7E3] border border-[#57C7E3]/30 text-[10px] font-bold px-1.5 py-0.5">Pro</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Share your Calendly, Cal.com, or any scheduling link with candidates directly from your company page.
        </p>
        <Link href="/pricing#employers" className="btn-primary text-sm py-2 px-4 inline-flex">
          ✦ Upgrade to Pro
        </Link>
      </div>
    )
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSaving(false); return }
    const { error: err } = await supabase
      .from('profiles')
      .update({ meeting_link: value.trim() || null })
      .eq('user_id', user.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">📅</span>
        <h2 className="font-semibold text-slate-900 dark:text-white">Interview Scheduling Link</h2>
        <span className="badge bg-[#57C7E3]/10 text-[#57C7E3] border border-[#57C7E3]/30 text-[10px] font-bold px-1.5 py-0.5">Pro</span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Paste your Calendly, Cal.com, or other scheduling URL. Candidates will see a &ldquo;Schedule an Interview&rdquo; button on your company page.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={e => { setValue(e.target.value); setSaved(false) }}
          placeholder="https://calendly.com/yourname/30min"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>}
      {value && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Visible at: <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-blue-400 hover:underline truncate">{value}</a>
        </p>
      )}
    </div>
  )
}
