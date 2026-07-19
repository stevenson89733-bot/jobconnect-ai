'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

// Official Crisp snippet, loaded via next/script (strategy="afterInteractive"
// so it never blocks the initial render). Hidden on the auth pages (login,
// register) — everywhere else it mounts normally.
const HIDDEN_PATHS = ['/login', '/register']

type CrispUser = { email: string; nickname: string } | null

declare global {
  interface Window {
    $crisp?: unknown[] & { push: (cmd: unknown[]) => void }
  }
}

export default function CrispChat() {
  const pathname = usePathname()
  const locale = useLocale()
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
  const hidden = !websiteId || HIDDEN_PATHS.includes(pathname)

  const [crispLoaded, setCrispLoaded] = useState(false)
  // undefined = not checked yet, null = signed out — only push identification
  // once we've actually resolved the real session, never a guessed default.
  const [crispUser, setCrispUser] = useState<CrispUser | undefined>(undefined)

  useEffect(() => {
    if (hidden) return
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) {
        setCrispUser(null)
        return
      }
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single()
      const nickname = profile?.full_name?.trim() || user.email
      setCrispUser({ email: user.email, nickname })
    })
  }, [hidden])

  // Identify only once both the real Crisp queue (post script-load) and the
  // real signed-in user are known — never pushed on a guess or before Crisp
  // is actually ready to receive it.
  useEffect(() => {
    if (!crispLoaded || !crispUser) return
    window.$crisp?.push(['set', 'user:email', [crispUser.email]])
    window.$crisp?.push(['set', 'user:nickname', [crispUser.nickname]])
  }, [crispLoaded, crispUser])

  // Locale sync — Crisp's own documented runtime config command (verified
  // against docs.crisp.chat, not assumed): $crisp.push(["config", "locale",
  // <ISO 639-1 code>]), async-safe so it can run any time after the widget
  // has loaded, including a later change. The app's own locale codes (en,
  // fr, es, ht, de, pt, vi) are already ISO 639-1 so no remapping is
  // needed. Re-runs whenever `locale` changes — e.g. LanguageSwitcher's
  // router.refresh() re-renders this component with the new locale from
  // NextIntlClientProvider, no full page reload required. If Crisp doesn't
  // actually have translations for a given code (confirmed by real-browser
  // testing per language, not assumed), it falls back to its own default
  // (English) rather than erroring — verified empirically since Crisp
  // publishes no official supported-language list.
  useEffect(() => {
    if (!crispLoaded) return
    window.$crisp?.push(['config', 'locale', [locale]])
  }, [crispLoaded, locale])

  if (hidden) return null

  return (
    <>
      <Script id="crisp-init" strategy="afterInteractive">
        {`window.$crisp = [];
window.CRISP_WEBSITE_ID = "${websiteId}";
window.CRISP_RUNTIME_CONFIG = { locale: "${locale}" };`}
      </Script>
      <Script src="https://client.crisp.chat/l.js" strategy="afterInteractive" async onLoad={() => setCrispLoaded(true)} />
    </>
  )
}
