"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { type Location } from "@/lib/data";
import CategoryBadge from "./CategoryBadge";
import StampCircle from "./StampCircle";
import { useEffect, useState } from "react";
import { getVisits, type Visit } from "@/lib/visits";

interface Props {
  location: Location;
}

export default function LocationCard({ location }: Props) {
  const [visit, setVisit] = useState<Visit | null>(null);

  useEffect(() => {
    function load() {
      const v = getVisits()[location.sno];
      setVisit(v ?? null);
    }
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
    <Link href={`/passport/${location.sno}`} className="block">
      <div
        className="stone-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
        style={{ borderColor: visited ? "#4A7C5980" : undefined }}
      >
        {visited && (
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#4A7C59,#C4A35A)" }} />
        )}

        <div className="p-4 flex gap-3 items-start">
          <div className="flex-shrink-0">
            <StampCircle visited={visited} date={visit?.visitedAt} size={72} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className="font-semibold leading-tight group-hover:underline"
                style={{ fontFamily: "var(--font-heading)", color: "#5C3317", fontSize: "0.95rem" }}
              >
                {location.place}
              </h3>
              <span className="text-xs font-bold flex-shrink-0 rounded px-1.5 py-0.5" style={{ background: "#EAD9B8", color: "#8B4513" }}>
                #{location.sno}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs mb-2" style={{ color: "#8B4513" }}>
              <MapPin size={11} />
              <span>{location.district}</span>
              <span>·</span>
              <span>{location.pincode}</span>
            </div>

            <CategoryBadge category={location.category} size="sm" />

            <p className="text-xs mt-2 truncate" style={{ color: "#A0785A" }}>
              {location.post_office}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
