'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const CATEGORIES = ['Engineering', 'Design', 'Data', 'Research', 'Developer Relations', 'Content']

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary'
const labelClass = 'block text-sm text-slate-600 dark:text-slate-400 mb-1.5'

// Real POST to the existing /api/jobs endpoint (app/api/jobs/route.ts),
// which already enforces the employer role check + RLS insert policy — this
// modal is the first (and only) UI that actually calls it.
export default function PostJobModal({
  companyName,
  triggerClassName,
  triggerLabel,
}: {
  companyName: string
  triggerClassName: string
  triggerLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState(companyName)
  const [location, setLocation] = useState('Remote')
  const [jobType, setJobType] = useState('Full-time')
  const [category, setCategory] = useState('Engineering')
  const [description, setDescription] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [tags, setTags] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  function resetForm() {
    setTitle('')
    setCompany(companyName)
    setLocation('Remote')
    setJobType('Full-time')
    setCategory('Engineering')
    setDescription('')
    setSalaryMin('')
    setSalaryMax('')
    setTags('')
    setIsFeatured(false)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const min = salaryMin.trim() ? parseInt(salaryMin, 10) : null
    const max = salaryMax.trim() ? parseInt(salaryMax, 10) : null
    const salaryLabel = min && max ? `$${Math.round(min / 1000)}k–$${Math.round(max / 1000)}k` : null

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        company_name: company.trim(),
        location: location.trim(),
        job_type: jobType,
        category,
        description: description.trim(),
        salary_min: min,
        salary_max: max,
        salary_label: salaryLabel,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        is_featured: isFeatured,
      }),
    })

    if (res.status === 401) {
      router.push('/login?redirectTo=/recruiter')
      return
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Something went wrong — please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-slate-900 dark:text-white font-bold text-lg">Post a Job</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xl leading-none ml-4"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Job title</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior AI Engineer" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Company name</label>
                <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote · USA" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Job type</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={inputClass}>
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Responsibilities, requirements, what makes this role great…"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Salary min <span className="text-slate-600 dark:text-slate-400">(optional)</span></label>
                  <input type="number" min="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="150000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Salary max <span className="text-slate-600 dark:text-slate-400">(optional)</span></label>
                  <input type="number" min="0" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="190000" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tags <span className="text-slate-600 dark:text-slate-400">(optional, comma-separated)</span></label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Python, ML, LLMs" className={inputClass} />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-slate-300 dark:border-slate-700" />
                Mark as Featured
              </label>

              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 btn-outline py-2.5 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50">
                  {loading ? 'Posting…' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
