"use client";

import Link from "next/link";
import { type Location } from "@/lib/data";
import CategoryBadge from "./CategoryBadge";
import StampCircle from "./StampCircle";
import { useEffect, useState } from "react";
import { getVisits, type Visit } from "@/lib/visits";

export default function LocationCard({ location }: { location: Location }) {
  const [visit, setVisit] = useState<Visit | null>(null);

  useEffect(() => {
    function load() { setVisit(getVisits()[location.sno] ?? null); }
    load();
    window.addEventListener("philately:update", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("philately:update", load);
      window.removeEventListener("storage", load);
    };
  }, [location.sno]);

  const visited = !!visit;

  return (
    <Link href={`/passport/${location.sno}`} className="block group h-full">
      <div className="manuscript-card overflow-hidden transition-all duration-200 cursor-pointer h-full">
        {visited && <div style={{ height: 3, background: "linear-gradient(90deg, var(--forest), var(--sandstone))" }} />}

        <div style={{ padding: "14px 14px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0 }}>
            <StampCircle visited={visited} date={visit?.visitedAt} size={66} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--temple)", fontSize: "0.88rem", lineHeight: 1.3 }}
                className="group-hover:underline">
                {location.place}
              </h3>
              <span style={{ flexShrink: 0, fontFamily: "var(--font-display)", fontSize: "0.6rem", padding: "1px 5px", background: "var(--temple)", color: "var(--sandstone)", letterSpacing: "0.06em" }}>
                {String(location.sno).padStart(3, "0")}
              </span>
            </div>

            <div style={{ fontSize: "0.68rem", color: "var(--copper)", marginBottom: 6, fontFamily: "var(--font-body)" }}>
              {location.district} · {location.pincode}
            </div>

            <CategoryBadge category={location.category} size="sm" />

            <p style={{ fontSize: "0.65rem", color: "var(--laterite)", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-body)" }}>
              {location.post_office}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
