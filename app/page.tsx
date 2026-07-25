import Link from "next/link";
import { locations, ALL_DISTRICTS } from "@/lib/data";
import ProgressBar from "@/components/ProgressBar";
import CategoryBadge from "@/components/CategoryBadge";

const CATEGORIES = [...new Set(locations.map((l) => l.category))].sort();
const DISTRICT_COUNTS = ALL_DISTRICTS.map((d) => ({
  district: d,
  count: locations.filter((l) => l.district === d).length,
})).sort((a, b) => b.count - a.count);

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden mb-10" style={{
        background: "linear-gradient(135deg, #1A0E06 0%, #4A2810 45%, #7A3B0F 100%)",
        borderTop: "2px solid #B8722A", borderLeft: "2px solid #B8722A",
        borderRight: "2px solid #060300", borderBottom: "2px solid #060300",
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 18px, rgba(196,163,90,0.04) 18px, rgba(196,163,90,0.04) 19px)",
        }} />
        <div className="hoysala-rule-thin" />
        <div style={{ padding: "36px 40px 32px" }} className="relative z-10">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", background: "rgba(196,163,90,0.1)", border: "1px solid rgba(196,163,90,0.3)", padding: "2px 10px" }}>
              India Post · Karnataka Circle
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-kannada)", color: "#F8F0D8", fontSize: "2.4rem", lineHeight: 1.2, marginBottom: 4 }}>
            ಕರ್ನಾಟಕ ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
          </h1>
          <div style={{ fontFamily: "var(--font-display)", color: "var(--sandstone)", fontSize: "1.05rem", letterSpacing: "0.06em", marginBottom: 6 }}>
            Karnataka Philately Passport
          </div>
          <div style={{ fontFamily: "var(--font-display)", color: "var(--copper)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
            Version III · Permanent Pictorial Cancellations
          </div>
          <p style={{ fontFamily: "var(--font-body)", color: "#C8A878", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 520, marginBottom: 28 }}>
            Journey across 25 districts of Karnataka. Visit 100 post offices, collect
            pictorial cancellation stamps, and document your passage through the land
            of Hoysalas, Chalukyas, and Vijayanagara.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/map" className="temple-btn" style={{ padding: "10px 28px", display: "inline-block" }}>Explore Map</Link>
            <Link href="/passport" className="ghost-btn" style={{ padding: "10px 28px", display: "inline-block" }}>Open Passport</Link>
          </div>
        </div>
        <div className="hoysala-rule-thin" />
      </div>

      {/* ── Progress ─────────────────────────────────────────────── */}
      <div className="manuscript-card mb-10" style={{ padding: "22px 24px" }}>
        <ProgressBar />
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 8 }}>
        {[
          { n: "100", label: "Locations",  sub: "across Karnataka" },
          { n: "25",  label: "Districts",  sub: "represented" },
          { n: String(CATEGORIES.length), label: "Categories", sub: "of heritage" },
          { n: "V3",  label: "Version",    sub: "current edition" },
        ].map(({ n, label, sub }) => (
          <div key={label} className="manuscript-card" style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--temple)", lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--copper)", marginTop: 4 }}>{label}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "var(--laterite)", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="hoysala-rule-thin my-8" />

      {/* ── Districts + Categories ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 10 }}>Districts</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {DISTRICT_COUNTS.map(({ district, count }) => (
              <Link key={district} href={`/passport?district=${encodeURIComponent(district)}`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", background: "var(--manuscript)", border: "1px solid rgba(196,163,90,0.3)", borderRightColor: "rgba(26,14,6,0.1)", borderBottomColor: "rgba(26,14,6,0.1)", fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--temple)", transition: "opacity 0.12s" }}>
                <span>{district}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, color: "var(--copper)" }}>{count}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 10 }}>Categories</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {CATEGORIES.map((cat) => {
              const cnt = locations.filter((l) => l.category === cat).length;
              return (
                <Link key={cat} href={`/passport?category=${encodeURIComponent(cat)}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <CategoryBadge category={cat} size="sm" />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700, color: "var(--copper)" }}>{cnt}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hoysala-rule-thin my-8" />

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <div style={{ background: "var(--temple)", borderTop: "1px solid var(--copper)", borderLeft: "1px solid var(--copper)", borderRight: "1px solid #060300", borderBottom: "1px solid #060300", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--manuscript)", fontSize: "1rem", marginBottom: 4 }}>Begin your journey</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--copper)" }}>Browse all 100 locations and record your stamp collections.</div>
        </div>
        <Link href="/passport" className="temple-btn" style={{ padding: "10px 28px", background: "var(--sandstone)", color: "var(--temple)", borderTopColor: "var(--gilt)", borderLeftColor: "var(--gilt)", flexShrink: 0, display: "inline-block" }}>
          Start Collecting
        </Link>
      </div>
    </div>
  );
}
