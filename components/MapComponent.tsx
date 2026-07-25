"use client";

import { useEffect, useRef, useState } from "react";
import { type Location, CATEGORY_COLORS } from "@/lib/data";
import { getVisits } from "@/lib/visits";

interface Props {
  locations: Location[];
  highlightSno?: number;
  onSelect?: (loc: Location) => void;
}

export default function MapComponent({ locations, highlightSno, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<number, import("leaflet").CircleMarker>>(new Map());
  const [visits, setVisits] = useState<Record<number, import("@/lib/visits").Visit>>({});

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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Karnataka center
      const map = L.map(mapRef.current!, {
        center: [15.3173, 75.7139],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© CartoDB",
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      locations.forEach((loc) => {
        const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
        const vis = visits[loc.sno];
        const isVis = !!vis;

        const marker = L.circleMarker([loc.latitude, loc.longitude], {
          radius: highlightSno === loc.sno ? 14 : 8,
          fillColor: isVis ? "#4A7C59" : color,
          color: isVis ? "#2D5A3D" : "#5C3317",
          weight: isVis ? 2 : 1,
          opacity: 1,
          fillOpacity: isVis ? 0.9 : 0.75,
        });

        const popupContent = `
          <div style="font-family:serif; min-width:160px">
            <div style="font-weight:700;color:#5C3317;font-size:0.9rem;margin-bottom:4px">${loc.place}</div>
            <div style="color:#8B4513;font-size:0.75rem;margin-bottom:4px">${loc.district} · ${loc.pincode}</div>
            <div style="font-size:0.72rem;padding:2px 6px;border-radius:999px;background:#EAD9B8;color:#5C3317;display:inline-block;margin-bottom:4px">${loc.category}</div>
            ${isVis ? `<div style="color:#4A7C59;font-size:0.72rem;font-weight:600;margin-top:4px">✓ Visited ${new Date(vis.visitedAt + "T12:00:00").toLocaleDateString("en-IN")}</div>` : ""}
            <div style="margin-top:6px"><a href="/passport/${loc.sno}" style="color:#8B4513;font-size:0.75rem;font-weight:600;text-decoration:underline">View details →</a></div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => onSelect?.(loc));
        marker.addTo(map);
        markersRef.current.set(loc.sno, marker);
      });
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker colors when visits change
  useEffect(() => {
    import("leaflet").then(() => {
      markersRef.current.forEach((marker, sno) => {
        const loc = locations.find((l) => l.sno === sno);
        if (!loc) return;
        const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
        const isVis = !!visits[sno];
        marker.setStyle({
          fillColor: isVis ? "#4A7C59" : color,
          color: isVis ? "#2D5A3D" : "#5C3317",
          fillOpacity: isVis ? 0.9 : 0.75,
        });
      });
    });
  }, [visits, locations]);

  // Pan to highlighted marker
  useEffect(() => {
    if (!highlightSno || !mapInstanceRef.current) return;
    const marker = markersRef.current.get(highlightSno);
    if (marker) {
      mapInstanceRef.current.setView(marker.getLatLng(), 12, { animate: true });
      marker.openPopup();
    }
  }, [highlightSno]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: 480, border: "2px solid #C4A35A" }}
    />
  );
}
