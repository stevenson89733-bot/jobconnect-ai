'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, Share2, Mail, MessageCircle, Briefcase } from 'lucide-react'
import { copyToClipboard } from '@/lib/clipboard'

export type ShareChannel = 'copy' | 'native' | 'whatsapp' | 'linkedin' | 'email'
type ClientEvent = 'referral_prompt_viewed' | 'referral_link_copied' | 'referral_share_initiated'

/** Fire-and-forget; analytics must never break the share action. */
export function sendReferralEvent(event: ClientEvent, channel?: ShareChannel) {
  fetch('/api/referral/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(channel ? { event, channel } : { event }),
    keepalive: true,
  }).catch(() => {})
}

export function whatsappUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Copy-to-clipboard with the "Copied" state and event — shared by card and page. */
export function useCopyLink(url: string) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  async function copy() {
    const res = await copyToClipboard(url)
    if (res.ok) {
      setCopied(true)
      setCopyFailed(false)
      sendReferralEvent('referral_link_copied', 'copy')
      setTimeout(() => setCopied(false), 2500)
    } else {
      // Tier 3 of lib/clipboard: let the user select the link manually.
      setCopyFailed(true)
    }
  }
  return { copied, copyFailed, copy }
}

/** Full share panel used on /candidate/referrals. */
export default function ReferralShare({ url }: { url: string }) {
  const t = useTranslations('referral')
  const { copied, copyFailed, copy } = useCopyLink(url)
  const [shared, setShared] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const text = t('shareText', { url })

  async function handleNativeShare() {
    try {
      await navigator.share({ title: 'JobConnect Ai', text })
      setShared(true)
      sendReferralEvent('referral_share_initiated', 'native')
    } catch {
      // user cancelled the share sheet — not an error, nothing to record
    }
  }

  function onExternal(channel: ShareChannel) {
    setShared(true)
    sendReferralEvent('referral_share_initiated', channel)
  }

  const enc = encodeURIComponent
  const links = [
    { channel: 'whatsapp' as const, label: t('shareWhatsApp'), icon: MessageCircle, href: whatsappUrl(text) },
    { channel: 'linkedin' as const, label: t('shareLinkedIn'), icon: Briefcase, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { channel: 'email' as const, label: t('emailLabel'), icon: Mail, href: `mailto:?subject=${enc(t('emailSubject'))}&body=${enc(text)}` },
  ]

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">{t('yourLink')}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={t('yourLink')}
          className={`flex-1 min-w-0 rounded-lg border bg-white dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 ${
            copyFailed ? 'border-orange-400' : 'border-slate-200 dark:border-slate-700/50'
          }`}
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t('copied') : t('copyLink')}
        </button>
      </div>
      {copyFailed && <p className="text-xs text-orange-600">{t('copyFallback')}</p>}

      <div className="flex flex-wrap gap-2">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary/50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> {t('share')}
          </button>
        )}
        {links.map(({ channel, label, icon: Icon, href }) => (
          <a
            key={channel}
            href={href}
            target={channel === 'email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            onClick={() => onExternal(channel)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary/50 transition-colors"
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </a>
        ))}
      </div>
      {shared && <p className="text-xs text-emerald-600 dark:text-emerald-400" role="status">{t('shared')}</p>}
    </div>
  )
}
