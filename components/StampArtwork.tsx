"use client";

// Each function receives (r, inner) where r = centre of SVG, inner = inner ring radius
// All artwork is contained within the inner circle, drawn at ~60% of inner radius

type ArtFn = (r: number, inner: number) => React.ReactNode;

const s = (color: string) => ({ stroke: color, fill: "none" as const });
const f = (color: string, op = 0.45) => ({ fill: color, fillOpacity: op, stroke: "none" as const });

// Reusable shapes
const temple3Pillars = (r: number, inner: number, c: string): React.ReactNode => {
  const w = inner * 0.62, h = inner * 0.52, x0 = r - w / 2, y0 = r - inner * 0.3;
  const ph = h * 0.85, pw = w * 0.1;
  return (
    <g opacity={0.55}>
      <rect x={x0} y={y0} width={w} height={h * 0.12} {...f(c, 0.4)} />
      {[-0.22, 0, 0.22].map((d, i) => (
        <rect key={i} x={r + d * w - pw / 2} y={y0 + h * 0.12} width={pw} height={ph} fill={c} fillOpacity={0.3} />
      ))}
      <rect x={x0} y={y0 + h * 0.12 + ph} width={w} height={h * 0.1} {...f(c, 0.4)} />
    </g>
  );
};

const mountain = (r: number, inner: number, c: string, peaks = 2): React.ReactNode => {
  const base = r + inner * 0.28;
  const pts = peaks === 2
    ? `${r - inner * 0.38},${base} ${r - inner * 0.1},${r - inner * 0.3} ${r + inner * 0.15},${r - inner * 0.05} ${r + inner * 0.38},${r - inner * 0.32} ${r + inner * 0.5},${base}`
    : `${r - inner * 0.45},${base} ${r},${r - inner * 0.38} ${r + inner * 0.45},${base}`;
  return <polyline points={pts} stroke={c} strokeWidth={1.2} fill="none" opacity={0.55} />;
};

const leaf = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.55}>
    <path d={`M${r} ${r + inner * 0.28} Q${r - inner * 0.28} ${r - inner * 0.05} ${r} ${r - inner * 0.38} Q${r + inner * 0.28} ${r - inner * 0.05} ${r} ${r + inner * 0.28}`} stroke={c} fill="none" strokeWidth={1.2} />
    <line x1={r} y1={r - inner * 0.38} x2={r} y2={r + inner * 0.28} stroke={c} strokeWidth={0.8} />
    {[-0.14, 0.08].map((yo, i) => (
      <g key={i}>
        <line x1={r} y1={r + yo * inner} x2={r - inner * 0.16} y2={r + yo * inner - inner * 0.12} stroke={c} strokeWidth={0.7} />
        <line x1={r} y1={r + yo * inner} x2={r + inner * 0.16} y2={r + yo * inner - inner * 0.12} stroke={c} strokeWidth={0.7} />
      </g>
    ))}
  </g>
);

const waterfall = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.55}>
    {[-0.12, 0, 0.12].map((dx, i) => (
      <path key={i} d={`M${r + dx * inner} ${r - inner * 0.35} Q${r + dx * inner + inner * 0.04} ${r} ${r + dx * inner} ${r + inner * 0.35}`} stroke={c} strokeWidth={1} fill="none" />
    ))}
    <path d={`M${r - inner * 0.35} ${r + inner * 0.32} Q${r - inner * 0.1} ${r + inner * 0.42} ${r} ${r + inner * 0.38} Q${r + inner * 0.1} ${r + inner * 0.34} ${r + inner * 0.35} ${r + inner * 0.32}`} stroke={c} strokeWidth={1} fill="none" />
  </g>
);

const fort = (r: number, inner: number, c: string): React.ReactNode => {
  const w = inner * 0.58, h = inner * 0.42, x0 = r - w / 2, y0 = r - inner * 0.18;
  return (
    <g opacity={0.55}>
      <rect x={x0} y={y0} width={w} height={h} stroke={c} fill="none" strokeWidth={1} />
      {[0, w * 0.25, w * 0.5, w * 0.75, w].map((dx, i) => (
        <rect key={i} x={x0 + dx - 3} y={y0 - 8} width={6} height={8} stroke={c} fill="none" strokeWidth={1} />
      ))}
      <rect x={r - 6} y={y0 + h * 0.3} width={12} height={h * 0.7} stroke={c} fill="none" strokeWidth={1} />
    </g>
  );
};

const dome = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.55}>
    <path d={`M${r - inner * 0.3} ${r + inner * 0.2} L${r - inner * 0.3} ${r + inner * 0.05} A${inner * 0.3},${inner * 0.38} 0 0,1 ${r + inner * 0.3},${r + inner * 0.05} L${r + inner * 0.3} ${r + inner * 0.2}Z`} stroke={c} fill="none" strokeWidth={1.2} />
    <line x1={r - inner * 0.3} y1={r + inner * 0.2} x2={r + inner * 0.3} y2={r + inner * 0.2} stroke={c} strokeWidth={1} />
    <line x1={r} y1={r + inner * 0.05} x2={r} y2={r - inner * 0.15} stroke={c} strokeWidth={0.8} />
    <rect x={r - inner * 0.05} y={r - inner * 0.22} width={inner * 0.1} height={inner * 0.08} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const lighthouse = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.55}>
    <polygon points={`${r - inner * 0.1},${r + inner * 0.3} ${r + inner * 0.1},${r + inner * 0.3} ${r + inner * 0.06},${r - inner * 0.28} ${r - inner * 0.06},${r - inner * 0.28}`} stroke={c} fill="none" strokeWidth={1.1} />
    <ellipse cx={r} cy={r - inner * 0.28} rx={inner * 0.1} ry={inner * 0.07} stroke={c} fill="none" strokeWidth={1} />
    {[-0.18, 0.18].map((dx, i) => <line key={i} x1={r} y1={r - inner * 0.25} x2={r + dx * inner} y2={r - inner * 0.4} stroke={c} strokeWidth={0.7} opacity={0.6} />)}
    <line x1={r - inner * 0.12} y1={r + inner * 0.3} x2={r + inner * 0.12} y2={r + inner * 0.3} stroke={c} strokeWidth={1.2} />
  </g>
);

