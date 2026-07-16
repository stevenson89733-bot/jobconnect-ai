'use client'
import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FileText } from 'lucide-react'
import { updateProfile, type ProfileFields } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import EditableSection from '@/components/profile/EditableSection'
import Timeline from '@/components/profile/Timeline'
import CareerCoachSummary from '@/components/shared/CareerCoachSummary'
import type { Project, Certificate, Language } from '@/lib/profileSections'

// Code-split: none of these four are needed for initial paint (Projects/
// Certificates/Languages render below the always-visible Basics/Bio/
// Experience fields; AvatarUpload is visible immediately but is a self-
// contained upload widget with its own client-only logic). Each gets a
// same-size placeholder so there's no layout shift while its chunk loads.
const AvatarUpload = dynamic(() => import('./AvatarUpload'), {
  loading: () => (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
    </div>
  ),
})
const ProjectsSection = dynamic(() => import('@/components/profile/ProjectsSection'), {
  loading: () => <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />,
})
const CertificatesSection = dynamic(() => import('@/components/profile/CertificatesSection'), {
  loading: () => <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />,
})
const LanguagesSection = dynamic(() => import('@/components/profile/LanguagesSection'), {
  loading: () => <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />,
})

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'

const AVAILABILITY_OPTIONS = ['Immediate', 'Within 1 month', 'Within 3 months']
const WORK_PREFERENCE_OPTIONS = ['Remote', 'Hybrid', 'On-site']

