export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* SVG Logo */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 36 36"
        className="flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue rounded background */}
        <rect width="36" height="36" rx="8" fill="#2E5CF6" />

        {/* JC text */}
        <text
          x="18"
          y="22"
          textAnchor="middle"
          fontSize="16"
          fontWeight="800"
          fill="white"
          fontFamily="Inter, Sora, system-ui"
        >
          JC
        </text>
      </svg>

      {/* Text: JobConnect AI */}
      <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight">
        JobConnect{' '}
        <span className="text-blue-600 dark:text-blue-400">AI</span>
      </span>
    </div>
  )
}
