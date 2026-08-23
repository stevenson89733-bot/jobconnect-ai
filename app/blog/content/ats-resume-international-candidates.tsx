import { H2, H3, P, KeyTakeaway, Quote, TOC, FAQ, StatHook, Conclusion } from '@/components/blog/ArticleComponents'

export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <StatHook>Over 99% of Fortune 500 companies use Applicant Tracking Systems to screen resumes — and international candidates face an additional set of ATS failure modes that domestic candidates rarely encounter.</StatHook>

      <TOC items={[
        { id: 'what-is-ats', label: 'How ATS Systems Actually Work' },
        { id: 'international-failure-modes', label: 'ATS Failure Modes Specific to International Candidates' },
        { id: 'keyword-optimization', label: 'Keyword Optimization Without Keyword Stuffing' },
        { id: 'format-compliance', label: 'Format Compliance: What ATS Systems Can and Cannot Parse' },
        { id: 'by-market', label: 'ATS Expectations by Target Market' },
        { id: 'testing', label: 'Testing Your Resume Before You Apply' },
        { id: 'human-reviewer', label: 'What Happens When a Human Finally Reads It' },
      ]} />

      <P drop>
        International candidates who submit well-written, carefully tailored resumes to US and European companies frequently receive no response. The most common explanation is not that their qualifications were rejected by a human recruiter; it is that their resume never reached one. Applicant Tracking Systems, the software platforms used by the overwhelming majority of mid-size and large companies to manage hiring processes, parse incoming resumes before any human review occurs, and they do so according to rules that have specific implications for the format and content conventions common outside North America and the UK.
      </P>
      <P>
        A data scientist based in São Paulo applied to a US Series B company with a resume that, by any reasonable professional standard, was well-prepared. It was organized, clearly written, and accurately represented a strong background. The resume was formatted in a design-forward two-column layout common in Latin American professional markets, included a professional profile photo standard in Brazil, and used skill proficiency bars — graphical representations of skill levels — that are common in European resume templates. The ATS rejected it before any human saw it, not because the qualifications were insufficient, but because two-column layouts disrupt ATS parsing, photos appear as unreadable image data, and skill proficiency bars are visually encoded information that ATS systems cannot interpret as text.
      </P>
      <P>
        This guide covers ATS systems comprehensively for international candidates: how they work, the specific failure modes that disproportionately affect candidates from non-US markets, how to optimize keywords without compromising the document&apos;s human readability, and how to verify ATS compliance before submitting any application.
      </P>

      <H2 id="what-is-ats">How ATS Systems Actually Work</H2>
      <P>
        An Applicant Tracking System is a software platform that manages the entire hiring pipeline: job posting, application collection, candidate communication, interview scheduling, and offer management. The parsing and screening function, the part most directly relevant to resume optimization, works by extracting text from submitted documents, organizing that text into structured data fields (name, contact information, work experience, education, skills), and then scoring the resulting record against criteria the recruiter or hiring manager has configured for the role.
      </P>
      <P>
        The scoring mechanism varies by system but generally involves keyword matching (does the resume contain the specific terms from the job description?), field presence (does the resume include all the standard sections the ATS expects?), and in more sophisticated systems, contextual analysis that attempts to infer the relevance of experience to the stated role. A resume that scores above a configured threshold is surfaced for human review; one that scores below it is archived without review.
      </P>
      <P>
        The most widely used ATS platforms in the US and UK are Greenhouse, Lever, Workday, iCIMS, SAP SuccessFactors, Oracle Taleo, and SmartRecruiters. Each has different parsing capabilities, different keyword scoring algorithms, and different tolerance for non-standard formatting. The common characteristic across all of them is that they were designed to parse resumes formatted according to North American and UK professional conventions, and they perform poorly on documents that deviate significantly from those conventions.
      </P>
      <KeyTakeaway>ATS systems parse resumes into structured data before any human sees the document. A resume that fails ATS parsing is not reviewed, regardless of the quality of its content. Understanding what causes parsing failure is the first step to ensuring qualified applications actually reach human reviewers.</KeyTakeaway>

      <H2 id="international-failure-modes">ATS Failure Modes Specific to International Candidates</H2>
      <P>
        International candidates face a specific set of ATS failure modes that domestic candidates rarely encounter, because the resume conventions common in many countries outside North America and the UK include elements that are technically incompatible with ATS parsing.
      </P>
      <H3>Multi-column layouts</H3>
      <P>
        Two-column resume layouts are visually appealing, space-efficient, and common in European, Latin American, and Asian resume templates. They are also one of the most reliable causes of ATS parsing failure. ATS systems parse text in left-to-right, top-to-bottom order across the full document width. A two-column layout causes the ATS to read across both columns simultaneously, producing nonsensical text strings that cannot be mapped to structured data fields. A work experience entry in the left column and a skill entry in the right column are read as a single garbled line rather than two separate structured elements.
      </P>
      <H3>Photographs and graphics</H3>
      <P>
        Professional photographs, graphical skill bars, and design elements embedded in PDF resumes appear to ATS systems as image data rather than text. They add no value to ATS parsing and consume document space that could otherwise be occupied by keyword-rich text. In the context of ATS optimization, a professional photo is not merely irrelevant; it is a mild negative, because the space it occupies could contain text content that would improve parsing and scoring.
      </P>
      <H3>Non-standard section headers</H3>
      <P>
        ATS systems identify document sections by recognizing standard header strings: &quot;Work Experience,&quot; &quot;Professional Experience,&quot; &quot;Education,&quot; &quot;Skills,&quot; &quot;Summary.&quot; Non-standard headers, common in internationally templated resumes, disrupt this mapping. A section labeled &quot;Professional Background&quot; may parse correctly or may be miscategorized as miscellaneous text, causing the work history to be excluded from the structured work experience field the recruiter&apos;s scoring criteria is checking.
      </P>
      <H3>Date formats outside the target market convention</H3>
      <P>
        ATS systems have locale-specific date parsing built in. A resume using European date conventions (DD/MM/YYYY) submitted to a US ATS may have employment dates parsed incorrectly, causing experience duration calculations to be wrong or the dates to be rejected entirely as unrecognized format strings. Using the date convention of the target market (MM/YYYY for most US ATS systems) is a small adjustment with meaningful impact.
      </P>
      <H3>Non-standard file formats</H3>
      <P>
        PDF and .docx are the only file formats reliably parseable by all major ATS systems. .Pages (Apple Pages format), .odt (LibreOffice), and creative formats like Canva exports are frequently either rejected outright or parsed with significant errors. Unless a posting specifically requests a different format, always submit in standard PDF or .docx.
      </P>
      <KeyTakeaway>The five ATS failure modes most common among international candidates are multi-column layouts, embedded photos, non-standard section headers, incorrect date formats, and non-standard file types. Eliminating all five from a resume before submission costs nothing and removes the most common barriers to human review.</KeyTakeaway>

      <H2 id="keyword-optimization">Keyword Optimization Without Keyword Stuffing</H2>
      <P>
        Keyword optimization is the practice of ensuring that a resume contains the specific terms and phrases that the ATS scoring algorithm is looking for, without reducing the document to an unreadable list of terms that fails the human review that follows ATS screening.
      </P>
      <H3>How to identify the right keywords</H3>
      <P>
        The job description is the primary source. Read it carefully and identify the specific nouns and noun phrases that appear multiple times or that appear to be central to the role: programming languages, frameworks, tools, methodologies, role titles, and domain concepts. The distinction between &quot;machine learning&quot; and &quot;ML&quot; matters: some ATS systems recognize abbreviations; others do not. Use both versions once each to cover both cases. Avoid substituting synonyms for the exact terms used in the posting. If the posting says &quot;React,&quot; use &quot;React,&quot; not &quot;front-end framework&quot; or &quot;JavaScript UI library.&quot; The ATS is matching strings, not concepts.
      </P>
      <H3>Where to place keywords</H3>
      <P>
        Keywords should appear in context, not in lists. A skills section listing &quot;Python, TensorFlow, SQL, Spark, Docker, Kubernetes&quot; is parseable by ATS and useful for initial screening, but it does not survive human review if the same terms do not appear in relevant experience descriptions. The most effective keyword placement is in the description of roles where those skills were actually applied, structured as: skill used, in what context, with what result. This passes ATS screening and gives the human reviewer the evidence they need.
      </P>
      <H3>International terminology mapping</H3>
      <P>
        International candidates sometimes use role titles or methodologies known by different names in their home market. A &quot;Responsable Technique&quot; (French) should be translated to &quot;Technical Lead&quot; or &quot;Engineering Manager&quot; depending on scope. An &quot;Informatiker&quot; (German) should be rendered as &quot;Software Engineer.&quot; &quot;Agile&quot; and &quot;Scrum&quot; are the same concepts regardless of market, but &quot;Extreme Programming&quot; and &quot;XP&quot; may not be recognized as equivalent in all ATS contexts. When in doubt, include both the home-market term and the target-market equivalent.
      </P>
      <KeyTakeaway>Effective ATS keyword optimization means placing target-market terminology exactly as it appears in the job description, within contextual descriptions of actual experience, not in isolated lists. International terminology must be mapped to target-market equivalents before submission.</KeyTakeaway>

      <H2 id="format-compliance">Format Compliance: What ATS Systems Can and Cannot Parse</H2>
      <P>
        A compliant ATS resume looks, to the human eye, like a clean, professional document. It does not look like an optimized document; it simply is one. The structural requirements are straightforward.
      </P>
      <P>
        Use a single-column layout. Use standard, widely available fonts (Arial, Calibri, Helvetica, Times New Roman, Georgia). Use standard section headers, with the exact wording that the target market&apos;s ATS systems are calibrated to recognize: Work Experience or Professional Experience, Education, Skills, and Summary or Professional Summary. Use dates in the target market format. Submit as PDF unless .docx is specifically requested, and generate the PDF from a word processing application (not from Canva, Google Slides, or design tools), as design-tool PDFs frequently have text encoded as paths rather than selectable characters, which ATS systems cannot parse.
      </P>
      <P>
        Tables, text boxes, headers, and footers in Word documents frequently cause parsing errors. Content placed in a text box or document header is often ignored entirely by ATS systems, which is particularly damaging if contact information is placed there. All content should be in the main document body, not in headers, footers, text boxes, or tables.
      </P>
      <KeyTakeaway>ATS format compliance requires a single column, standard fonts, standard section headers, market-appropriate date formats, and main-body placement for all content. These requirements eliminate the visual design elements that many international resume templates rely on but that ATS systems cannot parse.</KeyTakeaway>

      <H2 id="by-market">ATS Expectations by Target Market</H2>
      <P>
        ATS adoption varies by country and by company type within countries. Understanding the landscape in the target market prevents over-optimization for ATS in contexts where human review is the primary filter.
      </P>
      <H3>United States</H3>
      <P>
        ATS adoption in the US is the highest in the world. A 2023 survey found that 99% of Fortune 500 companies and 75% of companies with 100 or more employees use an ATS. For companies at this scale, ATS optimization is not optional. Smaller US companies (fewer than 50 employees) are less likely to have formal ATS infrastructure, though many use the ATS functionality built into LinkedIn and Indeed. The safe assumption for any US company application is that ATS optimization is required.
      </P>
      <H3>United Kingdom</H3>
      <P>
        ATS adoption in the UK follows the US pattern at large companies. UK-specific ATS considerations include British English spelling (which ATS systems calibrated to UK postings may penalize American spelling) and the standard two-page UK CV length. The same structural requirements apply: single column, standard headers, no photos, no graphics.
      </P>
      <H3>Germany, France, the Netherlands</H3>
      <P>
        ATS adoption in continental Europe is lower than in the US or UK, with many companies, particularly Mittelstand businesses, still using manual CV review as the primary screening tool. However, the large German and French companies that most commonly hire internationally (Zalando, SAP, BNP Paribas, Société Générale) all use enterprise ATS platforms. For these companies, ATS optimization is relevant. For smaller European companies, human-readable documents may be evaluated first, making format compliance less critical than content quality and market convention adaptation.
      </P>
      <KeyTakeaway>ATS optimization is essential for US company applications and important for large European companies. For smaller European companies and many Asian markets, human review is the primary filter, and market convention adaptation (Lebenslauf format in Germany, lettre de motivation in France) outweighs ATS structural optimization.</KeyTakeaway>

      <H2 id="testing">Testing Your Resume Before You Apply</H2>
      <P>
        Several practical tools allow candidates to assess ATS compliance and keyword optimization before submitting an application, at no cost.
      </P>
      <P>
        Jobscan.co parses a submitted resume and a target job description and produces a match score along with a detailed breakdown of keyword presence, missing terms, and format compliance issues. It identifies the specific keywords in the job description that are absent from the resume and flags formatting elements that will cause parsing errors. Resumeworded.com provides a similar scoring and analysis function with additional guidance on content improvements. For format-specific testing, opening a PDF resume in a plain text editor and reading the extracted text as a single linear document reveals exactly how an ATS will parse it: formatting errors appear as gibberish, text from two-column layouts merges into incoherent strings, and content in text boxes simply disappears.
      </P>
      <KeyTakeaway>Testing a resume with Jobscan or Resumeworded before submitting applications takes less than ten minutes and reliably surfaces the keyword gaps and format compliance issues that cause qualified applications to fail ATS screening before any human reviews them.</KeyTakeaway>

      <H2 id="human-reviewer">What Happens When a Human Finally Reads It</H2>
      <P>
        Passing ATS screening is necessary but not sufficient. The document that emerges from ATS optimization must still persuade a human recruiter to advance the candidate to the interview stage. The good news is that ATS compliance requirements and human readability requirements are generally compatible; the formatting that is most parseable by ATS systems (clean single column, clear section headers, no unnecessary graphics) is also among the most readable for human reviewers.
      </P>
      <P>
        The six-second test is a useful mental model: studies of recruiter eye-tracking consistently find that the initial human review of a resume takes approximately six seconds and focuses on name, current role, most recent employer, tenure duration, and education. The information that survives this scan determines whether a recruiter reads further. International candidates whose most recent role title and employer name do not immediately communicate the relevant professional identity often lose the initial scan even when their qualifications are exactly right. Translating role titles to target-market equivalents, as described in the keyword optimization section, addresses this at the human review stage as directly as at the ATS stage.
      </P>
      <KeyTakeaway>Human reviewers spend approximately six seconds on an initial resume scan. The critical information that survives this scan is role title, employer name, tenure, and education. International role titles and employer names that require interpretation are a liability in this scan; target-market equivalents are an asset.</KeyTakeaway>

      <FAQ items={[
        {
          q: 'Does using PDF or Word matter for ATS submission?',
          a: 'Both PDF and .docx are reliably parsed by major ATS systems, provided the PDF is not an image-based PDF or generated from a design tool. If the posting specifies a preference, follow it. If it does not, PDF generated from Word, Google Docs, or a similar word processor is the safest default, as it preserves formatting consistently across platforms.'
        },
        {
          q: 'Should I create different resume versions for different markets?',
          a: 'Yes. A US-market resume (one page, no personal info, achievement-focused), a UK-market CV (two pages, professional summary, achievement-focused, British English), a German Lebenslauf (two pages, personal info, professional photo, formal structure), and a French CV (one to two pages, narrative, no photo in contemporary practice) are distinct enough to warrant separate document versions. Using one document across all markets means none of them will be optimal for the specific market&apos;s conventions and ATS calibrations.'
        },
        {
          q: 'Do ATS systems penalize non-native English writing?',
          a: 'Modern ATS systems do not apply natural language quality scoring; they match strings. Grammatical errors and non-native phrasing do not directly affect ATS scoring. However, they matter significantly when a human reviewer reads the document, particularly in markets like Germany and France where written language precision is a professional standard. Proofreading by a native speaker of the target language before submission is time well invested.'
        },
        {
          q: 'Can I include a creative portfolio link instead of a traditional resume?',
          a: 'A portfolio link can be included as a URL in the standard resume document. It should not replace the traditional resume in any ATS-heavy market. The resume is the document the ATS parses and the recruiter reviews; the portfolio is supplementary material that a recruiter may or may not access. Always submit a compliant ATS resume as the primary document, with portfolio, GitHub, or personal site links as supplementary references.'
        },
        {
          q: 'How do I handle a career gap on an ATS-optimized resume?',
          a: 'Address career gaps in the work experience section by including the period explicitly with a label: "Career Break (Parenting leave)", "Independent Consulting (2022-2023)", or similar. ATS systems do not penalize gaps directly; they parse dates and infer experience duration. Human reviewers do notice unexplained gaps. Labeling gaps proactively removes the negative inference a human reviewer would otherwise draw and demonstrates the confidence and transparency that professional self-presentation requires.'
        },
      ]} />

      <Conclusion>
        <P>
          ATS optimization is not a game to be gamed; it is a set of formatting and content standards that reflect how major employers have structured their hiring processes. International candidates who understand these standards and apply them systematically to each market they target eliminate one of the most common and least obvious barriers between qualified applications and human review. The adjustments required are not radical: a single-column layout, standard section headers, market-appropriate dates, no photos or graphics, and keyword language drawn directly from the job description. Applied consistently across every application, these practices ensure that the effort invested in every resume, cover letter, and job search activity actually reaches a recruiter who can evaluate it.
        </P>
        <P>
          JobConnect AI&apos;s resume builder generates ATS-compliant documents pre-calibrated to the specific conventions of the target market, whether the destination is a US startup, a UK financial services company, or a German Mittelstand. For international candidates who cannot afford to have qualified applications filtered out by a system that never reads the content, the starting point matters.
        </P>
      </Conclusion>

    </article>
  )
}
