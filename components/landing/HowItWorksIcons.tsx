// Custom SVG icons for HowItWorks — hand-drawn, on-brand.
// 20×20 viewBox, strokeWidth 1.5, rounded caps/joins.
// No lucide dependency — these are unique to the product.

export function IconCrossBorder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Globe arc */}
      <circle cx="10" cy="10" r="7.5" />
      {/* Horizontal equator */}
      <path d="M2.5 10h15" />
      {/* Vertical meridian */}
      <path d="M10 2.5c-2 2-3 4.5-3 7.5s1 5.5 3 7.5" />
      <path d="M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5" />
      {/* Cross-border arrow */}
      <path d="M6 7l8 0M11 5l3 2-3 2" />
    </svg>
  )
}

export function IconLanguage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Speech bubble left */}
      <path d="M3 4h9a1 1 0 011 1v5a1 1 0 01-1 1H8l-3 2v-2H3a1 1 0 01-1-1V5a1 1 0 011-1z" />
      {/* "A" inside */}
      <path d="M5.5 8.5l1-2.5 1 2.5M5.8 7.8h1.4" />
      {/* "文" hint — small strokes representing CJK */}
      <path d="M13.5 10.5h3a1 1 0 011 1v3a1 1 0 01-1 1h-1l-2 1.5v-1.5h-.5a.5.5 0 01-.5-.5v-.5" />
      <path d="M14.5 12.5h1.5M15.25 11.5v2" />
    </svg>
  )
}

export function IconSalary({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Currency symbol */}
      <path d="M10 3v14M7 5.5C7 4.12 8.34 3 10 3s3 1.12 3 2.5S11.66 8 10 8s-3 1.12-3 2.5S8.34 13 10 13s3-1.12 3-2.5" />
      {/* Arrow right (conversion) */}
      <path d="M14.5 16l2-1.5-2-1.5" />
      <path d="M3.5 14.5h13" />
    </svg>
  )
}

export function IconATS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Score ring arc — ~85% filled */}
      <path d="M10 3a7 7 0 016.06 3.5" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.06 6.5A7 7 0 113.94 6.5" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="22 4" />
      {/* Score label */}
      <text x="10" y="11.5" textAnchor="middle" fontSize="4.5" fontWeight="700"
        stroke="none" fill="currentColor" fontFamily="inherit">85</text>
      <text x="10" y="14.5" textAnchor="middle" fontSize="2.8"
        stroke="none" fill="currentColor" opacity="0.6" fontFamily="inherit">ATS</text>
    </svg>
  )
}
