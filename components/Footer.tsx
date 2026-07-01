import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-black">J</span>
              <span className="text-white">JobConnect <span className="text-primary">AI</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">AI-powered remote job platform connecting top candidates with leading companies worldwide.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/jobs" className="hover:text-slate-300 transition-colors">Browse Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-slate-300 transition-colors">Companies</Link></li>
              <li><Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">For Employers</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/register?role=employer" className="hover:text-slate-300 transition-colors">Post a Job</Link></li>
              <li><Link href="/dashboard/employer" className="hover:text-slate-300 transition-colors">Employer Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/about" className="hover:text-slate-300 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} JobConnect AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
