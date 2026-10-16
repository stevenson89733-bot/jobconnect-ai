/**
 * Shared renderer for JobConnect AI Learn-guide PDFs.
 *
 * Gives every guide the same "designed document" typography instead of a
 * templated slide-deck look: justified, hyphenated body copy in a serif
 * typeface, a centered cover, and real page numbers via Puppeteer's
 * header/footer templates (not a hand-counted CSS counter).
 */

import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function loadSupabaseClient() {
  const envPath = resolve(__dirname, '../../.env.local')
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
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }
  return createClient(supabaseUrl, serviceKey)
}

const BASE_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #2a2f33;
    margin: 0;
  }

  .cover {
    width: 100%; height: 100vh;
    background: #0c1830;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 70px;
    page-break-after: always;
  }
  .cover .brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 64px; }
  .cover .dot { width: 14px; height: 14px; border-radius: 50%; background: #57c7e3; }
  .cover .brand-name { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.02em; }
  .cover .kicker { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #7fd4e8; margin-bottom: 18px; }
  .cover h1 { font-size: 40px; font-weight: 700; line-height: 1.18; margin: 0 0 22px; letter-spacing: -0.01em; max-width: 560px; }
  .cover h1 .accent { color: #57c7e3; }
  .cover p { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #b9c2d6; font-size: 14px; line-height: 1.7; max-width: 420px; margin: 0; }
  .cover .url { position: absolute; bottom: 48px; color: #7a86a3; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; }

  .content { padding: 64px 70px 50px; }
  section { margin-bottom: 42px; page-break-inside: avoid; }
  section.newpage { page-break-before: always; }
  .eyebrow { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #8a94ab; margin: 0 0 6px; }
  h2 { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #1c2740; font-size: 21px; font-weight: 700; border-bottom: 2px solid #315bea; padding-bottom: 10px; margin: 0 0 18px; }
  h3 { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #315bea; font-size: 14px; font-weight: 700; margin: 18px 0 8px; }
  p { font-size: 13px; line-height: 1.8; margin: 0 0 12px; color: #33404f; text-align: justify; hyphens: auto; -webkit-hyphens: auto; }
  p.center { text-align: center; }
  p.lead { font-size: 14.5px; line-height: 1.75; color: #1c2740; }
  ol, ul { margin: 0 0 12px; padding-left: 22px; }
  li { font-size: 13px; line-height: 1.75; margin-bottom: 8px; color: #33404f; text-align: left; }
  blockquote { margin: 14px 0 18px; padding: 14px 20px; border-left: 3px solid #315bea; background: #f5f7fc; font-style: italic; color: #2e3a4d; font-size: 12.5px; line-height: 1.7; }
  .qa { margin-bottom: 15px; }
  .qa .q { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-style: italic; color: #1a2130; margin-bottom: 4px; }
  .qa .a { font-size: 13px; color: #45515f; margin-left: 12px; margin-bottom: 6px; text-align: left; }
  table.plan { width: 100%; border-collapse: collapse; margin: 14px 0 18px; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }
  table.plan th { background: #f3f5fb; color: #315bea; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; text-align: left; padding: 10px 13px; border-bottom: 1px solid #e2e6ed; }
  table.plan td { font-size: 12px; line-height: 1.6; color: #44505f; padding: 10px 13px; border-bottom: 1px solid #edf0f5; vertical-align: top; text-align: left; }
  .tmpl { background: #f7f9fc; border: 1px solid #e2e6ed; border-radius: 6px; padding: 16px 18px; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.75; color: #44505f; margin: 10px 0 18px; text-align: left; }
  .note { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #7d8aa0; margin: 0 0 14px 12px; text-align: left; }
  .disclaimer { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 10.5px; color: #8a94ab; border-top: 1px solid #e2e6ed; margin-top: 10px; padding-top: 10px; text-align: left; }
`

export function buildHtml({ kicker, titleLines, subtitle, sections }) {
  const titleHtml = titleLines.map((line, i) =>
    i === titleLines.length - 1 ? `<span class="accent">${line}</span>` : line
  ).join('<br>')

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${BASE_CSS}</style>
</head>
<body>
  <div class="cover">
    <div class="brand"><div class="dot"></div><div class="brand-name">JobConnect AI</div></div>
    <div class="kicker">${kicker}</div>
    <h1>${titleHtml}</h1>
    <p>${subtitle}</p>
    <div class="url">jobconnect-ai.com</div>
  </div>
  <div class="content">
    ${sections.map(s => `<section${s.newPage ? ' class="newpage"' : ''}>${s.eyebrow ? `<p class="eyebrow">${s.eyebrow}</p>` : ''}<h2>${s.heading}</h2>${s.body}</section>`).join('\n')}
  </div>
</body>
</html>`
}

const FOOTER_TEMPLATE = `
  <div style="width:100%; font-family: -apple-system, Helvetica, Arial, sans-serif; font-size:9px; color:#9aa4b4; display:flex; justify-content:space-between; padding: 0 70px;">
    <span class="title"></span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>
`

export async function renderGuidePdf({ kicker, titleLines, subtitle, sections, docTitle }) {
  const html = buildHtml({ kicker, titleLines, subtitle, sections })
  const browser = await puppeteer.launch({ headless: 'new' })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    if (process.env.DEBUG_MEASURE) {
      const h = await page.evaluate(() => document.body.scrollHeight)
      console.log(`DEBUG body scrollHeight: ${h}px (A4 page ≈ 1123px at 96dpi)`)
    }
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '34px', left: '0' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: FOOTER_TEMPLATE.replace('<span class="title"></span>', `<span>${docTitle}</span>`),
    })
    const pageCount = (await PDFDocument.load(pdf)).getPageCount()
    return { pdf, pageCount }
  } finally {
    await browser.close()
  }
}

export async function uploadGuide(supabase, pdf, storagePath) {
  const { error } = await supabase.storage
    .from('learn-guides')
    .upload(storagePath, pdf, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`Upload failed: ${error.message}`)
}
