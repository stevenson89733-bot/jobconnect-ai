'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Copy, Check, Share2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { sendReferralEvent, useCopyLink, whatsappUrl } from './ReferralShare'

// Inline (never modal) "Share with 5" invitation on /candidate. The server
// only renders it for candidates who have generated their first AI Job Match
// and haven't snoozed it, and passes the already-built link in.
export default function ReferralCard({ url }: { url: string }) {
  const t = useTranslations('referral')
  const { copied, copyFailed, copy } = useCopyLink(url)
  const [hidden, setHidden] = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    sendReferralEvent('referral_prompt_viewed')
  }, [])

  if (hidden) return null

  const text = t('shareText', { url })

  async function handleShare() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'JobConnect Ai', text })
        setShared(true)
        sendReferralEvent('referral_share_initiated', 'native')
      } catch {
        // share sheet cancelled — nothing to record
      }
      return
    }
    // No native share (most desktops) → WhatsApp web/app.
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer')
    setShared(true)
    sendReferralEvent('referral_share_initiated', 'whatsapp')
  }

  function handleDismiss() {
    setHidden(true)
    fetch('/api/referral/dismiss', { method: 'POST', keepalive: true }).catch(() => {})
  }

  return (
    <Card className="relative">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t('dismissLabel')}
        title={t('dismissLabel')}
        className="absolute top-3 end-3 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <CardContent className="p-6 space-y-4">
        <div className="pe-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-600 dark:text-accent">{t('eyebrow')}</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{t('title')}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={t('yourLink')}
            className={`flex-1 min-w-0 rounded-lg border bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 ${
              copyFailed ? 'border-orange-400' : 'border-slate-200 dark:border-slate-700/50'
            }`}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copy}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('copied') : t('copyLink')}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700/50 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-primary/50 transition-colors"
            >
              <Share2 className="w-4 h-4" /> {t('share')}
            </button>
          </div>
        </div>
        {copyFailed && <p className="text-xs text-orange-600">{t('copyFallback')}</p>}
        {shared && <p className="text-xs text-emerald-600 dark:text-emerald-400" role="status">{t('shared')}</p>}

        <Link href="/candidate/referrals" className="inline-block text-xs font-medium text-primary hover:underline">
          {t('viewDetails')}
        </Link>
      </CardContent>
    </Card>
  )
}
