"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  locations,
  ALL_DISTRICTS,
  CATEGORY_ICONS,
  type Location,
} from "@/lib/data";
import LocationCard from "@/components/LocationCard";
import ProgressBar from "@/components/ProgressBar";

const TOTAL = 100;

const ALL_CATS = Object.keys(CATEGORY_ICONS);

type SortMode = "default" | "district" | "collected" | "uncollected";
type ViewMode = "grid" | "list";

const inputBase: CSSProperties = {
  padding: "8px 12px",
  background: "var(--manuscript)",
  border: "1px solid var(--sandstone)",
  borderRightColor: "#1A0E06",
  borderBottomColor: "#1A0E06",
  color: "var(--ink)",
  fontFamily: "var(--font-body)",
  fontSize: "0.82rem",
  outline: "none",
  appearance: "none" as CSSProperties["appearance"],
};

/* ─── StatTile ───────────────────────────────────────────────────────── */
function StatTile({
  label,
  value,
  sub,
  last,
}: {
  label: string;
  value: number | string;
  sub?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 22px",
        flex: 1,
        borderRight: last ? "none" : "1px solid rgba(196,163,90,0.3)",
        gap: 3,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "2rem",
          color: "var(--temple)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.53rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--copper)",
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.58rem",
            color: "var(--laterite)",
            fontStyle: "italic",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* ─── SidebarChip ────────────────────────────────────────────────────── */
function SidebarChip({
  label,
  icon,
  active,
  count,
  onClick,
}: {
  label: string;
  icon?: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        padding: "5px 9px",
        width: "100%",
        textAlign: "left",
        background: active
          ? "var(--temple)"
          : "transparent",
        color: active ? "var(--sandstone)" : "var(--laterite)",
        border: active
          ? "1px solid var(--copper)"
          : "1px solid transparent",
        fontFamily: "var(--font-body)",
        fontSize: "0.7rem",
        cursor: "pointer",
        transition: "all 0.14s",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {icon && <span style={{ fontSize: "0.8rem" }}>{icon}</span>}
        <span>{label}</span>
      </span>
      {count !== undefined && (
        <span
          style={{
            fontSize: "0.55rem",
            padding: "1px 5px",
            background: active
              ? "rgba(196,163,90,0.22)"
              : "rgba(122,59,15,0.12)",
            color: active ? "var(--sandstone)" : "var(--copper)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── ActiveTag ──────────────────────────────────────────────────────── */
function ActiveTag({
  label,
  onDismiss,
}: {
  label: string;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 7px 3px 9px",
        background: "rgba(74,40,16,0.1)",
        border: "1px solid var(--copper)",
        fontFamily: "var(--font-display)",
        fontSize: "0.6rem",
        letterSpacing: "0.05em",
        color: "var(--temple)",
      }}
    >
      {label}
      <button
        onClick={onDismiss}
        aria-label={`Remove ${label} filter`}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 0 0 2px",
          color: "var(--laterite)",
          lineHeight: 1,
          fontSize: "0.65rem",
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* ─── ListRow ────────────────────────────────────────────────────────── */
function ListRow({
  location,
  visited,
}: {
  location: Location;
  visited: boolean;
}) {
  return (
    <Link href={`/passport/${location.sno}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="manuscript-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          marginBottom: 6,
          borderLeft: visited
            ? "4px solid var(--forest)"
            : "4px solid rgba(196,163,90,0.4)",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.58rem",
            padding: "2px 6px",
            background: "var(--temple)",
            color: "var(--sandstone)",
            flexShrink: 0,
            letterSpacing: "0.06em",
          }}
        >
          {String(location.sno).padStart(3, "0")}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "var(--temple)",
              fontSize: "0.88rem",
              lineHeight: 1.25,
            }}
          >
            {location.place}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.66rem",
              color: "var(--copper)",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {location.district} · {location.post_office} · {location.pincode}
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.75rem",
          }}
        >
          <span>{CATEGORY_ICONS[location.category] ?? "•"}</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.58rem",
              color: "var(--copper)",
              letterSpacing: "0.03em",
              display: "inline",
            }}
          >
            {location.category}
          </span>
        </div>

        {visited && (
          <span
            style={{
              flexShrink: 0,
              padding: "2px 8px",
              background: "var(--forest)",
              color: "#A8D5B5",
              fontFamily: "var(--font-display)",
              fontSize: "0.52rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as CSSProperties["textTransform"],
            }}
          >
            Collected
          </span>
        )}
      </div>
    </Link>
  );
}

/* ─── EmptyState ─────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        padding: "64px 20px",
        textAlign: "center",
      }}
    >
      <svg width="148" height="148" viewBox="0 0 148 148" fill="none">
        <circle
          cx="74"
          cy="74"
          r="66"
          stroke="var(--sandstone)"
          strokeWidth="2.2"
          strokeDasharray="9 5"
        />
        <circle
          cx="74"
          cy="74"
          r="54"
          stroke="var(--copper)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          opacity="0.6"
        />
        <circle
          cx="74"
          cy="74"
          r="42"
          stroke="var(--laterite)"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.4"
        />
        <text
          x="74"
          y="68"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="13"
          fill="var(--copper)"
          letterSpacing="3"
        >
          NO
        </text>
        <text
          x="74"
          y="86"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="13"
          fill="var(--copper)"
          letterSpacing="3"
        >
          RESULTS
        </text>
      </svg>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            color: "var(--temple)",
            letterSpacing: "0.04em",
            marginBottom: 6,
          }}
        >
          No locations match your search
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--laterite)",
          }}
        >
          Adjust your filters or search term to discover more places
        </div>
      </div>
    </div>
  );
}

/* ─── PassportInner (uses useSearchParams — must be inside Suspense) ─── */
function PassportInner() {
  const params = useSearchParams();

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState(params.get("district") ?? "All");
  const [category, setCategory] = useState(params.get("category") ?? "All");
  const [visitFilter, setVisitFilter] = useState<"all" | "visited" | "unvisited">("all");
  const [visitedSnos, setVisitedSnos] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  useEffect(() => {
    function load() {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("philately_visits")
          : null;
      const v: Record<string, unknown> = raw ? JSON.parse(raw) : {};
      setVisitedSnos(new Set(Object.keys(v).map(Number)));
    }
    load();
    window.addEventListener("philately:update", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("philately:update", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const collected = visitedSnos.size;
  const remaining = TOTAL - collected;

  const districtsCovered = useMemo(
    () =>
      new Set(
        locations.filter((l) => visitedSnos.has(l.sno)).map((l) => l.district)
      ).size,
    [visitedSnos]
  );

  const districtCounts = useMemo(() => {
    const c: Record<string, number> = {};
    locations.forEach((l) => {
      c[l.district] = (c[l.district] ?? 0) + 1;
    });
    return c;
  }, []);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    locations.forEach((l) => {
      c[l.category] = (c[l.category] ?? 0) + 1;
    });
    return c;
  }, []);

  const filtered = useMemo<Location[]>(() => {
    let arr = locations.filter((l) => {
      if (district !== "All" && l.district !== district) return false;
      if (category !== "All" && l.category !== category) return false;
      if (visitFilter === "visited" && !visitedSnos.has(l.sno)) return false;
      if (visitFilter === "unvisited" && visitedSnos.has(l.sno)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.place.toLowerCase().includes(q) ||
          l.district.toLowerCase().includes(q) ||
          l.post_office.toLowerCase().includes(q) ||
          l.pincode.includes(q)
        );
      }
      return true;
    });

    switch (sortMode) {
      case "district":
        arr = [...arr].sort(
          (a, b) =>
            a.district.localeCompare(b.district) ||
            a.place.localeCompare(b.place)
        );
        break;
      case "collected":
        arr = [...arr].sort((a, b) => {
          const av = visitedSnos.has(a.sno) ? 0 : 1;
          const bv = visitedSnos.has(b.sno) ? 0 : 1;
          return av - bv || a.sno - b.sno;
        });
        break;
      case "uncollected":
        arr = [...arr].sort((a, b) => {
          const av = visitedSnos.has(a.sno) ? 1 : 0;
          const bv = visitedSnos.has(b.sno) ? 1 : 0;
          return av - bv || a.sno - b.sno;
        });
        break;
      default:
        break;
    }
    return arr;
  }, [district, category, visitFilter, search, sortMode, visitedSnos]);

  const hasDistrictFilter = district !== "All";
  const hasCategoryFilter = category !== "All";
  const hasVisitFilter = visitFilter !== "all";
  const hasSearch = !!search;
  const hasAnyFilter = hasDistrictFilter || hasCategoryFilter || hasVisitFilter || hasSearch;

  function clearAll() {
    setDistrict("All");
    setCategory("All");
    setVisitFilter("all");
    setSearch("");
  }

  return (
    <div>
      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          background: "linear-gradient(158deg, #FAF2DC 0%, #F2E6C2 100%)",
          borderTop: "2px solid var(--copper)",
          borderLeft: "2px solid var(--copper)",
          borderRight: "2px solid #1A0E06",
          borderBottom: "2px solid #1A0E06",
          boxShadow: "inset 0 1px 0 rgba(212,172,13,0.18), 3px 4px 14px rgba(26,14,6,0.18)",
          marginBottom: 24,
        }}
      >
        <StatTile label="Total Stamps" value={TOTAL} />
        <StatTile label="Collected" value={collected} />
        <StatTile label="Remaining" value={remaining} />
        <StatTile
          label="Districts"
          value={districtsCovered}
          sub="covered"
          last
        />
      </div>

      {/* ── Progress Bar ───────────────────────────────────────────────── */}
      <div className="manuscript-card" style={{ padding: "18px 22px", marginBottom: 28 }}>
        <ProgressBar />
      </div>

      {/* ── Two-panel layout ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>

        {/* ── LEFT Sidebar ─────────────────────────────────────────────── */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            position: "sticky",
            top: 16,
          }}
        >
          <div className="manuscript-card" style={{ padding: "14px 12px" }}>
            {/* Districts heading */}
            <div
              className="inscription"
              style={{
                fontSize: "0.52rem",
                letterSpacing: "0.22em",
                color: "var(--copper)",
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: "1px solid rgba(196,163,90,0.35)",
              }}
            >
              Districts
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 16 }}>
              <SidebarChip
                label="All Districts"
                active={district === "All"}
                onClick={() => setDistrict("All")}
                count={TOTAL}
              />
              {ALL_DISTRICTS.map((d) => (
                <SidebarChip
                  key={d}
                  label={d}
                  active={district === d}
                  onClick={() => setDistrict(d)}
                  count={districtCounts[d] ?? 0}
                />
              ))}
            </div>

            <div className="hoysala-rule-thin" style={{ marginBottom: 14 }} />

            {/* Categories heading */}
            <div
              className="inscription"
              style={{
                fontSize: "0.52rem",
                letterSpacing: "0.22em",
                color: "var(--copper)",
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: "1px solid rgba(196,163,90,0.35)",
              }}
            >
              Category
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <SidebarChip
                label="All Categories"
                active={category === "All"}
                onClick={() => setCategory("All")}
              />
              {ALL_CATS.map((cat) => (
                <SidebarChip
                  key={cat}
                  label={cat}
                  icon={CATEGORY_ICONS[cat]}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                  count={categoryCounts[cat] ?? 0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT Main Area ──────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search + Sort + View toggle row */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 10,
              flexWrap: "wrap",
              alignItems: "stretch",
            }}
          >
            {/* Search input */}
            <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
              >
                <circle cx="5.5" cy="5.5" r="4.5" stroke="var(--copper)" strokeWidth="1.3" />
                <line
                  x1="9"
                  y1="9"
                  x2="12"
                  y2="12"
                  stroke="var(--copper)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search place, district, pincode…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputBase, width: "100%", paddingLeft: 30, boxSizing: "border-box" as CSSProperties["boxSizing"] }}
              />
            </div>

            {/* Visit filter */}
            <select
              value={visitFilter}
              onChange={(e) => setVisitFilter(e.target.value as "all" | "visited" | "unvisited")}
              style={{ ...inputBase, cursor: "pointer" }}
            >
              <option value="all">All Status</option>
              <option value="visited">Collected</option>
              <option value="unvisited">Uncollected</option>
            </select>

            {/* Sort */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              style={{ ...inputBase, cursor: "pointer" }}
            >
              <option value="default">Default (by number)</option>
              <option value="district">By District A-Z</option>
              <option value="collected">Collected First</option>
              <option value="uncollected">Uncollected First</option>
            </select>

            {/* View toggle */}
            <div style={{ display: "flex" }}>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                style={{
                  padding: "8px 13px",
                  background: viewMode === "grid" ? "var(--temple)" : "var(--manuscript)",
                  color: viewMode === "grid" ? "var(--sandstone)" : "var(--laterite)",
                  border: "1px solid var(--sandstone)",
                  borderRight: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  lineHeight: 1,
                }}
                aria-label="Grid view"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List view"
                style={{
                  padding: "8px 13px",
                  background: viewMode === "list" ? "var(--temple)" : "var(--manuscript)",
                  color: viewMode === "list" ? "var(--sandstone)" : "var(--laterite)",
                  border: "1px solid var(--sandstone)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  lineHeight: 1,
                }}
                aria-label="List view"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Active filter tags */}
          {hasAnyFilter && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.52rem",
                  letterSpacing: "0.14em",
                  color: "var(--copper)",
                  textTransform: "uppercase",
                }}
              >
                Active:
              </span>
              {hasDistrictFilter && (
                <ActiveTag label={district} onDismiss={() => setDistrict("All")} />
              )}
              {hasCategoryFilter && (
                <ActiveTag label={category} onDismiss={() => setCategory("All")} />
              )}
              {hasVisitFilter && (
                <ActiveTag
                  label={visitFilter === "visited" ? "Collected" : "Uncollected"}
                  onDismiss={() => setVisitFilter("all")}
                />
              )}
              {hasSearch && (
                <ActiveTag
                  label={`"${search}"`}
                  onDismiss={() => setSearch("")}
                />
              )}
              <button
                onClick={clearAll}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.52rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  color: "var(--laterite)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "0 2px",
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Result count */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.62rem",
              letterSpacing: "0.06em",
              color: "var(--copper)",
              marginBottom: 14,
            }}
          >
            Showing {filtered.length} of {TOTAL} locations
            {visitedSnos.size > 0 && ` · ${visitedSnos.size} collected`}
          </div>

          {/* Grid / List / Empty */}
          {filtered.length === 0 ? (
            <EmptyState />
          ) : viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
              }}
            >
              {filtered.map((loc) => (
                <LocationCard key={loc.sno} location={loc} />
              ))}
            </div>
          ) : (
            <div>
              {filtered.map((loc) => (
                <ListRow
                  key={loc.sno}
                  location={loc}
                  visited={visitedSnos.has(loc.sno)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function PassportPage() {
  return (
    <div style={{ maxWidth: 1260, margin: "0 auto", paddingBottom: 48 }}>

      {/* ── Hero Header ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--temple)",
          padding: "0 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="hoysala-rule" />
        <div
          style={{
            padding: "28px 40px 26px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* decorative side accents */}
          <div
            style={{
              position: "absolute",
              left: 28,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.35,
              fontSize: "2rem",
              color: "var(--sandstone)",
              userSelect: "none",
            }}
          >
            ✦
          </div>
          <div
            style={{
              position: "absolute",
              right: 28,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.35,
              fontSize: "2rem",
              color: "var(--sandstone)",
              userSelect: "none",
            }}
          >
            ✦
          </div>

          <div
            style={{
              fontFamily: "var(--font-kannada)",
              fontSize: "2.4rem",
              color: "var(--sandstone)",
              lineHeight: 1.25,
              marginBottom: 6,
            }}
          >
            ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.45rem",
              fontWeight: 700,
              color: "var(--gilt)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Philately Passport
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                height: 1,
                width: 56,
                background: "rgba(196,163,90,0.45)",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                color: "rgba(196,163,90,0.85)",
                letterSpacing: "0.04em",
                fontStyle: "italic",
              }}
            >
              100 Permanent Pictorial Cancellations · Karnataka V3
            </div>
            <div
              style={{
                height: 1,
                width: 56,
                background: "rgba(196,163,90,0.45)",
              }}
            />
          </div>
        </div>
        <div className="hoysala-rule" />
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div style={{ padding: "28px 20px 0" }}>
        <Suspense
          fallback={
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                color: "var(--copper)",
                padding: "52px 0",
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              Loading passport…
            </div>
          }
        >
          <PassportInner />
        </Suspense>
      </div>
    </div>
  );
}
