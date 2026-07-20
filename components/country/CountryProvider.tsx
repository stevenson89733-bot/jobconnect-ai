'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { COUNTRY_COOKIE, DEFAULT_COUNTRY, type CountryCode } from '@/lib/countries'

type CountryContextValue = { country: CountryCode; setCountry: (next: CountryCode) => void }

const CountryContext = createContext<CountryContextValue>({
  country: DEFAULT_COUNTRY,
  setCountry: () => {},
})

// Display-only preference (currency conversion), independent from the
// locale/i18n system by design — no router.refresh() needed since nothing
// server-rendered depends on it; every consumer (CountrySelector,
// converted-salary display) is a Client Component reading this context.
export function CountryProvider({ initialCountry, children }: { initialCountry: CountryCode; children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>(initialCountry)

  function setCountry(next: CountryCode) {
    document.cookie = `${COUNTRY_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`
    setCountryState(next)
  }

  return <CountryContext.Provider value={{ country, setCountry }}>{children}</CountryContext.Provider>
}

export function useCountry() {
  return useContext(CountryContext)
}