export default function ProfileEditor({
  initial,
  email,
  avatarUrl,
  isPremium,
  atsScore,
  profileStrength,
  analysisGeneratedAt,
  initialProjects,
  initialCertificates,
  initialLanguages,
}: {
  initial: ProfileFields
  email: string
  avatarUrl: string | null
  isPremium: boolean
  atsScore: number | null
  profileStrength: number | null
  analysisGeneratedAt: string | null
  initialProjects: Project[]
  initialCertificates: Certificate[]
  initialLanguages: Language[]
}) {
  // Each section keeps its own draft + editing state, independent of the
  // others — editing Bio doesn't touch Experience's draft, and each saves
  // via a partial updateProfile() call for just its own field(s).
  const [basics, setBasics] = useState({
    full_name: initial.full_name,
    title: initial.title,
    location: initial.location,
    years_experience: initial.years_experience,
    availability: initial.availability,
    work_preference: initial.work_preference,
    phone: initial.phone,
  })
  const [basicsDraft, setBasicsDraft] = useState(basics)
  const [basicsEditing, setBasicsEditing] = useState(false)

  const [bio, setBio] = useState(initial.bio)
  const [bioDraft, setBioDraft] = useState(initial.bio)
  const [bioEditing, setBioEditing] = useState(false)

  const [experience, setExperience] = useState(initial.experience)
  const [experienceDraft, setExperienceDraft] = useState(initial.experience)
  const [experienceEditing, setExperienceEditing] = useState(false)

  const [education, setEducation] = useState(initial.education)
  const [educationDraft, setEducationDraft] = useState(initial.education)
  const [educationEditing, setEducationEditing] = useState(false)

  const [skills, setSkills] = useState(initial.skills)
  const [skillsDraft, setSkillsDraft] = useState(initial.skills)
  const [skillsEditing, setSkillsEditing] = useState(false)

  const [links, setLinks] = useState({ linkedin_url: initial.linkedin_url, github_url: initial.github_url, portfolio_url: initial.portfolio_url })
  const [linksDraft, setLinksDraft] = useState(links)
  const [linksEditing, setLinksEditing] = useState(false)

  const skillTags = skills.split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <Link href="/candidate" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Profile</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Your Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">The real information candidates and AI tools across the app use.</p>
      </div>

      {/* Photo + Basics */}
      <EditableSection
        title="Basics"
        editing={basicsEditing}
        onEdit={() => { setBasicsDraft(basics); setBasicsEditing(true) }}
        onCancel={() => { setBasicsDraft(basics); setBasicsEditing(false) }}
        onSave={async () => {
          const res = await updateProfile(basicsDraft)
          if (res.ok) { setBasics(basicsDraft); setBasicsEditing(false) }
          return res
        }}
        renderView={() => (
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <AvatarUpload initialAvatarUrl={avatarUrl} fullName={basics.full_name} />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{basics.full_name || 'Add your name'}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{basics.title || 'Add a professional title'}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">{email}</p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                {basics.location && <span className="badge bg-slate-100 dark:bg-slate-700/60">{basics.location}</span>}
                {basics.years_experience && <span className="badge bg-slate-100 dark:bg-slate-700/60">{basics.years_experience} yrs experience</span>}
                {basics.work_preference && <span className="badge bg-slate-100 dark:bg-slate-700/60">{basics.work_preference}</span>}
                {basics.availability && <span className="badge bg-slate-100 dark:bg-slate-700/60">Available: {basics.availability}</span>}
              </div>
            </div>
          </div>
        )}
        renderEdit={() => (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input value={basicsDraft.full_name} onChange={(e) => setBasicsDraft((d) => ({ ...d, full_name: e.target.value }))} className={inputClass} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Professional Title</label>
                <input value={basicsDraft.title} onChange={(e) => setBasicsDraft((d) => ({ ...d, title: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input value={basicsDraft.location} onChange={(e) => setBasicsDraft((d) => ({ ...d, location: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input
                  value={basicsDraft.years_experience}
                  onChange={(e) => setBasicsDraft((d) => ({ ...d, years_experience: e.target.value }))}
                  type="number" min={0} max={80}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Availability</label>
                <select value={basicsDraft.availability} onChange={(e) => setBasicsDraft((d) => ({ ...d, availability: e.target.value }))} className={inputClass}>
                  <option value="">Not specified</option>
                  {AVAILABILITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Work Preference</label>
                <select value={basicsDraft.work_preference} onChange={(e) => setBasicsDraft((d) => ({ ...d, work_preference: e.target.value }))} className={inputClass}>
                  <option value="">Not specified</option>
                  {WORK_PREFERENCE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Phone <span className="text-slate-600 font-normal">— private</span></label>
                <input value={basicsDraft.phone} onChange={(e) => setBasicsDraft((d) => ({ ...d, phone: e.target.value }))} type="tel" className={inputClass} />
              </div>
            </div>
          </div>
        )}
      />

      <CareerCoachSummary
        isPremium={isPremium}
        atsScore={atsScore}
        profileStrength={profileStrength}
        generatedAt={analysisGeneratedAt}
      />

      <EditableSection
        title="Summary"
        editing={bioEditing}
        onEdit={() => { setBioDraft(bio); setBioEditing(true) }}
        onCancel={() => { setBioDraft(bio); setBioEditing(false) }}
        onSave={async () => {
          const res = await updateProfile({ bio: bioDraft })
          if (res.ok) { setBio(bioDraft); setBioEditing(false) }
          return res
        }}
        renderView={() => (
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {bio || <span className="text-slate-600 dark:text-slate-400">Add a short summary about you and what you&rsquo;re looking for.</span>}
          </p>
        )}
        renderEdit={() => (
          <textarea value={bioDraft} onChange={(e) => setBioDraft(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        )}
      />

      <EditableSection
        title="Experience"
        editing={experienceEditing}
        onEdit={() => { setExperienceDraft(experience); setExperienceEditing(true) }}
        onCancel={() => { setExperienceDraft(experience); setExperienceEditing(false) }}
        onSave={async () => {
          const res = await updateProfile({ experience: experienceDraft })
          if (res.ok) { setExperience(experienceDraft); setExperienceEditing(false) }
          return res
        }}
        renderView={() =>
          experience.trim() ? (
            <Timeline text={experience} />
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Add your roles, companies, dates, and key achievements.</p>
          )
        }
        renderEdit={() => (
          <textarea value={experienceDraft} onChange={(e) => setExperienceDraft(e.target.value)} rows={6} className={`${inputClass} resize-none`} />
        )}
      />

      <EditableSection
        title="Education"
        editing={educationEditing}
        onEdit={() => { setEducationDraft(education); setEducationEditing(true) }}
        onCancel={() => { setEducationDraft(education); setEducationEditing(false) }}
        onSave={async () => {
          const res = await updateProfile({ education: educationDraft })
          if (res.ok) { setEducation(educationDraft); setEducationEditing(false) }
          return res
        }}
        renderView={() =>
          education.trim() ? (
            <Timeline text={education} />
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Add your degrees, schools, and dates.</p>
          )
        }
        renderEdit={() => (
          <textarea value={educationDraft} onChange={(e) => setEducationDraft(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        )}
      />

      <EditableSection
        title="Skills"
        editing={skillsEditing}
        onEdit={() => { setSkillsDraft(skills); setSkillsEditing(true) }}
        onCancel={() => { setSkillsDraft(skills); setSkillsEditing(false) }}
        onSave={async () => {
          const res = await updateProfile({ skills: skillsDraft })
          if (res.ok) { setSkills(skillsDraft); setSkillsEditing(false) }
          return res
        }}
        renderView={() =>
          skillTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skillTags.map((s) => <span key={s} className="badge bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">{s}</span>)}
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Add your skills, comma-separated.</p>
          )
        }
        renderEdit={() => (
          <textarea value={skillsDraft} onChange={(e) => setSkillsDraft(e.target.value)} rows={2} placeholder="TypeScript, React, Node.js…" className={`${inputClass} resize-none`} />
        )}
      />

      <ProjectsSection initial={initialProjects} />
      <CertificatesSection initial={initialCertificates} />
      <LanguagesSection initial={initialLanguages} />

      <EditableSection
        title="Links"
        editing={linksEditing}
        onEdit={() => { setLinksDraft(links); setLinksEditing(true) }}
        onCancel={() => { setLinksDraft(links); setLinksEditing(false) }}
        onSave={async () => {
          const res = await updateProfile(linksDraft)
          if (res.ok) { setLinks(linksDraft); setLinksEditing(false) }
          return res
        }}
        renderView={() => (
          <div className="space-y-1.5 text-sm">
            {links.linkedin_url && <a href={links.linkedin_url} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline break-all">{links.linkedin_url}</a>}
            {links.github_url && <a href={links.github_url} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline break-all">{links.github_url}</a>}
            {links.portfolio_url && <a href={links.portfolio_url} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline break-all">{links.portfolio_url}</a>}
            {!links.linkedin_url && !links.github_url && !links.portfolio_url && (
              <p className="text-slate-600 dark:text-slate-400">Add your LinkedIn, GitHub, or portfolio URL.</p>
            )}
          </div>
        )}
        renderEdit={() => (
          <div className="space-y-3">
            <input value={linksDraft.linkedin_url} onChange={(e) => setLinksDraft((d) => ({ ...d, linkedin_url: e.target.value }))} type="url" placeholder="LinkedIn URL" className={inputClass} />
            <input value={linksDraft.github_url} onChange={(e) => setLinksDraft((d) => ({ ...d, github_url: e.target.value }))} type="url" placeholder="GitHub URL" className={inputClass} />
            <input value={linksDraft.portfolio_url} onChange={(e) => setLinksDraft((d) => ({ ...d, portfolio_url: e.target.value }))} type="url" placeholder="Portfolio / Website URL" className={inputClass} />
          </div>
        )}
      />

      {/* Resume — links to the real Resume Builder tool, no separate upload */}
      <div className="card p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} />
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Resume</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">Generate and export your resume from this same profile data.</p>
          </div>
        </div>
        <Link href="/ai-tools/resume-builder"><Button variant="primary" size="sm">Open Resume Builder</Button></Link>
      </div>
    </div>
  )
}
