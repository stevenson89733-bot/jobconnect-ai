'use client'
import { useState, useCallback } from 'react'
import CreatePromoForm from './CreatePromoForm'
import PromoCodesTable, { type PromoCode } from './PromoCodesTable'

export default function PromoCodesClient({ initialCodes }: { initialCodes: PromoCode[] }) {
  const [codes, setCodes] = useState<PromoCode[]>(initialCodes)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/promo/admin')
    if (res.ok) {
      const data = await res.json()
      setCodes(data.codes ?? [])
    }
  }, [])

  function handleToggle(id: string, newValue: boolean) {
    setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: newValue } : c))
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">All Codes</h2>
        <PromoCodesTable codes={codes} onToggle={handleToggle} />
      </div>

      <CreatePromoForm onCreated={refresh} />
    </div>
  )
}
