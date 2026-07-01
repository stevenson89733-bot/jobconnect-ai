import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  user_id: string
  role: 'candidate' | 'employer'
  full_name: string
  email: string
  company_name?: string | null
  created_at: string
}
