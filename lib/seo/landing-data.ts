export type LandingMarket = {
  slug: string
  countryCode: string
  countryName: string
  flag: string
  title: string
  metaDescription: string
  h1: string
  heroTagline: string
  heroBody: string
  whyTitle: string
  whyPoints: { icon: string; heading: string; body: string }[]
  diffTitle: string
  diffPoints: { heading: string; body: string }[]
  toolsTitle: string
  tools: { name: string; description: string }[]
  ctaText: string
  ctaHref: string
  salaryRange: string
  topCities: string
  openGraph: { title: string; description: string }
}

export const LANDING_MARKETS: LandingMarket[] = [
  {
    slug:            'remote-jobs-germany',
    countryCode:     'DE',
    countryName:     'Germany',
    flag:            '🇩🇪',
    title:           'Remote Jobs in Germany for International Candidates | JobConnect AI',
    metaDescription: 'Find remote jobs in Germany open to international applicants. AI-powered resume builder adapted to the German Lebenslauf format. Apply from anywhere.',
    h1:              'Remote Jobs in Germany — Open to International Candidates',
    heroTagline:     'Europe\'s largest tech market is hiring remotely',
    heroBody:        'Germany hosts over 100,000 software engineering positions and is rapidly expanding its remote-work culture. Companies in Berlin, Munich, and Hamburg increasingly hire international talent — no German language required for many tech roles.',
    whyTitle:        'Why target Germany for your remote job search',
    whyPoints: [
      { icon: '💰', heading: 'Top-tier salaries', body: 'Senior software engineers earn €70K–€120K. Product managers and data engineers in Berlin command salaries competitive with London and Amsterdam.' },
      { icon: '🌍', heading: 'English-first tech companies', body: 'Startups, scale-ups, and international subsidiaries operate in English. N26, Zalando, Delivery Hero, and hundreds of funded startups hire globally.' },
      { icon: '🏛️', heading: 'Stability and worker protections', body: 'German labor law guarantees strong protections: 24+ paid vacation days, strict termination rules, and regulated working hours — even for remote employees.' },
      { icon: '🚀', heading: 'Booming startup ecosystem', body: 'Berlin is the #1 startup hub in continental Europe. Record venture capital investment means new remote positions open every week.' },
    ],
    diffTitle:       'What makes applying to German companies different',
    diffPoints: [
      { heading: 'The Lebenslauf format', body: 'German CVs follow a strict structure: personal details at the top (name, address, date of birth, nationality), work experience in reverse chronological order, and a mandatory professional photo (Bewerbungsfoto). Unlike the US or UK, omitting a photo signals a lack of preparation to many German recruiters.' },
      { heading: 'Professional photo expectations', body: 'Your Bewerbungsfoto should be a recent, professional headshot — studio quality if possible. Casual selfies or cropped group photos are red flags. This is standard practice and is not considered discriminatory in German hiring culture.' },
      { heading: 'The Anschreiben (cover letter)', body: 'A formal cover letter is expected, often more so than in English-speaking markets. It should be no longer than one page, address the hiring manager by name, and demonstrate knowledge of the company\'s market position. Formal salutation ("Sehr geehrte Damen und Herren") is standard for corporate applications.' },
      { heading: 'Precision and completeness', body: 'German applications value thoroughness. Include all relevant certifications, exact employment dates, and professional references. Gaps in employment history should be explained proactively. Vague descriptions of responsibilities will not pass screening.' },
    ],
    toolsTitle: 'JobConnect AI tools built for the German market',
    tools: [
      { name: 'Remote-Friendly Detector', description: 'Instantly scans job postings for German companies and flags whether they genuinely hire internationally or require EU work authorization.' },
      { name: 'Lebenslauf CV Builder', description: 'Our AI resume builder generates a German-format Lebenslauf with the correct section order, spacing, and professional language — ready to attach to your Bewerbung.' },
      { name: 'Germany Skill Gap Analyzer', description: 'Compare your profile against top German employer requirements. Identify which certifications (AWS, Azure, German B1) would strengthen your application.' },
    ],
    ctaText: 'Start your German job search',
    ctaHref: '/jobs?country=DE',
    salaryRange: '€60K – €120K',
    topCities: 'Berlin · Munich · Hamburg · Frankfurt',
    openGraph: {
      title:       'Remote Jobs in Germany for International Candidates',
      description: 'AI-powered job search for Germany. Lebenslauf builder, Remote-Friendly Detector, and curated international-friendly roles.',
    },
  },
  {
    slug:            'remote-jobs-france',
    countryCode:     'FR',
    countryName:     'France',
    flag:            '🇫🇷',
    title:           'Remote Jobs in France for International Candidates | JobConnect AI',
    metaDescription: 'Find remote jobs in France open to international applicants. AI-powered CV builder adapted to French standards. French not always required for tech roles.',
    h1:              'Remote Jobs in France — Open to International Candidates',
    heroTagline:     'Paris is Europe\'s fastest-growing tech hub — and it\'s hiring remotely',
    heroBody:        'France\'s tech scene has exploded over the past decade. Station F, Doctolib, BlaBlaCar, and hundreds of funded startups operate in English and recruit globally. Remote work laws passed in 2021 now make French companies far more open to international hires.',
    whyTitle:        'Why target France for your remote job search',
    whyPoints: [
      { icon: '🗼', heading: 'Station F and the Paris tech scene', body: 'France is home to the world\'s largest startup campus and a €4B+ annual VC market. English-first companies like Doctolib, Contentsquare, and Mirakl hire internationally.' },
      { icon: '⏱️', heading: '35-hour work week culture', body: 'French labor law caps working hours and mandates at minimum 5 weeks paid leave per year. Many international remote roles offer the same protections.' },
      { icon: '🌐', heading: 'English-speaking roles on the rise', body: 'Tech, product, and data roles at French startups and multinational subsidiaries are predominantly English-first. French language is a bonus, not always a prerequisite.' },
      { icon: '💶', heading: 'Competitive European salaries', body: 'Senior engineers in Paris earn €65K–€110K. Remote roles outside Paris often adjust to regional cost of living while retaining competitive pay.' },
    ],
    diffTitle:       'What makes applying to French companies different',
    diffPoints: [
      { heading: 'No photo on the CV (anti-discrimination law)', body: 'Unlike Germany, French law (since 2005) discourages photos on CVs to prevent discrimination. A French recruiter seeing a photo on your CV may view it as unfamiliar with local norms. Keep your CV photo-free.' },
      { heading: 'The Lettre de Motivation', body: 'A tailored cover letter is taken seriously. It should explain your interest in the specific company and role, written in a professional but personable tone. Generic templates are spotted immediately. In French-language companies, writing in French — even imperfect — shows genuine effort.' },
      { heading: 'Education and Grande École credentials', body: 'French CVs lead with education for junior roles. Prestigious French engineering schools (Polytechnique, CentraleSupélec) carry significant weight. International equivalents should be clearly explained with the institution\'s reputation and ranking.' },
      { heading: 'CV length and format', body: 'French CVs are typically 1–2 pages. Clear, clean layout with sections for Expériences Professionnelles, Formation (education), Compétences (skills), and Langues (languages). Avoid dense walls of text — white space is valued.' },
    ],
    toolsTitle: 'JobConnect AI tools built for the French market',
    tools: [
      { name: 'Remote-Friendly Detector', description: 'Identifies French job postings that genuinely hire international candidates versus those requiring French work authorization or language fluency.' },
      { name: 'French-Format CV Builder', description: 'Generates a clean, photo-free French CV following local conventions — correct section labels, professional formatting, and optional French translation.' },
      { name: 'France Skill Gap Analyzer', description: 'Maps your current skills to in-demand competencies at French tech companies. See which cloud, data, or product skills will open more doors.' },
    ],
    ctaText: 'Start your French job search',
    ctaHref: '/jobs?country=FR',
    salaryRange: '€55K – €110K',
    topCities: 'Paris · Lyon · Bordeaux · Nantes',
    openGraph: {
      title:       'Remote Jobs in France for International Candidates',
      description: 'AI-powered job search for France. French CV builder, Remote-Friendly Detector, and curated international-friendly roles.',
    },
  },
  {
    slug:            'remote-jobs-uk',
    countryCode:     'GB',
    countryName:     'United Kingdom',
    flag:            '🇬🇧',
    title:           'Remote Jobs in the UK for International Candidates | JobConnect AI',
    metaDescription: 'Find remote jobs in the United Kingdom open to international applicants. AI-powered CV builder adapted to British standards. Apply from anywhere.',
    h1:              'Remote Jobs in the United Kingdom — Open to International Candidates',
    heroTagline:     'London\'s tech scene is global by design',
    heroBody:        'The UK hosts Europe\'s most mature technology industry — from London fintech and Oxford healthtech to Manchester and Edinburgh growing into major remote-work hubs. Post-Brexit, UK companies increasingly sponsor global talent. Thousands of roles accept applications from anywhere.',
    whyTitle:        'Why target the UK for your remote job search',
    whyPoints: [
      { icon: '🏦', heading: 'World-leading fintech ecosystem', body: 'London is the world\'s fintech capital. Revolut, Monzo, Wise, and Starling Bank have redefined global banking — and hire engineers, data scientists, and product managers worldwide.' },
      { icon: '💷', heading: 'High salaries in GBP', body: 'Senior software engineers earn £70K–£130K in London. Remote roles outside London follow regional pay scales while keeping proximity to major UK tech companies.' },
      { icon: '🌍', heading: 'English as default language', body: 'No language barrier. UK tech companies operate entirely in English — the same language you\'ll write your CV in, interview in, and work in daily.' },
      { icon: '📈', heading: 'Deep VC and scale-up culture', body: 'The UK produces more unicorns than any European country. Dozens of companies cross the £1B valuation threshold each year — and each one hires at scale.' },
    ],
    diffTitle:       'What makes applying to UK companies different',
    diffPoints: [
      { heading: 'CV, not Resume', body: 'In the UK it\'s called a CV, not a resume. It\'s typically 2 pages for experienced candidates. One-page resumes common in the US are seen as thin by many UK recruiters. Prioritize relevant experience, achievements, and impact over comprehensive job history.' },
      { heading: 'No personal information', body: 'UK CVs should not include date of birth, nationality, marital status, or a photo. Equality legislation (Equality Act 2010) means recruiters are trained to screen these out anyway. Including them marks you as unfamiliar with UK norms.' },
      { heading: 'Achievement-driven, not responsibility-driven', body: 'Bullet points should quantify achievements, not list job duties. "Reduced API latency by 40% serving 2M daily requests" outperforms "Responsible for backend API development." UK tech companies and ATS systems both reward specificity.' },
      { heading: 'British English throughout', body: 'Use British spelling: optimise (not optimize), colour (not color), centre (not center). This signals cultural awareness and attention to detail. A US-English CV sent to a London company without adjustment will be noticed.' },
    ],
    toolsTitle: 'JobConnect AI tools built for the UK market',
    tools: [
      { name: 'Remote-Friendly Detector', description: 'Scans UK job postings and identifies genuine remote-first roles that sponsor or accept international candidates, filtering out "UK-only" listings.' },
      { name: 'British CV Builder', description: 'Generates a 2-page UK-format CV with British English, correct section headings, achievement-focused bullet points, and no personal identifiers.' },
      { name: 'UK Skill Gap Analyzer', description: 'Maps your profile against the skills most in demand at UK tech companies — from AWS certifications to specific fintech frameworks.' },
    ],
    ctaText: 'Start your UK job search',
    ctaHref: '/jobs?country=GB',
    salaryRange: '£55K – £130K',
    topCities: 'London · Manchester · Edinburgh · Bristol',
    openGraph: {
      title:       'Remote Jobs in the UK for International Candidates',
      description: 'AI-powered job search for the United Kingdom. British CV builder, Remote-Friendly Detector, and curated international-friendly roles.',
    },
  },
  {
    slug:            'remote-jobs-usa',
    countryCode:     'US',
    countryName:     'United States',
    flag:            '🇺🇸',
    title:           'Remote Jobs in the USA for International Candidates | JobConnect AI',
    metaDescription: 'Find remote jobs in the USA open to international applicants. AI resume builder optimized for US ATS systems. Apply from anywhere in the world.',
    h1:              'Remote Jobs in the USA — Open to International Candidates',
    heroTagline:     'The world\'s largest tech job market, increasingly borderless',
    heroBody:        'US companies lead the world in remote adoption. Google, Stripe, Shopify, GitLab, and thousands of startups hire internationally. Work authorization requirements vary — many companies sponsor, many more hire contractors globally. JobConnect AI filters for roles genuinely open to you.',
    whyTitle:        'Why target the USA for your remote job search',
    whyPoints: [
      { icon: '💵', heading: 'Highest salaries globally', body: 'US remote roles often come with US-level compensation — $150K–$300K+ for senior engineers at top tech companies. Even contractor and freelance roles pay significantly above most local markets.' },
      { icon: '🏢', heading: 'Access to the world\'s best tech companies', body: 'FAANG, YC-backed startups, Series B/C scale-ups — the US has the densest concentration of high-quality employers on the planet. Remote means you can compete for these roles from anywhere.' },
      { icon: '⚡', heading: 'Fast hiring cycles', body: 'US tech companies move quickly: online application → 1–2 screening calls → technical interview → offer in 2–4 weeks. Compared to European processes, US hiring timelines are significantly shorter.' },
      { icon: '🌐', heading: 'Remote-first culture is mainstream', body: 'Post-pandemic, thousands of US companies formalized remote-first policies. Distributed teams spanning 15+ timezones are now standard at companies like Automattic, Basecamp, and Figma.' },
    ],
    diffTitle:       'What makes applying to US companies different',
    diffPoints: [
      { heading: 'One-page resume (for most candidates)', body: 'US resumes are typically 1 page for under 10 years of experience. Senior engineers and executives may use 2 pages. A dense 3-page European CV will likely be rejected by ATS or recruiters trained on US norms. Be ruthlessly concise.' },
      { heading: 'ATS optimization is non-negotiable', body: 'Most US companies use Applicant Tracking Systems (Greenhouse, Lever, Workday). Your resume must include exact keywords from the job description. "5 years of Python development" beats "extensive scripting experience" for ATS systems.' },
      { heading: 'No photos, no personal details', body: 'Never include a photo, age, nationality, marital status, or social security information. US employment law (EEO regulations) means recruiters are trained to flag CVs containing these. Including them raises red flags, not green ones.' },
      { heading: 'Work authorization varies by role', body: 'Some US remote roles require US work authorization (citizen or green card holder). Others hire contractors internationally. Some sponsor H-1B or O-1 visas. Always check the "Work Authorization" section in job postings — JobConnect AI\'s Remote-Friendly Detector flags this automatically.' },
    ],
    toolsTitle: 'JobConnect AI tools built for the US market',
    tools: [
      { name: 'Remote-Friendly Detector', description: 'Analyzes US job descriptions for work authorization language, timezone requirements, and contractor vs. employee status to tell you exactly which roles you can realistically apply to.' },
      { name: 'US Resume Builder', description: 'Generates a 1-page ATS-optimized US resume with the right keyword density, metric-driven bullet points, and no personal identifiers.' },
      { name: 'USA Skill Gap Analyzer', description: 'Compares your profile against FAANG and top startup requirements. Identifies which AWS, GCP, or system design skills would unlock higher-tier US roles.' },
    ],
    ctaText: 'Start your US job search',
    ctaHref: '/jobs?country=US',
    salaryRange: '$80K – $300K+',
    topCities: 'New York · San Francisco · Austin · Seattle',
    openGraph: {
      title:       'Remote Jobs in the USA for International Candidates',
      description: 'AI-powered job search for the US. ATS-optimized resume builder, Remote-Friendly Detector, and curated international-friendly roles.',
    },
  },
  {
    slug:            'remote-jobs-canada',
    countryCode:     'CA',
    countryName:     'Canada',
    flag:            '🇨🇦',
    title:           'Remote Jobs in Canada for International Candidates | JobConnect AI',
    metaDescription: 'Find remote jobs in Canada open to international applicants. Immigration-friendly market with bilingual advantage. AI resume builder for Canadian standards.',
    h1:              'Remote Jobs in Canada — Open to International Candidates',
    heroTagline:     'Immigration-friendly, tech-forward, and actively recruiting globally',
    heroBody:        'Canada is one of the most welcoming countries for international tech talent. With dedicated immigration pathways (Express Entry, Global Talent Stream), major tech hubs in Toronto, Vancouver, and Montreal, and a culture of diversity, Canada actively courts international candidates — including for remote roles.',
    whyTitle:        'Why target Canada for your remote job search',
    whyPoints: [
      { icon: '🍁', heading: 'Immigration-friendly by design', body: 'Canada\'s Global Talent Stream processes work permit applications in as little as 2 weeks for tech workers. Express Entry pathways are designed to attract skilled international candidates. Remote roles often lead to full relocation support.' },
      { icon: '🌆', heading: 'Three major tech hubs', body: 'Toronto (AI and fintech), Vancouver (games and tech), and Montreal (AI research — Mila, DeepMind) create a geographically distributed market with distinct strengths.' },
      { icon: '🗣️', heading: 'Bilingual advantage', body: 'French-English bilingualism is a meaningful differentiator, especially in Montreal and federal roles. Even basic French proficiency can separate you from equally qualified candidates.' },
      { icon: '🤝', heading: 'Strong diversity and inclusion culture', body: 'Canadian companies lead in DEI initiatives. International backgrounds are genuinely valued, and hiring managers are trained to assess candidates equitably regardless of origin.' },
    ],
    diffTitle:       'What makes applying to Canadian companies different',
    diffPoints: [
      { heading: 'Resume format similar to the US, but 1–2 pages', body: 'Canadian resumes follow US conventions: reverse chronological, metric-driven achievements, no photo, no personal information. Unlike the US strict 1-page rule, Canadian norms accept up to 2 pages for experienced candidates.' },
      { heading: 'Bilingual CV in Quebec', body: 'For roles in Quebec (especially Montreal), a French version of your CV or a bilingual CV gives you a significant edge. Government and public-sector roles require French-language proficiency. Many Montreal startups operate in English but appreciate French.' },
      { heading: 'Tone: collaborative, not aggressive', body: 'US-style "I dominated", "crushed targets" language can read as abrasive to Canadian hiring managers. Prefer collaborative framing: "Led a team of 5 to deliver...", "Collaborated with product to launch..." while still quantifying results.' },
      { heading: 'References are taken seriously', body: 'Canadian companies often conduct thorough reference checks before extending offers. Prepare 2–3 professional references with current contact information. Unlike the US where reference checks are often perfunctory, Canadian hiring managers actively call and ask detailed questions.' },
    ],
    toolsTitle: 'JobConnect AI tools built for the Canadian market',
    tools: [
      { name: 'Remote-Friendly Detector', description: 'Identifies Canadian job postings that genuinely hire internationally, flags work permit sponsorship availability, and highlights bilingual requirements.' },
      { name: 'Canadian Resume Builder', description: 'Generates a 1–2 page Canadian-format resume with collaborative tone, metric-driven achievements, and optional French section for Quebec applications.' },
      { name: 'Canada Skill Gap Analyzer', description: 'Compares your profile against top Toronto, Vancouver, and Montreal employer requirements. Highlights which skills and certifications accelerate the Global Talent Stream process.' },
    ],
    ctaText: 'Start your Canadian job search',
    ctaHref: '/jobs?country=CA',
    salaryRange: 'CAD $70K – $160K',
    topCities: 'Toronto · Vancouver · Montreal · Ottawa',
    openGraph: {
      title:       'Remote Jobs in Canada for International Candidates',
      description: 'AI-powered job search for Canada. Canadian resume builder, Remote-Friendly Detector, and curated international-friendly roles.',
    },
  },
]

export function getLandingMarket(slug: string): LandingMarket | undefined {
  return LANDING_MARKETS.find(m => m.slug === slug)
}
