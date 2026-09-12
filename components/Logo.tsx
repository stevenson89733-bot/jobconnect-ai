export default function Logo({ height = 44 }: { height?: number }) {
  return (
    <svg
      viewBox="0 0 1400 320"
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      style={{ objectFit: 'contain', width: 'auto' }}
    >
      {/* JC Icon */}
      <g transform="translate(60, 60)">
        {/* J shape - blue */}
        <path
          d="M 40 20 Q 80 20 80 60 Q 80 100 40 100 Q 20 100 20 85"
          fill="none"
          stroke="#2563EB"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Person icon - blue */}
        <circle cx="50" cy="45" r="12" fill="#2563EB" />
        <ellipse cx="50" cy="75" rx="20" ry="25" fill="#2563EB" />
        {/* C shape - orange */}
        <path
          d="M 120 20 Q 150 20 150 60 Q 150 100 120 100"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* JobConnect text - blue */}
      <text
        x="280"
        y="130"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="110"
        fontWeight="bold"
        fill="#2563EB"
        letterSpacing="-2"
      >
        JobConnect
      </text>

      {/* AI text - orange */}
      <text
        x="1130"
        y="130"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="110"
        fontWeight="bold"
        fill="#FF6B35"
      >
        AI
      </text>

      {/* Tagline - dark blue */}
      <text
        x="280"
        y="200"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="32"
        fill="#1E3A5F"
        fontWeight="500"
        letterSpacing="1"
      >
        CONNECTING TALENT. BUILDING FUTURES.
      </text>
    </svg>
  )
}
