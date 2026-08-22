export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <p className="lead text-lg text-slate-600 dark:text-slate-300 font-normal not-prose mb-8">
        Most large companies and many mid-size ones use Applicant Tracking Systems (ATS) to handle the volume of applications they receive. These systems parse, score, and rank resumes before a human reviewer sees them — and they were built primarily for domestic candidates. International applicants fail at the ATS stage at a disproportionately high rate, often for reasons that have nothing to do with their qualifications. Here&apos;s how to stop losing before the game starts.
      </p>

      <h2>How ATS Systems Actually Work</h2>
      <p>
        An ATS is, at its core, a database and a search engine. When you submit your resume:
      </p>
      <ol>
        <li><strong>Parsing:</strong> The ATS attempts to extract structured data from your document — name, contact info, work history, skills, education. This is where formatting problems create immediate failures.</li>
        <li><strong>Keyword matching:</strong> The system compares your extracted data against the job description&apos;s keywords. Resumes that contain more exact keyword matches score higher.</li>
        <li><strong>Ranking:</strong> Candidates are ranked by score. Recruiters typically start reviewing from the top — many never reach page 2 or 3 of results.</li>
        <li><strong>Filtering:</strong> Some ATS configurations apply hard filters (work authorization, minimum years of experience, required certifications) before ranking. Failing a hard filter means your resume is automatically archived.</li>
      </ol>
      <p>
        The major ATS platforms in use: Greenhouse (dominant in US tech startups), Lever (common in growth-stage companies), Workday (enterprise), iCIMS (large enterprises and staffing firms), Taleo (older enterprises), Ashby (newer, more common at funded startups). Each parses documents differently, which means a resume optimized for one may fail on another.
      </p>

      <h2>Why International Candidates Fail ATS More Often</h2>
      <p>
        ATS systems were built around the dominant user base: domestic candidates applying to domestic roles. International candidates trigger several failure modes that domestic candidates almost never encounter.
      </p>

      <h3>Non-Standard Date Formats</h3>
      <p>
        This is the most common, least understood failure point. US ATS systems are built to parse dates in MM/DD/YYYY format or &quot;Month YYYY&quot; format. Many international candidates use DD/MM/YYYY (standard in the UK, Europe, Australia) or write months as numbers in their native order.
      </p>
      <p>
        The result: &quot;09/2022 – 05/2023&quot; might be parsed as September 2022 – May 2023 (correct) or as month 9 through month 5 (a negative duration that confuses scoring algorithms) or as completely unparseable.
      </p>
      <p>
        <strong>Fix:</strong> Always write dates as &quot;Month YYYY&quot; in full — &quot;September 2022 – May 2023&quot;. Unambiguous to any parser.
      </p>

      <h3>Two-Column Layouts</h3>
      <p>
        Two-column resume layouts are popular because they look clean and pack more information efficiently. Unfortunately, most ATS parsers read documents top-to-bottom, left-to-right — not column by column. A two-column resume is often parsed as a garbled stream of interleaved text from both columns simultaneously.
      </p>
      <p>
        This means your Skills section content gets mixed with your Work Experience content, creating nonsense entries that score zero on keyword matching and confuse the AI experience-extraction algorithms.
      </p>
      <p>
        <strong>Fix:</strong> Use a single-column layout for any resume you submit through an online application portal. Two-column designs are fine for emailed PDFs or portfolios, but not for ATS submissions.
      </p>

      <h3>Tables and Text Boxes</h3>
      <p>
        Tables are a clean way to display skills, language proficiency, or comparison data visually. Inside a resume, they&apos;re an ATS parsing disaster. Most parsers either skip table contents entirely or extract the text in an order that makes no semantic sense.
      </p>
      <p>
        Similarly, text boxes in Word documents are often not parsed at all. Any content inside a text box — contact information, a summary section, skills — may be completely invisible to the ATS.
      </p>
      <p>
        <strong>Fix:</strong> Replace all tables with simple bullet lists. Replace text boxes with standard paragraph or heading styles. If in doubt, paste your resume text into a plain text editor and verify it reads sensibly.
      </p>

      <h3>Headers and Footers</h3>
      <p>
        Many candidates put their contact information in the document header (name, phone, email) to keep it visible across multiple pages. ATS systems frequently cannot read content from Word or PDF headers and footers — the content is parsed as metadata rather than body text.
      </p>
      <p>
        The result: the ATS extracts your resume text but cannot find your contact information, because it wasn&apos;t in the parseable body. Your name may be missing from the candidate record entirely.
      </p>
      <p>
        <strong>Fix:</strong> Put all contact information in the document body — the main text area of the first page. Never use document headers for critical information.
      </p>

      <h3>Non-US University Names Without Context</h3>
      <p>
        An ATS trained primarily on domestic applications recognizes Harvard, MIT, Stanford, and their peers. It may have metadata associating &quot;MIT&quot; with &quot;Massachusetts Institute of Technology&quot; and its reputation.
      </p>
      <p>
        It does not have trained associations for the University of Lagos, Faculdade de Direito da Universidade de São Paulo, or Seoul National University — even though these are highly ranked institutions. The ATS extracts the name but cannot score its prestige, leaving your educational credentials effectively neutral when they should be positive.
      </p>
      <p>
        <strong>Fix:</strong> Add context to your university: &quot;University of Lagos (ranked Top 5 in Nigeria, engineering faculty) — B.Sc. Computer Science, First Class Honours.&quot; You&apos;re not embellishing — you&apos;re providing context the system needs to score you fairly.
      </p>

      <h3>Missing Work Authorization Statement</h3>
      <p>
        Many ATS systems include a work authorization field in the job application form — separate from your resume. But some rely on parsing your resume or cover letter to determine authorization status. For international candidates, the absence of any authorization statement can trigger an automatic flag.
      </p>
      <p>
        More importantly: if the ATS applies a hard filter for &quot;authorized to work in [country]&quot; and your resume doesn&apos;t address this, you may be filtered out before scoring even begins.
      </p>
      <p>
        <strong>Fix:</strong> Include a clear, brief authorization statement near your contact information or in your summary. Examples:
      </p>
      <ul>
        <li>&quot;Available as an independent contractor — no work authorization required&quot;</li>
        <li>&quot;EU citizen — authorized to work across the EU/EEA without sponsorship&quot;</li>
        <li>&quot;Currently seeking Skilled Worker Visa sponsorship — available immediately upon authorization&quot;</li>
      </ul>

      <h2>The Keyword Matching Problem</h2>
      <p>
        ATS keyword matching is more literal than most candidates realize. The system doesn&apos;t understand synonyms by default. &quot;Machine Learning&quot; and &quot;ML&quot; may be treated as different keywords. &quot;React&quot; and &quot;React.js&quot; may or may not match, depending on the ATS configuration.
      </p>
      <p>
        For international candidates, this creates a specific problem: you may use technically correct terminology from your home market that doesn&apos;t match the US/UK terminology used in the job description. Examples:
      </p>
      <ul>
        <li>&quot;CRM&quot; vs &quot;Salesforce CRM&quot; — the generic abbreviation may not match if the job description specifies the tool</li>
        <li>&quot;Agile methodology&quot; vs &quot;Scrum&quot; — if the posting says Scrum, the ATS likely scores for Scrum, not a paraphrase</li>
        <li>Industry-specific terminology that varies by region (UK &quot;solicitor&quot; vs US &quot;attorney,&quot; for example)</li>
      </ul>
      <p>
        <strong>Fix:</strong> Mirror the exact language used in the job description. If the posting says &quot;React.js,&quot; write &quot;React.js&quot; — not &quot;React,&quot; not &quot;ReactJS.&quot; Read the job description and paste the exact skill names you possess.
      </p>

      <h2>Format Checklist Before Submitting Any ATS Application</h2>
      <ul>
        <li>☐ Single-column layout</li>
        <li>☐ No tables, no text boxes</li>
        <li>☐ No headers or footers for important content</li>
        <li>☐ Dates written as &quot;Month YYYY&quot; in full</li>
        <li>☐ University name includes ranking context or country</li>
        <li>☐ Work authorization status stated clearly</li>
        <li>☐ Keywords match job description exactly</li>
        <li>☐ File format: .docx (best) or simple, non-complex PDF</li>
        <li>☐ Test: paste resume into Notepad/TextEdit — does it read correctly?</li>
      </ul>
      <p>
        JobConnect AI&apos;s resume builder generates ATS-optimized documents in single-column format with correct date parsing, keyword extraction from the job description, and automatic work authorization statement insertion. You can also paste any job description and the builder will highlight which keywords you&apos;re missing from your current resume.
      </p>

    </article>
  )
}
