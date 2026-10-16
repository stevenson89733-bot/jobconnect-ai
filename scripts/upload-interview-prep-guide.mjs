/**
 * Uploads the generated "Remote Interview Prep Playbook" PDF to Supabase Storage,
 * replacing the placeholder for the 'remote-interview-prep-playbook' guide slug.
 * bucket: learn-guides / path: guides/remote-interview-prep-playbook.pdf
 *
 * Run: node scripts/generate-interview-prep-guide.mjs   (generates the PDF first)
 *      node scripts/upload-interview-prep-guide.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const envPath = resolve(__dirname, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey  = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const PDF_PATH = resolve(__dirname, '../public/guides/remote-interview-prep-playbook.pdf')
const STORAGE_PATH = 'guides/remote-interview-prep-playbook.pdf'

const supabase = createClient(supabaseUrl, serviceKey)

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === 'learn-guides')
  if (!exists) {
    const { error } = await supabase.storage.createBucket('learn-guides', { public: false })
    if (error) {
      console.error('Failed to create bucket:', error.message)
      process.exit(1)
    }
    console.log('✓ Bucket "learn-guides" created (private)')
  }
}

async function main() {
  if (!existsSync(PDF_PATH)) {
    console.error(`Missing ${PDF_PATH} — run node scripts/generate-interview-prep-guide.mjs first.`)
    process.exit(1)
  }

  await ensureBucket()

  const pdf = readFileSync(PDF_PATH)
  const { error } = await supabase.storage
    .from('learn-guides')
    .upload(STORAGE_PATH, pdf, { contentType: 'application/pdf', upsert: true })

  if (error) {
    console.error(`✗ ${STORAGE_PATH}: ${error.message}`)
    process.exit(1)
  }

  console.log(`✓ Uploaded ${STORAGE_PATH} (${pdf.length} bytes)`)
  console.log('Test a download at /learn with a Pro account.')
}

main().catch(err => { console.error(err); process.exit(1) })
