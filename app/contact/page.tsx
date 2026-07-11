import ContactForm from './ContactForm'

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Contact</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Questions, feedback, or just want to say hello? JobConnect AI is a solo project, so your
          message reaches the person actually building it — replies are personal, but not instant.
        </p>
      </div>

      <ContactForm />
    </div>
  )
}
