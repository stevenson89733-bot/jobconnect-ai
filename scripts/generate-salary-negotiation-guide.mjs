/**
 * Generates the "International Salary Negotiation" PDF using the shared
 * Learn-guide renderer, then uploads it to Supabase Storage.
 *
 * Run: node scripts/generate-salary-negotiation-guide.mjs
 * Output: /tmp/salary-negotiation.pdf
 *         + upload to learn-guides/guides/salary-negotiation.pdf
 */

import { writeFileSync } from 'fs'
import { renderGuidePdf, uploadGuide, loadSupabaseClient } from './lib/pdf-guide-renderer.mjs'

const OUT_PATH = '/tmp/salary-negotiation.pdf'
const STORAGE_PATH = 'guides/salary-negotiation.pdf'

const SECTIONS = [
  {
    eyebrow: 'Getting Started',
    heading: 'How to Use This Guide',
    body: `
      <p class="lead">Negotiation feels uncomfortable mostly because it's unfamiliar, not because it's actually complicated. This guide is built around a small number of repeatable moves: build a number you can defend, state it calmly, and know in advance what you'll do if the answer is no. Everything else here supports one of those three things.</p>
      <p>If you have an offer in hand right now, skip ahead to the section on scripts for common scenarios, then come back to the research methodology once the immediate conversation is handled. If you have more time before an offer arrives, start from the beginning and build your range properly first.</p>`,
  },
  {
    heading: 'Why Negotiate at All',
    body: `
      <p>Most first offers leave room, even when a recruiter frames a number as final. Companies rarely open with their actual ceiling, both because it protects their budget if you accept immediately and because many candidates simply don't ask. Declining to negotiate doesn't make you a safer hire; it mostly means you accepted whatever number happened to be offered first, which may or may not reflect your actual market value.</p>
      <p>The discomfort of asking is real, but it's a one-time cost. The gap between your first offer and a negotiated one compounds across every future raise, bonus calculation, and job change that uses this salary as a reference point, which is exactly why it's worth doing carefully rather than skipping it to avoid an awkward conversation.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part One',
    heading: 'Research Before You Negotiate',
    body: `
      <p>A number without research behind it is just a guess, and guesses are easy to dismiss. Before any conversation about compensation, gather data from at least three sources: a salary aggregator for the specific role and region, conversations with people doing similar work, if you have access to any, and the posted range if the job listing included one, since many jurisdictions now require this by law.</p>
      <p>Adjust for the specifics that generic salary data usually misses: years of directly relevant experience rather than total years worked, the size and funding stage of the company, since a well-funded scale-up often pays differently than a bootstrapped startup for the same title, and whether the role is fully remote, hybrid, or tied to a specific office, which changes the relevant comparison set considerably.</p>
      <table class="plan">
        <tr><th>Source</th><th>What it's good for</th><th>What to watch for</th></tr>
        <tr><td>Salary aggregator sites</td><td>A broad baseline range for a title and region.</td><td>Self-reported data skews toward whoever bothers to submit it, often not a representative sample.</td></tr>
        <tr><td>Published job postings with ranges</td><td>A real, current number from an actual employer.</td><td>The posted range is sometimes wider than what's actually offered in practice.</td></tr>
        <tr><td>Direct conversations with peers</td><td>The most accurate, specific data available.</td><td>Respect confidentiality. Ask what someone's comfortable sharing rather than pressing for an exact figure.</td></tr>
        <tr><td>Recruiters in your field</td><td>Market movement and demand signals in real time.</td><td>A recruiter's number can be shaded toward closing a deal quickly rather than your maximum.</td></tr>
      </table>`,
  },
  {
    heading: 'Understanding Total Compensation',
    body: `
      <p>Base salary is only one line of the actual offer, and negotiating on base alone while ignoring the rest of the package often leaves real value on the table. A complete comparison includes the annual bonus target and how reliably it's actually paid out historically, any equity or stock component and its vesting schedule, retirement contributions or matching, and the value of benefits like health coverage, which varies enormously depending on your country's baseline healthcare system.</p>
      <p>For remote and cross-border roles specifically, also weigh a home-office or equipment stipend, a co-working space allowance if offered, a professional development budget, and how much paid time off is standard, since this varies far more by country than by company. Two offers with identical base salaries can represent very different total value once these are added in.</p>`,
  },
  {
    heading: 'Currency and Cost-of-Living Adjustments',
    body: `
      <p>Cross-border offers introduce a comparison problem that a single-country negotiation doesn't have: the number itself doesn't mean much until it's translated into what it actually buys where you live. Always clarify the currency the offer is denominated in, since a number that looks generous in one currency can be unremarkable once converted, and ask whether the company adjusts pay for cost of living in your specific location or pays a flat global rate regardless of where you're based.</p>
      <p>If the company does adjust for cost of living, ask how that adjustment is calculated and how often it's revisited, since costs shift over time and a stale cost-of-living index can quietly erode your real pay. If you're being paid in a currency different from the one you spend in day to day, factor in currency conversion fees and exchange-rate volatility when comparing an offer against your current compensation.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Two',
    heading: 'Timing: When to Bring Up Money',
    body: `
      <p>Bringing up compensation too early, before the company has decided it wants you, tends to weaken your position, since there's no established mutual interest yet to balance against the number. Bringing it up too late, after you've already signaled strong enthusiasm with no reservations, can make a later counter look inconsistent with what you said earlier.</p>
      <p>The strongest moment is usually right after a verbal offer, once interest is established but before anything is in writing. If asked for a number earlier in the process than you'd like, it's reasonable to redirect: "I'd like to understand the role fully first. What range is budgeted for this position?" This keeps you from anchoring too low before you have enough information, without refusing to engage with the question.</p>`,
  },
  {
    heading: 'The Anchor and the Range: How to State a Number',
    body: `
      <p>Whoever states a number first sets a reference point that the rest of the conversation tends to orbit around, which is why it's usually better to let the company name a figure first if possible. When you do need to state a number, give a range rather than a single figure, anchored near the top of what your research supports rather than the middle, since negotiations tend to settle somewhere inside the stated range rather than above it.</p>
      <p>A workable phrasing: "Based on my research for this role and region, I'm looking at a range of [X to Y]." This gives the other side room to respond without boxing either of you into a single number too early, and it signals that the figure is backed by research rather than picked arbitrarily.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Three',
    heading: 'Scripts for Common Scenarios',
    body: `
      <p>A handful of situations recur often enough to be worth having a ready response for, rather than improvising in the moment.</p>
      <h3>Countering a lower-than-expected offer</h3>
      <div class="qa"><p class="a">"Thank you for the offer, I'm genuinely excited about the role. Based on my research for this scope of work in [region or remote market], I was expecting something closer to [X]. Is there flexibility there?"</p></div>
      <h3>Handling a competing offer without burning the relationship</h3>
      <div class="qa"><p class="a">"I want to be transparent: I have another offer with a deadline of [date]. I'd genuinely prefer this role. Is there a way to move up the timeline, or match on [the specific gap]?"</p></div>
      <h3>When told there's no flexibility at all</h3>
      <div class="qa"><p class="a">"I understand if base salary is fixed. Is there flexibility elsewhere, in a signing bonus, additional equity, or a scheduled review at six months rather than the usual twelve?"</p></div>
      <h3>Negotiating a start date or a signing bonus to offset a gap</h3>
      <div class="qa"><p class="a">"Given the gap between my current end date and this start date, would a signing bonus be possible to offset that transition period?"</p></div>
      <h3>Responding to pressure to accept immediately</h3>
      <div class="qa"><p class="a">"I want to give you a real answer, not a rushed one. Can I confirm by [specific date, typically 48 to 72 hours out]?"</p></div>`,
  },
  {
    heading: 'Negotiating Beyond Base Salary',
    body: `
      <p>If base salary genuinely has no room, the rest of the package often does, and it's worth asking about specifically rather than assuming it's equally fixed. Equity grants can sometimes be increased even when cash compensation can't, particularly at earlier-stage companies managing cash carefully. Signing bonuses are often more flexible than base salary precisely because they're a one-time cost rather than a permanent increase to the company's payroll obligations.</p>
      <p>Additional paid time off, a flexible start date, an accelerated performance review timeline, or a professional development budget are all reasonable asks when cash compensation is genuinely capped. For remote-specific roles, a home-office stipend or equipment budget is also worth raising directly if it wasn't mentioned in the original offer.</p>`,
  },
  {
    heading: 'Negotiating a Title Alongside Compensation',
    body: `
      <p>Title is sometimes treated as a separate conversation from pay, but the two are often connected in practice, since many companies tie salary bands directly to a specific title or level. If a number genuinely can't move, it's worth asking whether the title or level itself is flexible, since a more senior title can sometimes unlock a different band entirely, and even where it doesn't change this offer, it affects your market positioning for the next one.</p>
      <p>Be realistic about this lever, though: a title negotiated without the matching scope of responsibility can create friction later, once colleagues and managers expect the role to match the label.</p>`,
  },
  {
    heading: 'Working With, or Around, a Recruiter',
    body: `
      <p>A recruiter is often the person actually relaying numbers between you and the hiring manager, which changes how you should approach the conversation. A recruiter generally wants the process to close successfully, which usually works in your favor, but they're also managing a budget range set by the hiring company, so a number far outside that range may simply not move no matter how it's framed.</p>
      <p>If a recruiter says there's no flexibility at all, it's reasonable to ask directly whether that's a hard constraint from the hiring manager or a starting position from the recruiter's side. Asking to speak with the hiring manager directly about compensation is sometimes appropriate for a senior role, but should be done carefully, since it can read as going around the recruiter rather than working with them.</p>`,
  },
  {
    heading: 'When a Company Won\'t Share Any Range at All',
    body: `
      <p>Some companies, especially in jurisdictions without a legal disclosure requirement, decline to share a range even when asked directly. In that situation, your own research becomes the entire basis for the number you state, rather than a supplement to one they've already shared. It's still reasonable to ask the question plainly, since even a refusal gives you information: a company that won't discuss range at all tends to be less flexible generally, which is useful to know before you invest further time in the process.</p>
      <p>If you're early enough in the process that walking away costs little, a company's refusal to share any compensation information at all, even a wide range, is a reasonable factor in deciding how much further to invest in that specific opportunity.</p>`,
  },
  {
    heading: 'Negotiating When You\'re Changing Industries or Roles',
    body: `
      <p>Switching industries or function makes salary research noticeably harder, since your most relevant comparable may be a role you've never actually held. In this situation, build your range from the target role's market data rather than your previous role's salary, and be explicit about the transferable skills that justify being compensated near that new market rather than at an entry-level rate for the new field.</p>
      <p>If the company is hesitant because of the career change itself, a lower starting base with a defined, written path to a review at six months, rather than the standard twelve, is a reasonable middle ground to propose.</p>`,
  },
  {
    heading: 'Negotiating Contractor and Freelance Rates',
    body: `
      <p>Negotiating a day rate or project rate as a contractor is a meaningfully different conversation than negotiating a salaried offer, since you're also pricing in the time between contracts, your own tax and benefits costs, and the risk of scope creep on a fixed-price project. Price your rate to cover not just hours worked but the administrative and non-billable time around the work itself, and for project-based work, define scope explicitly in writing before agreeing on a price, since an underspecified project is the single most common way a contractor's effective rate quietly erodes.</p>
      <p>For ongoing contract relationships, revisit your rate periodically rather than letting it stay flat indefinitely out of inertia. A client who's happy with your work is usually open to a reasonable rate increase at a natural renewal point, even if neither side raises it proactively.</p>`,
  },
  {
    heading: 'Sample Negotiation Emails',
    body: `
      <p>Written negotiation is common for remote and cross-border roles, where a live call isn't always practical across time zones. A few templates for common moments.</p>
      <h3>Countering an offer by email</h3>
      <div class="tmpl">Subject: Re: Offer for [Role]<br><br>
      Hi [Name],<br><br>
      Thank you for sending this over, I'm genuinely excited about the opportunity. Based on my research for this role and region, I was hoping for a base closer to [X]. Is there room to revisit that figure?<br><br>
      Happy to hop on a call if that's easier to discuss.<br><br>
      Best,<br>[Your name]</div>
      <h3>Accepting a final offer formally</h3>
      <div class="tmpl">Subject: Re: Offer for [Role], accepting<br><br>
      Hi [Name],<br><br>
      I'm happy to confirm I'm accepting the offer as outlined, with a start date of [date]. Could you send the final written offer for signature?<br><br>
      Looking forward to getting started.<br><br>
      Best,<br>[Your name]</div>
      <h3>Declining gracefully after negotiation didn't close the gap</h3>
      <div class="tmpl">Subject: Re: Offer for [Role]<br><br>
      Hi [Name],<br><br>
      Thank you for working with me on this, and for the time throughout the process. After careful consideration, I've decided to move forward with another opportunity that's a closer match on compensation. I really enjoyed meeting the team and hope our paths cross again.<br><br>
      Best,<br>[Your name]</div>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Six',
    heading: 'How Company Stage Changes the Conversation',
    body: `
      <p>The same request lands differently depending on where a company is in its lifecycle, and reading that correctly shapes what's actually worth asking for. Early-stage, venture-funded companies often have real constraints on cash but more flexibility on equity, since a larger grant doesn't affect this year's burn rate the way a higher salary does. Growth-stage companies with more predictable revenue often have more room on cash but a more rigid internal pay-band structure that's harder to negotiate outside of.</p>
      <p>Public companies tend to have the most standardized bands of all, with less room for an individually negotiated exception, but often more transparency about what that band actually is if you ask directly. Bootstrapped or profitable smaller companies vary the most, since there's no external funding round dictating a budget, which can mean either more flexibility or a flatly fixed owner-set number depending entirely on the individual company.</p>`,
  },
  {
    heading: 'Benchmarking Your Pay Annually, Not Just When Job Searching',
    body: `
      <p>Waiting until you're actively job searching to check whether your pay still matches the market is a common and avoidable gap. Set a yearly reminder to re-run the same research described earlier in this guide against your current role, even with no intention of leaving, simply to know where you actually stand.</p>
      <p>If that research turns up a meaningful gap, that's useful information for a raise conversation with your current employer, covered earlier in this guide, rather than a reason to immediately start job searching. Pay gaps that are caught and raised early are usually easier to close than ones that are allowed to compound silently for several years.</p>`,
  },
  {
    heading: 'What to Do If You Already Accepted and Regret the Number',
    body: `
      <p>If you've already signed an offer and later realize the number was lower than it should have been, reopening that specific negotiation is usually not realistic once a contract is signed, but it isn't the end of the story either. Document your reasoning the same way you would for any raise conversation, and raise it at the earliest appropriate moment, typically your first scheduled review, rather than immediately after starting, which tends to read poorly regardless of how justified the underlying number is.</p>
      <p>If the gap is severe enough that waiting isn't realistic financially, it's reasonable to have a direct, calm conversation with your manager explaining the situation honestly, though it's worth going in with realistic expectations about what's likely to change outside of a normal review cycle.</p>`,
  },
  {
    heading: 'Negotiating as an Internal Candidate or for a Promotion',
    body: `
      <p>Negotiating a promotion inside a company you already work for is a different conversation than negotiating a new offer, since there's an existing relationship and often an internal pay band to work within. Build your case the same way you would externally: gather market data for the new title, and add a clear account of the specific scope and impact that justifies the increase, not just tenure in your current role.</p>
      <p>Timing matters more here than in an external negotiation, since internal promotions are often tied to a formal review cycle or budget planning period. Raise the conversation early enough to be included in that cycle rather than after decisions have already been finalized for the period.</p>`,
  },
  {
    heading: 'Negotiating a Raise Without a Competing Offer',
    body: `
      <p>Asking for a raise in your current role, with no outside offer to point to, relies more heavily on documented impact than a new-offer negotiation does. Keep an ongoing record of concrete contributions rather than trying to reconstruct a year of work from memory right before the conversation: specific projects, measurable outcomes, and any responsibilities you've taken on beyond your original role description.</p>
      <p>Bring the conversation to your manager directly rather than hoping it comes up during a scheduled review, and frame it around market data and demonstrated scope rather than personal financial need, which tends to be a weaker lever in a compensation conversation even when it's genuinely the underlying reason you're asking.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Four',
    heading: 'Regional Negotiation Norms',
    body: `
      <p>Negotiation expectations vary by region as much as interview norms do. These are broad tendencies, not universal rules, and individual companies vary within any country.</p>
      <table class="plan">
        <tr><th>Region</th><th>General tendency</th><th>What to calibrate</th></tr>
        <tr><td>United States</td><td>Negotiation is widely expected and rarely penalized if done professionally.</td><td>Come with a clear, research-backed range. Vague requests without numbers tend to get a vague response.</td></tr>
        <tr><td>United Kingdom</td><td>More reserved; large counters can be seen as pushy if not well justified.</td><td>Frame the ask around market data rather than personal need.</td></tr>
        <tr><td>Germany</td><td>Direct, with an expectation that your ask is backed by clear reasoning.</td><td>Have specific comparables ready rather than a round-number request.</td></tr>
        <tr><td>France</td><td>Negotiation happens, but is often more formal and tied to defined pay scales, especially in larger companies.</td><td>Ask about the structure of the pay scale itself, not just the number.</td></tr>
        <tr><td>Japan</td><td>Less individual negotiation is typical; compensation is often more standardized by level.</td><td>Focus questions on the leveling and promotion structure rather than a one-time counter.</td></tr>
        <tr><td>India</td><td>Negotiation is common and expected, particularly around joining bonuses and notice-period buyouts.</td><td>Clarify notice-period handling explicitly if you're negotiating a start date.</td></tr>
        <tr><td>Brazil</td><td>Relationship-oriented; the tone of the conversation matters as much as the content.</td><td>Keep the discussion warm and collaborative rather than purely transactional.</td></tr>
        <tr><td>Canada</td><td>Similar to the United States, though generally somewhat more understated in tone.</td><td>A clear, research-backed ask works well; aggressive framing is less necessary than in the US.</td></tr>
        <tr><td>United Arab Emirates</td><td>Compensation is often tax-free, which shifts the comparison; negotiation is common, especially around housing allowance.</td><td>Factor in the tax-free status explicitly when comparing to a taxed offer elsewhere.</td></tr>
      </table>`,
  },
  {
    heading: 'Taxes and Take-Home Pay Across Borders',
    body: `
      <p>Two offers with an identical gross figure can produce very different take-home pay once local tax treatment is factored in, which makes gross-to-gross comparisons across countries misleading on their own. Where possible, get a rough estimate of your actual take-home figure in each location, factoring in income tax brackets, any social security or equivalent mandatory contributions, and whether the employer or you are responsible for specific filings as a cross-border worker.</p>
      <p>This is also where speaking with a tax professional familiar with cross-border employment, even briefly, tends to pay for itself, since the rules around dual taxation, foreign income exclusions, and residency status are genuinely complex and vary by exact country pairing.</p>`,
  },
  {
    heading: 'What Changes When You\'re Hired Through an Employer of Record',
    body: `
      <p>When a company hires you through an employer of record rather than directly, the compensation conversation usually still happens with the hiring company, but the actual contract and some benefit details are administered by the third party. Clarify early which parts of the offer are set by the hiring company, such as base salary and bonus, and which are determined by the employer of record's local requirements, such as statutory benefits or notice periods, since negotiating the wrong party on the wrong item wastes time for everyone.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Five',
    heading: 'What Recruiters Actually Think When You Negotiate',
    body: `
      <p>A common fear is that negotiating will make a company reconsider the offer entirely, and in practice this is rare when the request is reasonable and professionally delivered. Most recruiters and hiring managers negotiate compensation routinely and don't read a calm counter as a red flag about your character or your interest in the role. What does register poorly is an unreasonable number with no research behind it, an aggressive or ultimatum-driven tone, or re-opening a point that was already explicitly settled earlier in the conversation.</p>
      <p>If anything, a well-reasoned counter can read as a positive signal, since it suggests you'll likely advocate for the team and for resourcing just as clearly once you're actually in the role.</p>`,
  },
  {
    heading: 'Pay Transparency Laws and Posted Ranges',
    body: `
      <p>A growing number of jurisdictions now require employers to post a salary range on job listings, or to disclose one on request. Where this applies, it changes your research starting point considerably, since you have an actual anchor from the employer rather than only external aggregator data. Treat a posted range as a starting point rather than the full picture, since actual offers often cluster in the lower half of a wide posted range, and your research into comparable roles still matters for deciding where in that range to aim.</p>
      <p>If no range is posted and you're in a jurisdiction where disclosure is required on request, it's reasonable to ask for it directly and early, since this is now a normal, expected question in many markets rather than an unusual one.</p>`,
  },
  {
    heading: 'Negotiating a Relocation Package',
    body: `
      <p>Relocation is a distinct negotiation from a remote-work stipend, since it typically involves an actual physical move rather than an ongoing home-office allowance. If relocation is part of the offer, clarify what's covered specifically: moving costs, temporary housing while you search for a permanent place, visa or immigration-related legal fees if the move is cross-border, and whether any of this is a lump sum you manage yourself or a service the company arranges directly.</p>
      <p>Also ask about a repayment clause, since many relocation packages require repayment of some or all costs if you leave within a defined window, commonly twelve to twenty-four months, and that clause is worth understanding fully before you accept rather than after you've already moved.</p>`,
  },
  {
    heading: 'Negotiating in a Hot Market Versus a Downturn',
    body: `
      <p>Broader market conditions shift how much room realistically exists in any negotiation, and calibrating your expectations to the actual environment avoids both underselling yourself and pushing too hard against a genuine constraint. In a hot hiring market, with multiple competing offers common, more aggressive counters tend to work, and speed matters less since companies expect some back and forth.</p>
      <p>In a slower market or during a company-specific downturn, cash flexibility shrinks, but non-cash flexibility, like a faster review cycle, title, or equity, often increases to compensate, since it carries a different kind of cost to the company. Reading which environment you're actually in, rather than negotiating as if conditions are constant, changes where it's worth spending your effort.</p>`,
  },
  {
    heading: 'Handling Common Objections',
    body: `
      <p>A short set of standard objections comes up often enough to be worth a prepared response for each.</p>
      <div class="qa"><p class="q">"That's above our budget for this role."</p><p class="a">Ask what the actual budget ceiling is, and whether there's flexibility in a different component if base truly can't move.</p></div>
      <div class="qa"><p class="q">"We don't negotiate offers."</p><p class="a">Ask politely whether that applies to every component, including start date, signing bonus, and review timeline, not only base salary.</p></div>
      <div class="qa"><p class="q">"HR sets that number, it's out of my hands."</p><p class="a">Ask whether there's a process to formally request a review of the number, and who that request should go to.</p></div>
      <div class="qa"><p class="q">"This is already a generous offer."</p><p class="a">Acknowledge the offer genuinely, then return calmly to your specific research-backed reasoning rather than either conceding immediately or arguing the point.</p></div>`,
  },
  {
    heading: 'The Difference Between a Counter and an Ultimatum',
    body: `
      <p>A counter invites a continued conversation; an ultimatum ends one. "I was hoping for something closer to [X], is there room there?" leaves space for a real back and forth. "I won't accept less than [X]" closes that space, even when the underlying number is identical, and tends to produce a worse outcome even in cases where the number itself was entirely reasonable.</p>
      <p>Reserve genuinely firm language for situations where you mean it literally and are prepared to walk away, since using it as a negotiating tactic when you don't actually intend to follow through tends to be noticed and can damage trust in the rest of the conversation.</p>`,
  },
  {
    heading: 'Sequencing Multiple Asks Without Overwhelming the Conversation',
    body: `
      <p>If you have more than one thing to negotiate, base salary, start date, and a signing bonus, for example, raising all three with equal weight in the same breath can read as a long list of demands rather than a focused request. Lead with the single most important item, typically base salary, resolve or at least discuss that first, and introduce secondary items afterward, framed as smaller asks given where the primary conversation landed.</p>
      <p>This sequencing isn't about being passive. It's about making sure the item that matters most to you gets the clearest, most focused attention rather than being diluted among several requests at once.</p>`,
  },
  {
    heading: 'Common Mistakes That Cost Money',
    body: `
      <p>Accepting the first number out of relief that an offer arrived at all is the single most common mistake, and it's rarely revisited once signed. Negotiating only on base salary while ignoring bonus structure, equity terms, and benefits leaves real value unexamined. Giving a number before doing any research anchors the entire conversation to a guess rather than a defensible figure.</p>
      <p>Treating a verbal number as final before anything is in writing is another frequent error, since verbal commitments can shift during the formal offer-letter process. And negotiating by email when a short call would resolve a misunderstanding faster often drags out a conversation that didn't need to take days.</p>`,
  },
  {
    heading: 'Red Flags During Negotiation',
    body: `
      <p>A few patterns are worth noticing during the negotiation itself, not just after you've started the job. Pressure to accept within hours, with no reasonable explanation for the urgency, is a common tactic rather than a genuine constraint. A company that becomes noticeably cold or dismissive the moment you ask any question about compensation is showing you something about how they'll likely respond to similar requests later, during a performance review.</p>
      <p>Vague answers about when a verbal number will actually appear in writing are worth pressing on directly, and a refusal to put agreed terms in writing at all is a serious signal, regardless of how reasonable everything sounded on the call.</p>`,
  },
  {
    heading: 'How to Evaluate Equity Realistically',
    body: `
      <p>Equity is often the hardest part of an offer to compare honestly, since a large-sounding number of shares or options can mean very different things depending on the company's actual valuation and how diluted that stake is likely to become. Ask directly what percentage of the fully diluted company the grant represents, rather than relying on a share count alone, and ask about the company's most recent valuation if it's a private company, understanding that early-stage valuations carry real uncertainty.</p>
      <p>For stock options specifically, clarify the strike price and, for US companies, the most recent 409A valuation used to set it, since a wide gap between strike price and actual value is where the real financial upside or downside lives. Understand the vesting schedule in full, including any cliff, and ask what happens to unvested equity if you leave or if the company is acquired, since these terms vary and materially change what the grant is actually worth to you.</p>`,
  },
  {
    heading: 'Negotiating With a Mission-Driven Company Paying Below Market',
    body: `
      <p>Some roles, particularly at early-stage startups or mission-driven organizations, genuinely pay below typical market rate, and the organization may be upfront about that tradeoff rather than hiding it. If you're considering this kind of offer, it's still worth negotiating within that lower band rather than skipping negotiation because the whole structure feels different, and it's worth being honest with yourself about whether the non-cash reasons for taking the role, equity upside, mission, or learning opportunity, genuinely justify the gap or whether you're rationalizing a number that doesn't actually work for your situation.</p>`,
  },
  {
    heading: 'Questions to Ask Before You Start Negotiating',
    body: `
      <p>A short round of clarifying questions before you make any counter at all can save a lot of wasted back and forth. Confirm whether the number presented is genuinely final or an opening position, who actually has authority to approve a change, and what the realistic timeline is for a revised offer if one is possible. Asking these directly, rather than guessing, means your actual negotiation happens with accurate information about how much room there might be.</p>`,
  },
  {
    heading: 'Written Confirmation Culture Varies by Region',
    body: `
      <p>Some business cultures rely more heavily on verbal agreements and relationship trust than others, which matters when you're deciding how hard to push for everything in writing. Where verbal commitments are culturally treated as binding, pushing too hard for written confirmation of every small detail can read as distrustful. Where the norm is to get everything in writing regardless of relationship, failing to do so is the actual red flag. When working across a cultural gap you're unfamiliar with, it's reasonable to simply ask how the company typically formalizes agreements like this, rather than assuming either norm applies.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Capstone',
    heading: 'A Worked Example, Start to Finish',
    body: `
      <p>A composite, realistic walk-through of the whole process, showing how the pieces of this guide fit together in practice.</p>
      <p>A candidate receives a verbal offer for a remote role: a base of 78,000 dollars, a 10 percent bonus target, and no equity mentioned. Their research, drawn from a salary aggregator, two posted job listings with ranges, and a conversation with a peer in a similar role, points to a market range of 82,000 to 95,000 dollars for the same scope of work and region.</p>
      <p>Rather than accepting on the call, the candidate asks for the offer in writing and a few days to review, which is granted. They reply by email with a counter: "Thank you for the offer, I'm genuinely excited about the role. Based on my research for this scope of work and region, I was hoping for a base closer to 90,000. Is there flexibility there?" The recruiter responds that base is largely fixed at 80,000 but that a signing bonus and an accelerated six-month review are both possible.</p>
      <p>The candidate asks for a 5,000 dollar signing bonus and a written commitment to the six-month review, both of which are accepted. The final written offer reflects all three points: 80,000 base, the signing bonus, and the review commitment, and the candidate confirms acceptance only after checking that every discussed term actually appears in the document.</p>
      <p>Nothing about this exchange involved confrontation or an ultimatum. It was research, a calm counter, and a willingness to look at the full package rather than base salary alone, which is the core pattern this entire guide is built around.</p>`,
  },
  {
    heading: 'A Short FAQ',
    body: `
      <div class="qa"><p class="q">Should I disclose my current salary if asked?</p><p class="a">You're not obligated to, and in many jurisdictions employers are now barred from asking. If asked anyway, it's fine to redirect to your target range instead.</p></div>
      <div class="qa"><p class="q">Can I negotiate an internship or apprenticeship stipend?</p><p class="a">Often yes, though the realistic range is narrower. The same research-and-ask approach still applies, just calibrated to that scale.</p></div>
      <div class="qa"><p class="q">What if I panic and accept a number I didn't mean to on the call?</p><p class="a">It's reasonable to follow up the same day: "On reflection, I'd like to revisit the number we discussed before this becomes final." This isn't unusual.</p></div>
      <div class="qa"><p class="q">Is it ever too late to negotiate?</p><p class="a">Once a contract is signed, effectively yes for that specific offer. Before that, it's rarely too late, even if it feels awkward to reopen the topic.</p></div>`,
  },
  {
    heading: 'A Six and Twelve Month Follow-Up Plan',
    body: `
      <p>If part of your negotiation included a commitment to an earlier or accelerated review, write it down somewhere you'll actually see it again, and raise it proactively rather than waiting to be reminded, since a verbally promised review can easily slip through the cracks of a busy manager's calendar with no bad intent at all. At the twelve-month mark regardless of any specific commitment, re-run the research described earlier in this guide to confirm your pay is still tracking with the market, since markets move even when your role and performance haven't changed.</p>`,
  },
  {
    heading: 'Getting the Offer in Writing',
    body: `
      <p>Nothing discussed verbally is final until it appears in a written offer letter or contract, and that document is what you should actually review carefully before accepting. Check that the base salary matches what was discussed, that bonus eligibility and target percentage are stated rather than implied, and that equity grant size, vesting schedule, and strike price, if applicable, are specified rather than left as "details to follow."</p>
      <p>Also confirm start date, any signing bonus and its repayment conditions if you leave early, and for cross-border roles specifically, the currency the salary is denominated in and which entity, the company directly or an employer of record, is the actual signatory on the contract.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Worksheets',
    heading: 'Build Your Number',
    body: `
      <p>Fill this in before any negotiation conversation, so you're working from a number you've already defended to yourself rather than improvising one live.</p>
      <table class="plan">
        <tr><th>Input</th><th>Your figure</th></tr>
        <tr><td>Market range from research (low to high)</td><td></td></tr>
        <tr><td>Adjustment for your specific years of relevant experience</td><td></td></tr>
        <tr><td>Adjustment for company stage or size</td><td></td></tr>
        <tr><td>Adjustment for cost of living, if cross-border</td><td></td></tr>
        <tr><td>Your target number</td><td></td></tr>
        <tr><td>Your walk-away number</td><td></td></tr>
      </table>`,
  },
  {
    heading: 'Compare Two Offers Side by Side',
    body: `
      <table class="plan">
        <tr><th>Factor</th><th>Offer A</th><th>Offer B</th></tr>
        <tr><td>Base salary</td><td></td><td></td></tr>
        <tr><td>Bonus target and historical payout rate</td><td></td><td></td></tr>
        <tr><td>Equity value and vesting schedule</td><td></td><td></td></tr>
        <tr><td>Benefits and retirement contributions</td><td></td><td></td></tr>
        <tr><td>Remote stipend or equipment budget</td><td></td><td></td></tr>
        <tr><td>Paid time off</td><td></td><td></td></tr>
        <tr><td>Growth trajectory and team quality, as best you can assess</td><td></td><td></td></tr>
      </table>`,
  },
  {
    heading: 'Glossary of Compensation Terms',
    body: `
      <table class="plan">
        <tr><th>Term</th><th>Meaning</th></tr>
        <tr><td>OTE, on-target earnings</td><td>Base salary plus the bonus or commission you'd earn at full target performance, commonly used in sales roles.</td></tr>
        <tr><td>Vesting schedule</td><td>The timeline over which equity grants actually become yours, often with an initial cliff before any portion vests.</td></tr>
        <tr><td>Cliff</td><td>A waiting period, commonly one year, before any equity vests at all, even though the grant was made earlier.</td></tr>
        <tr><td>RSU, restricted stock unit</td><td>A grant of actual company shares that vest over time, distinct from a stock option, which grants the right to buy shares at a set price.</td></tr>
        <tr><td>Thirteenth-month salary</td><td>An extra month of base pay, common in some countries' compensation norms, often paid at year-end.</td></tr>
        <tr><td>Notice-period buyout</td><td>A payment that lets you leave a current role before your contractual notice period ends, sometimes negotiated as part of a new offer's start date.</td></tr>
      </table>`,
  },
  {
    heading: 'Healthcare and Benefits Baselines Vary Enormously by Country',
    body: `
      <p>A benefits package that looks modest in one country can be entirely standard in another, simply because the public baseline it's sitting on top of is different. In the United States, employer-sponsored health insurance is a major component of total compensation precisely because there's no universal public alternative, which makes it worth comparing carefully between offers rather than assuming it's a fixed, unremarkable line item. In many European countries, with strong public healthcare systems, employer health benefits matter less in absolute terms, and the more meaningful comparison points are often pension contributions, parental leave policy, and statutory paid time off.</p>
      <table class="plan">
        <tr><th>Benefit area</th><th>What to ask</th></tr>
        <tr><td>Health coverage</td><td>What's covered, what the employee contribution is, and whether dependents are included.</td></tr>
        <tr><td>Retirement contributions</td><td>Whether the employer matches contributions, and up to what percentage.</td></tr>
        <tr><td>Parental leave</td><td>Paid duration, and whether it differs for primary versus secondary caregivers.</td></tr>
        <tr><td>Mental health support</td><td>Whether therapy or counseling is covered directly, or only available through a general wellness stipend.</td></tr>
        <tr><td>Sabbatical or extended leave policy</td><td>Whether any exists after a tenure threshold, and whether it's paid or unpaid.</td></tr>
      </table>`,
  },
  {
    heading: 'A Quick-Reference: Scenario to Lever',
    body: `
      <table class="plan">
        <tr><th>Your situation</th><th>Most useful lever to pull</th></tr>
        <tr><td>Base salary is firmly capped</td><td>Signing bonus, equity, or an accelerated review timeline.</td></tr>
        <tr><td>You have a competing offer</td><td>Transparency about the deadline, plus a specific gap to close rather than a vague ask.</td></tr>
        <tr><td>You're changing industries</td><td>Market data for the target role, plus a defined early review rather than a permanent discount.</td></tr>
        <tr><td>You're an internal candidate</td><td>Documented scope and impact, timed to the budget planning cycle.</td></tr>
        <tr><td>The role is cross-border</td><td>Clarity on currency, cost-of-living adjustment, and which entity is the actual employer of record.</td></tr>
        <tr><td>You're a contractor</td><td>A clearly scoped project price, or a day rate that accounts for non-billable time.</td></tr>
      </table>`,
  },
  {
    heading: 'Final Checklist Before You Accept',
    body: `
      <ul>
        <li>Every verbally agreed term appears in the written offer, not just the base salary.</li>
        <li>You understand the bonus structure and its realistic, historical payout rate.</li>
        <li>Equity terms, if any, are specified rather than vague.</li>
        <li>Currency, and any cost-of-living adjustment, is explicit for cross-border offers.</li>
        <li>You've compared total compensation, not base salary alone, against any competing offer.</li>
        <li>You have a written response deadline you're comfortable with.</li>
      </ul>`,
  },
  {
    heading: 'Negotiating Notice Periods and Non-Compete Terms',
    body: `
      <p>Compensation isn't the only negotiable term in a contract, and two clauses are worth specific attention. A notice period that's unusually long relative to local norms can trap you in a future job search longer than expected, and it's reasonable to ask whether it's negotiable, particularly for a more junior role where a lengthy notice period is less standard. A non-compete clause, where enforceable in your jurisdiction, can meaningfully limit your next move, so it's worth understanding its scope, duration, and geographic reach clearly rather than treating it as boilerplate you can skim past.</p>
      <p>Both of these are easier to adjust before signing than after, which is exactly why they belong in the same conversation as salary rather than a separate, later concern.</p>`,
  },
  {
    heading: 'Talking About Money With a Manager You Like',
    body: `
      <p>Raising a compensation request with someone you genuinely like working for can feel more awkward than negotiating with a stranger, precisely because you don't want the conversation to feel transactional. It helps to remember that a reasonable manager expects this conversation as a normal part of the job, not a breach of the relationship, and that avoiding it to protect the relationship often just means quietly underpaying yourself instead.</p>
      <p>Frame the conversation around your contribution and market data, the same way you would with anyone else, and trust that a good manager will treat a well-prepared request as exactly that, rather than reading too much into the fact that you asked at all.</p>`,
  },
  {
    heading: 'Confidence Without Arrogance',
    body: `
      <p>The tone that works best across almost every scenario in this guide is calm and factual rather than either apologetic or combative. Apologizing for asking, hedging every sentence, or visibly bracing for rejection tends to invite exactly the pushback you're worried about. Overcorrecting into an aggressive, ultimatum-heavy tone tends to produce a worse outcome just as often. The version that works is simpler than either: state your research, state your number, and let the conversation proceed from there without treating it as a confrontation in either direction.</p>`,
  },
  {
    heading: 'Keep Negotiating, Carefully, Every Time',
    body: `
      <p>Negotiation is a skill that improves with repetition, and the discomfort genuinely does fade with practice. Each negotiation, whether it goes well or doesn't move the number at all, gives you real data for the next one: what worked, what the company's actual constraints seemed to be, and what you'd prepare differently.</p>
      <p>Pair this guide with the rest of JobConnect AI's Learn library, including the interview prep playbook and the international contracts guide, since compensation, interview performance, and contract terms are really one connected negotiation playing out across several conversations rather than three separate skills.</p>`,
  },
]

async function main() {
  const supabase = loadSupabaseClient()
  const { pdf, pageCount } = await renderGuidePdf({
    kicker: 'Learn Library · Pro',
    titleLines: ['International Salary', 'Negotiation'],
    subtitle: 'A research-backed approach to negotiating compensation across borders, roles, and currencies.',
    docTitle: 'International Salary Negotiation',
    sections: SECTIONS,
  })

  writeFileSync(OUT_PATH, pdf)
  console.log(`✓ PDF generated (${pageCount} pages)`)

  await uploadGuide(supabase, pdf, STORAGE_PATH)
  console.log(`✓ Uploaded to learn-guides/${STORAGE_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })
