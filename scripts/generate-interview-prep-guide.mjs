/**
 * Generates the "Remote Interview Prep Playbook" lead-magnet PDF with pdf-lib.
 *
 * Run: node scripts/generate-interview-prep-guide.mjs
 * Output: public/guides/remote-interview-prep-playbook.pdf
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '../public/guides/remote-interview-prep-playbook.pdf')

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 56
const CONTENT_W = PAGE_W - MARGIN * 2

const NAVY = rgb(0.047, 0.086, 0.188)   // #0C1630-ish, matches landing hero
const BLUE = rgb(0.192, 0.357, 0.918)   // #315bea
const SLATE = rgb(0.29, 0.33, 0.39)
const MUTED = rgb(0.47, 0.52, 0.6)
const WHITE = rgb(1, 1, 1)

const SECTIONS = [
  {
    heading: '1. Before You Log On',
    body: [
      'Remote interviews are judged on signal, not vibes — recruiters can\'t read a room over a laptop camera, so every detail you control matters more than it would in person.',
      '',
      'Checklist:',
      '• Test your camera, mic, and lighting at the exact time of day the interview is scheduled — not the night before.',
      '• Close every tab and app except the video call. Mute phone notifications.',
      '• Have your resume, the job description, and 2–3 questions for the interviewer open in a single document, not scattered across windows.',
      '• Join 2 minutes early. Joining late reads as a red flag; joining 10 minutes early is awkward for the host.',
      '• Pick a plain, well-lit background. A messy room is the most common unforced error in remote interviews.',
    ],
  },
  {
    heading: '2. The Technical Setup Checklist',
    body: [
      '• Wired ethernet beats Wi-Fi if you have the option — video calls expose network jitter instantly.',
      '• Headphones with a mic reduce echo and make you easier to understand than laptop speakers.',
      '• Keep a phone hotspot ready as backup in case your primary connection drops mid-interview.',
      '• Know the platform. If it\'s a tool you\'ve never used (Google Meet, Zoom, Teams, a custom ATS video link), open it a day ahead and do a solo test call.',
      '• Have a notepad and pen next to you — don\'t rely on typing notes while on camera, it reads as distracted.',
    ],
  },
  {
    heading: '3. Common Remote Interview Questions',
    body: [
      'Remote-specific questions show up in almost every interview for a distributed role. Prepare a real, specific example for each — not a generic answer.',
      '',
      '• "How do you stay productive without someone watching over your shoulder?"',
      '  -> Describe your actual daily structure: time blocks, tools, how you handle distractions.',
      '',
      '• "How do you handle working across time zones?"',
      '  -> Give a concrete example of async handoffs or overlap-hours scheduling you\'ve done.',
      '',
      '• "Tell me about a time you had a miscommunication with a remote teammate."',
      '  -> Show you default to writing things down and over-communicating, not assuming.',
      '',
      '• "What does your home office setup look like?"',
      '  -> Keep it short and practical — a dedicated space, reliable internet, basic ergonomics.',
      '',
      '• "Why do you want a remote role specifically, not just any job?"',
      '  -> Tie this to how you actually work best, not just lifestyle convenience.',
    ],
  },
  {
    heading: '4. During the Interview',
    body: [
      '• Look at the camera, not the screen, when speaking — it\'s the closest thing to eye contact you have.',
      '• Leave a beat of silence before answering. Video calls clip the start of sentences and talking over each other is more common on video.',
      '• Narrate your screen-share. If asked to walk through a project, say what you\'re clicking before you click it.',
      '• It\'s fine to say "let me think for a second" — silence reads better than filler words on a recording.',
      '• If the connection drops, reconnect immediately and briefly apologize once. Don\'t over-explain.',
    ],
  },
  {
    heading: '5. Cross-Border & International Considerations',
    body: [
      'If you\'re interviewing for a role in another country or with a global team, a few extra details matter:',
      '',
      '• Double-check the interview time in your local timezone against theirs — confirm in writing, don\'t assume you converted it correctly.',
      '• Research whether the company sponsors visas, uses an Employer of Record, or hires contractors — ask directly if the job post doesn\'t say.',
      '• Be ready to explain your current work authorization status in one or two sentences, clearly and without over-explaining.',
      '• Mention any experience working with distributed, multicultural teams — it\'s a real differentiator for cross-border roles.',
    ],
  },
  {
    heading: '6. After the Interview',
    body: [
      '• Send a short thank-you email within 24 hours. Reference one specific thing discussed — generic templates are easy to spot.',
      '• If you said you\'d follow up with something (a portfolio link, a reference, a writing sample), send it the same day.',
      '• If you don\'t hear back by the timeline they gave you, one polite follow-up is appropriate. More than one isn\'t.',
      '• Write down what you were asked while it\'s fresh — it\'s the best prep material you\'ll have for the next interview.',
    ],
  },
]

function wrapText(font, text, size, maxWidth) {
  if (text === '') return ['']
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

async function main() {
  const pdf = await PDFDocument.create()
  pdf.setTitle('Remote Interview Prep Playbook')
  pdf.setAuthor('JobConnect AI')
  pdf.setSubject('A practical checklist and question guide for remote and cross-border job interviews.')

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  // ── Cover page ──
  const cover = pdf.addPage([PAGE_W, PAGE_H])
  cover.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: NAVY })
  cover.drawCircle({ x: MARGIN + 7, y: PAGE_H - 108, size: 7, color: rgb(0.34, 0.78, 0.89) })
  cover.drawText('JobConnect AI', { x: MARGIN + 22, y: PAGE_H - 113, size: 14, font: bold, color: WHITE })
  cover.drawText('Remote Interview', { x: MARGIN, y: PAGE_H - 230, size: 36, font: bold, color: WHITE })
  cover.drawText('Prep Playbook', { x: MARGIN, y: PAGE_H - 275, size: 36, font: bold, color: rgb(0.34, 0.78, 0.89) })
  const coverLines = wrapText(font, 'A practical, no-fluff checklist for acing remote and cross-border interviews — setup, common questions, and follow-up, in one place.', 13, CONTENT_W - 40)
  let cy = PAGE_H - 330
  for (const l of coverLines) {
    cover.drawText(l, { x: MARGIN, y: cy, size: 13, font, color: rgb(0.74, 0.78, 0.86) })
    cy -= 20
  }
  cover.drawText('jobconnect-ai.com', { x: MARGIN, y: 50, size: 10, font, color: rgb(0.55, 0.6, 0.72) })

  // ── Content pages ──
  let page = pdf.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  function ensureSpace(needed) {
    if (y - needed < MARGIN) {
      page = pdf.addPage([PAGE_W, PAGE_H])
      y = PAGE_H - MARGIN
    }
  }

  for (const section of SECTIONS) {
    ensureSpace(60)
    page.drawText(section.heading, { x: MARGIN, y, size: 18, font: bold, color: BLUE })
    y -= 10
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 1,
      color: rgb(0.88, 0.9, 0.94),
    })
    y -= 24

    for (const paragraph of section.body) {
      if (paragraph === '') {
        y -= 10
        continue
      }
      const isBullet = paragraph.startsWith('•') || paragraph.startsWith('  ->')
      const useFont = isBullet ? font : font
      const size = 11
      const indent = paragraph.startsWith('  ->') ? MARGIN + 14 : MARGIN
      const lines = wrapText(useFont, paragraph, size, CONTENT_W - (indent - MARGIN))
      for (const line of lines) {
        ensureSpace(18)
        page.drawText(line, { x: indent, y, size, font: useFont, color: SLATE })
        y -= 16
      }
    }
    y -= 14
  }

  // Footer note on last page
  ensureSpace(40)
  page.drawText('Built by JobConnect AI — AI-powered careers for a world without borders.', {
    x: MARGIN,
    y: MARGIN - 10 > 0 ? Math.max(y, MARGIN - 10) : MARGIN,
    size: 9,
    font,
    color: MUTED,
  })

  mkdirSync(dirname(OUT_PATH), { recursive: true })
  const bytes = await pdf.save()
  writeFileSync(OUT_PATH, bytes)
  console.log(`✓ Wrote ${OUT_PATH} (${bytes.length} bytes, ${pdf.getPageCount()} pages)`)
}

main().catch(err => { console.error(err); process.exit(1) })
