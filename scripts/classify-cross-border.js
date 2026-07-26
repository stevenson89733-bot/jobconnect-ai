#!/usr/bin/env node
/**
 * One-off batch classifier for jobs posted before the cross-border
 * remote-friendly detector existed (see supabase/jobs_cross_border.sql and
 * lib/ai/crossBorder.ts, whose prompt this deliberately mirrors — kept
 * self-contained/duplicated here rather than importing that TS module, same
 * "no cross-boundary import into the Next app's module graph" convention as
 * scripts/check-rls-recursion.js).
 *
 * Not run automatically by anything — you run this yourself, same as a SQL
 * migration, after supabase/jobs_cross_border.sql has been applied. No
 * recurring cron: current posting volume doesn't need it, and new jobs are
 * already classified synchronously at creation (app/api/jobs/route.ts).
 *
 * Usage: node scripts/classify-cross-border.js
 * Requires the same env vars Next.js reads from .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MISTRAL_API_KEY
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

const DELAY_MS = 1500 // spacing between real Mistral calls, no need to hammer it

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

// Mirrors lib/ai/crossBorder.ts's buildPrompt() — keep both in sync if the
// classification rules change.
function buildPrompt(title, description) {
  return `You are analyzing a "remote" job posting to determine whether it is genuinely open to a candidate based anywhere in the world, or whether it imposes a restriction that would exclude a foreign candidate.

STRICT RULES:
- Answer "yes" ONLY if the description explicitly states or clearly implies worldwide openness with no restriction (e.g. "open to candidates worldwide", "remote-first, work from anywhere", "we hire globally").
- Answer "no" if the description explicitly mentions a restriction that would exclude a foreign candidate: a specific country/region requirement ("must be based in the US", "EU residents only"), visa/sponsorship refusal ("we do not sponsor work visas", "must have existing work authorization in X"), or an imposed timezone overlap that is effectively blocking ("must overlap 9am-5pm PST").
- Answer "unclear" if the description contains NO clear signal either way — NEVER GUESS. The word "remote" alone, with no further qualification, is "unclear", not "yes" — most real postings with no specific statement should fall into this category.
- Base your answer only on the real text given below, never on an assumption about the company.

Job title: ${title}
Description: ${description}

Return a JSON object: { "status": "yes" | "no" | "unclear", "reason": "<one factual sentence citing the exact phrase found, or noting the absence of any signal>" }`
}

async function classify(client, title, description) {
  const res = await client.chat.completions.create({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: buildPrompt(title, description) }],
    max_tokens: 200,
    response_format: { type: 'json_object' },
  })
  const raw = res.choices?.[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw)
  const status = VALID_STATUSES.includes(parsed.status) ? parsed.status : 'unclear'
  const reason = typeof parsed.reason === 'string' ? parsed.reason.trim() : ''
  return { status, reason }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  loadEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const mistralKey = process.env.MISTRAL_API_KEY
  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  if (!mistralKey) {
    console.error('Missing MISTRAL_API_KEY in .env.local')
    process.exit(1)
  }

  const admin = createClient(url, serviceKey)
  const mistral = new OpenAI({ apiKey: mistralKey, baseURL: 'https://api.mistral.ai/v1' })

  const { data: jobs, error } = await admin
    .from('jobs')
    .select('id, title, description')
    .eq('work_type', 'remote')
    .is('cross_border_status', null)

  if (error) {
    console.error('Failed to read jobs:', error.message)
    process.exit(1)
  }

  console.log(`Found ${jobs.length} remote job(s) with no cross-border classification yet.`)

  let done = 0
  for (const job of jobs) {
    try {
      const { status, reason } = await classify(mistral, job.title, job.description ?? '')
      const { error: updateError } = await admin
        .from('jobs')
        .update({ cross_border_status: status, cross_border_reason: reason })
        .eq('id', job.id)
      if (updateError) {
        console.error(`  [FAILED WRITE] "${job.title}" (${job.id}): ${updateError.message}`)
      } else {
        done++
        console.log(`  [${status}] "${job.title}" — ${reason}`)
      }
    } catch (err) {
      console.error(`  [FAILED CLASSIFY] "${job.title}" (${job.id}): ${err instanceof Error ? err.message : err}`)
    }
    await sleep(DELAY_MS)
  }

  console.log(`\nDone: ${done}/${jobs.length} jobs classified.`)
}

main()
