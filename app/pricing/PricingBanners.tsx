'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function PricingBanners({
  success,
  canceled,
  employerSuccess,
  employerCanceled,
  labels,
}: {
  success: boolean
  canceled: boolean
  employerSuccess: boolean
  employerCanceled: boolean
  labels: {
    successTitle: string
    paymentCanceled: string
    employerSuccessTitle: string
    goToResumeBuilder: string
    goToCoverLetter: string
    goToRecruiterDashboard: string
  }
}) {
  const router = useRouter()

  useEffect(() => {
    if (success || employerSuccess) router.refresh()
  }, [success, employerSuccess, router])

  return (
    <>
      {success && (
        <div className="mb-8 p-5 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-center">
          <p className="text-green-700 dark:text-green-400 font-semibold mb-3">{labels.successTitle}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/ai-tools/resume-builder" className="btn-primary text-sm py-2 px-5">{labels.goToResumeBuilder}</a>
            <a href="/ai-tools/cover-letter" className="btn-outline text-sm py-2 px-5">{labels.goToCoverLetter}</a>
            <a href="/auto-apply" className="btn-outline text-sm py-2 px-5 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10">🤖 Auto-Apply</a>
          </div>
        </div>
      )}
      {canceled && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
          {labels.paymentCanceled}
        </div>
      )}
      {employerSuccess && (
        <div className="mb-8 p-5 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-center">
          <p className="text-green-700 dark:text-green-400 font-semibold mb-3">{labels.employerSuccessTitle}</p>
          <a href="/recruiter" className="btn-primary text-sm py-2 px-5">{labels.goToRecruiterDashboard}</a>
        </div>
      )}
      {employerCanceled && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
          {labels.paymentCanceled}
        </div>
      )}
    </>
  )
}
