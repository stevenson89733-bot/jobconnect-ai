// Single source of truth for supported locales — cookie-based (no locale-
// prefixed routes, see messages/README.md for the tradeoff/reasoning).
export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'ht', 'de', 'pt', 'vi', 'zh', 'ja', 'ko', 'ar'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'locale'

// Locales written right-to-left — drives the <html dir> attribute.
export const RTL_LOCALES: readonly Locale[] = ['ar']
export function isRtlLocale(locale: Locale): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale)
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ht: 'Kreyòl Ayisyen',
  de: 'Deutsch',
  pt: 'Português',
  vi: 'Tiếng Việt',
  zh: '简体中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
}


export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

// Best-effort Accept-Language parser for first-visit auto-detection — picks
// the highest-preference tag (by q-value, default 1) whose base language
// (before any "-region") matches a supported locale. No external library:
// the format is simple enough (`fr-CA,fr;q=0.9,en;q=0.8`) not to need one.
export function detectLocaleFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null

  const candidates = header
    .split(',')
    .map((part) => {
      const [tag, qPart] = part.trim().split(';q=')
      const q = qPart ? parseFloat(qPart) : 1
      return { base: tag.split('-')[0].toLowerCase(), q: Number.isFinite(q) ? q : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { base } of candidates) {
    if (isSupportedLocale(base)) return base
  }
  return null
}
