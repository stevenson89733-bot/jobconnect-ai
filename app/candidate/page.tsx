import { createClient } from '@/lib/supabase/server'
import { Send, CheckCircle2, Layers } from 'lucide-react'
import WelcomeHeader from '@/components/dashboard/WelcomeHeader'
import ProfileCompletionCard from '@/components/dashboard/ProfileCompletionCard'
import ProfileSummaryCard from '@/components/dashboard/ProfileSummaryCard'
import StatCard from '@/components/dashboard/StatCard'
import RecentApplications, { type ApplicationRow } from '@/components/dashboard/RecentApplications'
import SkillsCard from '@/components/dashboard/SkillsCard'
import JobRecommendations, { type RecommendedJob } from '@/components/dashboard/JobRecommendations'
import AIAssistantCard from '@/components/dashboard/AIAssistantCard'
import QuickActions from '@/components/dashboard/QuickActions'

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
}

type JobRef = { title: string; company_name: string }
type RawApplicationRow = {
  id: string
  status: string
  created_at: string
  jobs: JobRef[] | JobRef | null
}

type RawJob = {
  id: string
  title: string
  company_name: string
  salary_label: string | null
  tags: string[] | null
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
  let recommendedJobs: RecommendedJob[] = []

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      email = user.email ?? ''

      const [{ data: profileData }, { count }, { data: appsData }, { data: appliedJobIds }, { data: activeJobs }] = await Promise.all([
        supabase.from('profiles')
          .select('full_name, title, location, bio, experience, skills, avatar_url, years_experience, portfolio_url, availability, work_preference')
          .eq('user_id', user.id).single(),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id),
        supabase.from('applications')
          .select('id, status, created_at, jobs!job_id(title, company_name)')
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('applications').select('job_id').eq('candidate_id', user.id),
        supabase.from('jobs')
          .select('id, title, company_name, salary_label, tags')
          .eq('is_active', true)
          .limit(50),
      ])

      profile = (profileData as Profile | null) ?? null
      applicationsCount = count ?? 0
      applications = ((appsData as unknown as RawApplicationRow[] | null) ?? []).map((row) => ({
        id: row.id,
        status: row.status,
        created_at: row.created_at,
        ...jobInfo(row),
      }))

      // Real recommendations: overlap between the candidate's own listed
      // skills and each active job's tags — no invented match score, and the
      // section is simply omitted (in JobRecommendations) if there's nothing
      // to show. Already-applied jobs are excluded.
      const appliedIds = new Set((appliedJobIds ?? []).map((r) => r.job_id as string))
      const skillSet = new Set(
        (profile?.skills ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      )

      if (skillSet.size > 0) {
        recommendedJobs = ((activeJobs as RawJob[] | null) ?? [])
          .filter((job) => !appliedIds.has(job.id))
          .map((job) => {
            const matchedTags = (job.tags ?? []).filter((tag) => skillSet.has(tag.trim().toLowerCase()))
            return { id: job.id, title: job.title, company_name: job.company_name, salary_label: job.salary_label, matchedTags }
          })
          .filter((job) => job.matchedTags.length > 0)
          .sort((a, b) => b.matchedTags.length - a.matchedTags.length)
          .slice(0, 4)
      }
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

      <ProfileSummaryCard
        profile={{
          title: profile?.title ?? null,
          location: profile?.location ?? null,
          bio: profile?.bio ?? null,
          yearsExperience: profile?.years_experience ?? null,
          workPreference: profile?.work_preference ?? null,
          availability: profile?.availability ?? null,
          portfolioUrl: profile?.portfolio_url ?? null,
        }}
      />

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
