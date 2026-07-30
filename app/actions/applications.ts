'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/lib/applicationStatus'

export type UpdateApplicationStatusResult = { ok: true } | { ok: false; error: string }

// Real ownership enforcement lives in the RLS policy "employer_update_status"
// (supabase/application_status_workflow.sql) — an employer can only update
// applications to jobs where jobs.posted_by = auth.uid(). The check here is
// belt-and-suspenders so a non-owner gets a real, specific error message
// instead of a silent "0 rows updated" from Postgres.
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<UpdateApplicationStatusResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  if (!APPLICATION_STATUSES.includes(status)) {
    return { ok: false, error: t('invalidApplicationStatus') }
  }

  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[applications/status]', error.message)
    return { ok: false, error: t('couldNotUpdateApplication') }
  }

  // RLS silently returns 0 rows (not an error) when the caller isn't the
  // owning employer — this is what tells us that actually happened, rather
  // than a false "success" with nothing changed.
  if (!data) {
    return { ok: false, error: t('onlyUpdateOwnJobApplications') }
  }

  revalidatePath('/recruiter')
  revalidatePath('/candidate')
  return { ok: true }
}

export type InviteToInterviewResult = { ok: true } | { ok: false; error: string }

// "Mark as interview" from the job-agnostic /candidates directory. Unlike
// updateApplicationStatus, there may be no existing applications row for
// this (job, candidate) pair yet — applications.job_id is NOT NULL, so this
// finds-or-creates the row for the specific job the employer picked, rather
// than inventing a job-less "interview" concept. A newly-created row is
// flagged initiated_by_employer=true so the candidate's own tracker can
// honestly show "invited by employer" instead of implying they applied.
// Real ownership enforcement is the RLS policies "employer_update_status"
// (update) and "employer_insert_interview_invite" (insert) — both scoped to
// jobs.posted_by = auth.uid(); the checks here just produce a specific error
// message instead of a silent no-op.
export async function inviteCandidateToInterview(
  candidateId: string,
  jobId: string
): Promise<InviteToInterviewResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  const { data: job } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('posted_by', user.id)
    .maybeSingle()

  if (!job) {
    return { ok: false, error: t('onlyInviteForOwnJob') }
  }

  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('candidate_id', candidateId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('applications')
      .update({ status: 'interview' })
      .eq('id', existing.id)

    if (error) {
      console.error('[applications/invite]', error.message)
      return { ok: false, error: t('couldNotUpdateApplication') }
    }
  } else {
    const { error } = await supabase
      .from('applications')
      .insert({ job_id: jobId, candidate_id: candidateId, status: 'interview', initiated_by_employer: true })

    if (error) {
      console.error('[applications/invite]', error.message)
      return { ok: false, error: t('couldNotUpdateApplication') }
    }
  }

  revalidatePath('/candidates')
  revalidatePath('/recruiter')
  revalidatePath('/candidate')
  return { ok: true }
}
