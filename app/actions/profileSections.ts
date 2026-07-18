'use server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { parseProjects, parseCertificates, parseLanguages, type Project, type Certificate, type Language } from '@/lib/profileSections'

type SaveResult = { ok: true } | { ok: false; error: string }

// Same trust boundary as app/actions/profile.ts: user id read server-side
// from the session, RLS also enforces own-row only. Each section saves
// independently (matches the page's per-section edit UI), and each
// re-validates its own array shape before writing — never trusts the
// client-shaped payload blindly.
export async function saveProjects(projects: Project[]): Promise<SaveResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  const clean = parseProjects(projects).map((p) => ({ ...p, title: p.title.trim().slice(0, 200) }))
  const { error } = await supabase.from('profiles').update({ projects: clean }).eq('user_id', user.id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function saveCertificates(certificates: Certificate[]): Promise<SaveResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  const clean = parseCertificates(certificates).map((c) => ({ ...c, name: c.name.trim().slice(0, 200) }))
  const { error } = await supabase.from('profiles').update({ certificates: clean }).eq('user_id', user.id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function saveLanguages(languages: Language[]): Promise<SaveResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  const clean = parseLanguages(languages)
  const { error } = await supabase.from('profiles').update({ languages: clean }).eq('user_id', user.id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