const elephant = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <ellipse cx={r} cy={r + inner * 0.05} rx={inner * 0.22} ry={inner * 0.2} stroke={c} fill="none" strokeWidth={1.1} />
    <circle cx={r} cy={r - inner * 0.22} r={inner * 0.16} stroke={c} fill="none" strokeWidth={1.1} />
    <path d={`M${r + inner * 0.1} ${r - inner * 0.06} Q${r + inner * 0.35} ${r} ${r + inner * 0.3} ${r + inner * 0.2}`} stroke={c} fill="none" strokeWidth={1} />
    {[-0.12, 0.12].map((dx, i) => (
      <line key={i} x1={r + dx * inner} y1={r + inner * 0.24} x2={r + dx * inner} y2={r + inner * 0.38} stroke={c} strokeWidth={1} />
    ))}
  </g>
);

const tiger = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <ellipse cx={r} cy={r + inner * 0.08} rx={inner * 0.3} ry={inner * 0.18} stroke={c} fill="none" strokeWidth={1} />
    <circle cx={r - inner * 0.15} cy={r - inner * 0.18} r={inner * 0.14} stroke={c} fill="none" strokeWidth={1} />
    {[-0.22, -0.08, 0.08, 0.22].map((dx, i) => (
      <line key={i} x1={r + dx * inner} y1={r + inner * 0.26} x2={r + dx * inner} y2={r + inner * 0.38} stroke={c} strokeWidth={0.9} />
    ))}
    {[-0.24, -0.08, 0.08].map((dx, i) => (
      <line key={i} x1={r + dx * inner} y1={r + inner * 0.02} x2={r + dx * inner} y2={r + inner * 0.15} stroke={c} strokeWidth={0.7} opacity={0.5} />
    ))}
  </g>
);

const squirrel = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <ellipse cx={r} cy={r + inner * 0.12} rx={inner * 0.14} ry={inner * 0.2} stroke={c} fill="none" strokeWidth={1} />
    <circle cx={r} cy={r - inner * 0.12} r={inner * 0.12} stroke={c} fill="none" strokeWidth={1} />
    <path d={`M${r + inner * 0.14} ${r - inner * 0.04} Q${r + inner * 0.4} ${r - inner * 0.3} ${r + inner * 0.3} ${r - inner * 0.42}`} stroke={c} fill="none" strokeWidth={1.2} />
  </g>
);

const peacock = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <ellipse cx={r} cy={r + inner * 0.12} rx={inner * 0.14} ry={inner * 0.1} stroke={c} fill="none" strokeWidth={1} />
    <circle cx={r} cy={r - inner * 0.02} r={inner * 0.08} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r} y1={r - inner * 0.1} x2={r} y2={r - inner * 0.28} stroke={c} strokeWidth={0.8} />
    {[-0.25, -0.15, 0, 0.15, 0.25].map((dx, i) => (
      <line key={i} x1={r} y1={r - inner * 0.1} x2={r + dx * inner} y2={r - inner * 0.38} stroke={c} strokeWidth={0.7} opacity={0.6} />
    ))}
  </g>
);

const deer = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <ellipse cx={r} cy={r + inner * 0.1} rx={inner * 0.2} ry={inner * 0.14} stroke={c} fill="none" strokeWidth={1} />
    <circle cx={r - inner * 0.1} cy={r - inner * 0.14} r={inner * 0.1} stroke={c} fill="none" strokeWidth={1} />
    {[-0.08, 0.08].map((dx, i) => (
      <g key={i}>
        <line x1={r - inner * 0.1 + dx * inner} y1={r - inner * 0.24} x2={r - inner * 0.1 + dx * inner} y2={r - inner * 0.38} stroke={c} strokeWidth={0.8} />
        <line x1={r - inner * 0.1 + dx * inner} y1={r - inner * 0.32} x2={r - inner * 0.1 + dx * inner + (dx > 0 ? 0.1 : -0.1) * inner} y2={r - inner * 0.42} stroke={c} strokeWidth={0.7} />
      </g>
    ))}
  </g>
);

const pelican = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <ellipse cx={r} cy={r + inner * 0.05} rx={inner * 0.18} ry={inner * 0.12} stroke={c} fill="none" strokeWidth={1} />
    <circle cx={r} cy={r - inner * 0.16} r={inner * 0.1} stroke={c} fill="none" strokeWidth={1} />
    <path d={`M${r + inner * 0.06} ${r - inner * 0.06} L${r + inner * 0.28} ${r - inner * 0.14} L${r + inner * 0.22} ${r - inner * 0.04}`} stroke={c} fill="none" strokeWidth={0.9} />
  </g>
);

const stork = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <line x1={r} y1={r - inner * 0.35} x2={r} y2={r + inner * 0.12} stroke={c} strokeWidth={1} />
    <ellipse cx={r} cy={r - inner * 0.28} rx={inner * 0.08} ry={inner * 0.06} stroke={c} fill="none" strokeWidth={0.8} />
    <path d={`M${r - inner * 0.22} ${r - inner * 0.08} Q${r} ${r - inner * 0.18} ${r + inner * 0.22} ${r - inner * 0.08}`} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r} y1={r + inner * 0.12} x2={r - inner * 0.14} y2={r + inner * 0.3} stroke={c} strokeWidth={0.9} />
    <line x1={r} y1={r + inner * 0.12} x2={r + inner * 0.14} y2={r + inner * 0.3} stroke={c} strokeWidth={0.9} />
  </g>
);

const palace = (r: number, inner: number, c: string): React.ReactNode => {
  const w = inner * 0.7, h = inner * 0.45, x0 = r - w / 2, y0 = r - inner * 0.12;
  return (
    <g opacity={0.5}>
      <rect x={x0} y={y0} width={w} height={h} stroke={c} fill="none" strokeWidth={1} />
      <path d={`M${x0} ${y0} Q${r} ${y0 - inner * 0.28} ${x0 + w} ${y0}`} stroke={c} fill="none" strokeWidth={0.9} />
      <rect x={r - inner * 0.06} y={y0 + h * 0.4} width={inner * 0.12} height={h * 0.6} stroke={c} fill="none" strokeWidth={0.8} />
      {[-0.22, 0.22].map((dx, i) => (
        <path key={i} d={`M${r + dx * inner - inner * 0.06} ${y0 + inner * 0.04} Q${r + dx * inner} ${y0 - inner * 0.06} ${r + dx * inner + inner * 0.06} ${y0 + inner * 0.04}`} stroke={c} fill="none" strokeWidth={0.8} />
      ))}
    </g>
  );
};

