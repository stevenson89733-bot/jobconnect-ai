'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Job } from '@/app/jobs/JobsClient'

export default function AiApplyModal({
  job,
  onClose,
}: {
  job: Job
  onClose: () => void
}) {
  const [step, setStep] = useState<'cover' | 'submitting' | 'done'>('cover')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateCoverLetter() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company_name,
          description: job.description ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setCoverLetter(data.coverLetter ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generating cover letter')
    } finally {
      setLoading(false)
    }
  }

  async function submitApplication() {
    setStep('submitting')
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter,
        }),
      })
      setStep('done')
    } catch {
      setStep('cover')
      setError('Failed to submit application')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="font-bold text-[17px] text-slate-900">✦ Apply with AI</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">{job.title} · {job.company_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5">
          {step === 'done' ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-semibold text-slate-800">Application submitted!</p>
              <p className="text-sm text-slate-500 mt-1">You can track it in My Applications.</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-[#57C7E3] text-white rounded-lg text-sm font-semibold hover:bg-[#3ab5d1] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {!coverLetter ? (
                <div className="text-center py-6">
                  <p className="text-slate-600 text-sm mb-4">
                    Generate a personalized cover letter for this role using AI.
                  </p>
                  {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                  <button
                    onClick={generateCoverLetter}
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#57C7E3] text-white rounded-lg text-sm font-semibold hover:bg-[#3ab5d1] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : '✦ Generate Cover Letter'}
                  </button>
                </div>
              ) : (
                <>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={12}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:border-[#57C7E3] resize-none"
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={generateCoverLetter}
                      disabled={loading}
                      className="px-4 py-2 border border-[#57C7E3] text-[#57C7E3] rounded-lg text-sm font-semibold hover:bg-[#57C7E3]/10 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Regenerating...' : '↺ Regenerate'}
                    </button>
                    <button
                      onClick={submitApplication}
                      disabled={step === 'submitting'}
                      className="flex-1 px-4 py-2 bg-[#57C7E3] text-white rounded-lg text-sm font-semibold hover:bg-[#3ab5d1] transition-colors disabled:opacity-50"
                    >
                      {step === 'submitting' ? 'Submitting...' : 'Submit Application →'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
