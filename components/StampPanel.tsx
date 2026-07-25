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

export default function StampPanel({ sno, place, district, category }: Props) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [inkRing, setInkRing] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const stampRef = useRef<HTMLDivElement>(null);

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
    // Trigger ink-drop animation
    setAnimating(true);
    setInkRing(true);
    setTimeout(() => setInkRing(false), 700);
    setTimeout(() => setAnimating(false), 600);
    dispatch();
  }

  function handleRemove() {
    removeVisit(sno);
    setVisit(null);
    setShowModal(false);
    dispatch();
  }

  const visited = !!visit;

  return (
    <>
      {/* ── Stamp display area ─────────────────────────────────── */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Parchment stamp container */}
        <div style={{
          width: "100%",
          padding: "28px 20px 20px",
          background: visited
            ? "linear-gradient(160deg, #F8F0D8 0%, #EFE3BC 100%)"
            : "linear-gradient(160deg, #FDFAF0 0%, #F5EDD8 100%)",
          border: visited ? "2px solid #B8722A" : "2px dashed rgba(196,163,90,0.4)",
          borderRight: visited ? "2px solid #1A0E06" : "2px dashed rgba(196,163,90,0.4)",
          borderBottom: visited ? "2px solid #1A0E06" : "2px dashed rgba(196,163,90,0.4)",
          textAlign: "center",
          transition: "all 0.4s",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Header label */}
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.2em",
            textTransform: "uppercase", color: "var(--copper)", marginBottom: 16,
          }}>
            Pictorial Cancellation Stamp
          </div>

          {/* Ink ring splash (appears on stamp) */}
          {inkRing && (
            <div className="ink-ring" style={{
              position: "absolute", top: "50%", left: "50%",
              width: 200, height: 200,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(196,163,90,0.3) 0%, transparent 70%)",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }} />
          )}

          {/* Stamp SVG */}
          <div ref={stampRef} style={{ display: "flex", justifyContent: "center" }}>
            <ThemedStamp
              category={category}
              place={place}
              district={district}
              date={visit?.visitedAt}
              size={170}
              visited={visited}
              animated={animating}
            />
          </div>

          {/* Visited date label */}
          {visited && visit && (
            <div className="fade-in-up" style={{
              marginTop: 14,
              fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.08em",
              color: "var(--copper)",
            }}>
              ✦ Collected on {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
          )}

          {!visited && (
            <div style={{ marginTop: 14, fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--laterite)" }}>
              Visit this post office to collect your stamp
            </div>
          )}
        </div>

        {/* ── Action button ──────────────────────────────────────── */}
        <button
          onClick={() => setShowModal(true)}
          className={visited ? "" : "temple-btn"}
          style={{
            marginTop: 14, width: "100%", padding: "11px 0",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "var(--font-display)", fontSize: "0.78rem", letterSpacing: "0.1em",
            textTransform: "uppercase", cursor: "pointer",
            background: visited ? "#1C4A2E" : undefined,
            color: visited ? "#A8D8B0" : undefined,
            border: visited ? "1px solid #2D7A44" : undefined,
            borderRight: visited ? "1px solid #060300" : undefined,
            borderBottom: visited ? "1px solid #060300" : undefined,
            transition: "all 0.15s",
          }}
        >
          {visited ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Stamp Collected — Edit
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Record Visit & Get Stamp
            </>
          )}
        </button>

        {/* Notes preview */}
        {visited && visit?.notes && (
          <div style={{
            marginTop: 10, width: "100%", padding: "8px 10px",
            background: "var(--manuscript)", border: "1px solid rgba(196,163,90,0.3)",
            fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--laterite)",
            fontStyle: "italic", lineHeight: 1.5,
          }}>
            "{visit.notes}"
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(26,14,6,0.78)" }}>
          <div className="w-full max-w-md relative manuscript-card" style={{ padding: 0 }}>
            <div className="hoysala-rule" />
            <div style={{ padding: "22px 26px 26px" }}>
              <button onClick={() => setShowModal(false)}
                className="absolute top-5 right-5" style={{ color: "var(--copper)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={16} />
              </button>

              {/* Modal stamp preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <ThemedStamp category={category} place={place} district={district}
                  date={date} size={70} visited={true} />
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>
                    {visited ? "Update Record" : "Record Your Visit"}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.2 }}>
                    {place}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--copper)", marginTop: 2 }}>
                    {district}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>
                  Visit Date
                </label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: "100%", padding: "9px 10px", background: "var(--manuscript)", border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.875rem", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>
                  Your Memory (optional)
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="What did you see? How was the journey there?"
                  style={{ width: "100%", padding: "9px 10px", background: "var(--manuscript)", border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.875rem", resize: "none", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSave} className="temple-btn" style={{ flex: 1, padding: "10px 0" }}>
                  {visited ? "Update Stamp" : "Stamp It! 🔖"}
                </button>
                {visited && (
                  <button onClick={handleRemove}
                    style={{ padding: "10px 14px", background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", borderRightColor: "#060300", borderBottomColor: "#060300", fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.08em", cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="hoysala-rule-thin" />
          </div>
        </div>
      )}
    </>
  );
}
