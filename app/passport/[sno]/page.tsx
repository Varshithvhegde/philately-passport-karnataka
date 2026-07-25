import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocation, locations, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/data";
import StampPanel from "@/components/StampPanel";
import { ArrowLeft, ArrowRight, MapPin, Navigation, ExternalLink } from "lucide-react";

interface Props { params: Promise<{ sno: string }> }

export async function generateStaticParams() {
  return locations.map((l) => ({ sno: l.sno.toString() }));
}

export async function generateMetadata({ params }: Props) {
  const { sno } = await params;
  const loc = getLocation(Number(sno));
  if (!loc) return { title: "Not found" };
  return {
    title: `${loc.place} · PPC #${String(loc.sno).padStart(3,"0")} — Karnataka Philately Passport`,
    description: `${loc.category} · ${loc.district} · ${loc.post_office}`,
  };
}

// ── Inline SVGs (no lucide dep for server component) ──────────────
function PostalHorn({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke={color} strokeWidth="1.2" fill="none"/>
      <circle cx="17.5" cy="10" r="1.5" fill={color} fillOpacity="0.7"/>
    </svg>
  );
}

export default async function PassportEntryPage({ params }: Props) {
  const { sno } = await params;
  const snoNum = Number(sno);
  const loc = getLocation(snoNum);
  if (!loc) notFound();

  const prev         = locations.find((l) => l.sno === snoNum - 1);
  const next         = locations.find((l) => l.sno === snoNum + 1);
  const sameDistrict = locations.filter((l) => l.district === loc.district && l.sno !== snoNum);
  const sameCategory = locations.filter((l) => l.category === loc.category && l.sno !== snoNum).slice(0, 8);
  const districtSnos = locations.filter((l) => l.district === loc.district).map((l) => l.sno);

  const color    = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const icon     = CATEGORY_ICONS[loc.category] ?? "📍";
  const mapsUrl  = `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
  const mapsDir  = `https://maps.google.com/maps/dir//${loc.latitude},${loc.longitude}`;

  // ── Office type full names ──────────────────────────────────────
  const officeTypeLabel: Record<string, string> = {
    GPO: "General Post Office",
    HPO: "Head Post Office",
    SPO: "Sub Post Office",
    BPO: "Branch Post Office",
  };
  const officeLabel = loc.office_type
    ? (officeTypeLabel[loc.office_type] ?? loc.office_type)
    : "Post Office";

  return (
    <div style={{ background: "var(--ivory)", minHeight: "100vh" }}>

      {/* ══ Page header — navy matching navbar ═════════════════════ */}
      <div style={{
        background: "var(--spine)",
        borderBottom: "3px solid var(--temple)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#C4391A,#E05020 50%,#C4391A)" }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 22px,rgba(196,163,90,0.025) 22px,rgba(196,163,90,0.025) 23px)",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 24px", position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12,
            fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(196,163,90,0.55)" }}>
            <Link href="/passport" style={{ color: "rgba(196,163,90,0.55)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
              <ArrowLeft size={10} /> Passport
            </Link>
            <span>›</span>
            <Link href={`/passport?district=${encodeURIComponent(loc.district)}`} style={{ color: "rgba(196,163,90,0.55)", textDecoration: "none" }}>{loc.district}</Link>
            <span>›</span>
            <span style={{ color: "var(--sandstone)" }}>{loc.place}</span>
          </div>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              {/* PAR AVION label */}
              <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "linear-gradient(90deg,var(--spine),var(--spine-light),var(--spine))",
                  color: "var(--sandstone)", fontFamily: "var(--font-display)",
                  fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase",
                  padding: "2px 10px", border: "1px solid rgba(196,163,90,0.3)",
                }}>
                  <PostalHorn size={10} color="#C4A35A" />
                  Permanent Pictorial Cancellation
                </span>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "0.6rem",
                  padding: "2px 10px", background: "rgba(196,57,26,0.25)",
                  color: "#F5B8A8", border: "1px solid rgba(196,57,26,0.4)",
                  letterSpacing: "0.1em",
                }}>
                  PPC #{String(loc.sno).padStart(3, "0")}
                </span>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#E8D9B8", fontSize: "2rem", lineHeight: 1.1, margin: 0 }}>
                {loc.place}
              </h1>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "rgba(196,163,90,0.6)", marginTop: 4 }}>
                {icon} {loc.category} · {loc.district} District · PIN {loc.pincode}
              </div>
            </div>

            {/* Right: category colour swatch */}
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,163,90,0.45)", marginBottom: 4 }}>
                  Karnataka Circle
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block", border: "1px solid rgba(255,255,255,0.2)" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", color: "rgba(196,163,90,0.7)", letterSpacing: "0.06em" }}>{loc.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Main content ════════════════════════════════════════════ */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 16px 48px" }}>

        {/* ── Main card: styled as an inland letter card ─────────── */}
        <div style={{
          background: "var(--page)",
          /* Airmail diagonal border */
          border: "3px solid transparent",
          backgroundImage: `
            linear-gradient(var(--page), var(--page)),
            repeating-linear-gradient(
              -45deg,
              #C4391A 0px, #C4391A 5px,
              transparent 5px, transparent 8px,
              #0D1F3A 8px, #0D1F3A 13px,
              transparent 13px, transparent 16px
            )`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: "0 4px 32px rgba(26,14,6,0.15)",
          marginBottom: 20,
          position: "relative",
          /* Paper grain */
          backgroundRepeat: "no-repeat, repeat",
        }}>

          {/* ── Letter header: postal form style ────────────────── */}
          <div style={{
            background: "var(--spine)",
            padding: "10px 22px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PostalHorn size={14} color="rgba(196,163,90,0.8)" />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,163,90,0.7)" }}>
                India Post · Karnataka Circle
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", color: "rgba(196,163,90,0.5)", letterSpacing: "0.08em" }}>
                PERMANENT PICTORIAL CANCELLATION
              </span>
              <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "var(--sandstone)", padding: "1px 6px", border: "1px solid rgba(196,163,90,0.3)" }}>
                {loc.pincode}
              </span>
            </div>
          </div>

          {/* ── Letter body ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "min(calc(100% - 200px), 1fr) 200px", gap: 0 }} className="grid-2col-sm1">

            {/* LEFT: address block + info */}
            <div style={{ padding: "22px 24px", borderRight: "1px solid rgba(196,163,90,0.2)" }}>

              {/* Postal address block — like a TO: address on a letter */}
              <div style={{
                padding: "14px 16px 16px",
                marginBottom: 18,
                background: "rgba(240,228,192,0.5)",
                border: "1px solid rgba(196,163,90,0.3)",
                borderLeft: "4px solid var(--temple)",
                position: "relative",
              }}>
                {/* "TO" label like a postal form */}
                <div style={{
                  position: "absolute", top: -9, left: 12,
                  fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "var(--copper)",
                  background: "var(--page)", padding: "0 6px",
                }}>
                  Post Office Details
                </div>

                {/* Office type badge */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "var(--spine)",
                    background: "var(--sandstone)",
                    padding: "1px 8px", marginRight: 6,
                  }}>
                    {loc.office_type ?? "PO"}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--laterite)" }}>
                    {officeLabel}
                  </span>
                </div>

                {/* Post office name — large, prominent */}
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--temple)", lineHeight: 1.2, marginBottom: 4 }}>
                  {loc.post_office.replace(/\s+\d{6}$/, "")}
                </div>

                {/* Address lines formatted like an Indian postal address */}
                {loc.address && (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--ink-mid)", lineHeight: 1.7 }}>
                    {loc.address.split(",").map((part, i) => (
                      <div key={i}>{part.trim()}</div>
                    ))}
                  </div>
                )}

                {/* PIN code — large, like printed on an envelope */}
                <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)" }}>PIN</span>
                  <span style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 700, color: "var(--temple)", letterSpacing: "0.14em" }}>{loc.pincode}</span>
                </div>
              </div>

              {/* Coordinates + map links — formatted like a GPS/navigation form */}
              <div style={{ marginBottom: 18, padding: "10px 14px", background: "rgba(13,31,58,0.05)", border: "1px solid rgba(13,31,58,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <MapPin size={11} style={{ color: "var(--copper)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "var(--ink-mid)", letterSpacing: "0.04em" }}>
                    {loc.latitude.toFixed(5)}°N, {loc.longitude.toFixed(5)}°E
                  </span>
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--spine)", textDecoration: "none", borderBottom: "1px solid rgba(13,31,58,0.3)" }}>
                    <ExternalLink size={9} /> View on Map
                  </a>
                  <a href={mapsDir} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--spine)", textDecoration: "none", borderBottom: "1px solid rgba(13,31,58,0.3)" }}>
                    <Navigation size={9} /> Get Directions
                  </a>
                </div>
              </div>

              {/* Classification — styled as a postal form field */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 8, borderBottom: "1px solid rgba(196,163,90,0.2)", paddingBottom: 4 }}>
                  Classification
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px 20px" }}>
                  {[
                    { label: "District", val: loc.district },
                    { label: "Category", val: loc.category },
                    { label: "Office Type", val: loc.office_type ?? "—" },
                  ].map(({ label, val: v }) => (
                    <div key={label}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, color: "var(--temple)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{
                padding: "11px 14px",
                background: `${color}0D`,
                border: `1px solid ${color}40`,
                borderLeft: `3px solid ${color}`,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "1rem", flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--ink-mid)", fontSize: "0.8rem", lineHeight: 1.65, margin: 0 }}>
                  {loc.description
                    ? loc.description
                    : <>This is a <strong style={{ color: "var(--temple)" }}>{loc.category}</strong> site in the Karnataka Philately Passport V3. Visit <strong style={{ color: "var(--temple)" }}>{loc.post_office.replace(/\s+\d{6}$/, "")}</strong> to collect your Permanent Pictorial Cancellation stamp.</>
                  }
                </p>
              </div>
            </div>

            {/* RIGHT: Franking zone — where the stamp goes */}
            <div className="entry-franking-zone" style={{
              padding: "22px 16px 22px",
              background: "rgba(240,228,192,0.3)",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              {/* "FRANKING ZONE" label — like on a postal form */}
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.24em",
                textTransform: "uppercase", color: "var(--copper)",
                borderTop: "1px solid rgba(196,163,90,0.4)",
                borderBottom: "1px solid rgba(196,163,90,0.4)",
                padding: "3px 0", width: "100%", textAlign: "center", marginBottom: 16,
              }}>
                Pictorial Cancellation
              </div>

              <StampPanel
                sno={loc.sno}
                place={loc.place}
                district={loc.district}
                category={loc.category}
              />
            </div>
          </div>

          {/* ── Letter footer: district mini-stamps ─────────────── */}
          <div style={{
            borderTop: "1px solid rgba(196,163,90,0.2)",
            padding: "10px 22px",
            background: "rgba(240,228,192,0.2)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)" }}>
                {loc.district} · {districtSnos.length} locations
              </span>
              {/* Mini stamp tiles for district */}
              <div style={{ display: "flex", gap: 3 }}>
                {districtSnos.map(s => (
                  <Link key={s} href={`/passport/${s}`}
                    title={locations.find(l=>l.sno===s)?.place ?? ""}
                    style={{
                      width: 20, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontSize: "0.45rem", textDecoration: "none",
                      background: s === snoNum ? "var(--temple)" : "transparent",
                      color: s === snoNum ? "var(--sandstone)" : "rgba(122,59,15,0.4)",
                      border: s === snoNum ? "1px solid var(--copper)" : "1px dashed rgba(196,163,90,0.3)",
                      fontWeight: s === snoNum ? 700 : 400,
                    }}>
                    {s}
                  </Link>
                ))}
              </div>
            </div>
            <Link href={`/passport?district=${encodeURIComponent(loc.district)}`}
              style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
        </div>

        {/* ══ Prev / Next — styled as postal dispatch slips ══════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, marginBottom: 24, alignItems: "stretch" }}>
          {prev ? (
            <Link href={`/passport/${prev.sno}`} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "10px 14px", height: "100%",
                background: "var(--page)",
                border: "1px solid rgba(196,163,90,0.3)",
                borderLeft: "4px solid var(--temple)",
                borderRight: "1px solid rgba(26,14,6,0.12)",
                borderBottom: "1px solid rgba(26,14,6,0.12)",
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              }}>
                <ArrowLeft size={14} style={{ color: "var(--copper)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Previous</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.82rem" }}>{prev.place}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "var(--laterite)" }}>
                    PPC #{String(prev.sno).padStart(3,"0")} · {prev.district}
                  </div>
                </div>
              </div>
            </Link>
          ) : <div />}

          <Link href="/passport" style={{
            textDecoration: "none", display: "flex", alignItems: "center",
            padding: "8px 14px",
            background: "var(--spine)",
            border: "1px solid rgba(196,163,90,0.2)",
            fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.16em",
            textTransform: "uppercase", color: "rgba(196,163,90,0.6)", whiteSpace: "nowrap",
          }}>
            All 100
          </Link>

          {next ? (
            <Link href={`/passport/${next.sno}`} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "10px 14px", height: "100%",
                background: "var(--page)",
                border: "1px solid rgba(196,163,90,0.3)",
                borderRight: "4px solid var(--temple)",
                borderLeft: "1px solid rgba(196,163,90,0.3)",
                borderBottom: "1px solid rgba(26,14,6,0.12)",
                display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, cursor: "pointer",
              }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Next</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.82rem" }}>{next.place}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "var(--laterite)" }}>
                    PPC #{String(next.sno).padStart(3,"0")} · {next.district}
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: "var(--copper)", flexShrink: 0 }} />
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* ══ Related: same category ══════════════════════════════════ */}
        {sameCategory.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Red + blue stripe — postal section divider */}
                <div style={{ width: 4, height: 16, background: "var(--post-red)" }} />
                <div style={{ width: 4, height: 16, background: "var(--spine)" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--temple)" }}>
                  {icon} More {loc.category} Sites
                </span>
              </div>
              <Link href={`/passport?category=${encodeURIComponent(loc.category)}`}
                style={{ fontFamily: "var(--font-display)", fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8 }}>
              {sameCategory.map((l) => (
                <Link key={l.sno} href={`/passport/${l.sno}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "10px 12px",
                    background: "var(--page)",
                    border: "1px solid rgba(196,163,90,0.28)",
                    borderLeft: "3px solid var(--temple)",
                    borderRight: "1px solid rgba(26,14,6,0.1)",
                    borderBottom: "1px solid rgba(26,14,6,0.1)",
                    cursor: "pointer", transition: "transform 0.12s",
                  }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", color: "var(--copper)", letterSpacing: "0.1em", marginBottom: 3 }}>
                      #{String(l.sno).padStart(3,"0")}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.8rem", lineHeight: 1.25, marginBottom: 2 }}>
                      {l.place}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "var(--laterite)" }}>
                      {l.district}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ══ Related: same district ══════════════════════════════════ */}
        {sameDistrict.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 16, background: "var(--post-red)" }} />
                <div style={{ width: 4, height: 16, background: "var(--spine)" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--temple)" }}>
                  More from {loc.district}
                </span>
              </div>
              <Link href={`/passport?district=${encodeURIComponent(loc.district)}`}
                style={{ fontFamily: "var(--font-display)", fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--copper)", textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8 }}>
              {sameDistrict.map((l) => (
                <Link key={l.sno} href={`/passport/${l.sno}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "10px 12px",
                    background: "var(--page)",
                    border: "1px solid rgba(196,163,90,0.28)",
                    borderLeft: "3px solid rgba(196,163,90,0.5)",
                    borderRight: "1px solid rgba(26,14,6,0.1)",
                    borderBottom: "1px solid rgba(26,14,6,0.1)",
                    cursor: "pointer",
                  }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", color: "var(--copper)", letterSpacing: "0.1em", marginBottom: 3 }}>
                      #{String(l.sno).padStart(3,"0")}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.8rem", lineHeight: 1.25, marginBottom: 2 }}>
                      {l.place}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", color: "var(--laterite)" }}>
                      {l.category}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
