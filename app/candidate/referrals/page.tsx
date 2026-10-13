import { getTranslations } from 'next-intl/server'
import { UserPlus, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ReferralShare from '@/components/referral/ReferralShare'
import { buildReferralUrl, isReferralRewardsEnabled } from '@/lib/referral/core'
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referral/server'

export const dynamic = 'force-dynamic'

const TARGET = 5

export default async function ReferralsPage() {
  const t = await getTranslations('referral')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null // middleware already redirects unauthenticated visitors

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'candidate') {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-center text-sm text-slate-500">{t('candidatesOnly')}</div>
  }

  let url: string | null = null
  let stats: { registered: number; activated: number } | null = null
  try {
    const admin = createAdminClient()
    const codeRow = await getOrCreateReferralCode(admin, user.id)
    if (codeRow && !codeRow.disabled_at) {
      url = buildReferralUrl(codeRow.code)
      stats = await getReferralStats(admin, user.id)
    }
  } catch {
    // Render the empty/unavailable states below — never fabricated numbers.
  }

  const rewardsEnabled = isReferralRewardsEnabled()
  const progress = stats ? Math.min(stats.registered, TARGET) : 0

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pageTitle')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('pageSubtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-orange-600 dark:text-accent">✦</span> {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {url ? <ReferralShare url={url} /> : <p className="text-sm text-slate-500">{t('noLinkYet')}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('statsTitle')}</CardTitle>
          {stats && <CardDescription>{t('progress', { count: progress, target: TARGET })}</CardDescription>}
        </CardHeader>
        <CardContent>
          {!stats ? (
            <p className="text-sm text-slate-500">{t('statsUnavailable')}</p>
          ) : (
            <div className="space-y-4">
              <div
                className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={TARGET}
                aria-valuenow={progress}
              >
                <div className="h-full bg-primary transition-all" style={{ width: `${(progress / TARGET) * 100}%` }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700/50 p-4" aria-label={t('statRegistrations', { count: stats.registered })}>
                  <UserPlus className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.registered}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('statRegistrationsLabel')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700/50 p-4" aria-label={t('statActivations', { count: stats.activated })}>
                  <Sparkles className="w-5 h-5 text-orange-600 dark:text-accent shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activated}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('statActivationsLabel')}</p>
                  </div>
                </div>
              </div>
              {stats.registered === 0 && <p className="text-sm text-slate-500">{t('statsEmpty')}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {rewardsEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>{t('rewardsTitle')}</CardTitle>
            <CardDescription>{t('rewardsBody')}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('rulesTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-disc ps-5">
            <li>{t('rule1')}</li>
            <li>{t('rule2')}</li>
            <li>{t('rule3')}</li>
            <li>{t('rule4')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
