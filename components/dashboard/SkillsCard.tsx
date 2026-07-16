import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import FadeIn from './FadeIn'

export default function SkillsCard({ skills }: { skills: string[] }) {
  return (
    <FadeIn className="h-full">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {skills.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          )}
          <Link href="/profile" className="mt-5 block text-center text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">
            Update skills →
          </Link>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
