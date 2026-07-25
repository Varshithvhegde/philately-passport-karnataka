"use client";

import { type Category } from "@/lib/data";

const THEMES: Record<string, {
  color: string; ring: string; bg: string;
  symbol: string; artwork: (r: number, inner: number) => React.ReactNode;
}> = {
  "Monument": {
    color: "#C4A35A", ring: "#7A3B0F", bg: "rgba(196,163,90,0.07)",
    symbol: "🏛",
    artwork: (r, inner) => (
      // Temple pillars + arch
      <g>
        <rect x={r-inner*0.38} y={r-inner*0.32} width={inner*0.76} height={inner*0.55} fill="none" stroke="#7A3B0F" strokeWidth="1" opacity="0.5"/>
        <rect x={r-inner*0.38} y={r-inner*0.4} width={inner*0.76} height={inner*0.1} fill="#7A3B0F" fillOpacity="0.3"/>
        <line x1={r-inner*0.2} y1={r-inner*0.32} x2={r-inner*0.2} y2={r+inner*0.23} stroke="#7A3B0F" strokeWidth="1.2" opacity="0.5"/>
        <line x1={r} y1={r-inner*0.32} x2={r} y2={r+inner*0.23} stroke="#7A3B0F" strokeWidth="1.2" opacity="0.5"/>
        <line x1={r+inner*0.2} y1={r-inner*0.32} x2={r+inner*0.2} y2={r+inner*0.23} stroke="#7A3B0F" strokeWidth="1.2" opacity="0.5"/>
      </g>
    ),
  },
  "Flora and Fauna": {
    color: "#4A7C59", ring: "#1C5A2E", bg: "rgba(74,124,89,0.07)",
    symbol: "🌿",
    artwork: (r, inner) => (
      // Leaf with vein
      <g opacity="0.5">
        <path d={`M${r} ${r+inner*0.25} Q${r-inner*0.3} ${r-inner*0.1} ${r} ${r-inner*0.35} Q${r+inner*0.3} ${r-inner*0.1} ${r} ${r+inner*0.25}`} fill="none" stroke="#1C5A2E" strokeWidth="1.2"/>
        <line x1={r} y1={r-inner*0.35} x2={r} y2={r+inner*0.25} stroke="#1C5A2E" strokeWidth="0.8"/>
        <line x1={r} y1={r-inner*0.1} x2={r-inner*0.18} y2={r-inner*0.22} stroke="#1C5A2E" strokeWidth="0.7"/>
        <line x1={r} y1={r+inner*0.05} x2={r+inner*0.18} y2={r-inner*0.08} stroke="#1C5A2E" strokeWidth="0.7"/>
      </g>
    ),
  },
  "Personality": {
    color: "#6D4C9C", ring: "#3A1878", bg: "rgba(109,76,156,0.07)",
    symbol: "✦",
    artwork: (r, inner) => (
      // Portrait silhouette
      <g opacity="0.45">
        <circle cx={r} cy={r-inner*0.15} r={inner*0.18} fill="none" stroke="#3A1878" strokeWidth="1.2"/>
        <path d={`M${r-inner*0.28} ${r+inner*0.28} Q${r-inner*0.28} ${r+inner*0.05} ${r} ${r+inner*0.05} Q${r+inner*0.28} ${r+inner*0.05} ${r+inner*0.28} ${r+inner*0.28}`} fill="none" stroke="#3A1878" strokeWidth="1.2"/>
      </g>
    ),
  },
  "Natural Heritage": {
    color: "#2A6B8A", ring: "#0D3A50", bg: "rgba(42,107,138,0.07)",
    symbol: "🌄",
    artwork: (r, inner) => (
      // Mountains
      <g opacity="0.45">
        <path d={`M${r-inner*0.4} ${r+inner*0.2} L${r-inner*0.15} ${r-inner*0.28} L${r+inner*0.08} ${r-inner*0.05} L${r+inner*0.28} ${r-inner*0.32} L${r+inner*0.4} ${r+inner*0.2}Z`} fill="none" stroke="#0D3A50" strokeWidth="1.2"/>
        <line x1={r-inner*0.4} y1={r+inner*0.2} x2={r+inner*0.4} y2={r+inner*0.2} stroke="#0D3A50" strokeWidth="0.8"/>
      </g>
    ),
  },
  "Heritage Celebration": {
    color: "#C05C1A", ring: "#7A2A06", bg: "rgba(192,92,26,0.07)",
    symbol: "🎉",
    artwork: (r, inner) => (
      // Firework burst
      <g opacity="0.4">
        {Array.from({length: 8}, (_, i) => {
          const a = (i/8)*Math.PI*2;
          return <line key={i} x1={r} y1={r} x2={r+Math.cos(a)*inner*0.3} y2={r+Math.sin(a)*inner*0.3} stroke="#7A2A06" strokeWidth="1" strokeLinecap="round"/>;
        })}
        <circle cx={r} cy={r} r={3} fill="#7A2A06" opacity="0.5"/>
      </g>
    ),
  },
  "Heritage & Celebration": {
    color: "#C05C1A", ring: "#7A2A06", bg: "rgba(192,92,26,0.07)",
    symbol: "🎉",
    artwork: (r, inner) => (
      <g opacity="0.4">
        {Array.from({length: 8}, (_, i) => {
          const a = (i/8)*Math.PI*2;
          return <line key={i} x1={r} y1={r} x2={r+Math.cos(a)*inner*0.3} y2={r+Math.sin(a)*inner*0.3} stroke="#7A2A06" strokeWidth="1" strokeLinecap="round"/>;
        })}
        <circle cx={r} cy={r} r={3} fill="#7A2A06" opacity="0.5"/>
      </g>
    ),
  },
  "Science & Technology": {
    color: "#1A5276", ring: "#0A2840", bg: "rgba(26,82,118,0.07)",
    symbol: "⚙",
    artwork: (r, inner) => (
      // Gear
      <g opacity="0.4">
        <circle cx={r} cy={r} r={inner*0.22} fill="none" stroke="#0A2840" strokeWidth="1.5"/>
        <circle cx={r} cy={r} r={inner*0.1} fill="none" stroke="#0A2840" strokeWidth="1"/>
        {Array.from({length: 8}, (_, i) => {
          const a = (i/8)*Math.PI*2;
          return <rect key={i} x={r+Math.cos(a)*inner*0.22-3} y={r+Math.sin(a)*inner*0.22-3} width={6} height={6} fill="#0A2840" transform={`rotate(${i*45} ${r+Math.cos(a)*inner*0.22} ${r+Math.sin(a)*inner*0.22})`}/>;
        })}
      </g>
    ),
  },
  "Industry": {
    color: "#7D6608", ring: "#4A3A04", bg: "rgba(125,102,8,0.07)",
    symbol: "⚙",
    artwork: (r, inner) => (
      <g opacity="0.4">
        <circle cx={r} cy={r} r={inner*0.22} fill="none" stroke="#4A3A04" strokeWidth="1.5"/>
        <circle cx={r} cy={r} r={inner*0.1} fill="none" stroke="#4A3A04" strokeWidth="1"/>
      </g>
    ),
  },
  "Weapons": {
    color: "#922B21", ring: "#580D08", bg: "rgba(146,43,33,0.07)",
    symbol: "⚔",
    artwork: (r, inner) => (
      // Crossed swords
      <g opacity="0.4">
        <line x1={r-inner*0.3} y1={r-inner*0.3} x2={r+inner*0.3} y2={r+inner*0.3} stroke="#580D08" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1={r+inner*0.3} y1={r-inner*0.3} x2={r-inner*0.3} y2={r+inner*0.3} stroke="#580D08" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    ),
  },
  "Weapon and Attire": {
    color: "#922B21", ring: "#580D08", bg: "rgba(146,43,33,0.07)",
    symbol: "⚔",
    artwork: (r, inner) => (
      <g opacity="0.4">
        <line x1={r-inner*0.3} y1={r-inner*0.3} x2={r+inner*0.3} y2={r+inner*0.3} stroke="#580D08" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1={r+inner*0.3} y1={r-inner*0.3} x2={r-inner*0.3} y2={r+inner*0.3} stroke="#580D08" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    ),
  },
  "Natural Stream": {
    color: "#1F618D", ring: "#0A3050", bg: "rgba(31,97,141,0.07)",
    symbol: "💧",
    artwork: (r, inner) => (
      // Wave lines
      <g opacity="0.45">
        {[-inner*0.12, 0, inner*0.12].map((yOff, i) => (
          <path key={i} d={`M${r-inner*0.35} ${r+yOff} Q${r-inner*0.12} ${r+yOff-inner*0.08} ${r} ${r+yOff} Q${r+inner*0.12} ${r+yOff+inner*0.08} ${r+inner*0.35} ${r+yOff}`} fill="none" stroke="#0A3050" strokeWidth="1"/>
        ))}
      </g>
    ),
  },
};

