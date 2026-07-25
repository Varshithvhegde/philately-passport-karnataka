"use client";

import { type Category } from "@/lib/data";

// Category → stamp theme
const THEMES: Record<string, { color: string; ring: string; symbol: string; label: string }> = {
  "Monument":               { color: "#C4A35A", ring: "#7A3B0F", symbol: "🏛", label: "MONUMENT"    },
  "Flora and Fauna":        { color: "#4A7C59", ring: "#1C5A2E", symbol: "🌿", label: "FLORA"       },
  "Personality":            { color: "#6D4C9C", ring: "#3A1878", symbol: "✦",  label: "PERSONALITY" },
  "Natural Heritage":       { color: "#2A6B8A", ring: "#0D3A50", symbol: "🌄", label: "HERITAGE"    },
  "Heritage Celebration":   { color: "#C05C1A", ring: "#7A2A06", symbol: "🎉", label: "CELEBRATION" },
  "Heritage & Celebration": { color: "#C05C1A", ring: "#7A2A06", symbol: "🎉", label: "CELEBRATION" },
  "Science & Technology":   { color: "#1A5276", ring: "#0A2840", symbol: "⚙",  label: "SCIENCE"     },
  "Industry":               { color: "#7D6608", ring: "#4A3A04", symbol: "⚙",  label: "INDUSTRY"    },
  "Weapons":                { color: "#922B21", ring: "#580D08", symbol: "⚔",  label: "HERITAGE"    },
  "Weapon and Attire":      { color: "#922B21", ring: "#580D08", symbol: "⚔",  label: "HERITAGE"    },
  "Natural Stream":         { color: "#1F618D", ring: "#0A3050", symbol: "💧", label: "WATERWAYS"   },
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
  const inner = r - 16;
  const ticks = 30;

  const d = date ? new Date(date + "T12:00:00") : null;
  const dy = d ? d.getDate() : null;
  const mo = d ? d.toLocaleString("en-IN", { month: "short" }).toUpperCase() : null;
  const yr = d ? d.getFullYear() : null;

  // Truncate place name to fit in stamp
  const shortPlace = place.length > 14 ? place.slice(0, 13) + "…" : place;
  const shortDistrict = district.length > 12 ? district.slice(0, 11) + "…" : district;

  if (!visited) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={outer} fill="none" stroke={theme.color} strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
        <circle cx={r} cy={r} r={inner} fill="none" stroke={theme.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.22" />
        <text x={r} y={r - 6} textAnchor="middle" fontSize={size * 0.28} fill={theme.color} fillOpacity="0.2" fontFamily="serif">{theme.symbol}</text>
        <text x={r} y={r + 16} textAnchor="middle" fontSize={size * 0.085} fill={theme.color} fillOpacity="0.35" fontFamily="serif" letterSpacing="2">GET STAMP</text>
      </svg>
    );
  }

  return (
    <svg
      width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      className={animated ? "stamp-animate" : ""}
      style={{ filter: "drop-shadow(2px 3px 6px rgba(26,14,6,0.35))" }}
    >
      {/* Tinted fill */}
      <circle cx={r} cy={r} r={outer - 1} fill={theme.color} fillOpacity="0.08" />

      {/* Serrated outer ring */}
      {Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * Math.PI * 2;
        const x1 = r + (outer - 2) * Math.cos(a);
        const y1 = r + (outer - 2) * Math.sin(a);
        const x2 = r + (outer + 2) * Math.cos(a);
        const y2 = r + (outer + 2) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.ring} strokeWidth="1.2" />;
      })}
      <circle cx={r} cy={r} r={outer} fill="none" stroke={theme.ring} strokeWidth="2.5" />
      <circle cx={r} cy={r} r={inner + 1} fill="none" stroke={theme.ring} strokeWidth="1" />

      {/* Place name arc — top */}
      <defs>
        <path id={`arc-top-${size}`} d={`M ${r - inner * 0.88},${r} A ${inner * 0.88},${inner * 0.88} 0 0,1 ${r + inner * 0.88},${r}`} />
        <path id={`arc-bot-${size}`} d={`M ${r - inner * 0.88},${r} A ${inner * 0.88},${inner * 0.88} 0 0,0 ${r + inner * 0.88},${r}`} />
      </defs>
      <text fontSize={size * 0.085} fill={theme.ring} fontFamily="serif" fontWeight="700" letterSpacing="1.5">
        <textPath href={`#arc-top-${size}`} startOffset="50%" textAnchor="middle">{shortPlace.toUpperCase()}</textPath>
      </text>
      <text fontSize={size * 0.075} fill={theme.ring} fontFamily="serif" letterSpacing="1">
        <textPath href={`#arc-bot-${size}`} startOffset="50%" textAnchor="middle">{shortDistrict.toUpperCase()}</textPath>
      </text>

      {/* Category symbol */}
      <text x={r} y={r - inner * 0.05} textAnchor="middle" fontSize={size * 0.2} fontFamily="serif">{theme.symbol}</text>

      {/* Date */}
      {dy && (
        <>
          <text x={r} y={r + inner * 0.38} textAnchor="middle" fontSize={size * 0.24} fill={theme.ring} fontWeight="bold" fontFamily="serif">{dy}</text>
          <text x={r} y={r + inner * 0.62} textAnchor="middle" fontSize={size * 0.11} fill={theme.ring} fontFamily="serif" letterSpacing="1">{mo} {yr}</text>
        </>
      )}

      {/* Centre dot */}
      <circle cx={r} cy={r + inner * 0.82} r={2.5} fill={theme.ring} opacity="0.6" />
    </svg>
  );
}
