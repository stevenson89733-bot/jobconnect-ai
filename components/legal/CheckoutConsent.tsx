'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

/** Consent line shown under every checkout (Stripe) button on /pricing. */
export default function CheckoutConsent() {
  const t = useTranslations('pricing')
  return (
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
      {t.rich('checkoutConsent', {
        terms: (chunks) => <Link href="/terms" className="underline hover:text-slate-900 dark:hover:text-white">{chunks}</Link>,
        privacy: (chunks) => <Link href="/privacy" className="underline hover:text-slate-900 dark:hover:text-white">{chunks}</Link>,
      })}
    </p>
  )
}
