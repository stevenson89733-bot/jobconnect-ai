'use client'
import { useState } from 'react'

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
  </svg>
)

export function CheckoutButton({
  endpoint,
  label,
  loadingLabel,
  className,
  style,
}: {
  endpoint: string
  label: string
  loadingLabel: string
  className?: string
  style?: React.CSSProperties
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(endpoint, { method: 'POST' })
      if (res.status === 401) { window.location.href = `/login?redirectTo=/pricing`; return }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Checkout failed')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> {loadingLabel}
          </span>
        ) : label}
      </button>
    </div>
  )
}
