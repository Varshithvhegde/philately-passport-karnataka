"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { locations, ALL_DISTRICTS, CATEGORY_ICONS, type Location } from "@/lib/data";
import LocationCard from "@/components/LocationCard";

const TOTAL = 100;
const ALL_CATS = Object.keys(CATEGORY_ICONS);
type SortMode = "default" | "district" | "collected" | "uncollected";
type ViewMode = "grid" | "list";

/* ── Postal Horn SVG (inline, no deps) ─────────────────────────── */
function PostalHorn({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z"
        stroke={color} strokeWidth="1.2" fill="none"/>
      <circle cx="17.5" cy="10" r="1.5" fill={color} fillOpacity="0.7"/>
      <path d="M7 6 L7 4 M7 14 L7 16" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

/* ── Perforated stamp edge for category chips ──────────────────── */
function StampChip({ label, icon, active, count, onClick }: {
  label: string; icon?: string; active: boolean; count?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "6px 10px", cursor: "pointer",
      background: active ? "var(--spine)" : "transparent",
      color: active ? "var(--sandstone)" : "var(--ink-mid)",
      border: active ? "1px solid rgba(13,31,58,0.5)" : "1px solid transparent",
      borderLeft: active ? "3px solid var(--post-red)" : "3px solid transparent",
      fontFamily: "var(--font-body)", fontSize: "0.72rem",
      transition: "all 0.12s", textAlign: "left",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {icon && <span style={{ fontSize: "0.78rem" }}>{icon}</span>}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </span>
      {count !== undefined && (
        <span style={{
          fontSize: "0.55rem", padding: "1px 5px", flexShrink: 0, minWidth: 20, textAlign: "center",
          background: active ? "rgba(196,57,26,0.3)" : "rgba(122,59,15,0.1)",
          color: active ? "#F5B8A8" : "var(--copper)",
          fontFamily: "var(--font-display)", letterSpacing: "0.04em",
        }}>{count}</span>
      )}
    </button>
  );
}

/* ── List row ──────────────────────────────────────────────────── */
function ListRow({ location, visited }: { location: Location; visited: boolean }) {
  return (
    <Link href={`/passport/${location.sno}`} style={{ textDecoration: "none", display: "block", marginBottom: 4 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
        background: "var(--page)",
        borderLeft: `4px solid ${visited ? "var(--forest)" : "var(--temple)"}`,
        borderTop: "1px solid rgba(196,163,90,0.28)",
        borderRight: "1px solid rgba(26,14,6,0.12)",
        borderBottom: "1px solid rgba(26,14,6,0.12)",
        cursor: "pointer",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", padding: "2px 5px", background: "var(--temple)", color: "var(--sandstone)", flexShrink: 0, letterSpacing: "0.06em" }}>
          {String(location.sno).padStart(3, "0")}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.85rem", lineHeight: 1.2 }}>{location.place}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.63rem", color: "var(--copper)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {location.district} · {location.post_office}
          </div>
        </div>
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: "0.75rem" }}>{CATEGORY_ICONS[location.category] ?? "•"}</span>
        </span>
        {visited && <span style={{ flexShrink: 0, fontFamily: "var(--font-kalam, cursive)", fontSize: "0.7rem", color: "var(--forest)" }}>✓</span>}
      </div>
    </Link>
  );
}

/* ── Empty state ───────────────────────────────────────────────── */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "56px 20px", textAlign: "center" }}>
      {/* Postmark-style empty stamp */}
      <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
        <circle cx="55" cy="55" r="48" stroke="var(--post-red)" strokeWidth="2" strokeDasharray="8 5" opacity="0.4"/>
        <circle cx="55" cy="55" r="36" stroke="var(--copper)" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.3"/>
        {/* cancel lines */}
        {[-12,-4,4,12].map(o => (
          <line key={o} x1="18" y1={55+o} x2="92" y2={55+o} stroke="var(--post-red)" strokeWidth="1.5" opacity="0.15"/>
        ))}
        <text x="55" y="51" textAnchor="middle" fontFamily="serif" fontSize="10" fill="var(--copper)" letterSpacing="2" opacity="0.6">NO</text>
        <text x="55" y="65" textAnchor="middle" fontFamily="serif" fontSize="10" fill="var(--copper)" letterSpacing="2" opacity="0.6">RESULTS</text>
      </svg>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--temple)", letterSpacing: "0.04em", marginBottom: 4 }}>No locations match</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--laterite)", marginBottom: 14 }}>Adjust your filters to find locations</div>
        <button onClick={onClear} style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--copper)", background: "none", border: "1px solid var(--sandstone)", padding: "6px 16px", cursor: "pointer" }}>
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

