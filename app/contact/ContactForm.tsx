'use client'
import { useState } from 'react'
import { submitContactMessage } from '@/app/actions/contact'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setError('')
    const result = await submitContactMessage({ name, email, message })
    if (result.ok) {
      setStatus('sent')
      setName('')
      setEmail('')
      setMessage('')
    } else {
      setStatus('error')
      setError(result.error || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="card text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-white mb-1">Message sent — thank you.</p>
        <p>It goes straight to the founder&apos;s inbox. It&apos;s a solo project, so replies are personal
        but not instant — expect to hear back within a few days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60"
      >
        {status === 'saving' ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}
