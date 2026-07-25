"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { locations, ALL_DISTRICTS, CATEGORY_COLORS, CATEGORY_ICONS, type Location } from "@/lib/data";
import CategoryBadge from "@/components/CategoryBadge";
import { X } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%", minHeight: 480,
      background: "var(--manuscript)",
      border: "2px solid var(--temple)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 12,
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#C4A35A" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="20" cy="20" r="3" fill="#C4A35A" opacity="0.6" />
      </svg>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)" }}>
        Loading Map…
      </div>
    </div>
  ),
});

const ALL_CATS = [...new Set(locations.map((l) => l.category))].sort();

export default function MapPage() {
  const [selDistrict, setSelDistrict] = useState("All");
  const [selCat, setSelCat] = useState("All");
  const [highlighted, setHighlighted] = useState<number | undefined>();
  const [sidebar, setSidebar] = useState<Location | null>(null);

  const filtered = locations.filter((l) => {
    if (selDistrict !== "All" && l.district !== selDistrict) return false;
    if (selCat !== "All" && l.category !== selCat) return false;
    return true;
  });

  const selectStyle = {
    fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.06em",
    padding: "5px 8px", outline: "none",
    background: "var(--manuscript)", color: "var(--temple)",
    border: "1px solid var(--sandstone)",
    borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06",
  };

  return (
    <div style={{ height: "calc(100vh - 110px)", display: "flex", flexDirection: "column" }}>

      {/* Filter bar */}
      <div className="hoysala-rule-thin" />
      <div style={{ background: "var(--manuscript)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, flexWrap: "wrap" }}>
        <select value={selDistrict} onChange={e => setSelDistrict(e.target.value)} style={selectStyle}>
          <option value="All">All Districts</option>
          {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={selCat} onChange={e => setSelCat(e.target.value)} style={selectStyle}>
          <option value="All">All Categories</option>
          {ALL_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "var(--copper)", letterSpacing: "0.06em", marginLeft: "auto" }}>
          {filtered.length} / 100 shown
        </span>

        {/* compact colour legend */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(CATEGORY_COLORS).filter(([cat]) => !cat.includes("&")).slice(0, 6).map(([cat, color]) => (
            <span key={cat} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--temple)" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, border: "1px solid #1A0E0640", display: "inline-block" }} />
              {CATEGORY_ICONS[cat]}
            </span>
          ))}
        </div>
      </div>
      <div className="hoysala-rule-thin" />

      {/* Map + sidebar */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, padding: 12 }}>
          <MapComponent
            locations={filtered}
            highlightSno={highlighted}
            onSelect={loc => { setSidebar(loc); setHighlighted(loc.sno); }}
          />
        </div>

        {/* Sidebar */}
        {sidebar && (
          <div style={{
            width: 272, flexShrink: 0, overflowY: "auto",
            borderLeft: "2px solid var(--temple)",
            background: "var(--ivory)",
            padding: 0,
          }}>
            <div className="hoysala-rule-thin" />
            <div style={{ padding: "14px 14px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)" }}>
                  PPC #{String(sidebar.sno).padStart(3, "0")} · {sidebar.district}
                </div>
                <button onClick={() => { setSidebar(null); setHighlighted(undefined); }} style={{ color: "var(--copper)", lineHeight: 1 }}>
                  <X size={14} />
                </button>
              </div>

              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "1rem", lineHeight: 1.3, marginBottom: 8 }}>
                {sidebar.place}
              </h3>

              <CategoryBadge category={sidebar.category} size="sm" />

              <div className="manuscript-card" style={{ marginTop: 12, padding: "10px 12px", fontSize: "0.7rem", display: "flex", flexDirection: "column", gap: 5 }}>
                <div><span style={{ color: "var(--copper)", fontFamily: "var(--font-display)", letterSpacing: "0.06em", fontSize: "0.62rem", textTransform: "uppercase" }}>Post Office</span>
                  <div style={{ color: "var(--temple)", fontFamily: "var(--font-body)", marginTop: 1 }}>{sidebar.post_office}</div>
                </div>
                {sidebar.address && (
                  <div><span style={{ color: "var(--copper)", fontFamily: "var(--font-display)", letterSpacing: "0.06em", fontSize: "0.62rem", textTransform: "uppercase" }}>Address</span>
                    <div style={{ color: "var(--temple)", fontFamily: "var(--font-body)", marginTop: 1 }}>{sidebar.address}</div>
                  </div>
                )}
                <div><span style={{ color: "var(--copper)", fontFamily: "var(--font-display)", letterSpacing: "0.06em", fontSize: "0.62rem", textTransform: "uppercase" }}>Coordinates</span>
                  <div style={{ color: "var(--temple)", fontFamily: "monospace", fontSize: "0.68rem", marginTop: 1 }}>{sidebar.latitude.toFixed(5)}, {sidebar.longitude.toFixed(5)}</div>
                </div>
              </div>

              <a href={`/passport/${sidebar.sno}`} className="temple-btn" style={{ display: "block", textAlign: "center", padding: "8px 0", marginTop: 12, textDecoration: "none" }}>
                Open Passport Page
              </a>

              {/* Same district */}
              {locations.filter(l => l.district === sidebar.district && l.sno !== sidebar.sno).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 6 }}>
                    Also in {sidebar.district}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {locations.filter(l => l.district === sidebar.district && l.sno !== sidebar.sno).map(l => (
                      <button key={l.sno} onClick={() => { setSidebar(l); setHighlighted(l.sno); }}
                        style={{ textAlign: "left", padding: "5px 8px", background: "var(--manuscript)", border: "1px solid rgba(196,163,90,0.3)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--temple)" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--copper)", marginRight: 4 }}>#{String(l.sno).padStart(3,"0")}</span>
                        {l.place}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hoysala-rule-thin" />
          </div>
        )}
      </div>
    </div>
  );
}
