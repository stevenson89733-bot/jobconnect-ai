// Country selector — display preference only (currency conversion for job
// salaries). Deliberately independent from lib/i18n/config.ts's locale list:
// no coupling by design (a candidate can browse in English while pricing
// displays in EUR, etc.).
export const COUNTRY_COOKIE = 'country'
export const DEFAULT_COUNTRY = 'US'

export type CountryCode =
  | 'US' | 'CA'
  | 'FR' | 'DE' | 'ES' | 'PT' | 'NL' | 'IT' | 'GB'
  | 'BR' | 'MX' | 'AR'
  | 'VN' | 'IN' | 'JP' | 'SG' | 'AU'
  | 'HT'

export type Country = { code: CountryCode; flag: string; currency: string }

// Major global markets per the brief: North America, major EU markets +
// UK, major LatAm markets, major Asia-Pacific markets, and Haiti
// (Caribbean). Country display names are translated (messages.countries.*
// namespace); currency codes are real ISO 4217, not invented.
export const COUNTRIES: Country[] = [
  { code: 'US', flag: '🇺🇸', currency: 'USD' },
  { code: 'CA', flag: '🇨🇦', currency: 'CAD' },
  { code: 'GB', flag: '🇬🇧', currency: 'GBP' },
  { code: 'FR', flag: '🇫🇷', currency: 'EUR' },
  { code: 'DE', flag: '🇩🇪', currency: 'EUR' },
  { code: 'ES', flag: '🇪🇸', currency: 'EUR' },
  { code: 'PT', flag: '🇵🇹', currency: 'EUR' },
  { code: 'NL', flag: '🇳🇱', currency: 'EUR' },
  { code: 'IT', flag: '🇮🇹', currency: 'EUR' },
  { code: 'BR', flag: '🇧🇷', currency: 'BRL' },
  { code: 'MX', flag: '🇲🇽', currency: 'MXN' },
  { code: 'AR', flag: '🇦🇷', currency: 'ARS' },
  { code: 'VN', flag: '🇻🇳', currency: 'VND' },
  { code: 'IN', flag: '🇮🇳', currency: 'INR' },
  { code: 'JP', flag: '🇯🇵', currency: 'JPY' },
  { code: 'SG', flag: '🇸🇬', currency: 'SGD' },
  { code: 'AU', flag: '🇦🇺', currency: 'AUD' },
  { code: 'HT', flag: '🇭🇹', currency: 'HTG' },
]

export function isCountryCode(value: string | undefined | null): value is CountryCode {
  return !!value && COUNTRIES.some((c) => c.code === value)
}

export function getCountry(code: string | undefined | null): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]
}
