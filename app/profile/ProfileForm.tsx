'use client'
import { useState } from 'react'
import Link from 'next/link'
import { updateProfile, type ProfileFields } from '@/app/actions/profile'

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'

export default function ProfileForm({ initial, email }: { initial: ProfileFields; email: string }) {
  const [form, setForm] = useState<ProfileFields>(initial)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)

  function set<K extends keyof ProfileFields>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setStatus(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const res = await updateProfile(form)
      if (res.ok) setStatus({ type: 'ok', msg: 'Profile saved.' })
      else setStatus({ type: 'error', msg: res.error ?? 'Save failed.' })
    } catch {
      setStatus({ type: 'error', msg: 'Save failed — please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-500 mb-3">
          <Link href="/candidate" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Edit Profile</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Edit Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">Keep your candidate profile up to date.</p>
      </div>

      <form onSubmit={handleSave} className="card space-y-5">
        {/* Email (read-only, managed by auth) */}
        <div>
          <label className={labelClass}>Email</label>
          <input
            value={email}
            disabled
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className={labelClass}>Full Name</label>
          <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Doe" className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Professional Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Senior Frontend Engineer" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Remote · Paris, France" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Bio</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="A short summary about you and what you're looking for…" className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>Work Experience</label>
          <textarea value={form.experience} onChange={e => set('experience', e.target.value)} rows={5} placeholder="Your roles, companies, dates, and key achievements…" className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>Skills</label>
          <textarea value={form.skills} onChange={e => set('skills', e.target.value)} rows={2} placeholder="TypeScript, React, Node.js, PostgreSQL, AWS…" className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>Education</label>
          <textarea value={form.education} onChange={e => set('education', e.target.value)} rows={2} placeholder="B.S. Computer Science, MIT, 2018…" className={`${inputClass} resize-none`} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} type="url" placeholder="https://linkedin.com/in/you" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input value={form.github_url} onChange={e => set('github_url', e.target.value)} type="url" placeholder="https://github.com/you" className={inputClass} />
          </div>
        </div>

        {status && (
          <p className={status.type === 'ok'
            ? 'text-sm text-green-700 dark:text-green-400'
            : 'text-sm text-red-600 dark:text-red-400'}>
            {status.msg}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-50">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </span>
            ) : 'Save'}
          </button>
          <Link href="/candidate" className="btn-outline text-sm px-6 py-2.5">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
