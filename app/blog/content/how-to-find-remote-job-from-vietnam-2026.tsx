/* eslint-disable react/no-unescaped-entities */
import { H2, H3, P, KeyTakeaway, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>Vietnam's tech workforce grew by 23% between 2022 and 2025, making it one of Southeast Asia's fastest-growing talent pools for international remote employers.</StatHook>

      <TOC items={[
        { id: 'market', label: 'Understanding the Vietnamese Remote Job Market' },
        { id: 'platforms', label: 'Platforms Where Vietnamese Candidates Actually Get Hired' },
        { id: 'timezone', label: 'Using the Timezone as a Competitive Advantage' },
        { id: 'sectors', label: 'The Sectors Most Open to Vietnamese Remote Candidates' },
        { id: 'cv', label: 'How to Position Your Profile for International Employers' },
        { id: 'mistakes', label: 'Common Mistakes That Cost Vietnamese Candidates Offers' },
        { id: 'payment', label: 'Getting Paid: International Payment Options for Vietnam' },
      ]} />

      <P drop>
        Vietnam has become one of the most strategically positioned countries in Southeast Asia for professionals seeking remote work with international companies. The combination of strong technical education, a rapidly maturing startup ecosystem in Ho Chi Minh City and Hanoi, and English proficiency rates that have improved significantly over the past decade means that Vietnamese candidates are no longer just an option for cost-driven outsourcing. They are a genuine choice for companies building distributed teams who want quality, reliability, and the timezone coverage that Southeast Asia provides. Finding a remote job from Vietnam in 2026 requires a specific strategy, because the market has changed faster than most candidate guidance has kept up with.
      </P>
      <P>
        The central challenge is not qualification. Vietnamese engineers, designers, data analysts, and content professionals are competitive on merit with candidates from any market. The challenge is visibility and positioning. Most international companies do not actively recruit in Vietnam, which means the burden of being found falls on the candidate. This guide covers exactly how to close that gap, from platform selection to profile positioning to the practical mechanics of getting paid across borders.
      </P>

      <H2 id="market">Understanding the Vietnamese Remote Job Market</H2>
      <P>
        The Vietnamese remote job market divides clearly into two segments. The first is the domestic segment: companies based in Vietnam, often with international clients, hiring locally. The second is the international segment: companies headquartered in the US, Europe, Australia, or Singapore, hiring globally and open to Vietnamese candidates either as contractors or as full-time distributed employees. Both segments are growing, but the international segment offers significantly higher compensation and often more interesting work.
      </P>
      <P>
        Within the international segment, Vietnamese candidates are most likely to encounter one of three hiring structures. Direct contractor arrangements involve a Vietnamese professional invoicing a foreign company directly as a freelancer or independent contractor, with payment handled through international transfer services. Employer of Record (EOR) arrangements involve the foreign company engaging a third-party EOR service that legally employs the Vietnamese professional locally and handles local compliance, tax, and payroll. Full-time remote employment, where the Vietnamese candidate is treated as a standard employee of the foreign company with full benefits, is rarer but exists at companies with established international hiring infrastructure.
      </P>
      <KeyTakeaway>The international remote job market is the highest-value target for Vietnamese candidates. Understanding which hiring structure a company uses before applying saves significant negotiation effort and prevents compensation misunderstandings later in the process.</KeyTakeaway>

      <H2 id="platforms">Platforms Where Vietnamese Candidates Actually Get Hired</H2>
      <P>
        Not all job platforms serve Vietnamese candidates equally. Generic job boards that list postings without filtering for location restrictions are not useful. What matters is finding listings that are explicitly open to Vietnam or to Southeast Asia broadly, or listings that specify global remote openness.
      </P>
      <H3>JobConnect AI</H3>
      <P>
        JobConnect AI aggregates remote roles from multiple sources and surfaces location restrictions clearly on every listing, meaning Vietnamese candidates can filter immediately for genuinely open positions without wading through listings that exclude Asia. The AI match score shows how well each role aligns with a candidate's specific skill set, category, and work preference, which is particularly valuable for Vietnamese professionals who may be strong candidates for roles they would not immediately think to apply to.
      </P>
      <H3>We Work Remotely and Remote.co</H3>
      <P>
        Both platforms list roles at companies that have deliberately chosen to build globally distributed teams. The companies posting on these platforms have already made the decision to hire internationally, which eliminates a significant filtering step. Vietnamese candidates should focus specifically on listings under Engineering, Design, Product, and Marketing categories on these platforms, where demand is strongest and location openness is most consistent.
      </P>
      <H3>Toptal and Upwork for Established Professionals</H3>
      <P>
        For Vietnamese professionals with three or more years of demonstrable experience, Toptal and the upper tier of Upwork offer access to clients who pay at international market rates. Toptal's vetting process is rigorous, but Vietnamese engineers and designers who pass it gain access to companies that are explicitly looking for expert-level global talent. Upwork's Top Rated and Expert Vetted tiers function similarly once a track record is established.
      </P>
      <KeyTakeaway>Platform selection determines the quality of opportunities visible to Vietnamese candidates more than almost any other factor. Focusing on platforms that explicitly support distributed global hiring eliminates the invisible location filtering that accounts for most application rejections.</KeyTakeaway>

      <H2 id="timezone">Using the Timezone as a Competitive Advantage</H2>
      <P>
        Vietnam is in UTC+7, which places it in a timezone that is genuinely valuable for international teams. For US West Coast companies (UTC-7 or UTC-8), a Vietnamese team member provides real-time coverage during the Asian business day and delivers work that is available when the US team wakes up, creating an effective asynchronous workflow that many distributed companies actively seek. For Australian and Singapore-based companies, Vietnam's timezone aligns closely and real-time collaboration is fully practical.
      </P>
      <P>
        The mistake many Vietnamese candidates make is treating the timezone as a neutral fact rather than a selling point. A cover letter or profile that explicitly notes the UTC+7 advantage for teams working across Asia-Pacific, or that highlights experience with async workflows and tools like Notion, Linear, or Loom, signals to a distributed-first employer that the candidate understands and can contribute to the operating model they have built. This is a differentiation point that most candidates from other markets do not think to make.
      </P>

      <H2 id="sectors">The Sectors Most Open to Vietnamese Remote Candidates</H2>
      <P>
        Software engineering remains the single most accessible sector for Vietnamese remote candidates. Vietnam produces approximately 50,000 IT graduates annually, and the quality of engineers from top institutions like HUST, HCMUT, and FPT University is competitive with graduates from European and US universities for most commercial software roles. Backend engineering, mobile development, and DevOps are particularly strong areas where Vietnamese candidates place consistently.
      </P>
      <P>
        UI and UX design has become a growing area of strength. Vietnamese designers with portfolios demonstrating work for international products are placing with US and European startups at rates that have increased substantially since 2022. Content and digital marketing are accessible for Vietnamese professionals with strong English writing skills and demonstrated experience with international audience formats. Data science and machine learning are emerging areas where Vietnamese candidates from research-oriented programs are beginning to compete effectively for international roles.
      </P>

      <H2 id="cv">How to Position Your Profile for International Employers</H2>
      <P>
        The single most common positioning error Vietnamese candidates make is writing profiles and CVs that are optimized for a local hiring context. Vietnamese CVs often include personal details such as date of birth, marital status, and a photo that are not standard in US or European hiring and can create unintended friction with ATS systems. An international CV for a Vietnamese candidate should follow the format of the target market: skills-focused, achievement-quantified, and stripped of personal details not relevant to the role.
      </P>
      <P>
        English proficiency should be demonstrated through the quality of the CV and cover letter itself, not stated as a line item. A fluent, professional English CV says more than a bullet point that reads "English: Advanced." Portfolio links, GitHub profiles, and published work are substantially more persuasive than self-assessed language levels for international employers evaluating remote candidates.
      </P>
      <KeyTakeaway>Reformatting a Vietnamese CV to international standards, removing non-standard personal details, and demonstrating English through quality writing rather than self-assessment are the three changes that most improve a Vietnamese candidate's success rate with international employers.</KeyTakeaway>

      <H2 id="mistakes">Common Mistakes That Cost Vietnamese Candidates Offers</H2>
      <P>
        Applying without checking location restrictions accounts for the majority of wasted application effort by Vietnamese candidates. Many listings on large job boards do not display location restrictions prominently, and candidates invest significant time in applications that are automatically filtered before review. Using platforms that surface this information clearly is the most efficient prevention.
      </P>
      <P>
        Underselling on compensation is the second most common mistake. Vietnamese candidates frequently anchor their salary expectations to domestic salary norms rather than international contractor rates, which for strong technical talent can be three to five times higher. Researching international contractor rates for a specific role and geography before entering any salary conversation is not aggressive; it is how international hiring works, and employers with distributed hiring experience expect it.
      </P>

      <H2 id="payment">Getting Paid: International Payment Options for Vietnam</H2>
      <P>
        Wise (formerly TransferWise) is the most commonly used option for Vietnamese professionals receiving contractor payments from international companies. It supports USD, EUR, and GBP receipts with conversion to VND at mid-market rates, and transaction fees are substantially lower than bank wire transfers. PayPal is accepted by some clients but applies unfavorable conversion rates and has periodic account stability issues in Vietnam. Deel and Remote are EOR platforms that handle the full payment and compliance stack, which is the option most convenient for Vietnamese professionals working as full-time employees of international companies.
      </P>

      <FAQ items={[
        {
          q: 'Do I need to register a business in Vietnam to work as a contractor for international companies?',
          a: 'Vietnamese law requires individuals receiving regular income from foreign sources to declare and pay personal income tax on those earnings. Most Vietnamese professionals working as contractors do this as individual taxpayers rather than registered businesses, particularly for early-stage contractor relationships. As income grows and the contractor relationship becomes ongoing, some professionals register a sole proprietorship or use an EOR arrangement to simplify compliance. Consulting a Vietnamese tax professional for your specific situation is recommended before entering high-value contracts.'
        },
        {
          q: 'Are English language certifications (IELTS, TOEFL) necessary for international remote applications?',
          a: 'Formal English certifications are generally not required and are not typically listed as requirements in international remote job postings. What matters to international employers is demonstrated written and spoken English proficiency, evidenced through the quality of application materials, portfolio content, and the interview process itself. For most roles, a strong portfolio and clear, professional English writing are more persuasive than a certification score.'
        },
        {
          q: 'What is the realistic salary range for a Vietnamese software engineer working remotely for a US company in 2026?',
          a: 'Senior Vietnamese engineers contracting for US companies typically earn between $40,000 and $85,000 per year depending on specialization, experience level, and company stage. Mid-level engineers typically fall in the $25,000 to $45,000 range. These figures are substantially above local market rates and represent the genuine international contractor market, not entry-level or outsourcing rates. Companies using EOR arrangements may offer different structures; always clarify whether a quoted rate is gross contractor income or net after EOR fees.'
        },
        {
          q: 'How do I handle time zone differences for daily standups and meetings?',
          a: 'Most distributed companies that hire globally have already built meeting schedules that accommodate Asian timezones, particularly if they have other team members in Southeast Asia or Australia. It is completely acceptable to ask a potential employer during the interview process what their core collaboration hours are and how they handle timezone coverage before accepting an offer. Companies serious about distributed hiring will have clear answers; companies still figuring it out will be honest about that, and both answers are useful information.'
        },
      ]} />

      <Conclusion>
        <P>
          Vietnam in 2026 is not a backup option for international companies struggling to find talent. It is an active target market for distributed teams that have learned the value of Southeast Asian time zone coverage, engineering depth, and design quality available at contractor rates that remain competitive with other international markets. Vietnamese professionals who position themselves correctly, choose the right platforms, and understand the mechanics of international contractor arrangements are finding genuine career opportunities with companies they would have had no path to five years ago.
        </P>
        <P>
          JobConnect AI surfaces verified international remote listings with location filtering that shows Vietnamese candidates exactly which opportunities are genuinely open to them, paired with match scoring that highlights roles where their specific skills create the strongest fit. Start with roles where your match score is above 70: those are the opportunities where the investment in a strong application is most likely to result in a real conversation.
        </P>
      </Conclusion>

    </article>
  )
}