const mosque = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <rect x={r - inner * 0.28} y={r - inner * 0.1} width={inner * 0.56} height={inner * 0.38} stroke={c} fill="none" strokeWidth={1} />
    <path d={`M${r - inner * 0.28} ${r - inner * 0.1} Q${r} ${r - inner * 0.4} ${r + inner * 0.28} ${r - inner * 0.1}`} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r - inner * 0.32} y1={r - inner * 0.35} x2={r - inner * 0.32} y2={r + inner * 0.28} stroke={c} strokeWidth={0.9} />
    <line x1={r + inner * 0.32} y1={r - inner * 0.35} x2={r + inner * 0.32} y2={r + inner * 0.28} stroke={c} strokeWidth={0.9} />
    <ellipse cx={r - inner * 0.32} cy={r - inner * 0.35} rx={inner * 0.04} ry={inner * 0.06} stroke={c} fill="none" strokeWidth={0.8} />
    <ellipse cx={r + inner * 0.32} cy={r - inner * 0.35} rx={inner * 0.04} ry={inner * 0.06} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const monolith = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <polygon points={`${r - inner * 0.1},${r + inner * 0.35} ${r + inner * 0.1},${r + inner * 0.35} ${r + inner * 0.06},${r - inner * 0.35} ${r - inner * 0.06},${r - inner * 0.35}`} stroke={c} fill="none" strokeWidth={1.1} />
    <ellipse cx={r} cy={r + inner * 0.35} rx={inner * 0.16} ry={inner * 0.06} stroke={c} fill="none" strokeWidth={0.8} />
    <line x1={r - inner * 0.14} y1={r} x2={r + inner * 0.14} y2={r} stroke={c} strokeWidth={0.7} opacity={0.5} />
  </g>
);

const clock = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <circle cx={r} cy={r - inner * 0.08} r={inner * 0.24} stroke={c} fill="none" strokeWidth={1.1} />
    <line x1={r} y1={r - inner * 0.08} x2={r} y2={r - inner * 0.28} stroke={c} strokeWidth={1.2} />
    <line x1={r} y1={r - inner * 0.08} x2={r + inner * 0.15} y2={r - inner * 0.03} stroke={c} strokeWidth={0.9} />
    <line x1={r - inner * 0.08} y1={r + inner * 0.18} x2={r + inner * 0.08} y2={r + inner * 0.18} stroke={c} strokeWidth={1} />
    <rect x={r - inner * 0.04} y={r + inner * 0.18} width={inner * 0.08} height={inner * 0.18} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const coffeePlant = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <line x1={r} y1={r + inner * 0.3} x2={r} y2={r - inner * 0.3} stroke={c} strokeWidth={1} />
    {[-0.32, -0.16, 0.16, 0.32].map((dy, i) => (
      <path key={i} d={`M${r} ${r + dy * inner} Q${r + (i % 2 === 0 ? -1 : 1) * inner * 0.22} ${r + dy * inner - inner * 0.04} ${r + (i % 2 === 0 ? -1 : 1) * inner * 0.26} ${r + dy * inner}`} stroke={c} fill="none" strokeWidth={0.9} />
    ))}
    {[-0.1, 0.1].map((dx, i) => <circle key={i} cx={r + dx * inner} cy={r + inner * 0.26} r={3} stroke={c} fill="none" strokeWidth={0.7} />)}
  </g>
);

const waterwaves = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    {[-0.18, -0.04, 0.1, 0.24].map((dy, i) => (
      <path key={i} d={`M${r - inner * 0.34} ${r + dy * inner} Q${r - inner * 0.1} ${r + dy * inner - inner * 0.08} ${r} ${r + dy * inner} Q${r + inner * 0.1} ${r + dy * inner + inner * 0.08} ${r + inner * 0.34} ${r + dy * inner}`} stroke={c} fill="none" strokeWidth={0.9} />
    ))}
  </g>
);

const pillar = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    {[-0.3, -0.1, 0.1, 0.3].map((dx, i) => (
      <g key={i}>
        <rect x={r + dx * inner - inner * 0.05} y={r - inner * 0.32} width={inner * 0.1} height={inner * 0.62} stroke={c} fill="none" strokeWidth={0.9} />
        <ellipse cx={r + dx * inner} cy={r - inner * 0.32} rx={inner * 0.07} ry={inner * 0.04} stroke={c} fill="none" strokeWidth={0.7} />
      </g>
    ))}
    <line x1={r - inner * 0.38} y1={r + inner * 0.3} x2={r + inner * 0.38} y2={r + inner * 0.3} stroke={c} strokeWidth={1} />
  </g>
);