interface Props {
  category: Category | string;
  place: string;
  district: string;
  date?: string;
  size?: number;
  visited?: boolean;
  animated?: boolean;
}

export default function ThemedStamp({ category, place, district, date, size = 160, visited = false, animated = false }: Props) {
  const theme = THEMES[category] ?? THEMES["Monument"];
  const r = size / 2;
  const outer = r - 5;
  const inner = r - 17;
  const ticks = 32;

  const d = date ? new Date(date + "T12:00:00") : null;
  const dy = d ? d.getDate() : null;
  const mo = d ? d.toLocaleString("en-IN", { month: "short" }).toUpperCase() : null;
  const yr = d ? d.getFullYear() : null;

  const shortPlace    = place.length > 13    ? place.slice(0, 12)    + "…" : place;
  const shortDistrict = district.length > 11 ? district.slice(0, 10) + "…" : district;

  // ── Unvisited: dashed empty slot ───────────────────────────────
  if (!visited) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer perforated ring */}
        <circle cx={r} cy={r} r={outer} fill="none" stroke={theme.color} strokeWidth="1.8" strokeDasharray="5 4" opacity="0.35"/>
        <circle cx={r} cy={r} r={inner+2} fill="none" stroke={theme.color} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.2"/>
        {/* Category artwork — ghosted */}
        {theme.artwork(r, inner)}
        {/* GET STAMP text */}
        <text x={r} y={r + inner*0.55} textAnchor="middle" fontSize={size * 0.085} fill={theme.color} fillOpacity="0.3" fontFamily="serif" letterSpacing="2">
          GET STAMP
        </text>
      </svg>
    );
  }

  // ── Visited: full ink stamp ─────────────────────────────────────
  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      className={animated ? "stamp-animate" : ""}
      style={{ filter: "drop-shadow(2px 3px 8px rgba(26,14,6,0.4))" }}
    >
      <defs>
        <path id={`arc-top-${size}`}
          d={`M ${r - inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,1 ${r + inner*0.85},${r}`}/>
        <path id={`arc-bot-${size}`}
          d={`M ${r - inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,0 ${r + inner*0.85},${r}`}/>
      </defs>

      {/* Tinted fill — slight colour wash */}
      <circle cx={r} cy={r} r={outer - 1} fill={theme.bg}/>

      {/* Perforation tick marks around outer ring */}
      {Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * Math.PI * 2;
        const x1 = r + (outer - 2.5) * Math.cos(a);
        const y1 = r + (outer - 2.5) * Math.sin(a);
        const x2 = r + (outer + 2.5) * Math.cos(a);
        const y2 = r + (outer + 2.5) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.ring} strokeWidth="1.4"/>;
      })}

      {/* Outer ring */}
      <circle cx={r} cy={r} r={outer} fill="none" stroke={theme.ring} strokeWidth="2.5"/>
      {/* Inner ring */}
      <circle cx={r} cy={r} r={inner + 2} fill="none" stroke={theme.ring} strokeWidth="1"/>

      {/* ── Wave cancellation lines (3 diagonal waves across the stamp) */}
      {/* These are the wavy ink cancel marks on real postmarks */}
      {[-inner*0.08, 0, inner*0.08].map((yOff, wi) => (
        <path key={`wave-${wi}`}
          d={`M${r-outer+4} ${r+yOff} Q${r-outer/2} ${r+yOff-inner*0.06} ${r} ${r+yOff} Q${r+outer/2} ${r+yOff+inner*0.06} ${r+outer-4} ${r+yOff}`}
          fill="none" stroke={theme.ring} strokeWidth="0.7" opacity="0.18"/>
      ))}

      {/* ── Category-specific inner artwork */}
      {theme.artwork(r, inner)}

      {/* ── Arced place name — TOP */}
      <text fontSize={size * 0.082} fill={theme.ring} fontFamily="serif" fontWeight="700" letterSpacing="1.5">
        <textPath href={`#arc-top-${size}`} startOffset="50%" textAnchor="middle">
          {shortPlace.toUpperCase()}
        </textPath>
      </text>

      {/* ── Date block in centre */}
      {dy && (
        <>
          {/* Day number — large */}
          <text x={r} y={r + inner*0.38} textAnchor="middle"
            fontSize={size * 0.26} fill={theme.ring} fontWeight="bold" fontFamily="serif">
            {dy}
          </text>
          {/* Month Year */}
          <text x={r} y={r + inner*0.62} textAnchor="middle"
            fontSize={size * 0.1} fill={theme.ring} fontFamily="serif" letterSpacing="1.5">
            {mo} {yr}
          </text>
        </>
      )}

      {/* ── Arced district — BOTTOM */}
      <text fontSize={size * 0.075} fill={theme.ring} fontFamily="serif" letterSpacing="1">
        <textPath href={`#arc-bot-${size}`} startOffset="50%" textAnchor="middle">
          {shortDistrict.toUpperCase()}
        </textPath>
      </text>

      {/* Centre ornament dot */}
      <circle cx={r} cy={r + inner*0.82} r={2.5} fill={theme.ring} opacity="0.6"/>
    </svg>
  );
}
