"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { locations, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/data";
import { STAMP_ARTWORKS } from "@/components/StampArtwork";
import { getVisits, type Visit } from "@/lib/visits";
import { getPhotos, blobToUrl } from "@/lib/imageStore";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Home } from "lucide-react";

// ── Book structure ──────────────────────────────────────────────────
// Page 0–1: Front cover (spread 0)
// Page 2–3: Inside cover + intro (spread 1)
// Page 4–5: PPC #001 — left info, right stamp  (spread 2)
// Page 6–7: PPC #002 ...
// ...
// Page 202–203: PPC #100
// Page 204–205: Back matter / index (spread 102)
// Page 206: Back cover (spread 103)
//
// Total spreads visible: 104 (0..103)
// Spread index → location: spread - 2 gives sno index (1-based)

const TOTAL_LOCATIONS = 100;
const COVER_SPREADS   = 2;  // front cover + inside-cover/intro
const BACK_SPREADS    = 2;  // back-matter + back cover
const TOTAL_SPREADS   = COVER_SPREADS + TOTAL_LOCATIONS + BACK_SPREADS; // 104

type FlipDirection = "forward" | "backward" | null;

// ── Individual page content components ─────────────────────────────

function CoverPage() {
  return (
    <div className="book-cover-texture"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

      {/* Decorative corner ornaments */}
      {[["top:12px;left:12px", "0 0"], ["top:12px;right:12px", "0 0"], ["bottom:12px;left:12px", "0 0"], ["bottom:12px;right:12px", "0 0"]].map((_, i) => (
        <svg key={i} width="32" height="32" viewBox="0 0 32 32" fill="none"
          style={{ position: "absolute", ...([
            { top: 12, left: 12 },
            { top: 12, right: 12, transform: "scaleX(-1)" },
            { bottom: 12, left: 12, transform: "scaleY(-1)" },
            { bottom: 12, right: 12, transform: "scale(-1)" },
          ][i]) }}>
          <path d="M2 2 L2 14 M2 2 L14 2" stroke="#C4A35A" strokeWidth="1.5" opacity="0.6"/>
          <circle cx="2" cy="2" r="2" fill="#C4A35A" opacity="0.4"/>
        </svg>
      ))}

      {/* India Post horn emblem */}
      <svg width="52" height="40" viewBox="0 0 20 20" fill="none" style={{ marginBottom: 20, opacity: 0.6 }}>
        <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)"/>
        <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A" opacity="0.7"/>
        <path d="M3 10 L1 10" stroke="#C4A35A" strokeWidth="0.8"/>
      </svg>

      {/* Hindi title */}
      <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "rgba(196,163,90,0.7)", letterSpacing: "0.06em", marginBottom: 6 }}>
        फिलाटेली पासपोर्ट
      </div>

      {/* Kannada main title */}
      <div style={{ fontFamily: "var(--font-kannada)", fontSize: "1.6rem", color: "#E8D9B8", lineHeight: 1.2, marginBottom: 10, textAlign: "center" }}>
        ಕರ್ನಾಟಕ<br/>ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
      </div>

      {/* Hoysala rule */}
      <div className="hoysala-rule-thin" style={{ width: "60%", marginBottom: 12 }}/>

      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", letterSpacing: "0.1em", color: "var(--sandstone)", marginBottom: 6 }}>
        PHILATELY PASSPORT
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(196,163,90,0.45)", marginBottom: 20 }}>
        Permanent Pictorial Cancellations of Karnataka
      </div>

      {/* Version badge */}
      <div style={{ padding: "4px 16px", border: "1px solid rgba(196,163,90,0.4)", fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.16em", color: "rgba(196,163,90,0.6)", marginBottom: 24 }}>
        VERSION 3.0
      </div>

      {/* Karnataka silhouette hint — just ruled lines like the cover */}
      <div style={{ width: "55%", textAlign: "center" }}>
        <div className="hoysala-rule-thin" style={{ marginBottom: 8 }}/>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(196,163,90,0.35)" }}>
          India Post · Karnataka Circle
        </div>
        <div className="hoysala-rule-thin" style={{ marginTop: 8 }}/>
      </div>
    </div>
  );
}

