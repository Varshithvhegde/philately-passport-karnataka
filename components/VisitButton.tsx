"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getVisits, saveVisit, removeVisit, type Visit } from "@/lib/visits";

export default function VisitButton({ sno, place }: { sno: number; place: string }) {
  const [visited, setVisited] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const v = getVisits()[sno];
    if (v) { setVisited(true); setVisit(v); setDate(v.visitedAt); setNotes(v.notes); }
  }, [sno]);

  function dispatch() { window.dispatchEvent(new Event("philately:update")); }

  function handleSave() {
    const v: Visit = { sno, visitedAt: date, notes };
    saveVisit(v); setVisit(v); setVisited(true); setOpen(false); dispatch();
  }

  function handleRemove() {
    removeVisit(sno); setVisited(false); setVisit(null); setOpen(false); dispatch();
  }

  return (
    <>
      <div>
        <button
          onClick={() => setOpen(true)}
          className="temple-btn"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 22px",
            background: visited ? "var(--forest)" : "var(--temple)",
            borderTopColor: visited ? "#2D7A44" : "var(--copper)",
            borderLeftColor: visited ? "#2D7A44" : "var(--copper)",
            color: visited ? "#A8D8B0" : "var(--manuscript)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            {visited
              ? <path d="M1.5 6.5l3.2 3.2L11.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              : <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>}
          </svg>
          {visited ? "Stamp Collected" : "Record Visit"}
        </button>

        {visited && visit && (
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", color: "var(--copper)", marginTop: 5, letterSpacing: "0.04em" }}>
            ✦ Collected {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(26,14,6,0.72)" }}>
          <div className="w-full max-w-md relative manuscript-card" style={{ padding: "0 0 24px" }}>
            <div className="hoysala-rule" />
            <div style={{ padding: "20px 24px 0" }}>
              <button onClick={() => setOpen(false)} className="absolute top-5 right-5" style={{ color: "var(--copper)" }}>
                <X size={16} />
              </button>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>
                {visited ? "Update Record" : "Record Visit"}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--temple)", marginBottom: 18 }}>
                {place}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>Visit Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "var(--manuscript)", border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.875rem", outline: "none" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="What did you see? Any memories…"
                  style={{ width: "100%", padding: "8px 10px", background: "var(--manuscript)", border: "1px solid var(--sandstone)", borderRightColor: "#1A0E06", borderBottomColor: "#1A0E06", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.875rem", resize: "none", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSave} className="temple-btn" style={{ flex: 1, padding: "9px 0" }}>
                  {visited ? "Update" : "Save Visit"}
                </button>
                {visited && (
                  <button onClick={handleRemove}
                    style={{ padding: "9px 16px", background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", borderRightColor: "#060300", borderBottomColor: "#060300", fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.08em", cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="hoysala-rule-thin mt-5" />
          </div>
        </div>
      )}
    </>
  );
}
