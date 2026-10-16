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
    heading: '1. How to Use This Playbook',
    body: `
      <p>This is a working document, not a reading assignment. The fastest way to get value from it: read Section 2 now, run the 7-Day Timeline starting today regardless of how many days you actually have left, and treat Section 5's question bank as a rehearsal script — say your answers out loud, don't just read them.</p>
      <p>Every section ends with something to <em>do</em>, not just know. If you only have an hour before your interview, read Sections 3, 4, and 9 — setup, the STAR method refresher, and the final pre-call checklist.</p>`,
  },
  {
    heading: '2. The 7-Day Prep Timeline',
    body: `
      <p>Compress or stretch this to whatever time you actually have — the order matters more than the pacing.</p>
      <table class="plan">
        <tr><th>Day</th><th>Focus</th><th>Output</th></tr>
        <tr><td>7</td><td>Research the company: product, recent news, funding stage, competitors.</td><td>One page of notes you'd be comfortable being quizzed on.</td></tr>
        <tr><td>6</td><td>Re-read the job description line by line. Map each requirement to a real example from your history.</td><td>A requirement-to-example table.</td></tr>
        <tr><td>5</td><td>Draft STAR answers for 6 behavioral questions from Section 5.</td><td>Written answers, 90 seconds each when spoken.</td></tr>
        <tr><td>4</td><td>Record yourself answering 3 of those out loud. Watch it back once.</td><td>A list of verbal tics or filler words to cut.</td></tr>
        <tr><td>3</td><td>Prepare 5 questions to ask the interviewer (Section 7). Research your interviewer on LinkedIn if named in the invite.</td><td>Questions written down, not memorized loosely.</td></tr>
        <tr><td>2</td><td>Full technical dry run: camera, mic, lighting, platform, backup connection (Section 4).</td><td>A tested setup, done at the actual interview time of day.</td></tr>
        <tr><td>1</td><td>Light review only. Re-read your notes once. Sleep on time.</td><td>Calm, not cramming.</td></tr>
      </table>`,
  },
  {
    heading: '3. Before You Log On',
    body: `
      <p>Remote interviews are judged on signal, not vibes — recruiters can't read a room over a laptop camera, so every detail you control matters more than it would in person.</p>
      <p><strong>Checklist:</strong></p>
      <ul>
        <li>Test your camera, mic, and lighting at the exact time of day the interview is scheduled — not the night before.</li>
        <li>Close every tab and app except the video call. Mute phone notifications.</li>
        <li>Have your resume, the job description, and your 2–3 questions for the interviewer open in a single document, not scattered across windows.</li>
        <li>Join 2 minutes early. Joining late reads as a red flag; joining 10 minutes early is awkward for the host.</li>
        <li>Pick a plain, well-lit background. A messy room is the most common unforced error in remote interviews.</li>
        <li>Silence every device that isn't the one you're interviewing on, including smartwatches.</li>
      </ul>`,
  },
  {
    heading: '4. The Technical Setup Checklist',
    body: `
      <ul>
        <li>Wired ethernet beats Wi-Fi if you have the option — video calls expose network jitter instantly.</li>
        <li>Headphones with a mic reduce echo and make you easier to understand than laptop speakers.</li>
        <li>Keep a phone hotspot ready as backup in case your primary connection drops mid-interview.</li>
        <li>Know the platform. If it's a tool you've never used (Google Meet, Zoom, Teams, a custom ATS video link), open it a day ahead and do a solo test call.</li>
        <li>Have a notepad and pen next to you — don't rely on typing notes while on camera, it reads as distracted.</li>
        <li>Check your webcam's eye-level: prop your laptop so the camera sits at eye height, not looking up your nose or down at your scalp.</li>
        <li>Plug in. A laptop running on battery sometimes throttles performance mid-call under thermal load.</li>
      </ul>`,
  },
  {
    heading: '5. The STAR Method, Refreshed',
    body: `
      <p>Every behavioral question is really asking: "tell me a true story with a shape I can evaluate." STAR gives that shape — <strong>S</strong>ituation, <strong>T</strong>ask, <strong>A</strong>ction, <strong>R</strong>esult. Most candidates over-invest in Situation and under-invest in Action and Result, which is backwards: the interviewer is scoring what <em>you</em> did and what happened because of it.</p>
      <p><strong>Worked example</strong> — for "Tell me about a time you disagreed with a decision":</p>
      <div class="qa">
        <p class="a"><strong>Situation (10%):</strong> "On my last team, our lead wanted to ship a feature without an opt-out, and I was worried about churn."</p>
        <p class="a"><strong>Task (10%):</strong> "I needed to raise the concern without just overriding the decision — it wasn't my call to make alone."</p>
        <p class="a"><strong>Action (50%):</strong> "I pulled churn data from a similar change we'd made six months earlier, wrote a one-page comparison, and asked for 15 minutes before the ship date to walk through it with the lead and PM together."</p>
        <p class="a"><strong>Result (30%):</strong> "We added the opt-out. Churn on that cohort stayed flat instead of the 4% dip we'd seen last time. The lead later asked me to review two other launches the same way."</p>
      </div>
      <p>Notice the story is specific — real numbers, a real artifact (the one-pager), a real outcome. Vague stories ("I always try to communicate well") don't score, because there's nothing to verify or probe.</p>`,
  },
  {
    heading: '6. Behavioral Question Bank',
    body: `
      <p>Draft a STAR answer for each. You don't need to memorize the wording — you need the <em>shape</em> fixed in your head so you're not improvising the facts under pressure.</p>
      <div class="qa"><p class="q">1. Tell me about a time you missed a deadline.</p><p class="a">→ Own it fast, then focus on what changed afterward in how you plan or flag risk.</p></div>
      <div class="qa"><p class="q">2. Describe a conflict with a coworker and how you resolved it.</p><p class="a">→ Pick a real disagreement about work, not a personality clash — show you addressed it directly.</p></div>
      <div class="qa"><p class="q">3. Tell me about a time you had to learn something quickly.</p><p class="a">→ Name the actual resource or method you used, not just "I read the docs."</p></div>
      <div class="qa"><p class="q">4. Describe a project that failed. What did you learn?</p><p class="a">→ Pick one that genuinely failed — a half-success reads as dodging the question.</p></div>
      <div class="qa"><p class="q">5. Tell me about a time you received critical feedback.</p><p class="a">→ Show what specifically changed in your work afterward, not just that you "took it well."</p></div>
      <div class="qa"><p class="q">6. Describe a time you had to influence someone without authority over them.</p><p class="a">→ This is the "disagree and commit" story — evidence, not persuasion by volume.</p></div>
      <div class="qa"><p class="q">7. Tell me about your proudest piece of work.</p><p class="a">→ Pick something where your specific contribution is clear, not a team win you can't isolate your part in.</p></div>
      <div class="qa"><p class="q">8. Describe a time you had to say no to a stakeholder.</p><p class="a">→ Show the tradeoff you explained, not just the refusal.</p></div>
      <div class="qa"><p class="q">9. Tell me about a time you worked with incomplete information.</p><p class="a">→ Show how you decided what to clarify versus what to assume, and why.</p></div>
      <div class="qa"><p class="q">10. Where do you want to be in three years, and how does this role fit?</p><p class="a">→ Answer honestly about growth direction; connecting it loosely to this role reads better than forcing a perfect match.</p></div>
      <p style="margin-top:16px"><strong>Two more worked full answers, to show the pattern applied to harder prompts:</strong></p>
      <p><em>Q4 — "Describe a project that failed. What did you learn?"</em></p>
      <div class="qa">
        <p class="a"><strong>Situation:</strong> "I led the migration of a reporting pipeline to a new data warehouse, on a timeline I'd set myself."</p>
        <p class="a"><strong>Task:</strong> "I needed to cut the old pipeline over without breaking the dashboards three other teams relied on daily."</p>
        <p class="a"><strong>Action:</strong> "I underestimated how many downstream dashboards referenced the old schema directly. I cut over on the planned date anyway instead of auditing dependencies first, and six dashboards broke the same morning."</p>
        <p class="a"><strong>Result:</strong> "We rolled back within two hours, but it cost real trust. Afterward I built a dependency-mapping step into every migration I've run since — on the next one, we found 14 hidden dependencies before cutover, not after."</p>
      </div>
      <p><em>Q6 — "Describe a time you had to influence someone without authority over them."</em></p>
      <div class="qa">
        <p class="a"><strong>Situation:</strong> "A peer on another team owned an API our feature depended on, and their roadmap kept bumping our integration."</p>
        <p class="a"><strong>Task:</strong> "I had no authority to reprioritize their backlog — I needed them to want to move it up."</p>
        <p class="a"><strong>Action:</strong> "Instead of escalating, I quantified the user impact of the delay with actual support-ticket data and brought it to their planning meeting as a tradeoff for them to weigh, not a demand."</p>
        <p class="a"><strong>Result:</strong> "They moved it up two sprints on their own. I learned that bringing evidence to someone else's prioritization process works better than asking for a favor."</p>
      </div>`,
  },
  {
    heading: '7. Remote & Distributed-Work Questions',
    body: `
      <p>Remote-specific questions show up in almost every interview for a distributed role. Prepare a real, specific example for each — not a generic answer.</p>
      <div class="qa"><p class="q">"How do you stay productive without someone watching over your shoulder?"</p><p class="a">→ Describe your actual daily structure: time blocks, tools, how you handle distractions.</p></div>
      <div class="qa"><p class="q">"How do you handle working across time zones?"</p><p class="a">→ Give a concrete example of async handoffs or overlap-hours scheduling you've done.</p></div>
      <div class="qa"><p class="q">"Tell me about a time you had a miscommunication with a remote teammate."</p><p class="a">→ Show you default to writing things down and over-communicating, not assuming.</p></div>
      <div class="qa"><p class="q">"What does your home office setup look like?"</p><p class="a">→ Keep it short and practical — a dedicated space, reliable internet, basic ergonomics.</p></div>
      <div class="qa"><p class="q">"Why do you want a remote role specifically, not just any job?"</p><p class="a">→ Tie this to how you actually work best, not just lifestyle convenience.</p></div>
      <div class="qa"><p class="q">"How do you build relationships with people you've never met in person?"</p><p class="a">→ Mention specific habits: regular 1:1s, virtual coffee chats, over-communicating context in writing.</p></div>
      <div class="qa"><p class="q">"Describe how you'd onboard yourself with no in-person orientation."</p><p class="a">→ Show initiative: scheduling your own intro calls, reading documentation proactively, asking targeted questions early.</p></div>
      <div class="qa"><p class="q">"What's the hardest part of remote work for you, honestly?"</p><p class="a">→ Pick something real and show the specific mitigation you use — vague answers ("isolation") without a fix read as unresolved.</p></div>`,
  },
  {
    heading: '8. Framing Technical & Role-Competency Questions',
    body: `
      <p>You usually don't know the exact rubric for a technical or role-specific round. A few habits transfer across almost every discipline:</p>
      <ul>
        <li><strong>Think out loud.</strong> Interviewers are often scoring your process, not just your final answer. Silence while you work is harder to evaluate than narrated reasoning.</li>
        <li><strong>Clarify before you commit.</strong> Restate the problem in your own words and ask one clarifying question before diving in — it signals rigor, not uncertainty.</li>
        <li><strong>Name your assumptions.</strong> If a requirement is ambiguous, say what you're assuming and why, so the interviewer can correct you early instead of watching you build on a wrong premise.</li>
        <li><strong>Size the solution to the time box.</strong> A rough, working answer delivered on time beats a perfect answer you run out of time to finish.</li>
        <li><strong>Connect back to impact.</strong> When you finish, briefly say what you'd do next or what tradeoff you made — it shows you're thinking past the exercise itself.</li>
      </ul>`,
  },
  {
    heading: '9. Questions to Ask Your Interviewer',
    body: `
      <p>Asking sharp questions is itself part of the evaluation — it shows you're assessing fit, not just hoping to be picked. Pick 3–4, matched to who you're talking to.</p>
      <p><strong>About the role:</strong></p>
      <ul>
        <li>"What does success in this role look like at the 90-day mark?"</li>
        <li>"What's the biggest challenge the last person in this role — or the team — ran into?"</li>
      </ul>
      <p><strong>About the team and how remote work actually runs:</strong></p>
      <ul>
        <li>"How does the team handle time zone overlap day to day?"</li>
        <li>"What does a typical week look like — how much is sync vs. async?"</li>
      </ul>
      <p><strong>About growth and evaluation:</strong></p>
      <ul>
        <li>"How is performance evaluated for someone fully remote?"</li>
        <li>"What growth paths have people in this role typically taken?"</li>
      </ul>
      <p><strong>For cross-border roles specifically:</strong></p>
      <ul>
        <li>"How does the company handle international hiring — direct employment, EOR, or contractor?"</li>
        <li>"Is there support for things like equipment, home-office stipend, or local compliance?"</li>
      </ul>`,
  },
  {
    heading: '10. During the Interview',
    body: `
      <ul>
        <li>Look at the camera, not the screen, when speaking — it's the closest thing to eye contact you have.</li>
        <li>Leave a beat of silence before answering. Video calls clip the start of sentences and talking over each other is more common on video.</li>
        <li>Narrate your screen-share. If asked to walk through a project, say what you're clicking before you click it.</li>
        <li>It's fine to say "let me think for a second" — silence reads better than filler words on a recording.</li>
        <li>If the connection drops, reconnect immediately and briefly apologize once. Don't over-explain.</li>
        <li>If you don't understand a question, ask for it to be rephrased rather than guessing at intent — video calls make it easy to mishear.</li>
      </ul>`,
  },
  {
    heading: '10b. Sample Mock Interview Transcript',
    body: `
      <p>A short annotated exchange, showing the habits from this playbook applied in sequence.</p>
      <div class="qa"><p class="q">Interviewer: "Walk me through a time you had to push back on a deadline."</p></div>
      <div class="qa"><p class="a"><strong>Candidate:</strong> "Sure — on my last project, I was asked to ship a redesigned checkout flow in two weeks. After scoping it for a day, I came back and said two weeks only worked if we cut A/B testing, which I didn't think was worth the risk on checkout specifically. I proposed three weeks with testing instead, and laid out the conversion risk of skipping it using data from a similar change the quarter before."</p></div>
      <p class="note">↳ <em>Annotation: notice the candidate didn't just say "I pushed back" — they named the actual tradeoff and backed it with a specific number. That's the Action and Result doing the work, not adjectives.</em></p>
      <div class="qa"><p class="q">Interviewer: "How did that land with your manager?"</p></div>
      <div class="qa"><p class="a"><strong>Candidate:</strong> "They took the extra week. We shipped with testing, and the new flow converted 6% better than the old one — which wouldn't have been visible if we'd skipped the test to hit the original date."</p></div>
      <p class="note">↳ <em>Annotation: the follow-up answer stays just as concrete. A weaker answer here would drift into generalities ("it went well") instead of closing the loop with a result.</em></p>`,
  },
  {
    heading: '11. Cross-Border & International Considerations',
    body: `
      <p>If you're interviewing for a role in another country or with a global team, a few extra details matter:</p>
      <ul>
        <li>Double-check the interview time in your local timezone against theirs — confirm in writing, don't assume you converted it correctly.</li>
        <li>Research whether the company sponsors visas, uses an Employer of Record, or hires contractors — ask directly if the job post doesn't say.</li>
        <li>Be ready to explain your current work authorization status in one or two sentences, clearly and without over-explaining.</li>
        <li>Mention any experience working with distributed, multicultural teams — it's a real differentiator for cross-border roles.</li>
      </ul>
      <p><strong>Employment structures you'll run into:</strong></p>
      <table class="plan">
        <tr><th>Structure</th><th>What it means for you</th></tr>
        <tr><td>Direct employee (local entity)</td><td>Company has a legal entity in your country; standard local payroll, benefits, and tax withholding.</td></tr>
        <tr><td>Employer of Record (EOR)</td><td>A third party legally employs you on the company's behalf; benefits and contracts follow local law, but your day-to-day manager is still at the company.</td></tr>
        <tr><td>Independent contractor</td><td>You invoice the company directly; you handle your own taxes and typically get no employee benefits — confirm whether this affects your home country's labor protections.</td></tr>
      </table>
      <p><strong>Cultural notes that come up in cross-border interviews:</strong> directness norms vary widely — some interview cultures expect confident, assertive self-promotion, others read that as off-putting and favor understatement. When in doubt, mirror the interviewer's register rather than guessing which extreme to perform.</p>`,
  },
  {
    heading: '12. The Salary & Offer Conversation',
    body: `
      <p>You don't need a full negotiation playbook here — just enough to not lose ground by accident during the interview itself.</p>
      <ul>
        <li>If asked for a number early, it's reasonable to redirect: "I'd like to understand the role fully first — what range is budgeted for this position?"</li>
        <li>If pressed, give a researched range, not a single number, and anchor it to market data for the role and region, not just your last salary.</li>
        <li>Never lie about your current compensation, but you're also not obligated to volunteer it unprompted.</li>
        <li>For cross-border roles, clarify whether the number quoted is gross or net, and in which currency — this changes the comparison a lot.</li>
      </ul>`,
  },
  {
    heading: '13. Red Flags to Watch For',
    body: `
      <p>You're evaluating them too. A few signals worth noting during the call itself:</p>
      <ul>
        <li>Vague or evasive answers about how remote work actually functions day-to-day on the team.</li>
        <li>No clear answer on how performance is measured for remote employees specifically.</li>
        <li>Pressure to decide quickly without time to review a written offer.</li>
        <li>Inability to clearly explain the employment structure (direct, EOR, contractor) for your country.</li>
      </ul>
      <p><strong>Green flags worth noting too:</strong></p>
      <ul>
        <li>The interviewer can name specific tools and rituals the team uses to stay aligned remotely, not just "we use Slack."</li>
        <li>They're upfront about challenges of the role rather than only selling you on the positives.</li>
        <li>You're given a written offer with a reasonable window to review it, not pressure to answer on the call.</li>
      </ul>`,
  },
  {
    heading: '14. After the Interview',
    body: `
      <ul>
        <li>Send a short thank-you email within 24 hours. Reference one specific thing discussed — generic templates are easy to spot.</li>
        <li>If you said you'd follow up with something (a portfolio link, a reference, a writing sample), send it the same day.</li>
        <li>If you don't hear back by the timeline they gave you, one polite follow-up is appropriate. More than one isn't.</li>
        <li>Write down what you were asked while it's fresh — it's the best prep material you'll have for the next interview.</li>
      </ul>
      <p><strong>Short thank-you template:</strong></p>
      <div class="tmpl">Subject: Thank you — [Role] conversation today<br><br>
      Hi [Name],<br><br>
      Thanks for the time today — I enjoyed hearing about [specific thing discussed, e.g. "how the team handles async reviews"]. It confirmed [Role] is exactly the kind of work I want to be doing next.<br><br>
      Happy to send over [anything you offered] in the meantime. Looking forward to next steps.<br><br>
      Best,<br>[Your name]</div>
      <p><strong>Longer follow-up template, when you have more to add:</strong></p>
      <div class="tmpl">Subject: Following up — [Role]<br><br>
      Hi [Name],<br><br>
      Thanks again for the conversation on [day]. One thing I wanted to add after reflecting on our discussion about [topic]: [specific point or example you didn't get to].<br><br>
      I'm genuinely excited about [specific detail about the team or product]. Let me know if there's anything else useful for me to share before the next step.<br><br>
      Best,<br>[Your name]</div>`,
  },
  {
    heading: '15. Self-Assessment Worksheet',
    body: `
      <p>After a mock interview or the real thing, score yourself honestly on each line — this is what actually compounds between interviews.</p>
      <table class="plan">
        <tr><th>Area</th><th>1–5</th><th>What to fix next time</th></tr>
        <tr><td>Answered with a specific story, not a generality</td><td></td><td></td></tr>
        <tr><td>Kept answers to roughly 60–90 seconds</td><td></td><td></td></tr>
        <tr><td>Looked at the camera, not the screen</td><td></td><td></td></tr>
        <tr><td>Asked at least one sharp clarifying question</td><td></td><td></td></tr>
        <tr><td>Had 3+ real questions ready for the interviewer</td><td></td><td></td></tr>
        <tr><td>Setup (audio/video/lighting) had zero issues</td><td></td><td></td></tr>
      </table>`,
  },
  {
    heading: '16. Interview Formats You\'ll Encounter',
    body: `
      <p>Remote hiring processes usually move through several distinct formats. Knowing which one you're in changes what "doing well" looks like.</p>
      <table class="plan">
        <tr><th>Format</th><th>What it's actually testing</th><th>How to prepare</th></tr>
        <tr><td>Recruiter screen</td><td>Basic fit, comp expectations, logistics</td><td>Have your range and availability ready; keep answers tight.</td></tr>
        <tr><td>Hiring manager call</td><td>Role fit, motivation, team fit</td><td>Know their team's current priorities from the job post and any public info.</td></tr>
        <tr><td>Panel interview</td><td>Consistency of your story across multiple evaluators</td><td>Address whoever asked the question, but glance at the panel when concluding.</td></tr>
        <tr><td>Technical / take-home</td><td>Process and problem-solving, not just the final answer</td><td>Document your reasoning as you go; a working draft beats a perfect but late submission.</td></tr>
        <tr><td>Case study / live exercise</td><td>Structured thinking under ambiguity and time pressure</td><td>State your framework out loud before diving into details.</td></tr>
        <tr><td>Final / culture round</td><td>Whether they can picture working with you day to day</td><td>This is where personal questions (Section 9) matter most — ask them back.</td></tr>
      </table>`,
  },
  {
    heading: '17. Technical Question Starters by Role',
    body: `
      <p>You won't always know the exact rubric, but most disciplines rotate through a small set of question shapes. Use these to generate your own practice questions.</p>
      <table class="plan">
        <tr><th>Field</th><th>Typical question shapes</th></tr>
        <tr><td>Engineering</td><td>Debugging a described failure; designing a system under stated constraints; reviewing a code snippet for issues.</td></tr>
        <tr><td>Design</td><td>Critiquing an existing product flow; walking through your process on a past project; whiteboarding a flow for a new constraint.</td></tr>
        <tr><td>Product</td><td>Prioritizing a feature backlog with limited info; defining success metrics for a hypothetical launch; handling conflicting stakeholder asks.</td></tr>
        <tr><td>Marketing</td><td>Diagnosing a hypothetical underperforming campaign; proposing a channel strategy for a new segment; reasoning about budget tradeoffs.</td></tr>
        <tr><td>Sales</td><td>Role-playing a cold call or objection-handling scenario; walking through how you qualified and closed a specific deal.</td></tr>
        <tr><td>Data</td><td>Interpreting a dataset or chart live; explaining a modeling tradeoff; describing how you'd validate a surprising result.</td></tr>
        <tr><td>Customer Success / Support</td><td>De-escalating a described upset-customer scenario; triaging competing urgent tickets; explaining how you'd measure your own success.</td></tr>
      </table>
      <p>In all of these: narrate your framework before you answer, name your assumptions, and connect back to a measurable outcome when you wrap up — the same habits from Section 8 apply regardless of field.</p>`,
  },
  {
    heading: '18. Negotiation Scripts',
    body: `
      <p>A few specific phrasings for moments that otherwise catch people off guard.</p>
      <p><strong>Countering a lower-than-expected offer:</strong></p>
      <div class="tmpl">"Thank you for the offer — I'm genuinely excited about the role. Based on my research for this scope of work in [region/remote market], I was expecting something closer to [X]. Is there flexibility there?"</div>
      <p><strong>Handling a competing offer without burning the relationship:</strong></p>
      <div class="tmpl">"I want to be transparent: I have another offer with a deadline of [date]. I'd genuinely prefer this role — is there a way to move up the timeline, or match on [the specific gap]?"</div>
      <p><strong>Asking for a home-office or equipment stipend:</strong></p>
      <div class="tmpl">"Since this is a fully remote role, is there a stipend or reimbursement process for home-office setup or equipment?"</div>
      <p><strong>Asking about relocation or remote-work flexibility:</strong></p>
      <div class="tmpl">"Is the remote arrangement tied to a specific location, or is there flexibility if I were to relocate within [region] later?"</div>`,
  },
  {
    newPage: true,
    heading: '19. Glossary: Remote & Cross-Border Employment Terms',
    body: `
      <table class="plan">
        <tr><th>Term</th><th>Meaning</th></tr>
        <tr><td>EOR (Employer of Record)</td><td>A third-party entity that legally employs you on a company's behalf in your country, handling payroll, tax, and compliance.</td></tr>
        <tr><td>PEO (Professional Employer Organization)</td><td>Similar to an EOR, usually used when the company already has some local presence; co-employs staff with the client company.</td></tr>
        <tr><td>Independent contractor</td><td>Self-employed status; you invoice the company and handle your own taxes, typically without employee benefits or protections.</td></tr>
        <tr><td>Visa sponsorship</td><td>The company files and pays for the legal work authorization process required for you to work in their country.</td></tr>
        <tr><td>At-will employment</td><td>Common in the US — either party can end employment at any time, generally without cause or notice period.</td></tr>
        <tr><td>Notice period</td><td>A contractually required window (common outside the US) that either party must give before ending employment.</td></tr>
        <tr><td>Probation period</td><td>An initial employment window, often with reduced notice requirements, during which fit is still being evaluated.</td></tr>
        <tr><td>Gross vs. net pay</td><td>Gross is pay before tax and deductions; net is what actually lands in your account — always clarify which number you're being quoted.</td></tr>
      </table>`,
  },
  {
    heading: '20. The 30-60-90 Day Plan Worksheet',
    body: `
      <p>Some final-round interviews ask you to present a 30-60-90 day plan; even when they don't ask, drafting one sharpens your answers about role fit. Fill this in loosely before your interview — specifics will shift once you're actually in the role.</p>
      <table class="plan">
        <tr><th>Window</th><th>Primary goal</th><th>How you'll know it's working</th></tr>
        <tr><td>Days 1–30</td><td>Learn the system: people, tools, current priorities, and where the real friction is.</td><td>You can explain the team's current biggest problem in your own words.</td></tr>
        <tr><td>Days 31–60</td><td>Ship one small, visible contribution that builds trust.</td><td>Feedback from your manager or peers is specific, not just polite.</td></tr>
        <tr><td>Days 61–90</td><td>Take ownership of a defined piece of scope.</td><td>You're making decisions in that scope with less oversight than on day one.</td></tr>
      </table>`,
  },
  {
    newPage: true,
    heading: '21. Company Research Worksheet',
    body: `
      <p>Spend 30–45 minutes answering these before any interview — vague familiarity with the company shows immediately, and specific familiarity is one of the cheapest ways to stand out.</p>
      <table class="plan">
        <tr><th>Question</th><th>Where to look</th></tr>
        <tr><td>What does the product actually do, in one sentence a non-user would understand?</td><td>Homepage, product demo, App Store/Play Store listing.</td></tr>
        <tr><td>How does the company make money?</td><td>Pricing page, investor updates, press coverage.</td></tr>
        <tr><td>What stage is it at — bootstrapped, early funding, late-stage, public?</td><td>Crunchbase, LinkedIn company page, recent funding news.</td></tr>
        <tr><td>Who are its 2–3 main competitors, and what differentiates this company?</td><td>Review sites, comparison articles, the product itself.</td></tr>
        <tr><td>What's happened in the last 3 months — launches, layoffs, leadership changes?</td><td>Company blog, LinkedIn posts, news search.</td></tr>
        <tr><td>What do current or former employees say about remote culture specifically?</td><td>Glassdoor, LinkedIn comments, any public team members' posts.</td></tr>
      </table>`,
  },
  {
    heading: '22. Common Mistakes by Round Type',
    body: `
      <table class="plan">
        <tr><th>Round</th><th>Most common mistake</th></tr>
        <tr><td>Recruiter screen</td><td>Treating it as low-stakes small talk and arriving without a clear, concise answer for "why this role."</td></tr>
        <tr><td>Hiring manager call</td><td>Talking about skills in the abstract instead of connecting them to what the team is actually trying to do right now.</td></tr>
        <tr><td>Panel interview</td><td>Giving materially different answers to similar questions from different panelists — inconsistency reads as the story being invented, not recalled.</td></tr>
        <tr><td>Technical / take-home</td><td>Over-engineering a solution instead of delivering something complete and well-explained within the time box.</td></tr>
        <tr><td>Case study</td><td>Jumping straight to a recommendation without stating a framework or asking a single clarifying question first.</td></tr>
        <tr><td>Final / culture round</td><td>Having no real questions left to ask, which reads as lost interest rather than thorough prior rounds.</td></tr>
      </table>`,
  },
  {
    heading: '23. Virtual Presence & Body Language Cheat Sheet',
    body: `
      <p>Video strips out most of the subtle cues people normally rely on, so the few that survive carry more weight than they would in person.</p>
      <ul>
        <li><strong>Posture:</strong> sit upright, slightly leaning in — slouching reads as disengagement even when you're focused.</li>
        <li><strong>Hands:</strong> if visible, keep them relaxed and occasionally gesturing naturally; stiff, hidden hands can read as nervous.</li>
        <li><strong>Pace:</strong> slow down slightly from your normal speaking speed — compression artifacts and latency make fast speech harder to follow on a call.</li>
        <li><strong>Nodding:</strong> a small nod while the interviewer talks substitutes for the in-person acknowledgments you'd give automatically.</li>
        <li><strong>Smiling:</strong> a neutral resting face can look flat on camera in a way it wouldn't in person — a touch more warmth than feels natural usually reads as just right on screen.</li>
        <li><strong>Energy:</strong> match the interviewer's pace and tone rather than performing enthusiasm that doesn't fit the room.</li>
      </ul>`,
  },
  {
    heading: '24. Tricky Questions, Defused',
    body: `
      <p>A handful of questions trip people up not because they're hard, but because there's no obviously right length or tone for the answer. Here's a working approach for each.</p>
      <div class="qa"><p class="q">"Tell me about yourself."</p><p class="a">→ Not a biography. Give a 60-second arc: where you are now professionally, the thread connecting your last two roles, and why this specific role is the logical next step.</p></div>
      <div class="qa"><p class="q">"What's your biggest weakness?"</p><p class="a">→ Name something real and specific, then describe the concrete system you use to manage it — not a disguised strength ("I'm too much of a perfectionist").</p></div>
      <div class="qa"><p class="q">"Why are you leaving your current job?"</p><p class="a">→ Stay factual and forward-looking. Frame it as what you're moving toward, not what you're escaping — even if the real reason is a bad manager.</p></div>
      <div class="qa"><p class="q">"What are your salary expectations?"</p><p class="a">→ See Section 12 — redirect to their budgeted range first if you can, or give a researched range rather than a single number.</p></div>
      <div class="qa"><p class="q">"Do you have any questions for us?"</p><p class="a">→ Always yes. Running out of questions by the final round is one of the most common unforced errors — see Section 9.</p></div>`,
  },
  {
    heading: '25. After You Get the Offer: Pre-boarding Questions',
    body: `
      <p>Getting the offer isn't the end of the process for a remote or cross-border role — a few questions here prevent surprises in your first week.</p>
      <ul>
        <li>What equipment is provided versus self-funded, and what's the timeline to receive it before day one?</li>
        <li>Who is your actual point of contact for payroll or contract questions — the hiring manager, HR, or a separate EOR/PEO provider?</li>
        <li>Is there a written onboarding plan, or will the first week be improvised?</li>
        <li>What collaboration tools will you need accounts for before day one, so setup doesn't eat into your first week?</li>
        <li>If you're in a materially different time zone, what hours are you actually expected to be reachable during?</li>
      </ul>
      <p>Asking these after signing, not before, is normal — it reads as organized rather than presumptuous.</p>`,
  },
  {
    newPage: true,
    heading: '26. Regional Interview Norms Quick-Reference',
    body: `
      <p>These are broad tendencies, not rules — individual companies and interviewers vary a lot. Use this as a starting calibration, not a script.</p>
      <table class="plan">
        <tr><th>Region</th><th>General tendency</th><th>What to calibrate</th></tr>
        <tr><td>United States</td><td>Direct self-promotion is expected; enthusiasm reads as confidence.</td><td>Quantify achievements explicitly — understatement can read as lack of impact.</td></tr>
        <tr><td>United Kingdom</td><td>More understated; overt self-promotion can land as arrogant.</td><td>Let specific results speak for themselves rather than oversellling them.</td></tr>
        <tr><td>Germany</td><td>Direct and structured; small talk is minimal and interviews stay on-topic.</td><td>Come with precise, well-organized answers — vagueness reads as unprepared.</td></tr>
        <tr><td>France</td><td>Values articulate reasoning and intellectual rigor in answers.</td><td>Be ready to explain the "why" behind decisions, not just the "what."</td></tr>
        <tr><td>Japan</td><td>Formality and humility are valued; group contributions are often emphasized over individual ones.</td><td>Balance personal achievement with crediting the team you worked with.</td></tr>
        <tr><td>India</td><td>Hierarchy and clear structure are often respected; thorough, complete answers are valued.</td><td>Avoid seeming to cut corners on process, even under time pressure.</td></tr>
        <tr><td>Brazil</td><td>Warmer, more relational tone; some small talk before business is normal and expected.</td><td>Don't rush straight into the agenda — a brief personal exchange first is normal, not wasted time.</td></tr>
      </table>`,
  },
  {
    heading: '27. Final Pre-Call Checklist',
    body: `
      <p>Print this page, or keep it open on a second screen 10 minutes before the call.</p>
      <ul>
        <li>Camera, mic, and lighting tested in the actual room, at the actual time.</li>
        <li>Resume, job description, and your questions open in one place.</li>
        <li>Phone on silent, laptop plugged in, backup hotspot ready.</li>
        <li>Water nearby. Notepad and pen within reach.</li>
        <li>Three STAR stories you can retrieve instantly, regardless of what's asked.</li>
        <li>Three questions ready to ask back.</li>
      </ul>`,
  },
  {
    heading: '28. Keep Going After This Interview',
    body: `
      <p>Whatever the outcome, treat every interview as a repeatable asset: the questions you were asked, what worked, and what you'd change are the most accurate prep material you'll have for the next one — more useful than any generic guide, including this one.</p>
      <p>If you're actively job searching, pair this playbook with the rest of JobConnect AI's tools: AI-matched remote roles, AI-generated resumes and cover letters tailored per application, and the other guides in the Learn library covering salary negotiation and international contracts — the skills in this playbook compound fastest when you're interviewing regularly, not just once.</p>`,
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

  .content { padding: 64px 68px; }
  section { margin-bottom: 44px; page-break-inside: avoid; }
  h2 { color: #315bea; font-size: 21px; font-weight: 700; border-bottom: 1px solid #e2e6ed; padding-bottom: 10px; margin: 0 0 18px; }
  p { font-size: 13px; line-height: 1.8; margin: 0 0 11px; color: #44505f; }
  ul { margin: 0 0 11px; padding-left: 20px; }
  li { font-size: 13px; line-height: 1.8; margin-bottom: 9px; color: #44505f; }
  .qa { margin-bottom: 15px; }
  .qa .q { font-size: 13px; font-style: italic; color: #1a2130; margin-bottom: 4px; }
  .qa .a { font-size: 13px; color: #596579; margin-left: 12px; margin-bottom: 6px; }
  table.plan { width: 100%; border-collapse: collapse; margin: 14px 0 18px; }
  table.plan th { background: #f3f5fb; color: #315bea; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; text-align: left; padding: 11px 13px; border-bottom: 1px solid #e2e6ed; }
  table.plan td { font-size: 12.5px; line-height: 1.6; color: #44505f; padding: 11px 13px; border-bottom: 1px solid #edf0f5; vertical-align: top; }
  .tmpl { background: #f7f9fc; border: 1px solid #e2e6ed; border-radius: 8px; padding: 18px 20px; font-size: 12.5px; line-height: 1.75; color: #44505f; margin: 10px 0 18px; }
  .note { font-size: 11.5px; color: #7d8aa0; margin: 0 0 14px 12px; }
  footer { font-size: 9px; color: #9aa4b4; padding: 0 68px 30px; }
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
    ${SECTIONS.map(s => `<section${s.newPage ? ' style="page-break-before: always"' : ''}><h2>${s.heading}</h2>${s.body}</section>`).join('\n')}
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
