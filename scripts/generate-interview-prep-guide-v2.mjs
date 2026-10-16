/**
 * Generates the "Remote Interview Prep Playbook" PDF using the shared
 * Learn-guide renderer, then uploads it to Supabase Storage.
 *
 * Run: node scripts/generate-interview-prep-guide-v2.mjs
 * Output: /tmp/remote-interview-prep-playbook.pdf
 *         + upload to learn-guides/guides/remote-interview-prep-playbook.pdf
 */

import { writeFileSync } from 'fs'
import { renderGuidePdf, uploadGuide, loadSupabaseClient } from './lib/pdf-guide-renderer.mjs'

const OUT_PATH = '/tmp/remote-interview-prep-playbook.pdf'
const STORAGE_PATH = 'guides/remote-interview-prep-playbook.pdf'

const SECTIONS = [
  {
    eyebrow: 'Getting Started',
    heading: 'How to Use This Playbook',
    body: `
      <p class="lead">This is a working document, not a reading assignment. Read the seven-day timeline below now, even if you don't have seven days, and treat the question bank in Part Two as a rehearsal script: say the answers out loud instead of just reading them silently.</p>
      <p>If you only have an hour before your interview, three sections will do more for you than the rest combined. Read "The Setup That Actually Matters," the STAR method refresher, and the final pre-call checklist at the very end. Everything else is here to be returned to, not consumed in one sitting.</p>`,
  },
  {
    heading: 'The Seven-Day Prep Timeline',
    body: `
      <p>Compress or stretch this to whatever time you actually have. The order matters more than the pacing, so if you only get three days, collapse days seven through five into one evening rather than skipping them.</p>
      <table class="plan">
        <tr><th>Day</th><th>Focus</th><th>What you should have afterward</th></tr>
        <tr><td>7</td><td>Research the company: product, recent news, funding stage, competitors.</td><td>One page of notes you'd be comfortable being quizzed on.</td></tr>
        <tr><td>6</td><td>Re-read the job description line by line and match each requirement to a real example from your history.</td><td>A short requirement-to-example table.</td></tr>
        <tr><td>5</td><td>Draft STAR answers for six behavioral questions from Part Two.</td><td>Written answers, roughly ninety seconds each when spoken aloud.</td></tr>
        <tr><td>4</td><td>Record yourself answering three of those out loud, then watch it back once.</td><td>A short list of verbal tics or filler words worth cutting.</td></tr>
        <tr><td>3</td><td>Prepare five questions to ask the interviewer and look up your interviewer on LinkedIn if they're named in the invite.</td><td>Questions written down, not held loosely in your head.</td></tr>
        <tr><td>2</td><td>Run a full technical dry run at the actual time of day the call is scheduled.</td><td>A tested setup, not an assumed one.</td></tr>
        <tr><td>1</td><td>Review lightly. Read your notes once and get a normal night's sleep.</td><td>Calm, rather than cramming.</td></tr>
      </table>`,
  },
  {
    heading: 'The Setup That Actually Matters',
    body: `
      <p>Remote interviews are judged on signal rather than vibes. A recruiter can't read a room over a laptop camera, so the handful of details you do control end up mattering more than they would across a table in person.</p>
      <p>Test your camera, microphone, and lighting at the actual time of day your interview is scheduled, not the night before when the light in your room is completely different. Close every tab and app except the call itself, and silence your phone along with anything else that might buzz, including a smartwatch. Keep your resume, the job description, and your prepared questions open in a single document rather than scattered across several windows you'll be hunting through mid-conversation.</p>
      <p>Join two minutes early. Arriving late reads as a quiet red flag, while arriving ten minutes early is often just awkward for whoever is hosting. A plain, well-lit background remains the single most common unforced error in remote interviews, and it costs nothing to fix.</p>
      <h3>Hardware and connection</h3>
      <p>A wired connection beats Wi-Fi whenever you have the option, since video calls expose network jitter almost instantly. Headphones with a built-in microphone reduce echo and make you noticeably easier to understand than relying on laptop speakers. Keep a phone hotspot ready as a backup in case your primary connection drops partway through. If the platform is one you haven't used before, whether that's Google Meet, Zoom, Teams, or a custom link from an applicant tracking system, open it a day ahead and run a solo test call rather than discovering its quirks live. Finally, stay plugged in: a laptop running on battery can quietly throttle performance under thermal load exactly when you need it most.</p>`,
  },
  {
    heading: 'The STAR Method, Refreshed',
    body: `
      <p>Every behavioral question is really asking for a true story with a shape the interviewer can evaluate. STAR gives that shape: Situation, Task, Action, Result. Most candidates over-invest in the Situation and under-invest in Action and Result, which is backwards, since the interviewer is scoring what you actually did and what happened because of it.</p>
      <p>Here's a worked example for a common prompt: "Tell me about a time you disagreed with a decision."</p>
      <div class="qa">
        <p class="a"><strong>Situation.</strong> On a previous team, our lead wanted to ship a feature without an opt-out, and I was worried about churn.</p>
        <p class="a"><strong>Task.</strong> I needed to raise the concern without simply overriding the decision, since it wasn't my call to make alone.</p>
        <p class="a"><strong>Action.</strong> I pulled churn data from a similar change we'd made six months earlier, wrote a one-page comparison, and asked for fifteen minutes before the ship date to walk through it with the lead and the product manager together.</p>
        <p class="a"><strong>Result.</strong> We added the opt-out. Churn on that cohort stayed flat instead of repeating the four percent dip we'd seen last time, and the lead later asked me to review two other launches the same way.</p>
      </div>
      <p>Notice how specific the story is: real numbers, a real artifact in the one-pager, and a real outcome. A vague version of the same story, something like "I always try to communicate well," doesn't score nearly as high, because there's nothing in it to verify or probe further.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Two',
    heading: 'The Behavioral Question Bank',
    body: `
      <p>Draft a STAR answer for each of these. You don't need to memorize exact wording; you need the shape fixed in your head so you aren't improvising the facts under pressure.</p>
      <ol>
        <li>Tell me about a time you missed a deadline. Own it quickly, then focus on what changed afterward in how you plan or flag risk.</li>
        <li>Describe a conflict with a coworker and how you resolved it. Pick a real disagreement about the work itself, not a personality clash, and show you addressed it directly.</li>
        <li>Tell me about a time you had to learn something quickly. Name the actual resource or method you used rather than a generic "I read the docs."</li>
        <li>Describe a project that failed and what you learned. Choose one that genuinely failed; a half-success tends to read as dodging the question.</li>
        <li>Tell me about a time you received critical feedback. Show what specifically changed in your work afterward, not just that you "took it well."</li>
        <li>Describe a time you had to influence someone without authority over them. This is the evidence-over-persuasion story.</li>
        <li>Tell me about your proudest piece of work. Pick something where your specific contribution is clear rather than a team win you can't isolate your part in.</li>
        <li>Describe a time you had to say no to a stakeholder. Show the tradeoff you explained, not only the refusal itself.</li>
        <li>Tell me about a time you worked with incomplete information. Show how you decided what to clarify versus what to assume, and why.</li>
        <li>Where do you want to be in three years, and how does this role fit? Answer honestly about the direction you want to grow in; connecting it loosely to this role tends to read better than forcing a perfect match.</li>
      </ol>
      <p>Two more worked examples, to show the same pattern applied to harder prompts.</p>
      <h3>"Describe a project that failed. What did you learn?"</h3>
      <div class="qa">
        <p class="a"><strong>Situation.</strong> I led the migration of a reporting pipeline to a new data warehouse, on a timeline I'd set myself.</p>
        <p class="a"><strong>Task.</strong> I needed to cut the old pipeline over without breaking the dashboards that three other teams relied on daily.</p>
        <p class="a"><strong>Action.</strong> I underestimated how many downstream dashboards referenced the old schema directly, and cut over on the planned date anyway instead of auditing dependencies first. Six dashboards broke that same morning.</p>
        <p class="a"><strong>Result.</strong> We rolled back within two hours, but it cost real trust. Since then I've built a dependency-mapping step into every migration I've run; on the next one, we found fourteen hidden dependencies before cutover instead of after.</p>
      </div>
      <h3>"Describe a time you had to influence someone without authority over them."</h3>
      <div class="qa">
        <p class="a"><strong>Situation.</strong> A peer on another team owned an API our feature depended on, and their roadmap kept bumping our integration.</p>
        <p class="a"><strong>Task.</strong> I had no authority to reprioritize their backlog; I needed them to want to move it up on their own.</p>
        <p class="a"><strong>Action.</strong> Instead of escalating, I quantified the user impact of the delay using real support-ticket data and brought it to their planning meeting as a tradeoff for them to weigh, not a demand to comply with.</p>
        <p class="a"><strong>Result.</strong> They moved it up two sprints on their own. The lesson stuck with me: bringing evidence to someone else's prioritization process works better than asking for a favor.</p>
      </div>`,
  },
  {
    heading: 'Remote and Distributed-Work Questions',
    body: `
      <p>Remote-specific questions come up in almost every interview for a distributed role, and they reward a real, specific example rather than a generic answer.</p>
      <div class="qa"><p class="q">"How do you stay productive without someone watching over your shoulder?"</p><p class="a">Describe your actual daily structure: time blocks, the tools you use, and how you handle distraction.</p></div>
      <div class="qa"><p class="q">"How do you handle working across time zones?"</p><p class="a">Give a concrete example of an async handoff or an overlap-hours schedule you've actually used.</p></div>
      <div class="qa"><p class="q">"Tell me about a time you had a miscommunication with a remote teammate."</p><p class="a">Show that you default to writing things down and over-communicating rather than assuming.</p></div>
      <div class="qa"><p class="q">"What does your home office setup look like?"</p><p class="a">Keep it short and practical: a dedicated space, reliable internet, basic ergonomics.</p></div>
      <div class="qa"><p class="q">"Why do you want a remote role specifically, not just any job?"</p><p class="a">Tie this to how you actually work best rather than lifestyle convenience alone.</p></div>
      <div class="qa"><p class="q">"How do you build relationships with people you've never met in person?"</p><p class="a">Mention specific habits: regular one-on-ones, informal chats, over-explaining context in writing.</p></div>
      <div class="qa"><p class="q">"Describe how you'd onboard yourself with no in-person orientation."</p><p class="a">Show initiative: scheduling your own intro calls, reading documentation proactively, asking targeted questions early.</p></div>
      <div class="qa"><p class="q">"What's the hardest part of remote work for you, honestly?"</p><p class="a">Pick something real and name the specific way you mitigate it. A vague answer like "isolation" without a fix tends to read as unresolved.</p></div>`,
  },
  {
    heading: 'Framing Technical and Role-Competency Questions',
    body: `
      <p>You usually won't know the exact rubric for a technical or role-specific round, but a few habits transfer across almost every discipline. Think out loud, because interviewers often score your process as much as your final answer, and silence while you work is harder to evaluate than narrated reasoning. Restate the problem in your own words and ask one clarifying question before committing to an approach; it signals rigor rather than uncertainty.</p>
      <p>If a requirement is ambiguous, say what you're assuming and why, so the interviewer can correct you early instead of watching you build on a wrong premise for ten minutes. Size your solution to the time you actually have: a rough, working answer delivered on time beats a polished one you run out of time to finish. When you wrap up, briefly note what you'd do next or what tradeoff you made. It shows you're thinking past the exercise itself.</p>`,
  },
  {
    heading: 'Questions to Ask Your Interviewer',
    body: `
      <p>Asking sharp questions is itself part of the evaluation, since it shows you're assessing fit rather than just hoping to be picked. Choose three or four, matched to whoever you're actually speaking with.</p>
      <p><strong>About the role:</strong> "What does success in this role look like at the ninety-day mark?" and "What's been the biggest challenge for the last person in this role, or for the team as a whole?"</p>
      <p><strong>About the team and how remote work actually runs:</strong> "How does the team handle time zone overlap day to day?" and "What does a typical week look like, in terms of synchronous versus asynchronous work?"</p>
      <p><strong>About growth and evaluation:</strong> "How is performance evaluated for someone fully remote?" and "What growth paths have people in this role typically taken?"</p>
      <p><strong>For cross-border roles specifically:</strong> "How does the company handle international hiring: direct employment, an employer of record, or contractor status?" and "Is there support for things like equipment, a home-office stipend, or local compliance?"</p>`,
  },
  {
    heading: 'During the Interview',
    body: `
      <p>Look at the camera rather than the screen when you're speaking; it's the closest thing to eye contact available on a call. Leave a small beat of silence before answering, since video calls tend to clip the start of sentences and talking over each other happens more easily than in person. If you're sharing your screen, narrate what you're about to click before you click it rather than letting the interviewer guess.</p>
      <p>It's fine to say "let me think for a second." A short pause reads better on a recording than filler words do. If the connection drops, reconnect immediately, apologize once briefly, and move on without over-explaining. And if you don't follow a question, ask for it to be rephrased rather than guessing at the intent; video calls make it easy to mishear something small.</p>
      <h3>A short annotated exchange</h3>
      <div class="qa"><p class="q">Interviewer: "Walk me through a time you had to push back on a deadline."</p></div>
      <p class="a"><strong>Candidate:</strong> "On my last project, I was asked to ship a redesigned checkout flow in two weeks. After scoping it for a day, I came back and said two weeks only worked if we cut A/B testing, which I didn't think was worth the risk on checkout specifically. I proposed three weeks with testing instead, and laid out the conversion risk using data from a similar change the quarter before."</p>
      <p class="note">Notice the candidate didn't just say "I pushed back." They named the actual tradeoff and backed it with a specific number, which is the Action and Result doing the real work rather than an adjective.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Three',
    heading: 'Cross-Border and International Considerations',
    body: `
      <p>If you're interviewing for a role in another country or with a genuinely global team, a few extra details are worth confirming. Double-check the interview time against your own time zone in writing rather than assuming you converted it correctly, and ask directly whether the company sponsors visas, uses an employer of record, or hires contractors if the job post doesn't already say. Be ready to explain your current work authorization status in a sentence or two, clearly and without over-explaining, and mention any experience you have working with distributed, multicultural teams, since it's a real differentiator for cross-border roles.</p>
      <table class="plan">
        <tr><th>Structure</th><th>What it means for you</th></tr>
        <tr><td>Direct employee, local entity</td><td>The company has a legal entity in your country, so you get standard local payroll, benefits, and tax withholding.</td></tr>
        <tr><td>Employer of record</td><td>A third party legally employs you on the company's behalf. Benefits and the contract follow local law, but your day-to-day manager is still at the company itself.</td></tr>
        <tr><td>Independent contractor</td><td>You invoice the company directly and handle your own taxes, typically without employee benefits. Confirm whether this affects your home country's labor protections.</td></tr>
      </table>
      <p>Cultural norms around directness vary widely across interview cultures. Some expect confident, assertive self-promotion, while others read that as off-putting and favor understatement instead. When in doubt, mirror the interviewer's own register rather than guessing which extreme to perform.</p>`,
  },
  {
    heading: 'The Salary and Offer Conversation',
    body: `
      <p>You don't need a full negotiation playbook here, just enough to avoid losing ground by accident during the interview itself. If you're asked for a number early, it's reasonable to redirect with something like, "I'd like to understand the role fully first. What range is budgeted for this position?" If you're pressed, give a researched range rather than a single number, anchored to market data for the role and region rather than just your last salary.</p>
      <p>Never misstate your current compensation, but you're also not obligated to volunteer it unprompted. For cross-border roles, always clarify whether a quoted number is gross or net, and in which currency, since that changes the comparison considerably.</p>`,
  },
  {
    heading: 'Red Flags, and a Few Green Ones',
    body: `
      <p>You're evaluating the company just as much as it's evaluating you. Vague or evasive answers about how remote work actually functions day to day are worth noting, as is the absence of a clear answer on how performance is measured for remote employees specifically. Pressure to decide quickly without time to review a written offer is a real signal, as is an inability to clearly explain the employment structure in your country.</p>
      <p>On the positive side, an interviewer who can name specific tools and rituals the team actually uses to stay aligned remotely, rather than a vague "we use Slack," is a good sign. So is an interviewer who's upfront about the challenges of the role rather than only selling you on the positives, and a written offer with a reasonable window to review it instead of pressure to answer on the call.</p>`,
  },
  {
    heading: 'After the Interview',
    body: `
      <p>Send a short thank-you email within twenty-four hours, referencing one specific thing you discussed, since generic templates are easy to spot. If you said you'd follow up with something, a portfolio link, a reference, a writing sample, send it the same day. If you don't hear back within the timeline they gave you, one polite follow-up is appropriate; more than one usually isn't. Write down what you were actually asked while it's still fresh. It's the best prep material you'll have for the next interview.</p>
      <h3>Short thank-you template</h3>
      <div class="tmpl">Subject: Thank you, [Role] conversation today<br><br>
      Hi [Name],<br><br>
      Thanks for the time today. I enjoyed hearing about [specific thing discussed, for example "how the team handles async reviews"], and it confirmed [Role] is exactly the kind of work I want to be doing next.<br><br>
      Happy to send over [anything you offered] in the meantime. Looking forward to next steps.<br><br>
      Best,<br>[Your name]</div>
      <h3>Longer follow-up, when you have more to add</h3>
      <div class="tmpl">Subject: Following up, [Role]<br><br>
      Hi [Name],<br><br>
      Thanks again for the conversation on [day]. One thing I wanted to add after reflecting on our discussion about [topic]: [specific point or example you didn't get to].<br><br>
      I'm genuinely excited about [specific detail about the team or product]. Let me know if there's anything else useful for me to share before the next step.<br><br>
      Best,<br>[Your name]</div>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Four',
    heading: 'Interview Formats You Will Encounter',
    body: `
      <p>Remote hiring processes usually move through several distinct formats, and knowing which one you're in changes what doing well actually looks like.</p>
      <table class="plan">
        <tr><th>Format</th><th>What it's really testing</th><th>How to prepare</th></tr>
        <tr><td>Recruiter screen</td><td>Basic fit, compensation expectations, logistics.</td><td>Have your range and availability ready, and keep answers tight.</td></tr>
        <tr><td>Hiring manager call</td><td>Role fit, motivation, team fit.</td><td>Know the team's current priorities from the job post and any public information.</td></tr>
        <tr><td>Panel interview</td><td>Consistency of your story across multiple evaluators.</td><td>Address whoever asked the question, but glance at the panel when concluding.</td></tr>
        <tr><td>Technical or take-home</td><td>Process and problem-solving, not only the final answer.</td><td>Document your reasoning as you go. A working draft beats a perfect but late submission.</td></tr>
        <tr><td>Case study or live exercise</td><td>Structured thinking under ambiguity and time pressure.</td><td>State your framework out loud before diving into details.</td></tr>
        <tr><td>Final or culture round</td><td>Whether they can picture working with you day to day.</td><td>This is where personal questions matter most, so ask them back.</td></tr>
      </table>`,
  },
  {
    heading: 'Technical Question Starters by Role',
    body: `
      <p>You won't always know the exact rubric, but most disciplines rotate through a small set of question shapes. Use these to generate your own practice questions.</p>
      <table class="plan">
        <tr><th>Field</th><th>Typical question shapes</th></tr>
        <tr><td>Engineering</td><td>Debugging a described failure, designing a system under stated constraints, reviewing a code snippet for issues.</td></tr>
        <tr><td>Design</td><td>Critiquing an existing product flow, walking through your process on a past project, whiteboarding a flow for a new constraint.</td></tr>
        <tr><td>Product</td><td>Prioritizing a feature backlog with limited information, defining success metrics for a hypothetical launch, handling conflicting stakeholder asks.</td></tr>
        <tr><td>Marketing</td><td>Diagnosing a hypothetical underperforming campaign, proposing a channel strategy for a new segment, reasoning about budget tradeoffs.</td></tr>
        <tr><td>Sales</td><td>Role-playing a cold call or an objection-handling scenario, walking through how you qualified and closed a specific deal.</td></tr>
        <tr><td>Data</td><td>Interpreting a dataset or chart live, explaining a modeling tradeoff, describing how you'd validate a surprising result.</td></tr>
        <tr><td>Customer success or support</td><td>De-escalating a described upset-customer scenario, triaging competing urgent tickets, explaining how you'd measure your own success.</td></tr>
      </table>
      <p>In all of these, the same habits apply: narrate your framework before answering, name your assumptions, and connect back to a measurable outcome when you wrap up.</p>`,
  },
  {
    heading: 'Negotiation Scripts',
    body: `
      <p>A few specific phrasings for moments that otherwise catch people off guard.</p>
      <p><strong>Countering a lower-than-expected offer:</strong> "Thank you for the offer, I'm genuinely excited about the role. Based on my research for this scope of work in [region or remote market], I was expecting something closer to [X]. Is there flexibility there?"</p>
      <p><strong>Handling a competing offer without burning the relationship:</strong> "I want to be transparent: I have another offer with a deadline of [date]. I'd genuinely prefer this role. Is there a way to move up the timeline, or match on [the specific gap]?"</p>
      <p><strong>Asking for a home-office or equipment stipend:</strong> "Since this is a fully remote role, is there a stipend or reimbursement process for home-office setup or equipment?"</p>
      <p><strong>Asking about relocation or remote-work flexibility:</strong> "Is the remote arrangement tied to a specific location, or is there flexibility if I were to relocate within [region] later?"</p>
      <p><strong>Asking about equity or bonus structure when only base salary was discussed:</strong> "Can you walk me through the rest of the compensation structure, including any bonus or equity component?"</p>
      <p><strong>Requesting time to consider a verbal offer before it's in writing:</strong> "This sounds great. Could you send the details in writing so I can review everything properly before confirming?"</p>`,
  },
  {
    heading: 'Common Interview Myths, Debunked',
    body: `
      <p>A few pieces of advice circulate constantly and don't hold up well in practice. "Never admit a weakness" produces answers that sound evasive rather than self-aware, and most experienced interviewers notice the dodge immediately. "Always have a rehearsed, perfect answer for everything" tends to produce stiff, over-polished delivery that reads as less trustworthy than a slightly imperfect but genuine one.</p>
      <p>"The interviewer is trying to trick you" is rarely true. Most interview questions are simply trying to find a real signal, not set a trap, and answering as if you're being tested adversarially tends to make candidates defensive when openness would serve them better. Finally, "you should match their energy exactly" is only partly true: calibrating tone is useful, as covered earlier, but suppressing your own personality entirely to mirror someone else usually reads as flat rather than well-matched.</p>`,
  },
  {
    heading: 'Preparing Your References',
    body: `
      <p>References are often requested late in the process, which means they're easy to neglect until it's urgent. Choose people who can speak to recent, relevant work rather than only your most senior former manager if that person barely worked with you directly. Ask each reference directly rather than just adding their contact information, and give them real context: the role you're interviewing for, and one or two specific things you'd appreciate them mentioning if it's true and relevant.</p>
      <p>A short briefing email works well: the company and role, roughly when they might be contacted, and a reminder of a specific project you worked on together that's relevant to this new role. References who are prepared and specific carry far more weight than references who are merely willing.</p>`,
  },
  {
    heading: 'A Sample Day-Of Timeline',
    body: `
      <p>A concrete hour-by-hour structure for the day of a mid-morning interview, adaptable to whatever time yours is actually scheduled.</p>
      <table class="plan">
        <tr><th>Time</th><th>What to do</th></tr>
        <tr><td>2 hours before</td><td>Light review of your notes only. No new material at this point.</td></tr>
        <tr><td>1 hour before</td><td>Eat something. An empty stomach is a distraction you don't need mid-interview.</td></tr>
        <tr><td>30 minutes before</td><td>Final technical check: camera, mic, lighting, and a closed-tab desktop.</td></tr>
        <tr><td>10 minutes before</td><td>Run through the final pre-call checklist at the end of this guide.</td></tr>
        <tr><td>2 minutes before</td><td>Join the call. Settle in before the interviewer arrives, rather than rushing in at the exact minute.</td></tr>
        <tr><td>Immediately after</td><td>Write down what you were asked while it's fresh, before doing anything else.</td></tr>
      </table>`,
  },
  {
    heading: 'Glossary: Remote and Cross-Border Employment Terms',
    body: `
      <table class="plan">
        <tr><th>Term</th><th>Meaning</th></tr>
        <tr><td>Employer of record</td><td>A third-party entity that legally employs you on a company's behalf in your country, handling payroll, tax, and compliance.</td></tr>
        <tr><td>Professional employer organization</td><td>Similar to an employer of record, usually used when the company already has some local presence; co-employs staff alongside the client company.</td></tr>
        <tr><td>Independent contractor</td><td>Self-employed status in which you invoice the company and handle your own taxes, typically without employee benefits or protections.</td></tr>
        <tr><td>Visa sponsorship</td><td>The company files and pays for the legal work-authorization process required for you to work in their country.</td></tr>
        <tr><td>At-will employment</td><td>Common in the United States; either party can end employment at any time, generally without cause or a notice period.</td></tr>
        <tr><td>Notice period</td><td>A contractually required window, common outside the United States, that either party must give before ending employment.</td></tr>
        <tr><td>Probation period</td><td>An initial employment window, often with reduced notice requirements, during which fit is still being evaluated.</td></tr>
        <tr><td>Gross versus net pay</td><td>Gross is pay before tax and deductions, while net is what actually lands in your account. Always clarify which figure you're being quoted.</td></tr>
        <tr><td>Severance</td><td>A payment owed when employment ends under certain conditions; terms vary widely by country and are often set by local law rather than negotiated individually.</td></tr>
        <tr><td>Cost-of-living adjustment</td><td>A pay adjustment tied to the cost of living in your specific location, sometimes used by companies that pay differently across regions.</td></tr>
      </table>`,
  },
  {
    heading: 'Requesting Accommodations',
    body: `
      <p>If you need an accommodation for a remote interview, whether that's live captioning, extra processing time between questions, a written version of questions alongside the verbal one, or a different video platform entirely, it's reasonable to ask for it directly when the interview is scheduled rather than trying to manage without it. A short, factual request works best: what you need, and why it helps you perform at your actual ability rather than around an unrelated obstacle.</p>
      <p>Reasonable employers expect these requests and have a process for them. If a company reacts poorly to a straightforward accommodation request, that reaction itself is useful information about what working there would actually be like.</p>`,
  },
  {
    heading: 'A Quick Word on Time Zones and Daylight Saving',
    body: `
      <p>Time zone mistakes are one of the most avoidable ways to start a relationship with a new employer badly. When confirming a cross-border interview time, always state it in a form that can't be misread, such as naming both your local time and theirs explicitly rather than relying on a calendar invite to convert it correctly. Daylight saving transitions are a particular trap, since many countries shift on different dates than yours, if they observe it at all, and a meeting that was correctly scheduled in March can silently drift by an hour by the time it actually happens in late autumn.</p>
      <p>If anything feels ambiguous, a short confirmation email the day before, stating the time in both zones, costs nothing and prevents the one mistake that's hardest to recover from gracefully.</p>`,
  },
  {
    heading: 'The 30-60-90 Day Plan Worksheet',
    body: `
      <p>Some final-round interviews ask you to present a thirty-sixty-ninety day plan, and even when they don't ask, drafting one sharpens your answers about role fit. Fill this in loosely before your interview; the specifics will shift once you're actually in the role.</p>
      <table class="plan">
        <tr><th>Window</th><th>Primary goal</th><th>How you'll know it's working</th></tr>
        <tr><td>Days 1–30</td><td>Learn the system: the people, the tools, current priorities, and where the real friction is.</td><td>You can explain the team's biggest current problem in your own words.</td></tr>
        <tr><td>Days 31–60</td><td>Ship one small, visible contribution that builds trust.</td><td>Feedback from your manager or peers is specific rather than merely polite.</td></tr>
        <tr><td>Days 61–90</td><td>Take ownership of a defined piece of scope.</td><td>You're making decisions in that scope with less oversight than on day one.</td></tr>
      </table>`,
  },
  {
    heading: 'What to Do When Something Goes Wrong',
    body: `
      <p>Something will eventually go wrong in a remote interview, and how you recover matters more than the mistake itself. If you give an answer and immediately realize it missed the point, it's fine to say so directly: "Let me back up, I don't think that answered what you actually asked," and give a better version. Interviewers generally respect self-correction far more than a perfect first draft delivered with false confidence.</p>
      <p>If you freeze on a question, naming it out loud works better than silently panicking: "I want to give you a real answer rather than an improvised one, give me a second to think." If you're asked something you genuinely don't know, say so plainly rather than bluffing, and pivot to what you'd do to find out. Interviewers can usually tell the difference between confident bluffing and real expertise, and the former tends to cost more credibility than the honest gap would have.</p>
      <p>Technical failures deserve the same calm treatment as a dropped word: reconnect, apologize once, and continue. If an entire call needs to be rescheduled because of a failure on your end, a short, factual email sent immediately reads far better than a long apology sent an hour later.</p>
      <p>If you genuinely miss an interview entirely, whether from a timezone mistake, a calendar error, or something unavoidable, the recovery is the same: reach out the moment you realize it, state what happened plainly without an elaborate excuse, and ask to reschedule. Most reasonable companies will give you a second chance for a single missed call; what tends to end the conversation is silence afterward, not the mistake itself.</p>`,
  },
  {
    heading: 'Async and Recorded Interview Platforms',
    body: `
      <p>Some companies use asynchronous, recorded interview platforms, such as HireVue or similar tools, especially for early screening stages. You're shown a question on screen, given a short prep window, and then record a timed response with no interviewer present. The format rewards a slightly different set of habits than a live call.</p>
      <p>Treat the prep window as real prep, not a countdown to panic: jot a one-line structure before you start recording rather than speaking immediately. Look directly at the camera lens rather than at your own preview image, since staring at yourself reads as distracted on playback. Most platforms allow one retake per question; use it if your first attempt genuinely missed the point, but resist the urge to re-record for small wording preferences, since over-polished answers can read as rehearsed rather than natural.</p>
      <p>Lighting and framing matter even more here than on a live call, since there's no interviewer to subtly adjust for a bad angle or a glare on your glasses. Test the actual platform once with a throwaway question if it offers a practice mode, since the unfamiliar silence of talking to a camera with no one responding catches many candidates off guard the first time.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Five',
    heading: 'Company Research Worksheet',
    body: `
      <p>Spend thirty to forty-five minutes answering these before any interview. Vague familiarity with a company shows immediately, and specific familiarity is one of the cheapest ways to stand out.</p>
      <table class="plan">
        <tr><th>Question</th><th>Where to look</th></tr>
        <tr><td>What does the product actually do, in one sentence a non-user would understand?</td><td>The homepage, a product demo, the App Store or Play Store listing.</td></tr>
        <tr><td>How does the company make money?</td><td>The pricing page, investor updates, press coverage.</td></tr>
        <tr><td>What stage is it at: bootstrapped, early funding, late-stage, public?</td><td>Crunchbase, the LinkedIn company page, recent funding news.</td></tr>
        <tr><td>Who are its two or three main competitors, and what differentiates this company?</td><td>Review sites, comparison articles, the product itself.</td></tr>
        <tr><td>What's happened in the last three months: launches, layoffs, leadership changes?</td><td>The company blog, LinkedIn posts, a news search.</td></tr>
        <tr><td>What do current or former employees say about remote culture specifically?</td><td>Glassdoor, LinkedIn comments, any public posts from team members.</td></tr>
      </table>`,
  },
  {
    heading: 'Common Mistakes by Round Type',
    body: `
      <table class="plan">
        <tr><th>Round</th><th>Most common mistake</th></tr>
        <tr><td>Recruiter screen</td><td>Treating it as low-stakes small talk and arriving without a clear, concise answer for "why this role."</td></tr>
        <tr><td>Hiring manager call</td><td>Talking about skills in the abstract instead of connecting them to what the team is actually trying to do right now.</td></tr>
        <tr><td>Panel interview</td><td>Giving materially different answers to similar questions from different panelists, which can read as the story being invented rather than recalled.</td></tr>
        <tr><td>Technical or take-home</td><td>Over-engineering a solution instead of delivering something complete and well-explained within the time box.</td></tr>
        <tr><td>Case study</td><td>Jumping straight to a recommendation without stating a framework or asking a single clarifying question first.</td></tr>
        <tr><td>Final or culture round</td><td>Having no real questions left to ask, which can read as lost interest rather than thorough prior rounds.</td></tr>
      </table>`,
  },
  {
    heading: 'Virtual Presence and Body Language',
    body: `
      <p>Video strips out most of the subtle cues people normally rely on, so the few that survive carry more weight than they would in person. Sit upright and slightly leaning in, since slouching can read as disengagement even when you're focused. If your hands are visible, keep them relaxed and let them gesture naturally; stiff or hidden hands can read as nervousness. Slow your pace down slightly from how you'd normally speak, since compression artifacts and small delays make fast speech harder to follow on a call.</p>
      <p>A small nod while the interviewer is talking substitutes for the acknowledgments you'd give automatically in person, and a touch more warmth than feels natural usually reads as just right on screen, since a neutral resting face can look flatter on camera than it would across a table. Match the interviewer's pace and tone rather than performing enthusiasm that doesn't fit the room.</p>`,
  },
  {
    heading: 'Tricky Questions, Defused',
    body: `
      <p>A handful of questions trip people up not because they're hard, but because there's no obviously right length or tone for the answer.</p>
      <div class="qa"><p class="q">"Tell me about yourself."</p><p class="a">Not a biography. Give a sixty-second arc: where you are now professionally, the thread connecting your last two roles, and why this specific role is the logical next step.</p></div>
      <div class="qa"><p class="q">"What's your biggest weakness?"</p><p class="a">Name something real and specific, then describe the concrete system you use to manage it, rather than a disguised strength like "I'm too much of a perfectionist."</p></div>
      <div class="qa"><p class="q">"Why are you leaving your current job?"</p><p class="a">Stay factual and forward-looking. Frame it as what you're moving toward rather than what you're escaping, even if the real reason is a difficult manager.</p></div>
      <div class="qa"><p class="q">"What are your salary expectations?"</p><p class="a">Redirect to their budgeted range first if you can, or give a researched range rather than a single number.</p></div>
      <div class="qa"><p class="q">"Do you have any questions for us?"</p><p class="a">Always yes. Running out of questions by the final round is one of the most common unforced errors.</p></div>`,
  },
  {
    heading: 'After You Get the Offer: Pre-Boarding Questions',
    body: `
      <p>Getting the offer isn't the end of the process for a remote or cross-border role. A few questions here prevent surprises in your first week: what equipment is provided versus self-funded, and what's the timeline to receive it before day one? Who is your actual point of contact for payroll or contract questions, the hiring manager, HR, or a separate employer-of-record provider? Is there a written onboarding plan, or will the first week be improvised? What collaboration tools will you need accounts for before day one, so setup doesn't eat into your first week? And if you're in a materially different time zone, what hours are you actually expected to be reachable during?</p>
      <p>Asking these after signing, rather than before, is normal. It reads as organized rather than presumptuous.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Reference',
    heading: 'Regional Interview Norms',
    body: `
      <p>These are broad tendencies rather than rules, and individual companies and interviewers vary a great deal. Treat this as a starting calibration, not a script.</p>
      <table class="plan">
        <tr><th>Region</th><th>General tendency</th><th>What to calibrate</th></tr>
        <tr><td>United States</td><td>Direct self-promotion is expected, and enthusiasm reads as confidence.</td><td>Quantify achievements explicitly. Understatement can read as a lack of impact.</td></tr>
        <tr><td>United Kingdom</td><td>More understated, where overt self-promotion can land as arrogant.</td><td>Let specific results speak for themselves rather than overselling them.</td></tr>
        <tr><td>Germany</td><td>Direct and structured, with minimal small talk and a tight focus on topic.</td><td>Come with precise, well-organized answers. Vagueness reads as unprepared.</td></tr>
        <tr><td>France</td><td>Values articulate reasoning and intellectual rigor in an answer.</td><td>Be ready to explain the reasoning behind a decision, not only the decision itself.</td></tr>
        <tr><td>Japan</td><td>Formality and humility are valued, with group contributions often emphasized over individual ones.</td><td>Balance personal achievement with crediting the team you worked with.</td></tr>
        <tr><td>India</td><td>Hierarchy and clear structure are often respected, and thorough, complete answers are valued.</td><td>Avoid seeming to cut corners on process, even under time pressure.</td></tr>
        <tr><td>Brazil</td><td>A warmer, more relational tone, where some small talk before business is normal and expected.</td><td>Don't rush straight into the agenda. A brief personal exchange first is normal, not wasted time.</td></tr>
      </table>`,
  },
  {
    heading: 'Self-Assessment Worksheet',
    body: `
      <p>After a mock interview, or the real thing, score yourself honestly on each line. This is what actually compounds between interviews.</p>
      <table class="plan">
        <tr><th>Area</th><th>1–5</th><th>What to fix next time</th></tr>
        <tr><td>Answered with a specific story, not a generality</td><td></td><td></td></tr>
        <tr><td>Kept answers to roughly sixty to ninety seconds</td><td></td><td></td></tr>
        <tr><td>Looked at the camera, not the screen</td><td></td><td></td></tr>
        <tr><td>Asked at least one sharp clarifying question</td><td></td><td></td></tr>
        <tr><td>Had three or more real questions ready for the interviewer</td><td></td><td></td></tr>
        <tr><td>Setup had zero audio, video, or lighting issues</td><td></td><td></td></tr>
      </table>`,
  },
  {
    heading: 'Final Pre-Call Checklist',
    body: `
      <p>Print this page, or keep it open on a second screen ten minutes before the call.</p>
      <ul>
        <li>Camera, mic, and lighting tested in the actual room, at the actual time.</li>
        <li>Resume, job description, and your questions open in one place.</li>
        <li>Phone on silent, laptop plugged in, backup hotspot ready.</li>
        <li>Water nearby, with a notepad and pen within reach.</li>
        <li>Three STAR stories you can retrieve instantly, regardless of what's asked.</li>
        <li>Three questions ready to ask back.</li>
      </ul>`,
  },
  {
    heading: 'First Round Versus Final Round: What Changes',
    body: `
      <p>Early rounds mostly test whether you're a plausible fit at all, which means breadth matters more than depth. A recruiter screen rewards clarity and a tight story, not exhaustive detail. Final rounds test something different: whether the specific people you'd work with can picture it actually happening day to day, which rewards more specific, textured answers and a genuine two-way conversation rather than a polished pitch.</p>
      <p>A common mistake is answering a final-round question with the same generic version you used in the recruiter screen. If you're asked the same question twice across rounds, that's usually an invitation to go deeper the second time, not a sign to repeat yourself verbatim.</p>`,
  },
  {
    heading: 'Using AI Tools to Prepare, Without Sounding Scripted',
    body: `
      <p>AI tools, including the ones built into this platform, are genuinely useful for interview prep: drafting a first pass at a STAR answer, generating practice questions for a role you've never interviewed for before, or getting feedback on whether an answer actually addresses the question asked. The failure mode is treating the output as a script to memorize word for word rather than a draft to rewrite in your own voice.</p>
      <p>Interviewers hear a lot of answers, and a response that sounds generated rather than lived tends to stand out for the wrong reason: generic phrasing, suspiciously even pacing, or a structure that's technically correct but strangely impersonal. Use AI-assisted prep the way you'd use a good editor: to sharpen structure and catch gaps, not to supply the words you'll actually say.</p>`,
  },
  {
    heading: 'Keep Going After This Interview',
    body: `
      <p>Whatever the outcome, treat every interview as a repeatable asset. The questions you were asked, what worked, and what you'd change are the most accurate prep material you'll have for the next one, more useful than any generic guide, including this one.</p>
      <p>If you're actively job searching, pair this playbook with the rest of JobConnect AI's tools: AI-matched remote roles, AI-generated resumes and cover letters tailored per application, and the other guides in the Learn library covering salary negotiation and international contracts. The skills in this playbook compound fastest when you're interviewing regularly, not just once.</p>`,
  },
]

async function main() {
  const supabase = loadSupabaseClient()
  const { pdf, pageCount } = await renderGuidePdf({
    kicker: 'Learn Library · Elite',
    titleLines: ['Remote Interview', 'Prep Playbook'],
    subtitle: 'A practical, no-fluff guide to acing remote and cross-border interviews, from setup through follow-up.',
    docTitle: 'Remote Interview Prep Playbook',
    sections: SECTIONS,
  })

  writeFileSync(OUT_PATH, pdf)
  console.log(`✓ PDF generated (${pageCount} pages)`)

  await uploadGuide(supabase, pdf, STORAGE_PATH)
  console.log(`✓ Uploaded to learn-guides/${STORAGE_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })