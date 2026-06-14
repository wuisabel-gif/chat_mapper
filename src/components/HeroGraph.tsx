/**
 * Faint ambient node-graph behind the hero — sets the "topic map" expectation
 * without competing with the content. Decorative only (aria-hidden), low
 * opacity, and animation is suppressed under prefers-reduced-motion globally.
 */
const NODES = [
  { x: 130, y: 70, r: 5, d: "0s" },
  { x: 330, y: 50, r: 4, d: "1.2s" },
  { x: 520, y: 95, r: 6, d: "0.6s" },
  { x: 680, y: 60, r: 4, d: "1.8s" },
  { x: 230, y: 190, r: 4, d: "0.9s" },
  { x: 430, y: 210, r: 7, d: "0.3s" },
  { x: 610, y: 195, r: 5, d: "1.5s" },
  { x: 770, y: 165, r: 4, d: "0.5s" },
];

const EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 2], [5, 6], [6, 3], [6, 7], [2, 6],
];

export function HeroGraph() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <svg
        viewBox="0 0 900 260"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full text-brand-blue"
      >
        <g stroke="currentColor" strokeWidth="1" opacity="0.18">
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              style={{ animation: "graph-pulse 6s ease-in-out infinite", animationDelay: NODES[a].d }}
            />
          ))}
        </g>
        <g fill="currentColor" opacity="0.28">
          {NODES.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              style={{ animation: "float-y 7s ease-in-out infinite", animationDelay: n.d }}
            />
          ))}
        </g>
      </svg>
      {/* Fade the graph out toward the bottom so it never fights the content. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black" />
    </div>
  );
}
