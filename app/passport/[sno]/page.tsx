import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocation, locations, CATEGORY_COLORS } from "@/lib/data";
import CategoryBadge from "@/components/CategoryBadge";
import VisitButton from "@/components/VisitButton";
import StampCircleServer from "@/components/StampCircleServer";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

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
  const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const mapsUrl = `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;

  const labelStyle = {
    fontFamily: "var(--font-display)" as const,
    fontSize: "0.58rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "var(--copper)",
    marginBottom: 3,
  };
  const valueStyle = {
    fontFamily: "var(--font-body)" as const,
    fontSize: "0.85rem",
    color: "var(--temple)",
    fontWeight: 600,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--copper)" }}>
        <Link href="/passport" style={{ color: "var(--copper)", display: "flex", alignItems: "center", gap: 4 }}>
          <ArrowLeft size={11} /> Passport
        </Link>
        <span>›</span>
        <span>{loc.district}</span>
        <span>›</span>
        <span style={{ color: "var(--temple)" }}>{loc.place}</span>
      </div>

      {/* ── Passport leaf ──────────────────────────────────────────── */}
      <div className="passport-leaf" style={{ marginBottom: 24 }}>
        <div className="hoysala-rule-thin" />
        <div style={{ padding: "28px 32px" }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, paddingBottom: 16, borderBottom: "1px solid rgba(196,163,90,0.25)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", padding: "2px 10px", background: "var(--temple)", color: "var(--sandstone)", letterSpacing: "0.1em" }}>
                PPC #{String(loc.sno).padStart(3, "0")}
              </span>
              <CategoryBadge category={loc.category} />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--copper)", textAlign: "right" }}>
              Karnataka Circle<br />
              <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "var(--laterite)" }}>{loc.pincode}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Left: info */}
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--temple)", fontSize: "1.7rem", lineHeight: 1.2, marginBottom: 16 }}>
                {loc.place}
              </h1>

              {/* Classification table */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ background: "var(--temple)", padding: "4px 12px", marginBottom: 0 }}>
                  <span style={{ ...labelStyle, color: "var(--sandstone)", marginBottom: 0, display: "inline" }}>Classification</span>
                </div>
                <div style={{ background: "var(--ivory)", border: "1px solid rgba(196,163,90,0.3)", borderTop: "none", padding: "12px 14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                    <div>
                      <div style={labelStyle}>District</div>
                      <div style={valueStyle}>{loc.district}</div>
                    </div>
                    <div>
                      <div style={labelStyle}>Pincode</div>
                      <div style={{ ...valueStyle, fontFamily: "monospace" }}>{loc.pincode}</div>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={labelStyle}>Post Office</div>
                      <div style={{ ...valueStyle, fontWeight: 400, fontSize: "0.8rem" }}>{loc.post_office}</div>
                    </div>
                    {loc.office_type && (
                      <div>
                        <div style={labelStyle}>Type</div>
                        <div style={valueStyle}>{loc.office_type}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {loc.address && (
                <div style={{ fontSize: "0.75rem", color: "var(--temple)", fontFamily: "var(--font-body)", padding: "8px 10px", background: "var(--manuscript)", border: "1px solid rgba(196,163,90,0.3)", marginBottom: 14 }}>
                  {loc.address}
                </div>
              )}

              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 18, textDecoration: "none" }}>
                <ExternalLink size={10} />
                View on Maps ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
              </a>

              <VisitButton sno={loc.sno} place={loc.place} />
            </div>

            {/* Right: stamp */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <div style={{ width: "100%", padding: "20px 16px", background: "var(--ivory)", border: "2px dashed rgba(196,163,90,0.4)", textAlign: "center" }}>
                <div style={{ ...labelStyle, marginBottom: 14, textAlign: "center" }}>
                  Pictorial Cancellation
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <StampCircleServer size={130} color={color} />
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--laterite)", marginTop: 12 }}>
                  Visit this post office to collect your stamp
                </div>
              </div>

              {/* Category info card */}
              <div style={{ width: "100%", padding: "12px 14px", background: "var(--manuscript)", border: "1px solid rgba(196,163,90,0.3)", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: "1px solid rgba(26,14,6,0.2)", display: "inline-block" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--temple)" }}>{loc.category}</span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--laterite)", lineHeight: 1.5 }}>
                  Classified as a <strong style={{ color: "var(--temple)" }}>{loc.category}</strong> site in the Karnataka Philately Passport V3.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="hoysala-rule-thin" />
      </div>

      {/* Prev / Next */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        {prev ? (
          <Link href={`/passport/${prev.sno}`} className="temple-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px" }}>
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">{prev.place}</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : <div />}
        <Link href="/passport" style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--copper)" }}>All 100</Link>
        {next ? (
          <Link href={`/passport/${next.sno}`} className="temple-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px" }}>
            <span className="hidden sm:inline">{next.place}</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight size={13} />
          </Link>
        ) : <div />}
      </div>

      {/* Same district */}
      {sameDistrict.length > 0 && (
        <div>
          <div style={{ ...labelStyle, marginBottom: 10 }}>More from {loc.district}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
            {sameDistrict.map((l) => (
              <Link key={l.sno} href={`/passport/${l.sno}`}
                style={{ padding: "8px 10px", background: "var(--manuscript)", border: "1px solid rgba(196,163,90,0.3)", borderRightColor: "#1A0E0618", borderBottomColor: "#1A0E0618", display: "block", transition: "opacity 0.15s" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.78rem", marginBottom: 2 }}>{l.place}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "var(--copper)", letterSpacing: "0.06em" }}>{l.category}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
