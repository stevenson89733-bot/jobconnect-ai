'use client'
import { useTranslations } from 'next-intl'
import { useCountry } from '@/components/country/CountryProvider'
import { useExchangeRates } from '@/lib/useExchangeRates'
import { convertFromUsd, formatCompactCurrency } from '@/lib/convertSalary'
import { getCountry } from '@/lib/countries'

// Real conversion of the job's real stored USD salary_min/salary_max —
// never reparsed from the display-only salary_label string. Always keeps
// the original USD figure visible alongside the converted one, and falls
// back to USD-only (no invented number) when no rate is available yet or
// for either provider.
export default function ConvertedSalary({
  salaryMin,
  salaryMax,
  salaryLabel,
}: {
  salaryMin: number | null
  salaryMax: number | null
  salaryLabel: string | null
}) {
  const t = useTranslations('jobs')
  const { country } = useCountry()
  const rates = useExchangeRates()
  const currency = getCountry(country).currency

  if (!salaryLabel) return null
  if (currency === 'USD' || salaryMin == null || salaryMax == null || !rates) {
    return <>{salaryLabel}</>
  }

  const minConverted = convertFromUsd(salaryMin, currency, rates.rates)
  const maxConverted = convertFromUsd(salaryMax, currency, rates.rates)

  if (!minConverted || !maxConverted) {
    // No real rate available anywhere (primary and fallback both missing
    // this currency) — honest USD-only display, no invented number.
    return <>{salaryLabel}</>
  }

  const convertedLabel = `${formatCompactCurrency(minConverted.amount, currency)}–${formatCompactCurrency(maxConverted.amount, currency)}`

  return (
    <span>
      {convertedLabel}
      <span className="text-slate-500 dark:text-slate-500 font-normal"> ({t('approxUsd', { amount: salaryLabel })})</span>
    </span>
  )
}
