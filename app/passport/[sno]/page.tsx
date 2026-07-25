import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocation, locations, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/data";
import CategoryBadge from "@/components/CategoryBadge";
import StampPanel from "@/components/StampPanel";
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, Share2, Navigation } from "lucide-react";

interface Props {
  params: Promise<{ sno: string }>;
}

export async function generateStaticParams() {
  return locations.map((l) => ({ sno: l.sno.toString() }));
}

export async function generateMetadata({ params }: Props) {
  const { sno } = await params;
  const loc = getLocation(Number(sno));
  if (!loc) return { title: "Not found" };
  return {
    title: `${loc.place} — Karnataka Philately Passport`,
    description: `${loc.category} · ${loc.district} · ${loc.post_office}`,
  };
}

export default async function PassportEntryPage({ params }: Props) {
  const { sno } = await params;
  const snoNum = Number(sno);
  const loc = getLocation(snoNum);
  if (!loc) notFound();

  const prev = locations.find((l) => l.sno === snoNum - 1);
  const next = locations.find((l) => l.sno === snoNum + 1);
  const sameDistrict = locations.filter((l) => l.district === loc.district && l.sno !== snoNum);
  const sameCategory = locations.filter((l) => l.category === loc.category && l.sno !== snoNum).slice(0, 6);

  const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const icon  = CATEGORY_ICONS[loc.category] ?? "📍";
  const mapsUrl  = `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
  const mapsDir  = `https://maps.google.com/maps/dir//${loc.latitude},${loc.longitude}`;

  const lbl: React.CSSProperties = {
    fontFamily: "var(--font-display)", fontSize: "0.56rem",
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: "var(--copper)", marginBottom: 4, display: "block",
  };
  const val: React.CSSProperties = {
    fontFamily: "var(--font-body)", fontSize: "0.88rem",
    color: "var(--temple)", fontWeight: 600,
  };

  // District progress: how many locations in same district
  const districtTotal = locations.filter(l => l.district === loc.district).length;
  const districtSno   = locations.filter(l => l.district === loc.district).map(l => l.sno);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16,
        fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--copper)" }}>
        <Link href="/passport" style={{ color: "var(--copper)", display: "flex", alignItems: "center", gap: 3 }}>
          <ArrowLeft size={10} /> Passport
        </Link>
        <span>›</span>
        <Link href={`/passport?district=${encodeURIComponent(loc.district)}`} style={{ color: "var(--copper)" }}>{loc.district}</Link>
        <span>›</span>
        <span style={{ color: "var(--temple)" }}>{loc.place}</span>
      </div>

      {/* ── Main passport leaf ────────────────────────────────────── */}
      <div className="passport-leaf" style={{ marginBottom: 20 }}>
        <div className="hoysala-rule-thin" />

        {/* Top strip: PPC number + category + share */}
        <div style={{ padding: "14px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", padding: "3px 12px",
              background: "var(--temple)", color: "var(--sandstone)", letterSpacing: "0.12em" }}>
              PPC #{String(loc.sno).padStart(3, "0")}
            </span>
            <CategoryBadge category={loc.category} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--copper)", textAlign: "right" }}>
            Karnataka Circle<br />
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--laterite)" }}>{loc.pincode}</span>
          </div>
        </div>

        <div style={{ padding: "18px 28px 24px" }}>
          {/* ── 3-column layout ───────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 28 }}>

            {/* LEFT: all info */}
            <div>
              {/* Place name */}
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--temple)",
                fontSize: "2rem", lineHeight: 1.15, marginBottom: 6 }}>
                {loc.place}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: "1.4rem" }}>{icon}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--copper)" }}>
                  {loc.category} · {loc.district} District
                </span>
              </div>

              {/* Classification card */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ background: "var(--temple)", padding: "5px 14px" }}>
                  <span style={{ ...lbl, color: "var(--sandstone)", marginBottom: 0 }}>Classification</span>
                </div>
                <div style={{ background: "var(--ivory)", border: "1px solid rgba(196,163,90,0.3)", borderTop: "none", padding: "14px 16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 24px" }}>
                    <div><span style={lbl}>District</span><span style={val}>{loc.district}</span></div>
                    <div><span style={lbl}>Pincode</span><span style={{ ...val, fontFamily: "monospace" }}>{loc.pincode}</span></div>
                    {loc.office_type && <div><span style={lbl}>Office Type</span><span style={val}>{loc.office_type}</span></div>}
                    <div style={{ gridColumn: "1/-1" }}>
                      <span style={lbl}>Post Office</span>
                      <span style={{ ...val, fontWeight: 400, fontSize: "0.82rem" }}>{loc.post_office}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {loc.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6,
                  padding: "9px 12px", background: "var(--manuscript)",
                  border: "1px solid rgba(196,163,90,0.3)", marginBottom: 14,
                  fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--temple)" }}>
                  <MapPin size={12} style={{ color: "var(--copper)", flexShrink: 0, marginTop: 1 }} />
                  {loc.address}
                </div>
              )}

              {/* Map + directions links */}
              <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5,
                    fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
                  <ExternalLink size={10} />
                  View on Maps
                </a>
                <a href={mapsDir} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5,
                    fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
                  <Navigation size={10} />
                  Get Directions
                </a>
                <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "var(--laterite)" }}>
                  {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                </span>
              </div>

              {/* Category info strip */}
              <div style={{ padding: "10px 14px", background: "var(--manuscript)",
                border: "1px solid rgba(196,163,90,0.3)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: color,
                  border: "1px solid rgba(26,14,6,0.2)", flexShrink: 0, marginTop: 2, display: "inline-block" }} />
                <p style={{ fontFamily: "var(--font-body)", color: "var(--laterite)", fontSize: "0.78rem", lineHeight: 1.55, margin: 0 }}>
                  This is a <strong style={{ color: "var(--temple)" }}>{loc.category}</strong> site in the Karnataka Philately Passport V3.
                  Collect the permanent pictorial cancellation stamp at <strong style={{ color: "var(--temple)" }}>{loc.post_office}</strong>.
                </p>
              </div>
            </div>

            {/* RIGHT: stamp panel */}
            <div>
              <StampPanel
                sno={loc.sno}
                place={loc.place}
                district={loc.district}
                category={loc.category}
              />
            </div>
          </div>
        </div>
        <div className="hoysala-rule-thin" />
      </div>

      {/* ── District progress strip ───────────────────────────────── */}
      <div className="manuscript-card" style={{ padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)" }}>
            {loc.district} District · {districtTotal} Locations
          </div>
          <Link href={`/passport?district=${encodeURIComponent(loc.district)}`}
            style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
            View All →
          </Link>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {districtSno.map(s => (
            <Link key={s} href={`/passport/${s}`}
              style={{
                width: 22, height: 22,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: "0.55rem",
                background: s === snoNum ? "var(--temple)" : "var(--stone)",
                color: s === snoNum ? "var(--sandstone)" : "var(--laterite)",
                border: s === snoNum ? "1px solid var(--copper)" : "1px solid rgba(196,163,90,0.3)",
                textDecoration: "none",
                fontWeight: s === snoNum ? 700 : 400,
              }}>
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Prev / Next navigation ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {prev ? (
          <Link href={`/passport/${prev.sno}`} className="temple-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", justifyContent: "flex-start" }}>
            <ArrowLeft size={12} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.55rem", opacity: 0.7, letterSpacing: "0.1em" }}>PREVIOUS</div>
              <div style={{ fontSize: "0.75rem" }}>{prev.place}</div>
            </div>
          </Link>
        ) : <div />}
        <Link href="/passport"
          style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--copper)", textDecoration: "none", whiteSpace: "nowrap" }}>
          All 100
        </Link>
        {next ? (
          <Link href={`/passport/${next.sno}`} className="temple-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.55rem", opacity: 0.7, letterSpacing: "0.1em" }}>NEXT</div>
              <div style={{ fontSize: "0.75rem" }}>{next.place}</div>
            </div>
            <ArrowRight size={12} />
          </Link>
        ) : <div />}
      </div>

      {/* ── More in same category ─────────────────────────────────── */}
      {sameCategory.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)" }}>
              {icon} More {loc.category} Sites
            </div>
            <Link href={`/passport?category=${encodeURIComponent(loc.category)}`}
              style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
              View All →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {sameCategory.map((l) => (
              <Link key={l.sno} href={`/passport/${l.sno}`}
                style={{ padding: "9px 11px", background: "var(--manuscript)",
                  border: "1px solid rgba(196,163,90,0.3)", borderRightColor: "rgba(26,14,6,0.1)",
                  borderBottomColor: "rgba(26,14,6,0.1)", display: "block", textDecoration: "none",
                  transition: "opacity 0.15s" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.8rem", marginBottom: 2 }}>{l.place}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--copper)" }}>{l.district}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Same district ─────────────────────────────────────────── */}
      {sameDistrict.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)" }}>
              More from {loc.district}
            </div>
            <Link href={`/passport?district=${encodeURIComponent(loc.district)}`}
              style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
              View All →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {sameDistrict.map((l) => (
              <Link key={l.sno} href={`/passport/${l.sno}`}
                style={{ padding: "9px 11px", background: "var(--manuscript)",
                  border: "1px solid rgba(196,163,90,0.3)", borderRightColor: "rgba(26,14,6,0.1)",
                  borderBottomColor: "rgba(26,14,6,0.1)", display: "block", textDecoration: "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.8rem", marginBottom: 2 }}>{l.place}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--copper)" }}>{l.category}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
