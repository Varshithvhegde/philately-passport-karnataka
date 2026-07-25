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
      flexDirection: "column", gap: 14,
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#C4A35A" strokeWidth="1.5" strokeDasharray="5 3"/>
        <circle cx="24" cy="24" r="12" stroke="#C4A35A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"/>
        <circle cx="24" cy="24" r="4" fill="#C4A35A" opacity="0.7"/>
      </svg>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)" }}>
        Loading Karnataka Map…
      </div>
    </div>
  ),
});

const ALL_CATS = [...new Set(locations.map((l) => l.category))].sort();

const selStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: "0.67rem", letterSpacing: "0.05em",
  padding: "5px 9px", outline: "none",
  background: "var(--manuscript)", color: "var(--temple)",
  border: "1px solid var(--sandstone)",
  borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06",
  cursor: "pointer",
};

export default function MapPage() {
  const [selDistrict,    setSelDistrict]    = useState("All");
  const [selCat,         setSelCat]         = useState("All");
  const [colorMode,      setColorMode]      = useState<ColorMode>("category");
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [highlighted,    setHighlighted]    = useState<number | undefined>();
  const [sidebar,        setSidebar]        = useState<Location | null>(null);

  const filtered = locations.filter((l) => {
    if (selDistrict !== "All" && l.district !== selDistrict) return false;
    if (selCat      !== "All" && l.category !== selCat)      return false;
    return true;
  });

  const mapsUrl = sidebar ? `https://maps.google.com/?q=${sidebar.latitude},${sidebar.longitude}` : "";
  const mapsDir = sidebar ? `https://maps.google.com/maps/dir//${sidebar.latitude},${sidebar.longitude}` : "";

  // District location counts for legend
  const districtCounts: Record<string, number> = {};
  for (const l of filtered) districtCounts[l.district] = (districtCounts[l.district] ?? 0) + 1;

  return (
    <div style={{ height: "calc(100vh - 108px)", display: "flex", flexDirection: "column" }}>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="hoysala-rule-thin" />
      <div style={{
        background: "var(--manuscript)", padding: "7px 14px",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap",
        borderBottom: "1px solid rgba(196,163,90,0.22)",
      }}>
        {/* Filters */}
        <select value={selDistrict} onChange={e => { setSelDistrict(e.target.value); setSidebar(null); }} style={selStyle}>
          <option value="All">All Districts</option>
          {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={selCat} onChange={e => { setSelCat(e.target.value); setSidebar(null); }} style={selStyle}>
          <option value="All">All Categories</option>
          {ALL_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(196,163,90,0.4)" }} />

        {/* Color mode */}
        <div style={{ display: "flex" }}>
          {(["category", "district"] as ColorMode[]).map(m => (
            <button key={m} onClick={() => setColorMode(m)} style={{
              ...selStyle,
              background: colorMode === m ? "var(--temple)" : "var(--manuscript)",
              color:      colorMode === m ? "var(--sandstone)" : "var(--temple)",
              fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "5px 11px",
            }}>
              {m === "category" ? "🏷 Category" : "🗺 District"}
            </button>
          ))}
        </div>

        {/* Boundaries toggle */}
        <button
          onClick={() => setShowBoundaries(v => !v)}
          style={{
            ...selStyle,
            background: showBoundaries ? "#1C3A10" : "var(--manuscript)",
            color:      showBoundaries ? "#8FD1A0"  : "var(--laterite)",
            fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "5px 11px", display: "flex", alignItems: "center", gap: 5,
          }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1"/>
            <path d="M0.5 5 L9.5 5 M5 0.5 L5 9.5" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5"/>
          </svg>
          District Boundaries
        </button>

        {/* Clear */}
        {(selDistrict !== "All" || selCat !== "All") && (
          <button onClick={() => { setSelDistrict("All"); setSelCat("All"); setSidebar(null); setHighlighted(undefined); }}
            style={{ ...selStyle, background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", display: "flex", alignItems: "center", gap: 4 }}>
            <X size={10} /> Clear
          </button>
        )}

        {/* Count */}
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--copper)", letterSpacing: "0.06em", marginLeft: "auto" }}>
          {filtered.length} / 100 shown
        </span>

        {/* Inline legend */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", maxWidth: 320 }}>
          {colorMode === "category"
            ? Object.entries(CATEGORY_COLORS).filter(([c]) => !c.includes("&")).slice(0, 6).map(([cat, color]) => (
                <span key={cat} style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "var(--font-display)", fontSize: "0.55rem", color: "var(--temple)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, border: "1px solid rgba(26,14,6,0.3)", display: "inline-block" }} />
                  {CATEGORY_ICONS[cat]}
                </span>
              ))
            : Object.entries(districtCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([d, cnt]) => (
                <span key={d} style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "var(--temple)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: DISTRICT_COLORS[d] ?? "#C4A35A", border: "1px solid rgba(26,14,6,0.3)", display: "inline-block" }} />
                  {d.slice(0, 7)} ({cnt})
                </span>
              ))
          }
        </div>
      </div>

      {/* ── Map + Sidebar ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, padding: 10 }}>
          <MapComponent
            locations={filtered}
            highlightSno={highlighted}
            colorMode={colorMode}
            showBoundaries={showBoundaries}
            highlightDistrict={selDistrict !== "All" ? selDistrict : undefined}
            onSelect={loc => { setSidebar(loc); setHighlighted(loc.sno); }}
          />
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        {sidebar && (
          <div style={{
            width: 284, flexShrink: 0, overflowY: "auto",
            borderLeft: "2px solid var(--temple)",
            background: "var(--ivory)",
            display: "flex", flexDirection: "column",
          }}>
            <div className="hoysala-rule-thin" />
            <div style={{ padding: "14px 14px 6px" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.56rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 3 }}>
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

              {/* District color chip */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  display: "inline-block", width: 10, height: 10, borderRadius: "50%",
                  background: DISTRICT_COLORS[sidebar.district] ?? "#C4A35A",
                  border: "1px solid rgba(26,14,6,0.3)",
                }} />
                <CategoryBadge category={sidebar.category} size="sm" />
              </div>

              {/* Info card */}
              <div className="manuscript-card" style={{ padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ marginBottom: 7 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.53rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Post Office</div>
                  <div style={{ fontFamily: "var(--font-body)", color: "var(--temple)", fontSize: "0.78rem" }}>{sidebar.post_office}</div>
                </div>
                {sidebar.address && (
                  <div style={{ marginBottom: 7 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.53rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Address</div>
                    <div style={{ fontFamily: "var(--font-body)", color: "var(--temple)", fontSize: "0.75rem" }}>{sidebar.address}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.53rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Coordinates</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "var(--temple)" }}>{sidebar.latitude.toFixed(5)}, {sidebar.longitude.toFixed(5)}</div>
                </div>
              </div>

              {/* Map links */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "7px 0", textDecoration: "none",
                  background: "var(--manuscript)", color: "var(--temple)",
                  border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06",
                  fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  <Map size={10} /> View on Maps
                </a>
                <a href={mapsDir} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "7px 0", textDecoration: "none",
                  background: "var(--manuscript)", color: "var(--temple)",
                  border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06",
                  fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  <Navigation size={10} /> Directions
                </a>
              </div>

              {/* Passport CTA */}
              <a href={`/passport/${sidebar.sno}`} className="temple-btn"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", textDecoration: "none", marginBottom: 14 }}>
                <ExternalLink size={10} />
                Open Passport Page
              </a>
            </div>

            {/* Same district list */}
            {locations.filter(l => l.district === sidebar.district && l.sno !== sidebar.sno).length > 0 && (
              <div style={{ padding: "0 14px 14px", flex: 1 }}>
                <div className="hoysala-rule-thin" style={{ marginBottom: 10 }} />
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.53rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 8 }}>
                  Also in {sidebar.district} ({locations.filter(l=>l.district===sidebar.district).length} total)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {locations.filter(l => l.district === sidebar.district && l.sno !== sidebar.sno).map(l => (
                    <button key={l.sno}
                      onClick={() => { setSidebar(l); setHighlighted(l.sno); }}
                      style={{
                        textAlign: "left", padding: "6px 9px",
                        background: "var(--manuscript)",
                        border: "1px solid rgba(196,163,90,0.28)",
                        borderRightColor: "rgba(26,14,6,0.1)", borderBottomColor: "rgba(26,14,6,0.1)",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                      }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.53rem", color: "var(--copper)", flexShrink: 0, letterSpacing: "0.04em" }}>
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
