import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import FadeIn from './FadeIn'

export type ProfileSummaryData = {
  title: string | null
  location: string | null
  bio: string | null
  yearsExperience: number | null
  workPreference: string | null
  availability: string | null
  portfolioUrl: string | null
}

// Skills are intentionally NOT repeated here — the Skills card is the single
// source of truth for the skill list, this card only covers title/location/
// experience/bio/portfolio.
export default function ProfileSummaryCard({ profile }: { profile: ProfileSummaryData }) {
  const hasContent = !!(
    profile.title?.trim() || profile.location?.trim() || profile.bio?.trim() ||
    profile.yearsExperience != null ||
    profile.availability?.trim() || profile.workPreference?.trim() || profile.portfolioUrl?.trim()
  )

  return (
    <FadeIn>
      <Card>
        <CardContent className="p-6">
          {!hasContent ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🧑‍💻</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Your profile summary is empty.</p>
              <Link href="/profile" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">
                Add a summary →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(profile.title?.trim() || profile.location?.trim()) && (
                <div>
                  {profile.title?.trim() && (
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{profile.title}</h2>
                  )}
                  {profile.location?.trim() && (
                    <p className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                      {profile.location}
                    </p>
                  )}
                </div>
              )}

              {(profile.yearsExperience != null || profile.availability?.trim() || profile.workPreference?.trim()) && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.yearsExperience != null && (
                    <Badge>{profile.yearsExperience} yr{profile.yearsExperience === 1 ? '' : 's'} experience</Badge>
                  )}
                  {profile.workPreference?.trim() && <Badge>{profile.workPreference}</Badge>}
                  {profile.availability?.trim() && <Badge>Available: {profile.availability}</Badge>}
                </div>
              )}

              {profile.bio?.trim() && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1">
                    About
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {profile.bio}
                  </p>
                </div>
              )}

              {profile.portfolioUrl?.trim() && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-block text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400 underline underline-offset-2 break-all">
                  Portfolio →
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
