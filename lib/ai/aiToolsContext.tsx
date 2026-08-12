'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'

type AIToolsSession = {
  lastTargetRole: string
  lastTargetCountry: string
  update: (role: string, country: string) => void
}

const AIToolsContext = createContext<AIToolsSession>({
  lastTargetRole: '',
  lastTargetCountry: '',
  update: () => {},
})

export function AIToolsProvider({ children }: { children: ReactNode }) {
  const [lastTargetRole, setLastTargetRole] = useState('')
  const [lastTargetCountry, setLastTargetCountry] = useState('')

  function update(role: string, country: string) {
    if (role) setLastTargetRole(role)
    if (country) setLastTargetCountry(country)
  }

  return (
    <AIToolsContext.Provider value={{ lastTargetRole, lastTargetCountry, update }}>
      {children}
    </AIToolsContext.Provider>
  )
}

export function useAIToolsSession() {
  return useContext(AIToolsContext)
}
