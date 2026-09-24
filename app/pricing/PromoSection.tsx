'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PromoSection({
  upgradeLabel,
  loadingLabel,
  havePromoCode,
  placeholder,
  applyLabel,
  candidateSuccess,
  employerSuccess,
}: {
  upgradeLabel: string
  loadingLabel: string
  havePromoCode: string
  placeholder: string
  applyLabel: string
  candidateSuccess: string
  employerSuccess: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showField, setShowField] = useState(false)
  const [code, setCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [success, setSuccess] = useState<'candidate' | 'employer' | null>(null)

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    if (res.status === 401) { window.location.href = '/login?redirectTo=/pricing'; return }
    const data = await res.json()
    if (data.url) { window.location.href = data.url }
    else { setError(data.error || 'Checkout failed'); setLoading(false) }
  }

  async function handleRedeem() {
    if (!code.trim()) return
    setPromoLoading(true)
    setPromoError('')
    const res = await fetch('/api/promo/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })
    if (res.status === 401) { window.location.href = '/login?redirectTo=/pricing'; return }
    const data = await res.json()
    setPromoLoading(false)
    if (data.error) {
      setPromoError(data.error)
    } else {
      setSuccess(data.type === 'employer' ? 'employer' : 'candidate')
      router.refresh()
    }
  }

  if (success) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-center">
        <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
          {success === 'employer' ? employerSuccess : candidateSuccess}
        </p>
      </div>
    )
  }

  return (
    <>
      {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="btn-primary py-3 text-sm font-semibold disabled:opacity-50 w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {loadingLabel}
          </span>
        ) : upgradeLabel}
      </button>

      {!showField ? (
        <button
          onClick={() => setShowField(true)}
          className="w-full text-center text-xs text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 transition-colors mt-1 py-1"
        >
          {havePromoCode}
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setPromoError('') }}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase tracking-widest"
              autoFocus
            />
            <button
              onClick={handleRedeem}
              disabled={promoLoading || !code.trim()}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg disabled:opacity-40 hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              {promoLoading ? '…' : applyLabel}
            </button>
          </div>
          {promoError && <p className="text-xs text-red-600 dark:text-red-400 text-center">{promoError}</p>}
        </div>
      )}
    </>
  )
}