const rockCave = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r - inner * 0.4} ${r + inner * 0.3} Q${r - inner * 0.38} ${r - inner * 0.18} ${r - inner * 0.15} ${r - inner * 0.32} Q${r} ${r - inner * 0.42} ${r + inner * 0.15} ${r - inner * 0.32} Q${r + inner * 0.38} ${r - inner * 0.18} ${r + inner * 0.4} ${r + inner * 0.3}`} stroke={c} fill="none" strokeWidth={1.1} />
    <path d={`M${r - inner * 0.15} ${r + inner * 0.3} Q${r - inner * 0.14} ${r + inner * 0.08} ${r - inner * 0.08} ${r - inner * 0.02} A${inner * 0.12},${inner * 0.14} 0 0,1 ${r + inner * 0.08} ${r - inner * 0.02} Q${r + inner * 0.14} ${r + inner * 0.08} ${r + inner * 0.15} ${r + inner * 0.3}`} stroke={c} fill="none" strokeWidth={0.9} />
  </g>
);

const satellite = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <rect x={r - inner * 0.08} y={r - inner * 0.08} width={inner * 0.16} height={inner * 0.16} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r - inner * 0.08} y1={r} x2={r - inner * 0.34} y2={r} stroke={c} strokeWidth={0.9} />
    <line x1={r + inner * 0.08} y1={r} x2={r + inner * 0.34} y2={r} stroke={c} strokeWidth={0.9} />
    <rect x={r - inner * 0.34} y={r - inner * 0.1} width={inner * 0.12} height={inner * 0.2} stroke={c} fill="none" strokeWidth={0.8} />
    <rect x={r + inner * 0.22} y={r - inner * 0.1} width={inner * 0.12} height={inner * 0.2} stroke={c} fill="none" strokeWidth={0.8} />
    <path d={`M${r - inner * 0.1} ${r - inner * 0.1} L${r} ${r - inner * 0.28} L${r + inner * 0.1} ${r - inner * 0.1}`} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const minaret = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <polygon points={`${r - inner * 0.06},${r + inner * 0.35} ${r + inner * 0.06},${r + inner * 0.35} ${r + inner * 0.04},${r - inner * 0.15} ${r - inner * 0.04},${r - inner * 0.15}`} stroke={c} fill="none" strokeWidth={1} />
    <path d={`M${r - inner * 0.08} ${r - inner * 0.15} Q${r} ${r - inner * 0.38} ${r + inner * 0.08} ${r - inner * 0.15}`} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r} y1={r - inner * 0.38} x2={r} y2={r - inner * 0.44} stroke={c} strokeWidth={0.8} />
    {[-0.2, 0.2].map((dx, i) => (
      <polygon key={i} points={`${r + dx * inner - inner * 0.04},${r + inner * 0.35} ${r + dx * inner + inner * 0.04},${r + inner * 0.35} ${r + dx * inner + inner * 0.03},${r - inner * 0.08} ${r + dx * inner - inner * 0.03},${r - inner * 0.08}`} stroke={c} fill="none" strokeWidth={0.8} />
    ))}
  </g>
);

const goldenMine = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r - inner * 0.3} ${r + inner * 0.3} L${r - inner * 0.3} ${r - inner * 0.1} L${r} ${r - inner * 0.35} L${r + inner * 0.3} ${r - inner * 0.1} L${r + inner * 0.3} ${r + inner * 0.3}`} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r - inner * 0.3} y1={r + inner * 0.1} x2={r + inner * 0.3} y2={r + inner * 0.1} stroke={c} strokeWidth={0.8} />
    <line x1={r - inner * 0.3} y1={r - inner * 0.02} x2={r + inner * 0.3} y2={r - inner * 0.02} stroke={c} strokeWidth={0.6} opacity={0.6} />
    <rect x={r - inner * 0.08} y={r + inner * 0.1} width={inner * 0.16} height={inner * 0.2} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const cannon = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r - inner * 0.34} ${r + inner * 0.08} Q${r - inner * 0.34} ${r - inner * 0.1} ${r - inner * 0.2} ${r - inner * 0.12} L${r + inner * 0.3} ${r - inner * 0.06} Q${r + inner * 0.38} ${r - inner * 0.04} ${r + inner * 0.38} ${r + inner * 0.06} Q${r + inner * 0.38} ${r + inner * 0.16} ${r + inner * 0.3} ${r + inner * 0.18} L${r - inner * 0.2} ${r + inner * 0.24} Q${r - inner * 0.34} ${r + inner * 0.26} ${r - inner * 0.34} ${r + inner * 0.08}Z`} stroke={c} fill="none" strokeWidth={1} />
    <circle cx={r - inner * 0.28} cy={r + inner * 0.3} r={inner * 0.1} stroke={c} fill="none" strokeWidth={0.9} />
    <circle cx={r + inner * 0.24} cy={r + inner * 0.3} r={inner * 0.1} stroke={c} fill="none" strokeWidth={0.9} />
  </g>
);

const temple1 = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <polygon points={`${r - inner * 0.08},${r + inner * 0.3} ${r + inner * 0.08},${r + inner * 0.3} ${r + inner * 0.04},${r - inner * 0.38} ${r - inner * 0.04},${r - inner * 0.38}`} stroke={c} fill="none" strokeWidth={1} />
    <rect x={r - inner * 0.22} y={r + inner * 0.1} width={inner * 0.44} height={inner * 0.2} stroke={c} fill="none" strokeWidth={1} />
    <rect x={r - inner * 0.32} y={r + inner * 0.3} width={inner * 0.64} height={inner * 0.08} stroke={c} fill={c} fillOpacity={0.2} strokeWidth={0.8} />
    {[-0.12, 0.12].map((dx, i) => (
      <rect key={i} x={r + dx * inner - inner * 0.04} y={r + inner * 0.1} width={inner * 0.08} height={inner * 0.2} stroke={c} fill="none" strokeWidth={0.8} />
    ))}
  </g>
);

const jainTemple = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <polygon points={`${r - inner * 0.06},${r + inner * 0.3} ${r + inner * 0.06},${r + inner * 0.3} ${r + inner * 0.02},${r - inner * 0.4} ${r - inner * 0.02},${r - inner * 0.4}`} stroke={c} fill="none" strokeWidth={1} />
    {[-0.22, 0.22].map((dx, i) => (
      <polygon key={i} points={`${r + dx * inner - inner * 0.05},${r + inner * 0.3} ${r + dx * inner + inner * 0.05},${r + inner * 0.3} ${r + dx * inner + inner * 0.02},${r - inner * 0.22} ${r + dx * inner - inner * 0.02},${r - inner * 0.22}`} stroke={c} fill="none" strokeWidth={0.8} />
    ))}
    <rect x={r - inner * 0.34} y={r + inner * 0.18} width={inner * 0.68} height={inner * 0.12} stroke={c} fill="none" strokeWidth={0.8} />
    <rect x={r - inner * 0.38} y={r + inner * 0.3} width={inner * 0.76} height={inner * 0.08} stroke={c} fill={c} fillOpacity={0.15} strokeWidth={0.7} />
  </g>
);

const garden = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    {[-0.24, -0.08, 0.08, 0.24].map((dx, i) => (
      <g key={i}>
        <line x1={r + dx * inner} y1={r + inner * 0.3} x2={r + dx * inner} y2={r - inner * 0.12} stroke={c} strokeWidth={0.9} />
        <path d={`M${r + dx * inner - inner * 0.09} ${r - inner * 0.12} Q${r + dx * inner} ${r - inner * 0.36} ${r + dx * inner + inner * 0.09} ${r - inner * 0.12}`} stroke={c} fill="none" strokeWidth={0.9} />
      </g>
    ))}
    <line x1={r - inner * 0.36} y1={r + inner * 0.3} x2={r + inner * 0.36} y2={r + inner * 0.3} stroke={c} strokeWidth={1} />
  </g>
);

const hill = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r - inner * 0.45} ${r + inner * 0.28} Q${r - inner * 0.2} ${r - inner * 0.35} ${r} ${r - inner * 0.38} Q${r + inner * 0.2} ${r - inner * 0.35} ${r + inner * 0.45} ${r + inner * 0.28}`} stroke={c} fill="none" strokeWidth={1.2} />
    <line x1={r} y1={r - inner * 0.38} x2={r} y2={r - inner * 0.48} stroke={c} strokeWidth={0.9} />
    <path d={`M${r - inner * 0.06} ${r - inner * 0.48} Q${r} ${r - inner * 0.54} ${r + inner * 0.06} ${r - inner * 0.48}`} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const church = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <rect x={r - inner * 0.22} y={r - inner * 0.08} width={inner * 0.44} height={inner * 0.38} stroke={c} fill="none" strokeWidth={1} />
    <polygon points={`${r - inner * 0.22},${r - inner * 0.08} ${r},${r - inner * 0.34} ${r + inner * 0.22},${r - inner * 0.08}`} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r} y1={r - inner * 0.34} x2={r} y2={r - inner * 0.48} stroke={c} strokeWidth={0.9} />
    <line x1={r - inner * 0.06} y1={r - inner * 0.44} x2={r + inner * 0.06} y2={r - inner * 0.44} stroke={c} strokeWidth={0.9} />
    <rect x={r - inner * 0.06} y={r + inner * 0.08} width={inner * 0.12} height={inner * 0.22} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const mutt = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r - inner * 0.35} ${r + inner * 0.28} L${r - inner * 0.35} ${r - inner * 0.1} A${inner * 0.35},${inner * 0.35} 0 0,1 ${r + inner * 0.35} ${r - inner * 0.1} L${r + inner * 0.35} ${r + inner * 0.28}Z`} stroke={c} fill="none" strokeWidth={1} />
    <line x1={r} y1={r - inner * 0.45} x2={r} y2={r - inner * 0.1} stroke={c} strokeWidth={0.9} />
    <line x1={r - inner * 0.06} y1={r - inner * 0.32} x2={r + inner * 0.06} y2={r - inner * 0.32} stroke={c} strokeWidth={0.9} />
    {[-0.12, 0.12].map((dx, i) => (
      <rect key={i} x={r + dx * inner - inner * 0.04} y={r + inner * 0.04} width={inner * 0.08} height={inner * 0.24} stroke={c} fill="none" strokeWidth={0.7} />
    ))}
  </g>
);

const personalityBust = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <circle cx={r} cy={r - inner * 0.16} r={inner * 0.17} stroke={c} fill="none" strokeWidth={1.1} />
    <path d={`M${r - inner * 0.3} ${r + inner * 0.32} Q${r - inner * 0.3} ${r + inner * 0.02} ${r} ${r + inner * 0.02} Q${r + inner * 0.3} ${r + inner * 0.02} ${r + inner * 0.3} ${r + inner * 0.32}`} stroke={c} fill="none" strokeWidth={1.1} />
    <line x1={r - inner * 0.32} y1={r + inner * 0.32} x2={r + inner * 0.32} y2={r + inner * 0.32} stroke={c} strokeWidth={0.9} />
  </g>
);

const rockBoulders = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    {[[-0.2, 0.12, 0.16, 0.14], [0.1, 0.08, 0.2, 0.18], [-0.05, -0.08, 0.18, 0.16], [0.22, -0.06, 0.14, 0.12]].map(([cx, cy, rx, ry], i) => (
      <ellipse key={i} cx={r + cx * inner} cy={r + cy * inner} rx={rx * inner} ry={ry * inner} stroke={c} fill="none" strokeWidth={0.9} />
    ))}
  </g>
);

const snake = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r - inner * 0.3} ${r + inner * 0.32} Q${r - inner * 0.38} ${r} ${r - inner * 0.1} ${r - inner * 0.05} Q${r + inner * 0.28} ${r - inner * 0.1} ${r + inner * 0.18} ${r - inner * 0.28} Q${r + inner * 0.08} ${r - inner * 0.42} ${r} ${r - inner * 0.38}`} stroke={c} fill="none" strokeWidth={1.2} />
    <circle cx={r} cy={r - inner * 0.38} r={inner * 0.05} stroke={c} fill="none" strokeWidth={0.9} />
  </g>
);

