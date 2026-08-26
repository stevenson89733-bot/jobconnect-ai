/* eslint-disable react/no-unescaped-entities */
import { H2, H3, P, KeyTakeaway, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>In 2025, companies using Employer of Record services to hire internationally grew by 67% year on year, making cross-border remote employment more accessible than at any previous point in the history of distributed work.</StatHook>

      <TOC items={[
        { id: 'find', label: 'Step 1: Finding Roles That Are Genuinely Open Internationally' },
        { id: 'apply', label: 'Step 2: Building an Application That Crosses Borders' },
        { id: 'interview', label: 'Step 3: Navigating the International Interview Process' },
        { id: 'negotiate', label: 'Step 4: Negotiating the Offer Correctly' },
        { id: 'sign', label: 'Step 5: Understanding What You Are Signing' },
        { id: 'start', label: 'Step 6: Setting Yourself Up for the First 90 Days' },
        { id: 'sustain', label: 'Sustaining a Long-Term International Remote Career' },
      ]} />

      <P drop>
        The phrase "cross-border remote job" covers a specific and growing category of work arrangement: a professional based in one country, working for an employer headquartered in another, without relocating. The category has expanded dramatically since 2020, but most practical guides still treat it as an extension of domestic remote work, which it is not. The mechanics of finding, applying for, negotiating, and starting a cross-border remote role are genuinely different at every stage. This guide covers the complete process from search to day one, in enough detail to be actionable for candidates who have never done it before and candidates who have started the process but hit obstacles.
      </P>
      <P>
        The fundamental premise of this guide is that cross-border remote employment is a skill, not just a job category. Candidates who develop that skill systematically obtain significantly better outcomes than candidates who apply to international roles using the same approach they use for domestic applications.
      </P>

      <H2 id="find">Step 1: Finding Roles That Are Genuinely Open Internationally</H2>
      <P>
        The first and most important filter in a cross-border job search is not skill alignment or company size. It is legal and administrative openness. A company that has not established the infrastructure to hire internationally, whether through an EOR service, a local subsidiary, or a direct contractor arrangement, cannot hire you regardless of how well you match the role. Applying to companies without this infrastructure wastes time for both parties.
      </P>
      <H3>Signals that a company is set up for international hiring</H3>
      <P>
        The clearest signals are explicit statements in the job posting: "open worldwide," "we use EOR for global hiring," "location: anywhere," or "we hire through Deel/Remote/Papaya." Beyond explicit statements, company job pages that list employees from multiple countries, LinkedIn profiles of current employees showing diverse geographies, and the presence of the company on curated global-remote job boards are all strong indirect signals.
      </P>
      <H3>Platforms optimized for cross-border search</H3>
      <P>
        JobConnect AI, We Work Remotely, Remote.co, and Remotive are the platforms most likely to surface genuinely open international roles. These platforms either manually curate for location openness or display restrictions clearly enough that filtering is straightforward. Generic job boards can surface international roles but require much more filtering effort and produce a higher ratio of positions that are technically labeled remote but restricted to domestic candidates.
      </P>
      <KeyTakeaway>Do not start a cross-border job search on generic job boards. Specialized remote platforms have already done the filtering that separates "remote in this country only" from "genuinely open internationally," and that filtering is the most valuable step in the entire search process.</KeyTakeaway>

      <H2 id="apply">Step 2: Building an Application That Crosses Borders</H2>
      <P>
        A cross-border application needs to communicate competence on two dimensions simultaneously: professional competence for the role itself, and operational competence as a distributed international team member. Most candidates communicate only the first. The candidates who move forward communicate both.
      </P>
      <H3>CV format for the target market</H3>
      <P>
        CV conventions vary significantly across hiring markets. US hiring managers expect a one to two page resume with no photo, no personal details such as age or marital status, and a strong emphasis on quantified achievements. UK CVs follow similar conventions but are typically called CVs and may run slightly longer. European markets outside the UK have varying conventions: German CVs traditionally include a professional photo; French CVs traditionally do not. If you are applying to a company based in a specific country, research the CV conventions of that market and adapt your document accordingly. An application adapted to the target market's format signals cultural intelligence, which is itself a valued cross-border capability.
      </P>
      <H3>Addressing location proactively</H3>
      <P>
        Do not bury your location or hope it will not be noticed until later in the process. Address it directly and professionally in your cover letter or application note: state your location, your timezone in UTC format, and your availability for collaboration during the company's core hours. Proactive location disclosure combined with clear timezone information eliminates the recruiter's primary logistical concern before it becomes a question.
      </P>
      <H3>Demonstrating distributed work experience</H3>
      <P>
        If you have prior experience working asynchronously, collaborating across timezones, or contracting for international clients, feature this experience prominently. List the tools you use for async collaboration: Notion, Linear, Loom, Slack, Figma, GitHub. These details signal to a distributed-first employer that you already operate within their model and will not require onboarding to the fundamentals of remote work.
      </P>

      <H2 id="interview">Step 3: Navigating the International Interview Process</H2>
      <P>
        Cross-border interview processes typically include one additional layer that domestic processes do not: a logistics conversation. Before or alongside the standard technical and cultural interviews, there will usually be a conversation about how the working relationship will be structured legally, how you will be paid, and whether your timezone works for the team's collaboration model. Preparing for this conversation in advance positions you as a candidate who is easy to hire.
      </P>
      <P>
        Know your preferred structure before the conversation: are you comfortable operating as an independent contractor? Do you prefer or require an EOR arrangement with a proper employment contract? Have you worked with specific EOR platforms before? Understanding the practical differences between these structures and having a clear preference reduces the friction in the logistics conversation and demonstrates maturity around international work arrangements.
      </P>
      <KeyTakeaway>The logistics conversation in a cross-border interview is not an obstacle to getting the offer. It is an opportunity to demonstrate that you understand how international hiring works and that engaging you will be straightforward. Candidates who are well-prepared for this conversation accelerate the decision significantly.</KeyTakeaway>

      <H2 id="negotiate">Step 4: Negotiating the Offer Correctly</H2>
      <P>
        Salary negotiation in a cross-border context has a specific complexity that domestic negotiation does not: the reference point for "market rate" is ambiguous. Is it the market rate in the company's country? In your country? An international contractor rate? Companies have different policies, and the policy determines the negotiation framework before the specific number matters.
      </P>
      <P>
        Ask directly and early: "What is your compensation philosophy for international team members? Do you pay to a local market rate for my geography, or to the rate for this role in your market?" Both answers are legitimate, but they produce very different numbers, and knowing which framework applies before negotiating prevents a frustrating misalignment. Companies paying to their own market rate for senior technical roles typically offer significantly more than companies applying location-based adjustments. Neither policy is inherently better, but you need to know which one you are negotiating within.
      </P>
      <P>
        Also clarify whether a quoted annual figure is a gross contractor rate (from which you pay your own taxes, insurance, and EOR fees if applicable) or a net figure after the company's EOR costs. EOR fees can add 15 to 30 percent on top of the gross salary, and some companies quote net of those fees while others quote gross. The difference is material.
      </P>

      <H2 id="sign">Step 5: Understanding What You Are Signing</H2>
      <P>
        Cross-border employment contracts fall into three categories with meaningfully different implications. A direct contractor agreement is a commercial contract between you (as a self-employed individual or registered business) and the foreign company. It is governed by the law of whichever jurisdiction the contract specifies, typically the company's jurisdiction. You are responsible for all local tax compliance in your country of residence.
      </P>
      <P>
        An EOR employment agreement is a local employment contract between you and the EOR entity operating in your country. It is governed by local employment law, which provides the full protections of your country's labor regulations. The EOR handles local payroll taxes and social contributions. The foreign company has a separate commercial agreement with the EOR, which is not your concern.
      </P>
      <P>
        A subsidiary employment agreement is a standard local employment contract with the foreign company's local entity in your country. It is the most straightforward structure but is only available where the company has established a legal presence.
      </P>
      <KeyTakeaway>Read your contract before signing, and verify that the governing law, termination notice period, intellectual property clauses, and any non-compete provisions are consistent with your expectations and your local legal requirements. Cross-border contracts are enforceable, and the terms matter more, not less, because jurisdictional recourse is more complex.</KeyTakeaway>

      <H2 id="start">Step 6: Setting Yourself Up for the First 90 Days</H2>
      <P>
        The first 90 days of a cross-border remote role carry specific risks that domestic remote starts do not. Without physical presence, you cannot build relationships through proximity. Visibility requires deliberate action because informal hallway interactions, which create much of the organic relationship-building in offices, do not exist. Over-communicating is not the risk in a remote cross-border start: under-communicating is.
      </P>
      <P>
        Ask your manager explicitly in the first week: what does a successful 30, 60, and 90-day period look like for this role? What are the two or three things you most want me to deliver or demonstrate in the first quarter? These questions are not signs of uncertainty; they are signs of clarity-seeking, which is one of the highest-value competencies in a distributed team. Candidates who ask this question in the first week and then deliver on the answers are the ones who get expanded scope, stronger performance reviews, and referrals to other roles in the organization.
      </P>

      <H2 id="sustain">Sustaining a Long-Term International Remote Career</H2>
      <P>
        A single successful cross-border role is the beginning of a career pattern, not a one-off achievement. The mechanics you learn on the first engagement, how to contract internationally, how to structure your taxes, how to collaborate asynchronously with distributed teams, how to negotiate compensation in a cross-border context, compound in value with each subsequent role. International remote professionals who build this skill set over two to four years are among the most employable professionals globally, because they can work for the best companies in the world regardless of where those companies are headquartered.
      </P>

      <FAQ items={[
        {
          q: 'What happens to my local social security and healthcare if I work for a foreign company as a contractor?',
          a: 'As an independent contractor for a foreign company, you are typically responsible for your own social security contributions and healthcare coverage in your country of residence. This is a material financial consideration: the gross contractor rate needs to account for costs that an employer would normally cover under a standard employment arrangement. EOR arrangements solve this by having the EOR employer make the required local contributions as part of the employment relationship. Understanding this distinction before negotiating is important.'
        },
        {
          q: 'Can I work for multiple international clients simultaneously?',
          a: 'As an independent contractor, working for multiple clients simultaneously is generally permitted unless a specific client contract includes an exclusivity clause. It is standard practice in international contracting and many experienced remote professionals maintain two or three ongoing client relationships. Under an EOR employment arrangement, the employment contract typically prohibits simultaneous full-time employment with a direct competitor, though part-time consulting work for non-competing clients is often permitted with disclosure.'
        },
        {
          q: 'How do I build a professional network internationally without attending in-person events?',
          a: 'Remote professional networking operates primarily through LinkedIn, specialized community platforms like Slack workspaces for specific industries or tools, Twitter and X for technology communities, and virtual conferences and meetups. Contributing to open source projects, publishing technical writing, speaking at virtual events, and being active in industry-specific online communities are all effective network-building strategies that translate into international professional visibility.'
        },
        {
          q: 'Is it necessary to have a registered business entity to work as an international contractor?',
          a: 'In many countries, individuals can invoice foreign companies as sole proprietors or self-employed individuals without registering a formal business entity. Requirements vary significantly by country. In some jurisdictions, registering a simple business entity offers tax advantages or legal protections that justify the modest setup cost and administrative overhead. The appropriate structure depends on your country of residence, the volume of international income, and the number of clients you serve. A local accountant familiar with international income is the most reliable guide for your specific situation.'
        },
      ]} />

      <Conclusion>
        <P>
          Cross-border remote work is not a workaround or a compromise. It is a career model that gives qualified professionals access to the best opportunities globally, regardless of where they happen to live. The candidates who approach it as a discipline, learning the search strategies, the contracting structures, the negotiation frameworks, and the distributed collaboration skills that make it work, build careers that are both more interesting and more financially rewarding than what is available in most domestic markets.
        </P>
        <P>
          JobConnect AI aggregates verified cross-border remote listings with explicit location filtering so that every result you see is a genuine opportunity for candidates outside the company's home country. The AI Copilot helps at every stage from application drafting to interview preparation, specifically calibrated for the international context where generic advice consistently falls short.
        </P>
      </Conclusion>

    </article>
  )
}
