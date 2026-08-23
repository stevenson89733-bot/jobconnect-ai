import { H2, H3, P, KeyTakeaway, Quote, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>A survey of international recruiters found that 68% immediately categorize an application as &quot;uninformed&quot; when the resume format does not match the conventions of the target country — regardless of the candidate&apos;s qualifications.</StatHook>

      <TOC items={[
        { id: 'why-format-matters', label: 'Why Resume Format Is a Qualification Signal' },
        { id: 'usa', label: 'United States: The Achievement-First Resume' },
        { id: 'uk', label: 'United Kingdom: The Two-Page CV' },
        { id: 'germany', label: 'Germany: The Comprehensive Lebenslauf' },
        { id: 'france', label: 'France: The Narrative CV' },
        { id: 'canada', label: 'Canada: Close to US, with Distinct Differences' },
        { id: 'quick-reference', label: 'Quick Reference: Format Differences at a Glance' },
      ]} />

      <P drop>
        A resume is not simply a document; it is a signal. Before any recruiter evaluates qualifications, experience, or fit, they form an assessment based on whether the document in front of them conforms to the professional conventions of their market. This assessment happens in seconds and shapes the entire subsequent evaluation. An experienced recruiter in Germany does not consciously think, &quot;this candidate submitted a US-format resume without a photo and therefore lacks cultural awareness.&quot; The thought is simpler and faster: this application does not look right. That assessment colors everything that follows.
      </P>
      <P>
        The professional conventions that govern resume format differ significantly by country, and these differences are not superficial preferences. The German Lebenslauf includes personal information and a professional photograph that a US resume must never contain. The UK CV runs two pages where the US resume runs one. The French CV opens with a narrative professional summary where the German Lebenslauf opens with a formal header. Each convention reflects a distinct hiring culture, and conforming to it signals something specific: that the candidate has done the work of understanding the market they are entering.
      </P>
      <P>
        This guide provides a market-by-market breakdown of resume format conventions for the five most important international remote job markets, with practical guidance on every structural element that differs between them.
      </P>

      <H2 id="why-format-matters">Why Resume Format Is a Qualification Signal</H2>
      <P>
        International hiring managers frequently describe the format assessment as unconscious but consequential. A recruiter at a London fintech who reviews three hundred applications for a senior engineering role does not have time to give every document a fair reading. The first filter, applied in a few seconds per document, is whether the application looks like it belongs in this process. A document formatted according to US norms, with a single page, achievement-focused bullets, and no personal summary, passes this filter for a US role and fails it for a UK role. The recruiter does not think less of the candidate&apos;s qualifications; the candidate&apos;s qualifications never get read.
      </P>
      <P>
        The format signal also communicates something specific about the candidate&apos;s preparation and judgment. A candidate applying for a remote role at a German company who submits a US-format resume without researching German conventions is telling the recruiter something about how thoroughly they research before taking action. This inference is not unfair; it is exactly the kind of contextual judgment that experienced hiring managers rely on when they have more applications than time to evaluate each one carefully.
      </P>
      <P>
        The investment required to format a resume correctly for each target market is modest. The elements that differ are structural and specific; once understood, they can be applied systematically in an hour or two of document adjustment. The return on this investment, measured in applications that reach human review rather than being filtered at the first glance, is substantial.
      </P>
      <KeyTakeaway>Resume format is a professional competence signal that precedes any evaluation of qualifications. A correctly formatted document communicates market knowledge and preparation; an incorrectly formatted one communicates their absence, regardless of what the content contains.</KeyTakeaway>

      <H2 id="usa">United States: The Achievement-First Resume</H2>
      <P>
        The US resume is distinctive in its format conventions in several ways that differ from every other major market, and these differences are the ones most commonly misapplied by international candidates.
      </P>
      <H3>Length: strictly one page for most candidates</H3>
      <P>
        For candidates with fewer than ten years of professional experience, the US resume is one page. This is not a preference; it is a professional standard in the US market, reinforced by a hiring culture that values economy of communication and treats the ability to distill a career to its most relevant elements as a skill in itself. For candidates with ten or more years of experience or highly specialized technical backgrounds, two pages are acceptable. Three pages are never acceptable regardless of experience level.
      </P>
      <H3>Achievement-focused bullet points</H3>
      <P>
        US resumes describe what candidates achieved, not what they were responsible for. The standard format for each experience entry is: strong action verb, specific achievement, quantified result. &quot;Reduced API response time by 45% by refactoring the data access layer, improving performance for 800,000 daily active users&quot; is a strong US bullet point. &quot;Responsible for maintaining backend API infrastructure&quot; is not. Every bullet point in a US resume should answer the implicit recruiter question: &quot;So what? Why does this matter? What was the result?&quot;
      </P>
      <H3>No personal information</H3>
      <P>
        US resumes contain: name, city and state (not full address), phone number, email, LinkedIn URL, and optionally a GitHub profile or personal portfolio link. No photographs. No dates of birth. No nationality. No marital status. No religion or gender. US Equal Employment Opportunity regulations prohibit hiring decisions based on protected characteristics, and US recruiters are trained to remove applications that include this information to avoid discrimination liability. Including personal information on a US resume does not merely fail to help; it creates a specific compliance concern that causes experienced US recruiters to set the application aside.
      </P>
      <H3>Summary or objective (optional)</H3>
      <P>
        A two to three sentence professional summary at the top of the resume is optional in the US market and adds value only when it contains specific, non-generic information. A summary reading &quot;results-driven professional with strong communication skills seeking a challenging opportunity&quot; adds no information and should be omitted. A summary reading &quot;senior distributed systems engineer with eight years of experience scaling real-time data pipelines at Series B and Series D companies; specialized in Apache Kafka, Flink, and Kubernetes at multi-region scale&quot; immediately establishes professional identity for a recruiter reading quickly.
      </P>
      <KeyTakeaway>The US resume demands a single page, achievement-quantified bullets, and zero personal information. Every element not in this description is either optional or actively counterproductive in the US market.</KeyTakeaway>

      <H2 id="uk">United Kingdom: The Two-Page CV</H2>
      <P>
        The UK CV differs from the US resume in four specific ways that UK recruiters consistently identify as the markers that distinguish a properly prepared application from an international one.
      </P>
      <H3>Length: two pages is expected</H3>
      <P>
        The UK CV runs two pages for experienced candidates. The single-page US resume, submitted to a UK company, is typically described by UK recruiters as &quot;thin.&quot; It signals either insufficient experience or a failure to understand British professional standards. The two-page format gives experienced candidates the space to provide the career narrative and supporting evidence that UK hiring managers expect to evaluate.
      </P>
      <H3>Professional summary</H3>
      <P>
        A professional summary of three to four sentences at the top of the CV is standard in the UK. Unlike the US summary, which is achievement-focused, the UK summary tends toward narrative positioning: who the candidate is professionally, what their area of expertise is, and what they are looking for in the next role. It should be specific and factual rather than aspirational and generic.
      </P>
      <H3>British English throughout</H3>
      <P>
        British spelling conventions apply: organise rather than organize, colour rather than color, programme rather than program (except in software contexts, where &quot;program&quot; is standard). This is a small adjustment that signals disproportionate attention to market-specific standards.
      </P>
      <H3>No photos, no personal information</H3>
      <P>
        Like the US, UK CVs must contain no photographs, dates of birth, nationality, or marital status. The Equality Act 2010 creates the same compliance concern for UK HR professionals as EEO regulations do in the US. The one addition to the UK CV header that is sometimes included, and that is not standard in the US, is a link to a personal website, portfolio, or GitHub profile for technical candidates.
      </P>
      <KeyTakeaway>The UK CV is two pages, uses British English, includes a narrative professional summary, and contains no personal information or photographs. The two-page length and professional summary are the most commonly missing elements in international applications to UK companies.</KeyTakeaway>

      <H2 id="germany">Germany: The Comprehensive Lebenslauf</H2>
      <P>
        The German Lebenslauf is the most distinctively formatted major market resume, with conventions that differ from both US and UK norms in ways that directly affect application success when not followed.
      </P>
      <H3>Length: one to two pages</H3>
      <P>
        The Lebenslauf typically runs one to two pages. Unlike the UK CV, which defaults to two pages, the appropriate length depends on experience level: a compact one-page Lebenslauf for a candidate with fewer than five years of experience is appropriate, while a two-page document for an experienced professional is standard. The document should be dense with structured content rather than using white space to fill length.
      </P>
      <H3>Professional photograph: required</H3>
      <P>
        The Bewerbungsfoto (professional application photo) is a non-negotiable element of the German Lebenslauf. It belongs in the upper right corner of the first page and should be a recent professional headshot, taken within the past two years, with a neutral background and professional attire. Its absence is noticed by German recruiters and consistently interpreted as unfamiliarity with German professional norms, not as an equal-opportunity measure.
      </P>
      <H3>Personal information: included</H3>
      <P>
        The German Lebenslauf header includes date of birth, nationality, marital status, current address, phone number, and email. This information is standard and expected. While Germany has moved toward more equal-opportunity hiring at large multinational companies, the personal information header remains standard across most German companies and must be included.
      </P>
      <H3>Precise employment dates</H3>
      <P>
        Employment dates in the German Lebenslauf must include the month and year: September 2020 to March 2023, not 2020 to 2023. Year-only date ranges are a specific signal of unfamiliarity with German CV standards and are noticed by experienced German recruiters. Employment gaps must be labeled directly on the document with a brief explanation.
      </P>
      <H3>Language and certifications</H3>
      <P>
        All languages must be listed with proficiency levels according to the Common European Framework of Reference (A1 through C2). All certifications must include the issuing body and the date of completion. These are not optional additions; they are expected structural elements of every Lebenslauf.
      </P>
      <KeyTakeaway>The Lebenslauf requires a professional photograph, full personal information, and month-and-year precision in employment dates. These three elements are the most commonly missing components in international applications to German companies, and their absence is the primary reason qualified applications are deprioritized before any skills assessment occurs.</KeyTakeaway>

      <H2 id="france">France: The Narrative CV</H2>
      <P>
        The French CV occupies a middle position between the comprehensive German Lebenslauf and the achievement-focused US resume, with a strong emphasis on professional narrative and educational credentials.
      </P>
      <H3>Length: one to two pages</H3>
      <P>
        One page is appropriate for candidates with fewer than five years of experience; two pages for experienced professionals. The French CV does not approach the level of personal information included in the German Lebenslauf, but it includes more narrative context than the US resume or UK CV.
      </P>
      <H3>Professional summary: required and narrative</H3>
      <P>
        A professional summary of three to five sentences at the top of the CV is standard. The French summary is more narrative than the US or UK version, positioning the candidate&apos;s professional identity, career arc, and current professional objective within a coherent story. It is evaluated by French recruiters for both content and writing quality, making it an important investment.
      </P>
      <H3>Education: prominent placement</H3>
      <P>
        French employers, particularly large companies and traditional corporate environments, place significant weight on educational credentials and institution prestige. For candidates who graduated from recognized institutions, the education section often appears on the first page, sometimes before work experience, particularly for candidates within five to seven years of graduation. Including international ranking context for non-French institutions is recommended, as French recruiters may not recognize the standing of universities outside France without this reference.
      </P>
      <H3>Photo: not recommended in contemporary practice</H3>
      <P>
        While photos were historically standard on French CVs, contemporary professional practice, informed by French equal employment opportunity principles, is to omit the photo and include a LinkedIn profile link instead. This is the recommendation from most current French career guidance and HR professionals, and it applies to international candidates as well.
      </P>
      <H3>Personal information: minimal</H3>
      <P>
        Current city, phone number, email, and LinkedIn URL are included. Date of birth and nationality are not included in contemporary French CVs. Marital status and photographs are omitted.
      </P>
      <KeyTakeaway>The French CV prioritizes professional narrative, educational credentials, and career positioning over the metric-driven achievement statements dominant in Anglo-American markets. The narrative professional summary is the element most commonly missing in international applications to French companies.</KeyTakeaway>

      <H2 id="canada">Canada: Close to US, with Distinct Differences</H2>
      <P>
        Canadian resume conventions are the closest of any major market to the US standard, with three specific differences that are worth understanding before submitting applications to Canadian companies.
      </P>
      <H3>Length: one to two pages</H3>
      <P>
        While US conventions strongly favor one page, Canadian hiring managers are more accepting of two pages for experienced candidates. A two-page resume is appropriate for candidates with more than five years of relevant experience. The content standard remains the same: achievement-focused bullets, no personal information, no photographs.
      </P>
      <H3>Canadian English</H3>
      <P>
        Canadian English blends British and American conventions in ways that can be inconsistent for non-native speakers. Color and colour are both used; the former is more common in informal Canadian English, the latter in formal contexts. Programme appears in formal and institutional contexts; program appears in technology and computing contexts. The safest approach for international candidates is to follow the spelling conventions used in the job posting itself.
      </P>
      <H3>References: &quot;available upon request&quot;</H3>
      <P>
        Ending a Canadian resume with &quot;References available upon request&quot; is standard practice. Canadian companies request references separately, at a later stage in the process, but indicating availability is a professional convention that experienced Canadian hiring managers expect to see. This phrase is absent from US resumes in contemporary practice but is maintained in Canadian ones.
      </P>
      <KeyTakeaway>Canadian resumes closely follow US conventions but allow two pages for experienced candidates, use Canadian English spelling conventions, and include a standard references line. For candidates with US-format materials, the Canadian adaptation is minimal.</KeyTakeaway>

      <H2 id="quick-reference">Quick Reference: Format Differences at a Glance</H2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-sky-50 dark:bg-sky-950/30">
              <th className="text-left p-3 border border-slate-200 dark:border-slate-700 font-semibold">Element</th>
              <th className="text-left p-3 border border-slate-200 dark:border-slate-700 font-semibold">USA</th>
              <th className="text-left p-3 border border-slate-200 dark:border-slate-700 font-semibold">UK</th>
              <th className="text-left p-3 border border-slate-200 dark:border-slate-700 font-semibold">Germany</th>
              <th className="text-left p-3 border border-slate-200 dark:border-slate-700 font-semibold">France</th>
              <th className="text-left p-3 border border-slate-200 dark:border-slate-700 font-semibold">Canada</th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-slate-50 dark:even:bg-slate-800/30">
              <td className="p-3 border border-slate-200 dark:border-slate-700">Length</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">1 page</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">2 pages</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">1–2 pages</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">1–2 pages</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">1–2 pages</td>
            </tr>
            <tr className="even:bg-slate-50 dark:even:bg-slate-800/30">
              <td className="p-3 border border-slate-200 dark:border-slate-700">Photo</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 font-medium">Never</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 font-medium">Never</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-green-700 font-medium">Required</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 font-medium">Omit</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 font-medium">Never</td>
            </tr>
            <tr className="even:bg-slate-50 dark:even:bg-slate-800/30">
              <td className="p-3 border border-slate-200 dark:border-slate-700">Personal info</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 font-medium">None</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 font-medium">None</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-green-700 font-medium">Full</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-amber-600 font-medium">Minimal</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-red-600 font-medium">None</td>
            </tr>
            <tr className="even:bg-slate-50 dark:even:bg-slate-800/30">
              <td className="p-3 border border-slate-200 dark:border-slate-700">Date format</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">MM/YYYY</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Month YYYY</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Month YYYY</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Month YYYY</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">MM/YYYY</td>
            </tr>
            <tr className="even:bg-slate-50 dark:even:bg-slate-800/30">
              <td className="p-3 border border-slate-200 dark:border-slate-700">Cover letter</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Optional</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Optional</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-green-700 font-medium">Required</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700 text-green-700 font-medium">Required</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Optional</td>
            </tr>
            <tr className="even:bg-slate-50 dark:even:bg-slate-800/30">
              <td className="p-3 border border-slate-200 dark:border-slate-700">Content focus</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Achievements</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Achievements</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Credentials</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Narrative</td>
              <td className="p-3 border border-slate-200 dark:border-slate-700">Achievements</td>
            </tr>
          </tbody>
        </table>
      </div>

      <FAQ items={[
        {
          q: 'Can I use one resume template for all international applications?',
          a: 'No. The format differences between markets are substantive enough that a single-template approach will be suboptimal in every market. The minimum viable set for international job seekers targeting multiple markets is a US/Canada version, a UK version, a German Lebenslauf, and a French CV. Creating these four versions once, maintaining them, and selecting the appropriate version for each application is more efficient than attempting to create a universal document that meets no market&apos;s standards fully.'
        },
        {
          q: 'How do I handle a professional photo if I am applying to both Germany (photo required) and the US (photo forbidden)?',
          a: 'Maintain separate document versions by market. The German Lebenslauf includes the Bewerbungsfoto; the US resume does not. This is the correct and expected approach, not a workaround. The documents are fundamentally different, and maintaining separate versions is standard practice for candidates applying across multiple international markets.'
        },
        {
          q: 'What should I do with titles or certifications that do not translate directly between markets?',
          a: 'Translate them to the equivalent recognized in the target market and include the original in parentheses if it is a formal credential with legal significance (a medical license, an engineering certification, a bar qualification). For role titles, use the standard title in the target market. For credentials, use the most widely recognized equivalent and note the original if context is useful.'
        },
        {
          q: 'How important is the language of the resume document itself?',
          a: 'If the job posting is in English, an English resume is appropriate for any market. If the posting is in German, a German Lebenslauf in German is expected; if your German is not at a professional writing level, submitting in English with a note acknowledging this is preferable to submitting poor German. For France, if the posting is in French, a French CV in French is strongly preferred; if in English, English is appropriate. The posting language is the most reliable guide.'
        },
        {
          q: 'Does resume format matter as much for senior roles as for entry-level ones?',
          a: 'Format signals matter at every level, but the weight shifts. For senior roles, the initial format filter is applied quickly, but executive recruiters spend more time on content evaluation than for junior roles. A senior candidate with clearly exceptional experience may advance past an imperfect format; a mid-level candidate with a format-mismatched document will typically not. The safe approach is always to invest in format compliance regardless of seniority level.'
        },
      ]} />

      <Conclusion>
        <P>
          Resume format is the first qualification assessed in every international hiring process. Before any recruiter evaluates technical skills, domain experience, or cultural fit, they assess whether the document in their hands belongs in the process it was submitted to. International candidates who invest in understanding and applying the format conventions of each target market clear this assessment in seconds and allow their qualifications to be evaluated on their actual merits. Those who submit format-mismatched documents create a negative initial impression that rarely recovers, regardless of how strong the underlying profile is.
        </P>
        <P>
          JobConnect AI&apos;s resume builder generates market-calibrated documents for the US, UK, Germany, France, and Canada, applying the correct conventions for each market automatically. For international candidates managing applications across multiple markets, this removes the most time-consuming and error-prone element of the multi-market job search.
        </P>
      </Conclusion>

    </article>
  )
}
