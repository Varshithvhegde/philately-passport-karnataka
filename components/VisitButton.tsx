"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, X } from "lucide-react";
import { getVisits, saveVisit, removeVisit, type Visit } from "@/lib/visits";

interface Props {
  sno: number;
  place: string;
}

export default function VisitButton({ sno, place }: Props) {
  const [visited, setVisited] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const visits = getVisits();
    if (visits[sno]) {
      setVisited(true);
      setVisit(visits[sno]);
      setDate(visits[sno].visitedAt);
      setNotes(visits[sno].notes);
    }
  }, [sno]);

  function dispatch() {
    window.dispatchEvent(new Event("philately:update"));
  }

  function handleSave() {
    const v: Visit = { sno, visitedAt: date, notes };
    saveVisit(v);
    setVisit(v);
    setVisited(true);
    setOpen(false);
    dispatch();
  }

  function handleRemove() {
    removeVisit(sno);
    setVisited(false);
    setVisit(null);
    setOpen(false);
    dispatch();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
        style={
          visited
            ? { background: "#4A7C59", color: "#fff", border: "none" }
            : { background: "#5C3317", color: "#F5E9CC", border: "none" }
        }
      >
        {visited ? <CheckCircle size={15} /> : <Circle size={15} />}
        {visited ? "Visited" : "Mark as Visited"}
      </button>

      {visited && visit && (
        <p className="text-xs mt-1" style={{ color: "#8B4513" }}>
          Visited on {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(44,24,16,0.55)" }}>
          <div className="w-full max-w-md rounded-xl p-6 relative stone-card" style={{ border: "2px solid #C4A35A" }}>
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3" style={{ color: "#8B4513" }}>
              <X size={18} />
            </button>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "#5C3317", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              {visited ? "Update Visit" : "Record Your Visit"}
            </h3>
            <p className="text-sm mb-4" style={{ color: "#8B4513" }}>{place}</p>

            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C3317" }}>Visit Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm mb-4 outline-none"
              style={{ border: "1px solid #C4A35A", background: "#FFFAF0", color: "#2C1810" }}
            />

            <label className="block text-xs font-semibold mb-1" style={{ color: "#5C3317" }}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What did you see? Any memories..."
              className="w-full rounded-lg px-3 py-2 text-sm mb-4 resize-none outline-none"
              style={{ border: "1px solid #C4A35A", background: "#FFFAF0", color: "#2C1810" }}
            />

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#5C3317", color: "#F5E9CC" }}
              >
                {visited ? "Update" : "Save Visit"}
              </button>
              {visited && (
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "#F8D7DA", color: "#922B21" }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
