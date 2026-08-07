#!/usr/bin/env node
/**
 * Backfill script — re-classifies ALL remote jobs with GPT-4o-mini and
 * populates cross_border_signals (new column) alongside existing
 * cross_border_status / cross_border_reason.
 *
 * Run AFTER applying supabase/jobs_cross_border_signals.sql.
 * Targets ALL remote jobs (not just NULL ones) so every row gets coherent
 * signals from the new model, not a mix of old Mistral + new GPT-4o-mini.
 *
 * Usage: node scripts/backfill-cross-border-signals.js
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

const DELAY_MS = 800

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const i = line.indexOf('=')
    if (i > 0 && !line.trim().startsWith('#')) {
      const key = line.slice(0, i).trim()
      if (!process.env[key]) process.env[key] = line.slice(i + 1).trim()
    }
  }
}

const VALID_STATUSES = ['yes', 'no', 'unclear']

function buildPrompt(title, description) {
  return `You are analyzing a "remote" job posting to determine whether it is genuinely open to a candidate based anywhere in the world, or whether it restricts by geography, visa/sponsorship, or timezone overlap.

STRICT RULES:
- Answer "yes" ONLY if the description explicitly states or clearly implies worldwide openness with no restriction (e.g. "open to candidates worldwide", "remote-first, work from anywhere", "we hire globally").
- Answer "no" if the description explicitly mentions a restriction that would exclude a foreign candidate: a specific country/region requirement ("must be based in the US", "EU residents only"), visa/sponsorship refusal ("we do not sponsor work visas", "must have existing work authorization in X"), or a blocking timezone overlap ("must overlap 9am–5pm PST").
- Answer "unclear" if the description contains NO clear signal either way — NEVER GUESS. The word "remote" alone is "unclear", not "yes". Most real postings with no specific geographic statement should be "unclear".
- Base your answer ONLY on the real text below. Never assume or infer about the company.

SIGNALS RULES (for the "signals" array):
- Provide 2–3 short strings (max ~10 words each) that explain WHY you chose this status.
- For "yes": cite the exact phrase or paraphrase that signals openness. E.g. "States 'work from anywhere'", "Explicitly global hiring".
- For "no": cite the exact restriction. E.g. "Requires US work authorization", "Must overlap 9am–5pm PST", "EU residents only".
- For "unclear": state what is absent. E.g. "No geographic restriction mentioned", "No mention of visa/sponsorship policy", "Remote scope not specified".
- NEVER invent signals not supported by the text. NEVER pad to 3 if 2 honest signals exist.

Job title: ${title}
Description: ${description}

Return a JSON object:
{
  "status": "yes" | "no" | "unclear",
  "reason": "<one internal sentence citing the exact phrase or absence of signal>",
  "signals": ["<short signal 1>", "<short signal 2>"]
}`
}

async function classify(client, title, description) {
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: buildPrompt(title, description) }],
    max_tokens: 300,
    response_format: { type: 'json_object' },
  })
  const raw = res.choices?.[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw)
  const status = VALID_STATUSES.includes(parsed.status) ? parsed.status : 'unclear'
  const reason = typeof parsed.reason === 'string' ? parsed.reason.trim() : ''
  const rawSignals = Array.isArray(parsed.signals) ? parsed.signals : []
  const signals = rawSignals
    .filter((s) => typeof s === 'string' && s.trim().length > 0)
    .slice(0, 3)
    .map((s) => s.trim())
  return { status, reason, signals }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  loadEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  if (!openaiKey) {
    console.error('Missing OPENAI_API_KEY in .env.local')
    process.exit(1)
  }

  const admin = createClient(url, serviceKey)
  const openai = new OpenAI({ apiKey: openaiKey })

  // ALL remote jobs — intentional, to get coherent GPT-4o-mini signals on every row
  const { data: jobs, error } = await admin
    .from('jobs')
    .select('id, title, description')
    .eq('work_type', 'remote')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to read jobs:', error.message)
    process.exit(1)
  }

  console.log(`Found ${jobs.length} remote job(s) — re-classifying all with GPT-4o-mini.\n`)

  const statusCounts = { yes: 0, no: 0, unclear: 0, failed: 0 }

  for (const job of jobs) {
    try {
      const { status, reason, signals } = await classify(openai, job.title, job.description ?? '')
      const { error: updateError } = await admin
        .from('jobs')
        .update({
          cross_border_status: status,
          cross_border_reason: reason,
          cross_border_signals: signals.length > 0 ? signals : null,
        })
        .eq('id', job.id)

      if (updateError) {
        console.error(`  [WRITE FAILED] "${job.title}" (${job.id}): ${updateError.message}`)
        statusCounts.failed++
      } else {
        statusCounts[status]++
        const signalStr = signals.length > 0 ? signals.map((s) => `"${s}"`).join(', ') : 'no signals'
        console.log(`  [${status.toUpperCase()}] "${job.title}" — ${signalStr}`)
      }
    } catch (err) {
      console.error(`  [CLASSIFY FAILED] "${job.title}" (${job.id}): ${err instanceof Error ? err.message : err}`)
      statusCounts.failed++
    }
    await sleep(DELAY_MS)
  }

  console.log(`\nDone.`)
  console.log(`  ✅ yes: ${statusCounts.yes}`)
  console.log(`  ⚠️  unclear: ${statusCounts.unclear}`)
  console.log(`  ❌ no: ${statusCounts.no}`)
  if (statusCounts.failed > 0) console.log(`  💥 failed: ${statusCounts.failed}`)
}

main()
