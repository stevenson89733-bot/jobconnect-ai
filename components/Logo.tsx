export default function Logo({ height = 44 }: { height?: number }) {
  return (
    <svg
      viewBox="0 0 800 150"
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      style={{ objectFit: 'contain', width: 'auto', display: 'block', backgroundColor: 'transparent' }}
    >
      {/* JC Icon */}
      <g transform="translate(10, 20)">
        {/* J shape - blue */}
        <path
          d="M 20 10 Q 45 10 45 35 Q 45 55 20 55 Q 10 55 10 48"
          fill="none"
          stroke="#2563EB"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Person icon - blue */}
        <circle cx="28" cy="25" r="6" fill="#2563EB" />
        <ellipse cx="28" cy="43" rx="10" ry="13" fill="#2563EB" />
        {/* C shape - orange */}
        <path
          d="M 60 10 Q 80 10 80 35 Q 80 55 60 55"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* JobConnect text - blue */}
      <text
        x="120"
        y="65"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="50"
        fontWeight="bold"
        fill="#2563EB"
      >
        JobConnect
      </text>

      {/* AI text - orange */}
      <text
        x="620"
        y="65"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="50"
        fontWeight="bold"
        fill="#FF6B35"
      >
        AI
      </text>
    </svg>
  )
}
