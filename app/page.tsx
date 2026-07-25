import Link from "next/link";
import { locations, ALL_DISTRICTS, CATEGORY_BG, CATEGORY_ICONS } from "@/lib/data";
import ProgressBar from "@/components/ProgressBar";

const CATEGORIES = [
  ...new Set(locations.map((l) => l.category)),
].sort();

const DISTRICT_COUNTS = ALL_DISTRICTS.map((d) => ({
  district: d,
  count: locations.filter((l) => l.district === d).length,
})).sort((a, b) => b.count - a.count);

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #5C3317 0%, #8B4513 50%, #C4A35A 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏛️</span>
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{ background: "#C4A35A", color: "#5C3317" }}
            >
              KARNATAKA CIRCLE
            </span>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)", color: "#FDF5E6", letterSpacing: "0.02em" }}
          >
            फिलाटेली पासपोर्ट
          </h1>
          <h2
            className="text-xl font-semibold mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "#EAD9B8" }}
          >
            Philately Passport — Version 3.0
          </h2>
          <p className="text-sm mb-6 max-w-lg" style={{ color: "#D4B896" }}>
            Permanent Pictorial Cancellations of Karnataka. Visit 100 post offices across 25 districts,
            collect stamps, and complete your journey through Karnataka&apos;s heritage.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/map"
              className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
              style={{ background: "#C4A35A", color: "#5C3317" }}
            >
              Explore Map →
            </Link>
            <Link
              href="/passport"
              className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
              style={{ background: "transparent", color: "#EAD9B8", border: "1px solid #C4A35A60" }}
            >
              Open Passport →
            </Link>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="stone-card rounded-xl p-5 mb-8">
        <ProgressBar />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Locations", value: "100", icon: "📍" },
          { label: "Districts", value: "25", icon: "🗺️" },
          { label: "Categories", value: CATEGORIES.length.toString(), icon: "🏷️" },
          { label: "Karnataka PPCs", value: "V3", icon: "📮" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stone-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-heading)", color: "#5C3317" }}
            >
              {value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#8B4513" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Districts */}
        <div className="stone-card rounded-xl p-5">
          <h3
            className="font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "#5C3317", fontSize: "1rem" }}
          >
            Districts
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {DISTRICT_COUNTS.map(({ district, count }) => (
              <Link
                key={district}
                href={`/passport?district=${encodeURIComponent(district)}`}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:opacity-80 transition-opacity"
                style={{ background: "#EAD9B8", color: "#5C3317" }}
              >
                <span className="font-medium">{district}</span>
                <span
                  className="text-xs font-bold rounded px-1"
                  style={{ background: "#C4A35A", color: "#5C3317" }}
                >
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="stone-card rounded-xl p-5">
          <h3
            className="font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "#5C3317", fontSize: "1rem" }}
          >
            Categories
          </h3>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => {
              const cnt = locations.filter((l) => l.category === cat).length;
              const bg = CATEGORY_BG[cat] ?? "bg-stone-100 text-stone-700";
              const icon = CATEGORY_ICONS[cat] ?? "📍";
              return (
                <Link
                  key={cat}
                  href={`/passport?category=${encodeURIComponent(cat)}`}
                  className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity"
                >
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium flex-1 ${bg}`}>
                    <span>{icon}</span>
                    {cat}
                  </span>
                  <span className="text-xs font-bold" style={{ color: "#8B4513" }}>{cnt}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div
        className="rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between"
        style={{ background: "#5C3317", border: "1px solid #C4A35A40" }}
      >
        <div>
          <p
            className="font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "#F5E9CC", fontSize: "1rem" }}
          >
            Ready to start your journey?
          </p>
          <p className="text-sm mt-0.5" style={{ color: "#C4A35A" }}>
            Open the Passport view to browse all 100 locations and mark your visits.
          </p>
        </div>
        <Link
          href="/passport"
          className="flex-shrink-0 px-6 py-2.5 rounded-lg font-semibold text-sm"
          style={{ background: "#C4A35A", color: "#5C3317" }}
        >
          Start Collecting →
        </Link>
      </div>
    </div>
  );
}
