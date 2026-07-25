"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { locations, ALL_DISTRICTS, CATEGORY_ICONS, type Location } from "@/lib/data";
import LocationCard from "@/components/LocationCard";
import StampGrid from "@/components/StampGrid";

const TOTAL = 100;
const ALL_CATS = Object.keys(CATEGORY_ICONS);

type SortMode = "default" | "district" | "collected" | "uncollected";
type ViewMode = "grid" | "list";

const inp: CSSProperties = {
  padding: "7px 10px",
  background: "var(--page)",
  border: "1px solid rgba(196,163,90,0.45)",
  borderRightColor: "rgba(26,14,6,0.2)",
  borderBottomColor: "rgba(26,14,6,0.2)",
  color: "var(--ink)",
  fontFamily: "var(--font-body)",
  fontSize: "0.78rem",
  outline: "none",
};

/* ── SidebarRow ────────────────────────────────────────────────── */
function SidebarRow({ label, icon, active, count, onClick }: {
  label: string; icon?: string; active: boolean; count?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "5px 8px", textAlign: "left", cursor: "pointer",
      background: active ? "var(--temple)" : "transparent",
      color: active ? "var(--sandstone)" : "var(--ink-mid)",
      border: active ? "1px solid rgba(196,163,90,0.3)" : "1px solid transparent",
      borderLeft: active ? "3px solid var(--sandstone)" : "3px solid transparent",
      fontFamily: "var(--font-body)", fontSize: "0.72rem",
      transition: "all 0.12s",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {icon && <span style={{ fontSize: "0.78rem", flexShrink: 0 }}>{icon}</span>}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </span>
      {count !== undefined && (
        <span style={{
          fontSize: "0.56rem", padding: "0px 5px", flexShrink: 0,
          background: active ? "rgba(196,163,90,0.25)" : "rgba(122,59,15,0.1)",
          color: active ? "var(--sandstone)" : "var(--copper)",
          fontFamily: "var(--font-display)", letterSpacing: "0.04em",
        }}>{count}</span>
      )}
    </button>
  );
}

/* ── ListRow ───────────────────────────────────────────────────── */
function ListRow({ location, visited }: { location: Location; visited: boolean }) {
  return (
    <Link href={`/passport/${location.sno}`} style={{ textDecoration: "none", display: "block", marginBottom: 4 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
        background: "var(--page)",
        borderLeft: `4px solid ${visited ? "var(--forest)" : "var(--temple)"}`,
        borderTop: "1px solid rgba(196,163,90,0.3)",
        borderRight: "1px solid rgba(26,14,6,0.14)",
        borderBottom: "1px solid rgba(26,14,6,0.14)",
        cursor: "pointer", transition: "opacity 0.12s",
      }}>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "0.56rem",
          padding: "2px 6px", background: "var(--temple)", color: "var(--sandstone)",
          flexShrink: 0, letterSpacing: "0.06em",
        }}>{String(location.sno).padStart(3, "0")}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.85rem", lineHeight: 1.2 }}>
            {location.place}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.64rem", color: "var(--copper)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {location.district} · {location.post_office}
          </div>
        </div>

        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: "0.75rem" }}>{CATEGORY_ICONS[location.category] ?? "•"}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.56rem", color: "var(--copper)", letterSpacing: "0.04em", display: "none" }}
            className="sm:inline">{location.category}</span>
        </span>

        {visited && (
          <span style={{
            flexShrink: 0, fontFamily: "var(--font-kalam, cursive)", fontSize: "0.7rem",
            color: "var(--forest)", marginLeft: 4,
          }}>✓ collected</span>
        )}
      </div>
    </Link>
  );
}

