"use client";

import { useEffect, useState } from "react";
import { locations } from "@/lib/data";
import { getVisits } from "@/lib/visits";
import Link from "next/link";

// The signature element: a 10×10 grid of stamp tiles.
// Empty tiles look like perforation-edged blanks.
// Collected tiles become filled, dark, stamp-like squares.
// Hovering an uncollected tile shows the place name.
// This is the first thing a collector sees — exactly how they track their physical book.

export default function StampGrid() {
  const [visitedSnos, setVisitedSnos] = useState<Set<number>>(new Set());

  useEffect(() => {
    function load() {
      const v = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("philately_visits") ?? "{}")
        : {};
      setVisitedSnos(new Set(Object.keys(v).map(Number)));
    }
    load();
    window.addEventListener("philately:update", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("philately:update", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const count = visitedSnos.size;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 3 }}>
            My Stamp Collection
          </div>
          <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "1.5rem", color: "var(--ink)", lineHeight: 1 }}>
            {count} <span style={{ fontSize: "0.9rem", color: "var(--copper)" }}>of 100 collected</span>
          </div>
        </div>
        {count > 0 && (
          <div style={{
            fontFamily: "var(--font-kalam, cursive)",
            fontSize: "0.85rem",
            color: "var(--laterite)",
            fontStyle: "italic",
          }}>
            {100 - count} to go ✦
          </div>
        )}
      </div>

      {/* 10×10 grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        gap: 3,
        padding: "14px 12px",
        background: "var(--page)",
        border: "1px solid rgba(74,40,16,0.15)",
        borderRight: "1px solid rgba(26,14,6,0.2)",
        borderBottom: "1px solid rgba(26,14,6,0.2)",
      }}>
        {locations.map((loc) => {
          const visited = visitedSnos.has(loc.sno);
          return (
            <Link
              key={loc.sno}
              href={`/passport/${loc.sno}`}
              title={loc.place}
              data-place={loc.place}
              className={`stamp-tile ${visited ? "stamp-tile-filled" : "stamp-tile-empty"}`}
              style={{ textDecoration: "none" }}
            >
              {visited ? (
                <span style={{ fontSize: "0.48rem", letterSpacing: "0", textAlign: "center", lineHeight: 1.1, padding: "1px" }}>
                  {String(loc.sno).padStart(3, "0")}
                </span>
              ) : (
                <span style={{ fontSize: "0.44rem", color: "rgba(74,40,16,0.2)", letterSpacing: "0" }}>
                  {String(loc.sno).padStart(3, "0")}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Progress bar below grid */}
      <div style={{ marginTop: 8, height: 4, background: "rgba(74,40,16,0.1)", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${count}%`,
          background: "linear-gradient(90deg, var(--temple), var(--sandstone))",
          transition: "width 0.6s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", color: "var(--copper)", letterSpacing: "0.06em" }}>0</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", color: "var(--copper)", letterSpacing: "0.06em" }}>100</span>
      </div>
    </div>
  );
}
