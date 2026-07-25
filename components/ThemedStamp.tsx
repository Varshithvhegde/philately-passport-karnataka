"use client";

import { type Category } from "@/lib/data";
import { STAMP_ARTWORKS } from "./StampArtwork";

// Per-category colour palette — fallback when no sno-specific artwork
const THEMES: Record<string, { color: string; ring: string; bg: string }> = {
  "Monument":               { color: "#C4A35A", ring: "#7A3B0F", bg: "rgba(196,163,90,0.07)" },
  "Flora and Fauna":        { color: "#4A7C59", ring: "#1C5A2E", bg: "rgba(74,124,89,0.07)"  },
  "Personality":            { color: "#6D4C9C", ring: "#3A1878", bg: "rgba(109,76,156,0.07)" },
  "Natural Heritage":       { color: "#2A6B8A", ring: "#0D3A50", bg: "rgba(42,107,138,0.07)" },
  "Heritage Celebration":   { color: "#C05C1A", ring: "#7A2A06", bg: "rgba(192,92,26,0.07)"  },
  "Heritage & Celebration": { color: "#C05C1A", ring: "#7A2A06", bg: "rgba(192,92,26,0.07)"  },
  "Science & Technology":   { color: "#1A5276", ring: "#0A2840", bg: "rgba(26,82,118,0.07)"  },
  "Industry":               { color: "#7D6608", ring: "#4A3A04", bg: "rgba(125,102,8,0.07)"  },
  "Weapons":                { color: "#922B21", ring: "#580D08", bg: "rgba(146,43,33,0.07)"  },
  "Weapon and Attire":      { color: "#922B21", ring: "#580D08", bg: "rgba(146,43,33,0.07)"  },
  "Natural Stream":         { color: "#1F618D", ring: "#0A3050", bg: "rgba(31,97,141,0.07)"  },
};

interface Props {
  sno?: number;
  category: Category | string;
  place: string;
  district: string;
  date?: string;
  size?: number;
  visited?: boolean;
  animated?: boolean;
}

export default function ThemedStamp({
  sno, category, place, district, date,
  size = 160, visited = false, animated = false,
}: Props) {
  const theme = THEMES[category] ?? THEMES["Monument"];
  const r     = size / 2;
  const outer = r - 5;
  const inner = r - 17;
  const ticks = 32;

  const d  = date ? new Date(date + "T12:00:00") : null;
  const dy = d ? d.getDate() : null;
  const mo = d ? d.toLocaleString("en-IN", { month: "short" }).toUpperCase() : null;
  const yr = d ? d.getFullYear() : null;

  const shortPlace    = place.length > 13    ? place.slice(0, 12)    + "…" : place;
  const shortDistrict = district.length > 11 ? district.slice(0, 10) + "…" : district;

  // Artwork: sno-specific if available, else nothing (just rings + date)
  const artFn = sno ? STAMP_ARTWORKS[sno] : undefined;

  // ── Unvisited ────────────────────────────────────────────────────
  if (!visited) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={outer} fill="none" stroke={theme.color} strokeWidth="1.8" strokeDasharray="5 4" opacity="0.35"/>
        <circle cx={r} cy={r} r={inner+2} fill="none" stroke={theme.color} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.2"/>
        {artFn ? artFn(r, inner) : null}
        <text x={r} y={r + inner * 0.55} textAnchor="middle" fontSize={size * 0.085} fill={theme.color} fillOpacity="0.3" fontFamily="serif" letterSpacing="2">
          GET STAMP
        </text>
      </svg>
    );
  }

  // ── Visited ──────────────────────────────────────────────────────
  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      className={animated ? "stamp-animate" : ""}
      style={{ filter: "drop-shadow(2px 3px 8px rgba(26,14,6,0.4))" }}
    >
      <defs>
        <path id={`arc-top-${size}-${sno}`}
          d={`M ${r - inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,1 ${r + inner*0.85},${r}`}/>
        <path id={`arc-bot-${size}-${sno}`}
          d={`M ${r - inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,0 ${r + inner*0.85},${r}`}/>
      </defs>

      {/* Tinted fill */}
      <circle cx={r} cy={r} r={outer - 1} fill={theme.bg}/>

      {/* Perforation ticks */}
      {Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * Math.PI * 2;
        return (
          <line key={i}
            x1={r + (outer - 2.5) * Math.cos(a)} y1={r + (outer - 2.5) * Math.sin(a)}
            x2={r + (outer + 2.5) * Math.cos(a)} y2={r + (outer + 2.5) * Math.sin(a)}
            stroke={theme.ring} strokeWidth="1.4"/>
        );
      })}

      {/* Outer + inner rings */}
      <circle cx={r} cy={r} r={outer}     fill="none" stroke={theme.ring} strokeWidth="2.5"/>
      <circle cx={r} cy={r} r={inner + 2} fill="none" stroke={theme.ring} strokeWidth="1"/>

      {/* Wave cancellation lines */}
      {[-inner*0.08, 0, inner*0.08].map((yOff, wi) => (
        <path key={`wave-${wi}`}
          d={`M${r-outer+4} ${r+yOff} Q${r-outer/2} ${r+yOff-inner*0.06} ${r} ${r+yOff} Q${r+outer/2} ${r+yOff+inner*0.06} ${r+outer-4} ${r+yOff}`}
          fill="none" stroke={theme.ring} strokeWidth="0.7" opacity="0.18"/>
      ))}

      {/* Location-specific SVG artwork */}
      {artFn ? artFn(r, inner) : null}

      {/* Arced place name — top */}
      <text fontSize={size * 0.082} fill={theme.ring} fontFamily="serif" fontWeight="700" letterSpacing="1.5">
        <textPath href={`#arc-top-${size}-${sno}`} startOffset="50%" textAnchor="middle">
          {shortPlace.toUpperCase()}
        </textPath>
      </text>

      {/* Date block */}
      {dy && (
        <>
          <text x={r} y={r + inner * 0.38} textAnchor="middle"
            fontSize={size * 0.26} fill={theme.ring} fontWeight="bold" fontFamily="serif">
            {dy}
          </text>
          <text x={r} y={r + inner * 0.62} textAnchor="middle"
            fontSize={size * 0.1} fill={theme.ring} fontFamily="serif" letterSpacing="1.5">
            {mo} {yr}
          </text>
        </>
      )}

      {/* Arced district — bottom */}
      <text fontSize={size * 0.075} fill={theme.ring} fontFamily="serif" letterSpacing="1">
        <textPath href={`#arc-bot-${size}-${sno}`} startOffset="50%" textAnchor="middle">
          {shortDistrict.toUpperCase()}
        </textPath>
      </text>

      {/* Centre dot */}
      <circle cx={r} cy={r + inner * 0.82} r={2.5} fill={theme.ring} opacity="0.6"/>
    </svg>
  );
}
