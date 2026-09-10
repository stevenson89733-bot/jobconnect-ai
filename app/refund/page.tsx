import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy | JobConnect AI',
  description: 'Refund and cancellation policy for JobConnect AI subscriptions',
}

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Refund Policy</h1>
        <p className="text-slate-400 mb-12">Last updated: September 2026</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Subscription Cancellation</h2>
            <p className="mb-4">You can cancel your JobConnect AI subscription at any time, with no penalties or additional fees. Simply access your account settings or contact our support team.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Refund Policy</h2>
            <p className="mb-4">We do not offer refunds for charges already processed during your current billing period. Cancellation takes effect at the end of your billing cycle, and you will retain access to all premium features until that date.</p>
            <p>If you have concerns about a charge or believe you were charged in error, please contact us immediately at <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300 underline">contact@jobconnect-ai.com</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p>For questions about our refund policy or to request cancellation, please reach out to:</p>
            <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
              <p className="font-semibold text-slate-200">Email:</p>
              <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300 underline">contact@jobconnect-ai.com</a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
