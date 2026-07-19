'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
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

  if (hidden) return null

  return (
    <>
      <Script id="crisp-init" strategy="afterInteractive">
        {`window.$crisp = [];
window.CRISP_WEBSITE_ID = "${websiteId}";`}
      </Script>
      <Script src="https://client.crisp.chat/l.js" strategy="afterInteractive" async onLoad={() => setCrispLoaded(true)} />
    </>
  )
}
