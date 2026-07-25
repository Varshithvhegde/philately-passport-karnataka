import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocation, locations, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/data";
import CategoryBadge from "@/components/CategoryBadge";
import VisitButton from "@/components/VisitButton";
import StampCircleServer from "@/components/StampCircleServer";
import { MapPin, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ sno: string }>;
}

export async function generateStaticParams() {
  return locations.map((l) => ({ sno: l.sno.toString() }));
}

export async function generateMetadata({ params }: Props) {
  const { sno } = await params;
  const loc = getLocation(Number(sno));
  if (!loc) return { title: "Not found" };
  return {
    title: `${loc.place} — Karnataka Philately Passport`,
    description: `${loc.category} · ${loc.district} · ${loc.post_office}`,
  };
}

export default async function PassportEntryPage({ params }: Props) {
  const { sno } = await params;
  const snoNum = Number(sno);
  const loc = getLocation(snoNum);
  if (!loc) notFound();

  const prev = locations.find((l) => l.sno === snoNum - 1);
  const next = locations.find((l) => l.sno === snoNum + 1);
  const sameDistrict = locations.filter((l) => l.district === loc.district && l.sno !== snoNum);

  const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const icon = CATEGORY_ICONS[loc.category] ?? "📍";
  const mapsUrl = `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb nav */}
      <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: "#8B4513" }}>
        <Link href="/passport" className="hover:underline flex items-center gap-1">
          <ArrowLeft size={12} /> Passport
        </Link>
        <span>›</span>
        <span>{loc.district}</span>
        <span>›</span>
        <span style={{ color: "#5C3317", fontWeight: 600 }}>{loc.place}</span>
      </div>

      {/* Main passport page */}
      <div className="passport-page p-6 md:p-8 mb-6">
        {/* Top bar with PPC number */}
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "2px solid #C4A35A40" }}>
          <div>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#5C3317", color: "#C4A35A" }}>
              PPC #{String(loc.sno).padStart(3, "0")}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: "#8B4513" }}>
            <span>Karnataka Circle</span>
            <span>·</span>
            <span>{loc.pincode}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: details */}
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "var(--font-heading)", color: "#5C3317", lineHeight: 1.25 }}
            >
              {loc.place}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: "#8B4513", fontSize: "1.5rem" }}>{icon}</span>
              <CategoryBadge category={loc.category} />
            </div>

            <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid #C4A35A40" }}>
              <div className="px-4 py-2" style={{ background: "#5C3317" }}>
                <span className="text-xs font-semibold" style={{ color: "#C4A35A" }}>CLASSIFICATION</span>
              </div>
              <div className="p-4" style={{ background: "#FFFAF0" }}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "#8B4513" }}>District</div>
                    <div style={{ color: "#5C3317", fontWeight: 600 }}>{loc.district}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "#8B4513" }}>Pincode</div>
                    <div style={{ color: "#5C3317", fontFamily: "monospace", fontWeight: 600 }}>{loc.pincode}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "#8B4513" }}>Post Office</div>
                    <div style={{ color: "#5C3317", fontSize: "0.82rem" }}>{loc.post_office}</div>
                  </div>
                  {loc.office_type && (
                    <div>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: "#8B4513" }}>Type</div>
                      <div style={{ color: "#5C3317" }}>{loc.office_type}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loc.address && (
              <div className="text-xs rounded-lg p-3 mb-4" style={{ background: "#EAD9B8", color: "#5C3317" }}>
                <div className="flex items-start gap-1.5">
                  <MapPin size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#8B4513" }} />
                  <span>{loc.address}</span>
                </div>
              </div>
            )}

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline mb-4"
              style={{ color: "#8B4513" }}
            >
              <ExternalLink size={11} />
              View on Google Maps ({loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)})
            </a>

            <VisitButton sno={loc.sno} place={loc.place} />
          </div>

          {/* Right: stamp area */}
          <div className="flex flex-col items-center justify-start gap-6">
            {/* Stamp area header */}
            <div className="w-full rounded-xl p-5 text-center" style={{ background: "#FFFAF0", border: "2px dashed #C4A35A80" }}>
              <p className="text-xs font-semibold mb-4" style={{ color: "#8B4513", letterSpacing: "0.1em" }}>
                PICTORIAL CANCELLATION STAMP
              </p>
              <div className="flex justify-center">
                <StampCircleServer size={120} color={color} />
              </div>
              <p className="text-xs mt-4" style={{ color: "#A0785A" }}>
                Visit this post office to get your stamp
              </p>
            </div>

            {/* Category color indicator */}
            <div className="w-full rounded-lg p-3 text-xs" style={{ background: "#EAD9B8" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span style={{ color: "#5C3317", fontWeight: 600 }}>{loc.category}</span>
              </div>
              <p style={{ color: "#8B4513" }}>
                This location is classified as a <strong>{loc.category}</strong> site in the Karnataka Philately Passport V3.
              </p>
            </div>
          </div>
        </div>

        {/* Frieze */}
        <div className="mt-8 chalukya-border py-1" />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        {prev ? (
          <Link
            href={`/passport/${prev.sno}`}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: "#EAD9B8", color: "#5C3317" }}
          >
            <ArrowLeft size={14} /> <span className="hidden sm:inline">{prev.place}</span><span className="sm:hidden">Prev</span>
          </Link>
        ) : <div />}
        <Link href="/passport" className="text-xs" style={{ color: "#8B4513" }}>All 100</Link>
        {next ? (
          <Link
            href={`/passport/${next.sno}`}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: "#EAD9B8", color: "#5C3317" }}
          >
            <span className="hidden sm:inline">{next.place}</span><span className="sm:hidden">Next</span> <ArrowRight size={14} />
          </Link>
        ) : <div />}
      </div>

      {/* Same district */}
      {sameDistrict.length > 0 && (
        <div>
          <h3
            className="font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "#5C3317", fontSize: "0.95rem" }}
          >
            More from {loc.district}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sameDistrict.map((l) => (
              <Link
                key={l.sno}
                href={`/passport/${l.sno}`}
                className="rounded-lg p-3 text-xs hover:opacity-80 transition-opacity"
                style={{ background: "#EAD9B8", color: "#5C3317" }}
              >
                <div className="font-semibold truncate">{l.place}</div>
                <div className="opacity-60 mt-0.5">{l.category}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
