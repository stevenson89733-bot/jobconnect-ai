'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AutoApplySettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirectTo=/auto-apply/settings')
        return
      }

      setUser(user)

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      if (!profileData?.is_premium) {
        setLoading(false)
        return
      }

      // Load auto-apply settings
      const { data: settingsData } = await supabase
        .from('auto_apply_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsData) {
        setSettings(settingsData)
      } else {
        // Create default settings
        const { data: newSettings } = await supabase
          .from('auto_apply_settings')
          .insert({
            user_id: user.id,
            is_active: false,
            max_applications_per_day: 10,
            min_match_score: 60,
          })
          .select()
          .single()

        setSettings(newSettings)
      }

      // Load recent logs
      const { data: logsData } = await supabase
        .from('auto_apply_log')
        .select('id, job_id, status, applied_at, jobs(title, company_name)')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })
        .limit(10)

      setLogs(logsData || [])
      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const handleToggleActive = async () => {
    if (!settings) return
    setSaving(true)

    const { data: updated } = await supabase
      .from('auto_apply_settings')
      .update({ is_active: !settings.is_active })
      .eq('user_id', user.id)
      .select()
      .single()

    setSettings(updated)
    setSaving(false)
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    setSaving(true)

    const { data: updated } = await supabase
      .from('auto_apply_settings')
      .update({
        max_applications_per_day: settings.max_applications_per_day,
        min_match_score: settings.min_match_score,
      })
      .eq('user_id', user.id)
      .select()
      .single()

    setSettings(updated)
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
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Auto-Apply Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure how JobConnect AI applies to jobs on your behalf.
        </p>
      </div>

      {/* Settings Section */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Auto-Apply Settings</h2>

        <div className="space-y-6">
          {/* Toggle Active */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Auto-Apply is {settings?.is_active ? 'active' : 'inactive'}</p>
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
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings?.is_active ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Max Applications Per Day */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Max applications per day: <span className="text-cyan-600">{settings?.max_applications_per_day}</span>
            </label>
            <input
              type="range"
              min="10"
              max="25"
              value={settings?.max_applications_per_day || 10}
              onChange={(e) => setSettings({ ...settings, max_applications_per_day: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              JobConnect AI will send 10–25 applications daily based on your preference.
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
              onChange={(e) => setSettings({ ...settings, min_match_score: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Only apply to jobs with match scores above this threshold.
            </p>
          </div>

          {/* Save Button */}
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
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="py-4 px-4 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {log.jobs?.title || 'Unknown Job'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {log.jobs?.company_name || 'Unknown Company'}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(log.applied_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded ${
                      log.status === 'sent'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {log.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                  </span>
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
