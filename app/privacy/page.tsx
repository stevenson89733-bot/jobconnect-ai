import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | JobConnect AI',
  description: 'GDPR-compliant privacy policy - how we handle your data',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-12">Last updated: September 2026</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>JobConnect AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Email address and account credentials</li>
                  <li>Full name, profile information, and location</li>
                  <li>Resumes, cover letters, and work experience</li>
                  <li>Application history and job preferences</li>
                  <li>Payment information (processed securely through Paddle)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Automatically Collected Data</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Browser type, IP address, and device information</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Referral source and interaction patterns (via Meta Pixel)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Third-Party Service Providers</h2>
            <p className="mb-4">We use the following service providers to operate our platform:</p>
            <div className="space-y-3">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-1">Supabase</h3>
                <p className="text-sm text-slate-400">Cloud database and authentication. Stores user accounts, profiles, and application data.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-1">Resend</h3>
                <p className="text-sm text-slate-400">Email service provider. Sends transactional emails (password resets, notifications).</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-1">Crisp Chat</h3>
                <p className="text-sm text-slate-400">Customer support platform. Enables live chat and communication with our support team.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-1">Meta Pixel</h3>
                <p className="text-sm text-slate-400">Analytics and advertising. Tracks user interactions to improve our service and measure marketing campaigns.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-200 mb-1">Paddle</h3>
                <p className="text-sm text-slate-400">Payment processor. Handles subscription payments securely without storing card details on our servers.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide and improve our job matching and AI tools</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send transactional and operational emails</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and maintain platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Privacy Rights (GDPR & EU Users)</h2>
            <p className="mb-4">If you are in the European Union or UK, you have the following rights:</p>
            <div className="space-y-2">
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded">
                <h3 className="font-semibold text-slate-200">Right to Access</h3>
                <p className="text-sm text-slate-400">Request a copy of your personal data we hold.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded">
                <h3 className="font-semibold text-slate-200">Right to Rectification</h3>
                <p className="text-sm text-slate-400">Correct inaccurate or incomplete personal data.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded">
                <h3 className="font-semibold text-slate-200">Right to Erasure</h3>
                <p className="text-sm text-slate-400">Request deletion of your personal data, subject to legal obligations.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded">
                <h3 className="font-semibold text-slate-200">Right to Data Portability</h3>
                <p className="text-sm text-slate-400">Receive your data in a structured format and transfer it to another provider.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded">
                <h3 className="font-semibold text-slate-200">Right to Object</h3>
                <p className="text-sm text-slate-400">Object to processing for marketing or analytics purposes.</p>
              </div>
            </div>
            <p className="mt-4">To exercise these rights, contact us at <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300">contact@jobconnect-ai.com</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide services. Upon account deletion, your data is permanently removed from our systems within 30 days, except where we are legally required to retain it.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data Sharing & Sales</h2>
            <p><strong className="text-white">We do NOT sell your personal data to third parties.</strong> We only share data with service providers who assist us in operating the platform, and only to the extent necessary to provide the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, firewalls, and secure authentication. However, no transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies & Analytics</h2>
            <p>We use cookies to enhance your experience and analyze usage through Meta Pixel. You can control cookie preferences through our consent banner. Most browsers allow you to refuse cookies or alert you when a cookie is being sent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="mb-3">If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us at:</p>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
              <p className="font-semibold text-slate-200">JobConnect AI</p>
              <p className="text-slate-400">Email: <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300">contact@jobconnect-ai.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Compliance</h2>
            <p>This Privacy Policy is compliant with the EU General Data Protection Regulation (GDPR), UK Data Protection Act 2018, and other applicable data protection laws. We are committed to maintaining the highest standards of data privacy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email. Your continued use of our platform constitutes acceptance of the updated policy.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
