import Link from "next/link";
import { locations, ALL_DISTRICTS, CATEGORY_ICONS } from "@/lib/data";
import StampGrid from "@/components/StampGrid";
import CategoryBadge from "@/components/CategoryBadge";

const CATEGORIES = [...new Set(locations.map((l) => l.category))].sort();

const DISTRICT_COUNTS = ALL_DISTRICTS.map((d) => ({
  district: d,
  count: locations.filter((l) => l.district === d).length,
})).sort((a, b) => b.count - a.count);

export default function HomePage() {
  return (
    <div style={{ background: "var(--ivory)" }}>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: Passport Cover
          Exactly what the physical booklet looks like — dark navy,
          gold foil typography, Karnataka silhouette, India Post red
      ═══════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(160deg, var(--spine) 0%, var(--spine-light) 60%, #1A2E4A 100%)",
        padding: "64px 0 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle diagonal grid — mimics the cover texture of the physical passport */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 22px, rgba(196,163,90,0.03) 22px, rgba(196,163,90,0.03) 23px), repeating-linear-gradient(-45deg, transparent, transparent 22px, rgba(196,163,90,0.03) 22px, rgba(196,163,90,0.03) 23px)",
        }} />

        {/* India Post red corner accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 0, height: 0,
          borderStyle: "solid",
          borderWidth: "0 80px 80px 0",
          borderColor: `transparent var(--post-red) transparent transparent`,
          opacity: 0.7,
        }} />

        <div className="max-w-3xl mx-auto px-6" style={{ position: "relative", zIndex: 1 }}>
          {/* Karnataka outline silhouette — just the word, evoked typographically */}
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(196,163,90,0.5)",
            marginBottom: 24,
          }}>
            India Post &nbsp;·&nbsp; Karnataka Circle
          </div>

          {/* Hindi / Devanagari title — matches the physical passport exactly */}
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            color: "rgba(196,163,90,0.85)",
            letterSpacing: "0.05em",
            marginBottom: 4,
            lineHeight: 1.3,
          }}>
            फिलाटेली पासपोर्ट
          </div>

          {/* Kannada title */}
          <div style={{
            fontFamily: "var(--font-kannada)",
            fontSize: "2.6rem",
            color: "#EAD9B8",
            lineHeight: 1.2,
            marginBottom: 8,
            letterSpacing: "0.01em",
          }}>
            ಕರ್ನಾಟಕ ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
          </div>

          {/* English subtitle — like the actual cover */}
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            color: "var(--sandstone)",
            letterSpacing: "0.08em",
            marginBottom: 4,
          }}>
            Philately Passport
          </div>

          <div style={{
            display: "inline-block",
            fontFamily: "var(--font-display)",
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(196,163,90,0.6)",
            borderTop: "1px solid rgba(196,163,90,0.3)",
            borderBottom: "1px solid rgba(196,163,90,0.3)",
            padding: "3px 0",
            marginBottom: 10,
          }}>
            Version 3.0
          </div>

          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(196,163,90,0.5)",
            marginBottom: 36,
          }}>
            ಕರ್ನಾಟಕದ ಶಾಶ್ವತ ಚಿತ್ರ ರದ್ದತಿ
            <br />
            Permanent Pictorial Cancellations of Karnataka
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/passport" className="cover-btn-filled">
              Open Passport
            </Link>
            <Link href="/map" className="cover-btn">
              Explore Map
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: Open Book Spread
          Left page: your stamp collection grid (the signature element)
          Right page: what this book is + how to use it
      ═══════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="book-spread grid-2col-book">
          {/* Left page — the stamp collection grid */}
          <div className="book-page book-page-left">
            {/* Page number top */}
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: "rgba(74,40,16,0.35)",
              marginBottom: 20,
              textTransform: "uppercase",
            }}>
              Your Collection
            </div>

            <StampGrid />

            {/* Handwritten note area — mimics the Notes field in the physical passport */}
            <div style={{
              marginTop: 22,
              borderTop: "1px dashed rgba(74,40,16,0.2)",
              paddingTop: 14,
            }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.52rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(74,40,16,0.4)",
                marginBottom: 8,
              }}>
                Notes :
              </div>
              <div style={{
                fontFamily: "var(--font-kalam, cursive)",
                fontSize: "0.9rem",
                color: "rgba(74,40,16,0.3)",
                fontStyle: "italic",
                lineHeight: 1.8,
              }}>
                Start your journey — visit a post office<br />
                and collect your first stamp...
              </div>
            </div>
          </div>

          {/* Spine crease */}
          <div className="book-spine-crease" />

          {/* Right page — introduction */}
          <div className="book-page book-page-right">
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: "rgba(74,40,16,0.35)",
              marginBottom: 20,
              textTransform: "uppercase",
            }}>
              About this Passport
            </div>

            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--temple)",
              lineHeight: 1.2,
              marginBottom: 14,
            }}>
              A journey through Karnataka's heritage
            </h2>

            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              color: "var(--ink-mid)",
              lineHeight: 1.75,
              marginBottom: 18,
            }}>
              The Karnataka Philately Passport V3 contains 100 Permanent Pictorial
              Cancellation sites across 25 districts. Visit each post office, get your
              stamp, and build a record of Karnataka's living heritage — monuments,
              wildlife, rivers, personalities, and more.
            </p>

            {/* Stats as inline annotations */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "10px 24px",
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: "1px solid rgba(74,40,16,0.12)",
            }}>
              {[
                { n: "100", label: "Stamp locations" },
                { n: "25",  label: "Districts" },
                { n: String(CATEGORIES.length), label: "Categories" },
                { n: "V3",  label: "Current edition" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--temple)", lineHeight: 1 }}>{n}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--copper)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* How to use */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--copper)",
                marginBottom: 10,
              }}>
                How to use this passport
              </div>
              {[
                ["Find", "Browse the map or passport list to locate a post office near you."],
                ["Visit",  "Travel to the post office and request the Permanent Pictorial Cancellation."],
                ["Record", "Mark it collected here — add the date and your notes."],
              ].map(([step, desc]) => (
                <div key={step} style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--sandstone)",
                    background: "var(--temple)",
                    padding: "1px 6px",
                    flexShrink: 0,
                    marginTop: 2,
                  }}>{step}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--ink-mid)", lineHeight: 1.5 }}>{desc}</span>
                </div>
              ))}
            </div>

            {/* Category legend — compact */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              paddingTop: 14,
              borderTop: "1px dashed rgba(74,40,16,0.2)",
            }}>
              {CATEGORIES.map(cat => (
                <span key={cat} style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.58rem",
                  color: "var(--laterite)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}>
                  <span>{CATEGORY_ICONS[cat] ?? "•"}</span>
                  <span>{cat}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: Table of Contents — districts as ToC entries
          Exactly like the index page of a printed passport booklet
      ═══════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div style={{
          background: "var(--page)",
          padding: "32px 36px",
          borderTop: "3px solid var(--temple)",
          borderLeft: "1px solid rgba(196,163,90,0.3)",
          borderRight: "1px solid rgba(26,14,6,0.15)",
          borderBottom: "1px solid rgba(26,14,6,0.15)",
          boxShadow: "3px 4px 16px rgba(26,14,6,0.12)",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        }}>
          {/* Section label */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 20,
            paddingBottom: 10,
            borderBottom: "2px solid var(--temple)",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--copper)",
                marginBottom: 2,
              }}>
                Contents
              </div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "var(--temple)",
              }}>
                Districts of Karnataka
              </div>
            </div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              color: "var(--copper)",
              textTransform: "uppercase",
            }}>
              25 Districts · 100 Locations
            </div>
          </div>

          {/* ToC entries in two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0 40px" }}>
            {DISTRICT_COUNTS.map(({ district, count }, i) => (
              <Link
                key={district}
                href={`/passport?district=${encodeURIComponent(district)}`}
                style={{ textDecoration: "none" }}
              >
                <div className="toc-row" style={{
                  paddingRight: i % 2 === 0 ? 8 : 0,
                  paddingLeft: i % 2 === 1 ? 8 : 0,
                }}>
                  {/* District number — like a ToC page number */}
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.58rem",
                    color: "rgba(74,40,16,0.35)",
                    minWidth: 24,
                    flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* District name */}
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "var(--ink)",
                    flexShrink: 0,
                  }}>
                    {district}
                  </span>

                  {/* Leader dots */}
                  <span className="toc-leader" />

                  {/* Count */}
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "var(--copper)",
                    flexShrink: 0,
                  }}>
                    {count}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer of the ToC page */}
          <div style={{
            marginTop: 20,
            paddingTop: 12,
            borderTop: "1px solid rgba(196,163,90,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-kalam, cursive)",
              fontSize: "0.82rem",
              color: "rgba(74,40,16,0.4)",
              fontStyle: "italic",
            }}>
              ಪ್ರತಿ ಅಂಚೆ ಕಚೇರಿ ಒಂದು ಕಥೆ ಹೇಳುತ್ತದೆ...
            </span>
            <Link href="/passport" style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--copper)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              Browse all 100 locations →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
