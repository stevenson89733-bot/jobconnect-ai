/**
 * Generates the "International Contracts & Compliance" PDF using the shared
 * Learn-guide renderer, then uploads it to Supabase Storage.
 *
 * Run: node scripts/generate-international-contracts-guide.mjs
 * Output: /tmp/international-contracts.pdf
 *         + upload to learn-guides/guides/international-contracts.pdf
 */

import { writeFileSync } from 'fs'
import { renderGuidePdf, uploadGuide, loadSupabaseClient } from './lib/pdf-guide-renderer.mjs'

const OUT_PATH = '/tmp/international-contracts.pdf'
const STORAGE_PATH = 'guides/international-contracts.pdf'

const SECTIONS = [
  {
    eyebrow: 'Getting Started',
    heading: 'How to Use This Guide, and an Important Note',
    body: `
      <p class="lead">This guide explains the structures, clauses, and terms that show up in international and remote employment contracts, so you can read an offer with real understanding rather than skimming past the parts that feel unfamiliar. It's written to make you a more informed reader of your own contract, not to replace one.</p>
      <p class="disclaimer">This guide is general educational information, not legal or tax advice, and employment law varies significantly by country and even by region within a country. Before signing any contract, especially a cross-border one, have it reviewed by a qualified employment lawyer or tax professional licensed in the relevant jurisdiction. Nothing in this guide should be treated as a substitute for that review.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part One',
    heading: 'The Four Employment Structures You\'ll Encounter',
    body: `
      <p>Almost every cross-border or remote role falls into one of four structures, and understanding which one you're being offered changes what questions actually matter.</p>
      <table class="plan">
        <tr><th>Structure</th><th>How it works</th><th>What it means for you</th></tr>
        <tr><td>Direct employment, local entity</td><td>The hiring company has a registered legal entity in your country and employs you directly through it.</td><td>Standard local payroll, tax withholding, and statutory benefits apply as they would for any local employee.</td></tr>
        <tr><td>Employer of record</td><td>A third-party company legally employs you on behalf of the hiring company, which has no local entity itself.</td><td>Your contract is with the employer of record, not the hiring company, even though you report to and work for the hiring company day to day.</td></tr>
        <tr><td>Professional employer organization</td><td>Similar to an employer of record, but typically used when the hiring company already has some local presence and wants to share employer responsibilities.</td><td>You're co-employed by both entities in a way that can affect which labor protections apply.</td></tr>
        <tr><td>Independent contractor</td><td>You're self-employed and invoice the hiring company directly for your work.</td><td>You handle your own taxes and typically receive no statutory employee benefits, but gain more flexibility over how the work is structured.</td></tr>
      </table>`,
  },
  {
    heading: 'How to Tell Which Structure You\'re Actually Being Offered',
    body: `
      <p>Job postings and even recruiters don't always use these terms precisely, which makes it worth confirming directly rather than assuming. Ask plainly: "Will I be employed directly by your company, through an employer of record, or as an independent contractor?" If the answer is an employer of record, ask which one by name, since you can research that company's reputation and terms separately from the hiring company's. If the answer is contractor, ask whether that classification has actually been reviewed against your country's specific test for employee versus contractor status, which is covered next.</p>`,
  },
  {
    heading: 'Employee Versus Contractor Misclassification',
    body: `
      <p>Many countries apply a legal test to determine whether a worker is genuinely an independent contractor or is actually functioning as an employee regardless of the label in the contract. Common factors in that test include how much control the company exercises over your schedule and methods, whether you work exclusively for one company, whether you use your own equipment, and whether the relationship is ongoing rather than project-based.</p>
      <p>Misclassification carries real risk for both sides: a company that misclassifies employees as contractors can face penalties and back-payment obligations, and a contractor who's actually functioning as an employee may be missing out on statutory protections they're legally entitled to. If your actual working arrangement looks far more like employment than contracting, regardless of what the contract calls it, that mismatch is worth raising directly rather than assuming the label settles the question.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Two',
    heading: 'Reading a Contract: Job Title, Scope, and Reporting Line',
    body: `
      <p>The scope section of a contract defines what you're actually being hired to do, and a vague version of it can create friction later if your actual responsibilities drift well beyond what was agreed. Check that your title and level match market norms for the role, since titles are sometimes used loosely in smaller or earlier-stage companies in ways that don't map cleanly to your actual seniority. Confirm who you report to, and whether that's stated as a specific person or only a general department, since the latter can signal less organizational clarity than you'd want.</p>`,
  },
  {
    heading: 'Compensation Clause Details',
    body: `
      <p>Beyond the headline number, check how compensation is actually structured in the contract itself. Confirm the pay frequency, monthly, biweekly, or another cycle entirely, since this varies by country and affects your own cash-flow planning. Check whether the stated figure is gross or net, and in which currency, especially for roles paid from a country different from where you live. If a bonus is mentioned, check whether the contract states a target percentage and the criteria for earning it, or only a vague reference to a bonus "at the company's discretion," which offers far less protection.</p>`,
  },
  {
    heading: 'Working Hours and Overtime',
    body: `
      <p>Standard working hours and overtime rules vary enormously by country, and a contract written by a company unfamiliar with your specific jurisdiction sometimes simply imports its home country's norms without adjusting them. Many countries have statutory maximum working hours and mandatory overtime pay above a certain threshold, regardless of what a contract states, which means a clause that conflicts with local law may not actually be enforceable even if you signed it. If working hours or overtime terms seem unusual for your location, it's worth confirming against your own country's labor law rather than assuming the contract is automatically compliant.</p>`,
  },
  {
    heading: 'The Probation Period',
    body: `
      <p>A probation period is a defined initial window, often three to six months depending on the country, during which either party can typically end the employment with reduced notice. Check the specific length stated, what happens to any signing bonus or equity if employment ends during probation, and whether benefits like health coverage begin immediately or only after probation concludes, since a gap here can matter in a cross-border move where you're also losing coverage from a previous country.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Three',
    heading: 'The Notice Period',
    body: `
      <p>Notice period requirements differ sharply between legal systems. In the United States, at-will employment is the default in most states, meaning either party can generally end employment with no notice at all, absent a specific contractual commitment otherwise. In much of Europe and many other regions, a statutory or contractual notice period, often scaling with tenure, is standard and expected on both sides.</p>
      <p>Check whether your notice period is symmetrical, the same length whether you resign or the company terminates you, since an asymmetrical clause, a long notice period if you leave but a short one if the company lets you go, is worth questioning directly. Also check whether the company can place you on "garden leave" during that notice period, continuing to pay you while asking you not to work, which is common in some jurisdictions and can affect your ability to start a new role immediately.</p>`,
  },
  {
    heading: 'Termination Clauses: For Cause and Without Cause',
    body: `
      <p>Most contracts distinguish between termination "for cause," meaning a specific, defined breach such as gross misconduct, and termination "without cause," meaning the company ends the employment for business reasons unrelated to your conduct. The distinction matters because it often affects severance eligibility and notice requirements. Check what the contract actually defines as cause, since an overly broad or vague definition gives the company more room to classify an ordinary performance issue as cause, which can eliminate severance you'd otherwise be entitled to.</p>`,
  },
  {
    heading: 'Non-Compete Clauses',
    body: `
      <p>A non-compete clause restricts your ability to work for a competing company for a defined period after leaving. Enforceability varies enormously by jurisdiction. Some US states have banned non-competes outright for most workers, while they remain broadly enforceable in many other countries, sometimes with a requirement that the company pay you during the restricted period in exchange for the restriction.</p>
      <p>If you're asked to sign a non-compete, check its duration, its geographic scope, and how narrowly or broadly "competing company" is actually defined, since an overly broad definition can meaningfully limit your next move in ways that are easy to underestimate while you're focused on accepting a new offer rather than planning your eventual exit from it.</p>`,
  },
  {
    heading: 'Non-Solicitation Clauses',
    body: `
      <p>Distinct from a non-compete, a non-solicitation clause restricts you from recruiting former colleagues or soliciting former clients for a period after leaving, without necessarily restricting where you can work at all. These are generally more narrowly enforceable and less controversial than non-competes, but still worth reading carefully, particularly the definition of who counts as a "client" or "colleague" under the clause, since an overly broad version can extend further than you'd expect.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Four',
    heading: 'Confidentiality and NDA Clauses',
    body: `
      <p>Confidentiality clauses are nearly universal and generally reasonable in substance, protecting genuinely sensitive company information. The detail worth checking is scope: an overly broad confidentiality clause can sometimes extend to cover your own general skills and knowledge gained on the job, rather than only the company's specific proprietary information, which could create friction with a future employer. Check whether the clause has a defined time limit or applies indefinitely, and whether it carves out information that was already public or that you already knew before joining.</p>`,
  },
  {
    heading: 'Intellectual Property Assignment Clauses',
    body: `
      <p>For technical, creative, and design roles especially, an IP assignment clause states that work you create during your employment belongs to the company, not to you personally. This is standard and expected for most roles, but the scope matters: check whether the clause is limited to work created using company resources or during working hours, or whether it's written broadly enough to cover anything you create at any time, including personal side projects unrelated to your job. Many jurisdictions have statutory limits on how broad this kind of clause can actually be enforced, regardless of what's written, but it's still worth negotiating a narrower scope directly if the draft language concerns you, rather than relying solely on an assumption about how a court might eventually interpret it.</p>`,
  },
  {
    heading: 'Governing Law and Jurisdiction',
    body: `
      <p>This clause states which country's laws govern the contract and where any dispute would legally be heard, and it's easy to skip past as boilerplate even though it has real consequences. A contract governed by a law very different from your own country's labor protections may offer you less protection than you'd assume by default. If a dispute would need to be resolved in a court in another country entirely, the practical cost and difficulty of pursuing or defending a claim there is worth considering honestly before you sign, not after a dispute has already started.</p>`,
  },
  {
    heading: 'Dispute Resolution and Arbitration Clauses',
    body: `
      <p>Some contracts require disputes to go through private arbitration rather than a public court, which can be faster and more private but sometimes limits your ability to join a class action or appeal a decision as fully as court litigation would allow. Check whether arbitration is mandatory or optional, who bears the cost of the arbitration process itself, and where it would physically take place, since cross-border arbitration can involve real travel cost and logistical burden that's worth weighing before accepting a clause that requires it.</p>`,
  },
  {
    heading: 'Class Action Waivers',
    body: `
      <p>Some arbitration clauses include a waiver of your right to join a class action, meaning any dispute must be pursued individually rather than alongside other affected employees. The enforceability of this kind of waiver varies by jurisdiction, and in some places it's been limited or struck down entirely for employment contracts specifically. If a contract includes this kind of waiver, it's worth understanding its practical effect: pursuing an individual claim alone is often more costly and higher-stakes for a single worker than joining a collective action would be.</p>`,
  },
  {
    heading: 'Equity Documentation: Separate From Your Employment Contract',
    body: `
      <p>Stock options or RSU grants are typically documented in a separate equity agreement or stock option plan, not fully spelled out in the employment contract itself, which sometimes only references the grant at a high level. Request and actually read this separate document before relying on a verbal or summarized description of your equity terms, since the full vesting schedule, treatment on termination, and treatment on an acquisition are usually detailed there specifically, not in the main contract.</p>
      <p>For cross-border grants, also check whether the equity plan accounts for your specific country's tax treatment of options or RSUs, since this varies considerably and can affect the real, after-tax value of a grant that looks identical on paper to a colleague's in a different country.</p>`,
  },
  {
    heading: 'Pension and Retirement Portability',
    body: `
      <p>Retirement contributions made in one country's system don't always transfer cleanly if you move to work in another country later. Some countries have bilateral agreements allowing certain contributions to be recognized or transferred, similar in spirit to the totalization agreements covered earlier for social security, but this is far from universal. Before assuming contributions made during a cross-border role will be accessible or portable later, it's worth checking the specific plan's rules and any relevant bilateral agreement between the countries involved.</p>`,
  },
  {
    heading: 'Anti-Discrimination Protections Vary by Country',
    body: `
      <p>Which characteristics are legally protected from workplace discrimination differs meaningfully by country, and a protection that's firmly established in one jurisdiction may not be explicitly codified in another. This matters practically for understanding what recourse you'd actually have if you experienced discrimination while working for a company based in, or operating under the law of, a country different from your own. If this is a significant concern for your specific situation, it's worth understanding which country's anti-discrimination law would actually apply to your employment relationship, which connects back to the governing-law clause covered earlier in this guide.</p>`,
  },
  {
    heading: 'Whistleblower Protections Across Borders',
    body: `
      <p>Protections for reporting illegal conduct or safety violations also vary by jurisdiction, in some places covering a broad range of disclosures with strong anti-retaliation protection, and in others offering a narrower or less robust framework. For a cross-border worker, understanding which country's whistleblower framework actually applies to your situation, again often tied to the governing-law clause and where the work is physically performed, matters more than assuming your home country's framework automatically travels with you.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Deep Dive',
    heading: 'The United States, in More Detail',
    body: `
      <p>Given how many cross-border arrangements involve a US-based hiring company, a closer look is useful. At-will employment is the default in every state except Montana, meaning either party can generally end the relationship at any time, for almost any reason, without notice, though specific exceptions exist for discrimination and certain protected activities. There's no federal statutory minimum for paid leave, severance, or notice; these are set entirely by individual employer policy unless a specific state has legislated otherwise, and several states have begun doing exactly that, particularly around sick leave.</p>
      <p>Health insurance is typically employer-sponsored rather than provided through a comprehensive national system, which makes the specifics of a health plan a genuinely significant part of comparing US-based offers. For a non-US worker being hired by a US company, usually through an employer of record or as a contractor rather than direct US employment, most of these specific US norms won't actually apply to you directly, since your own country's law typically governs your actual working relationship, but understanding them helps explain why a US company's instincts about contract terms, often minimal and flexible by design, can look different from what's standard elsewhere.</p>`,
  },
  {
    heading: 'The European Union, in More Detail',
    body: `
      <p>Unlike the United States, the European Union sets several binding minimum standards that apply across all member states, even though each country also layers its own additional protections on top. The Working Time Directive sets maximum average weekly working hours and minimum rest periods. The Written Statement of Employment Particulars Directive requires employers to provide clear written information about key terms early in the employment relationship. Minimum paid annual leave of four weeks is guaranteed EU-wide, though many member states exceed this floor considerably, as reflected in the country table earlier in this guide.</p>
      <p>For a worker based in the EU, this means there's a meaningful baseline of protection regardless of which specific member state you're in, with individual countries like Germany, France, and the Netherlands typically providing stronger protections than that shared floor rather than weaker ones.</p>`,
  },
  {
    heading: 'Comparing Two Cross-Border Offers',
    body: `
      <table class="plan">
        <tr><th>Factor</th><th>Offer A</th><th>Offer B</th></tr>
        <tr><td>Employment structure: direct, EOR, or contractor</td><td></td><td></td></tr>
        <tr><td>Governing law and dispute resolution location</td><td></td><td></td></tr>
        <tr><td>Notice period, both directions</td><td></td><td></td></tr>
        <tr><td>Non-compete scope and duration</td><td></td><td></td></tr>
        <tr><td>Statutory leave and benefits baseline in that country</td><td></td><td></td></tr>
        <tr><td>Visa or work-authorization support, if needed</td><td></td><td></td></tr>
        <tr><td>Equipment, data, and offboarding terms</td><td></td><td></td></tr>
      </table>`,
  },
  {
    heading: 'Severance and Garden Leave',
    body: `
      <p>Severance entitlement on termination without cause varies by country, from no statutory requirement at all in some places to a formula based on tenure in others. Check whether severance is a statutory minimum, a contractual promise above that minimum, or left undefined entirely, and whether it's affected by the reason for termination. As noted earlier, garden leave, being paid while not working during a notice period, is distinct from severance and worth understanding separately, since the two are sometimes confused.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Five',
    heading: 'Tax Residency Basics',
    body: `
      <p>Tax residency, not citizenship or nationality, generally determines where you owe income tax, and the rules for establishing or losing residency vary by country, often based on the number of days physically present there in a given year. For cross-border and remote workers who move between countries, it's possible to become tax resident in more than one place simultaneously under different countries' rules, which is exactly the situation double taxation treaties, covered next, are designed to address.</p>`,
  },
  {
    heading: 'Double Taxation Treaties, at a High Level',
    body: `
      <p>Many pairs of countries have a bilateral tax treaty designed to prevent the same income from being taxed twice. These treaties typically assign primary taxing rights to one country based on specific tests, such as where your permanent home is or where your economic ties are strongest, and often allow a credit or exemption in the other country for tax already paid. The specific rules are genuinely complex and vary by exact country pairing, which is precisely why this is an area where a short consultation with a cross-border tax professional tends to be worth the cost, rather than attempting to interpret a treaty's text without that expertise.</p>`,
  },
  {
    heading: 'Permanent Establishment Risk',
    body: `
      <p>This is a business-side risk worth understanding even as an individual worker, because it shapes why some companies are cautious about hiring in certain countries at all. A company can inadvertently create a taxable "permanent establishment" in a country simply by having an employee working there in certain capacities, which can trigger corporate tax obligations for the company in that country. This is part of why some companies insist on an employer-of-record arrangement rather than direct employment for certain countries. Understanding this helps explain a company's structure choice, even though the direct compliance burden falls on the company rather than on you.</p>`,
  },
  {
    heading: 'Social Security Contributions Across Borders',
    body: `
      <p>Social security contributions, funding things like public pensions and unemployment insurance, are typically owed in the country where you're actually working, which can create a mismatch for cross-border arrangements. Some countries have bilateral social security agreements, sometimes called totalization agreements, that prevent double contributions and allow credits to transfer between systems. Ask your employer or employer-of-record provider directly which country's system you're contributing to, since this affects both your current take-home pay and, in some cases, your eventual pension eligibility in either country.</p>`,
  },
  {
    heading: 'Working From a Different Country Than Your Contract States',
    body: `
      <p>Working remotely from a country other than the one named in your contract, whether temporarily while traveling or as an undisclosed longer-term arrangement, creates real compliance exposure for both you and your employer, even when neither side intends anything improper. Physical presence in a country can trigger tax residency, social security obligations, or the permanent establishment risk described earlier, regardless of what the contract states on paper. If you're considering working from a different country for an extended period, even informally, disclosing this to your employer and confirming it's actually permitted is safer than assuming it's a private matter with no consequence, since the consequences, if any arise, tend to land on you directly as the worker.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Six',
    heading: 'Visas and Work Authorization: An Overview',
    body: `
      <p>Work authorization requirements vary by country and by your specific nationality, but a few categories recur often enough to be worth understanding generally. Employer-sponsored work visas tie your authorization directly to a specific employer, meaning changing jobs often requires a new visa process. Freelancer or self-employment visas, offered by a growing number of countries, allow independent work without a single sponsoring employer, under specific income or qualification requirements. Digital nomad visas, covered next, are a newer and distinct category built specifically around remote work for a foreign employer.</p>`,
  },
  {
    heading: 'Digital Nomad Visas: What They Actually Allow',
    body: `
      <p>Digital nomad visas, now offered by dozens of countries, generally permit you to live in that country while working remotely for an employer or clients based elsewhere, without granting the right to work for a local employer in that country. Requirements typically include a minimum income threshold, proof of remote employment or self-employment, and health insurance coverage. Crucially, a digital nomad visa addresses your right to reside in the country, not necessarily your tax or social security obligations there, which may still be triggered separately depending on how long you stay, as covered in the tax residency section earlier in this guide.</p>`,
  },
  {
    heading: 'What to Ask an Employer About Visa Sponsorship',
    body: `
      <p>If you need sponsorship, ask specifically whether the company has sponsored visas before for your target country, since first-time sponsorship can be slower and less certain than a company with established experience. Ask who bears the cost, since this varies by company and sometimes by country's legal requirements, and ask about the realistic timeline, since visa processing can take anywhere from a few weeks to the better part of a year depending on the country and category.</p>`,
  },
  {
    heading: 'Family and Dependent Considerations',
    body: `
      <p>If you have a partner or dependents who'd be relocating with you, ask directly whether the visa category under discussion allows dependents, and whether a dependent visa grants them the right to work locally themselves, since this varies significantly and affects household financial planning considerably. Some visa categories that work well for the primary visa holder offer much more limited rights to accompanying family members, which is worth understanding before, not after, a move.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Seven',
    heading: 'Data Protection Basics for Remote Workers',
    body: `
      <p>If your role involves handling personal data belonging to people in the European Union, the General Data Protection Regulation, commonly known as GDPR, likely applies to how that data must be handled, regardless of where you personally are physically located. This includes obligations around data minimization, secure storage, and specific rights that the people whose data it is can exercise. Many other countries have adopted similar frameworks with their own specific requirements, so "handling personal data under a privacy regulation" is increasingly a global norm rather than an EU-specific concern.</p>`,
  },
  {
    heading: 'Handling Confidential Company Data Remotely',
    body: `
      <p>Working remotely, often from a home network and personal or company-issued devices, introduces security considerations that an office environment typically handles centrally through IT infrastructure. Understand your company's specific policy on storing confidential data locally versus only in approved cloud systems, and on using personal devices for work at all. A clause requiring specific security practices, such as encrypted storage or mandatory multi-factor authentication, is a reasonable and increasingly standard requirement, not an unusual imposition.</p>`,
  },
  {
    heading: 'Bring Your Own Device Clauses',
    body: `
      <p>Some remote roles allow or require using your own personal device for work rather than providing company hardware. If your contract includes a "bring your own device" clause, check what access the company retains to that device, whether that's remote wipe capability in case of loss, mandatory security software, or monitoring software, since these terms directly affect a device you also use for personal purposes. If the terms feel broader than you're comfortable with, asking for company-provided hardware instead is a reasonable request, particularly for roles handling sensitive data.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Eight',
    heading: 'Country-by-Country Overview',
    body: `
      <p>A broad reference table, not a complete legal summary, covering common norms worth knowing before working in or with each of these countries. Always verify current specifics with a local professional before relying on any of this for an actual decision.</p>
      <table class="plan">
        <tr><th>Country</th><th>Termination norm</th><th>Notable feature</th></tr>
        <tr><td>United States</td><td>At-will by default in most states; employers and employees can generally end employment without notice.</td><td>No federal statutory notice or severance requirement in most cases; healthcare is typically employer-sponsored.</td></tr>
        <tr><td>United Kingdom</td><td>Statutory minimum notice scaling with tenure; unfair dismissal protections after a minimum service period.</td><td>Right to request flexible working is a statutory right after a qualifying period.</td></tr>
        <tr><td>Germany</td><td>Notice periods scale with tenure and are often longer than in the UK or US; termination protection is strong after a probation period.</td><td>Works councils have real influence over workplace policy at many employers.</td></tr>
        <tr><td>France</td><td>Strong termination protections; a defined, often lengthy legal process is required for dismissal.</td><td>A thirteenth-month salary payment is common practice, though not universally mandated.</td></tr>
        <tr><td>Netherlands</td><td>Notice periods and a statutory transition payment apply in many termination scenarios.</td><td>Part-time work is extremely common and carries strong statutory protections.</td></tr>
        <tr><td>Canada</td><td>Reasonable notice or pay in lieu is generally required, with specifics varying by province.</td><td>Provincial labor law varies meaningfully; always check the specific province.</td></tr>
        <tr><td>India</td><td>Notice periods are common and often lengthy by international standards, sometimes up to ninety days.</td><td>Gratuity payments are a statutory benefit after a minimum tenure threshold.</td></tr>
        <tr><td>Brazil</td><td>Strong statutory severance protections, including a mandatory severance fund contribution by employers.</td><td>A thirteenth salary payment is a long-standing statutory requirement, not just custom.</td></tr>
        <tr><td>Australia</td><td>Minimum notice periods apply, scaling with tenure, alongside unfair dismissal protections.</td><td>Superannuation, a mandatory retirement contribution, applies to most employment.</td></tr>
        <tr><td>United Arab Emirates</td><td>Notice periods are typically contractual rather than lengthy statutory defaults.</td><td>End-of-service gratuity is a statutory benefit tied to tenure for most employees.</td></tr>
        <tr><td>Japan</td><td>Termination is heavily restricted in practice; dismissal without strong justification is difficult.</td><td>Lifetime-employment norms still influence practice at many traditional employers, though this is shifting.</td></tr>
        <tr><td>Singapore</td><td>Notice periods are generally contractual, with statutory minimums for certain categories of employee.</td><td>A relatively employer-friendly termination environment compared to much of the region.</td></tr>
      </table>`,
  },
  {
    newPage: true,
    eyebrow: 'A Closer Look',
    heading: 'Non-Monetary Contract Terms Worth the Same Scrutiny as Pay',
    body: `
      <p>This guide has covered compensation-adjacent terms throughout, but it's worth stating plainly once: terms with no dollar figure attached, title, reporting line, notice period, non-compete scope, and governing law chief among them, routinely matter more to how a role actually plays out than small differences in salary do. A candidate who negotiates hard on base salary but signs an unreasonable eighteen-month, unlimited-geography non-compete without a second look has, in practical terms, often made the worse trade.</p>
      <p>Applying the same research-and-ask discipline described in this platform's salary negotiation guide to these non-monetary terms, rather than reserving that discipline for the number alone, is the single habit most likely to matter across your whole career, not just this one contract.</p>`,
  },
  {
    heading: 'Independent Contractor Compliance by Region',
    body: `
      <p>Beyond the misclassification test covered earlier, a few regional patterns in contractor compliance are worth knowing generally. The European Union has moved toward stronger platform-worker protections in recent years, particularly for gig-economy-style arrangements, which has pushed some companies to reclassify long-term "contractors" as employees preemptively. Many Latin American countries apply a fairly strict functional test for misclassification, weighted heavily toward how much control is actually exercised over the work. The United States varies considerably by state, with some states, California notably, applying a stricter test than federal law alone would require.</p>
      <p>None of this changes the core guidance from earlier in this guide: the actual working pattern, not the label in the contract, is what most jurisdictions' tests focus on, and that pattern is worth reviewing honestly regardless of which specific region you're in.</p>`,
  },
  {
    heading: 'More Countries, Briefly',
    body: `
      <table class="plan">
        <tr><th>Country</th><th>Termination norm</th><th>Notable feature</th></tr>
        <tr><td>Spain</td><td>Strong termination protections; a defined severance formula applies in most dismissal scenarios.</td><td>A thirteenth and fourteenth salary payment, split across the year, is common practice.</td></tr>
        <tr><td>Italy</td><td>Notice periods and severance, called TFR, accrue throughout employment regardless of how it ends.</td><td>TFR is paid out as a lump sum at the end of employment, functioning as a form of deferred compensation.</td></tr>
        <tr><td>Mexico</td><td>Significant statutory severance applies to termination without cause, calculated by a specific legal formula.</td><td>A mandatory annual bonus, called Aguinaldo, is a statutory requirement, not a discretionary practice.</td></tr>
        <tr><td>South Africa</td><td>A defined, often lengthy fair-process requirement applies before dismissal, beyond simply providing notice.</td><td>Statutory minimum leave and family responsibility leave are both legally mandated.</td></tr>
        <tr><td>Philippines</td><td>Just-cause requirements for termination are strict; procedural due process is closely scrutinized.</td><td>A thirteenth-month pay is a long-standing statutory requirement.</td></tr>
        <tr><td>Poland</td><td>Notice periods scale with tenure and are generally longer than many non-EU comparisons.</td><td>EU working-time directives, including rest-period minimums, apply as a baseline.</td></tr>
        <tr><td>Ireland</td><td>Statutory minimum notice applies, scaling with tenure, alongside unfair dismissal protections after a qualifying period.</td><td>Often used as a European entity base by US companies due to its common-law legal tradition.</td></tr>
        <tr><td>New Zealand</td><td>Good-faith obligations apply throughout employment, including the termination process itself.</td><td>A statutory minimum wage and holiday entitlement apply broadly.</td></tr>
      </table>`,
  },
  {
    heading: 'Statutory Leave and Benefits Baselines',
    body: `
      <p>Beyond termination norms, statutory minimums for leave and core benefits vary just as widely and are worth understanding, since a benefits package that looks identical on paper can represent very different real value once compared against each country's actual legal floor.</p>
      <table class="plan">
        <tr><th>Region</th><th>Typical statutory baseline</th></tr>
        <tr><td>Most of the European Union</td><td>A statutory minimum of around twenty working days of paid annual leave is common, often with additional public holidays on top.</td></tr>
        <tr><td>United States</td><td>No federal statutory minimum paid leave exists; it varies entirely by employer policy and, for a few benefits, by state.</td></tr>
        <tr><td>United Kingdom</td><td>A statutory minimum of 5.6 weeks of paid leave, inclusive of most public holidays.</td></tr>
        <tr><td>Most of Latin America</td><td>Statutory minimums of around twenty to thirty days are common, often alongside a mandatory thirteenth-month payment.</td></tr>
        <tr><td>Much of Asia-Pacific</td><td>Statutory minimums vary widely by country, from quite limited to generous, making individual-country verification especially important here.</td></tr>
      </table>`,
  },
  {
    heading: 'Parental Leave Across Borders',
    body: `
      <p>Parental leave policy is one of the areas with the widest variation globally, both in duration and in how it's split between primary and secondary caregivers. Some countries mandate lengthy paid leave funded largely through social security contributions, while others leave it almost entirely to individual employer policy with minimal statutory floor. For a cross-border hire, clarify directly whether parental leave entitlement follows the laws of the country you're physically based in, the country of the employer of record, or a company-wide policy that applies regardless of location, since these can produce meaningfully different outcomes.</p>`,
  },
  {
    heading: 'Minimum Wage and Equal Pay Considerations',
    body: `
      <p>Minimum wage requirements apply based on where the work is actually performed in most jurisdictions, not where the company is headquartered, which is worth checking for a cross-border role paying a flat global rate that might sit below a specific country's statutory minimum once converted and compared. Many jurisdictions also have equal pay requirements prohibiting pay discrimination based on protected characteristics, and some now require proactive pay-gap reporting at the company level, which is part of why pay transparency and posted salary ranges, covered in this platform's salary negotiation guide, have become more common in recent years.</p>`,
  },
  {
    heading: 'Collective Bargaining and Works Councils',
    body: `
      <p>In several countries, particularly in parts of Europe, works councils or union representation have formal input into workplace policy, sometimes including matters like working hours, restructuring, and even individual terminations in certain cases. If you're joining a company with an active works council or collective bargaining agreement in your country, some individual contract terms may be shaped or limited by that broader agreement rather than negotiated purely one-on-one, which is worth understanding rather than treating your contract as the complete picture.</p>`,
  },
  {
    heading: 'Working-Time Rules and the Right to Disconnect',
    body: `
      <p>Beyond the overtime considerations covered earlier, a growing number of jurisdictions, particularly across the European Union, have introduced a formal "right to disconnect," limiting an employer's ability to expect availability outside defined working hours, including after-hours messages and calls. This matters specifically for cross-border remote roles where your working hours may overlap awkwardly with a head office in a very different time zone. If your role routinely involves contact well outside your contracted hours, it's worth checking whether that's compliant with your specific country's rules, and raising it directly if it isn't.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Nine',
    heading: 'Health, Safety, and Home Office Obligations',
    body: `
      <p>Some jurisdictions place a surprising degree of formal responsibility on employers for the safety of a home workspace, even though the employer has no direct physical presence there. This can include requirements for a basic risk assessment of your home setup, provision of ergonomic equipment, or documented guidance on safe workstation setup. If your contract or employee handbook is silent on this, it's worth asking directly what, if any, home-office safety obligations apply in your specific location, since requirements here are genuinely more substantial in some countries than workers often assume.</p>`,
  },
  {
    heading: 'Mental Health and Burnout: Employer Obligations',
    body: `
      <p>A smaller but growing number of jurisdictions have begun formally recognizing employer obligations around psychosocial risk and burnout prevention, not just physical workplace safety. This can include requirements around manageable workload, clear expectations, and access to mental health support resources. For a remote worker, where typical in-person signals of struggling, like a manager noticing someone seems overwhelmed, are easy to miss, a contract or policy that at least names mental health support explicitly, rather than leaving it entirely unaddressed, is a reasonable thing to look for and to ask about directly if it's not mentioned.</p>`,
  },
  {
    heading: 'Equipment Ownership and Return Obligations',
    body: `
      <p>Contracts covering company-provided equipment, laptops, monitors, and similar hardware, often include a clause requiring return of that equipment on termination, sometimes with a deadline and a specified shipping or drop-off process. For cross-border roles, international equipment shipping and customs can add real delay and occasionally real cost, so it's worth understanding this process before you need it rather than scrambling to figure out international shipping logistics during an already stressful offboarding period.</p>`,
  },
  {
    heading: 'Background Checks and Right-to-Work Verification',
    body: `
      <p>Most countries require an employer to verify your legal right to work there before or shortly after you start, which for cross-border hires often means verifying visa or work-authorization status directly, not simply taking your word for it. Background checks, where used, vary in scope and in what's legally permissible to check by jurisdiction. If a background check or right-to-work verification process is taking unusually long, it's reasonable to ask directly what specifically is outstanding, since delays here sometimes reflect a straightforward administrative bottleneck rather than any concern about you specifically.</p>`,
  },
  {
    heading: 'Banking and Payment Rails for Cross-Border Pay',
    body: `
      <p>How you actually receive pay across a border is a practical logistics question distinct from the legal structure of your employment. Traditional international wire transfers can carry meaningful fees and unfavorable exchange rates compared to specialized cross-border payment services built for exactly this purpose. Ask your employer or employer-of-record provider which payment method they use, and if given a choice, compare the fees and exchange-rate margin of each option directly, since this can add up to a real, recurring cost difference over a full year of paychecks.</p>`,
  },
  {
    heading: 'Currency Controls and Moving Money Internationally',
    body: `
      <p>A smaller number of countries maintain currency controls that restrict how much money can be moved out of the country, or that require specific documentation to do so, which matters if you're earning income in one country but need to move funds to another, for savings, family support, or simply returning to your home country eventually. If you're relocating to or working from a country with known currency control restrictions, researching the specific limits and documentation requirements in advance avoids an unpleasant surprise later when you actually try to move funds.</p>`,
  },
  {
    heading: 'Insurance Considerations Beyond Health Coverage',
    body: `
      <p>Health coverage is usually the most visible insurance consideration, but a few others are worth checking for cross-border roles specifically. Professional liability or indemnity insurance matters more for certain roles and especially for independent contractors, who typically don't have an employer's coverage to fall back on. Travel insurance matters if your role involves cross-border travel, and it's worth confirming whether the company provides this or expects you to arrange your own. Life and disability insurance baselines also vary significantly by country's social system, and what feels like a standard benefit in one country may be a meaningful, separately-needed purchase in another.</p>`,
  },
  {
    heading: 'Ending a Contract Amicably: An Exit Checklist',
    body: `
      <ul>
        <li>Confirm your last working day and final pay date in writing, including any accrued but unused leave payout.</li>
        <li>Confirm the process and deadline for returning any company equipment.</li>
        <li>Clarify whether any post-employment obligations, non-compete, non-solicitation, or confidentiality, survive after you leave, and for how long.</li>
        <li>Request a reference or recommendation while the relationship is still fresh and positive, rather than months later.</li>
        <li>Confirm how and when any final benefits, such as health coverage, actually end.</li>
        <li>Save copies of your contract and any amendments to it for your own records before losing access to company systems.</li>
      </ul>`,
  },
  {
    heading: 'A Note on AI and Automated Contract Review Tools',
    body: `
      <p>AI-based contract review tools, including features built into this platform, can be genuinely useful for a first pass: flagging unusual clauses, summarizing dense legal language, or comparing a contract against common norms like the ones covered in this guide. Treat this kind of output the way you'd treat a knowledgeable friend's first read, a useful starting point for what to look at more closely, not a substitute for the professional review recommended throughout this guide for anything genuinely high-stakes.</p>`,
  },
  {
    heading: 'Common Contract Myths, Debunked',
    body: `
      <p>"If I sign it, I'm stuck with it no matter what" overstates how contracts actually work; many clauses that conflict with local mandatory law are simply unenforceable regardless of what was signed, though this varies by jurisdiction and clause type, which is exactly why professional review matters. "Verbal promises don't count" is also not universally true; in some jurisdictions and circumstances, a clear verbal commitment can carry real weight, though it's always harder to prove than something in writing, which is why getting things in writing remains the safer default regardless of the legal technicalities.</p>
      <p>"Non-competes are always enforceable" and its opposite, "non-competes are never enforceable," are both wrong in different ways, since enforceability depends heavily on the specific jurisdiction, the clause's actual scope, and sometimes on whether compensation was offered in exchange for the restriction. The honest, consistent answer throughout this guide is the same: read the specific clause, in the specific jurisdiction, and verify anything that genuinely matters with a professional rather than relying on a general rule of thumb.</p>`,
  },
  {
    heading: 'A Second Worked Example: A Contractor Dispute',
    body: `
      <p>A freelance designer in Argentina is engaged on an ongoing basis by a company in Canada, with no written scope beyond a general monthly retainer. After eight months of exclusive, full-time-equivalent work with no other clients, the company ends the engagement with no notice, citing the contractor relationship as fully at-will with no termination terms at all.</p>
      <p>Reviewing the situation against this guide's misclassification section, the actual working pattern, exclusivity, ongoing nature, and company-set schedule, looks far more like employment than independent contracting under several jurisdictions' legal tests, regardless of the contractor label used. The designer raises this directly with the company, referencing the specific pattern of exclusivity and schedule control, and ultimately negotiates a notice-period payment as a resolution, even though the original contract was silent on notice entirely, because the underlying legal characterization of the relationship, not just its label, is what actually mattered once examined closely.</p>`,
  },
  {
    heading: 'Frequently Asked Questions',
    body: `
      <div class="qa"><p class="q">Can a company simply choose any country's law to govern my contract?</p><p class="a">Not entirely freely; many jurisdictions apply mandatory local protections regardless of a chosen governing law, particularly for the country where you actually work. The specifics depend heavily on the jurisdictions involved.</p></div>
      <div class="qa"><p class="q">Is an unsigned offer letter binding?</p><p class="a">Sometimes, depending on jurisdiction and the specific language used, which is part of why "I'll send the final paperwork shortly" shouldn't be treated as equivalent to an actual signed agreement.</p></div>
      <div class="qa"><p class="q">What if my contract is only available in a language I don't fully understand?</p><p class="a">Request a translation, or at minimum a translated summary of key terms, before signing. This is a reasonable request in any cross-border hiring process.</p></div>
      <div class="qa"><p class="q">Can I be paid in cryptocurrency instead of regular currency?</p><p class="a">Some companies and contractors do arrange this, but tax treatment of cryptocurrency income varies significantly by country and is an area worth specific professional guidance before relying on it as your primary pay structure.</p></div>
      <div class="qa"><p class="q">What happens to my benefits during an extended sabbatical?</p><p class="a">This should be documented specifically in a sabbatical agreement separate from your main contract; don't rely on a verbal understanding for something with this much potential impact on your benefits continuity.</p></div>
      <div class="qa"><p class="q">Does a contract need to be in writing to be valid?</p><p class="a">In many jurisdictions a verbal agreement can be legally binding, but it's far harder to prove and enforce than a written one, which is why a written contract remains the standard and safer practice everywhere covered in this guide.</p></div>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Ten',
    heading: 'Red Flag Clauses to Watch For',
    body: `
      <p>A short list of clauses worth extra scrutiny, not because they're always problematic, but because they're where disputes most often originate. An unusually broad IP assignment clause covering work unrelated to your job. A non-compete with no geographic or time limit stated at all. A termination-for-cause definition broad enough to cover ordinary performance issues. A unilateral right for the company to change contract terms at any time without your agreement. And a governing-law clause pointing to a jurisdiction with dramatically weaker worker protections than your own country, with no clear business reason for that specific choice.</p>`,
  },
  {
    heading: 'Negotiating Notice Period and Non-Compete Terms',
    body: `
      <p>Both of these terms are genuinely negotiable far more often than candidates assume, particularly for more junior roles where a long notice period or broad non-compete is less standard practice. If a notice period feels unusually long relative to your seniority, it's reasonable to ask directly whether it's negotiable. For a non-compete, proposing a narrower geographic scope or a shorter duration, rather than asking to remove it entirely, is often a more realistic ask that a company is more likely to agree to.</p>`,
  },
  {
    heading: 'Handling a Dispute, Step by Step',
    body: `
      <p>If a disagreement arises during employment, a measured sequence tends to produce better outcomes than escalating immediately. Start with a direct, written conversation with your manager or the relevant HR contact, stating the issue factually and what resolution you're looking for. If that doesn't resolve it, many companies and employers of record have a formal internal grievance process, which is worth using deliberately rather than skipping straight to external action. Document each step in writing as you go, since a clear written record is valuable if the dispute eventually does require external resolution.</p>
      <p>If internal routes genuinely don't resolve the issue, the next step depends on what your contract specifies: mediation, arbitration, or court, covered in more detail next, and at this stage a brief consultation with an employment lawyer in the relevant jurisdiction, even if you don't proceed further, is a reasonable and often inexpensive way to understand your realistic options before committing to a specific path.</p>`,
  },
  {
    heading: 'Mediation, Arbitration, and Litigation: Choosing a Path',
    body: `
      <p>These three paths differ in cost, speed, privacy, and formality. Mediation is typically the fastest and least adversarial, involving a neutral third party helping both sides reach a voluntary agreement, but it only works if both sides genuinely want to resolve things. Arbitration, covered earlier regarding mandatory clauses, is more formal and produces a binding decision, generally faster and more private than court but with less room for appeal. Litigation in court is the most formal and public path, generally slower and more expensive, but offers the fullest set of procedural protections and appeal rights.</p>
      <p>Which path is actually available to you is often determined by your contract's dispute resolution clause rather than your own preference, which is exactly why reading that clause carefully before signing, as covered earlier in this guide, matters more than it might seem at the time.</p>`,
  },
  {
    heading: 'Cross-Border Enforcement of a Judgment',
    body: `
      <p>Winning a legal judgment or arbitration award is sometimes only half the practical problem in a cross-border dispute; actually enforcing it against a company based in a different country can be genuinely difficult depending on the two countries' legal relationship. Some countries have treaties or reciprocal arrangements that streamline recognizing and enforcing foreign judgments, while others offer no straightforward mechanism at all, meaning a technically successful case can still be costly or impractical to actually collect on. This practical reality is worth weighing honestly before investing significant resources into a cross-border legal dispute, and it's a specific, worthwhile question to raise with a lawyer early in that step-by-step process described above.</p>`,
  },
  {
    heading: 'Union Membership as a Remote Worker',
    body: `
      <p>The right to join or form a union generally follows the law of the country where you're actually working, not the headquarters country of your employer, though the practical reality of organizing as a geographically dispersed, often isolated remote workforce is genuinely different from a traditional single-site workplace. If union membership or workplace organizing matters to you, researching whether unions relevant to your industry have any established presence among remote or cross-border workers specifically is a reasonable starting point, since this landscape is still actively evolving in many industries.</p>`,
  },
  {
    heading: 'Contract Translation Accuracy',
    body: `
      <p>If you're given a contract translated from its original language, be aware that nuance can be lost or subtly shifted in translation, particularly for legal terms that don't map precisely between languages. Where the stakes are meaningful, requesting the original-language version alongside the translation, and having a bilingual professional, ideally one with legal background, review both for consistency, is a reasonable precaution rather than an excessive one.</p>`,
  },
  {
    heading: 'Even More Countries',
    body: `
      <table class="plan">
        <tr><th>Country</th><th>Termination norm</th><th>Notable feature</th></tr>
        <tr><td>Austria</td><td>Notice periods scale with tenure and role level, with specific statutory minimums.</td><td>A strong social partnership tradition shapes many workplace norms beyond individual contracts.</td></tr>
        <tr><td>Belgium</td><td>Notice periods, calculated by a specific statutory formula tied to tenure, tend to be longer than many comparisons.</td><td>Index-linked wage adjustments tied to inflation are a long-standing feature of the system.</td></tr>
        <tr><td>Norway</td><td>Strong termination protections; dismissal requires objectively justifiable grounds.</td><td>Extensive statutory parental leave is shared flexibly between parents.</td></tr>
        <tr><td>Denmark</td><td>The "flexicurity" model combines relatively flexible termination rules with strong social safety-net support.</td><td>Unemployment insurance is often administered through union-affiliated funds rather than solely by the state.</td></tr>
        <tr><td>South Korea</td><td>Dismissal requires justifiable cause under labor law, with meaningful procedural requirements.</td><td>A statutory severance payment applies broadly based on tenure.</td></tr>
        <tr><td>Thailand</td><td>Statutory severance scales with tenure for termination without cause.</td><td>Social security contributions are mandatory and shared between employer and employee.</td></tr>
        <tr><td>Colombia</td><td>Statutory severance, with a specific formula, applies to unjustified termination.</td><td>A mandatory severance-fund contribution, paid annually, is a distinctive feature of the system.</td></tr>
        <tr><td>Chile</td><td>Notice periods and a statutory severance formula apply to termination without cause.</td><td>A defined-contribution pension system is a hallmark feature, influential in shaping other countries' reforms.</td></tr>
      </table>`,
  },
  {
    heading: 'When to Involve a Lawyer',
    body: `
      <p>Not every contract needs a lawyer's review, but a few situations clearly warrant it: any role involving significant equity, any contract governed by a jurisdiction unfamiliar to you, any unusually broad non-compete or IP clause, and any senior role where the overall stakes are high enough that a modest review cost is clearly justified relative to what's at risk. For cross-border contracts specifically, look for a lawyer with actual experience in international or cross-border employment specifically, not just general contract law, since the issues covered in this guide require that specific familiarity.</p>
      <p>Affordable options exist beyond a full traditional law firm engagement: many jurisdictions have lawyer referral services with fixed-fee initial consultations, and some employment-law specialists offer a flat rate specifically for a single contract review rather than ongoing representation.</p>`,
  },
  {
    heading: 'Entire Agreement, Amendment, and Assignment Clauses',
    body: `
      <p>A few standard boilerplate clauses are easy to skip past but worth a quick read. An "entire agreement" clause states that the written contract represents the full agreement, meaning any verbal promises made during negotiation that aren't reflected in the final text generally won't be legally binding, which is exactly why getting everything discussed into the written document matters, as emphasized throughout this guide. An amendment clause states how the contract can be changed later, typically requiring written agreement from both sides rather than a unilateral change; a clause allowing the company to amend terms unilaterally at any time is worth questioning directly.</p>
      <p>An assignment clause addresses whether the company can transfer your contract to a different legal entity, which commonly comes up during an acquisition or corporate restructuring. Most employment protections are designed to survive this kind of transfer in many jurisdictions, but it's worth understanding whether your specific contract has any unusual language here.</p>`,
  },
  {
    heading: 'Force Majeure and Indemnification Clauses',
    body: `
      <p>A force majeure clause addresses what happens to the parties' obligations during extraordinary, unforeseeable events, pandemics, natural disasters, and similar disruptions, and has become more commonly discussed since the broad disruptions of the early 2020s. Check whether this clause addresses continued pay and job security during such an event, or only whether either party can be excused from normal performance obligations.</p>
      <p>An indemnification clause can require you to cover the company's losses in certain circumstances, which is a meaningful obligation worth understanding fully rather than treating as routine boilerplate. These clauses are increasingly common in contractor agreements specifically, and an unusually broad indemnification obligation, one not clearly limited to your own negligence or breach, is worth raising directly or having reviewed professionally.</p>`,
  },
  {
    heading: 'Offer Letter, Employment Contract, and Handbook: What\'s the Difference',
    body: `
      <p>These three documents serve different purposes and carry different legal weight, which is worth understanding clearly. An offer letter typically summarizes key terms, title, compensation, start date, and is often less detailed and sometimes less binding than the full employment contract that follows it. The employment contract itself is generally the primary legally binding document covering the detailed terms this guide has walked through. An employee handbook usually covers company policies and procedures more broadly, and while it can carry legal weight in some jurisdictions, it's typically more easily updated unilaterally by the company than the signed contract itself. If a term that matters to you only appears in the handbook and not in your signed contract, it's worth asking whether that specific term can be added to the contract directly instead.</p>`,
  },
  {
    heading: 'Freelance Platform Terms Versus Direct Contracts',
    body: `
      <p>Contractors working through a freelance platform, rather than a direct contract with a client, are also bound by that platform's own terms of service, which can affect payment timing, dispute resolution, and even who's considered the contracting party in a disagreement. Read the platform's dispute-resolution process specifically, since it sometimes differs meaningfully from what you'd expect under your own country's standard contract law, and the platform itself, not the end client, may be the party you'd actually need to resolve a payment dispute with.</p>`,
  },
  {
    heading: 'Subcontracting and Using Your Own Contractors',
    body: `
      <p>If your contract allows or requires you to engage your own subcontractors for part of the work, check whether the main contract restricts this, requires client approval first, or holds you responsible for your subcontractors' compliance, confidentiality, and IP assignment obligations as if they were your own. This matters increasingly for agency-style independent contractors working across borders, where a clean chain of responsibility between you, your subcontractors, and the end client avoids a dispute later about who's actually liable for a specific failure.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Eleven',
    heading: 'Verifying a Company\'s Legal Entity Before You Sign',
    body: `
      <p>For a lesser-known company, especially one operating through an employer of record or offering a fully remote role you found through a less established channel, a small amount of due diligence before signing is worth the time. Many countries maintain public business registries where you can verify a company's legal registration, and checking that the entity named in your contract actually exists and matches the company you believe you're dealing with is a reasonable, low-effort step.</p>
      <p>If the employer of record is a separate, named entity, the same check applies to them specifically, since their legitimacy matters just as much as the hiring company's, given that they're the entity you'd actually be contractually employed by.</p>`,
  },
  {
    heading: 'Recognizing Job Offer Scams in Cross-Border Hiring',
    body: `
      <p>Remote and cross-border hiring has unfortunately become a common vector for employment scams, and a few patterns recur often enough to be worth naming directly. A request for payment from you, for equipment, training materials, or visa processing, before any employment has actually begun is a serious red flag; legitimate employers cover these costs themselves rather than asking a new hire to pay upfront. An offer that arrives with no real interview process at all, or where communication happens exclusively through informal messaging apps rather than company email or an established recruiting platform, is also worth real skepticism.</p>
      <p>A request for sensitive personal documents, banking details, or identity documents before any contract has been signed, especially early in first contact, is another common pattern worth treating cautiously. If something about an offer feels off, verifying the company's legal entity as described above, and searching for the specific offer pattern online, often surfaces whether others have reported something similar.</p>`,
  },
  {
    heading: 'What a Legitimate Employer of Record Looks Like',
    body: `
      <ul>
        <li>A clear, findable legal registration in the country where they claim to operate.</li>
        <li>A professional, specific contract naming the actual entity, not just a generic template with blanks left unfilled.</li>
        <li>A transparent explanation, when asked, of how payroll, tax withholding, and benefits are actually administered.</li>
        <li>Established relationships with multiple hiring companies, findable through a quick search, rather than appearing to exist solely to process your specific hire.</li>
        <li>A willingness to answer direct questions about their role and responsibilities without evasiveness.</li>
      </ul>`,
  },
  {
    newPage: true,
    eyebrow: 'A Closer Look',
    heading: 'Sabbatical and Extended Leave Agreements',
    body: `
      <p>An extended leave arrangement outside standard vacation or parental leave, whether a sabbatical, an unpaid leave of absence, or an extended medical leave, deserves its own written documentation rather than a verbal understanding, given how much it can affect your benefits, your return-to-role guarantee, and your accruing tenure. A solid sabbatical agreement specifies the exact dates, whether and how pay continues, what happens to health coverage and any other ongoing benefits, whether your role or an equivalent one is guaranteed on return, and how the leave affects tenure-based calculations like notice period or statutory leave entitlement going forward.</p>
      <p>For cross-border workers specifically, also clarify whether an extended leave affects visa status, since some work-authorization categories are tied to active employment and may not account cleanly for an extended unpaid absence.</p>`,
  },
  {
    heading: 'Cryptocurrency and Alternative Payment Arrangements',
    body: `
      <p>Being paid partly or fully in cryptocurrency has become more common for some contractor and remote arrangements, particularly in crypto-native companies, but it introduces compliance considerations beyond a standard currency arrangement. Tax authorities in most countries now have specific guidance on how cryptocurrency income is treated, often as property or as ordinary income depending on the specific transaction, and the volatility of the asset itself adds a real financial risk layer beyond the usual currency-conversion considerations covered earlier in this guide. If this is part of your compensation structure, documenting the agreed value at the time of payment, not just the number of units received, is important for your own tax reporting, and this is a specific area where professional tax guidance tends to be worth the cost.</p>`,
  },
  {
    heading: 'Record-Keeping: What to Save and for How Long',
    body: `
      <p>Keep a copy of every version of your contract, including any amendments or side letters, your offer letter, and any written confirmation of terms discussed verbally. Keep pay stubs or payment confirmations, which matter both for your own tax filing and as evidence if a pay dispute ever arises. A reasonable general practice is to retain these records for at least as long as your home country's tax authority could reasonably audit a given tax year, which varies by country but is often several years, and to keep anything related to equity or long-term benefits for considerably longer, given how far in the future those might actually become relevant.</p>`,
  },
  {
    heading: 'A Worksheet: Questions to Ask HR or an Employer of Record Before Signing',
    body: `
      <ul>
        <li>Which specific legal entity is actually employing me, and in which country is it registered?</li>
        <li>How and how often is pay actually disbursed, and in which currency?</li>
        <li>What happens to my benefits and pay if I need to work temporarily from a different country?</li>
        <li>Who do I contact for payroll or contract questions once I've started?</li>
        <li>What is the actual process and timeline for any visa or work-authorization support?</li>
        <li>Is there a probation period, and what changes, if anything, once it ends?</li>
      </ul>`,
  },
  {
    heading: 'A Red-Flag Scorecard',
    body: `
      <p>Score each item honestly before signing anything. More than one or two checked boxes here is a reasonable trigger to slow down and seek a professional review before proceeding.</p>
      <table class="plan">
        <tr><th>Signal</th><th>Present?</th></tr>
        <tr><td>Asked to pay for anything before employment begins</td><td></td></tr>
        <tr><td>Communication happens only through informal messaging apps</td><td></td></tr>
        <tr><td>Company's legal entity can't be verified through any public registry</td><td></td></tr>
        <tr><td>Non-compete or IP clause has no stated limit on scope, time, or geography</td><td></td></tr>
        <tr><td>Notice period or termination terms are asymmetrical with no clear reason given</td><td></td></tr>
        <tr><td>Governing law points to a jurisdiction with no clear business connection to the role</td><td></td></tr>
      </table>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Twelve',
    heading: 'A Few More Countries',
    body: `
      <table class="plan">
        <tr><th>Country</th><th>Termination norm</th><th>Notable feature</th></tr>
        <tr><td>Sweden</td><td>Notice periods scale with tenure under the Employment Protection Act; termination requires objective grounds.</td><td>Strong collective bargaining coverage influences many workplace terms beyond the individual contract.</td></tr>
        <tr><td>Switzerland</td><td>Relatively flexible termination rules by European standards, with statutory minimum notice scaling modestly with tenure.</td><td>Social security contributions fund a distinctive three-pillar pension system.</td></tr>
        <tr><td>Vietnam</td><td>Specific statutory grounds and notice requirements apply to termination, with back pay risk for non-compliance.</td><td>A thirteenth-month bonus is widespread as customary practice, though not uniformly mandated by law.</td></tr>
        <tr><td>Indonesia</td><td>Severance calculated by a statutory formula applies to most termination without cause scenarios.</td><td>Religious holiday bonuses are a mandated annual payment ahead of major holidays.</td></tr>
        <tr><td>Nigeria</td><td>Notice periods are often shorter by international comparison, frequently set at a matter of weeks.</td><td>Pension contributions are mandated under a defined contribution scheme.</td></tr>
        <tr><td>Egypt</td><td>Termination without cause typically triggers a statutory compensation requirement tied to tenure.</td><td>Social insurance contributions are mandatory and fund a range of statutory benefits.</td></tr>
      </table>`,
  },
  {
    newPage: true,
    eyebrow: 'Worksheets',
    heading: 'Contract Review Checklist',
    body: `
      <ul>
        <li>Employment structure is clearly stated: direct, employer of record, or contractor, and you know the name of any third-party entity involved.</li>
        <li>Compensation, currency, pay frequency, and bonus criteria are specific, not vague.</li>
        <li>Notice period is stated clearly and is roughly symmetrical between you and the company.</li>
        <li>Termination-for-cause definition is specific rather than broad enough to cover ordinary performance issues.</li>
        <li>Non-compete, if present, has a clearly stated duration and geographic scope.</li>
        <li>IP assignment clause is limited to work related to your job, not all creative output at any time.</li>
        <li>Governing law and dispute resolution terms are understood, including where a dispute would actually be heard.</li>
        <li>Severance and garden leave terms, if applicable, are stated rather than left to discretion.</li>
        <li>Visa or work authorization responsibility and cost are explicit, for roles that require it.</li>
        <li>You've had the contract reviewed by a qualified professional if any of the items above raised a real concern.</li>
      </ul>`,
  },
  {
    heading: 'Compliance Self-Audit for Contractors',
    body: `
      <table class="plan">
        <tr><th>Question</th><th>Your answer</th></tr>
        <tr><td>Does your actual working arrangement look more like employment than independent contracting?</td><td></td></tr>
        <tr><td>Are you working exclusively for one client on an ongoing basis, with little control over your own schedule?</td><td></td></tr>
        <tr><td>Do you understand your own tax filing obligations as a contractor in your country?</td><td></td></tr>
        <tr><td>Is your contract's scope specific enough to prevent disputes over what's included?</td><td></td></tr>
        <tr><td>Do you have a process for invoicing and tracking payment terms clearly?</td><td></td></tr>
      </table>`,
  },
  {
    heading: 'A Worked Example: Reviewing an Offer End to End',
    body: `
      <p>A composite example, showing this guide's structure applied to an actual offer. A candidate based in Portugal receives an offer from a company headquartered in the United States, to be employed through an employer of record registered in Portugal. The contract states a notice period of thirty days for the employee and sixty days for the company, a non-compete of twelve months with no geographic limit specified, and a governing-law clause pointing to the state of Delaware.</p>
      <p>Working through this guide's checklist, the candidate notices three things worth raising: the asymmetrical notice period, the non-compete's missing geographic scope, which under Portuguese law may not be enforceable as broadly as written regardless, and the governing-law clause pointing to a US state despite the actual employment being through a Portuguese entity. The candidate raises all three in a single written message to the employer of record's HR contact, who clarifies that the notice period was a drafting error, matches the non-compete scope to the candidate's actual home country as required by local law, and confirms Portuguese law actually governs the local employment contract, with the US clause applying only to a separate confidentiality agreement with the parent company.</p>
      <p>None of this required a confrontation. It required reading carefully, asking direct and specific questions, and getting clarification in writing before signing, which is the same pattern this entire guide is built around.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Reference',
    heading: 'Glossary of Contract and Compliance Terms',
    body: `
      <table class="plan">
        <tr><th>Term</th><th>Meaning</th></tr>
        <tr><td>Employer of record</td><td>A third party that legally employs you on a company's behalf, handling local payroll, tax, and compliance.</td></tr>
        <tr><td>Permanent establishment</td><td>A tax concept where a company's presence in a country, sometimes just through an employee, can trigger local corporate tax obligations.</td></tr>
        <tr><td>Tax residency</td><td>The country where you're legally considered resident for tax purposes, which may differ from your citizenship or current physical location.</td></tr>
        <tr><td>Double taxation treaty</td><td>A bilateral agreement between two countries designed to prevent the same income from being taxed twice.</td></tr>
        <tr><td>Totalization agreement</td><td>A bilateral agreement preventing double social security contributions across two countries' systems.</td></tr>
        <tr><td>Garden leave</td><td>A period during a notice period where you're paid but asked not to actively work.</td></tr>
        <tr><td>Non-compete clause</td><td>A contractual restriction on working for a competing company for a defined period after leaving.</td></tr>
        <tr><td>Non-solicitation clause</td><td>A restriction on recruiting former colleagues or soliciting former clients after leaving, distinct from a non-compete.</td></tr>
        <tr><td>IP assignment clause</td><td>A clause stating that work created during employment belongs to the employer rather than the individual.</td></tr>
        <tr><td>Governing law clause</td><td>The section of a contract stating which country's or state's law applies to interpreting and enforcing it.</td></tr>
        <tr><td>Misclassification</td><td>Incorrectly labeling a worker as a contractor when their actual working arrangement legally functions as employment.</td></tr>
        <tr><td>Digital nomad visa</td><td>A visa category permitting residence in a country while working remotely for a foreign employer or clients.</td></tr>
        <tr><td>Works council</td><td>A body of elected employee representatives with formal input into workplace policy, common in several European countries.</td></tr>
        <tr><td>Collective bargaining agreement</td><td>A formal agreement between an employer and a union or works council that can shape terms beyond an individual contract.</td></tr>
        <tr><td>Right to disconnect</td><td>A legal protection, increasingly common in the EU, limiting an employer's ability to expect availability outside working hours.</td></tr>
        <tr><td>Force majeure</td><td>A contract clause addressing obligations during extraordinary, unforeseeable events outside either party's control.</td></tr>
        <tr><td>Entire agreement clause</td><td>A clause stating the written contract is the complete agreement, meaning unwritten verbal promises generally aren't binding.</td></tr>
      </table>`,
  },
  {
    heading: 'A Third Worked Example: Negotiating Visa Sponsorship Terms',
    body: `
      <p>A candidate in the Philippines receives an offer from a company in Germany, contingent on securing a work visa. The initial contract states that the candidate is responsible for all visa-related costs and that the offer is void if the visa isn't secured within sixty days, with no further detail about who manages the application process itself.</p>
      <p>Applying this guide's approach, the candidate asks directly who typically handles visa applications for the company's past hires, and raises the sixty-day window as unrealistic given typical processing times for that specific visa category, which the candidate had researched in advance. The company agrees to cover filing costs directly, extends the window to one hundred twenty days to reflect realistic processing time, and commits in writing to providing a dedicated immigration contact to assist with the application. None of the original terms were unreasonable out of malice; they simply reflected a template not adjusted for the realistic specifics of this particular visa category, which became clear only once asked about directly.</p>`,
  },
  {
    heading: 'Frequently Asked Questions About Equity for Cross-Border Employees',
    body: `
      <div class="qa"><p class="q">Can every country's employees actually receive stock options?</p><p class="a">Not always; some countries have specific regulatory requirements or restrictions on equity compensation that affect how, or whether, a grant can be structured for employees there.</p></div>
      <div class="qa"><p class="q">Does an employer of record affect my ability to receive equity?</p><p class="a">Sometimes; equity is typically granted by the parent company directly rather than through the employer of record, so clarify this relationship specifically rather than assuming it works identically to direct employment.</p></div>
      <div class="qa"><p class="q">How is equity typically taxed across borders?</p><p class="a">This varies significantly and is one of the areas where a cross-border tax professional's input is most valuable, given how materially it can affect the grant's real value.</p></div>`,
  },
  {
    heading: 'A Personal Compliance Calendar',
    body: `
      <p>A simple worksheet to track recurring dates that are easy to lose track of across a busy year.</p>
      <table class="plan">
        <tr><th>Item</th><th>Date or frequency</th><th>Notes</th></tr>
        <tr><td>Visa or work-authorization renewal deadline</td><td></td><td></td></tr>
        <tr><td>Annual tax filing deadline, home country</td><td></td><td></td></tr>
        <tr><td>Annual tax filing deadline, country of work, if different</td><td></td><td></td></tr>
        <tr><td>Probation period end date</td><td></td><td></td></tr>
        <tr><td>Scheduled compensation review, if committed to in writing</td><td></td><td></td></tr>
        <tr><td>Annual market-rate check-in, as covered in the salary negotiation guide</td><td></td><td></td></tr>
      </table>`,
  },
  {
    heading: 'Where to Find Official Resources',
    body: `
      <p>For current, authoritative detail beyond this guide's overview, a few categories of official resource are worth knowing about. Most countries' labor or employment ministry maintains a public website with current statutory minimums for leave, notice, and termination. National tax authorities publish guidance on residency rules and, often, specific information for cross-border workers. Many countries also have a national business or company registry, useful for the entity-verification step covered earlier, and professional bodies for employment lawyers in a given country can usually provide a referral if you don't already have a trusted contact there.</p>`,
  },
  {
    heading: 'Keeping Up With Changing Law',
    body: `
      <p>Employment law, tax treaties, and visa categories all change over time, sometimes significantly, and a guide like this one reflects a point in time rather than a permanently fixed picture. If you're relying on anything covered here for an actual decision, a quick check that it still reflects current law in the relevant country is a reasonable habit, particularly for fast-moving areas like digital nomad visa programs and pay transparency requirements, both of which have expanded rapidly across many countries in recent years.</p>`,
  },
  {
    heading: 'A Final Word',
    body: `
      <p>Contracts are written in a specific vocabulary precisely because the stakes are real, and that vocabulary is learnable with enough repeated exposure to it, which is what this guide has tried to provide. Understanding a clause well enough to ask a sharp, specific question about it is most of what matters day to day; a qualified professional should still make the final call on anything genuinely high-stakes or ambiguous.</p>
      <p class="disclaimer">As stated at the start of this guide, nothing here is legal or tax advice, and laws referenced may have changed since this guide was written. Always verify current requirements with a qualified professional licensed in the relevant jurisdiction before making a decision based on anything covered here.</p>
      <p>Pair this guide with the rest of JobConnect AI's Learn library, including the salary negotiation and interview prep guides, since compensation, interview performance, and contract terms are different stages of the same overall process.</p>`,
  },
]

async function main() {
  const supabase = loadSupabaseClient()
  const { pdf, pageCount } = await renderGuidePdf({
    kicker: 'Learn Library · Elite',
    titleLines: ['International Contracts', '& Compliance'],
    subtitle: 'A plain-language guide to employment structures, contract clauses, and cross-border compliance. General information, not legal advice.',
    docTitle: 'International Contracts & Compliance',
    sections: SECTIONS,
  })

  writeFileSync(OUT_PATH, pdf)
  console.log(`✓ PDF generated (${pageCount} pages)`)

  await uploadGuide(supabase, pdf, STORAGE_PATH)
  console.log(`✓ Uploaded to learn-guides/${STORAGE_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })
