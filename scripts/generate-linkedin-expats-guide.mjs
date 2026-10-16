/**
 * Generates the "LinkedIn for Expats" PDF using the shared Learn-guide
 * renderer, then uploads it to Supabase Storage.
 *
 * Run: node scripts/generate-linkedin-expats-guide.mjs
 * Output: /tmp/linkedin-expats.pdf
 *         + upload to learn-guides/guides/linkedin-expats.pdf
 */

import { writeFileSync } from 'fs'
import { renderGuidePdf, uploadGuide, loadSupabaseClient } from './lib/pdf-guide-renderer.mjs'

const OUT_PATH = '/tmp/linkedin-expats.pdf'
const STORAGE_PATH = 'guides/linkedin-expats.pdf'

const SECTIONS = [
  {
    eyebrow: 'Getting Started',
    heading: 'How to Use This Guide',
    body: `
      <p class="lead">Most LinkedIn advice is written for someone searching within a single country and a single, familiar market. Remote and cross-border candidates face a slightly different problem: recruiters searching from another country, algorithms that weight location heavily, and a profile that has to explain an international or remote-first history clearly to someone unfamiliar with it.</p>
      <p>Work through this guide section by section and apply each change to your own profile as you go, rather than reading the whole thing first and editing afterward. A profile audit at the end pulls everything together into a single checklist.</p>`,
  },
  {
    heading: 'Why LinkedIn Matters More for Remote and International Candidates',
    body: `
      <p>For a local candidate applying to local roles, LinkedIn is one channel among several, including referrals, local job boards, and in-person networking. For a remote or cross-border candidate, it's often the primary channel recruiters actually use to find you, since there's no local network to lean on and no in-person event where a hiring manager might simply meet you. Recruiters searching for remote talent frequently search LinkedIn directly by keyword rather than waiting for applications to arrive, which means a profile optimized for that kind of search can generate inbound interest that a resume sitting in an applicant tracking system never will.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part One',
    heading: 'The Headline: What Actually Gets Clicked',
    body: `
      <p>Your headline appears in search results, in connection requests, and in every comment you make, which makes it one of the highest-leverage pieces of text on your entire profile. The default, a current job title and company, wastes that space. A stronger headline states what you do, who you do it for, and a specific, differentiating detail, in roughly ten to twelve words.</p>
      <p>For a remote or cross-border candidate specifically, naming your availability for remote work directly in the headline, rather than leaving it to be inferred from your location, helps you surface in the exact searches recruiters are actually running. A headline like "Senior Product Designer, Remote, B2B SaaS, Available for US and EU teams" does more work than a job title alone.</p>
      <blockquote>A useful test: would a recruiter searching for your exact skill set find this headline relevant within two seconds? If not, it's worth rewriting.</blockquote>`,
  },
  {
    heading: 'The About Section: Structure Beats Length',
    body: `
      <p>The about section is read by an actual human more often than any other part of your profile, which makes it worth writing in your own voice rather than a dense list of keywords. A structure that works well: open with one or two sentences on what you do and for whom, follow with a short paragraph on your specific, differentiated strength, add one or two concrete, numbers-backed achievements, and close with what you're looking for next, stated plainly rather than vaguely.</p>
      <p>Avoid opening with "I am a passionate professional with X years of experience," which is both extremely common and says nothing specific about you. A reader should finish the first sentence knowing something concrete, not a generic adjective.</p>`,
  },
  {
    heading: 'The Experience Section: Framing Remote and International Work Clearly',
    body: `
      <p>A reader unfamiliar with your specific history needs context that you might take for granted. If you worked remotely for a company based in another country, say so explicitly in the role description rather than letting the reader guess from the company's location alone. If you managed work across multiple time zones, name the actual range, since "collaborated with distributed teams" is vague in a way that "coordinated daily with teams across US Eastern, Central European, and Indian Standard time" is not.</p>
      <p>For each role, lead with outcomes rather than duties. "Responsible for marketing campaigns" describes a job description; "Grew organic signups 40 percent over two quarters through a rebuilt content strategy" describes what you actually did and what happened because of it, which is the version that differentiates you from everyone else who held a similar title.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Two',
    heading: 'Keywords and Searchability',
    body: `
      <p>Recruiters searching LinkedIn typically use Boolean-style keyword searches, combining a role title with specific skills or tools. Your profile needs to contain the actual terms a recruiter would search for, not just conceptually related language. Review a handful of job postings for roles you want, and note the specific terms that repeat across them: tool names, methodologies, certifications, and role titles.</p>
      <p>Work those exact terms naturally into your headline, about section, and experience descriptions, since LinkedIn's search weights these fields differently, and appearing in multiple fields for the same keyword improves your visibility in search results. This isn't about stuffing a profile with disconnected keywords; it's about describing your real experience using the specific vocabulary the people searching for you are actually likely to type.</p>`,
  },
  {
    heading: 'Location Settings for Remote Candidates',
    body: `
      <p>LinkedIn's search and recommendation systems weight location heavily, which creates a real tradeoff for remote candidates. Setting your location to a major hiring hub, such as a capital city in your target market, can surface you in more local-feeling searches, but may mislead a recruiter about your actual physical location if that's relevant to visa status or time zone fit. The more honest and generally more effective approach is to keep your actual location accurate, and compensate explicitly in your headline and about section by stating your remote availability and the regions or time zones you can work within.</p>
      <p>If you're open to relocating, say so directly rather than leaving it ambiguous, since "open to relocation within the EU" is a specific, searchable statement, while silence on the topic is simply read as not open to it.</p>`,
  },
  {
    heading: 'The Skills Section: Which Skills to Prioritize',
    body: `
      <p>LinkedIn allows a limited number of pinned, prominent skills, and the ones you choose should mirror the keyword research described earlier rather than an exhaustive list of everything you've ever touched. Prioritize skills that appear repeatedly in job postings for your target roles, and remove outdated or barely-relevant ones that dilute the profile's focus. Endorsements on these skills, discussed next, carry more weight when they're concentrated on a tight, relevant list rather than spread across forty loosely related tags.</p>`,
  },
  {
    heading: 'A Worked Example: Before and After',
    body: `
      <p>A composite example, showing the difference these changes make in practice.</p>
      <p><strong>Before:</strong> "Marketing Manager at TechCorp." About section: "Passionate marketing professional with 8 years of experience in various industries, looking for new opportunities."</p>
      <p><strong>After:</strong> "Growth Marketing Manager, Remote, B2B SaaS, Available across US and EU time zones." About section opens: "I run growth marketing for early-stage SaaS companies, most recently taking a product from 500 to 12,000 monthly signups in fourteen months through a rebuilt content and lifecycle email strategy."</p>
      <p>The second version is searchable by the specific keywords a recruiter would actually type, states remote availability explicitly, and leads with a concrete, numbers-backed outcome instead of a generic description that could describe almost anyone in the field.</p>`,
  },
  {
    heading: 'The Featured Section: An Underused Shelf',
    body: `
      <p>The featured section sits prominently near the top of a profile and can pin specific posts, articles, media, or links, yet it's frequently left empty. For a remote or cross-border candidate, this is a strong place to pin a portfolio link, a case study of a specific project, or a published article that demonstrates expertise directly, rather than asking a reader to dig through the experience section to find evidence of your work.</p>
      <p>Keep this section curated rather than comprehensive: two or three strong, relevant items outperform a cluttered shelf of everything you've ever published or linked.</p>`,
  },
  {
    heading: 'Education and Credential Equivalency',
    body: `
      <p>A degree or credential that's well understood in your home country may be unfamiliar to a reader elsewhere, which is worth addressing briefly rather than assuming context travels automatically. A short clarifying note, such as noting that a specific credential is the equivalent of a bachelor's or master's degree in a more widely recognized system, removes ambiguity without requiring the reader to research it themselves.</p>
      <p>For certifications tied to a specific regulatory body or professional association that may not be globally recognized, a brief one-line explanation of what the credential actually represents helps a reader outside that system understand its relevance.</p>`,
  },
  {
    heading: 'Listing Language Skills Credibly',
    body: `
      <p>For cross-border candidates, language proficiency is often a genuine differentiator, but vague self-ratings undermine credibility. LinkedIn's language section allows a proficiency level for each language; use the actual scale thoughtfully rather than defaulting every language to "native or bilingual" if that's not accurate. A specific, honest "professional working proficiency" reads as more credible than an inflated claim that might be tested in an actual interview conducted in that language.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Five',
    heading: 'Groups and Alumni Networks',
    body: `
      <p>LinkedIn groups and your school's alumni network are underused channels for cross-border candidates specifically, since they offer a built-in reason to reach out that a cold connection request doesn't have. Joining a group relevant to your target industry or region, and genuinely participating rather than only lurking, creates natural opportunities for visibility. Your alumni network, searchable directly within LinkedIn, often includes people now working in your target country or company who share an immediate, legitimate point of connection with you.</p>`,
  },
  {
    heading: 'Following and Engaging with Target Companies',
    body: `
      <p>Following a target company's LinkedIn page surfaces their posts in your feed, which gives you natural, specific material to reference in outreach or an eventual interview. Engaging thoughtfully with their posts, rather than only their employees' personal posts, puts your name in front of whoever manages that page, which is sometimes a recruiter or hiring manager directly.</p>
      <p>This is a slow-burn tactic rather than an immediate one: the goal is familiarity built over weeks or months, not a single interaction that produces an immediate referral.</p>`,
  },
  {
    heading: 'Handling Employment Gaps and Visa-Related Breaks',
    body: `
      <p>Gaps related to visa processing, relocation, or waiting on work authorization are common for cross-border candidates and don't need to be hidden, but they do benefit from brief, factual context rather than being left as an unexplained blank period. A short line in the experience section, such as noting a period spent on a work-authorization transition between roles, removes the ambiguity that otherwise invites a reader to guess at less favorable explanations.</p>
      <p>If you used a gap productively, a course, a certification, freelance work, or a relevant project, naming it briefly turns a potential question mark into a small, specific positive.</p>`,
  },
  {
    heading: 'Certifications and Courses Worth Listing',
    body: `
      <p>Not every completed course deserves a place on your profile. Prioritize certifications that are specifically recognized in your target market or industry, and that map to the keywords identified earlier in your research, over a long list of loosely related courses that dilute the profile's focus. A shorter list of clearly relevant, recognizable credentials reads as more intentional than an exhaustive one.</p>`,
  },
  {
    heading: 'Profile Privacy: What Your Current Employer Can See',
    body: `
      <p>LinkedIn's activity broadcasts, such as profile updates and new connections, are visible to your network by default, which matters if you'd rather your current employer not notice active job-search behavior. Reviewing your privacy settings before making a round of profile changes, specifically the setting that controls whether profile edits are broadcast to your network, prevents an awkward, avoidable conversation.</p>
      <p>The "Open to Work, visible to recruiters only" setting discussed earlier is the other half of this same concern, and both are worth checking together before you begin an active search.</p>`,
  },
  {
    heading: 'Mobile Versus Desktop: How Profiles Are Actually Viewed',
    body: `
      <p>A large share of LinkedIn browsing happens on mobile, where long paragraphs are harder to read and more likely to be skipped entirely. Writing in short paragraphs with clear line breaks, rather than dense blocks of text, matters more than it might seem, since a profile that reads well on a laptop can still perform poorly if it's a wall of text on a phone screen, which is how a meaningful share of recruiters will actually first see it.</p>`,
  },
  {
    heading: 'What Recruiters Actually Ask After Viewing a Profile',
    body: `
      <div class="qa"><p class="q">"Are you open to relocating, or strictly remote?"</p><p class="a">Have a direct, specific answer ready, matching whatever you stated in your profile's availability fields.</p></div>
      <div class="qa"><p class="q">"What's your availability for a start date?"</p><p class="a">A rough but honest answer is better than a vague "flexible," which reads as uncertain rather than accommodating.</p></div>
      <div class="qa"><p class="q">"Can you walk me through the gap in your experience section?"</p><p class="a">If you addressed it briefly on your profile already, as covered earlier, this becomes an easy, low-stakes question rather than an uncomfortable surprise.</p></div>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Three',
    heading: 'How to Ask for a Recommendation Without It Feeling Awkward',
    body: `
      <p>Most of the discomfort around asking for a recommendation comes from making the request too open-ended. Rather than a general "could you write me a recommendation," suggest a specific angle: "Would you be able to speak to the project we ran together on [specific initiative]? That's the piece of my work I'd most want to highlight for the roles I'm targeting now." This gives the person a clear, easy starting point, which usually produces a more specific and useful recommendation than an open request would, and it respects their time by reducing how much thinking the request requires from them.</p>`,
  },
  {
    heading: 'Recommendations and Endorsements, Gathered Strategically',
    body: `
      <p>A written recommendation from a former manager or close collaborator carries far more weight than a skill endorsement, since it's specific, attributed, and harder to fake. Rather than waiting for someone to volunteer one, ask directly, and make it easy for them by reminding them of a specific project or outcome they could speak to, since a vague request often produces a vague, generic recommendation in return.</p>
      <p>For cross-border candidates, a recommendation from someone in your target market or region carries extra value, since it implicitly vouches for your ability to work within that context. If you have a former international manager or client, prioritize asking them specifically.</p>`,
  },
  {
    heading: 'A Light Posting and Content Strategy',
    body: `
      <p>You don't need to post constantly to benefit from LinkedIn's content features, but complete inactivity does reduce your visibility over time, since the platform weights recent activity in both search and recommendation algorithms. A sustainable approach is a short post every few weeks, sharing something concrete, a project outcome, a lesson learned, a useful resource, rather than generic commentary with no specific content.</p>
      <p>Commenting thoughtfully on posts from people in your target companies or industry is often more effective than posting yourself, since it puts your name and profile in front of exactly the audience you want, with much less effort than producing original content regularly.</p>`,
  },
  {
    heading: 'Networking Across Borders: Cold Outreach That Works',
    body: `
      <p>A connection request with no note is easy to ignore, especially across a cultural or geographic gap where the recipient has no immediate context for why you're reaching out. A short, specific note dramatically improves response rates: mention something concrete, a shared connection, a recent post they made, or a specific reason their work is relevant to what you're doing, rather than a generic "I'd like to add you to my network."</p>
      <p>Once connected, resist asking for a job directly in your first message. A better opening asks a genuine, specific question about their work or team, which tends to open a real conversation rather than reading as a transactional ask. If a referral or introduction does come up naturally, it's far more likely to happen after a real exchange than cold, in the first message.</p>`,
  },
  {
    heading: 'Using "Open to Work" Strategically',
    body: `
      <p>LinkedIn's "Open to Work" banner is visible to everyone by default, which has a real tradeoff: it increases visibility to recruiters, but can also signal to your current employer, if they're connected to you, that you're job searching. LinkedIn allows setting this visibility to recruiters only, which captures most of the benefit without the risk, and is the setting most employed candidates should use rather than the fully public version.</p>
      <p>The accompanying job preferences, role titles, locations, and remote-work preference, are searched directly by LinkedIn's recruiter tools, so filling them in specifically, rather than leaving them broad or blank, meaningfully improves how often you surface in relevant searches.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Four',
    heading: 'Photo and Banner: First Impressions',
    body: `
      <p>Profile photos with a visible, genuine smile and a plain or softly blurred background consistently perform better in terms of profile views than more formal or heavily staged photos, according to LinkedIn's own published guidance. A photo that's several years old, or taken in a context that no longer matches your current role, is worth updating, since it's often the very first thing anyone sees before reading a word of your profile.</p>
      <p>The banner image is frequently left as the default and wasted. Using it to reinforce your specialization, a simple graphic stating your focus area, or a relevant project image, adds a second visual signal that supports the headline beneath it, at essentially no cost.</p>`,
  },
  {
    heading: 'Profile Photo Mistakes to Avoid',
    body: `
      <p>A few specific, avoidable mistakes show up repeatedly. A group photo cropped down to just your face often looks obviously cropped and slightly odd at profile-photo size. Heavy filters or visibly outdated photos undercut trust the moment a video call reveals a different-looking person. And a photo taken from too far away, where your face is a small, low-resolution detail, loses most of the warmth a good headshot is supposed to convey. None of these require a professional photographer to fix, just a clear, well-lit, reasonably recent photo taken with intention.</p>`,
  },
  {
    heading: 'Common Mistakes International Candidates Make',
    body: `
      <p>Listing a company name without any context assumes a global reader recognizes it, which is often not true outside its home market. Writing exclusively in a language that doesn't match your target market's dominant professional language limits your visibility there, even if your skills are a strong match. Leaving location and remote-availability fields blank or ambiguous forces a recruiter to guess, and guessing usually resolves in the direction of simply moving on to a clearer profile instead.</p>
      <p>Translating a resume format directly into LinkedIn, with dense paragraphs and no formatting, ignores how differently the platform is actually read, typically scanned quickly rather than read start to finish, which rewards short paragraphs and concrete statements over long, unbroken blocks of text.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Part Six',
    heading: 'Headline Formulas for Specific Situations',
    body: `
      <p>A single headline formula doesn't fit every career stage. A few variations, adaptable to your specific situation.</p>
      <table class="plan">
        <tr><th>Situation</th><th>Formula</th></tr>
        <tr><td>Established in your field</td><td>[Role] for [who you serve], [key differentiator], [remote/location availability].</td></tr>
        <tr><td>Career changer</td><td>[New target role] with a background in [prior field], bringing [specific transferable strength].</td></tr>
        <tr><td>Senior or executive</td><td>[Function] leader, [specific scale or outcome], [industry focus].</td></tr>
        <tr><td>Early career</td><td>[Role] specializing in [specific skill or tool], [remote/location availability].</td></tr>
        <tr><td>Freelance or contract</td><td>[Role] for [who you serve], available for [contract/project type] work.</td></tr>
      </table>`,
  },
  {
    heading: 'Connection Request Templates',
    body: `
      <p>A short, specific note dramatically outperforms a blank request.</p>
      <h3>Reaching out to a recruiter</h3>
      <div class="tmpl">Hi [Name], I saw you recruit for [specific type of role] at [company]. I'm a [your role] with experience in [specific relevant area] and wanted to connect in case a relevant opening comes up.</div>
      <h3>Reaching out to a peer in your target company</h3>
      <div class="tmpl">Hi [Name], I came across your profile while researching [company] and noticed we both work in [shared area]. I'd love to connect and hear a bit about your experience there.</div>
      <h3>Reaching out through an alumni connection</h3>
      <div class="tmpl">Hi [Name], fellow [school] alum here. I'm exploring opportunities in [field/region] and saw you've built a career there. Would love to connect.</div>`,
  },
  {
    heading: 'Tracking What\'s Actually Working',
    body: `
      <p>LinkedIn provides basic analytics on your own profile: who's viewed it, how often you appear in search results, and which posts get engagement. Checking these periodically, rather than making changes blindly, helps confirm whether a headline or keyword change actually improved visibility. A sustained increase in search appearances after a specific edit is a reasonably strong signal that the change worked; no movement at all after several weeks suggests revisiting that specific change rather than assuming the whole profile needs an overhaul.</p>`,
  },
  {
    heading: 'Pitching a Career Change Convincingly',
    body: `
      <p>Changing industries or functions is a specific challenge on a platform that often rewards clear, linear narratives. Rather than hiding the change, name it directly and explain the through-line yourself, since a reader shouldn't have to guess why a former teacher is now applying to product management roles. A single sentence connecting the transferable skill, such as explaining how years of lesson planning translate directly into structuring a product roadmap, does more work than leaving the connection implicit.</p>
      <p>Supplement this with a project, course, or volunteer work that demonstrates genuine engagement with the new field, since a career-change narrative is far more convincing when it's backed by some concrete evidence beyond the stated intention alone.</p>`,
  },
  {
    heading: 'A Worksheet: Draft Your Own Headline',
    body: `
      <p>Fill this in using the formulas and examples from earlier in this guide.</p>
      <table class="plan">
        <tr><th>Component</th><th>Your draft</th></tr>
        <tr><td>What you do</td><td></td></tr>
        <tr><td>Who you do it for, or your specialization</td><td></td></tr>
        <tr><td>One differentiator, a number or specific strength</td><td></td></tr>
        <tr><td>Remote or location availability</td><td></td></tr>
        <tr><td>Full headline, combined</td><td></td></tr>
      </table>`,
  },
  {
    heading: 'A 30-Day Profile Improvement Plan',
    body: `
      <table class="plan">
        <tr><th>Week</th><th>Focus</th></tr>
        <tr><td>1</td><td>Rewrite headline and about section using the structure and formulas in this guide.</td></tr>
        <tr><td>2</td><td>Rework experience descriptions to lead with outcomes; update pinned skills to match keyword research.</td></tr>
        <tr><td>3</td><td>Request two to three specific recommendations; fill in the featured section with two or three strong items.</td></tr>
        <tr><td>4</td><td>Begin light, consistent engagement: one post, and regular thoughtful comments on relevant posts.</td></tr>
      </table>`,
  },
  {
    heading: 'Common Myths About the LinkedIn Algorithm',
    body: `
      <p>A few persistent claims don't hold up well. Posting at a specific "best time of day" matters far less than posting something genuinely worth engaging with; consistency and relevance outperform precise timing. Using a large number of hashtags doesn't meaningfully boost reach and can read as cluttered. And editing a post repeatedly after publishing doesn't suppress its reach, despite a common belief that it does; what actually affects reach is engagement in the first hour or two after posting, which is driven by relevance to your network, not by leaving a post untouched.</p>`,
  },
  {
    heading: 'LinkedIn Versus Local Platforms by Region',
    body: `
      <p>LinkedIn's dominance as the professional network of choice isn't universal, and knowing where it's less central helps you avoid over-investing in the wrong channel for a specific market.</p>
      <table class="plan">
        <tr><th>Region</th><th>What else matters</th></tr>
        <tr><td>Germany and German-speaking Europe</td><td>Xing historically held significant local market share; checking whether it's still relevant for your specific target companies is worthwhile.</td></tr>
        <tr><td>India</td><td>Naukri and similar local job boards are heavily used alongside LinkedIn, especially for mid-level and junior roles.</td></tr>
        <tr><td>China</td><td>LinkedIn's local presence is limited; domestic platforms dominate professional networking almost entirely.</td></tr>
        <tr><td>Most of North America, the UK, and much of Western Europe</td><td>LinkedIn is typically the dominant platform, and the advice in this guide applies most directly here.</td></tr>
      </table>`,
  },
  {
    heading: 'Cultural Differences in Self-Presentation',
    body: `
      <p>How confidently people describe their own achievements on LinkedIn varies by region in ways that mirror the interview-culture differences covered in this platform's interview guide. Profiles from some markets lean toward confident, explicit self-promotion as the norm, while others favor a more understated tone, where the same achievement might be described with noticeably more restraint. When writing for a specific target market different from your own professional culture, it's worth calibrating slightly toward that market's norm rather than assuming your own default style translates directly.</p>`,
  },
  {
    heading: 'A Short FAQ',
    body: `
      <div class="qa"><p class="q">Should I list every job I've ever had?</p><p class="a">No. Prioritize roles relevant to your target direction; a shorter, focused history reads better than an exhaustive one.</p></div>
      <div class="qa"><p class="q">Is it bad to have a mostly empty profile while employed?</p><p class="a">It's a missed opportunity more than an active problem, but building it out before you need it is far easier than rushing during an active search.</p></div>
      <div class="qa"><p class="q">Should I connect with recruiters I've never spoken to?</p><p class="a">Yes, with a short, specific note, as covered earlier. It costs nothing and expands who sees your activity.</p></div>`,
  },
  {
    heading: 'Engaging Recruiters: What to Say in a First Message',
    body: `
      <p>When a recruiter messages you first, responding quickly and specifically improves your odds noticeably, since recruiters often message several candidates for the same role and tend to move fastest with whoever engages promptly and clearly. A strong response confirms your interest, asks one or two genuinely clarifying questions about the role, and states your availability for a call plainly, rather than a vague "sounds interesting, tell me more" with no real content.</p>
      <p>If you're reaching out to a recruiter first, rather than waiting to be contacted, keep the message short: who you are, the specific type of role you're looking for, and a single line on why you're reaching out to them specifically rather than recruiters generally.</p>`,
  },
  {
    heading: 'Job Alerts and Saved Searches',
    body: `
      <p>Setting up saved searches for your specific target roles, with filters for remote and your relevant regions, surfaces new postings faster than browsing the feed casually. For roles that move quickly, especially at smaller companies, being among the first handful of applicants meaningfully improves your odds of a response, which makes a well-configured alert worth a few minutes of setup.</p>`,
  },
  {
    heading: 'The "Who\'s Viewed Your Profile" Signal',
    body: `
      <p>A spike in profile views from a specific company, especially from someone with "recruiter" or "talent" in their title, is a reasonable signal that something you did recently, a post, a comment, an application, caught attention. It's a loose signal rather than a guarantee, but it's worth noting, since a well-timed, low-pressure follow-up message shortly afterward sometimes converts that quiet interest into an actual conversation.</p>`,
  },
  {
    heading: 'Writing a Post That Gets Noticed',
    body: `
      <p>A post that performs well usually has a specific hook in the first line, since LinkedIn truncates posts and only the opening sentence or two shows before a reader has to click "see more." Leading with a concrete result, a surprising lesson, or a specific question tends to outperform a vague opening line. Keep paragraphs short, as covered earlier regarding mobile readability, and close with a genuine question or invitation to comment, which tends to generate more engagement than a post that simply ends.</p>`,
  },
  {
    heading: 'A Note on AI-Generated Profile Copy',
    body: `
      <p>AI tools, including the ones built into this platform, can genuinely help draft a first version of a headline or about section, especially when you're stuck on how to phrase something. The risk is publishing that draft unedited: generic AI phrasing is increasingly recognizable, and a profile that reads as generated rather than personally written undercuts the authenticity that makes a strong profile actually work. Use AI drafts as a starting point to rewrite in your own voice and your own specific details, not as a finished product to copy directly.</p>`,
  },
  {
    heading: 'Is LinkedIn Premium Worth It?',
    body: `
      <p>LinkedIn Premium adds a handful of features relevant to active job searching: InMail credits to message people outside your network directly, visibility into who's viewed your profile, and some salary insight data. For someone actively and seriously job searching, particularly across borders where cold outreach matters more than it would locally, the InMail credits alone are often worth the cost for a focused month or two. For passive browsing with no active search underway, the free tier covers most of what matters, and the subscription is easy to pause once an active search concludes.</p>`,
  },
  {
    newPage: true,
    eyebrow: 'Worksheet',
    heading: 'Profile Audit Checklist',
    body: `
      <p>Go through your own profile against each line below.</p>
      <ul>
        <li>Headline states what you do, for whom, and your remote or location availability, in roughly ten to twelve words.</li>
        <li>About section opens with something concrete, not a generic "passionate professional" line.</li>
        <li>Every role description leads with an outcome, not just a list of duties.</li>
        <li>Remote or cross-border work is explained explicitly, not left for the reader to infer.</li>
        <li>Pinned skills match the specific keywords that appear in your target job postings.</li>
        <li>Location and remote-availability fields are filled in specifically, not left blank.</li>
        <li>At least two recent, specific recommendations are visible on the profile.</li>
        <li>Photo is current, visibly friendly, and on a plain or softly blurred background.</li>
        <li>"Open to Work" visibility is set deliberately, not left on a default you haven't checked.</li>
      </ul>`,
  },
  {
    heading: 'More Experience Bullets, Before and After',
    body: `
      <p>A few more worked examples, since this is the section most profiles get wrong most often.</p>
      <p><strong>Before:</strong> "Managed social media accounts for the company." <strong>After:</strong> "Grew Instagram following from 2,000 to 28,000 in ten months through a consistent short-form video strategy."</p>
      <p><strong>Before:</strong> "Responsible for customer support team." <strong>After:</strong> "Led a six-person remote support team across three time zones, cutting average response time from six hours to ninety minutes."</p>
      <p><strong>Before:</strong> "Worked on international projects with various teams." <strong>After:</strong> "Coordinated a product launch across teams in Berlin, São Paulo, and Manila, aligning on a single shared roadmap despite no overlapping working hours."</p>`,
  },
  {
    heading: 'Profiles in Multilingual Markets',
    body: `
      <p>If you're targeting roles in a market where a language other than your profile's current language dominates professional communication, consider whether a fully translated version, or at minimum a translated headline and about section, would meaningfully expand your visibility there. LinkedIn doesn't natively support multiple full-language profile versions well, so this often means a judgment call about which single language serves your actual target audience best, rather than trying to serve two audiences imperfectly at once.</p>`,
  },
  {
    heading: 'Building a Personal Brand Beyond LinkedIn',
    body: `
      <p>A personal website or portfolio, linked from your featured section, gives you a space LinkedIn's format doesn't allow: a fuller case study, a more personal bio, or work samples that don't fit neatly into a profile field. This matters most for roles where a portfolio is expected, such as design or writing, but even a simple one-page site with a clear bio and a few links adds a layer of credibility that a profile alone doesn't fully provide.</p>`,
  },
  {
    heading: 'Keep Your Profile Working for You',
    body: `
      <p>A profile that's optimized once and never revisited slowly drifts out of date as your skills, target roles, and the market's specific keywords shift. Revisit the headline and about section every few months, particularly before or during an active job search, and treat the profile as a living document rather than a one-time project.</p>
      <p>Pair this guide with the rest of JobConnect AI's Learn library, including the interview prep playbook, since a strong LinkedIn presence is often what starts the conversation that an interview later continues.</p>`,
  },
]

async function main() {
  const supabase = loadSupabaseClient()
  const { pdf, pageCount } = await renderGuidePdf({
    kicker: 'Learn Library · Pro',
    titleLines: ['LinkedIn for', 'Expats'],
    subtitle: 'A practical guide to making your LinkedIn profile work for remote and cross-border job searching.',
    docTitle: 'LinkedIn for Expats',
    sections: SECTIONS,
  })

  writeFileSync(OUT_PATH, pdf)
  console.log(`✓ PDF generated (${pageCount} pages)`)

  await uploadGuide(supabase, pdf, STORAGE_PATH)
  console.log(`✓ Uploaded to learn-guides/${STORAGE_PATH}`)
}

main().catch(err => { console.error(err); process.exit(1) })
