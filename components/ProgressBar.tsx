"use client";

import { useEffect, useState } from "react";
import { getVisitCount } from "@/lib/visits";

const TOTAL = 100;

export default function ProgressBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getVisitCount());

    function onStorage() { setCount(getVisitCount()); }
    window.addEventListener("storage", onStorage);
    window.addEventListener("philately:update", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("philately:update", onStorage);
    };
  }, []);

  const pct = Math.round((count / TOTAL) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "#5C3317", fontSize: "0.85rem" }}>
          Journey Progress
        </span>
        <span style={{ fontWeight: 700, color: "#8B4513", fontSize: "0.85rem" }}>
          {count} / {TOTAL}
        </span>
      </div>
      <div className="rounded-full overflow-hidden h-3" style={{ background: "#EAD9B8" }}>
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #8B4513, #C4A35A)",
          }}
        />
      </div>
      <p className="mt-1 text-xs" style={{ color: "#8B4513" }}>
        {pct}% complete — {TOTAL - count} locations remaining
      </p>
    </div>
  );
}
