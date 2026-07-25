import { CATEGORY_ICONS } from "@/lib/data";

const BADGE: Record<string, { bg: string; fg: string; bd: string }> = {
  "Monument":               { bg: "#3D2506", fg: "#C4A35A", bd: "#7A3B0F" },
  "Flora and Fauna":        { bg: "#0C2E1A", fg: "#6ABD7A", bd: "#1C5A2E" },
  "Personality":            { bg: "#2A1645", fg: "#A07FCA", bd: "#4A2878" },
  "Natural Heritage":       { bg: "#0D2535", fg: "#5AAFC4", bd: "#1A4E78" },
  "Heritage Celebration":   { bg: "#3A1A06", fg: "#D47C3A", bd: "#7A3A10" },
  "Heritage & Celebration": { bg: "#3A1A06", fg: "#D47C3A", bd: "#7A3A10" },
  "Science & Technology":   { bg: "#0D1E35", fg: "#5A88C4", bd: "#1A3060" },
  "Industry":               { bg: "#2C2006", fg: "#C4B03A", bd: "#6A5010" },
  "Weapons":                { bg: "#350A0A", fg: "#C45A5A", bd: "#7A1010" },
  "Weapon and Attire":      { bg: "#350A0A", fg: "#C45A5A", bd: "#7A1010" },
  "Natural Stream":         { bg: "#051E2E", fg: "#3AB4C4", bd: "#0A4A60" },
};

export default function CategoryBadge({ category, size = "md" }: { category: string; size?: "sm" | "md" }) {
  const s = BADGE[category] ?? { bg: "#2A1A0A", fg: "#C4A35A", bd: "#4A2810" };
  const icon = CATEGORY_ICONS[category] ?? "📍";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: size === "sm" ? "1px 7px" : "2px 10px",
      background: s.bg, color: s.fg, border: `1px solid ${s.bd}`,
      fontSize: size === "sm" ? "0.63rem" : "0.68rem",
      fontFamily: "var(--font-display)", letterSpacing: "0.08em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: "0.85em" }}>{icon}</span>
      {category}
    </span>
  );
}
