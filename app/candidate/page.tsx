import { createClient } from '@/lib/supabase/server'
import { Send, CheckCircle2, Layers } from 'lucide-react'
import { matchJobsToSkills } from '@/lib/jobMatching'
import WelcomeHeader from '@/components/dashboard/WelcomeHeader'
import ProfileCompletionCard from '@/components/dashboard/ProfileCompletionCard'
import ProfileSnapshot from '@/components/dashboard/ProfileSnapshot'
import StatCard from '@/components/dashboard/StatCard'
import RecentApplications, { type ApplicationRow } from '@/components/dashboard/RecentApplications'
import SkillsCard from '@/components/dashboard/SkillsCard'
import JobRecommendations from '@/components/dashboard/JobRecommendations'
import AIAssistantCard from '@/components/dashboard/AIAssistantCard'
import QuickActions from '@/components/dashboard/QuickActions'
import CareerCoachSummary from '@/components/shared/CareerCoachSummary'
import FadeIn from '@/components/dashboard/FadeIn'

export const dynamic = 'force-dynamic'

type Profile = {
  full_name: string | null
  title: string | null
  location: string | null
  bio: string | null
  experience: string | null
  skills: string | null
  avatar_url: string | null
  years_experience: number | null
  portfolio_url: string | null
  availability: string | null
  work_preference: string | null
  is_premium: boolean | null
}

type JobRef = { title: string; company_name: string }
type RawApplicationRow = {
  id: string
  status: string
  status_updated_at: string | null
  created_at: string
  jobs: JobRef[] | JobRef | null
}

function jobInfo(row: RawApplicationRow): JobRef {
  const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs
  return { title: job?.title ?? 'Unknown role', company_name: job?.company_name ?? 'Unknown company' }
}

export default async function CandidateDashboard() {
  const supabase = createClient()

  let email = ''
  let profile: Profile | null = null
  let applicationsCount = 0
  let applications: ApplicationRow[] = []
  let recommendedJobs: Awaited<ReturnType<typeof matchJobsToSkills>> = []
  // Same career_analysis row read as-is on /profile — no second scoring
  // system computed here, just the one existing result surfaced in a
  // second, read-only place.
  let atsScore: number | null = null
  let profileStrength: number | null = null
  let analysisGeneratedAt: string | null = null

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      email = user.email ?? ''

      const [{ data: profileData }, { count }, { data: appsData }, { data: appliedJobIds }, { data: analysisRow }] = await Promise.all([
        supabase.from('profiles')
          .select('full_name, title, location, bio, experience, skills, avatar_url, years_experience, portfolio_url, availability, work_preference, is_premium')
          .eq('user_id', user.id).single(),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id),
        supabase.from('applications')
          .select('id, status, status_updated_at, created_at, jobs!job_id(title, company_name)')
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('applications').select('job_id').eq('candidate_id', user.id),
        supabase.from('career_analysis').select('analysis_json, generated_at').eq('candidate_id', user.id).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      profile = (profileData as Profile | null) ?? null
      applicationsCount = count ?? 0
      applications = ((appsData as unknown as RawApplicationRow[] | null) ?? []).map((row) => ({
        id: row.id,
        status: row.status,
        status_updated_at: row.status_updated_at,
        created_at: row.created_at,
        ...jobInfo(row),
      }))

      const appliedIds = new Set((appliedJobIds ?? []).map((r) => r.job_id as string))
      recommendedJobs = await matchJobsToSkills(profile?.skills, appliedIds)

      const analysisJson = analysisRow?.analysis_json as { atsScore?: { score?: number }; profileStrength?: { score?: number } } | undefined
      atsScore = analysisJson?.atsScore?.score ?? null
      profileStrength = analysisJson?.profileStrength?.score ?? null
      analysisGeneratedAt = analysisRow?.generated_at ?? null
    }
  } catch {
    // Supabase unavailable — render with empty/zeroed data rather than crashing
  }

  const fullName = profile?.full_name?.trim() || ''
  const firstName = fullName.split(/\s+/)[0] || email.split('@')[0] || 'there'
  const initials = fullName
    ? fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
    : (email[0] ?? '?').toUpperCase()

  // Profile completion — text fields + years_experience (numeric) + avatar.
  // phone is intentionally excluded: optional and private, not a signal of
  // "profile completeness" for employers to see.
  const textCompletionFields = [
    profile?.full_name, profile?.title, profile?.location, profile?.bio,
    profile?.skills, profile?.experience, profile?.avatar_url,
    profile?.portfolio_url, profile?.availability, profile?.work_preference,
  ]
  const filledCount = textCompletionFields.filter(f => !!f?.trim()).length + (profile?.years_experience != null ? 1 : 0)
  const completion = Math.round((filledCount / (textCompletionFields.length + 1)) * 100)

  const skillTags = (profile?.skills ?? '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <WelcomeHeader firstName={firstName} initials={initials} avatarUrl={profile?.avatar_url ?? null} />

      <ProfileCompletionCard completion={completion} />

      <ProfileSnapshot title={profile?.title ?? null} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Applications Sent" value={applicationsCount} icon={Send} delay={0} />
        <StatCard label="Profile Completion" value={`${completion}%`} icon={CheckCircle2} accent="text-primary" delay={0.05} />
        <StatCard
          label={`Skill${skillTags.length === 1 ? '' : 's'} Listed`}
          value={skillTags.length}
          icon={Layers}
          delay={0.1}
        />
      </div>

      <FadeIn delay={0.05}>
        <CareerCoachSummary
          isPremium={!!profile?.is_premium}
          atsScore={atsScore}
          profileStrength={profileStrength}
          generatedAt={analysisGeneratedAt}
          compact
        />
      </FadeIn>

      <AIAssistantCard />

      <JobRecommendations jobs={recommendedJobs} />

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentApplications applications={applications} />
        </div>
        <SkillsCard skills={skillTags} />
      </div>

      <QuickActions />
    </div>
  )
}
