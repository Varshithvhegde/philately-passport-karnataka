"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { locations, ALL_DISTRICTS, CATEGORY_COLORS, CATEGORY_ICONS, type Location } from "@/lib/data";
import CategoryBadge from "@/components/CategoryBadge";
import { MapPin, X } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-xl" style={{ minHeight: 480, background: "#F5E9CC", border: "2px solid #C4A35A" }}>
      <div className="text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <p style={{ color: "#8B4513", fontFamily: "var(--font-heading)" }}>Loading map…</p>
      </div>
    </div>
  ),
});

const ALL_CATS = [...new Set(locations.map((l) => l.category))].sort();

export default function MapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [highlighted, setHighlighted] = useState<number | undefined>();
  const [sidebar, setSidebar] = useState<Location | null>(null);

  const filtered = locations.filter((l) => {
    if (selectedDistrict !== "All" && l.district !== selectedDistrict) return false;
    if (selectedCategory !== "All" && l.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Filters bar */}
      <div className="chalukya-border px-4 py-2 flex items-center gap-3 overflow-x-auto flex-shrink-0" style={{ background: "#F5E9CC" }}>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="text-xs rounded px-2 py-1 outline-none"
          style={{ background: "#FDF5E6", border: "1px solid #C4A35A", color: "#5C3317" }}
        >
          <option value="All">All Districts</option>
          {ALL_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs rounded px-2 py-1 outline-none"
          style={{ background: "#FDF5E6", border: "1px solid #C4A35A", color: "#5C3317" }}
        >
          <option value="All">All Categories</option>
          {ALL_CATS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <span className="text-xs ml-auto flex-shrink-0" style={{ color: "#8B4513" }}>
          {filtered.length} locations
        </span>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3">
          {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1 text-xs" style={{ color: "#5C3317" }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {CATEGORY_ICONS[cat]}
            </span>
          ))}
        </div>
      </div>

      {/* Map + sidebar */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 p-3">
          <MapComponent
            locations={filtered}
            highlightSno={highlighted}
            onSelect={(loc) => { setSidebar(loc); setHighlighted(loc.sno); }}
          />
        </div>

        {/* Sidebar */}
        {sidebar && (
          <div className="w-72 flex-shrink-0 overflow-y-auto p-3 border-l" style={{ background: "#FDF5E6", borderColor: "#C4A35A40" }}>
            <div className="flex items-start justify-between mb-3">
              <h3 style={{ fontFamily: "var(--font-heading)", color: "#5C3317", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3 }}>
                {sidebar.place}
              </h3>
              <button onClick={() => { setSidebar(null); setHighlighted(undefined); }}>
                <X size={16} style={{ color: "#8B4513" }} />
              </button>
            </div>

            <div className="flex items-center gap-1 text-xs mb-3" style={{ color: "#8B4513" }}>
              <MapPin size={11} />
              {sidebar.district} · {sidebar.pincode}
            </div>

            <CategoryBadge category={sidebar.category} />

            <div className="mt-3 rounded-lg p-3 text-xs space-y-1.5" style={{ background: "#EAD9B8" }}>
              <div><span style={{ color: "#8B4513", fontWeight: 600 }}>Post Office:</span>{" "}
                <span style={{ color: "#5C3317" }}>{sidebar.post_office}</span></div>
              {sidebar.address && (
                <div><span style={{ color: "#8B4513", fontWeight: 600 }}>Address:</span>{" "}
                  <span style={{ color: "#5C3317" }}>{sidebar.address}</span></div>
              )}
              <div><span style={{ color: "#8B4513", fontWeight: 600 }}>Coordinates:</span>{" "}
                <span style={{ color: "#5C3317", fontFamily: "monospace" }}>{sidebar.latitude.toFixed(4)}, {sidebar.longitude.toFixed(4)}</span></div>
            </div>

            <a
              href={`/passport/${sidebar.sno}`}
              className="block mt-3 text-center py-2 rounded-lg text-xs font-semibold"
              style={{ background: "#5C3317", color: "#F5E9CC" }}
            >
              Open Passport Page →
            </a>

            {/* Nearby */}
            <div className="mt-4">
              <p className="text-xs font-semibold mb-2" style={{ color: "#8B4513" }}>Same District</p>
              <div className="space-y-1">
                {locations.filter((l) => l.district === sidebar.district && l.sno !== sidebar.sno).map((l) => (
                  <button
                    key={l.sno}
                    className="w-full text-left text-xs rounded px-2 py-1.5 transition-colors hover:opacity-80"
                    style={{ background: "#EAD9B8", color: "#5C3317" }}
                    onClick={() => { setSidebar(l); setHighlighted(l.sno); }}
                  >
                    <span className="font-medium">{l.place}</span>
                    <span className="ml-1 opacity-60">#{l.sno}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
