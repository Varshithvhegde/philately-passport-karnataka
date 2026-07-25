"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type Location, CATEGORY_COLORS } from "@/lib/data";
import { getVisits, type Visit } from "@/lib/visits";

export const DISTRICT_COLORS: Record<string, string> = {
  "Bagalkot":         "#C4A35A",
  "Ballari":          "#E07B39",
  "Belagavi":         "#D4595A",
  "Bengaluru":        "#9B59B6",
  "Bidar":            "#E67E22",
  "Chamarajanagara":  "#27AE60",
  "Chikkaballapura":  "#2980B9",
  "Chikkamagaluru":   "#16A085",
  "Chitradurga":      "#C0392B",
  "Dakshina Kannada": "#1ABC9C",
  "Davanagere":       "#8E44AD",
  "Dharwad":          "#D35400",
  "Gadag":            "#F39C12",
  "Hassan":           "#2ECC71",
  "Haveri":           "#3498DB",
  "Kalaburgi":        "#E74C3C",
  "Kodagu":           "#1A8F5A",
  "Kolar":            "#7F8C8D",
  "Koppal":           "#B7950B",
  "Mandya":           "#117A65",
  "Mysuru":           "#6C3483",
  "Raichur":          "#A04000",
  "Ramanagara":       "#154360",
  "Shivamogga":       "#0E6655",
  "Tumakuru":         "#784212",
  "Udupi":            "#1F618D",
  "Uttara Kannada":   "#922B21",
  "Vijayanagara":     "#7D6608",
  "Vijayapura":       "#4A235A",
  "Yadagiri":         "#196F3D",
};

export type ColorMode = "category" | "district";

interface Props {
  locations: Location[];
  highlightSno?: number;
  colorMode?: ColorMode;
  showBoundaries?: boolean;
  highlightDistrict?: string;
  onSelect?: (loc: Location) => void;
}