function InsideCoverPage() {
  return (
    <div className="book-parchment" style={{ width: "100%", height: "100%", padding: "36px 30px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 20 }}>
        About this Passport
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.25, marginBottom: 16 }}>
        Karnataka Philately Passport<br/>Version 3.0
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--ink-mid)", lineHeight: 1.75, marginBottom: 16 }}>
        This passport contains 100 Permanent Pictorial Cancellation sites across 25 districts of Karnataka.
        Each page records one site — its classification, location, and stamp.
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--ink-mid)", lineHeight: 1.75, marginBottom: 24 }}>
        Visit each post office, collect the pictorial cancellation stamp, and record your journey through Karnataka's living heritage.
      </p>

      <div className="hoysala-rule-thin" style={{ marginBottom: 20 }}/>

      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 10 }}>
        How to use this book
      </div>
      {[
        ["Find", "Each spread shows one PPC location with its post office details."],
        ["Visit", "Travel to the post office and request the Permanent Pictorial Cancellation."],
        ["Record", "Mark it collected in the app to fill your stamp slot."],
      ].map(([step, desc]) => (
        <div key={step} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--spine)", background: "var(--sandstone)", padding: "1px 6px", flexShrink: 0, marginTop: 1 }}>{step}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--ink-mid)", lineHeight: 1.5 }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}

