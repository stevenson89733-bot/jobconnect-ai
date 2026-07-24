// Country selector — display preference only (currency conversion for job
// salaries). Deliberately independent from lib/i18n/config.ts's locale list:
// no coupling by design (a candidate can browse in English while pricing
// displays in EUR, etc.). Selecting a country drives ONLY the currency below
// (single source of truth — currency is derived from country, never stored
// separately, so the two can never drift out of sync); it never touches the
// interface language, which is controlled entirely by LanguageSwitcher.
export const COUNTRY_COOKIE = 'country'
export const DEFAULT_COUNTRY = 'US'

export type CountryCode =
  | 'AE' | 'AR' | 'AT' | 'AU' | 'BE' | 'BH' | 'BR' | 'CA' | 'CH' | 'CL'
  | 'CN' | 'CO' | 'CR' | 'CZ' | 'DE' | 'DK' | 'EC' | 'EG' | 'ES' | 'FI'
  | 'FR' | 'GB' | 'GR' | 'HK' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IN'
  | 'IT' | 'JP' | 'KR' | 'KW' | 'LU' | 'MA' | 'MX' | 'MY' | 'NG' | 'NL'
  | 'NO' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PH' | 'PK' | 'PL' | 'PT' | 'QA'
  | 'RO' | 'SA' | 'SE' | 'SG' | 'TH' | 'TR' | 'TW' | 'UA' | 'US' | 'UY'
  | 'VE' | 'VN' | 'ZA'

export type Country = { code: CountryCode; currency: string }

// Real ISO 4217 currency per country (no invented codes), documented inline
// by real country name next to each entry. Where a country doesn't float its
// own currency (e.g. Ecuador officially uses the US dollar), the real
// official currency is used rather than a guess. Flags are never hardcoded —
// derived from the ISO 3166-1 alpha-2 code itself (see countryFlag below), so
// there's no separate flag value that could drift or be mistyped.
export const COUNTRIES: Country[] = [
  { code: 'AE', currency: 'AED' }, // United Arab Emirates
  { code: 'AR', currency: 'ARS' }, // Argentina
  { code: 'AT', currency: 'EUR' }, // Austria
  { code: 'AU', currency: 'AUD' }, // Australia
  { code: 'BE', currency: 'EUR' }, // Belgium
  { code: 'BH', currency: 'BHD' }, // Bahrain
  { code: 'BR', currency: 'BRL' }, // Brazil
  { code: 'CA', currency: 'CAD' }, // Canada
  { code: 'CH', currency: 'CHF' }, // Switzerland
  { code: 'CL', currency: 'CLP' }, // Chile
  { code: 'CN', currency: 'CNY' }, // China
  { code: 'CO', currency: 'COP' }, // Colombia
  { code: 'CR', currency: 'CRC' }, // Costa Rica
  { code: 'CZ', currency: 'CZK' }, // Czech Republic
  { code: 'DE', currency: 'EUR' }, // Germany
  { code: 'DK', currency: 'DKK' }, // Denmark
  { code: 'EC', currency: 'USD' }, // Ecuador (officially uses USD)
  { code: 'EG', currency: 'EGP' }, // Egypt
  { code: 'ES', currency: 'EUR' }, // Spain
  { code: 'FI', currency: 'EUR' }, // Finland
  { code: 'FR', currency: 'EUR' }, // France
  { code: 'GB', currency: 'GBP' }, // United Kingdom
  { code: 'GR', currency: 'EUR' }, // Greece
  { code: 'HK', currency: 'HKD' }, // Hong Kong
  { code: 'HT', currency: 'HTG' }, // Haiti
  { code: 'HU', currency: 'HUF' }, // Hungary
  { code: 'ID', currency: 'IDR' }, // Indonesia
  { code: 'IE', currency: 'EUR' }, // Ireland
  { code: 'IL', currency: 'ILS' }, // Israel
  { code: 'IN', currency: 'INR' }, // India
  { code: 'IT', currency: 'EUR' }, // Italy
  { code: 'JP', currency: 'JPY' }, // Japan
  { code: 'KR', currency: 'KRW' }, // South Korea
  { code: 'KW', currency: 'KWD' }, // Kuwait
  { code: 'LU', currency: 'EUR' }, // Luxembourg
  { code: 'MA', currency: 'MAD' }, // Morocco
  { code: 'MX', currency: 'MXN' }, // Mexico
  { code: 'MY', currency: 'MYR' }, // Malaysia
  { code: 'NG', currency: 'NGN' }, // Nigeria
  { code: 'NL', currency: 'EUR' }, // Netherlands
  { code: 'NO', currency: 'NOK' }, // Norway
  { code: 'NZ', currency: 'NZD' }, // New Zealand
  { code: 'OM', currency: 'OMR' }, // Oman
  { code: 'PA', currency: 'PAB' }, // Panama
  { code: 'PE', currency: 'PEN' }, // Peru
  { code: 'PH', currency: 'PHP' }, // Philippines
  { code: 'PK', currency: 'PKR' }, // Pakistan
  { code: 'PL', currency: 'PLN' }, // Poland
  { code: 'PT', currency: 'EUR' }, // Portugal
  { code: 'QA', currency: 'QAR' }, // Qatar
  { code: 'RO', currency: 'RON' }, // Romania
  { code: 'SA', currency: 'SAR' }, // Saudi Arabia
  { code: 'SE', currency: 'SEK' }, // Sweden
  { code: 'SG', currency: 'SGD' }, // Singapore
  { code: 'TH', currency: 'THB' }, // Thailand
  { code: 'TR', currency: 'TRY' }, // Turkey
  { code: 'TW', currency: 'TWD' }, // Taiwan
  { code: 'UA', currency: 'UAH' }, // Ukraine
  { code: 'US', currency: 'USD' }, // United States
  { code: 'UY', currency: 'UYU' }, // Uruguay
  { code: 'VE', currency: 'VES' }, // Venezuela
  { code: 'VN', currency: 'VND' }, // Vietnam
  { code: 'ZA', currency: 'ZAR' }, // South Africa
]

// Regional indicator emoji flag, computed from the ISO code itself rather
// than stored per-entry — guarantees the flag always matches the real code.
export function countryFlag(code: CountryCode): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

export function isCountryCode(value: string | undefined | null): value is CountryCode {
  return !!value && COUNTRIES.some((c) => c.code === value)
}

// Fallback: unknown/missing code resolves to DEFAULT_COUNTRY (US/USD), never
// an error and never an arbitrary array entry.
export function getCountry(code: string | undefined | null): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY)!
}
