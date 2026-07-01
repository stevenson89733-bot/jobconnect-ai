interface JobCardProps {
  title: string
  company: string
  location: string
  salary?: string
  type?: string
  tags?: string[]
}

export default function JobCard({ title, company, location, salary, type, tags }: JobCardProps) {
  return (
    <article className="card hover:border-primary/50 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-300">
          {company[0]}
        </div>
        {type && (
          <span className={`badge text-xs ${type === 'Full-time' ? 'bg-green-900/40 text-green-400' : 'bg-orange-900/40 text-orange-400'}`}>
            {type}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-white group-hover:text-primary transition-colors mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-0.5">{company}</p>
      <p className="text-xs text-slate-500 mb-3">{location}</p>
      {tags && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="badge bg-slate-700/60 text-slate-400 text-xs">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        {salary && <span className="text-sm font-semibold text-accent">{salary}</span>}
        <button className="btn-primary text-xs py-1.5 px-4 ml-auto">Apply</button>
      </div>
    </article>
  )
}
