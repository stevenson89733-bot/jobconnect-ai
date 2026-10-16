/**
 * Creates placeholder PDFs and uploads them to Supabase Storage
 * bucket: learn-guides / path: guides/{slug}.pdf
 *
 * Run: node scripts/upload-learn-guides.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
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

const supabase = createClient(supabaseUrl, serviceKey)

const GUIDES = [
  { slug: 'salary-negotiation', title: 'Négociation Salariale Internationale', plan: 'Pro', pages: 24 },
  { slug: 'linkedin-expats',    title: 'LinkedIn pour Expatriés',               plan: 'Pro', pages: 18 },
  { slug: 'remote-interview',   title: 'Maîtriser l\'Entretien Remote',          plan: 'Pro', pages: 32 },
  { slug: 'international-contracts', title: 'Contrats & Compliance Internationale', plan: 'Elite', pages: 40 },
]

function makePdf(title, plan, pages) {
  // Minimal valid single-page PDF with visible text
  const content = [
    `BT`,
    `/F1 20 Tf`,
    `50 750 Td`,
    `(${title.replace(/[()\\]/g, '\\$&')}) Tj`,
    `/F1 14 Tf`,
    `0 -40 Td`,
    `(Plan requis: ${plan}) Tj`,
    `0 -30 Td`,
    `(Guide de ${pages} pages - Placeholder pour tests) Tj`,
    `0 -30 Td`,
    `(JobConnect AI) Tj`,
    `ET`,
  ].join('\n')

  const resources = `/Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >>`
  const pageContent = `stream\n${content}\nendstream`

  const objs = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << ${resources} >> >>\nendobj`,
    `4 0 obj\n<< /Length ${pageContent.length} >>\n${pageContent}\nendobj`,
  ]

  let body = '%PDF-1.4\n'
  const offsets = []
  for (const obj of objs) {
    offsets.push(body.length)
    body += obj + '\n'
  }

  const xrefOffset = body.length
  body += 'xref\n'
  body += `0 ${objs.length + 1}\n`
  body += '0000000000 65535 f \n'
  for (const off of offsets) {
    body += String(off).padStart(10, '0') + ' 00000 n \n'
  }
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\n`
  body += `startxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(body, 'utf8')
}

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
  } else {
    console.log('✓ Bucket "learn-guides" already exists')
  }
}

async function main() {
  await ensureBucket()

  for (const guide of GUIDES) {
    const pdf = makePdf(guide.title, guide.plan, guide.pages)
    const path = `guides/${guide.slug}.pdf`

    const { error } = await supabase.storage
      .from('learn-guides')
      .upload(path, pdf, { contentType: 'application/pdf', upsert: true })

    if (error) {
      console.error(`✗ ${guide.slug}: ${error.message}`)
    } else {
      console.log(`✓ Uploaded ${path} (${pdf.length} bytes)`)
    }
  }

  console.log('\nDone. Test a download at /learn with a Pro account.')
}

main().catch(err => { console.error(err); process.exit(1) })
