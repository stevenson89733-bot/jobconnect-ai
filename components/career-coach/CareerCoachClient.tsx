'use client'
import { useState, useTransition } from 'react'
import {
  Gauge, FileCheck2, ListChecks, KeyRound, FileEdit, MessagesSquare,
  Map, GraduationCap, DollarSign, RefreshCw, AlertTriangle, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import InsightCard from './InsightCard'
import SkillTag from './SkillTag'
import JobMatchCard from './JobMatchCard'
import FadeIn from '@/components/dashboard/FadeIn'
import { refreshCareerAnalysis } from '@/app/actions/careerCoach'
import type { CareerAnalysis } from '@/lib/ai/careerCoach'
import type { MatchedJob } from '@/lib/jobMatching'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function RoadmapColumn({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">{title}</h4>
      <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-slate-500 dark:text-slate-500">Nothing to show.</p>
  return (
    <ul className="space-y-1.5 list-disc list-inside">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export default function CareerCoachClient({
  initialAnalysis,
  initialGeneratedAt,
  hasSkills,
  matchedJobs,
}: {
  initialAnalysis: CareerAnalysis | null
  initialGeneratedAt: string | null
  hasSkills: boolean
  matchedJobs: MatchedJob[]
}) {
  const [analysis, setAnalysis] = useState(initialAnalysis)
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    setError(null)
    startTransition(async () => {
      const result = await refreshCareerAnalysis()
      if (result.ok) {
        setAnalysis(result.analysis)
        setGeneratedAt(result.generatedAt)
      } else {
        setError(result.error)
      }
    })
  }

  if (!hasSkills) {
    return (
      <FadeIn>
        <Card>
          <CardContent className="p-10 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" strokeWidth={1.5} />
            <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Complete your profile first</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
              Add at least a few skills to your profile so the AI Career Coach has something real to analyze.
            </p>
            <a href="/profile" className="inline-block">
              <Button variant="primary">Complete Profile</Button>
            </a>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header / refresh */}
      <FadeIn className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {generatedAt ? `Last updated: ${formatDate(generatedAt)}` : 'No analysis generated yet.'}
        </p>
        <Button variant="primary" onClick={handleRefresh} disabled={isPending}>
          <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} strokeWidth={2} />
          {isPending ? 'Analyzing your profile…' : 'Refresh Analysis'}
        </Button>
      </FadeIn>

      {error && (
        <FadeIn>
          <Card className="border-red-300 dark:border-red-800/50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isPending}>Retry</Button>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {isPending && !analysis && (
        <FadeIn>
          <Card>
            <CardContent className="p-10 text-center text-slate-600 dark:text-slate-400">
              <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-primary" strokeWidth={1.75} />
              <p className="text-sm">Generating your first analysis — this can take up to a minute.</p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {!analysis && !isPending && !error && (
        <FadeIn>
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Click &quot;Refresh Analysis&quot; to generate your first AI career assessment.
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {analysis && (
        <>
          <div className="grid sm:grid-cols-2 gap-6">
            <InsightCard icon={Gauge} title="ATS Score" delay={0}
              badge={<span className="text-2xl font-extrabold text-primary tabular-nums">{analysis.atsScore.score}</span>}>
              {analysis.atsScore.explanation}
            </InsightCard>
            <InsightCard icon={FileCheck2} title="Profile Strength" delay={0.05}
              badge={<span className="text-2xl font-extrabold text-primary tabular-nums">{analysis.profileStrength.score}</span>}>
              {analysis.profileStrength.explanation}
            </InsightCard>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <InsightCard icon={ListChecks} title="Missing Skills" delay={0.1}>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">Based on your profile</p>
              {analysis.missingSkills.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-500">Nothing significant flagged.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingSkills.map((s) => <SkillTag key={s} label={s} />)}
                </div>
              )}
            </InsightCard>
            <InsightCard icon={KeyRound} title="Missing Keywords" delay={0.15}>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">For resume/ATS optimization</p>
              {analysis.missingKeywords.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-500">Nothing significant flagged.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingKeywords.map((s) => <SkillTag key={s} label={s} />)}
                </div>
              )}
            </InsightCard>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <InsightCard icon={FileEdit} title="Resume Suggestions" delay={0.2}>
              <BulletList items={analysis.resumeSuggestions} />
            </InsightCard>
            <InsightCard icon={MessagesSquare} title="Interview Suggestions" delay={0.25}>
              <BulletList items={analysis.interviewSuggestions} />
            </InsightCard>
          </div>

          <InsightCard icon={Map} title="Career Roadmap" delay={0.3}>
            <div className="grid sm:grid-cols-3 gap-4">
              <RoadmapColumn title="Short term" items={analysis.careerRoadmap.shortTerm} />
              <RoadmapColumn title="Mid term" items={analysis.careerRoadmap.midTerm} />
              <RoadmapColumn title="Long term" items={analysis.careerRoadmap.longTerm} />
            </div>
          </InsightCard>

          <InsightCard icon={GraduationCap} title="Recommended Certifications" delay={0.35}>
            {analysis.recommendedCertifications.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-500">Nothing significant flagged.</p>
            ) : (
              <ul className="space-y-2">
                {analysis.recommendedCertifications.map((c) => (
                  <li key={c.name} className="flex flex-wrap items-baseline gap-2">
                    <SkillTag label={c.name} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{c.rationale}</span>
                  </li>
                ))}
              </ul>
            )}
          </InsightCard>

          <InsightCard icon={DollarSign} title="Salary Prediction" delay={0.4}>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {analysis.salaryPrediction.range || 'Not enough data to estimate.'}
            </p>
            <p className="mb-3">{analysis.salaryPrediction.explanation}</p>
            <div className="flex items-start gap-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800/50 p-3">
              <AlertTriangle className="w-4 h-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-xs text-yellow-800 dark:text-yellow-400">
                This is an AI-generated estimate based on your profile, not real-time market data. Use it as a
                rough starting point, not a guaranteed figure.
              </p>
            </div>
          </InsightCard>
        </>
      )}

      {/* Recommended Jobs — always real data, never part of the LLM response */}
      <FadeIn delay={0.45}>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Recommended Jobs</h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">Real open roles matching your skills</p>
            {matchedJobs.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-500 text-center py-6">
                No matching roles yet — check back soon.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {matchedJobs.map((job) => <JobMatchCard key={job.id} job={job} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
