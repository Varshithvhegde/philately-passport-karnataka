"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { locations, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/data";
import { STAMP_ARTWORKS } from "@/components/StampArtwork";
import { getVisits, type Visit } from "@/lib/visits";
import { getPhotos, blobToUrl } from "@/lib/imageStore";
import { BookOpen, Home, ChevronLeft, ChevronRight } from "lucide-react";

// Types are declared in types/page-flip.d.ts

// ─── Constants ───────────────────────────────────────────────────────
// With showCover:true, page 0 is a standalone cover (right side only).
// All subsequent pages pair as left+right: (1,2) (3,4) (5,6)...
// For a PPC spread to show Info on LEFT and Stamp on RIGHT, Info must
// be at an ODD index (left position in a pair).
//
//   Page 0      : Front Cover  (hard, standalone right)
//   Page 1      : About        (left of spread 1)
//   Page 2      : Contents 1–50(right of spread 1)
//   Page 3      : Contents 51–100 (left of spread 2)
//   Page 4      : *** BLANK FILLER *** (right of spread 2, balances parity)
//   Page 5      : PPC #001 Info  (left of spread 3)  ← ODD = LEFT ✓
//   Page 6      : PPC #001 Stamp (right of spread 3)
//   Page 7      : PPC #002 Info  (left of spread 4)
//   ...
//   Page 204    : PPC #100 Info
//   Page 205    : PPC #100 Stamp
//   Page 206    : Colophon
//   Page 207    : Back Cover (hard)
//
// PPC #sno → Info page  = 5 + (sno - 1) * 2  = 3 + sno*2
// PPC #sno → Stamp page = 6 + (sno - 1) * 2  = 4 + sno*2
const PPC_START = 5; // first PPC info page index
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";
const PAGE_CONTENT_STYLE: React.CSSProperties = {
  width: "100%", height: "100%", overflow: "hidden",
  boxSizing: "border-box", position: "relative",
};

// ─── Page content components ─────────────────────────────────────────

function CoverFront() {
  return (
    <div style={{ ...PAGE_CONTENT_STYLE, background: "linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)", backgroundImage: GRAIN + ",linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#C4391A,#E05020 50%,#C4391A)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 22px,rgba(196,163,90,0.025) 22px,rgba(196,163,90,0.025) 23px)" }} />
      {[{ top: 14, left: 14 }, { top: 14, right: 14, transform: "scaleX(-1)" }, { bottom: 14, left: 14, transform: "scaleY(-1)" }, { bottom: 14, right: 14, transform: "scale(-1)" }].map((s, i) => (
        <svg key={i} width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ position: "absolute", ...s }}>
          <path d="M2 2L2 10M2 2L10 2" stroke="#C4A35A" strokeWidth="1.5" opacity="0.5" />
        </svg>
      ))}
      <svg width="40" height="30" viewBox="0 0 20 20" fill="none" style={{ marginBottom: 14, opacity: 0.55 }}>
        <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)" />
        <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A" opacity="0.7" />
      </svg>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(0.65rem,1.2vw,0.85rem)", color: "rgba(196,163,90,0.6)", letterSpacing: "0.08em", marginBottom: 5 }}>फिलाटेली पासपोर्ट</div>
      <div style={{ fontFamily: "var(--font-kannada)", fontSize: "clamp(1rem,2.2vw,1.45rem)", color: "#E8D9B8", lineHeight: 1.2, marginBottom: 10, textAlign: "center" }}>ಕರ್ನಾಟಕ<br />ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್</div>
      <div style={{ width: "52%", height: 7, backgroundImage: "repeating-linear-gradient(90deg,transparent 0,transparent 7px,rgba(196,163,90,0.2) 7px,rgba(196,163,90,0.2) 9px)", marginBottom: 10 }} />
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(0.6rem,1.1vw,0.75rem)", letterSpacing: "0.12em", color: "var(--sandstone)", marginBottom: 4 }}>PHILATELY PASSPORT</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(0.4rem,0.8vw,0.52rem)", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(196,163,90,0.38)", marginBottom: 16 }}>Permanent Pictorial Cancellations · Karnataka</div>
      <div style={{ padding: "3px 12px", border: "1px solid rgba(196,163,90,0.35)", fontFamily: "var(--font-display)", fontSize: "clamp(0.42rem,0.75vw,0.55rem)", letterSpacing: "0.14em", color: "rgba(196,163,90,0.5)" }}>VERSION 3.0</div>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ ...PAGE_CONTENT_STYLE, background: "#F7EFDB", backgroundImage: GRAIN + ",linear-gradient(160deg,#F7EFDB 0%,#F0E4C0 100%)", padding: "28px 22px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 14 }}>About this Passport</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 600, color: "var(--temple)", marginBottom: 12, lineHeight: 1.25 }}>Karnataka Philately Passport Version 3.0</h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "#4A2C12", lineHeight: 1.7, marginBottom: 14 }}>This passport contains 100 Permanent Pictorial Cancellation sites across 25 districts of Karnataka. Visit each post office, collect the stamp, and document your journey.</p>
      <div style={{ height: 1, background: "linear-gradient(90deg,var(--copper),transparent)", marginBottom: 14 }} />
      {[["Find", "Browse locations on the map or passport list."], ["Visit", "Travel to the post office and request the PPC stamp."], ["Record", "Mark it collected to fill your stamp slot."]].map(([s, d]) => (
        <div key={s} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--spine)", background: "var(--sandstone)", padding: "1px 5px", flexShrink: 0, marginTop: 1 }}>{s}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "#4A2C12", lineHeight: 1.5 }}>{d}</span>
        </div>
      ))}
    </div>
  );
}

