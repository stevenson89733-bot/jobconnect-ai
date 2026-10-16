/**
 * Generates the "Remote Interview Prep Playbook" PDF by rendering HTML/CSS
 * with Puppeteer's bundled Chromium (downloaded to ~/.cache/puppeteer), then
 * uploads it to Supabase Storage.
 *
 * Run: node scripts/generate-interview-prep-guide-v2.mjs
 * Output: /tmp/remote-interview-prep-playbook.pdf
 *         + upload to learn-guides/guides/remote-interview-prep-playbook.pdf
 */

import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = '/tmp/remote-interview-prep-playbook.pdf'
const STORAGE_PATH = 'guides/remote-interview-prep-playbook.pdf'

function loadSupabaseEnv() {
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
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }
  return createClient(supabaseUrl, serviceKey)
}

const SECTIONS = [
  {
    heading: '1. Before You Log On',
    body: `
      <p>Remote interviews are judged on signal, not vibes — recruiters can't read a room over a laptop camera, so every detail you control matters more than it would in person.</p>
      <p><strong>Checklist:</strong></p>
      <ul>
        <li>Test your camera, mic, and lighting at the exact time of day the interview is scheduled — not the night before.</li>
        <li>Close every tab and app except the video call. Mute phone notifications.</li>
        <li>Have your resume, the job description, and 2–3 questions for the interviewer open in a single document, not scattered across windows.</li>
        <li>Join 2 minutes early. Joining late reads as a red flag; joining 10 minutes early is awkward for the host.</li>
        <li>Pick a plain, well-lit background. A messy room is the most common unforced error in remote interviews.</li>
      </ul>`,
  },
  {
    heading: '2. The Technical Setup Checklist',
    body: `
      <ul>
        <li>Wired ethernet beats Wi-Fi if you have the option — video calls expose network jitter instantly.</li>
        <li>Headphones with a mic reduce echo and make you easier to understand than laptop speakers.</li>
        <li>Keep a phone hotspot ready as backup in case your primary connection drops mid-interview.</li>
        <li>Know the platform. If it's a tool you've never used (Google Meet, Zoom, Teams, a custom ATS video link), open it a day ahead and do a solo test call.</li>
        <li>Have a notepad and pen next to you — don't rely on typing notes while on camera, it reads as distracted.</li>
      </ul>`,
  },
  {
    heading: '3. Common Remote Interview Questions',
    body: `
      <p>Remote-specific questions show up in almost every interview for a distributed role. Prepare a real, specific example for each — not a generic answer.</p>
      <div class="qa"><p class="q">"How do you stay productive without someone watching over your shoulder?"</p><p class="a">→ Describe your actual daily structure: time blocks, tools, how you handle distractions.</p></div>
      <div class="qa"><p class="q">"How do you handle working across time zones?"</p><p class="a">→ Give a concrete example of async handoffs or overlap-hours scheduling you've done.</p></div>
      <div class="qa"><p class="q">"Tell me about a time you had a miscommunication with a remote teammate."</p><p class="a">→ Show you default to writing things down and over-communicating, not assuming.</p></div>
      <div class="qa"><p class="q">"What does your home office setup look like?"</p><p class="a">→ Keep it short and practical — a dedicated space, reliable internet, basic ergonomics.</p></div>
      <div class="qa"><p class="q">"Why do you want a remote role specifically, not just any job?"</p><p class="a">→ Tie this to how you actually work best, not just lifestyle convenience.</p></div>`,
  },
  {
    heading: '4. During the Interview',
    body: `
      <ul>
        <li>Look at the camera, not the screen, when speaking — it's the closest thing to eye contact you have.</li>
        <li>Leave a beat of silence before answering. Video calls clip the start of sentences and talking over each other is more common on video.</li>
        <li>Narrate your screen-share. If asked to walk through a project, say what you're clicking before you click it.</li>
        <li>It's fine to say "let me think for a second" — silence reads better than filler words on a recording.</li>
        <li>If the connection drops, reconnect immediately and briefly apologize once. Don't over-explain.</li>
      </ul>`,
  },
  {
    heading: '5. Cross-Border & International Considerations',
    body: `
      <p>If you're interviewing for a role in another country or with a global team, a few extra details matter:</p>
      <ul>
        <li>Double-check the interview time in your local timezone against theirs — confirm in writing, don't assume you converted it correctly.</li>
        <li>Research whether the company sponsors visas, uses an Employer of Record, or hires contractors — ask directly if the job post doesn't say.</li>
        <li>Be ready to explain your current work authorization status in one or two sentences, clearly and without over-explaining.</li>
        <li>Mention any experience working with distributed, multicultural teams — it's a real differentiator for cross-border roles.</li>
      </ul>`,
  },
  {
    heading: '6. After the Interview',
    body: `
      <ul>
        <li>Send a short thank-you email within 24 hours. Reference one specific thing discussed — generic templates are easy to spot.</li>
        <li>If you said you'd follow up with something (a portfolio link, a reference, a writing sample), send it the same day.</li>
        <li>If you don't hear back by the timeline they gave you, one polite follow-up is appropriate. More than one isn't.</li>
        <li>Write down what you were asked while it's fresh — it's the best prep material you'll have for the next interview.</li>
      </ul>`,
  },
]

const HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #2a2f33; margin: 0; }

  .cover {
    width: 100%; height: 100vh;
    background: #0c1830;
    color: #fff;
    padding: 90px 56px;
    page-break-after: always;
  }
  .cover .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 120px; }
  .cover .dot { width: 14px; height: 14px; border-radius: 50%; background: #57c7e3; }
  .cover .brand-name { font-weight: 700; font-size: 14px; }
  .cover h1 { font-size: 42px; font-weight: 800; line-height: 1.1; margin: 0 0 8px; letter-spacing: -0.03em; }
  .cover h1 .accent { color: #57c7e3; }
  .cover p { color: #b9c2d6; font-size: 14px; line-height: 1.6; max-width: 420px; margin-top: 24px; }
  .cover .url { position: absolute; bottom: 60px; color: #7a86a3; font-size: 11px; }

  .content { padding: 50px 56px; }
  section { margin-bottom: 30px; page-break-inside: avoid; }
  h2 { color: #315bea; font-size: 18px; font-weight: 700; border-bottom: 1px solid #e2e6ed; padding-bottom: 8px; margin: 0 0 14px; }
  p { font-size: 11.5px; line-height: 1.6; margin: 0 0 8px; color: #44505f; }
  ul { margin: 0 0 8px; padding-left: 18px; }
  li { font-size: 11.5px; line-height: 1.6; margin-bottom: 6px; color: #44505f; }
  .qa { margin-bottom: 10px; }
  .qa .q { font-size: 11.5px; font-style: italic; color: #1a2130; margin-bottom: 2px; }
  .qa .a { font-size: 11.5px; color: #596579; margin-left: 10px; }
  footer { font-size: 9px; color: #9aa4b4; padding: 0 56px 30px; }
</style>
</head>
<body>
  <div class="cover">
    <div class="brand"><div class="dot"></div><div class="brand-name">JobConnect AI</div></div>
    <h1>Remote Interview<br><span class="accent">Prep Playbook</span></h1>
    <p>A practical, no-fluff checklist for acing remote and cross-border interviews — setup, common questions, and follow-up, in one place.</p>
    <div class="url">jobconnect-ai.com</div>
  </div>
  <div class="content">
    ${SECTIONS.map(s => `<section><h2>${s.heading}</h2>${s.body}</section>`).join('\n')}
  </div>
  <footer>Built by JobConnect AI — AI-powered careers for a world without borders.</footer>
</body>
</html>`

async function main() {
  const supabase = loadSupabaseEnv()

  const browser = await puppeteer.launch({ headless: 'new' })
  let pdf
  try {
    const page = await browser.newPage()
    await page.setContent(HTML, { waitUntil: 'networkidle0' })
    pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
  } finally {
    await browser.close()
  }

  writeFileSync(OUT_PATH, pdf)
  const pageCount = (await PDFDocument.load(pdf)).getPageCount()
  console.log(`✓ PDF generated (${pageCount} pages)`)

  const { error } = await supabase.storage
    .from('learn-guides')
    .upload(STORAGE_PATH, pdf, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`Upload failed: ${error.message}`)

  console.log(`✓ Uploaded to learn-guides/${STORAGE_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })
