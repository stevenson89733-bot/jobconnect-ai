import type { Locale } from '@/lib/i18n/config'

/**
 * BCP-47 tags for the Web Speech API (SpeechRecognition/SpeechSynthesis),
 * mapped from our supported locales. Deliberately no entry for 'ht' — no
 * mainstream browser's speech engine reliably supports Haitian Creole, and
 * silently falling back to another language would produce a transcription
 * that looks plausible but is actually wrong, which is worse than just not
 * offering voice mode for that locale.
 */
const SPEECH_LANG_BY_LOCALE: Partial<Record<Locale, string>> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  pt: 'pt-PT',
  vi: 'vi-VN',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ar: 'ar-SA',
}

export function getSpeechLang(locale: Locale): string | null {
  return SPEECH_LANG_BY_LOCALE[locale] ?? null
}
