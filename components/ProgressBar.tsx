"use client";

import { useEffect, useState } from "react";
import { getVisitCount } from "@/lib/visits";

export default function ProgressBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function load() { setCount(getVisitCount()); }
    load();
    window.addEventListener("philately:update", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("philately:update", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const pct = Math.round((count / 100) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--copper)" }}>
            Journey Progress
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "1.7rem", lineHeight: 1, marginTop: 2 }}>
            {count}<span style={{ fontSize: "0.85rem", color: "var(--copper)", marginLeft: 6 }}>/ 100 collected</span>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 700, color: pct > 0 ? "var(--sandstone)" : "var(--stone)", lineHeight: 1 }}>
          {pct}<span style={{ fontSize: "1rem" }}>%</span>
        </div>
      </div>
      <div style={{ height: 10, background: "#EAD9B8", border: "1px solid rgba(122,59,15,0.3)", position: "relative", overflow: "hidden" }}>
        {pct > 0 && (
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, #4A2810, #7A3B0F 45%, #C4A35A)",
            borderRight: "2px solid #1A0E06",
            transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
          }} />
        )}
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", color: "var(--copper)", marginTop: 4, letterSpacing: "0.04em" }}>
        {100 - count} locations remaining · Karnataka Philately Passport V3
      </p>
    </div>
  );
}