/* ── PassportInner (needs useSearchParams → inside Suspense) ───── */
function PassportInner() {
  const params = useSearchParams();
  const [search,      setSearch]      = useState("");
  const [district,    setDistrict]    = useState(params.get("district") ?? "All");
  const [category,    setCategory]    = useState(params.get("category") ?? "All");
  const [visitFilter, setVisitFilter] = useState<"all"|"visited"|"unvisited">("all");
  const [viewMode,    setViewMode]    = useState<ViewMode>("grid");
  const [sortMode,    setSortMode]    = useState<SortMode>("default");
  const [sideTab,     setSideTab]     = useState<"districts"|"categories">("districts");
  const [visitedSnos, setVisitedSnos] = useState<Set<number>>(new Set());

  useEffect(() => {
    function load() {
      const raw = typeof window !== "undefined" ? localStorage.getItem("philately_visits") : null;
      const v: Record<string, unknown> = raw ? JSON.parse(raw) : {};
      setVisitedSnos(new Set(Object.keys(v).map(Number)));
    }
    load();
    window.addEventListener("philately:update", load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener("philately:update", load); window.removeEventListener("storage", load); };
  }, []);

  const collected = visitedSnos.size;
  const districtsCovered = useMemo(() =>
    new Set(locations.filter(l => visitedSnos.has(l.sno)).map(l => l.district)).size, [visitedSnos]);

  const districtCounts = useMemo(() => {
    const c: Record<string, number> = {};
    locations.forEach(l => { c[l.district] = (c[l.district] ?? 0) + 1; });
    return c;
  }, []);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    locations.forEach(l => { c[l.category] = (c[l.category] ?? 0) + 1; });
    return c;
  }, []);

  const filtered = useMemo<Location[]>(() => {
    let arr = locations.filter(l => {
      if (district !== "All" && l.district !== district) return false;
      if (category !== "All" && l.category !== category) return false;
      if (visitFilter === "visited"   && !visitedSnos.has(l.sno)) return false;
      if (visitFilter === "unvisited" &&  visitedSnos.has(l.sno)) return false;
      if (search) {
        const q = search.toLowerCase();
        return l.place.toLowerCase().includes(q) || l.district.toLowerCase().includes(q)
          || l.post_office.toLowerCase().includes(q) || l.pincode.includes(q);
      }
      return true;
    });
    if (sortMode === "district")    arr = [...arr].sort((a,b) => a.district.localeCompare(b.district)||a.place.localeCompare(b.place));
    if (sortMode === "collected")   arr = [...arr].sort((a,b) => (visitedSnos.has(a.sno)?0:1)-(visitedSnos.has(b.sno)?0:1)||a.sno-b.sno);
    if (sortMode === "uncollected") arr = [...arr].sort((a,b) => (visitedSnos.has(a.sno)?1:0)-(visitedSnos.has(b.sno)?1:0)||a.sno-b.sno);
    return arr;
  }, [district, category, visitFilter, search, sortMode, visitedSnos]);

  const hasFilter = district !== "All" || category !== "All" || visitFilter !== "all" || search;

  function clearAll() { setDistrict("All"); setCategory("All"); setVisitFilter("all"); setSearch(""); }

  const inp: CSSProperties = {
    padding: "7px 10px",
    background: "var(--page)",
    border: "1px solid rgba(196,163,90,0.45)",
    borderRightColor: "rgba(26,14,6,0.18)",
    borderBottomColor: "rgba(26,14,6,0.18)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
    fontSize: "0.78rem",
    outline: "none",
  };

  return (
    <div>
      {/* ── Mobile filter chips (shown only ≤640px) ─────────────── */}
      <div className="show-mobile" style={{
        display: "none", /* overridden by .show-mobile */
        overflowX: "auto", gap: 6, padding: "10px 14px",
        background: "var(--ivory)", borderBottom: "1px solid rgba(196,163,90,0.2)",
        scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
        flexWrap: "nowrap",
      }}>
        {/* Visit filter */}
        {(["all","visited","unvisited"] as const).map(v => (
          <button key={v} onClick={() => setVisitFilter(v)} style={{
            flexShrink: 0, padding: "8px 12px", cursor: "pointer",
            fontFamily: "var(--font-display)", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
            background: visitFilter === v ? "var(--spine)" : "var(--page)",
            color: visitFilter === v ? "var(--sandstone)" : "var(--laterite)",
            border: visitFilter === v ? "1px solid rgba(196,163,90,0.4)" : "1px solid rgba(196,163,90,0.2)",
            borderLeft: visitFilter === v ? "3px solid var(--post-red)" : "3px solid transparent",
            whiteSpace: "nowrap",
          }}>
            {v === "all" ? "All" : v === "visited" ? "✓ Collected" : "○ Uncollected"}
          </button>
        ))}
        <div style={{ width: 1, height: 28, background: "rgba(196,163,90,0.3)", flexShrink: 0, alignSelf: "center" }} />
        {/* District quick chips */}
        {ALL_DISTRICTS.map(d => (
          <button key={d} onClick={() => setDistrict(district === d ? "All" : d)} style={{
            flexShrink: 0, padding: "8px 12px", cursor: "pointer",
            fontFamily: "var(--font-body)", fontSize: "0.72rem",
            background: district === d ? "var(--spine)" : "transparent",
            color: district === d ? "var(--sandstone)" : "var(--ink-mid)",
            border: district === d ? "1px solid rgba(196,163,90,0.4)" : "1px solid transparent",
            whiteSpace: "nowrap",
          }}>{d}</button>
        ))}
      </div>

      {/* ── Two-panel ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>

        {/* ── Sidebar — hidden on mobile (≤640px), visible ≥641px ── */}
        <div className="hide-mobile" style={{
          width: 200, flexShrink: 0,
          borderRight: "1px solid rgba(196,163,90,0.25)",
          background: "var(--ivory)",
          position: "sticky", top: 0,
          minHeight: "calc(100dvh - 200px)",
          overflowY: "auto",
        }}>
          {/* Sidebar header */}
          <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid rgba(196,163,90,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <PostalHorn size={14} color="var(--copper)" />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)" }}>
                Sort by
              </span>
            </div>
            {/* Visit filter pills */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["all","visited","unvisited"] as const).map(v => (
                <button key={v} onClick={() => setVisitFilter(v)} style={{
                  flex: 1, padding: "4px 0", cursor: "pointer",
                  fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.07em", textTransform: "uppercase",
                  background: visitFilter === v ? "var(--spine)" : "var(--manuscript)",
                  color: visitFilter === v ? "var(--sandstone)" : "var(--laterite)",
                  border: visitFilter === v ? "1px solid rgba(13,31,58,0.5)" : "1px solid rgba(196,163,90,0.3)",
                }}>
                  {v === "all" ? "All" : v === "visited" ? "✓ Got" : "○ Need"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "2px solid rgba(196,163,90,0.2)" }}>
            {(["districts","categories"] as const).map(tab => (
              <button key={tab} onClick={() => setSideTab(tab)} style={{
                flex: 1, padding: "8px 0", cursor: "pointer",
                fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase",
                background: sideTab === tab ? "var(--spine)" : "transparent",
                color: sideTab === tab ? "var(--sandstone)" : "var(--copper)",
                border: "none",
                borderBottom: sideTab === tab ? "2px solid var(--post-red)" : "2px solid transparent",
              }}>
                {tab === "districts" ? "Districts" : "Types"}
              </button>
            ))}
          </div>

          <div style={{ paddingTop: 4 }}>
            {sideTab === "districts" ? (
              <>
                <StampChip label="All Districts" active={district === "All"} count={TOTAL} onClick={() => setDistrict("All")} />
                {ALL_DISTRICTS.map(d => (
                  <StampChip key={d} label={d} active={district === d} count={districtCounts[d] ?? 0} onClick={() => setDistrict(d)} />
                ))}
              </>
            ) : (
              <>
                <StampChip label="All Types" active={category === "All"} onClick={() => setCategory("All")} />
                {ALL_CATS.map(cat => (
                  <StampChip key={cat} label={cat} icon={CATEGORY_ICONS[cat]} active={category === cat} count={categoryCounts[cat] ?? 0} onClick={() => setCategory(cat)} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* Sticky toolbar */}
          <div style={{
            display: "flex", gap: 6, padding: "10px 16px",
            background: "var(--ivory)",
            borderBottom: "1px solid rgba(196,163,90,0.25)",
            position: "sticky", top: 0, zIndex: 20,
            flexWrap: "wrap", alignItems: "center",
          }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
              <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="5" cy="5" r="4" stroke="var(--copper)" strokeWidth="1.2"/>
                <line x1="8" y1="8" x2="11" y2="11" stroke="var(--copper)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search place, district, pincode…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inp, width: "100%", paddingLeft: 28, boxSizing: "border-box" as CSSProperties["boxSizing"] }}
              />
            </div>

            {/* Sort */}
            <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} style={{ ...inp, cursor: "pointer" }}>
              <option value="default">By Number</option>
              <option value="district">By District</option>
              <option value="collected">Collected First</option>
              <option value="uncollected">Uncollected First</option>
            </select>

            {/* View toggle */}
            <div style={{ display: "flex" }}>
              {(["grid","list"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setViewMode(v)} style={{
                  padding: "7px 10px", cursor: "pointer",
                  background: viewMode === v ? "var(--spine)" : "var(--page)",
                  color: viewMode === v ? "var(--sandstone)" : "var(--laterite)",
                  border: "1px solid rgba(196,163,90,0.4)",
                  borderRight: v === "grid" ? "none" : "1px solid rgba(196,163,90,0.4)",
                  fontSize: "0.9rem", lineHeight: 1,
                }}>
                  {v === "grid" ? "⊞" : "☰"}
                </button>
              ))}
            </div>

            {hasFilter && (
              <button onClick={clearAll} style={{ ...inp, cursor: "pointer", padding: "7px 10px", fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 4, background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010" }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Result count + active tags */}
          <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderBottom: "1px solid rgba(196,163,90,0.15)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--copper)" }}>
              {filtered.length} of {TOTAL}
              {collected > 0 && ` · ${collected} collected · ${districtsCovered} district${districtsCovered !== 1 ? "s" : ""}`}
            </span>
            {district !== "All" && (
              <button onClick={() => setDistrict("All")} style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", padding: "1px 7px", background: "var(--spine)", color: "var(--sandstone)", border: "1px solid rgba(13,31,58,0.4)", cursor: "pointer", letterSpacing: "0.05em" }}>
                {district} ✕
              </button>
            )}
            {category !== "All" && (
              <button onClick={() => setCategory("All")} style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", padding: "1px 7px", background: "var(--spine)", color: "var(--sandstone)", border: "1px solid rgba(13,31,58,0.4)", cursor: "pointer", letterSpacing: "0.05em" }}>
                {category} ✕
              </button>
            )}
          </div>

          {/* Grid / List / Empty */}
          <div style={{ padding: "14px 16px 48px", flex: 1 }}>
            {filtered.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {filtered.map(loc => <LocationCard key={loc.sno} location={loc} />)}
              </div>
            ) : (
              <div>{filtered.map(loc => <ListRow key={loc.sno} location={loc} visited={visitedSnos.has(loc.sno)} />)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page shell ────────────────────────────────────────────────── */
export default function PassportPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>

      {/* Header — same navy as navbar, with postal horn mark */}
      <div style={{
        background: "var(--spine)",
        borderBottom: "3px solid var(--temple)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle diagonal hatching — same as navbar cover aesthetic */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 22px, rgba(196,163,90,0.025) 22px, rgba(196,163,90,0.025) 23px)",
        }} />

        {/* India Post red top stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#C4391A,#E05020 50%,#C4391A)" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px 18px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              {/* PAR AVION badge */}
              <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="par-avion">
                  <PostalHorn size={10} color="#C4A35A" />
                  My Collection
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.16em", color: "rgba(196,163,90,0.45)", textTransform: "uppercase" }}>
                  Karnataka Circle
                </span>
              </div>

              <div style={{ fontFamily: "var(--font-kannada)", fontSize: "1.7rem", color: "#E8D9B8", lineHeight: 1.1, marginBottom: 3 }}>
                ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(196,163,90,0.5)" }}>
                100 Permanent Pictorial Cancellations · Version III
              </div>
            </div>

            {/* Inline stats — hide on very small screens */}
            <div className="hide-mobile" style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
              {[{ n: "100", l: "Locations" }, { n: "25", l: "Districts" }].map(({ n, l }) => (
                <div key={l} style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--sandstone)", lineHeight: 1 }}>{n}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,163,90,0.5)", marginTop: 1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.14em", color: "var(--copper)", padding: "52px 0", textAlign: "center", textTransform: "uppercase" }}>
          Loading passport…
        </div>
      }>
        <PassportInner />
      </Suspense>
    </div>
  );
}
