// Cross-border network motif: nodes = cities/hubs, edges = connections.
// Hand-placed coordinates — not algorithmically random — so the composition
// reads as deliberate (denser left→right gradient, two large hubs off-center).
// Server component: no JS shipped, pure SVG markup.

const NODES: [number, number, number][] = [
  // [x, y, radius]  — viewBox 1200×500
  [80,  180, 3  ],  // 0
  [160, 300, 5  ],  // 1
  [110, 420, 2.5],  // 2
  [250, 130, 3.5],  // 3
  [340, 240, 4  ],  // 4
  [300, 390, 2.5],  // 5
  [450,  70, 4  ],  // 6
  [480, 200, 7  ],  // 7  ← hub
  [440, 340, 3  ],  // 8
  [510, 450, 2  ],  // 9
  [620, 110, 4.5],  // 10
  [650, 260, 5  ],  // 11
  [600, 400, 3  ],  // 12
  [760,  80, 3.5],  // 13
  [780, 210, 8  ],  // 14 ← hub
  [730, 370, 3  ],  // 15
  [820, 460, 2  ],  // 16
  [900, 130, 4  ],  // 17
  [940, 280, 5  ],  // 18
  [870, 390, 3  ],  // 19
  [1020,  90, 3.5], // 20
  [1060, 220, 4  ], // 21
  [1000, 370, 3  ], // 22
  [1120, 300, 2.5], // 23
]

const EDGES: [number, number][] = [
  [0,1],[0,3],[1,2],[1,4],[3,4],[3,6],[4,5],[4,7],[4,8],
  [5,8],[6,7],[6,10],[7,8],[7,10],[7,11],[8,9],[8,12],
  [10,11],[10,13],[11,12],[11,14],[12,15],[13,14],[13,17],
  [14,15],[14,17],[14,18],[15,16],[15,19],[17,18],[17,20],
  [18,19],[18,21],[19,22],[20,21],[21,22],[21,23],[22,23],
]

const HUBS = new Set([7, 14])

export default function HeroNetwork() {
  return (
    <svg
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-x-0 top-0 w-full"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a][0]} y1={NODES[a][1]}
          x2={NODES[b][0]} y2={NODES[b][1]}
          className="stroke-primary/[0.22] dark:stroke-blue-400/[0.22]"
          strokeWidth="1"
        />
      ))}

      {/* Halo around hub nodes */}
      {[7, 14].map((idx) => (
        <circle
          key={`halo-${idx}`}
          cx={NODES[idx][0]}
          cy={NODES[idx][1]}
          r={NODES[idx][2] * 3.5}
          className="fill-primary/[0.15] dark:fill-blue-400/[0.15]"
        />
      ))}

      {NODES.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x} cy={y} r={r}
          className={
            HUBS.has(i)
              ? 'fill-primary/75 dark:fill-blue-400/80'
              : 'fill-primary/45 dark:fill-blue-400/50'
          }
        />
      ))}
    </svg>
  )
}
