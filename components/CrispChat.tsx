'use client'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

// Official Crisp snippet, loaded via next/script (strategy="afterInteractive"
// so it never blocks the initial render). Hidden on the auth pages (login,
// register) — everywhere else it mounts normally.
const HIDDEN_PATHS = ['/login', '/register']

export default function CrispChat() {
  const pathname = usePathname()
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

  if (!websiteId || HIDDEN_PATHS.includes(pathname)) return null

  return (
    <>
      <Script id="crisp-init" strategy="afterInteractive">
        {`window.$crisp = [];
window.CRISP_WEBSITE_ID = "${websiteId}";`}
      </Script>
      <Script src="https://client.crisp.chat/l.js" strategy="afterInteractive" async />
    </>
  )
}
