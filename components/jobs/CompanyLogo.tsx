'use client'
import { useState } from 'react'
import { companyInitials, clearbitLogoUrl } from '@/lib/companyDisplay'

/**
 * Company logo with automatic Clearbit fallback → letter avatar.
 * Renders an <img> when a Clearbit URL is derivable, falls back to the
 * letter-initial div on error (404, network failure, etc.).
 * Never shows a broken-image icon.
 */
export default function CompanyLogo({
  companyName,
  logoUrl = null,
  size = 'md',
  shape = 'rounded-lg',
}: {
  companyName: string
  logoUrl?: string | null
  size?: 'sm' | 'md'
  shape?: string
}) {
  const [imgFailed, setImgFailed] = useState(false)

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  const src = logoUrl ?? clearbitLogoUrl(companyName)

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={companyName}
        onError={() => setImgFailed(true)}
        className={`${sizeClass} ${shape} object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5`}
      />
    )
  }

  return (
    <div className={`${sizeClass} ${shape} bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300`}>
      {companyInitials(companyName)}
    </div>
  )
}