function IntroPage() {
  return (
    <div className="book-parchment" style={{ width: "100%", height: "100%", padding: "36px 30px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 16 }}>
        Contents at a Glance
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", alignContent: "start" }}>
        {locations.map((loc) => (
          <div key={loc.sno} style={{ display: "flex", alignItems: "baseline", gap: 4, padding: "2px 0", borderBottom: "1px dotted rgba(196,163,90,0.2)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", color: "var(--copper)", flexShrink: 0, minWidth: 22, letterSpacing: "0.06em" }}>
              {String(loc.sno).padStart(3,"0")}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: "var(--temple)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {loc.place}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BackMatterPage() {
  return (
    <div className="book-parchment" style={{ width: "100%", height: "100%", padding: "36px 30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-kannada)", fontSize: "1.4rem", color: "var(--temple)", marginBottom: 12 }}>
        ಪ್ರತಿ ಅಂಚೆ ಕಚೇರಿ ಒಂದು ಕಥೆ ಹೇಳುತ್ತದೆ
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--copper)", fontStyle: "italic", marginBottom: 24 }}>
        Every post office tells a story.
      </div>
      <div className="hoysala-rule-thin" style={{ width: "60%", marginBottom: 20 }}/>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", lineHeight: 2 }}>
        Karnataka Circle<br/>
        India Post<br/>
        100 Permanent Pictorial Cancellations<br/>
        Version 3.0
      </div>
    </div>
  );
}

function BackCoverPage() {
  return (
    <div className="book-cover-texture"
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div className="hoysala-rule-thin" style={{ position: "absolute", top: 24, left: 0, right: 0 }}/>
      <div className="hoysala-rule-thin" style={{ position: "absolute", bottom: 24, left: 0, right: 0 }}/>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(196,163,90,0.4)", marginBottom: 8 }}>
        Karnataka Circle · India Post
      </div>
      <svg width="32" height="32" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.3 }}>
        <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)"/>
        <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A"/>
      </svg>
    </div>
  );
}

// ── Left info page for a PPC location ──────────────────────────────
function LeftPage({ loc, visit, photoUrl }: {
  loc: ReturnType<typeof locations[0]["sno"] extends number ? typeof locations.find : never>;
  visit: Visit | null;
  photoUrl: string | null;
}) {
  if (!loc) return null;
  const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const icon  = CATEGORY_ICONS[loc.category] ?? "📍";

  return (
    <div className="book-parchment" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Page header */}
      <div style={{ background: "var(--temple)", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sandstone)" }}>
          Karnataka Philately Passport
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "rgba(196,163,90,0.6)", letterSpacing: "0.08em" }}>
          {String(loc.sno).padStart(3,"0")} / 100
        </span>
      </div>

      <div style={{ flex: 1, padding: "18px 20px 14px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Category eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: "0.9rem" }}>{icon}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)" }}>
            {loc.category}
          </span>
        </div>

        {/* Place name */}
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--temple)", fontSize: "1.3rem", lineHeight: 1.15, marginBottom: 4 }}>
          {loc.place}
        </h2>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--copper)", marginBottom: 14 }}>
          {loc.district} District · PIN {loc.pincode}
        </div>

        {/* Thin divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${color}60, transparent)`, marginBottom: 12 }}/>

        {/* Classification */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 6 }}>
            Classification
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
            {[
              ["District", loc.district],
              ["Pincode",  loc.pincode],
              ["Post Office", loc.post_office.replace(/\s+\d{6}$/, "")],
              ["Type",     loc.office_type ?? "PO"],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 1 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.2 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {loc.description && (
          <div style={{ padding: "8px 10px", background: `${color}0D`, borderLeft: `2px solid ${color}80`, marginBottom: 10, flex: 1, overflow: "hidden" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--ink-mid)", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {loc.description}
            </p>
          </div>
        )}

        {/* Photo if available */}
        {photoUrl && (
          <div style={{ flexShrink: 0, marginTop: "auto" }}>
            <div style={{ background: "#1A0E06", overflow: "hidden", aspectRatio: "16/7" }}>
              <img src={photoUrl} alt="Visit" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
            </div>
            {visit && (
              <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.65rem", color: "var(--forest)", marginTop: 4, textAlign: "right" }}>
                ✓ visited {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
          </div>
        )}

        {!photoUrl && visit && (
          <div style={{ marginTop: "auto", fontFamily: "var(--font-kalam, cursive)", fontSize: "0.7rem", color: "var(--forest)", paddingTop: 8 }}>
            ✓ collected {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            {visit.notes && (
              <div style={{ fontStyle: "italic", color: "var(--laterite)", fontSize: "0.65rem", marginTop: 3 }}>"{visit.notes.slice(0, 60)}{visit.notes.length > 60 ? "…" : ""}"</div>
            )}
          </div>
        )}
      </div>

      {/* Page number */}
      <div style={{ padding: "6px 20px", borderTop: "1px solid rgba(196,163,90,0.2)", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", color: "rgba(74,40,16,0.4)", letterSpacing: "0.08em" }}>
          {(loc.sno - 1) * 2 + 4}
        </span>
      </div>
    </div>
  );
}

// ── Right stamp page ────────────────────────────────────────────────
function RightPage({ loc, visit }: {
  loc: ReturnType<typeof locations[0]["sno"] extends number ? typeof locations.find : never>;
  visit: Visit | null;
}) {
  if (!loc) return null;
  const color  = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const artFn  = STAMP_ARTWORKS[loc.sno];
  const r = 55, outer = r - 4, inner = r - 14, ticks = 28;

  const d  = visit?.visitedAt ? new Date(visit.visitedAt + "T12:00:00") : null;
  const dy = d?.getDate();
  const mo = d?.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  const yr = d?.getFullYear();

  return (
    <div className="book-parchment" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Page header */}
      <div style={{ background: "var(--temple)", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sandstone)" }}>
          Pictorial Cancellation
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "rgba(196,163,90,0.6)", letterSpacing: "0.08em" }}>
          PPC {String(loc.sno).padStart(3, "0")}
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", gap: 12 }}>

        {/* Stamp slot */}
        <div style={{
          padding: "16px",
          border: visit ? `2px solid ${color}80` : "2px dashed rgba(196,163,90,0.3)",
          background: visit ? `${color}06` : "transparent",
          display: "flex", flexDirection: "column", alignItems: "center",
          width: "100%",
          transition: "all 0.4s",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 12 }}>
            Permanent Pictorial Cancellation
          </div>

          {/* SVG Stamp */}
          <svg width={r*2} height={r*2} viewBox={`0 0 ${r*2} ${r*2}`}
            style={visit ? { filter: "drop-shadow(1px 2px 5px rgba(26,14,6,0.35))" } : {}}>
            {visit ? (
              <>
                <circle cx={r} cy={r} r={outer - 1} fill={`${color}08`}/>
                {Array.from({ length: ticks }, (_, i) => {
                  const a = (i / ticks) * Math.PI * 2;
                  return <line key={i} x1={r+(outer-2.5)*Math.cos(a)} y1={r+(outer-2.5)*Math.sin(a)} x2={r+(outer+2.5)*Math.cos(a)} y2={r+(outer+2.5)*Math.sin(a)} stroke={color} strokeWidth="1.2"/>;
                })}
                <circle cx={r} cy={r} r={outer} fill="none" stroke={color} strokeWidth="2"/>
                <circle cx={r} cy={r} r={inner+2} fill="none" stroke={color} strokeWidth="0.8"/>
                <defs>
                  <path id={`arc-t-${loc.sno}`} d={`M ${r-inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,1 ${r+inner*0.85},${r}`}/>
                  <path id={`arc-b-${loc.sno}`} d={`M ${r-inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,0 ${r+inner*0.85},${r}`}/>
                </defs>
                <text fontSize={r*0.16} fill={color} fontFamily="serif" fontWeight="700" letterSpacing="1.5">
                  <textPath href={`#arc-t-${loc.sno}`} startOffset="50%" textAnchor="middle">{loc.place.toUpperCase().slice(0,12)}</textPath>
                </text>
                {artFn && artFn(r, inner)}
                {dy && <>
                  <text x={r} y={r+inner*0.38} textAnchor="middle" fontSize={r*0.42} fill={color} fontWeight="bold" fontFamily="serif">{dy}</text>
                  <text x={r} y={r+inner*0.6} textAnchor="middle" fontSize={r*0.17} fill={color} fontFamily="serif" letterSpacing="1">{mo} {yr}</text>
                </>}
                <text fontSize={r*0.13} fill={color} fontFamily="serif" letterSpacing="1">
                  <textPath href={`#arc-b-${loc.sno}`} startOffset="50%" textAnchor="middle">{loc.district.toUpperCase().slice(0,11)}</textPath>
                </text>
              </>
            ) : (
              <>
                <circle cx={r} cy={r} r={outer} fill="none" stroke="var(--sandstone)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.35"/>
                <circle cx={r} cy={r} r={inner} fill="none" stroke="var(--sandstone)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.2"/>
                {artFn && artFn(r, inner)}
                <text x={r} y={r+inner*0.52} textAnchor="middle" fontSize={r*0.14} fill="var(--sandstone)" fillOpacity="0.3" fontFamily="serif" letterSpacing="2">
                  AFFIX STAMP
                </text>
              </>
            )}
          </svg>

          {visit ? (
            <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.72rem", color: "var(--forest)", marginTop: 8, letterSpacing: "0.01em" }}>
              ✓ collected {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          ) : (
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(122,59,15,0.4)", marginTop: 8 }}>
              Visit post office to collect
            </div>
          )}
        </div>

        {/* Post office address block */}
        <div style={{ width: "100%", padding: "8px 10px", background: "rgba(240,228,192,0.4)", border: "1px solid rgba(196,163,90,0.25)", borderLeft: `3px solid var(--temple)` }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>Post Office</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.3 }}>
            {loc.post_office.replace(/\s+\d{6}$/, "")}
          </div>
          {loc.address && (
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: "var(--laterite)", marginTop: 2, lineHeight: 1.4 }}>
              {loc.address.split(",").slice(0, 2).join(",")}
            </div>
          )}
          <div style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: "var(--temple)", marginTop: 4, letterSpacing: "0.12em" }}>
            {loc.pincode}
          </div>
        </div>

        {/* Notes line */}
        <div style={{ width: "100%", borderTop: "1px dashed rgba(122,59,15,0.2)", paddingTop: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>Notes</div>
          {visit?.notes ? (
            <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.72rem", color: "var(--ink-mid)", fontStyle: "italic", lineHeight: 1.5 }}>
              "{visit.notes.slice(0, 80)}"
            </div>
          ) : (
            <div style={{ height: 22, borderBottom: "1px solid rgba(122,59,15,0.15)" }}/>
          )}
        </div>
      </div>

      {/* Page number */}
      <div style={{ padding: "6px 20px", borderTop: "1px solid rgba(196,163,90,0.2)", display: "flex", justifyContent: "flex-start" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", color: "rgba(74,40,16,0.4)", letterSpacing: "0.08em" }}>
          {(loc.sno - 1) * 2 + 5}
        </span>
      </div>
    </div>
  );
}

// ── Main Book Component ─────────────────────────────────────────────
export default function BookPage() {
  const [spread,    setSpread]    = useState(0); // current visible spread index
  const [flipping,  setFlipping]  = useState(false);
  const [flipDir,   setFlipDir]   = useState<FlipDirection>(null);
  const [visits,    setVisits]    = useState<Record<number, Visit>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Load visits
  useEffect(() => {
    setVisits(getVisits());
    const handler = () => setVisits(getVisits());
    window.addEventListener("philately:update", handler);
    return () => window.removeEventListener("philately:update", handler);
  }, []);

  // Load one photo per location (first available)
  useEffect(() => {
    const load = async () => {
      const urls: Record<number, string> = {};
      // Only load photos for visible locations
      const visible = [spread - 1, spread, spread + 1];
      for (const s of visible) {
        const sno = s - COVER_SPREADS + 1;
        if (sno < 1 || sno > 100) continue;
        if (urls[sno] || photoUrls[sno]) continue;
        try {
          const ps = await getPhotos(sno);
          if (ps.length > 0) urls[sno] = blobToUrl(ps[0].blob);
        } catch {}
      }
      if (Object.keys(urls).length > 0)
        setPhotoUrls(prev => ({ ...prev, ...urls }));
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread]);

  const goForward = useCallback(() => {
    if (flipping || spread >= TOTAL_SPREADS - 1) return;
    setFlipDir("forward");
    setFlipping(true);
    setTimeout(() => { setSpread(s => s + 1); setFlipping(false); setFlipDir(null); }, 700);
  }, [flipping, spread]);

  const goBackward = useCallback(() => {
    if (flipping || spread <= 0) return;
    setFlipDir("backward");
    setFlipping(true);
    setTimeout(() => { setSpread(s => s - 1); setFlipping(false); setFlipDir(null); }, 700);
  }, [flipping, spread]);

  // Jump to a specific spread by PPC number
  const goToLocation = useCallback((sno: number) => {
    setSpread(COVER_SPREADS + sno - 1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goForward();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")  goBackward();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goForward, goBackward]);

  // What's on the current spread?
  const isCover     = spread === 0;
  const isBackCover = spread === TOTAL_SPREADS - 1;
  const locIdx      = spread - COVER_SPREADS; // 0-based, 0 = PPC #1
  const loc         = (locIdx >= 0 && locIdx < TOTAL_LOCATIONS) ? locations[locIdx] : null;
  const visit       = loc ? (visits[loc.sno] ?? null) : null;
  const photoUrl    = loc ? (photoUrls[loc.sno] ?? null) : null;

  // Progress
  const collectedCount = Object.keys(visits).length;
  const pct = Math.round((collectedCount / 100) * 100);

  return (
    <div style={{ background: "#1A0E06", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: "var(--spine)", borderBottom: "1px solid rgba(196,163,90,0.2)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ color: "rgba(196,163,90,0.6)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <Home size={12}/> Home
          </Link>
          <span style={{ color: "rgba(196,163,90,0.25)" }}>·</span>
          <Link href="/passport" style={{ color: "rgba(196,163,90,0.6)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <BookOpen size={12}/> Passport
          </Link>
          {loc && (
            <>
              <span style={{ color: "rgba(196,163,90,0.25)" }}>·</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.08em", color: "var(--sandstone)" }}>
                PPC #{String(loc.sno).padStart(3,"0")} — {loc.place}
              </span>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Mini progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 60, height: 4, background: "rgba(196,163,90,0.15)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--sandstone)", transition: "width 0.4s" }}/>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", color: "rgba(196,163,90,0.55)", letterSpacing: "0.06em" }}>
              {collectedCount}/100
            </span>
          </div>

          {/* Spread counter */}
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", color: "rgba(196,163,90,0.4)", letterSpacing: "0.06em" }}>
            {spread + 1}/{TOTAL_SPREADS}
          </span>
        </div>
      </div>

      {/* Book viewer */}
      <div className="book-viewer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px 16px", position: "relative" }}>

        {/* Book shadow on table */}
        <div style={{
          position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)",
          width: "75%", height: 20,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}/>

        {/* The open book */}
        <div
          ref={containerRef}
          className="book-open"
          style={{
            width: "min(880px, 96vw)",
            height: "min(560px, 70vh)",
            display: "flex",
            position: "relative",
            borderRadius: "2px 4px 4px 2px",
          }}
        >
          {/* Left page area */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              borderRadius: "2px 0 0 2px",
              boxShadow: "inset -8px 0 16px rgba(26,14,6,0.12)",
              cursor: spread > 0 ? "pointer" : "default",
            }}
            onClick={goBackward}
          >
            {/* Flip animation overlay — exits left */}
            {flipping && flipDir === "backward" && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "var(--page)",
                transformOrigin: "right center",
                animation: "page-flip-forward 0.7s cubic-bezier(0.645,0.045,0.355,1) forwards",
                backfaceVisibility: "hidden",
              }}/>
            )}

            {isCover ? (
              <CoverPage />
            ) : isBackCover ? (
              <BackMatterPage />
            ) : spread === 1 ? (
              <InsideCoverPage />
            ) : spread === TOTAL_SPREADS - 2 ? (
              <BackMatterPage />
            ) : loc ? (
              <LeftPage loc={loc} visit={visit} photoUrl={photoUrl} />
            ) : null}

            {/* Left page edge tap hint */}
            {spread > 0 && (
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 40,
                background: "linear-gradient(to right, rgba(26,14,6,0.06), transparent)",
                display: "flex", alignItems: "center", paddingLeft: 6,
                opacity: 0, transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
              >
                <ChevronLeft size={16} style={{ color: "var(--copper)", opacity: 0.6 }}/>
              </div>
            )}
          </div>

          {/* Spine */}
          <div style={{
            width: 20,
            background: "linear-gradient(90deg, rgba(26,14,6,0.25) 0%, rgba(26,14,6,0.08) 40%, rgba(26,14,6,0.02) 50%, rgba(26,14,6,0.08) 60%, rgba(26,14,6,0.22) 100%)",
            position: "relative", flexShrink: 0,
          }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(26,14,6,0.1)" }}/>
          </div>

          {/* Right page area */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              borderRadius: "0 4px 4px 0",
              boxShadow: "inset 8px 0 16px rgba(26,14,6,0.1)",
              cursor: spread < TOTAL_SPREADS - 1 ? "pointer" : "default",
            }}
            onClick={goForward}
          >
            {/* Flip animation overlay — enters from right */}
            {flipping && flipDir === "forward" && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "var(--page)",
                transformOrigin: "left center",
                animation: "page-flip-back 0.7s cubic-bezier(0.645,0.045,0.355,1) forwards",
                backfaceVisibility: "hidden",
              }}/>
            )}

            {isCover ? (
              <div className="book-cover-texture" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(196,163,90,0.25)", writingMode: "vertical-rl" }}>
                  Open →
                </div>
              </div>
            ) : isBackCover ? (
              <BackCoverPage />
            ) : spread === 1 ? (
              <IntroPage />
            ) : spread === TOTAL_SPREADS - 2 ? (
              <BackCoverPage />
            ) : loc ? (
              <RightPage loc={loc} visit={visit} />
            ) : null}

            {/* Right page edge tap hint */}
            {spread < TOTAL_SPREADS - 1 && (
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
                background: "linear-gradient(to left, rgba(26,14,6,0.06), transparent)",
                display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6,
                opacity: 0, transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
              >
                <ChevronRight size={16} style={{ color: "var(--copper)", opacity: 0.6 }}/>
              </div>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={goBackward}
          disabled={spread === 0 || flipping}
          style={{
            position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
            background: spread === 0 ? "rgba(26,14,6,0.2)" : "rgba(196,163,90,0.15)",
            border: "1px solid rgba(196,163,90,0.2)", color: spread === 0 ? "rgba(196,163,90,0.2)" : "var(--sandstone)",
            cursor: spread === 0 ? "not-allowed" : "pointer", padding: "12px 8px", lineHeight: 1,
            transition: "all 0.15s",
          }}
        >
          <ArrowLeft size={16}/>
        </button>

        <button
          onClick={goForward}
          disabled={spread === TOTAL_SPREADS - 1 || flipping}
          style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            background: spread === TOTAL_SPREADS - 1 ? "rgba(26,14,6,0.2)" : "rgba(196,163,90,0.15)",
            border: "1px solid rgba(196,163,90,0.2)", color: spread === TOTAL_SPREADS - 1 ? "rgba(196,163,90,0.2)" : "var(--sandstone)",
            cursor: spread === TOTAL_SPREADS - 1 ? "not-allowed" : "pointer", padding: "12px 8px", lineHeight: 1,
            transition: "all 0.15s",
          }}
        >
          <ArrowRight size={16}/>
        </button>
      </div>

      {/* Bottom toolbar */}
      <div style={{ background: "rgba(13,31,58,0.9)", borderTop: "1px solid rgba(196,163,90,0.1)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, overflowX: "auto" }}>
        {/* Jump to cover */}
        <button onClick={() => setSpread(0)}
          style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", background: spread === 0 ? "var(--sandstone)" : "transparent", color: spread === 0 ? "var(--spine)" : "rgba(196,163,90,0.5)", border: "1px solid rgba(196,163,90,0.2)", cursor: "pointer", flexShrink: 0 }}>
          Cover
        </button>

        {/* District quick-jump chips */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1, scrollbarWidth: "none" }}>
          {Array.from(new Set(locations.map(l => l.district))).map(d => {
            const first = locations.find(l => l.district === d);
            const isActive = loc?.district === d;
            return (
              <button key={d} onClick={() => first && goToLocation(first.sno)}
                style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px", background: isActive ? "var(--sandstone)" : "transparent", color: isActive ? "var(--spine)" : "rgba(196,163,90,0.4)", border: isActive ? "1px solid var(--gilt)" : "1px solid rgba(196,163,90,0.15)", cursor: "pointer", flexShrink: 0, transition: "all 0.1s", whiteSpace: "nowrap" }}>
                {d.slice(0, 8)}
              </button>
            );
          })}
        </div>

        {/* Page number input */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", color: "rgba(196,163,90,0.35)", letterSpacing: "0.08em" }}>PPC</span>
          <input
            type="number" min="1" max="100"
            placeholder="1–100"
            onKeyDown={e => {
              if (e.key === "Enter") {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (val >= 1 && val <= 100) { goToLocation(val); (e.target as HTMLInputElement).value = ""; }
              }
            }}
            style={{ width: 52, padding: "4px 6px", background: "rgba(196,163,90,0.08)", border: "1px solid rgba(196,163,90,0.2)", color: "var(--sandstone)", fontFamily: "var(--font-display)", fontSize: "0.65rem", outline: "none", textAlign: "center" }}
          />
        </div>
      </div>
    </div>
  );
}