/* ── EmptyState ────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "56px 20px", textAlign: "center" }}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="52" stroke="var(--sandstone)" strokeWidth="1.8" strokeDasharray="8 5" opacity="0.5"/>
        <circle cx="60" cy="60" r="40" stroke="var(--copper)" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.4"/>
        <text x="60" y="55" textAnchor="middle" fontFamily="var(--font-display)" fontSize="11" fill="var(--copper)" letterSpacing="3">NO</text>
        <text x="60" y="70" textAnchor="middle" fontFamily="var(--font-display)" fontSize="11" fill="var(--copper)" letterSpacing="3">RESULTS</text>
      </svg>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "var(--temple)", letterSpacing: "0.04em" }}>
        No locations match your search
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--laterite)" }}>
        Adjust your filters or search term
      </div>
    </div>
  );
}

/* ── PassportInner ─────────────────────────────────────────────── */
function PassportInner() {
  const params = useSearchParams();
  const [search,      setSearch]      = useState("");
  const [district,    setDistrict]    = useState(params.get("district") ?? "All");
  const [category,    setCategory]    = useState(params.get("category") ?? "All");
  const [visitFilter, setVisitFilter] = useState<"all"|"visited"|"unvisited">("all");
  const [viewMode,    setViewMode]    = useState<ViewMode>("grid");
  const [sortMode,    setSortMode]    = useState<SortMode>("default");
  const [visitedSnos, setVisitedSnos] = useState<Set<number>>(new Set());
  const [sideTab,     setSideTab]     = useState<"districts"|"categories">("districts");

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
    if (sortMode === "district")    arr = [...arr].sort((a,b) => a.district.localeCompare(b.district) || a.place.localeCompare(b.place));
    if (sortMode === "collected")   arr = [...arr].sort((a,b) => (visitedSnos.has(a.sno)?0:1)-(visitedSnos.has(b.sno)?0:1)||a.sno-b.sno);
    if (sortMode === "uncollected") arr = [...arr].sort((a,b) => (visitedSnos.has(a.sno)?1:0)-(visitedSnos.has(b.sno)?1:0)||a.sno-b.sno);
    return arr;
  }, [district, category, visitFilter, search, sortMode, visitedSnos]);

  const hasFilter = district !== "All" || category !== "All" || visitFilter !== "all" || search;

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>

      {/* ── LEFT: Sidebar ──────────────────────────────────────────── */}
      <div style={{
        width: 210, flexShrink: 0, position: "sticky", top: 0,
        borderRight: "1px solid rgba(196,163,90,0.25)",
        background: "var(--ivory)",
        minHeight: "calc(100vh - 108px)",
      }}>
        {/* Stamp grid mini progress */}
        <div style={{ padding: "18px 14px 14px", borderBottom: "1px solid rgba(196,163,90,0.2)" }}>
          <StampGrid />
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(196,163,90,0.25)" }}>
          {(["districts","categories"] as const).map(tab => (
            <button key={tab} onClick={() => setSideTab(tab)} style={{
              flex: 1, padding: "8px 0",
              fontFamily: "var(--font-display)", fontSize: "0.56rem",
              letterSpacing: "0.12em", textTransform: "uppercase",
              background: sideTab === tab ? "var(--temple)" : "transparent",
              color: sideTab === tab ? "var(--sandstone)" : "var(--copper)",
              border: "none", cursor: "pointer",
              borderBottom: sideTab === tab ? "2px solid var(--sandstone)" : "2px solid transparent",
            }}>
              {tab === "districts" ? "Districts" : "Category"}
            </button>
          ))}
        </div>

        <div style={{ padding: "6px 0", overflowY: "auto", maxHeight: "calc(100vh - 380px)" }}>
          {sideTab === "districts" ? (
            <>
              <SidebarRow label="All Districts" active={district === "All"} count={TOTAL} onClick={() => setDistrict("All")} />
              {ALL_DISTRICTS.map(d => (
                <SidebarRow key={d} label={d} active={district === d} count={districtCounts[d] ?? 0} onClick={() => setDistrict(d)} />
              ))}
            </>
          ) : (
            <>
              <SidebarRow label="All Categories" active={category === "All"} onClick={() => setCategory("All")} />
              {ALL_CATS.map(cat => (
                <SidebarRow key={cat} label={cat} icon={CATEGORY_ICONS[cat]} active={category === cat} count={categoryCounts[cat] ?? 0} onClick={() => setCategory(cat)} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── RIGHT: Main content ─────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{
          display: "flex", gap: 6, padding: "12px 16px",
          background: "var(--ivory)", alignItems: "center",
          borderBottom: "1px solid rgba(196,163,90,0.25)",
          position: "sticky", top: 0, zIndex: 20, flexWrap: "wrap",
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

          {/* Visit filter */}
          <select value={visitFilter} onChange={e => setVisitFilter(e.target.value as "all"|"visited"|"unvisited")} style={{ ...inp, cursor: "pointer", appearance: "auto" as CSSProperties["appearance"] }}>
            <option value="all">All</option>
            <option value="visited">Collected</option>
            <option value="unvisited">Uncollected</option>
          </select>

          {/* Sort */}
          <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} style={{ ...inp, cursor: "pointer", appearance: "auto" as CSSProperties["appearance"] }}>
            <option value="default">By Number</option>
            <option value="district">By District</option>
            <option value="collected">Collected First</option>
            <option value="uncollected">Uncollected First</option>
          </select>

          {/* View toggle */}
          <div style={{ display: "flex", border: "1px solid rgba(196,163,90,0.45)" }}>
            {(["grid","list"] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)} title={`${v} view`} style={{
                padding: "7px 11px", cursor: "pointer",
                background: viewMode === v ? "var(--temple)" : "var(--page)",
                color: viewMode === v ? "var(--sandstone)" : "var(--laterite)",
                border: "none", fontSize: "0.9rem", lineHeight: 1,
                borderRight: v === "grid" ? "1px solid rgba(196,163,90,0.3)" : "none",
              }}>
                {v === "grid" ? "⊞" : "☰"}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasFilter && (
            <button onClick={() => { setDistrict("All"); setCategory("All"); setVisitFilter("all"); setSearch(""); }}
              style={{ ...inp, cursor: "pointer", background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", display: "flex", alignItems: "center", gap: 4, padding: "7px 10px", fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.06em" }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div style={{ padding: "8px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--copper)" }}>
            {filtered.length} of {TOTAL} locations{visitedSnos.size > 0 ? ` · ${collected} collected · ${districtsCovered} districts` : ""}
          </span>
          {hasFilter && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
              {district !== "All" && <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", padding: "1px 6px", background: "rgba(74,40,16,0.1)", border: "1px solid var(--copper)", color: "var(--temple)", letterSpacing: "0.05em" }}>{district} ✕</span>}
              {category !== "All" && <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", padding: "1px 6px", background: "rgba(74,40,16,0.1)", border: "1px solid var(--copper)", color: "var(--temple)", letterSpacing: "0.05em" }}>{category} ✕</span>}
              {visitFilter !== "all" && <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", padding: "1px 6px", background: "rgba(74,40,16,0.1)", border: "1px solid var(--copper)", color: "var(--temple)", letterSpacing: "0.05em" }}>{visitFilter === "visited" ? "Collected" : "Uncollected"} ✕</span>}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "12px 16px 48px" }}>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))", gap: 12 }}>
              {filtered.map(loc => <LocationCard key={loc.sno} location={loc} />)}
            </div>
          ) : (
            <div>
              {filtered.map(loc => <ListRow key={loc.sno} location={loc} visited={visitedSnos.has(loc.sno)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function PassportPage() {
  return (
    <div style={{ background: "var(--ivory)" }}>

      {/* Page header — dark navy like opening to the index page */}
      <div style={{
        background: "var(--spine)",
        padding: "26px 36px 22px",
        position: "relative",
        overflow: "hidden",
        borderBottom: "3px solid var(--temple)",
      }}>
        {/* subtle diagonal texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(196,163,90,0.025) 20px, rgba(196,163,90,0.025) 21px)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
          {/* eyebrow */}
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(196,163,90,0.5)", marginBottom: 8 }}>
            My Collection · Karnataka Circle
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-kannada)", fontSize: "1.8rem", color: "rgba(234,217,184,0.9)", lineHeight: 1.1, marginBottom: 4 }}>
                ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,163,90,0.6)" }}>
                100 Permanent Pictorial Cancellations · Version III
              </div>
            </div>

            {/* Three compact stats — not big tiles, just data inline */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
              {[
                { label: "total", value: "100" },
                { label: "districts", value: "25" },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, color: "var(--sandstone)", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(196,163,90,0.55)", marginTop: 1 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <Suspense fallback={
        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", letterSpacing: "0.14em", color: "var(--copper)", padding: "52px 0", textAlign: "center", textTransform: "uppercase" }}>
          Loading…
        </div>
      }>
        <PassportInner />
      </Suspense>
    </div>
  );
}
