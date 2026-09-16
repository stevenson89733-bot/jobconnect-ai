'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/actions/profile'
import type { CvExtracted } from '@/app/api/cv/parse/route'

type Step = 'upload' | 'preview' | 'saving' | 'done'

type EditableExtracted = {
  full_name: string
  email: string
  phone: string
  title: string
  years_experience: string
  skills: string
  education: string
  experience: string
  languages: string
}

function toEditableFields(cv: CvExtracted): EditableExtracted {
  const education = cv.education
    .map((e) => `${e.degree}${e.institution ? ` — ${e.institution}` : ''}${e.year ? ` (${e.year})` : ''}`)
    .join('\n')

  const experience = cv.experience
    .map(
      (e) =>
        `${e.title}${e.company ? ` at ${e.company}` : ''}${e.start ? ` · ${e.start}` : ''}${e.end ? `–${e.end}` : ''}\n${e.description}`
    )
    .join('\n\n')

  return {
    full_name: cv.full_name ?? '',
    email: cv.email ?? '',
    phone: cv.phone ?? '',
    title: cv.title ?? '',
    years_experience: cv.years_experience != null ? String(cv.years_experience) : '',
    skills: (cv.skills ?? []).join(', '),
    education,
    experience,
    languages: (cv.languages ?? []).join(', '),
  }
}

type Props = {
  onClose: () => void
}

export default function CvImportModal({ onClose }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<EditableExtracted | null>(null)
  const [rawCv, setRawCv] = useState<CvExtracted | null>(null)

  async function processFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5 MB.')
      return
    }
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Please upload a PDF or DOCX file.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/cv/parse', { method: 'POST', body: fd })
      const json = await res.json() as { extracted?: CvExtracted; error?: string }

      if (!res.ok || !json.extracted) {
        setError(json.error ?? 'Failed to parse your CV. Please try again.')
        setLoading(false)
        return
      }

      setRawCv(json.extracted)
      setExtracted(toEditableFields(json.extracted))
      setStep('preview')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  async function handleSave() {
    if (!extracted || !rawCv) return
    setStep('saving')

    const result = await updateProfile({
      full_name:        extracted.full_name,
      phone:            extracted.phone,
      title:            extracted.title,
      years_experience: extracted.years_experience,
      skills:           extracted.skills,
      education:        extracted.education,
      experience:       extracted.experience,
    })

    if (!result.ok) {
      setError(result.error ?? 'Failed to save profile. Please try again.')
      setStep('preview')
      return
    }

    setStep('done')
  }

  const labelClass = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1'
  const inputClass = 'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-[#161b2e] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
           style={{ border: '1px solid rgba(87,199,227,0.2)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {step === 'upload' && 'Import Your CV'}
              {step === 'preview' && 'Review Extracted Data'}
              {step === 'saving' && 'Saving your profile…'}
              {step === 'done' && 'Import Complete'}
            </h2>
            {step === 'upload' && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">PDF or DOCX · Max 5 MB</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── Step: Upload ── */}
          {step === 'upload' && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors"
                style={{
                  borderColor: dragOver ? '#57C7E3' : undefined,
                  background: dragOver ? 'rgba(87,199,227,0.06)' : undefined,
                }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin w-8 h-8" style={{ color: '#57C7E3' }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Analysing your CV with AI…</p>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Drop your CV here, or click to browse
                    </p>
                    <p className="text-xs text-slate-400">PDF or DOCX · Max 5 MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileChange}
              />
              {error && (
                <p className="mt-3 text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
              )}
            </div>
          )}

          {/* ── Step: Preview ── */}
          {(step === 'preview' || step === 'saving') && extracted && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Here&apos;s what we found in your CV. Edit any field before saving.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input className={inputClass} value={extracted.full_name} onChange={(e) => setExtracted({ ...extracted, full_name: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Current Title</label>
                  <input className={inputClass} value={extracted.title} onChange={(e) => setExtracted({ ...extracted, title: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={extracted.phone} onChange={(e) => setExtracted({ ...extracted, phone: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Years of Experience</label>
                  <input type="number" min="0" className={inputClass} value={extracted.years_experience} onChange={(e) => setExtracted({ ...extracted, years_experience: e.target.value })} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Skills (comma-separated)</label>
                <input className={inputClass} value={extracted.skills} onChange={(e) => setExtracted({ ...extracted, skills: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Education</label>
                <textarea rows={3} className={inputClass} value={extracted.education} onChange={(e) => setExtracted({ ...extracted, education: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Work Experience</label>
                <textarea rows={6} className={inputClass} value={extracted.experience} onChange={(e) => setExtracted({ ...extracted, experience: e.target.value })} />
              </div>

              <div>
                <label className={labelClass}>Languages Spoken</label>
                <input className={inputClass} value={extracted.languages} onChange={(e) => setExtracted({ ...extracted, languages: e.target.value })} />
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
            </div>
          )}

          {/* ── Step: Done ── */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Your CV has been imported successfully
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Your profile has been updated. Head to your dashboard — Match Score will recalculate based on your new profile data.
              </p>
              <button
                type="button"
                onClick={() => { onClose(); router.push('/candidate') }}
                className="font-semibold text-white rounded-full px-8 py-3 text-sm transition-all"
                style={{ background: '#57C7E3' }}
              >
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'preview' || step === 'saving') && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => { setStep('upload'); setExtracted(null); setError(null) }}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              ← Upload different file
            </button>
            <button
              type="button"
              disabled={step === 'saving'}
              onClick={handleSave}
              className="flex items-center gap-2 font-semibold text-white rounded-full px-7 py-2.5 text-sm transition-all disabled:opacity-60"
              style={{ background: '#57C7E3' }}
            >
              {step === 'saving' ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : 'Save to Profile →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
