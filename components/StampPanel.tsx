"use client";

import { useState, useEffect, useRef } from "react";
import { getVisits, saveVisit, removeVisit, type Visit } from "@/lib/visits";
import ThemedStamp from "./ThemedStamp";
import { type Category } from "@/lib/data";
import { X } from "lucide-react";

interface Props {
  sno: number;
  place: string;
  district: string;
  category: Category | string;
}

// ── Category accent colours (for envelope seal / flap tint) ──────
const CAT_COLOR: Record<string, string> = {
  "Monument":               "#C4A35A",
  "Flora and Fauna":        "#4A7C59",
  "Personality":            "#6D4C9C",
  "Natural Heritage":       "#2A6B8A",
  "Heritage Celebration":   "#C05C1A",
  "Heritage & Celebration": "#C05C1A",
  "Science & Technology":   "#1A5276",
  "Industry":               "#7D6608",
  "Weapons":                "#922B21",
  "Weapon and Attire":      "#922B21",
  "Natural Stream":         "#1F618D",
};

export default function StampPanel({ sno, place, district, category }: Props) {
  const [visit,       setVisit]       = useState<Visit | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [animating,   setAnimating]   = useState(false);
  const [inkRing,     setInkRing]     = useState(false);
  const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
  const [notes,       setNotes]       = useState("");
  const [flapOpen,    setFlapOpen]    = useState(false);  // envelope flap state
  const [sealPulse,   setSealPulse]   = useState(false);  // seal animation
  const envelopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = getVisits()[sno];
    if (v) { setVisit(v); setDate(v.visitedAt); setNotes(v.notes); }
  }, [sno]);

  function dispatch() { window.dispatchEvent(new Event("philately:update")); }

  function handleSave() {
    const v: Visit = { sno, visitedAt: date, notes };
    saveVisit(v);
    setVisit(v);
    setShowModal(false);
    // Sequence: stamp drops → ink spreads → seal pulse
    setAnimating(true);
    setInkRing(true);
    setTimeout(() => setInkRing(false), 800);
    setTimeout(() => setAnimating(false), 700);
    setTimeout(() => setSealPulse(true), 300);
    setTimeout(() => setSealPulse(false), 900);
    dispatch();
  }

  function handleRemove() {
    removeVisit(sno); setVisit(null); setShowModal(false); dispatch();
  }

  function openModal() {
    // Flap opens → then modal appears
    setFlapOpen(true);
    setTimeout(() => setShowModal(true), 350);
  }

  function closeModal() {
    setShowModal(false);
    setTimeout(() => setFlapOpen(false), 200);
  }

  const visited  = !!visit;
  const catColor = CAT_COLOR[category] ?? "#C4A35A";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          THE ENVELOPE
          Structure:
            - envelope body (parchment, airmail border)
            - envelope flap (triangular top, rotates on perspective)
            - stamp slot inside
            - action button at bottom
      ═══════════════════════════════════════════════════════════ */}
      <div ref={envelopeRef} style={{ position: "relative", width: "100%" }}>

        {/* ── Envelope body ────────────────────────────────────────── */}
        <div style={{
          position: "relative",
          background: "var(--page)",
          /* Real airmail border */
          border: "2.5px solid transparent",
          backgroundImage: `
            linear-gradient(var(--page), var(--page)),
            repeating-linear-gradient(
              -45deg,
              #C4391A 0px, #C4391A 4px,
              transparent 4px, transparent 6px,
              #0D1F3A 6px, #0D1F3A 10px,
              transparent 10px, transparent 12px
            )`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: visited
            ? `0 4px 20px rgba(28,74,46,0.2), 0 1px 4px rgba(28,74,46,0.1)`
            : `0 4px 16px rgba(26,14,6,0.15), 0 1px 3px rgba(26,14,6,0.08)`,
          transition: "box-shadow 0.3s",
          overflow: "visible",
        }}>

          {/* Flap — triangular / trapezoidal top */}
          <div style={{
            position: "absolute",
            top: -1, left: -2.5, right: -2.5,
            height: 44,
            zIndex: 10,
            overflow: "hidden",
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            animation: flapOpen ? "flap-open 0.35s ease-in forwards" : (flapOpen === false && showModal === false ? "" : ""),
          }}>
            <svg width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
              {/* Flap background — slightly darker parchment */}
              <polygon points="0,0 220,0 220,2 110,44 0,2" fill="#EDE1BF"/>
              {/* Flap airmail lines (top edge only) */}
              <line x1="0" y1="1" x2="220" y2="1" stroke="transparent" strokeWidth="0"/>
              {/* Flap inner fold crease */}
              <line x1="0" y1="4" x2="110" y2="44" stroke="rgba(122,59,15,0.15)" strokeWidth="0.8"/>
              <line x1="220" y1="4" x2="110" y2="44" stroke="rgba(122,59,15,0.15)" strokeWidth="0.8"/>
              {/* Flap diagonal V line */}
              <polyline points="0,2 110,42 220,2" fill="none" stroke="rgba(122,59,15,0.25)" strokeWidth="0.8"/>
            </svg>
            {/* Seal dot on flap — shows category colour */}
            <div style={{
              position: "absolute",
              bottom: 8, left: "50%", transform: "translateX(-50%)",
              width: 12, height: 12, borderRadius: "50%",
              background: catColor,
              border: "1.5px solid rgba(26,14,6,0.2)",
              boxShadow: `0 0 0 2px rgba(255,255,255,0.4)`,
              opacity: 0.7,
            }} />
          </div>

          {/* Envelope interior — stamp slot area */}
          <div style={{ padding: "52px 16px 14px", textAlign: "center" }}>

            {/* FROM/TO labels — like an actual envelope */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              marginBottom: 12, padding: "0 2px",
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>From</div>
                <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.72rem", color: "var(--ink-mid)", lineHeight: 1.3 }}>
                  Karnataka Philately<br/>Passport V3
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>To</div>
                <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.72rem", color: "var(--ink-mid)", lineHeight: 1.3 }}>
                  {place}<br/>
                  <span style={{ fontSize: "0.62rem", color: "var(--laterite)" }}>{district}</span>
                </div>
              </div>
            </div>

            {/* Stamp zone — dashed box with "affix stamp here" */}
            <div style={{
              position: "relative",
              margin: "0 auto 12px",
              width: "fit-content",
            }}>
              {/* Ink rings (appear on stamp) */}
              {inkRing && (
                <>
                  <div className="ink-ring" style={{
                    position: "absolute", top: "50%", left: "50%",
                    width: 180, height: 180, borderRadius: "50%",
                    background: `radial-gradient(circle, ${catColor}40 0%, transparent 70%)`,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none", zIndex: 20,
                  }}/>
                  <div className="ink-ring-2" style={{
                    position: "absolute", top: "50%", left: "50%",
                    width: 140, height: 140, borderRadius: "50%",
                    background: `radial-gradient(circle, ${catColor}30 0%, transparent 70%)`,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none", zIndex: 20,
                  }}/>
                </>
              )}

              <ThemedStamp
                category={category}
                place={place}
                district={district}
                date={visit?.visitedAt}
                size={155}
                visited={visited}
                animated={animating}
              />
            </div>

            {/* Collected date — handwritten style */}
            {visited && visit && (
              <div className="fade-in-up" style={{
                fontFamily: "var(--font-kalam, cursive)",
                fontSize: "0.82rem",
                color: "var(--forest)",
                letterSpacing: "0.01em",
                marginBottom: 4,
              }}>
                ✓ collected {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            )}

            {!visited && (
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(122,59,15,0.45)", marginBottom: 4 }}>
                Affix your stamp here
              </div>
            )}

            {/* Notes preview */}
            {visited && visit?.notes && (
              <div style={{
                margin: "6px 4px 0", padding: "6px 10px",
                background: "rgba(240,228,192,0.6)",
                border: "1px dashed rgba(122,59,15,0.25)",
                fontFamily: "var(--font-kalam, cursive)", fontSize: "0.75rem",
                color: "var(--laterite)", fontStyle: "italic", lineHeight: 1.5, textAlign: "left",
              }}>
                "{visit.notes}"
              </div>
            )}
          </div>

          {/* Bottom of envelope — address line stripe */}
          <div style={{
            borderTop: "1px solid rgba(196,163,90,0.25)",
            background: "rgba(240,228,192,0.3)",
            padding: "8px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)" }}>
              India Post · Karnataka Circle
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "var(--laterite)", letterSpacing: "0.08em" }}>
              PIN {/* pincode shown via parent */}
            </div>
          </div>
        </div>

        {/* ── CTA Button — below the envelope ─────────────────────── */}
        <button
          onClick={openModal}
          className={visited ? "envelope-wiggle" : ""}
          onMouseEnter={e => { if (!visited) e.currentTarget.classList.add("envelope-wiggle"); }}
          onAnimationEnd={e => e.currentTarget.classList.remove("envelope-wiggle")}
          style={{
            marginTop: 10, width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "11px 0",
            fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: "pointer",
            background: visited ? "#1C4A2E" : "var(--spine)",
            color: visited ? "#A8D8B0" : "var(--sandstone)",
            border: visited ? "1px solid #2D7A44" : "1px solid rgba(196,163,90,0.3)",
            borderRight: "1px solid rgba(26,14,6,0.25)",
            borderBottom: "1px solid rgba(26,14,6,0.25)",
            transition: "all 0.15s",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Envelope icon */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect x="0.5" y="0.5" width="15" height="11" rx="0" stroke="currentColor" strokeWidth="1"/>
            <polyline points="0.5,0.5 8,7 15.5,0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          {visited ? "Update Stamp Record" : "Record Visit & Get Stamp"}

          {/* Seal badge — shown when visited */}
          {visited && (
            <span className={sealPulse ? "seal-animate" : ""} style={{
              position: "absolute", right: 12,
              width: 20, height: 20, borderRadius: "50%",
              background: catColor,
              border: "1.5px solid rgba(26,14,6,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.55rem",
            }}>
              ✓
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL — styled as an open letter / inland letter card
      ═══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(13,31,58,0.82)" }}>

          <div className="w-full max-w-md relative" style={{
            /* Airmail border on the modal itself */
            border: "3px solid transparent",
            backgroundImage: `
              linear-gradient(var(--page), var(--page)),
              repeating-linear-gradient(
                -45deg,
                #C4391A 0px, #C4391A 4px,
                transparent 4px, transparent 6px,
                #0D1F3A 6px, #0D1F3A 10px,
                transparent 10px, transparent 12px
              )`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            boxShadow: "0 20px 60px rgba(13,31,58,0.5)",
          }}>

            {/* Modal header */}
            <div style={{
              background: "var(--spine)",
              padding: "10px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Postal horn */}
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1.2" fill="none"/>
                  <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A" fillOpacity="0.7"/>
                </svg>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,163,90,0.8)" }}>
                  {visited ? "Update Record" : "Record Visit"}
                </span>
              </div>
              <button onClick={closeModal}
                style={{ color: "rgba(196,163,90,0.6)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
                <X size={15}/>
              </button>
            </div>

            <div style={{ padding: "20px 22px 22px", background: "var(--page)" }}>

              {/* Stamp preview + place name — side by side */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "10px 12px", background: "rgba(240,228,192,0.5)", border: "1px solid rgba(196,163,90,0.25)" }}>
                <ThemedStamp
                  category={category} place={place} district={district}
                  date={date} size={72} visited={true}
                />
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>
                    Cancelling stamp for
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.2 }}>
                    {place}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--copper)", marginTop: 2 }}>
                    {district} District
                  </div>
                </div>
              </div>

              {/* Date field */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>
                  Date of Visit
                </label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "var(--ivory)", border: "1px solid rgba(196,163,90,0.45)", borderRightColor: "rgba(26,14,6,0.18)", borderBottomColor: "rgba(26,14,6,0.18)", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>

              {/* Notes field — styled as a letter writing area with ruled lines */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>
                  Your Notes
                </label>
                <div style={{ position: "relative" }}>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                    placeholder="What did you see? How was the journey there?"
                    style={{
                      width: "100%", padding: "8px 10px",
                      background: "var(--ivory)",
                      /* Ruled line background */
                      backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(122,59,15,0.08) 27px, rgba(122,59,15,0.08) 28px)",
                      backgroundPositionY: "8px",
                      border: "1px solid rgba(196,163,90,0.45)", borderRightColor: "rgba(26,14,6,0.18)", borderBottomColor: "rgba(26,14,6,0.18)",
                      color: "var(--ink)", fontFamily: "var(--font-kalam, cursive)", fontSize: "0.95rem",
                      resize: "none", outline: "none", lineHeight: 1.75, boxSizing: "border-box" as const,
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSave}
                  style={{
                    flex: 1, padding: "10px 0",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "var(--spine)", color: "var(--sandstone)",
                    border: "1px solid rgba(196,163,90,0.3)", borderRightColor: "rgba(26,14,6,0.25)", borderBottomColor: "rgba(26,14,6,0.25)",
                    fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                  {/* Stamp icon */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5"/>
                    <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                  </svg>
                  {visited ? "Update Record" : "Stamp It"}
                </button>

                {visited && (
                  <button onClick={handleRemove}
                    style={{ padding: "10px 14px", background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", borderRightColor: "#060300", borderBottomColor: "#060300", fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
