"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { locations, ALL_DISTRICTS, type Location } from "@/lib/data";
import LocationCard from "@/components/LocationCard";
import ProgressBar from "@/components/ProgressBar";
import { X } from "lucide-react";

const ALL_CATS = [...new Set(locations.map((l) => l.category))].sort();

const inputStyle = {
  width: "100%",
  padding: "7px 10px",
  background: "var(--manuscript)",
  border: "1px solid var(--sandstone)",
  borderRightColor: "#1A0E06",
  borderBottomColor: "#1A0E06",
  color: "var(--ink)",
  fontFamily: "var(--font-body)",
  fontSize: "0.82rem",
  outline: "none",
};

function PassportList() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState(params.get("district") ?? "All");
  const [category, setCategory] = useState(params.get("category") ?? "All");
  const [visitFilter, setVisitFilter] = useState<"all" | "visited" | "unvisited">("all");
  const [visitedSnos, setVisitedSnos] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    function load() {
      const v = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("philately_visits") ?? "{}") : {};
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

  const filtered: Location[] = locations.filter((l) => {
    if (district !== "All" && l.district !== district) return false;
    if (category !== "All" && l.category !== category) return false;
    if (visitFilter === "visited" && !visitedSnos.has(l.sno)) return false;
    if (visitFilter === "unvisited" && visitedSnos.has(l.sno)) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.place.toLowerCase().includes(q) || l.district.toLowerCase().includes(q)
        || l.post_office.toLowerCase().includes(q) || l.pincode.includes(q);
    }
    return true;
  });

  const hasFilter = district !== "All" || category !== "All" || visitFilter !== "all" || search;

  return (
    <div>
      {/* Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, position: "relative", minWidth: 160 }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="4" stroke="#C4A35A" strokeWidth="1.2"/>
            <line x1="8" y1="8" x2="11" y2="11" stroke="#C4A35A" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            type="text" placeholder="Search place, district, pincode…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 28 }}
          />
        </div>

        <button onClick={() => setShowFilters(v => !v)}
          style={{ ...inputStyle, width: "auto", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", background: showFilters ? "var(--temple)" : "var(--manuscript)", color: showFilters ? "var(--sandstone)" : "var(--temple)" }}>
          Filters {showFilters ? "▲" : "▼"}
        </button>

        {hasFilter && (
          <button onClick={() => { setDistrict("All"); setCategory("All"); setVisitFilter("all"); setSearch(""); }}
            style={{ padding: "7px 10px", background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.08em", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="manuscript-card" style={{ padding: "14px 16px", marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "District", value: district, onChange: (v: string) => setDistrict(v), opts: ["All", ...ALL_DISTRICTS] },
            { label: "Category", value: category, onChange: (v: string) => setCategory(v), opts: ["All", ...ALL_CATS] },
            { label: "Status",   value: visitFilter, onChange: (v: string) => setVisitFilter(v as "all"|"visited"|"unvisited"),
              opts: [["all","All"],["visited","Visited"],["unvisited","Unvisited"]] as unknown as string[] },
          ].map(({ label, value, onChange, opts }) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>{label}</div>
              <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                {opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.06em", color: "var(--copper)", marginBottom: 14 }}>
        Showing {filtered.length} of 100 locations{visitedSnos.size > 0 ? ` · ${visitedSnos.size} collected` : ""}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {filtered.map((loc) => <LocationCard key={loc.sno} location={loc} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--copper)" }}>No locations found</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--laterite)", marginTop: 6 }}>Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
}

export default function PassportPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="hoysala-rule-thin mb-8" />

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>
          My Collection
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--temple)", fontSize: "1.7rem", lineHeight: 1.15 }}>
          Philately Passport
        </h1>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--laterite)", marginTop: 4 }}>
          100 Permanent Pictorial Cancellations across Karnataka
        </div>
      </div>

      <div className="manuscript-card mb-8" style={{ padding: "20px 22px" }}>
        <ProgressBar />
      </div>

      <Suspense fallback={<div style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--copper)", padding: "32px 0", textAlign: "center" }}>Loading…</div>}>
        <PassportList />
      </Suspense>
    </div>
  );
}
