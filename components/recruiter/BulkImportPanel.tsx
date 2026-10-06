'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function BulkImportPanel({ isGrowth }: { isGrowth: boolean }) {
  const t = useTranslations('recruiter')
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number } | null>(null)
  const [error, setError] = useState('')

  if (!isGrowth) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">📥</span>
          <h2 className="font-semibold text-slate-900 dark:text-white">{t('bulkImportTitle')}</h2>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">Growth</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {t('bulkImportLockedDesc')}
        </p>
        <Link href="/pricing#employers" className="btn-primary text-sm py-2 px-4 inline-flex">
          {t('bulkImportUpgradeBtn')}
        </Link>
      </div>
    )
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/recruiter/bulk-import', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t('bulkImportFailed')); return }
      setResult({ imported: data.imported })
    } catch {
      setError(t('bulkImportNetworkError'))
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">📥</span>
        <h2 className="font-semibold text-slate-900 dark:text-white">{t('bulkImportTitle')}</h2>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">Growth</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t('bulkImportCsvDesc')}
      </p>

      <label className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${loading ? 'opacity-50 pointer-events-none' : 'border-slate-300 dark:border-slate-700 hover:border-primary'}`}>
        <span className="text-2xl">📎</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {loading ? t('bulkImportImporting') : t('bulkImportUpload')}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleUpload}
          disabled={loading}
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          {t('bulkImportSuccess', { count: result.imported })}
        </p>
      )}
    </div>
  )
}
