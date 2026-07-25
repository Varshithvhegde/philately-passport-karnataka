"use client";

import { useEffect, useRef, useState } from "react";
import { type Location, CATEGORY_COLORS } from "@/lib/data";
import { getVisits, type Visit } from "@/lib/visits";

interface Props {
  locations: Location[];
  highlightSno?: number;
  onSelect?: (loc: Location) => void;
}

export default function MapComponent({ locations, highlightSno, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<number, import("leaflet").CircleMarker>>(new Map());
  const [visits, setVisits] = useState<Record<number, Visit>>({});

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
    if (!mapRef.current) return;
    // Guard: Leaflet stamps _leaflet_id on the container when it initialises.
    // React StrictMode double-invokes effects; checking the DOM node prevents
    // "Map container is already initialized" if cleanup fires before async init completes.
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

      // Warm antique-style tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);

      L.control.attribution({ position: "bottomright", prefix: "© CartoDB" }).addTo(map);

      mapInstanceRef.current = map;

      locations.forEach((loc) => addMarker(L, map, loc, visits));
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      // Clear Leaflet's DOM stamp so re-mount can re-init cleanly
      delete (container as unknown as Record<string, unknown>)._leaflet_id;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addMarker(
    L: typeof import("leaflet"),
    map: import("leaflet").Map,
    loc: Location,
    currentVisits: Record<number, Visit>
  ) {
    const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
    const isVis = !!currentVisits[loc.sno];

    const marker = L.circleMarker([loc.latitude, loc.longitude], {
      radius: 7,
      fillColor: isVis ? "#1C4A2E" : color,
      color: isVis ? "#0A2014" : "#2A1A0A",
      weight: isVis ? 2 : 1.5,
      opacity: 1,
      fillOpacity: isVis ? 0.9 : 0.78,
    });

    const vis = currentVisits[loc.sno];
    const popupContent = `
      <div style="font-family:serif;padding:12px 14px;min-width:170px;max-width:210px">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:#7A3B0F;margin-bottom:4px">PPC #${String(loc.sno).padStart(3,"0")} · ${loc.district}</div>
        <div style="font-weight:700;color:#1A0E06;font-size:0.95rem;line-height:1.25;margin-bottom:6px">${loc.place}</div>
        <div style="font-size:0.72rem;display:inline-block;padding:1px 8px;background:#EAD9B8;color:#4A2810;border:1px solid #C4A35A60;margin-bottom:8px">${loc.category}</div>
        ${vis ? `<div style="color:#1C4A2E;font-size:0.72rem;font-weight:600;margin-bottom:6px">✓ Visited ${new Date(vis.visitedAt+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>` : ""}
        <div style="border-top:1px solid #C4A35A40;padding-top:8px">
          <a href="/passport/${loc.sno}" style="color:#4A2810;font-size:0.75rem;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:0.06em">View Page →</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 220, minWidth: 170 });
    marker.on("click", () => onSelect?.(loc));
    marker.addTo(map);
    markersRef.current.set(loc.sno, marker);
  }

  // Refresh marker colours when visits change
  useEffect(() => {
    import("leaflet").then(() => {
      markersRef.current.forEach((marker, sno) => {
        const loc = locations.find((l) => l.sno === sno);
        if (!loc) return;
        const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
        const isVis = !!visits[sno];
        marker.setStyle({
          fillColor: isVis ? "#1C4A2E" : color,
          color: isVis ? "#0A2014" : "#2A1A0A",
          fillOpacity: isVis ? 0.9 : 0.78,
        });
      });
    });
  }, [visits, locations]);

  // Pan/zoom to highlighted marker
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
      className="w-full h-full"
      style={{
        minHeight: 480,
        border: "2px solid #4A2810",
        borderRight: "2px solid #0A0502",
        borderBottom: "2px solid #0A0502",
      }}
    />
  );
}
