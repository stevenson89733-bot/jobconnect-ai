import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-white mb-3">Welcome to JobConnect AI</h1>
      <p className="text-slate-400 mb-10">Choose your dashboard to get started</p>
      <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
        <Link href="/candidate" className="card hover:border-primary/50 transition-all group text-left">
          <div className="text-4xl mb-3">👤</div>
          <h2 className="font-semibold text-white group-hover:text-primary transition-colors mb-1">Candidate Dashboard</h2>
          <p className="text-sm text-slate-400">Track applications, view AI matches, manage your profile</p>
        </Link>
        <Link href="/recruiter" className="card hover:border-accent/50 transition-all group text-left">
          <div className="text-4xl mb-3">🏢</div>
          <h2 className="font-semibold text-white group-hover:text-accent transition-colors mb-1">Employer Dashboard</h2>
          <p className="text-sm text-slate-400">Post jobs, review candidates, manage your hiring pipeline</p>
        </Link>
      </div>
    </div>
  )
}
