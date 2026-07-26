import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit } from '@/lib/rateLimit'
import { classifyMessage, buildRedirect } from '@/lib/ai/copilot'

// Chat history + intent classification for the conversational Career
// Copilot. Distinct from /api/copilot/signals (the existing passive
// "what's new" digest) — this is the new V1 chat surface, candidate-only,
// same as the rest of the AI tools.

const HISTORY_LIMIT = 20
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000
const MESSAGE_LIMIT = 20
const MESSAGE_WINDOW_MS = 60 * 60 * 1000
const MAX_MESSAGE_LENGTH = 500

type HistoryRow = {
  role: 'user' | 'assistant'
  message: string
  intent: string | null
  redirect_url: string | null
  created_at: string
}

async function isCandidate(supabase: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('role').eq('user_id', userId).single()
  return data?.role === 'candidate'
}

export async function GET() {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })
  if (!(await isCandidate(supabase, user.id))) return NextResponse.json({ messages: [] })

  const { data, error } = await supabase
    .from('copilot_conversations')
    .select('role, message, intent, redirect_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  if (error) console.error('[copilot/chat] history read failed:', error.message)

  const messages = ((data ?? []) as HistoryRow[]).slice().reverse()
  return NextResponse.json({ messages })
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })
  if (!(await isCandidate(supabase, user.id))) {
    return NextResponse.json({ error: t('copilotCandidateOnly') }, { status: 403 })
  }

  const { ok } = rateLimit(`copilot-chat:${user.id}`, MESSAGE_LIMIT, MESSAGE_WINDOW_MS)
  if (!ok) return NextResponse.json({ error: t('tooManyCopilotMessages') }, { status: 429 })

  const body = await req.json().catch(() => null) as { message?: string } | null
  const message = body?.message?.trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!message) return NextResponse.json({ error: t('copilotEmptyMessage') }, { status: 400 })

  try {
    // Persistence failures here are logged but never block the reply
    // itself — the candidate still gets a real classification/answer even
    // if history can't be saved (e.g. before supabase/copilot_conversations.sql
    // has been run), same "degrade gracefully, never break the feature"
    // pattern as the rest of this app's caching layers.
    const { error: userInsertError } = await supabase.from('copilot_conversations').insert({ user_id: user.id, role: 'user', message })
    if (userInsertError) console.error('[copilot/chat] user message insert failed:', userInsertError.message)

    const classification = await classifyMessage(message)
    const redirect = buildRedirect(classification.intent, classification.extracted)

    const { error: assistantInsertError } = await supabase.from('copilot_conversations').insert({
      user_id: user.id,
      role: 'assistant',
      message: classification.reply,
      intent: classification.intent,
      redirect_url: redirect?.url ?? null,
    })
    if (assistantInsertError) console.error('[copilot/chat] assistant message insert failed:', assistantInsertError.message)

    // Opportunistic 90-day retention purge (see supabase/copilot_conversations.sql
    // for why this runs here instead of a pg_cron job) — runs as the
    // candidate's own session, same RLS as every other read/write here.
    const cutoff = new Date(Date.now() - RETENTION_MS).toISOString()
    const { error: purgeError } = await supabase.from('copilot_conversations').delete().eq('user_id', user.id).lt('created_at', cutoff)
    if (purgeError) console.error('[copilot/chat] retention purge failed:', purgeError.message)

    return NextResponse.json({ reply: classification.reply, intent: classification.intent, redirect })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Copilot request failed'
    console.error('[copilot/chat]', msg)
    return NextResponse.json({ error: t('somethingWentWrong') }, { status: 500 })
  }
}
