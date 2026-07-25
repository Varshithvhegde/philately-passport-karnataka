"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { locations, ALL_DISTRICTS, type Location } from "@/lib/data";
import LocationCard from "@/components/LocationCard";
import ProgressBar from "@/components/ProgressBar";
import { Search, SlidersHorizontal, X } from "lucide-react";

const ALL_CATS = [...new Set(locations.map((l) => l.category))].sort();

function PassportList() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState(params.get("district") ?? "All");
  const [category, setCategory] = useState(params.get("category") ?? "All");
  const [showFilters, setShowFilters] = useState(false);
  const [visitFilter, setVisitFilter] = useState<"all" | "visited" | "unvisited">("all");
  const [visitedSnos, setVisitedSnos] = useState<Set<number>>(new Set());

  useEffect(() => {
    function load() {
      const v = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("philately_visits") ?? "{}")
        : {};
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
      return (
        l.place.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.post_office.toLowerCase().includes(q) ||
        l.pincode.includes(q)
      );
    }
    return true;
  });

  const hasFilters = district !== "All" || category !== "All" || visitFilter !== "all" || search;

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#C4A35A" }} />
          <input
            type="text"
            placeholder="Search place, district, pincode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#FDF5E6", border: "1px solid #C4A35A80", color: "#2C1810" }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
          style={{
            background: showFilters ? "#5C3317" : "#EAD9B8",
            color: showFilters ? "#F5E9CC" : "#5C3317",
            border: "1px solid #C4A35A40",
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
        {hasFilters && (
          <button
            onClick={() => { setDistrict("All"); setCategory("All"); setVisitFilter("all"); setSearch(""); }}
            className="flex items-center gap-1 px-2 py-2 rounded-lg text-xs"
            style={{ background: "#F8D7DA", color: "#922B21" }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ background: "#F5E9CC", border: "1px solid #C4A35A40" }}>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C3317" }}>District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-xs rounded px-2 py-1.5 outline-none"
              style={{ background: "#FDF5E6", border: "1px solid #C4A35A", color: "#5C3317" }}
            >
              <option value="All">All Districts</option>
              {ALL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C3317" }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs rounded px-2 py-1.5 outline-none"
              style={{ background: "#FDF5E6", border: "1px solid #C4A35A", color: "#5C3317" }}
            >
              <option value="All">All Categories</option>
              {ALL_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C3317" }}>Visit Status</label>
            <select
              value={visitFilter}
              onChange={(e) => setVisitFilter(e.target.value as "all" | "visited" | "unvisited")}
              className="w-full text-xs rounded px-2 py-1.5 outline-none"
              style={{ background: "#FDF5E6", border: "1px solid #C4A35A", color: "#5C3317" }}
            >
              <option value="all">All</option>
              <option value="visited">Visited</option>
              <option value="unvisited">Not Yet Visited</option>
            </select>
          </div>
        </div>
      )}

      <p className="text-xs mb-4" style={{ color: "#8B4513" }}>
        Showing <strong>{filtered.length}</strong> of 100 locations
        {visitedSnos.size > 0 && ` · ${visitedSnos.size} visited`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((loc) => (
          <LocationCard key={loc.sno} location={loc} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p style={{ color: "#8B4513", fontFamily: "var(--font-heading)" }}>No locations found</p>
          <p className="text-sm mt-1" style={{ color: "#A0785A" }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

export default function PassportPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="chalukya-border py-3 px-1 mb-4" />
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "#5C3317" }}
        >
          My Philately Passport
        </h1>
        <p className="text-sm mt-1" style={{ color: "#8B4513" }}>
          100 Permanent Pictorial Cancellation locations across Karnataka
        </p>
      </div>

      <div className="stone-card rounded-xl p-5 mb-6">
        <ProgressBar />
      </div>

      <Suspense fallback={<div className="text-center py-8" style={{ color: "#8B4513" }}>Loading…</div>}>
        <PassportList />
      </Suspense>
    </div>
  );
}
