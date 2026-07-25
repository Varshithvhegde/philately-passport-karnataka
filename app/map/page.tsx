"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { locations, ALL_DISTRICTS, CATEGORY_COLORS, CATEGORY_ICONS, type Location } from "@/lib/data";
import CategoryBadge from "@/components/CategoryBadge";
import { X, ExternalLink, Navigation, Map } from "lucide-react";
import type { ColorMode } from "@/components/MapComponent";
import { DISTRICT_COLORS } from "@/components/MapComponent";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%", minHeight: 480,
      background: "var(--manuscript)", border: "2px solid var(--temple)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 12,
    }}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="19" stroke="#C4A35A" strokeWidth="1.5" strokeDasharray="4 3"/>
        <circle cx="22" cy="22" r="3.5" fill="#C4A35A" opacity="0.6"/>
      </svg>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)" }}>
        Loading Map…
      </div>
    </div>
  ),
});

const ALL_CATS = [...new Set(locations.map((l) => l.category))].sort();

const sel: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: "0.68rem", letterSpacing: "0.06em",
  padding: "6px 10px", outline: "none",
  background: "var(--manuscript)", color: "var(--temple)",
  border: "1px solid var(--sandstone)",
  borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06",
  cursor: "pointer", appearance: "auto",
};

export default function MapPage() {
  const [selDistrict, setSelDistrict] = useState("All");
  const [selCat,      setSelCat]      = useState("All");
  const [colorMode,   setColorMode]   = useState<ColorMode>("category");
  const [highlighted, setHighlighted] = useState<number | undefined>();
  const [sidebar,     setSidebar]     = useState<Location | null>(null);

  // Show ALL by default — filters only reduce
  const filtered = locations.filter((l) => {
    if (selDistrict !== "All" && l.district !== selDistrict) return false;
    if (selCat      !== "All" && l.category !== selCat)      return false;
    return true;
  });

  const mapsUrl = sidebar ? `https://maps.google.com/?q=${sidebar.latitude},${sidebar.longitude}` : "";
  const mapsDir = sidebar ? `https://maps.google.com/maps/dir//${sidebar.latitude},${sidebar.longitude}` : "";

  return (
    <div style={{ height: "calc(100vh - 108px)", display: "flex", flexDirection: "column" }}>

      {/* ── Filter bar ───────────────────────────────────────────── */}
      <div className="hoysala-rule-thin" />
      <div style={{
        background: "var(--manuscript)", padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap",
        borderBottom: "1px solid rgba(196,163,90,0.25)",
      }}>
        {/* District */}
        <select value={selDistrict} onChange={e => { setSelDistrict(e.target.value); setSidebar(null); setHighlighted(undefined); }} style={sel}>
          <option value="All">All Districts</option>
          {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Category */}
        <select value={selCat} onChange={e => { setSelCat(e.target.value); setSidebar(null); setHighlighted(undefined); }} style={sel}>
          <option value="All">All Categories</option>
          {ALL_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Color mode toggle */}
        <div style={{ display: "flex", gap: 0, marginLeft: 4 }}>
          {(["category", "district"] as ColorMode[]).map(m => (
            <button key={m} onClick={() => setColorMode(m)}
              style={{
                ...sel, padding: "6px 12px",
                background: colorMode === m ? "var(--temple)" : "var(--manuscript)",
                color:      colorMode === m ? "var(--sandstone)" : "var(--temple)",
                fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
              {m === "category" ? "🏷 Category" : "🗺 District"}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {(selDistrict !== "All" || selCat !== "All") && (
          <button onClick={() => { setSelDistrict("All"); setSelCat("All"); setSidebar(null); setHighlighted(undefined); }}
            style={{ ...sel, background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", display: "flex", alignItems: "center", gap: 4 }}>
            <X size={10} /> Clear
          </button>
        )}

        {/* Count + legend */}
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", color: "var(--copper)", letterSpacing: "0.06em", marginLeft: "auto" }}>
          {filtered.length} / 100 shown
        </span>

        {/* Legend dots */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {colorMode === "category"
            ? Object.entries(CATEGORY_COLORS).filter(([c]) => !c.includes("&")).slice(0, 7).map(([cat, color]) => (
                <span key={cat} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, border: "1px solid rgba(26,14,6,0.3)", display: "inline-block" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", color: "var(--temple)" }}>{CATEGORY_ICONS[cat]}</span>
                </span>
              ))
            : ALL_DISTRICTS.slice(0, 8).map(d => (
                <span key={d} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: DISTRICT_COLORS[d] ?? "#C4A35A", border: "1px solid rgba(26,14,6,0.3)", display: "inline-block" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "var(--temple)" }}>{d.slice(0,6)}</span>
                </span>
              ))
          }
        </div>
      </div>

      {/* ── Map + sidebar ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, padding: 10 }}>
          <MapComponent
            locations={filtered}
            highlightSno={highlighted}
            colorMode={colorMode}
            onSelect={loc => { setSidebar(loc); setHighlighted(loc.sno); }}
          />
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        {sidebar && (
          <div style={{
            width: 280, flexShrink: 0, overflowY: "auto",
            borderLeft: "2px solid var(--temple)",
            background: "var(--ivory)",
            display: "flex", flexDirection: "column",
          }}>
            <div className="hoysala-rule-thin" />
            <div style={{ padding: "14px 14px 6px" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 3 }}>
                    PPC #{String(sidebar.sno).padStart(3, "0")} · {sidebar.district}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--temple)", fontSize: "1.05rem", lineHeight: 1.2, margin: 0 }}>
                    {sidebar.place}
                  </h3>
                </div>
                <button onClick={() => { setSidebar(null); setHighlighted(undefined); }}
                  style={{ color: "var(--copper)", background: "none", border: "none", cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <CategoryBadge category={sidebar.category} size="sm" />
              </div>

              {/* Info card */}
              <div className="manuscript-card" style={{ padding: "10px 12px", fontSize: "0.7rem", marginBottom: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Post Office</div>
                  <div style={{ fontFamily: "var(--font-body)", color: "var(--temple)" }}>{sidebar.post_office}</div>
                </div>
                {sidebar.address && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Address</div>
                    <div style={{ fontFamily: "var(--font-body)", color: "var(--temple)" }}>{sidebar.address}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Coordinates</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "var(--temple)" }}>
                    {sidebar.latitude.toFixed(5)}, {sidebar.longitude.toFixed(5)}
                  </div>
                </div>
              </div>

              {/* Map action links */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "8px 0", textDecoration: "none",
                    background: "var(--manuscript)", color: "var(--temple)",
                    border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06",
                    fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>
                  <Map size={11} /> View on Maps
                </a>
                <a href={mapsDir} target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "8px 0", textDecoration: "none",
                    background: "var(--manuscript)", color: "var(--temple)",
                    border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06",
                    fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>
                  <Navigation size={11} /> Directions
                </a>
              </div>

              {/* Open passport page CTA */}
              <a href={`/passport/${sidebar.sno}`} className="temple-btn"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", textDecoration: "none", marginBottom: 14 }}>
                <ExternalLink size={11} />
                Open Passport Page
              </a>
            </div>

            {/* Same district list */}
            {locations.filter(l => l.district === sidebar.district && l.sno !== sidebar.sno).length > 0 && (
              <div style={{ padding: "0 14px 14px", flex: 1 }}>
                <div className="hoysala-rule-thin" style={{ marginBottom: 10 }} />
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 8 }}>
                  Also in {sidebar.district}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {locations.filter(l => l.district === sidebar.district && l.sno !== sidebar.sno).map(l => (
                    <button key={l.sno}
                      onClick={() => { setSidebar(l); setHighlighted(l.sno); }}
                      style={{
                        textAlign: "left", padding: "6px 9px",
                        background: "var(--manuscript)", border: "1px solid rgba(196,163,90,0.3)",
                        borderRightColor: "rgba(26,14,6,0.12)", borderBottomColor: "rgba(26,14,6,0.12)",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                      }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", color: "var(--copper)", flexShrink: 0, letterSpacing: "0.04em" }}>
                        #{String(l.sno).padStart(3, "0")}
                      </span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--temple)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.place}
                      </span>
                      <span style={{ fontSize: "0.75rem", flexShrink: 0 }}>{CATEGORY_ICONS[l.category] ?? ""}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="hoysala-rule-thin" />
          </div>
        )}
      </div>
    </div>
  );
}