function ContentsPage({ half }: { half: 0 | 1 }) {
  const slice = half === 0 ? locations.slice(0, 50) : locations.slice(50);
  return (
    <div style={{ ...PAGE_CONTENT_STYLE, background: "#F7EFDB", backgroundImage: GRAIN, padding: "22px 18px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 10 }}>Contents {half === 0 ? "(1–50)" : "(51–100)"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {slice.map(l => (
          <div key={l.sno} style={{ display: "flex", alignItems: "baseline", gap: 4, padding: "2.5px 0", borderBottom: "1px dotted rgba(196,163,90,0.18)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.43rem", color: "var(--copper)", flexShrink: 0, minWidth: 22, letterSpacing: "0.05em" }}>{String(l.sno).padStart(3, "0")}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.58rem", color: "var(--temple)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{l.place}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.52rem", color: "var(--laterite)", flexShrink: 0 }}>{l.district.slice(0, 8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoPage({ loc, visit, photoUrl }: { loc: typeof locations[0]; visit: Visit | null; photoUrl: string | null }) {
  const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const icon = CATEGORY_ICONS[loc.category] ?? "📍";
  return (
    <div style={{ ...PAGE_CONTENT_STYLE, background: "#F7EFDB", backgroundImage: GRAIN + ",linear-gradient(160deg,#F7EFDB 0%,#F0E4C0 100%)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "var(--temple)", padding: "7px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sandstone)" }}>Karnataka Philately Passport</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", color: "rgba(196,163,90,0.55)", letterSpacing: "0.06em" }}>{String(loc.sno).padStart(3, "0")} / 100</span>
      </div>
      <div style={{ flex: 1, padding: "14px 16px 10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <span style={{ fontSize: "0.78rem" }}>{icon}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)" }}>{loc.category}</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--temple)", fontSize: "1.1rem", lineHeight: 1.15, marginBottom: 3 }}>{loc.place}</h2>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: "var(--copper)", marginBottom: 10 }}>{loc.district} District · PIN {loc.pincode}</div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${color}60,transparent)`, marginBottom: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", marginBottom: 8 }}>
          {[["District", loc.district], ["Pincode", loc.pincode], ["Post Office", loc.post_office.replace(/\s+\d{6}$/, "")], ["Type", loc.office_type ?? "PO"]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.4rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 1 }}>{label}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.2 }}>{val}</div>
            </div>
          ))}
        </div>
        {loc.description && (
          <div style={{ padding: "6px 8px", background: `${color}0D`, borderLeft: `2px solid ${color}80`, flex: 1, overflow: "hidden", minHeight: 0 }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", color: "#4A2C12", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{loc.description}</p>
          </div>
        )}
        {photoUrl ? (
          <div style={{ flexShrink: 0, marginTop: 8 }}>
            <div style={{ background: "#1A0E06", overflow: "hidden", aspectRatio: "16/5" }}>
              <img src={photoUrl} alt="Visit" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            {visit && <div style={{ fontFamily: "var(--font-kalam,cursive)", fontSize: "0.58rem", color: "var(--forest)", marginTop: 2, textAlign: "right" }}>✓ {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>}
          </div>
        ) : visit ? (
          <div style={{ marginTop: "auto", paddingTop: 6, fontFamily: "var(--font-kalam,cursive)", fontSize: "0.62rem", color: "var(--forest)" }}>
            ✓ {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            {visit.notes && <div style={{ fontStyle: "italic", color: "var(--laterite)", fontSize: "0.57rem", marginTop: 1 }}>"{visit.notes.slice(0, 50)}{visit.notes.length > 50 ? "…" : ""}"</div>}
          </div>
        ) : null}
      </div>
      <div style={{ padding: "4px 16px", borderTop: "1px solid rgba(196,163,90,0.2)", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.42rem", color: "rgba(74,40,16,0.38)", letterSpacing: "0.06em" }}>{PPC_START + (loc.sno - 1) * 2}</span>
      </div>
    </div>
  );
}

function StampPage({ loc, visit }: { loc: typeof locations[0]; visit: Visit | null }) {
  const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const artFn = STAMP_ARTWORKS[loc.sno];
  const r = 48, outer = r - 4, inner = r - 13, ticks = 24;
  const d = visit?.visitedAt ? new Date(visit.visitedAt + "T12:00:00") : null;
  const dy = d?.getDate(), mo = d?.toLocaleString("en-IN", { month: "short" }).toUpperCase(), yr = d?.getFullYear();
  return (
    <div style={{ ...PAGE_CONTENT_STYLE, background: "#F7EFDB", backgroundImage: GRAIN + ",linear-gradient(160deg,#EFE5C8 0%,#F7EFDB 100%)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "var(--temple)", padding: "7px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sandstone)" }}>Pictorial Cancellation</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.44rem", color: "rgba(196,163,90,0.55)", letterSpacing: "0.06em" }}>PPC {String(loc.sno).padStart(3, "0")}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 14px", gap: 8 }}>
        {/* Stamp zone */}
        <div style={{ padding: "10px", border: visit ? `1.5px solid ${color}80` : "1.5px dashed rgba(196,163,90,0.3)", background: visit ? `${color}06` : "transparent", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.4rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 8 }}>Permanent Pictorial Cancellation</div>
          <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`} style={visit ? { filter: "drop-shadow(1px 2px 4px rgba(26,14,6,0.3))" } : {}}>
            {visit ? (<>
              <circle cx={r} cy={r} r={outer - 1} fill={`${color}08`} />
              {Array.from({ length: ticks }, (_, i) => { const a = (i / ticks) * Math.PI * 2; return <line key={i} x1={r + (outer - 2) * Math.cos(a)} y1={r + (outer - 2) * Math.sin(a)} x2={r + (outer + 2) * Math.cos(a)} y2={r + (outer + 2) * Math.sin(a)} stroke={color} strokeWidth="1.1" />; })}
              <circle cx={r} cy={r} r={outer} fill="none" stroke={color} strokeWidth="2" />
              <circle cx={r} cy={r} r={inner + 2} fill="none" stroke={color} strokeWidth="0.8" />
              <defs>
                <path id={`at-${loc.sno}`} d={`M ${r - inner * 0.85},${r} A ${inner * 0.85},${inner * 0.85} 0 0,1 ${r + inner * 0.85},${r}`} />
                <path id={`ab-${loc.sno}`} d={`M ${r - inner * 0.85},${r} A ${inner * 0.85},${inner * 0.85} 0 0,0 ${r + inner * 0.85},${r}`} />
              </defs>
              <text fontSize={r * 0.155} fill={color} fontFamily="serif" fontWeight="700" letterSpacing="1.2"><textPath href={`#at-${loc.sno}`} startOffset="50%" textAnchor="middle">{loc.place.toUpperCase().slice(0, 12)}</textPath></text>
              {artFn && artFn(r, inner)}
              {dy && <><text x={r} y={r + inner * 0.38} textAnchor="middle" fontSize={r * 0.38} fill={color} fontWeight="bold" fontFamily="serif">{dy}</text><text x={r} y={r + inner * 0.6} textAnchor="middle" fontSize={r * 0.16} fill={color} fontFamily="serif" letterSpacing="1">{mo} {yr}</text></>}
              <text fontSize={r * 0.12} fill={color} fontFamily="serif" letterSpacing="1"><textPath href={`#ab-${loc.sno}`} startOffset="50%" textAnchor="middle">{loc.district.toUpperCase().slice(0, 11)}</textPath></text>
            </>) : (<>
              <circle cx={r} cy={r} r={outer} fill="none" stroke="var(--sandstone)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.3" />
              <circle cx={r} cy={r} r={inner} fill="none" stroke="var(--sandstone)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.18" />
              {artFn && artFn(r, inner)}
              <text x={r} y={r + inner * 0.52} textAnchor="middle" fontSize={r * 0.13} fill="var(--sandstone)" fillOpacity="0.28" fontFamily="serif" letterSpacing="1.5">AFFIX STAMP</text>
            </>)}
          </svg>
          {visit ? (
            <div style={{ fontFamily: "var(--font-kalam,cursive)", fontSize: "0.62rem", color: "var(--forest)", marginTop: 5 }}>✓ collected {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
          ) : (
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.42rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(122,59,15,0.38)", marginTop: 5 }}>Visit post office to collect</div>
          )}
        </div>
        {/* Post office */}
        <div style={{ width: "100%", padding: "6px 8px", background: "rgba(240,228,192,0.4)", border: "1px solid rgba(196,163,90,0.22)", borderLeft: "2.5px solid var(--temple)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.4rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>Post Office</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "0.63rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.25 }}>{loc.post_office.replace(/\s+\d{6}$/, "")}</div>
          {loc.address && <div style={{ fontFamily: "var(--font-body)", fontSize: "0.54rem", color: "var(--laterite)", marginTop: 2, lineHeight: 1.35 }}>{loc.address.split(",").slice(0, 2).join(",")}</div>}
          <div style={{ fontFamily: "monospace", fontSize: "0.68rem", fontWeight: 700, color: "var(--temple)", marginTop: 3, letterSpacing: "0.1em" }}>{loc.pincode}</div>
        </div>
        {/* Notes */}
        <div style={{ width: "100%", borderTop: "1px dashed rgba(122,59,15,0.18)", paddingTop: 5 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.4rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 3 }}>Notes</div>
          {visit?.notes ? (
            <div style={{ fontFamily: "var(--font-kalam,cursive)", fontSize: "0.62rem", color: "#4A2C12", fontStyle: "italic", lineHeight: 1.5 }}>"{visit.notes.slice(0, 65)}{visit.notes.length > 65 ? "…" : ""}"</div>
          ) : (
            <div style={{ height: 16, borderBottom: "1px solid rgba(122,59,15,0.12)" }} />
          )}
        </div>
      </div>
      <div style={{ padding: "4px 16px", borderTop: "1px solid rgba(196,163,90,0.2)", display: "flex", justifyContent: "flex-start" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.42rem", color: "rgba(74,40,16,0.38)", letterSpacing: "0.06em" }}>{PPC_START + (loc.sno - 1) * 2 + 1}</span>
      </div>
    </div>
  );
}

function ColophonPage() {
  return (
    <div style={{ ...PAGE_CONTENT_STYLE, background: "#F7EFDB", backgroundImage: GRAIN, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
      <div style={{ fontFamily: "var(--font-kannada)", fontSize: "1.05rem", color: "var(--temple)", marginBottom: 10 }}>ಪ್ರತಿ ಅಂಚೆ ಕಚೇರಿ ಒಂದು ಕಥೆ ಹೇಳುತ್ತದೆ</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--copper)", fontStyle: "italic", marginBottom: 16 }}>Every post office tells a story.</div>
      <div style={{ width: 50, height: 7, backgroundImage: "repeating-linear-gradient(90deg,transparent 0,transparent 7px,rgba(196,163,90,0.2) 7px,rgba(196,163,90,0.2) 9px)", marginBottom: 16 }} />
      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", lineHeight: 2 }}>Karnataka Circle · India Post<br />100 Permanent Pictorial Cancellations<br />Version 3.0</div>
    </div>
  );
}

function BackCoverPage() {
  return (
    <div style={{ ...PAGE_CONTENT_STYLE, background: "linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)", backgroundImage: GRAIN + ",linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.2 }}>
        <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)" />
        <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A" />
      </svg>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────
export default function BookPage() {
  const bookContainerRef  = useRef<HTMLDivElement>(null);
  const pageFlipRef       = useRef<InstanceType<typeof import("page-flip")["PageFlip"]> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [visits,      setVisits]      = useState<Record<number, Visit>>({});
  const [photoUrls,   setPhotoUrls]   = useState<Record<number, string>>({});
  const [ready,       setReady]       = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);

  // Load visits
  useEffect(() => {
    setVisits(getVisits());
    const h = () => setVisits(getVisits());
    window.addEventListener("philately:update", h);
    return () => window.removeEventListener("philately:update", h);
  }, []);

  // Lazy-load photos for nearby pages
  useEffect(() => {
    const currentSno = currentPage - PPC_START + 1;  // page 5 = sno 1
    const load = async () => {
      for (let offset = -2; offset <= 4; offset++) {
        const sno = Math.floor((currentSno + offset) / 2) + 1;
        if (sno < 1 || sno > 100 || photoUrls[sno]) continue;
        try {
          const ps = await getPhotos(sno);
          if (ps.length > 0) {
            const url = blobToUrl(ps[0].blob);
            setPhotoUrls(p => ({ ...p, [sno]: url }));
          }
        } catch { /* silent */ }
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Detect mobile and reinit PageFlip on resize
  const initFlip = useCallback(() => {
    import("page-flip").then(({ PageFlip }) => {
      if (!bookContainerRef.current) return;

      // Destroy old instance
      try { pageFlipRef.current?.destroy(); } catch { /* ignore */ }
      pageFlipRef.current = null;
      setReady(false);

      const stage   = document.getElementById("book-stage")!;
      const sw      = stage.clientWidth;
      const sh      = stage.clientHeight;
      const mobile  = sw < 640;
      setIsMobile(mobile);

      let pageW: number, pageH: number, portrait: boolean;

      if (mobile) {
        // Portrait single-page: use almost full width
        portrait = true;
        pageW    = Math.min(sw - 20, 400);
        pageH    = Math.min(sh - 20, Math.round(pageW * 1.42));
      } else {
        // Landscape two-page spread
        portrait = false;
        const hPad = sw < 900 ? 24 : 60;
        pageW    = Math.min(Math.floor((sw - hPad * 2) / 2), 440);
        pageH    = Math.min(sh - 24, 580);
      }

      const pf = new PageFlip(bookContainerRef.current, {
        width:             pageW,
        height:            pageH,
        size:              "fixed",
        drawShadow:        true,
        flippingTime:      600,
        usePortrait:       portrait,
        showCover:         true,
        mobileScrollSupport: true,
        maxShadowOpacity:  0.45,
        showPageCorners:   !mobile,
        disableFlipByClick: false,
        clickEventForward: false,
        swipeDistance:     mobile ? 30 : 50,
      });

      const pageNodes = bookContainerRef.current.querySelectorAll(".book-page");
      pf.loadFromHTML(pageNodes);

      pf.on("flip", (e: import("page-flip").FlipEvent) => {
        setCurrentPage(e.data);
      });

      setTotalPages(pf.getPageCount());
      pageFlipRef.current = pf;
      setReady(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Init PageFlip after mount + handle resize
  useEffect(() => {
    // Small delay so DOM is measured correctly after layout
    const tid = setTimeout(initFlip, 80);

    let resizeTid: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTid);
      resizeTid = setTimeout(initFlip, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(tid);
      clearTimeout(resizeTid);
      window.removeEventListener("resize", onResize);
      try { pageFlipRef.current?.destroy(); } catch { /* ignore */ }
      pageFlipRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = useCallback(() => pageFlipRef.current?.turnToNextPage(), []);
  const goPrev = useCallback(() => pageFlipRef.current?.turnToPrevPage(), []);
  const goTo   = useCallback((n: number) => pageFlipRef.current?.turnToPage(n), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  const collectedCount = Object.keys(visits).length;
  const pct = Math.round((collectedCount / 100) * 100);

  // Figure out displayed location for breadcrumb
  // Pages 4,5=sno1 | 6,7=sno2 | etc.
  // Pages 5–204 are PPC pages. Page 5=sno1 info, 6=sno1 stamp, 7=sno2 info...
  const displaySno = currentPage >= PPC_START && currentPage <= PPC_START + 199
    ? Math.floor((currentPage - PPC_START) / 2) + 1
    : null;
  const displayLoc = displaySno !== null ? locations[displaySno - 1] : null;

  return (
    <div style={{ background: "#0A0500", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <div style={{ background: "var(--spine)", borderBottom: "1px solid rgba(196,163,90,0.18)", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Link href="/" style={{ color: "rgba(196,163,90,0.55)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
            <Home size={11} /> Home
          </Link>
          {!isMobile && <>
            <span style={{ color: "rgba(196,163,90,0.2)" }}>·</span>
            <Link href="/passport" style={{ color: "rgba(196,163,90,0.55)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
              <BookOpen size={11} /> Passport
            </Link>
          </>}
          {displayLoc && <>
            <span style={{ color: "rgba(196,163,90,0.2)", flexShrink: 0 }}>·</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", color: "var(--sandstone)", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isMobile ? displayLoc.place : `PPC #${String(displayLoc.sno).padStart(3, "0")} — ${displayLoc.place}`}
            </span>
          </>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 40, height: 3, background: "rgba(196,163,90,0.12)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--sandstone)", transition: "width 0.4s" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "rgba(196,163,90,0.45)", letterSpacing: "0.04em" }}>{collectedCount}/100</span>
          </div>
          {totalPages > 0 && !isMobile && (
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", color: "rgba(196,163,90,0.3)", letterSpacing: "0.04em" }}>
              {currentPage + 1}/{totalPages}
            </span>
          )}
        </div>
      </div>

      {/* ── Book stage ─────────────────────────────────────────────── */}
      <div
        id="book-stage"
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: isMobile ? "8px 8px 8px" : "16px 48px 12px",
          background: "radial-gradient(ellipse 80% 60% at 50% 72%, #2A1A0A 0%, #0A0500 100%)",
          position: "relative",
          minHeight: 0,
        }}
      >
        {/* Desk glow + shadow */}
        <div style={{ position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)", width: "62%", height: 24, background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)", filter: "blur(12px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 60, background: "radial-gradient(ellipse, rgba(196,163,90,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* PageFlip container — page-flip renders into this */}
        <div ref={bookContainerRef} style={{ visibility: ready ? "visible" : "hidden" }}>
          {/* These are the actual page DOM nodes loaded by PageFlip.
              IMPORTANT: Must be direct children, all with class "book-page".
              page-flip reads their content and renders to canvas.
              Order = physical page order in the book. */}

          {/* Page 0: Front Cover (hard) */}
          <div className="book-page" data-density="hard">
            <CoverFront />
          </div>

          {/* Page 1: About / Inside front cover */}
          <div className="book-page">
            <AboutPage />
          </div>

          {/* Page 2: Contents part 1 */}
          <div className="book-page">
            <ContentsPage half={0} />
          </div>

          {/* Page 3: Contents part 2 */}
          <div className="book-page">
            <ContentsPage half={1} />
          </div>

          {/* Page 4: Blank filler — keeps PPC info pages on ODD indices (LEFT side) */}
          <div className="book-page">
            <div style={{ width:"100%", height:"100%", background:"#F0E8D0",
              backgroundImage: GRAIN, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:40, height:40, opacity:0.12 }}>
                <svg viewBox="0 0 20 20" fill="none" width="100%" height="100%">
                  <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z"
                    stroke="#7A3B0F" strokeWidth="1" fill="none"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Pages 5–204: 100 PPC locations × 2 pages each (Info=odd=left, Stamp=even=right) */}
          {locations.map(loc => {
            const visit    = visits[loc.sno] ?? null;
            const photoUrl = photoUrls[loc.sno] ?? null;
            return [
              <div key={`info-${loc.sno}`} className="book-page">
                <InfoPage loc={loc} visit={visit} photoUrl={photoUrl} />
              </div>,
              <div key={`stamp-${loc.sno}`} className="book-page">
                <StampPage loc={loc} visit={visit} />
              </div>,
            ];
          })}

          {/* Page 204: Colophon */}
          <div className="book-page">
            <ColophonPage />
          </div>

          {/* Page 205: Back Cover (hard) */}
          <div className="book-page" data-density="hard">
            <BackCoverPage />
          </div>
        </div>

        {/* Loading spinner */}
        {!ready && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <svg width="48" height="36" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.5 }}>
              <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)" />
              <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A" opacity="0.7" />
            </svg>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(196,163,90,0.4)" }}>
              Loading Passport…
            </div>
          </div>
        )}

        {/* External nav arrows — bigger tap targets on mobile */}
        <button onClick={goPrev}
          style={{ position: "absolute", left: isMobile ? 2 : 8, top: "50%", transform: "translateY(-50%)", background: "rgba(196,163,90,0.12)", border: "1px solid rgba(196,163,90,0.2)", color: "var(--sandstone)", cursor: "pointer", padding: isMobile ? "16px 10px" : "13px 9px", lineHeight: 1, transition: "all 0.15s", zIndex: 10, touchAction: "manipulation" }}>
          <ChevronLeft size={isMobile ? 20 : 18} />
        </button>
        <button onClick={goNext}
          style={{ position: "absolute", right: isMobile ? 2 : 8, top: "50%", transform: "translateY(-50%)", background: "rgba(196,163,90,0.12)", border: "1px solid rgba(196,163,90,0.2)", color: "var(--sandstone)", cursor: "pointer", padding: isMobile ? "16px 10px" : "13px 9px", lineHeight: 1, transition: "all 0.15s", zIndex: 10, touchAction: "manipulation" }}>
          <ChevronRight size={isMobile ? 20 : 18} />
        </button>
      </div>

      {/* ── Bottom toolbar ─────────────────────────────────────────── */}
      <div style={{ background: "rgba(6,3,0,0.95)", borderTop: "1px solid rgba(196,163,90,0.1)", padding: isMobile ? "8px 12px" : "7px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, overflowX: "auto" }}>

        {/* Cover button */}
        <button onClick={() => goTo(0)}
          style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: isMobile ? "7px 10px" : "5px 10px", background: "transparent", color: "rgba(196,163,90,0.45)", border: "1px solid rgba(196,163,90,0.18)", cursor: "pointer", flexShrink: 0 }}>
          Cover
        </button>

        {/* District quick-jump chips — hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1, scrollbarWidth: "none" }}>
            {Array.from(new Set(locations.map(l => l.district))).map(d => {
              const first = locations.find(l => l.district === d);
              const isActive = displayLoc?.district === d;
              return (
                <button key={d} onClick={() => first && goTo(PPC_START + (first.sno - 1) * 2)}
                  style={{ fontFamily: "var(--font-display)", fontSize: "0.46rem", letterSpacing: "0.07em", textTransform: "uppercase", padding: "4px 7px", background: isActive ? "var(--sandstone)" : "transparent", color: isActive ? "var(--spine)" : "rgba(196,163,90,0.35)", border: isActive ? "1px solid var(--gilt)" : "1px solid rgba(196,163,90,0.12)", cursor: "pointer", flexShrink: 0, transition: "all 0.1s", whiteSpace: "nowrap" }}>
                  {d.slice(0, 8)}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile: current location label */}
        {isMobile && displayLoc && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--copper)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {displayLoc.district} · {currentPage + 1}/{totalPages}
            </div>
          </div>
        )}
        {isMobile && !displayLoc && <div style={{ flex: 1 }} />}

        {/* PPC jump — always shown */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", color: "rgba(196,163,90,0.3)", letterSpacing: "0.08em" }}>GO</span>
          <input type="number" min="1" max="100" placeholder="PPC#"
            onKeyDown={e => {
              if (e.key === "Enter") {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (val >= 1 && val <= 100) { goTo(PPC_START + (val - 1) * 2); (e.target as HTMLInputElement).value = ""; }
              }
            }}
            style={{ width: isMobile ? 56 : 50, padding: "5px 6px", background: "rgba(196,163,90,0.07)", border: "1px solid rgba(196,163,90,0.18)", color: "var(--sandstone)", fontFamily: "var(--font-display)", fontSize: "0.6rem", outline: "none", textAlign: "center" }}
          />
        </div>
      </div>
    </div>
  );
}
