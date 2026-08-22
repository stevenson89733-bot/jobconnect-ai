export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <p className="lead text-lg text-slate-600 dark:text-slate-300 font-normal not-prose mb-8">
        The United States is the single largest market for remote tech jobs in the world — and the most confusing for international candidates. The word &quot;remote&quot; appears in hundreds of thousands of US job postings, but the majority of those roles were never intended for candidates outside the country. This guide cuts through the confusion: what work authorization actually means for remote roles, how to identify companies that genuinely hire internationally, and how to position yourself to win.
      </p>

      <h2>W-2 vs 1099 vs Corp-to-Corp: The Three Relationships</h2>
      <p>
        Before targeting US companies, you need to understand the three main employment structures — because they have completely different implications for international candidates.
      </p>
      <h3>W-2 (Employee)</h3>
      <p>
        A W-2 relationship means you&apos;re a direct employee of the US company. The company withholds federal and state income taxes, pays employer FICA (Social Security and Medicare), and issues a W-2 tax form annually. Benefits — health insurance, 401(k), paid time off — are standard at W-2 positions.
      </p>
      <p>
        For international candidates: <strong>W-2 employment requires US work authorization.</strong> This means a Green Card, US citizenship, H-1B visa, OPT/STEM OPT (for F-1 students), or another qualifying status. Without authorization, you cannot legally be a W-2 employee of a US company — and any company that tells you otherwise is either mistaken or operating outside the law.
      </p>
      <h3>1099 (Independent Contractor)</h3>
      <p>
        A 1099 relationship means you&apos;re a self-employed contractor. The company pays your gross invoiced amount with no tax withholding; you&apos;re responsible for your own taxes. No benefits, no employer FICA contribution. The company issues a 1099-NEC form if they pay you more than $600 in a calendar year.
      </p>
      <p>
        For international candidates: <strong>1099 contracting as a foreign individual is legally complex.</strong> Many US companies will not issue 1099s to foreign individuals due to IRS withholding requirements (30% backup withholding on payments to non-resident aliens under the default rules, unless a tax treaty applies). This is why many international contractors work through a foreign entity instead.
      </p>
      <h3>Corp-to-Corp (C2C)</h3>
      <p>
        Corp-to-Corp means you operate through your own business entity (an LLC, corporation, or equivalent in your home country) that invoices the US company directly. The US company pays your entity as a business expense; your entity pays you under your home country&apos;s laws.
      </p>
      <p>
        For international candidates: <strong>Corp-to-Corp is the most accessible and legally clean path.</strong> You invoice from your home country entity. No US work authorization required. No IRS withholding complications. Payment goes business-to-business. This is how the majority of international contractors legitimately work with US companies.
      </p>
      <p>
        Alternatively, Employer of Record (EOR) services like Deel, Remote.com, or Rippling employ you in your home country under local law, then bill the US company as a service fee. Same clean result — legal employment without US authorization.
      </p>

      <h2>Work Authorization: What It Actually Means for Remote Jobs</h2>
      <p>
        &quot;Work authorization&quot; refers to the legal right to be employed within the United States. The critical nuance: <strong>working remotely for a US company from your home country is not the same as working in the United States.</strong>
      </p>
      <p>
        If you&apos;re sitting in Lagos, São Paulo, or Manila doing work for a company in San Francisco — you are physically working in your home country. You are not working in the United States, regardless of where the company is headquartered. Therefore, US work authorization is not required for the physical act of performing the work.
      </p>
      <p>
        What US work authorization <em>does</em> govern:
      </p>
      <ul>
        <li>Being on a US payroll as a W-2 employee</li>
        <li>Working physically within US territory</li>
        <li>Receiving certain types of US-sourced income under specific tax treaty provisions</li>
      </ul>
      <p>
        The practical implication: when a US job posting says &quot;must be authorized to work in the US,&quot; it usually means the company is hiring a W-2 employee and will not engage with contractors or EOR arrangements. When a posting says &quot;open to contractors&quot; or &quot;corp-to-corp accepted,&quot; international candidates are often genuinely in scope.
      </p>

      <h2>Why &quot;Remote&quot; US ≠ Remote International (And How to Detect It)</h2>
      <p>
        This is the most expensive mistake international candidates make: applying to US remote jobs that were never intended for non-US candidates. The cost is time, hope, and often the start of a discouraging spiral.
      </p>
      <p>
        US companies post &quot;remote&quot; jobs for several reasons that exclude international candidates by default:
      </p>
      <ul>
        <li><strong>State-based remote:</strong> The company hires remotely but only within specific US states for payroll, benefits, or legal reasons (&quot;remote — US only,&quot; &quot;remote — must reside in California, Texas, or New York&quot;)</li>
        <li><strong>W-2 only:</strong> The role is structured as employee-only with no contractor alternative, legally requiring US authorization</li>
        <li><strong>ITAR/government clearance:</strong> Defense contractors and government-adjacent companies cannot legally employ non-US persons on certain contracts</li>
        <li><strong>Health benefits complexity:</strong> US health insurance is employer-linked; companies with W-2 plans often can&apos;t extend benefits internationally, creating a structural barrier</li>
        <li><strong>Overlap requirements:</strong> &quot;Remote but must be available 9–5 ET&quot; is functionally a US/Canada timezone requirement</li>
      </ul>
      <p>
        <strong>How to detect internationally-accessible US remote roles:</strong>
      </p>
      <ul>
        <li>Look for explicit signals: &quot;open to international contractors,&quot; &quot;c2c accepted,&quot; &quot;hire anywhere,&quot; &quot;global remote,&quot; &quot;EOR supported&quot;</li>
        <li>Check the company&apos;s existing team on LinkedIn — if their current staff is internationally distributed, they have the infrastructure to hire you</li>
        <li>Remote-first companies (Gitlab, Automattic, Basecamp-heritage companies) are structurally designed for international hiring</li>
        <li>Series A–C startups with distributed founding teams often don&apos;t have a US-only hiring requirement baked in yet</li>
        <li>Avoid large enterprises with HR departments: their compliance requirements almost always default to W-2-only hiring</li>
      </ul>
      <p>
        JobConnect AI&apos;s Remote-Friendly Detector specifically flags US job postings based on these signals, filtering out the &quot;remote US only&quot; roles before they appear in your results.
      </p>

      <h2>The US Resume: Format, Rules, and What ATS Expects</h2>
      <p>
        The American resume format is one of the most rigid in the world — and the most different from what most international candidates are used to. Getting this wrong is an immediate disqualifier.
      </p>
      <h3>One Page (With One Exception)</h3>
      <p>
        The standard US resume is one page for candidates with fewer than 10 years of experience. Two pages are acceptable for candidates with 10+ years and senior/executive roles. Three pages is almost never appropriate outside academic CVs. If you&apos;re submitting a 2-3 page resume from a European tradition, trim it to one page before sending to US companies — it reads as unfamiliarity with the market.
      </p>
      <h3>Absolutely No Personal Information</h3>
      <p>
        US Equal Employment Opportunity (EEO) law makes it illegal for employers to make hiring decisions based on age, nationality, religion, marital status, or physical appearance. Therefore, US resumes never include:
      </p>
      <ul>
        <li>Photo</li>
        <li>Date of birth</li>
        <li>Nationality or citizenship status (this goes in the application form, not the resume)</li>
        <li>Marital status</li>
        <li>Gender</li>
        <li>Religion</li>
        <li>Home address (city + state is fine; full address is unnecessary and sometimes flagged)</li>
      </ul>
      <p>
        International candidates who include photos or nationality on US resumes are signaling inexperience with US norms — and potentially creating awkwardness for recruiters trained to discard that information on sight.
      </p>
      <h3>Action Verbs + Quantified Impact</h3>
      <p>
        Every bullet point in a US resume should start with a strong past-tense action verb and lead toward a quantified result. The formula:
      </p>
      <p><strong>[Action verb] + [what you did] + [result in numbers]</strong></p>
      <ul>
        <li>✅ &quot;Architected a microservices migration reducing deployment time by 65%, enabling weekly releases across 3 product lines&quot;</li>
        <li>✅ &quot;Led a 7-person cross-functional team to deliver a $2.4M enterprise integration on time and under budget&quot;</li>
        <li>❌ &quot;Responsible for the development and maintenance of microservices infrastructure&quot;</li>
        <li>❌ &quot;Participated in cross-functional collaboration to achieve project delivery&quot;</li>
      </ul>
      <p>
        Strong action verbs for tech and business roles: Architected, Engineered, Spearheaded, Scaled, Automated, Reduced, Increased, Delivered, Launched, Optimized, Migrated, Integrated. Weak verbs to avoid: Participated, Assisted, Helped, Worked on, Involved in.
      </p>
      <h3>ATS Formatting Rules</h3>
      <p>
        US companies — especially tech companies — almost universally use ATS systems. The same rules apply here as internationally, but with additional US-specific considerations:
      </p>
      <ul>
        <li>Single-column layout only (two-column breaks ATS parsers)</li>
        <li>Standard section headings: &quot;Experience,&quot; &quot;Education,&quot; &quot;Skills,&quot; &quot;Summary&quot; — avoid creative alternatives</li>
        <li>No tables, no text boxes, no headers/footers for important content</li>
        <li>Dates as &quot;Month YYYY – Month YYYY&quot; format</li>
        <li>File: .docx preferred; PDF only if text-selectable (not scanned)</li>
        <li>Mirror keywords from the job description exactly — US ATS is especially keyword-literal</li>
      </ul>

      <h2>US Salaries for International Candidates: Reality vs Expectations</h2>
      <p>
        US tech salaries are the highest in the world for equivalent roles — and this creates a specific problem for international contractors. Understanding the gap between what US employees earn and what international contractors typically negotiate is essential before entering any compensation conversation.
      </p>
      <h3>What US Employees Earn</h3>
      <p>
        US software engineers at competitive companies earn $120,000–$300,000+ in total compensation (base + equity + bonus). These numbers are widely reported on Levels.fyi and Glassdoor. They include:
      </p>
      <ul>
        <li>Base salary (typically $100K–$200K for senior engineers)</li>
        <li>Equity (RSUs or options, often the largest component at growth companies)</li>
        <li>Annual bonus (10–20% of base at many companies)</li>
        <li>Benefits worth $15,000–$30,000/year (health insurance, 401k match, etc.)</li>
      </ul>
      <h3>What International Contractors Realistically Earn</h3>
      <p>
        International contractors working Corp-to-Corp for US companies typically earn:
      </p>
      <ul>
        <li><strong>No equity</strong> (contractors are not employees; equity is almost never offered)</li>
        <li><strong>No benefits</strong> (health, retirement, PTO are self-funded)</li>
        <li><strong>Hourly or monthly contract rates</strong> that reflect local market + premium for US engagement</li>
        <li><strong>Currency risk</strong> if paid in USD (which most international contractors prefer)</li>
      </ul>
      <p>
        Realistic contractor rates for experienced international engineers working with US companies: $40–$120/hour depending on specialization, location, and the company&apos;s contractor budget. Annual equivalent: $80K–$240K — but with no equity, no benefits, and variable utilization (contracts pause, projects end).
      </p>
      <p>
        The trap: quoting US W-2 salary benchmarks when negotiating a contractor rate. A US engineer at $180K total comp includes ~$50K in benefits and equity. As a contractor, you&apos;re providing equivalent output at lower risk to the company — but you should also be capturing a rate premium to cover your own benefits, tax burden (self-employment taxes in many jurisdictions), and utilization risk.
      </p>
      <h3>Negotiation Framework</h3>
      <p>
        Research: find the US market rate for the equivalent full-time role (Levels.fyi, Glassdoor, LinkedIn Salary). Take the base salary. Add 20–30% to cover benefits/taxes/risk that you now self-fund. Convert to hourly (÷ 2,000 hours). That&apos;s your floor. Negotiate from there based on your specialization premium and the company&apos;s urgency.
      </p>

      <h2>Companies and Platforms Most Open to International Contractors</h2>
      <h3>Company Profiles That Signal International Openness</h3>
      <ul>
        <li><strong>Remote-first from founding:</strong> GitLab (800+ employees across 65+ countries), Automattic (WordPress), Basecamp, Doist, Hotjar — these companies built distributed infrastructure from day one and have no structural preference for US-based talent</li>
        <li><strong>VC-backed Series A–C startups with distributed founding teams:</strong> Check the &quot;About&quot; page and LinkedIn — if the founders are in different countries, the company is comfortable with distributed work</li>
        <li><strong>Dev tool and infrastructure companies:</strong> These companies sell globally, hire globally, and their engineering teams reflect this. Look at Vercel, Supabase, PlanetScale, Railway — all with international engineering teams</li>
        <li><strong>Agencies and consulting firms:</strong> US digital agencies staffing client projects frequently engage international contractors for cost-efficiency and timezone coverage</li>
      </ul>
      <h3>Where to Find These Roles</h3>
      <ul>
        <li><strong>JobConnect AI</strong> — Remote-Friendly Detector filters US postings for genuine international contractor accessibility, flagging C2C-accepted, EOR-supported, and global-remote roles</li>
        <li><strong>Wellfound (AngelList Talent)</strong> — Startup-focused, many early-stage companies explicitly open to international contractors. Filter: Remote + Open to international</li>
        <li><strong>We Work Remotely</strong> — One of the oldest remote job boards; many listings are genuinely international-open because the board attracts remote-first companies</li>
        <li><strong>Remote.co</strong> — Curated remote roles with explicit international hiring filters</li>
        <li><strong>Toptal</strong> — Vetted contractor network where acceptance is competitive but rates are premium and client companies are pre-qualified for international engagement</li>
        <li><strong>Braintrust</strong> — Talent network with strong international contractor representation and US company clients</li>
        <li><strong>LinkedIn Jobs</strong> — Filter: United States + Remote. Then scan descriptions for &quot;c2c,&quot; &quot;corp to corp,&quot; &quot;worldwide,&quot; &quot;hire anywhere,&quot; &quot;global&quot;</li>
      </ul>

      <h2>Classic Mistakes Non-US Candidates Make</h2>
      <ul>
        <li>
          <strong>Applying to roles that say &quot;US only&quot; without asking:</strong> Some companies post &quot;US only&quot; as a default and will actually consider international contractors if asked. But many won&apos;t — and applying without acknowledgment wastes everyone&apos;s time. If a posting says US only but the company looks right, send a targeted message: &quot;I noticed this role says US only — I&apos;m available as a Corp-to-Corp contractor from [country]. Is the role open to that arrangement?&quot;
        </li>
        <li>
          <strong>Not stating contractor availability upfront:</strong> US recruiters are accustomed to quickly qualifying candidates on work authorization. Add a single line to your cover letter or LinkedIn headline: &quot;Available as an independent contractor — no US work authorization required.&quot; This removes the recruiter&apos;s biggest screening concern in one sentence.
        </li>
        <li>
          <strong>Submitting a multi-page or photo-included resume:</strong> Immediately signals unfamiliarity with US norms. A recruiter who sees a photo on a US resume will often stop reading — not out of bias, but out of trained EEO habit.
        </li>
        <li>
          <strong>Quoting W-2 salary benchmarks:</strong> When a US company asks your rate expectation and you cite total comp from Levels.fyi, you&apos;re comparing apples and oranges. Always anchor to contractor rates, not employee salaries.
        </li>
        <li>
          <strong>Ignoring timezone in applications:</strong> Many US companies posting &quot;remote&quot; have unstated overlap expectations. If you&apos;re in a timezone with zero overlap with US East Coast hours (UTC+5.5 and beyond), address this proactively: &quot;I work UTC+5:30, with flexibility to cover EST mornings 8–10am for team syncs.&quot; Silence on this creates anxiety for hiring managers.
        </li>
        <li>
          <strong>Treating the US as a single market:</strong> San Francisco tech startups, New York fintech, Austin enterprise software, and Seattle cloud companies have meaningfully different cultures, comp structures, and openness to international contractors. Match your targeting to company type, not just geography.
        </li>
      </ul>

    </article>
  )
}
