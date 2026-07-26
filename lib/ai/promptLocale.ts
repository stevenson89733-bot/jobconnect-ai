import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_LABELS, isSupportedLocale, type Locale } from '@/lib/i18n/config'

// Server-only. Resolves the same active-locale cookie the rest of the app
// reads (see i18n/request.ts) — used so AI-generated content (resume,
// cover letter, career analysis) is written in the language the candidate
// is actually browsing the site in, instead of defaulting to English
// regardless of what language their form input happens to be in. Kept
// separate from lib/i18n/config.ts (imported by client components) since
// next/headers is server-only.
export function getPromptLocale(): Locale {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value
  return isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE
}

export function getPromptLanguageName(): string {
  return LOCALE_LABELS[getPromptLocale()]
}

// Real, standard letter-closing phrase per language — fixed here rather
// than left to the model, so it's always correct regardless of how well
// the model follows the language instruction for the rest of the letter.
export const LETTER_CLOSING: Record<Locale, string> = {
  en: 'Sincerely,',
  fr: 'Cordialement,',
  es: 'Atentamente,',
  ht: 'Ak respè,',
  de: 'Mit freundlichen Grüßen,',
  pt: 'Atenciosamente,',
  vi: 'Trân trọng,',
}