const mango = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r} ${r + inner * 0.3} Q${r - inner * 0.24} ${r + inner * 0.08} ${r - inner * 0.16} ${r - inner * 0.18} Q${r - inner * 0.06} ${r - inner * 0.38} ${r} ${r - inner * 0.3} Q${r + inner * 0.06} ${r - inner * 0.38} ${r + inner * 0.16} ${r - inner * 0.18} Q${r + inner * 0.24} ${r + inner * 0.08} ${r} ${r + inner * 0.3}Z`} stroke={c} fill="none" strokeWidth={1.1} />
    <line x1={r} y1={r - inner * 0.3} x2={r + inner * 0.1} y2={r - inner * 0.44} stroke={c} strokeWidth={0.9} />
    <path d={`M${r + inner * 0.1} ${r - inner * 0.44} Q${r + inner * 0.22} ${r - inner * 0.48} ${r + inner * 0.18} ${r - inner * 0.36}`} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

const jasmine = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      const mx = r + Math.cos(a) * inner * 0.28, my = r + Math.sin(a) * inner * 0.28;
      return <ellipse key={i} cx={mx} cy={my} rx={inner * 0.09} ry={inner * 0.06} transform={`rotate(${(i / 6) * 360} ${mx} ${my})`} stroke={c} fill="none" strokeWidth={0.8} />;
    })}
    <circle cx={r} cy={r} r={inner * 0.07} stroke={c} fill="none" strokeWidth={0.9} />
  </g>
);

const brinjal = (r: number, inner: number, c: string): React.ReactNode => (
  <g opacity={0.5}>
    <path d={`M${r} ${r + inner * 0.3} Q${r - inner * 0.2} ${r + inner * 0.26} ${r - inner * 0.18} ${r} Q${r - inner * 0.16} ${r - inner * 0.22} ${r} ${r - inner * 0.24} Q${r + inner * 0.16} ${r - inner * 0.22} ${r + inner * 0.18} ${r} Q${r + inner * 0.2} ${r + inner * 0.26} ${r} ${r + inner * 0.3}Z`} stroke={c} fill="none" strokeWidth={1.1} />
    <line x1={r} y1={r - inner * 0.24} x2={r} y2={r - inner * 0.4} stroke={c} strokeWidth={0.9} />
    <path d={`M${r} ${r - inner * 0.36} Q${r + inner * 0.14} ${r - inner * 0.44} ${r + inner * 0.1} ${r - inner * 0.3}`} stroke={c} fill="none" strokeWidth={0.8} />
  </g>
);

// ── ARTWORK MAP: sno → ArtFn ─────────────────────────────────────────
export const STAMP_ARTWORKS: Record<number, ArtFn> = {
  1:   (r, i) => rockCave(r, i, "#7A3B0F"),                    // Aihole cave temples
  2:   (r, i) => rockCave(r, i, "#7A3B0F"),                    // Badami cave temples
  3:   (r, i) => temple3Pillars(r, i, "#7A3B0F"),              // Pattadakallu temple
  4:   (r, i) => fort(r, i, "#7A3B0F"),                        // Ballari Fort
  5:   (r, i) => hill(r, i, "#7A3B0F"),                        // Kumaraswamy temple on hill
  6:   (r, i) => clock(r, i, "#7A3B0F"),                       // Belagavi clock tower
  7:   (r, i) => fort(r, i, "#7A3B0F"),                        // Belagavi Fort
  8:   (r, i) => personalityBust(r, i, "#3A1878"),             // Kittur Rani Channamma
  9:   (r, i) => personalityBust(r, i, "#3A1878"),             // Sangoli Rayanna
  10:  (r, i) => pillar(r, i, "#7A3B0F"),                      // Halashi inscriptions/temple
  11:  (r, i) => temple1(r, i, "#7A3B0F"),                     // Hooli temple
  12:  (r, i) => hill(r, i, "#7A3B0F"),                        // Yellamma Hill temple
  13:  (r, i) => (                                              // Bhimgad bat sanctuary
    <g opacity={0.5}>
      <path d={`M${r - i*0.32} ${r+i*0.1} Q${r-i*0.28} ${r-i*0.22} ${r} ${r-i*0.28} Q${r+i*0.28} ${r-i*0.22} ${r+i*0.32} ${r+i*0.1}`} stroke="#1C5A2E" fill="none" strokeWidth={1.1}/>
      <path d={`M${r} ${r-i*0.28} L${r} ${r+i*0.2}`} stroke="#1C5A2E" strokeWidth={0.9}/>
      {[-0.14,0.14].map((dx,j)=><path key={j} d={`M${r+dx*i} ${r-i*0.02} Q${r+dx*i*1.4} ${r-i*0.2} ${r+dx*i*0.5} ${r-i*0.28}`} stroke="#1C5A2E" fill="none" strokeWidth={0.7}/>)}
    </g>
  ),
  14:  (r, i) => waterfall(r, i, "#1F618D"),                   // Gokak Falls
  15:  (r, i) => palace(r, i, "#7A3B0F"),                      // Vidhana Soudha
  16:  (r, i) => temple3Pillars(r, i, "#7A3B0F"),              // High Court (columned building)
  17:  (r, i) => palace(r, i, "#7A3B0F"),                      // Beaulieu mansion
  18:  (r, i) => (                                              // Lalbagh watchtower
    <g opacity={0.5}>
      <polygon points={`${r-i*0.06},${r+i*0.32} ${r+i*0.06},${r+i*0.32} ${r+i*0.04},${r-i*0.24} ${r-i*0.04},${r-i*0.24}`} stroke="#7A3B0F" fill="none" strokeWidth={1}/>
      <rect x={r-i*0.14} y={r-i*0.28} width={i*0.28} height={i*0.08} stroke="#7A3B0F" fill="none" strokeWidth={0.9}/>
      {leaf(r, i*0.55, "#1C5A2E")}
    </g>
  ),
  19:  (r, i) => pillar(r, i, "#7A3B0F"),                      // Rajajinagar foundation pillar
  20:  (r, i) => (                                              // Ashoka pillar
    <g opacity={0.5}>
      <polygon points={`${r-i*0.05},${r+i*0.34} ${r+i*0.05},${r+i*0.34} ${r+i*0.03},${r-i*0.38} ${r-i*0.03},${r-i*0.38}`} stroke="#7A3B0F" fill="none" strokeWidth={1}/>
      <ellipse cx={r} cy={r-i*0.38} rx={i*0.12} ry={i*0.06} stroke="#7A3B0F" fill="none" strokeWidth={0.9}/>
      <path d={`M${r-i*0.12} ${r-i*0.38} Q${r-i*0.08} ${r-i*0.5} ${r} ${r-i*0.52} Q${r+i*0.08} ${r-i*0.5} ${r+i*0.12} ${r-i*0.38}`} stroke="#7A3B0F" fill="none" strokeWidth={0.9}/>
    </g>
  ),
  21:  (r, i) => (                                              // IISc — science building
    <g opacity={0.5}>
      <rect x={r-i*0.3} y={r-i*0.12} width={i*0.6} height={i*0.42} stroke="#1A5276" fill="none" strokeWidth={1}/>
      <path d={`M${r-i*0.3} ${r-i*0.12} Q${r} ${r-i*0.42} ${r+i*0.3} ${r-i*0.12}`} stroke="#1A5276" fill="none" strokeWidth={0.9}/>
      {[-0.18,0,0.18].map((dx,j)=><line key={j} x1={r+dx*i} y1={r-i*0.12} x2={r+dx*i} y2={r+i*0.3} stroke="#1A5276" strokeWidth={0.7} opacity={0.5}/>)}
    </g>
  ),
  22:  (r, i) => satellite(r, i, "#1A5276"),                   // ISRO
  23:  (r, i) => palace(r, i, "#7A3B0F"),                      // Sandesh Museum building
  24:  (r, i) => elephant(r, i, "#1C5A2E"),                    // Bannerghatta
  25:  (r, i) => jainTemple(r, i, "#3A1878"),                  // Parshvanath Jain temple
  26:  (r, i) => mutt(r, i, "#1C5A2E"),                        // Basavakalyan Anubhava Mantapa
  27:  (r, i) => mosque(r, i, "#7A3B0F"),                      // Mahmud Gawan Madarsa
  28:  (r, i) => (                                              // Guru Nanak Jhira spring
    <g opacity={0.5}>
      {waterwaves(r, i*0.7, "#1F618D")}
      <path d={`M${r-i*0.06} ${r-i*0.4} L${r} ${r-i*0.48} L${r+i*0.06} ${r-i*0.4}`} stroke="#D4AC0D" fill="none" strokeWidth={1.1}/>
    </g>
  ),
  29:  (r, i) => tiger(r, i, "#1C5A2E"),                       // Bandipur tiger reserve
  30:  (r, i) => elephant(r, i, "#1C5A2E"),                    // Kyathadevaragudi wildlife
  31:  (r, i) => hill(r, i, "#1C5A2E"),                        // Male Mahadeshwara Hills
  32:  (r, i) => hill(r, i, "#7A3B0F"),                        // Nandi Hills
  33:  (r, i) => coffeePlant(r, i, "#1C5A2E"),                 // Chikkamagaluru coffee
  34:  (r, i) => mutt(r, i, "#7A3B0F"),                        // Sringeri math
  35:  (r, i) => fort(r, i, "#7A3B0F"),                        // Chitradurga Fort
  36:  (r, i) => temple1(r, i, "#7A3B0F"),                     // Kateel temple (island)
  37:  (r, i) => temple1(r, i, "#1C5A2E"),                     // Dharmasthala
  38:  (r, i) => jainTemple(r, i, "#3A1878"),                  // Moodbidri Jain basadis
  39:  (r, i) => snake(r, i, "#1C5A2E"),                       // Subrahmanya serpent temple
  40:  (r, i) => monolith(r, i, "#3A1878"),                    // Venur Gommateshwara
  41:  (r, i) => lighthouse(r, i, "#1F618D"),                  // Mangaluru lighthouse
  42:  (r, i) => personalityBust(r, i, "#3A1878"),             // Rani Abbakka
  43:  (r, i) => clock(r, i, "#7A3B0F"),                       // Davanagere clock tower
  44:  (r, i) => personalityBust(r, i, "#3A1878"),             // Bhendre Bhavan poet
  45:  (r, i) => waterwaves(r, i, "#1F618D"),                  // Unkal Lake
  46:  (r, i) => personalityBust(r, i, "#3A1878"),             // Pampa poet
  47:  (r, i) => personalityBust(r, i, "#3A1878"),             // Kumaravyasa poet
  48:  (r, i) => (                                              // Lakkundi temples + stepwell
    <g opacity={0.5}>
      {temple1(r, i*0.85, "#7A3B0F")}
      <path d={`M${r+i*0.12} ${r+i*0.26} L${r+i*0.32} ${r+i*0.26} L${r+i*0.3} ${r+i*0.38} L${r+i*0.14} ${r+i*0.38}Z`} stroke="#7A3B0F" fill="none" strokeWidth={0.7} opacity={0.6}/>
    </g>
  ),
  49:  (r, i) => temple1(r, i, "#7A3B0F"),                     // Belur Chennakeshava
  50:  (r, i) => (                                              // Halebidu twin temples
    <g opacity={0.5}>
      {[-0.24,0.24].map((dx,j)=>(
        <g key={j}>
          <polygon points={`${r+dx*i-i*0.06},${r+i*0.3} ${r+dx*i+i*0.06},${r+i*0.3} ${r+dx*i+i*0.02},${r-i*0.3} ${r+dx*i-i*0.02},${r-i*0.3}`} stroke="#7A3B0F" fill="none" strokeWidth={0.9}/>
          <rect x={r+dx*i-i*0.12} y={r+i*0.12} width={i*0.24} height={i*0.18} stroke="#7A3B0F" fill="none" strokeWidth={0.7}/>
        </g>
      ))}
    </g>
  ),
  51:  (r, i) => monolith(r, i, "#3A1878"),                    // Shravanabelagola Bahubali
  52:  (r, i) => deer(r, i, "#1C5A2E"),                        // Ranebennur Blackbuck
  53:  (r, i) => personalityBust(r, i, "#3A1878"),             // Shishunala Sharifa
  54:  (r, i) => cannon(r, i, "#7A3B0F"),                      // Bara Gazi Toph cannon
  55:  (r, i) => fort(r, i, "#7A3B0F"),                        // Madikeri fort
  56:  (r, i) => tiger(r, i, "#1C5A2E"),                       // Nagarahole tiger park
  57:  (r, i) => goldenMine(r, i, "#7D6608"),                  // KGF gold mines
  58:  (r, i) => personalityBust(r, i, "#3A1878"),             // Masti Venkatesha Iyengar
  59:  (r, i) => (                                              // Anjanadri Hill
    <g opacity={0.5}>
      {hill(r, i, "#7A3B0F")}
      <line x1={r} y1={r-i*0.52} x2={r} y2={r-i*0.44} stroke="#D4AC0D" strokeWidth={1}/>
    </g>
  ),
  60:  (r, i) => mutt(r, i, "#7A3B0F"),                        // Gavimath Koppal
  61:  (r, i) => pelican(r, i, "#1C5A2E"),                     // Kokkare Bellur pelicans
  62:  (r, i) => (                                              // Srirangapatna island fort
    <g opacity={0.5}>
      {fort(r, i*0.85, "#7A3B0F")}
      {waterwaves(r, i*0.45, "#1F618D")}
    </g>
  ),
  63:  (r, i) => elephant(r, i, "#C05C1A"),                    // Mysuru Dasara procession
  64:  (r, i) => clock(r, i, "#7A3B0F"),                       // Silver Jubilee clock tower
  65:  (r, i) => garden(r, i, "#1C5A2E"),                      // Brindavan Gardens
  66:  (r, i) => hill(r, i, "#7A3B0F"),                        // Chamundi Hills temple
  67:  (r, i) => mutt(r, i, "#1C5A2E"),                        // SGS Ashram
  68:  (r, i) => temple1(r, i, "#7A3B0F"),                     // Somanathapura Keshava
  69:  (r, i) => (                                              // Talakad sand dunes + temple
    <g opacity={0.5}>
      <path d={`M${r-i*0.42} ${r+i*0.3} Q${r-i*0.2} ${r+i*0.04} ${r} ${r+i*0.14} Q${r+i*0.2} ${r+i*0.24} ${r+i*0.42} ${r+i*0.02}`} stroke="#C4A35A" fill="none" strokeWidth={1}/>
      {temple1(r, i*0.6, "#7A3B0F")}
    </g>
  ),
  70:  (r, i) => personalityBust(r, i, "#3A1878"),             // Appannacharya
  71:  (r, i) => squirrel(r, i, "#1C5A2E"),                    // Grizzled Giant Squirrel
  72:  (r, i) => snake(r, i, "#1C5A2E"),                       // Agumbe king cobra
  73:  (r, i) => hill(r, i, "#1C5A2E"),                        // Kundadri Hill Jain temple
  74:  (r, i) => rockBoulders(r, i, "#7A3B0F"),               // Kavishaila rock
  75:  (r, i) => waterfall(r, i, "#1F618D"),                   // Jog Falls
  76:  (r, i) => jainTemple(r, i, "#3A1878"),                  // Humcha Jain temple
  77:  (r, i) => mutt(r, i, "#7A3B0F"),                        // Siddaganga Mutt
  78:  (r, i) => jainTemple(r, i, "#3A1878"),                  // Pinchi Basadi Jain
  79:  (r, i) => monolith(r, i, "#3A1878"),                    // Karkala Gommateshwara
  80:  (r, i) => brinjal(r, i, "#1C5A2E"),                     // Mattu Galla brinjal
  81:  (r, i) => lighthouse(r, i, "#1F618D"),                  // Kaup lighthouse
  82:  (r, i) => jainTemple(r, i, "#3A1878"),                  // Varanga lake basadi
  83:  (r, i) => jasmine(r, i, "#1C5A2E"),                     // Shankarpura jasmine
  84:  (r, i) => temple1(r, i, "#7A3B0F"),                     // Udupi Krishna temple
  85:  (r, i) => (                                              // Manipal university
    <g opacity={0.5}>
      <rect x={r-i*0.3} y={r-i*0.08} width={i*0.6} height={i*0.38} stroke="#1A5276" fill="none" strokeWidth={1}/>
      <polygon points={`${r-i*0.3},${r-i*0.08} ${r},${r-i*0.34} ${r+i*0.3},${r-i*0.08}`} stroke="#1A5276" fill="none" strokeWidth={0.9}/>
      {[-0.16,0,0.16].map((dx,j)=><rect key={j} x={r+dx*i-i*0.04} y={r+i*0.1} width={i*0.08} height={i*0.2} stroke="#1A5276" fill="none" strokeWidth={0.7}/>)}
    </g>
  ),
  86:  (r, i) => (                                              // Malpe beach + St Mary's islands
    <g opacity={0.5}>
      {waterwaves(r, i*0.5, "#1F618D")}
      {rockBoulders(r, i*0.5, "#7A3B0F")}
    </g>
  ),
  87:  (r, i) => personalityBust(r, i, "#3A1878"),             // Mahakavi Muddana
  88:  (r, i) => leaf(r, i, "#1C5A2E"),                        // Someshwara Wildlife Sanctuary
  89:  (r, i) => church(r, i, "#7A3B0F"),                      // St Lawrence Church
  90:  (r, i) => waterwaves(r, i, "#1F618D"),                  // Panchagangavali river
  91:  (r, i) => temple1(r, i, "#7A3B0F"),                     // Barkur ancient temples
  92:  (r, i) => hill(r, i, "#7A3B0F"),                        // Kollur Mookambika hills
  93:  (r, i) => personalityBust(r, i, "#3A1878"),             // K Shivaram Karanth
  94:  (r, i) => temple1(r, i, "#7A3B0F"),                     // Mandarthi temple
  95:  (r, i) => (                                              // Manjuguni Hanuman temple forest
    <g opacity={0.5}>
      {leaf(r, i*0.6, "#1C5A2E")}
      {temple1(r, i*0.55, "#7A3B0F")}
    </g>
  ),
  96:  (r, i) => (                                              // Murudeshwara Shiva statue
    <g opacity={0.5}>
      {monolith(r, i*0.75, "#7A3B0F")}
      {waterwaves(r, i*0.4, "#1F618D")}
    </g>
  ),
  97:  (r, i) => rockBoulders(r, i, "#7A3B0F"),               // Hampi boulders
  98:  (r, i) => (                                              // Kannada University
    <g opacity={0.5}>
      <text x={r} y={r+i*0.12} textAnchor="middle" fontSize={i*0.38} fill="#7A3B0F" fontFamily="serif" opacity={0.5}>ಕ</text>
      <line x1={r-i*0.32} y1={r+i*0.28} x2={r+i*0.32} y2={r+i*0.28} stroke="#7A3B0F" strokeWidth={1}/>
    </g>
  ),
  99:  (r, i) => dome(r, i, "#7A3B0F"),                        // Vijayapura Gol Gumbaz dome
  100: (r, i) => stork(r, i, "#1C5A2E"),                       // Bonal Bird Sanctuary
};
