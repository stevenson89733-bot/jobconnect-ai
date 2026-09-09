import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | JobConnect AI',
  description: 'Terms of Service for JobConnect AI platform',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-400 mb-12">Last updated: September 2026</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using JobConnect AI ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
            <p>JobConnect AI is a SaaS platform for remote job matching, AI-powered resume optimization, and job applications. We provide tools for both job candidates and employers to connect efficiently.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Pricing Plans</h2>
            <div className="space-y-3">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-2">FREE Plan</h3>
                <p className="text-sm text-slate-400">Forever free with basic job browsing and application tracking features.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-2">PRO Plan — $19.99/month</h3>
                <p className="text-sm text-slate-400">AI Resume Builder, Cover Letter Generator, Auto-Apply (10 jobs/day), LinkedIn Optimizer, and Priority Support.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-2">ELITE Plan — $39.99/month</h3>
                <p className="text-sm text-slate-400">Everything in PRO, plus Auto-Apply (25 jobs/day), Priority Matching, 24/7 Dedicated Support, and Elite Profile Badge.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription & Billing</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Subscriptions renew automatically on a monthly basis</li>
              <li>Billing is processed securely through Paddle</li>
              <li>You may cancel your subscription at any time with no penalties</li>
              <li>Cancellation takes effect at the end of the current billing cycle</li>
              <li>Refunds are not provided for unused portions of a subscription month</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. No Placement Guarantee</h2>
            <p><strong className="text-white">JobConnect AI does not guarantee job placement or employment.</strong> Our service provides tools to improve your job search effectiveness, but actual employment outcomes depend on many external factors beyond our control, including employer decisions, market conditions, and individual qualifications.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Acceptable Use Policy</h2>
            <p className="mb-3">You agree not to use JobConnect AI for:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Posting discriminatory, offensive, or illegal job content</li>
              <li>Harassment, threats, or abuse of other users</li>
              <li>Fraudulent applications or misrepresentation of qualifications</li>
              <li>Spam, phishing, or malware distribution</li>
              <li>Violating any applicable laws or regulations</li>
              <li>Attempting to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. User Content</h2>
            <p>You retain ownership of all content you submit (resumes, profiles, applications). By using our Service, you grant us a license to use your content to provide the Service, including sharing appropriately with potential employers (for candidates) or candidates (for employers).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Account Termination</h2>
            <p>We reserve the right to suspend or terminate your account if you violate these Terms, engage in illegal activity, or misuse the Service. Upon termination, your account data will be handled according to our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p><strong className="text-white">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong> JobConnect AI is provided "AS IS" without warranties of any kind. We are not liable for indirect, incidental, special, or consequential damages arising from your use or inability to use the Service, including lost profits or data loss.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Intellectual Property</h2>
            <p>All content, features, and functionality of JobConnect AI (including AI algorithms, templates, and designs) are owned by JobConnect AI and are protected by international copyright and trademark laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
            <p>These Terms of Service are governed by and construed in accordance with the laws of Singapore, without regard to conflict of law principles. This will take effect following our Singapore incorporation.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p>We may modify these Terms at any time. Significant changes will be communicated via email. Your continued use constitutes acceptance of updated Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact</h2>
            <p className="mb-3">For questions about these Terms, contact us at:</p>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
              <p className="font-semibold text-slate-200">JobConnect AI</p>
              <p className="text-slate-400">Email: <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300">contact@jobconnect-ai.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
