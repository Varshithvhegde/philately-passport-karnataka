"use client";

import Link from "next/link";
import { type Location, CATEGORY_COLORS } from "@/lib/data";
import StampCircle from "./StampCircle";
import { useEffect, useState } from "react";
import { getVisits, type Visit } from "@/lib/visits";

// Each card mirrors one page of the physical passport:
//   top: district label + PPC number  (like the printed header on each page)
//   left: place name + classification  (left column of the page)
//   right: stamp circle               (the stamp slot on the right side)
//   bottom: post office address line   (footer of the page)

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
  const catColor = CATEGORY_COLORS[location.category] ?? "#C4A35A";

  return (
    <Link href={`/passport/${location.sno}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--page)",
          // Left binding spine — like the physical booklet
          borderLeft: `4px solid ${visited ? "var(--forest)" : "var(--temple)"}`,
          borderTop: "1px solid rgba(196,163,90,0.35)",
          borderRight: "1px solid rgba(26,14,6,0.18)",
          borderBottom: "1px solid rgba(26,14,6,0.18)",
          boxShadow: visited
            ? "2px 3px 10px rgba(28,74,46,0.18)"
            : "2px 3px 10px rgba(26,14,6,0.12)",
          overflow: "hidden",
          transition: "box-shadow 0.18s, transform 0.14s",
          cursor: "pointer",
          // Paper grain
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundColor: "var(--page)",
        }}
        className="group"
      >
        {/* Page header — district + PPC number */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 10px 5px",
          background: visited ? "var(--forest)" : "var(--temple)",
          borderBottom: visited ? "1px solid rgba(28,74,46,0.4)" : "1px solid rgba(196,163,90,0.2)",
        }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.52rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: visited ? "rgba(168,213,181,0.85)" : "rgba(196,163,90,0.75)",
          }}>
            {location.district}
          </span>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.55rem",
            letterSpacing: "0.08em",
            color: visited ? "#A8D5B5" : "var(--sandstone)",
            fontWeight: 600,
          }}>
            {String(location.sno).padStart(3, "0")}
          </span>
        </div>

        {/* Page body */}
        <div style={{ flex: 1, display: "flex", gap: 10, padding: "11px 11px 8px", alignItems: "flex-start" }}>
          {/* Left: text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "var(--temple)",
              fontSize: "0.85rem",
              lineHeight: 1.3,
              marginBottom: 5,
              // On hover, slight underline like a real hyperlink in an index
            }}
              className="group-hover:underline"
            >
              {location.place}
            </h3>

            {/* Classification label */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "1px 6px",
              background: `${catColor}18`,
              border: `1px solid ${catColor}50`,
              marginBottom: 6,
            }}>
              <span style={{ fontSize: "0.7em" }}>
                {location.category === "Monument"              ? "🏛"
                : location.category === "Flora and Fauna"      ? "🌿"
                : location.category === "Personality"          ? "✦"
                : location.category === "Natural Heritage"     ? "🌄"
                : location.category.includes("Celebration")   ? "🎉"
                : location.category === "Science & Technology" ? "⚙"
                : location.category === "Industry"             ? "⚙"
                : location.category.includes("Weapon")        ? "⚔"
                : location.category === "Natural Stream"       ? "💧"
                : "•"}
              </span>
              <span style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.58rem",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: catColor,
              }}>
                {location.category}
              </span>
            </div>

            {/* Post office — like the page footer */}
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              color: "var(--laterite)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              opacity: 0.8,
            }}>
              {location.post_office}
            </p>
          </div>

          {/* Right: stamp slot */}
          <div style={{ flexShrink: 0 }}>
            <StampCircle visited={visited} date={visit?.visitedAt} size={56} sno={location.sno} />
          </div>
        </div>

        {/* If visited — handwritten date note at bottom */}
        {visited && visit && (
          <div style={{
            padding: "4px 11px 7px",
            borderTop: "1px dashed rgba(28,74,46,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}>
            <span style={{ color: "var(--forest)", fontSize: "0.65rem" }}>✓</span>
            <span style={{
              fontFamily: "var(--font-kalam, cursive)",
              fontSize: "0.72rem",
              color: "var(--forest)",
            }}>
              {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
