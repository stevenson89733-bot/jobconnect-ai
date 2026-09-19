'use client'
import Link from 'next/link'
import ProLockButton from '@/components/ui/ProLockButton'

interface Props {
  profile: {
    full_name?: string | null
    title?: string | null
    skills?: string | null
    cv_url?: string | null
    linkedin_url?: string | null
    bio?: string | null
  } | null
}

export default function ProfileCompletion({ profile }: Props) {
  if (!profile) return null

  const fields = [
    { key: 'full_name',    label: 'Full name',    value: profile.full_name },
    { key: 'title',        label: 'Job title',    value: profile.title },
    { key: 'skills',       label: 'Skills',       value: profile.skills },
    { key: 'cv_url',       label: 'CV / Resume',  value: profile.cv_url },
    { key: 'linkedin_url', label: 'LinkedIn URL', value: profile.linkedin_url },
    { key: 'bio',          label: 'Bio',          value: profile.bio },
  ]

  const filled = fields.filter(f => f.value).length
  const pct = Math.round((filled / fields.length) * 100)
  const missing = fields.filter(f => !f.value)

  if (pct === 100) {
    return (
      <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-medium">
        ✅ Profile complete — you get priority job matching
      </div>
    )
  }

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Profile completion</span>
        <span className="text-sm font-bold text-[#57C7E3]">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-[#57C7E3] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mb-2">Complete your profile to get better job matches:</p>
      <div className="flex flex-wrap gap-2">
        {missing.map(f => (
          <Link
            key={f.key}
            href="/profile"
            className="text-xs bg-gray-50 border border-dashed border-gray-300 text-gray-500 rounded-full px-3 py-1 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors"
          >
            + {f.label}
          </Link>
        ))}
      </div>
      <div className="mt-3">
        <ProLockButton label="Unlock AI Job Match" />
      </div>
    </div>
  )
}
