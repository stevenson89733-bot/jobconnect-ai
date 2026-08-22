export default function ArticleContent() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:leading-relaxed">

      <p className="lead text-lg text-slate-600 dark:text-slate-300 font-normal not-prose mb-8">
        The format of your resume or CV is not universal. A US hiring manager expects a 1-page achievement-driven document with no personal information. A German recruiter expects a 2-page Lebenslauf with a professional photo and your date of birth. A French recruiter is legally discouraged from seeing your photo at all. Getting this wrong doesn&apos;t just hurt your chances — it signals you haven&apos;t done the basic research that careful candidates do.
      </p>

      <h2>Quick Comparison Table</h2>

      <div className="not-prose overflow-x-auto mb-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Feature</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">🇺🇸 US</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">🇬🇧 UK</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">🇩🇪 Germany</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">🇫🇷 France</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">🇨🇦 Canada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {[
              ['Document name', 'Resume', 'CV', 'Lebenslauf', 'CV', 'Resume'],
              ['Ideal length', '1 page', '2 pages', '1–2 pages', '1–2 pages', '1–2 pages'],
              ['Photo', '❌ Never', '❌ Never', '✅ Required', '❌ Discouraged (law)', '❌ Not standard'],
              ['Date of birth', '❌ Never', '❌ Never', '✅ Expected', '✅ Common', '❌ Not standard'],
              ['Cover letter', 'Optional', 'Expected', 'Required', 'Required', 'Optional'],
              ['Personal info', 'Name + contact only', 'Name + contact only', 'Full personal header', 'Moderate', 'Name + contact only'],
              ['Tone', 'Achievement-driven', 'Achievement-driven', 'Formal, complete', 'Formal', 'Collaborative'],
              ['ATS critical?', '✅ Very', '✅ Moderate', 'Moderate', 'Low', '✅ Moderate'],
              ['Spelling', 'US English', 'British English', 'German or English', 'French or English', 'US/Canadian English'],
            ].map(([feat, ...vals], i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-900/50'}>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{feat}</td>
                {vals.map((v, j) => (
                  <td key={j} className="px-4 py-3 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>🇺🇸 United States: The Achievement Machine</h2>
      <p>
        The US resume is the most ATS-driven document in the world. With thousands of applications per role at top tech companies, your resume must pass automated screening before a human ever reads it.
      </p>
      <h3>What US hiring managers expect</h3>
      <ul>
        <li><strong>1 page for under 10 years of experience.</strong> 2 pages is acceptable for senior engineers and executives. A 3-page resume from an early-career candidate signals poor judgment about what to include.</li>
        <li><strong>Quantified achievements, not job duties.</strong> Every bullet point should ideally contain a number. &quot;Reduced deployment time by 60%&quot; beats &quot;Responsible for CI/CD pipelines.&quot;</li>
        <li><strong>Keywords from the job description.</strong> ATS systems (Greenhouse, Lever, Workday) scan for exact keyword matches. If the job posting says &quot;Python&quot;, don&apos;t assume &quot;programming experience&quot; will match.</li>
        <li><strong>No personal information whatsoever.</strong> No age, nationality, marital status, or photo. US employment law makes these red flags, not qualifications.</li>
        <li><strong>Clean, single-column layout.</strong> Two-column resumes often break ATS parsing. Stick to a clean, single-column format with consistent heading styles.</li>
      </ul>

      <h2>🇬🇧 United Kingdom: The CV Standard</h2>
      <p>
        In the UK, it&apos;s always a CV — never a resume. The document is typically 2 pages for experienced candidates, and the emphasis is on achievements with clear professional narrative.
      </p>
      <h3>What UK hiring managers expect</h3>
      <ul>
        <li><strong>2 pages is the norm</strong> for anyone with more than 3 years of experience. A 1-page CV signals junior or underqualified.</li>
        <li><strong>No personal information.</strong> The Equality Act 2010 means UK recruiters are trained to ignore age, nationality, marital status, and religion. Including these is not just unusual — it can trigger bias-mitigation protocols.</li>
        <li><strong>British English throughout.</strong> Optimise, colour, centre, programme. Submitting a US-English CV to a London company signals lack of attention to detail.</li>
        <li><strong>Personal profile at the top.</strong> Most UK CVs open with a 3–4 sentence personal profile summarizing who you are and what you offer. This is a standard expectation that US resumes don&apos;t use.</li>
        <li><strong>Achievement-focused bullet points,</strong> but with slightly more narrative context than US resumes. UK culture values both results and the story behind them.</li>
      </ul>

      <h2>🇩🇪 Germany: The Lebenslauf</h2>
      <p>
        Germany&apos;s application culture is the most structured of any major job market. A German Lebenslauf is not just a document — it&apos;s a standardized format that German recruiters evaluate on formal criteria.
      </p>
      <h3>What German hiring managers expect</h3>
      <ul>
        <li><strong>Professional photo (Bewerbungsfoto)</strong> in the top right corner. Studio quality or professional-grade headshot. No exceptions for professional roles.</li>
        <li><strong>Personal data header:</strong> full name, date of birth, nationality, address, phone, email. This is standard practice, not discriminatory.</li>
        <li><strong>Exact employment dates:</strong> Month and year for every position. &quot;2019–2022&quot; is not acceptable — &quot;April 2019 – September 2022&quot; is correct.</li>
        <li><strong>Formal Anschreiben (cover letter)</strong> in addition to the Lebenslauf. One page, formal salutation, specific reasoning for choosing this company.</li>
        <li><strong>Language certifications</strong> with CEFR levels (A1–C2). German language skills — even basic — are a significant differentiator for international candidates.</li>
      </ul>

      <h2>🇫🇷 France: Education-First, No Photo</h2>
      <p>
        France occupies an interesting middle ground: more formal than the UK, less rigid than Germany, and with unique legal restrictions around personal information.
      </p>
      <h3>What French hiring managers expect</h3>
      <ul>
        <li><strong>No photo.</strong> French law (Law 2001-1066) prohibits discrimination based on appearance, and since 2005 professional guidance strongly discourages photos. A photo on a French CV reads as unfamiliar with local norms.</li>
        <li><strong>Education leads for younger candidates.</strong> French culture highly values educational pedigree, particularly Grandes Écoles (Polytechnique, HEC, Sciences Po). List your degree prominently with the institution&apos;s full name.</li>
        <li><strong>Lettre de motivation.</strong> Mandatory for most French applications. It should explain your specific interest in the company — generic cover letters are immediately spotted and discarded.</li>
        <li><strong>1–2 page CV,</strong> clean layout, with sections labeled in French (Expériences Professionnelles, Formation, Compétences) for French-language companies or in English for international firms.</li>
        <li><strong>Languages section:</strong> List all languages with CECRL levels. French companies value multilingualism, and listing additional languages beyond English + French is a bonus.</li>
      </ul>

      <h2>🇨🇦 Canada: The Collaborative US</h2>
      <p>
        Canadian resume norms closely follow US conventions, with a few important differences in tone, length, and cultural expectations.
      </p>
      <h3>What Canadian hiring managers expect</h3>
      <ul>
        <li><strong>1–2 pages.</strong> Unlike the strict 1-page US norm, Canadian resumes of up to 2 pages are standard and acceptable for experienced candidates.</li>
        <li><strong>Collaborative tone.</strong> US-style aggressive language (&quot;dominated the market&quot;, &quot;crushed targets&quot;) can read as abrasive. Prefer collaborative framing: &quot;Led a team of 5 to deliver...&quot;, &quot;Partnered with product to launch...&quot;</li>
        <li><strong>No photo, no personal data.</strong> Canadian human rights legislation (Canadian Human Rights Act) mirrors US norms: no age, nationality, or photo.</li>
        <li><strong>Bilingual advantage in Quebec.</strong> For roles in Montreal or federal government positions, French proficiency is a significant differentiator. A bilingual CV (or parallel French version) is worth the investment for Quebec-based roles.</li>
        <li><strong>References available upon request</strong> — Canadian employers take reference checks seriously. Have 2–3 professional references ready with current contact details.</li>
      </ul>

      <h2>The Practical Takeaway: Adapt Before You Apply</h2>
      <p>
        The most common mistake international candidates make is sending the same document everywhere. A US resume sent to a German company signals you haven&apos;t researched the market. A photo-included German Lebenslauf sent to a French company signals unfamiliarity with French law.
      </p>
      <p>
        JobConnect AI&apos;s country-specific resume builder generates the correct format automatically based on your target country — Lebenslauf for Germany, British CV for the UK, ATS-optimized resume for the US. Select your target market and the format adapts for you.
      </p>

    </article>
  )
}
