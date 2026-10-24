import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const admin = createAdminClient()

  try {
    // 1. Delete applications
    await admin.from('applications').delete().eq('candidate_id', userId)

    // 2. Delete auto-apply data
    await admin.from('auto_apply_log').delete().eq('user_id', userId)
    await admin.from('auto_apply_settings').delete().eq('user_id', userId)
    await admin.from('auto_apply_waitlist').delete().eq('user_id', userId)

    // 3. Delete saved jobs
    await admin.from('saved_jobs').delete().eq('user_id', userId)

    // 4. Delete career analysis
    await admin.from('career_analysis').delete().eq('candidate_id', userId)

    // 5. Delete copilot conversations
    await admin.from('copilot_conversations').delete().eq('user_id', userId)

    // 6. Delete referral data
    await admin.from('referral_events').delete().eq('referrer_user_id', userId)
    await admin.from('referral_attributions').delete().eq('referrer_user_id', userId)
    await admin.from('referral_attributions').delete().eq('referred_user_id', userId)
    await admin.from('referral_visits').delete().eq('referrer_user_id', userId)
    await admin.from('referral_codes').delete().eq('user_id', userId)

    // 7. Delete guide downloads
    await admin.from('guide_downloads').delete().eq('user_id', userId)

    // 8. Delete job clicks
    await admin.from('job_clicks').delete().eq('user_id', userId)

    // 9. Delete storage files (CV PDFs and avatars)
    for (const bucket of ['cv-pdfs', 'avatars'] as const) {
      const { data: files } = await admin.storage.from(bucket).list(userId)
      if (files?.length) {
        const paths = files.map(f => `${userId}/${f.name}`)
        await admin.storage.from(bucket).remove(paths)
      }
    }

    // 10. Delete profile
    await admin.from('profiles').delete().eq('user_id', userId)

    // 11. Delete auth user (cascades notifications, etc.)
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('[delete-account] auth delete failed:', deleteError.message)
      return NextResponse.json({ error: 'Failed to delete auth account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[delete-account] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