// Hex → rgba with given opacity
function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function MapComponent({
  locations,
  highlightSno,
  colorMode = "category",
  showBoundaries = true,
  highlightDistrict,
  onSelect,
}: Props) {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef     = useRef<Map<number, import("leaflet").CircleMarker>>(new Map());
  const boundaryLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const onSelectRef    = useRef(onSelect);
  onSelectRef.current  = onSelect;

  const [visits,   setVisits]   = useState<Record<number, Visit>>({});
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    function load() { setVisits(getVisits()); }
    load();
    window.addEventListener("philately:update", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("philately:update", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // ── Init map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if ((mapRef.current as unknown as Record<string, unknown>)._leaflet_id) return;
    if (mapInstanceRef.current) return;

    const container = mapRef.current;

    import("leaflet").then((L) => {
      if (!container || (container as unknown as Record<string, unknown>)._leaflet_id) return;

      const map = L.map(container, {
        center: [15.3173, 75.7139],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);

      L.control.attribution({ position: "bottomright", prefix: "© CartoDB" }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      delete (container as unknown as Record<string, unknown>)._leaflet_id;
      markersRef.current.clear();
      boundaryLayerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── District boundary choropleth layer ────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old boundary layer
    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.remove();
      boundaryLayerRef.current = null;
    }

    if (!showBoundaries) return;

    // Count how many PPC locations each district has (for fill intensity)
    const districtCounts: Record<string, number> = {};
    for (const loc of locations) {
      districtCounts[loc.district] = (districtCounts[loc.district] ?? 0) + 1;
    }
    const maxCount = Math.max(...Object.values(districtCounts), 1);

    import("leaflet").then(async (L) => {
      const resp = await fetch("/karnataka_districts.geojson");
      if (!resp.ok) return;
      const geoData = await resp.json();

      const layer = L.geoJSON(geoData, {
        style: (feature) => {
          const name  = feature?.properties?.district as string ?? "";
          const count = districtCounts[name] ?? 0;
          const baseColor = DISTRICT_COLORS[name] ?? "#C4A35A";
          const isHighlighted = highlightDistrict && name === highlightDistrict;

          if (count === 0) {
            return {
              fillColor:   "#EAD9B8",
              fillOpacity: 0.15,
              color:       "#B8722A",
              weight:      0.8,
              dashArray:   "4 3",
              opacity:     0.4,
            };
          }

          const intensity = 0.12 + (count / maxCount) * 0.28;
          return {
            fillColor:   baseColor,
            fillOpacity: isHighlighted ? 0.55 : intensity,
            color:       isHighlighted ? "#1A0E06" : hexAlpha(baseColor, 0.7),
            weight:      isHighlighted ? 2.5 : 1.2,
            opacity:     0.9,
          };
        },
        onEachFeature: (feature, lyr) => {
          const name  = feature?.properties?.district as string ?? "";
          const count = districtCounts[name] ?? 0;
          lyr.bindTooltip(
            `<div style="font-family:serif;font-size:0.78rem;padding:3px 7px;background:#F8F0D8;border:1px solid #C4A35A;color:#4A2810">
               <strong>${name}</strong> · ${count} location${count !== 1 ? "s" : ""}
             </div>`,
            { sticky: true, opacity: 0.97 }
          );
        },
      });

      // Keep boundaries below markers
      layer.addTo(map);
      layer.bringToBack();
      boundaryLayerRef.current = layer;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, showBoundaries, locations, highlightDistrict]);

  const getMarkerColor = useCallback((loc: Location, isVis: boolean) => {
    if (isVis) return "#1C4A2E";
    if (colorMode === "district") return DISTRICT_COLORS[loc.district] ?? "#C4A35A";
    return CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  }, [colorMode]);

  // ── Sync markers on locations / visits / colorMode change ─────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const visibleSnos = new Set(locations.map((l) => l.sno));

      markersRef.current.forEach((marker, sno) => {
        if (!visibleSnos.has(sno)) {
          marker.remove();
          markersRef.current.delete(sno);
        }
      });

      locations.forEach((loc) => {
        const isVis  = !!visits[loc.sno];
        const fill   = getMarkerColor(loc, isVis);
        const border = isVis ? "#0A2014" : "#2A1A0A";

        if (markersRef.current.has(loc.sno)) {
          markersRef.current.get(loc.sno)!.setStyle({
            fillColor: fill, color: border,
            fillOpacity: isVis ? 0.95 : 0.88,
          });
        } else {
          const vis = visits[loc.sno];
          const mapsUrl = `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
          const popup = `
            <div style="font-family:serif;padding:12px 14px;min-width:175px;max-width:220px">
              <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;color:#7A3B0F;margin-bottom:4px">PPC #${String(loc.sno).padStart(3,"0")} · ${loc.district}</div>
              <div style="font-weight:700;color:#1A0E06;font-size:0.92rem;line-height:1.25;margin-bottom:6px">${loc.place}</div>
              <div style="font-size:0.68rem;display:inline-block;padding:1px 8px;background:#EAD9B8;color:#4A2810;border:1px solid rgba(196,163,90,0.4);margin-bottom:8px">${loc.category}</div>
              ${vis ? `<div style="color:#1C4A2E;font-size:0.68rem;font-weight:600;margin-bottom:6px">✓ Visited ${new Date(vis.visitedAt+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>` : ""}
              <div style="border-top:1px solid rgba(196,163,90,0.3);padding-top:8px;display:flex;gap:12px;align-items:center">
                <a href="/passport/${loc.sno}" style="color:#4A2810;font-size:0.68rem;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em">View Page →</a>
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color:#7A3B0F;font-size:0.65rem;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em">Maps ↗</a>
              </div>
            </div>
          `;

          const marker = L.circleMarker([loc.latitude, loc.longitude], {
            radius: 7, fillColor: fill, color: border,
            weight: isVis ? 2.5 : 1.5, opacity: 1,
            fillOpacity: isVis ? 0.95 : 0.88,
          });

          marker.bindPopup(popup, { maxWidth: 230, minWidth: 175 });
          marker.on("click", () => onSelectRef.current?.(loc));
          marker.addTo(map);
          markersRef.current.set(loc.sno, marker);
        }
      });
    });
  }, [locations, visits, mapReady, getMarkerColor]);

  // ── Pan to highlighted marker ─────────────────────────────────────
  useEffect(() => {
    if (!highlightSno || !mapInstanceRef.current) return;
    const marker = markersRef.current.get(highlightSno);
    if (marker) {
      mapInstanceRef.current.setView(marker.getLatLng(), 12, { animate: true });
      marker.openPopup();
    }
  }, [highlightSno]);

  return (
    <div ref={mapRef} className="w-full h-full"
      style={{ minHeight: 480, border: "2px solid #4A2810", borderRight: "2px solid #0A0502", borderBottom: "2px solid #0A0502" }}
    />
  );
}
