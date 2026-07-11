'use server'
import { createClient } from '@/lib/supabase/server'

export type ContactFields = {
  name: string
  email: string
  message: string
}

export async function submitContactMessage(fields: ContactFields): Promise<{ ok: boolean; error?: string }> {
  const name = fields.name.trim()
  const email = fields.email.trim()
  const message = fields.message.trim()

  if (!name || !email || !message) return { ok: false, error: 'Please fill in all fields.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Please enter a valid email address.' }

  try {
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').insert({ name, email, message })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Something went wrong' }
  }
}
