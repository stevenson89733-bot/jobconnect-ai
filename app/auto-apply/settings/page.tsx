'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DAILY_LIMIT_OPTIONS = [3, 5, 10, 20] as const

type Log = {
  id: string
  job_id: string | null
  status: string
  applied_at: string
  cover_letter: string | null
  match_score: number | null
  cv_section: string | null
  jobs: { title: string; company_name: string } | null
}

function PreviewModal({ log, onClose }: { log: Log; onClose: () => void }) {
  const firstSentence = log.cover_letter
    ? log.cover_letter.split(/(?<=[.!?])\s+/)[0] ?? log.cover_letter.slice(0, 160)
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {log.jobs?.title ?? 'Application Preview'}
            </h3>
            <p className="text-sm text-slate-500">{log.jobs?.company_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Match score */}
        {log.match_score != null && (
          <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
            <div className="text-2xl font-extrabold text-cyan-600">{log.match_score}%</div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Match Score</p>
              <p className="text-xs text-slate-500">Based on your profile vs. job requirements</p>
            </div>
          </div>
        )}

        {/* CV section matched */}
        {log.cv_section && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CV Section Matched</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{log.cv_section}</p>
          </div>
        )}

        {/* Cover letter preview */}
        {firstSentence && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Letter Opening</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{firstSentence}"</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              log.status === 'sent'
                ? 'bg-green-100 text-green-700'
                : log.status === 'pending_review'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {log.status === 'sent' ? '✓ Sent' : log.status === 'pending_review' ? '⏳ Pending Review' : log.status}
          </span>
          <span className="text-xs text-slate-400 flex items-center">
            {new Date(log.applied_at).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AutoApplySettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [profile, setProfile] = useState<{ is_premium: boolean } | null>(null)
  const [settings, setSettings] = useState<{
    is_active: boolean
    max_applications_per_day: number
    min_match_score: number
    review_before_send: boolean
    daily_apply_limit: number
  } | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewLog, setPreviewLog] = useState<Log | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/auto-apply/settings'); return }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('user_id', user.id)
        .single()
      setProfile(profileData)

      if (!profileData?.is_premium) { setLoading(false); return }

      const { data: settingsData } = await supabase
        .from('auto_apply_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsData) {
        setSettings({
          is_active: settingsData.is_active,
          max_applications_per_day: settingsData.max_applications_per_day ?? 10,
          min_match_score: settingsData.min_match_score ?? 60,
          review_before_send: settingsData.review_before_send ?? true,
          daily_apply_limit: settingsData.daily_apply_limit ?? 5,
        })
      } else {
        const { data: newSettings } = await supabase
          .from('auto_apply_settings')
          .insert({
            user_id: user.id,
            is_active: false,
            max_applications_per_day: 10,
            min_match_score: 60,
            review_before_send: true,
            daily_apply_limit: 5,
          })
          .select()
          .single()
        if (newSettings) setSettings({
          is_active: newSettings.is_active,
          max_applications_per_day: newSettings.max_applications_per_day,
          min_match_score: newSettings.min_match_score,
          review_before_send: newSettings.review_before_send ?? true,
          daily_apply_limit: newSettings.daily_apply_limit ?? 5,
        })
      }

      const { data: logsData } = await supabase
        .from('auto_apply_log')
        .select('id, job_id, status, applied_at, cover_letter, match_score, cv_section, jobs(title, company_name)')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })
        .limit(10)
      setLogs(((logsData ?? []) as unknown as Log[]))
      setLoading(false)
    }
    loadData()
  }, [supabase, router])

  const handleToggleActive = async () => {
    if (!settings || !user) return
    setSaving(true)
    const { data: updated } = await supabase
      .from('auto_apply_settings')
      .update({ is_active: !settings.is_active })
      .eq('user_id', user.id)
      .select()
      .single()
    if (updated) setSettings(s => s ? { ...s, is_active: updated.is_active } : s)
    setSaving(false)
  }

  const handleSaveSettings = async () => {
    if (!settings || !user) return
    setSaving(true)
    const { data: updated } = await supabase
      .from('auto_apply_settings')
      .update({
        max_applications_per_day: settings.max_applications_per_day,
        min_match_score: settings.min_match_score,
        review_before_send: settings.review_before_send,
        daily_apply_limit: settings.daily_apply_limit,
      })
      .eq('user_id', user.id)
      .select()
      .single()
    if (updated) setSettings(s => s ? {
      ...s,
      review_before_send: updated.review_before_send ?? true,
      daily_apply_limit: updated.daily_apply_limit ?? 5,
    } : s)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!profile?.is_premium) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="card border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔒</div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Auto-Apply is a Pro Feature
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Upgrade to JobConnect Pro to automatically apply to matching jobs every day.
              </p>
              <a href="/pricing#candidates" className="btn-primary text-sm py-2 px-4 inline-block">
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {previewLog && <PreviewModal log={previewLog} onClose={() => setPreviewLog(null)} />}

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Auto-Apply Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure how JobConnect AI applies to jobs on your behalf.
        </p>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Auto-Apply Settings</h2>

        <div className="space-y-6">
          {/* Toggle Active */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Auto-Apply is {settings?.is_active ? 'active' : 'inactive'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {settings?.is_active ? 'Daily applications are being sent' : 'Enable to start auto-applying'}
              </p>
            </div>
            <button
              onClick={handleToggleActive}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings?.is_active ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
              } disabled:opacity-50`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings?.is_active ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Review Before Send */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Review before send</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {settings?.review_before_send
                  ? 'Applications queue for your approval before sending'
                  : 'Applications are submitted automatically'}
              </p>
            </div>
            <button
              onClick={() => setSettings(s => s ? { ...s, review_before_send: !s.review_before_send } : s)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings?.review_before_send ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings?.review_before_send ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Daily Apply Limit */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Max applications per day
            </label>
            <div className="flex gap-2">
              {DAILY_LIMIT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSettings(s => s ? { ...s, daily_apply_limit: n } : s)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    settings?.daily_apply_limit === n
                      ? 'bg-cyan-500 border-cyan-500 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-cyan-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              The cron will stop after this many successful submissions today.
            </p>
          </div>

          {/* Max Applications Per Day (range — kept for backwards compat) */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Application scan window: <span className="text-cyan-600">{settings?.max_applications_per_day}</span> jobs checked
            </label>
            <input
              type="range"
              min="10"
              max="25"
              value={settings?.max_applications_per_day || 10}
              onChange={(e) => setSettings(s => s ? { ...s, max_applications_per_day: parseInt(e.target.value) } : s)}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Number of jobs scanned each run (separate from the send limit above).
            </p>
          </div>

          {/* Minimum Match Score */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Minimum match score: <span className="text-cyan-600">{settings?.min_match_score}%</span>
            </label>
            <input
              type="range"
              min="40"
              max="90"
              value={settings?.min_match_score || 60}
              onChange={(e) => setSettings(s => s ? { ...s, min_match_score: parseInt(e.target.value) } : s)}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Only apply to jobs with match scores above this threshold.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Auto-Applications</h2>

        {logs.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            No applications sent yet. Auto-Apply will start after you enable it above.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {logs.map((log) => (
              <div
                key={log.id}
                className="py-4 px-4 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => (log.cover_letter || log.match_score != null) && setPreviewLog(log)}
                    className="text-left w-full"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate hover:text-cyan-600 transition-colors">
                      {log.jobs?.title || 'Unknown Job'}
                    </p>
                  </button>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {log.jobs?.company_name || 'Unknown Company'}
                  </p>
                  {log.match_score != null && (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-cyan-600">
                      {log.match_score}% match
                    </span>
                  )}
                </div>
                <div className="ml-4 text-right shrink-0">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(log.applied_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded ${
                    log.status === 'sent'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : log.status === 'pending_review'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {log.status === 'sent' ? '✓ Sent'
                      : log.status === 'pending_review' ? '⏳ Review'
                      : '✗ ' + log.status}
                  </span>
                  {(log.cover_letter || log.match_score != null) && (
                    <button
                      onClick={() => setPreviewLog(log)}
                      className="block mt-1 text-[11px] text-cyan-500 hover:text-cyan-700 transition-colors"
                    >
                      View details →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {logs.length > 0 && (
          <a
            href="/candidate/applications"
            className="btn-outline text-sm py-2 px-4 mt-4 block text-center w-full"
          >
            View All Applications →
          </a>
        )}
      </div>
    </div>
  )
}
