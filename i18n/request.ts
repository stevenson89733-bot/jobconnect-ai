import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale } from '@/lib/i18n/config'
import enMessages from '../messages/en.json'

type Messages = Record<string, unknown>

// Deep-merges the requested locale's messages onto the English source, so
// any key not yet translated (this is a phased rollout — see
// messages/README.md) resolves to its real English string instead of
// next-intl's raw "namespace.key" fallback text.
function withEnglishFallback(messages: Messages): Messages {
  const merged: Messages = { ...enMessages }
  for (const namespace of Object.keys(merged)) {
    if (typeof merged[namespace] === 'object' && merged[namespace] !== null) {
      merged[namespace] = { ...(merged[namespace] as Messages), ...((messages[namespace] as Messages) ?? {}) }
    }
  }
  return merged
}

// Cookie-based locale resolution — no i18n routing/middleware redirects, so
// every existing route (and the Lot 3 sitemap/canonical-URL work) stays
// untouched. See messages/README.md for the full reasoning.
export default getRequestConfig(async () => {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE

  const localeMessages: Messages =
    locale === DEFAULT_LOCALE ? enMessages : (await import(`../messages/${locale}.json`)).default

  return {
    locale,
    messages: locale === DEFAULT_LOCALE ? localeMessages : withEnglishFallback(localeMessages),
  }
})
