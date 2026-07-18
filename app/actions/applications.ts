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
