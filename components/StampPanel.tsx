"use client";

import { useState, useEffect, useRef } from "react";
import { getVisits, saveVisit, removeVisit, type Visit } from "@/lib/visits";
import { savePhoto, getPhotos, deletePhoto, blobToUrl, type StoredPhoto } from "@/lib/imageStore";
import ThemedStamp from "./ThemedStamp";
import { type Category } from "@/lib/data";
import { X, Camera, Trash2, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";

interface Props {
  sno: number;
  place: string;
  district: string;
  category: Category | string;
}

const CAT_COLOR: Record<string, string> = {
  "Monument":               "#C4A35A",
  "Flora and Fauna":        "#4A7C59",
  "Personality":            "#6D4C9C",
  "Natural Heritage":       "#2A6B8A",
  "Heritage Celebration":   "#C05C1A",
  "Heritage & Celebration": "#C05C1A",
  "Science & Technology":   "#1A5276",
  "Industry":               "#7D6608",
  "Weapons":                "#922B21",
  "Weapon and Attire":      "#922B21",
  "Natural Stream":         "#1F618D",
};

const MAX_PHOTOS = 5;

export default function StampPanel({ sno, place, district, category }: Props) {
  const [visit,     setVisit]     = useState<Visit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [inkRing,   setInkRing]   = useState(false);
  const [date,      setDate]      = useState(new Date().toISOString().split("T")[0]);
  const [notes,     setNotes]     = useState("");
  const [flapOpen,  setFlapOpen]  = useState(false);
  const [sealPulse, setSealPulse] = useState(false);

  // Photos
  const [photos,    setPhotos]      = useState<StoredPhoto[]>([]);
  const [photoUrls, setPhotoUrls]   = useState<Record<string, string>>({});
  const [activeIdx, setActiveIdx]   = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [lightbox,  setLightbox]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const v = getVisits()[sno];
    if (v) { setVisit(v); setDate(v.visitedAt); setNotes(v.notes); }
  }, [sno]);

  // Load photos from IndexedDB
  useEffect(() => {
    getPhotos(sno).then(ps => {
      setPhotos(ps);
      // Create object URLs
      const urls: Record<string, string> = {};
      ps.forEach(p => { urls[p.id] = blobToUrl(p.blob); });
      setPhotoUrls(urls);
    }).catch(() => {});

    return () => {
      // Revoke all object URLs on unmount
      Object.values(photoUrls).forEach(u => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sno]);

  function dispatch() { window.dispatchEvent(new Event("philately:update")); }

  function handleSave() {
    const v: Visit = { sno, visitedAt: date, notes };
    saveVisit(v);
    setVisit(v);
    setShowModal(false);
    setAnimating(true);
    setInkRing(true);
    setTimeout(() => setInkRing(false), 800);
    setTimeout(() => setAnimating(false), 700);
    setTimeout(() => setSealPulse(true), 300);
    setTimeout(() => setSealPulse(false), 900);
    dispatch();
  }

  function handleRemove() {
    removeVisit(sno); setVisit(null); setShowModal(false); dispatch();
  }

  function openModal() {
    setFlapOpen(true);
    setTimeout(() => setShowModal(true), 350);
  }
  function closeModal() {
    setShowModal(false);
    setTimeout(() => setFlapOpen(false), 200);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files.slice(0, MAX_PHOTOS - photos.length)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const stored = await savePhoto(sno, file);
        const url    = blobToUrl(stored.blob);
        setPhotos(prev => [...prev, stored]);
        setPhotoUrls(prev => ({ ...prev, [stored.id]: url }));
      } catch (err) {
        console.error("Failed to save photo", err);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDeletePhoto(id: string) {
    await deletePhoto(id);
    URL.revokeObjectURL(photoUrls[id] ?? "");
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== id);
      if (activeIdx >= next.length) setActiveIdx(Math.max(0, next.length - 1));
      return next;
    });
    setPhotoUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  const visited  = !!visit;
  const catColor = CAT_COLOR[category] ?? "#C4A35A";
  const hasPhotos = photos.length > 0;
  const currentPhoto = photos[activeIdx];
  const currentUrl   = currentPhoto ? photoUrls[currentPhoto.id] : undefined;

  return (
    <>
      {/* ═══ ENVELOPE ═══════════════════════════════════════════════ */}
      <div style={{ position: "relative", width: "100%" }}>

        {/* Envelope body */}
        <div style={{
          position: "relative",
          background: "var(--page)",
          border: "2.5px solid transparent",
          backgroundImage: `
            linear-gradient(var(--page), var(--page)),
            repeating-linear-gradient(
              -45deg,
              #C4391A 0px, #C4391A 4px, transparent 4px, transparent 6px,
              #0D1F3A 6px, #0D1F3A 10px, transparent 10px, transparent 12px
            )`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: visited
            ? `0 4px 20px rgba(28,74,46,0.2), 0 1px 4px rgba(28,74,46,0.1)`
            : `0 4px 16px rgba(26,14,6,0.15), 0 1px 3px rgba(26,14,6,0.08)`,
          transition: "box-shadow 0.3s",
          overflow: "visible",
        }}>

          {/* Flap */}
          <div style={{
            position: "absolute", top: -1, left: -2.5, right: -2.5,
            height: 44, zIndex: 10, overflow: "hidden",
            transformOrigin: "top center", transformStyle: "preserve-3d",
            animation: flapOpen ? "flap-open 0.35s ease-in forwards" : "",
          }}>
            <svg width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
              <polygon points="0,0 220,0 220,2 110,44 0,2" fill="#EDE1BF"/>
              <line x1="0" y1="4" x2="110" y2="44" stroke="rgba(122,59,15,0.15)" strokeWidth="0.8"/>
              <line x1="220" y1="4" x2="110" y2="44" stroke="rgba(122,59,15,0.15)" strokeWidth="0.8"/>
              <polyline points="0,2 110,42 220,2" fill="none" stroke="rgba(122,59,15,0.25)" strokeWidth="0.8"/>
            </svg>
            <div style={{
              position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
              width: 12, height: 12, borderRadius: "50%", background: catColor,
              border: "1.5px solid rgba(26,14,6,0.2)", boxShadow: "0 0 0 2px rgba(255,255,255,0.4)",
              opacity: 0.7,
            }} />
          </div>

          {/* Interior */}
          <div style={{ padding: "52px 16px 14px", textAlign: "center" }}>

            {/* FROM / TO */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, padding: "0 2px" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>From</div>
                <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.72rem", color: "var(--ink-mid)", lineHeight: 1.3 }}>
                  Karnataka Philately<br/>Passport V3
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 2 }}>To</div>
                <div style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.72rem", color: "var(--ink-mid)", lineHeight: 1.3 }}>
                  {place}<br/>
                  <span style={{ fontSize: "0.62rem", color: "var(--laterite)" }}>{district}</span>
                </div>
              </div>
            </div>

            {/* Stamp zone */}
            <div style={{ position: "relative", margin: "0 auto 12px", width: "fit-content" }}>
              {inkRing && (
                <>
                  <div className="ink-ring" style={{ position: "absolute", top: "50%", left: "50%", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${catColor}40 0%, transparent 70%)`, transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 20 }}/>
                  <div className="ink-ring-2" style={{ position: "absolute", top: "50%", left: "50%", width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, ${catColor}30 0%, transparent 70%)`, transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 20 }}/>
                </>
              )}
              <ThemedStamp sno={sno} category={category} place={place} district={district}
                date={visit?.visitedAt} size={155} visited={visited} animated={animating}/>
            </div>

            {/* Collected date */}
            {visited && visit && (
              <div className="fade-in-up" style={{ fontFamily: "var(--font-kalam, cursive)", fontSize: "0.82rem", color: "var(--forest)", letterSpacing: "0.01em", marginBottom: 6 }}>
                ✓ collected {new Date(visit.visitedAt + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
            {!visited && (
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(122,59,15,0.45)", marginBottom: 6 }}>
                Affix your stamp here
              </div>
            )}

            {/* Notes preview */}
            {visited && visit?.notes && (
              <div style={{ margin: "0 4px 8px", padding: "6px 10px", background: "rgba(240,228,192,0.6)", border: "1px dashed rgba(122,59,15,0.25)", fontFamily: "var(--font-kalam, cursive)", fontSize: "0.75rem", color: "var(--laterite)", fontStyle: "italic", lineHeight: 1.5, textAlign: "left" }}>
                "{visit.notes}"
              </div>
            )}

            {/* ── Photo strip inside envelope ─────────────────────── */}
            {hasPhotos && (
              <div style={{ margin: "0 4px 8px" }}>
                {/* Photo viewer */}
                <div style={{ position: "relative", background: "#1A0E06", overflow: "hidden", aspectRatio: "4/3" }}>
                  {currentUrl && (
                    <img
                      src={currentUrl}
                      alt={`Visit photo ${activeIdx + 1}`}
                      onClick={() => setLightbox(currentUrl)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }}
                    />
                  )}
                  {/* Nav arrows */}
                  {photos.length > 1 && (
                    <>
                      <button onClick={() => setActiveIdx(i => (i - 1 + photos.length) % photos.length)}
                        style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(26,14,6,0.6)", border: "none", color: "#F8F0D8", cursor: "pointer", padding: "6px 4px", lineHeight: 1 }}>
                        <ChevronLeft size={14}/>
                      </button>
                      <button onClick={() => setActiveIdx(i => (i + 1) % photos.length)}
                        style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "rgba(26,14,6,0.6)", border: "none", color: "#F8F0D8", cursor: "pointer", padding: "6px 4px", lineHeight: 1 }}>
                        <ChevronRight size={14}/>
                      </button>
                    </>
                  )}
                  {/* Photo count */}
                  <div style={{ position: "absolute", bottom: 4, right: 6, fontFamily: "var(--font-display)", fontSize: "0.55rem", color: "#F8F0D8", background: "rgba(0,0,0,0.5)", padding: "1px 5px", letterSpacing: "0.06em" }}>
                    {activeIdx + 1}/{photos.length}
                  </div>
                </div>
                {/* Thumbnail strip */}
                {photos.length > 1 && (
                  <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                    {photos.map((p, i) => (
                      <button key={p.id} onClick={() => setActiveIdx(i)}
                        style={{ flex: 1, aspectRatio: "1", background: "#1A0E06", border: i === activeIdx ? "2px solid var(--sandstone)" : "2px solid transparent", padding: 0, cursor: "pointer", overflow: "hidden" }}>
                        <img src={photoUrls[p.id]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom stripe */}
          <div style={{ borderTop: "1px solid rgba(196,163,90,0.25)", background: "rgba(240,228,192,0.3)", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--copper)" }}>
              India Post · Karnataka Circle
            </div>
            {/* Photo count badge */}
            {hasPhotos && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-display)", fontSize: "0.52rem", color: "var(--copper)", letterSpacing: "0.06em" }}>
                <Camera size={10}/> {photos.length} photo{photos.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={openModal}
          onMouseEnter={e => { if (!visited) e.currentTarget.classList.add("envelope-wiggle"); }}
          onAnimationEnd={e => e.currentTarget.classList.remove("envelope-wiggle")}
          style={{
            marginTop: 10, width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "11px 0",
            fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.12em",
            textTransform: "uppercase", cursor: "pointer",
            background: visited ? "#1C4A2E" : "var(--spine)",
            color: visited ? "#A8D8B0" : "var(--sandstone)",
            borderTop:    visited ? "1px solid #2D7A44" : "1px solid rgba(196,163,90,0.3)",
            borderLeft:   visited ? "1px solid #2D7A44" : "1px solid rgba(196,163,90,0.3)",
            borderRight:  "1px solid rgba(26,14,6,0.25)",
            borderBottom: "1px solid rgba(26,14,6,0.25)",
            transition: "all 0.15s", position: "relative",
            paddingRight: visited ? 40 : 0,
          }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ flexShrink: 0 }}>
            <rect x="0.5" y="0.5" width="15" height="11" stroke="currentColor" strokeWidth="1"/>
            <polyline points="0.5,0.5 8,7 15.5,0.5" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          {visited ? "Update Stamp Record" : "Record Visit & Get Stamp"}
          {visited && (
            <span className={sealPulse ? "seal-animate" : ""} style={{
              position: "absolute", right: 10,
              width: 20, height: 20, borderRadius: "50%",
              background: catColor, border: "1.5px solid rgba(26,14,6,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem",
            }}>✓</span>
          )}
        </button>
      </div>

      {/* ═══ LIGHTBOX ════════════════════════════════════════════════ */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#F8F0D8", cursor: "pointer", padding: 12 }}>
            <X size={22}/>
          </button>
          <img src={lightbox} alt="Visit photo"
            style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain" }}
            onClick={e => e.stopPropagation()}/>
        </div>
      )}

      {/* ═══ MODAL ═══════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(13,31,58,0.82)", overflowY: "auto" }}>

          <div className="w-full max-w-md relative my-4" style={{
            border: "3px solid transparent",
            backgroundImage: `
              linear-gradient(var(--page), var(--page)),
              repeating-linear-gradient(-45deg, #C4391A 0px,#C4391A 4px,transparent 4px,transparent 6px,#0D1F3A 6px,#0D1F3A 10px,transparent 10px,transparent 12px)`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            boxShadow: "0 20px 60px rgba(13,31,58,0.5)",
          }}>

            {/* Modal header */}
            <div style={{ background: "var(--spine)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1.2" fill="none"/>
                  <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A" fillOpacity="0.7"/>
                </svg>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(196,163,90,0.8)" }}>
                  {visited ? "Update Record" : "Record Visit"}
                </span>
              </div>
              <button onClick={closeModal} style={{ color: "rgba(196,163,90,0.6)", background: "none", border: "none", cursor: "pointer", padding: "12px", margin: "-12px", lineHeight: 1 }}>
                <X size={15}/>
              </button>
            </div>

            <div style={{ padding: "20px 22px 22px", background: "var(--page)" }}>

              {/* Stamp preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "10px 12px", background: "rgba(240,228,192,0.5)", border: "1px solid rgba(196,163,90,0.25)" }}>
                <ThemedStamp sno={sno} category={category} place={place} district={district} date={date} size={72} visited={true}/>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 4 }}>Cancelling stamp for</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--temple)", lineHeight: 1.2 }}>{place}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--copper)", marginTop: 2 }}>{district} District</div>
                </div>
              </div>

              {/* Date */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>Date of Visit</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "var(--ivory)", border: "1px solid rgba(196,163,90,0.45)", borderRightColor: "rgba(26,14,6,0.18)", borderBottomColor: "rgba(26,14,6,0.18)", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)", marginBottom: 5 }}>Your Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="What did you see? How was the journey there?"
                  style={{
                    width: "100%", padding: "8px 10px", background: "var(--ivory)",
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(122,59,15,0.08) 27px, rgba(122,59,15,0.08) 28px)",
                    backgroundPositionY: "8px",
                    border: "1px solid rgba(196,163,90,0.45)", borderRightColor: "rgba(26,14,6,0.18)", borderBottomColor: "rgba(26,14,6,0.18)",
                    color: "var(--ink)", fontFamily: "var(--font-kalam, cursive)", fontSize: "0.95rem",
                    resize: "none", outline: "none", lineHeight: 1.75, boxSizing: "border-box" as const,
                  }}
                />
              </div>

              {/* ── Photos section ─────────────────────────────────── */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--copper)" }}>
                    Visit Photos {photos.length > 0 && <span style={{ color: "var(--laterite)" }}>({photos.length}/{MAX_PHOTOS})</span>}
                  </label>
                  {photos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "6px 10px", cursor: uploading ? "wait" : "pointer",
                        background: "var(--spine)", color: "var(--sandstone)",
                        border: "1px solid rgba(196,163,90,0.3)",
                      }}>
                      <ImagePlus size={11}/> {uploading ? "Adding…" : "Add Photo"}
                    </button>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange}
                  style={{ display: "none" }} capture="environment"/>

                {photos.length === 0 ? (
                  /* Upload drop zone */
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: "100%", padding: "22px 0",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      background: "var(--ivory)",
                      border: "2px dashed rgba(196,163,90,0.4)",
                      cursor: "pointer", transition: "border-color 0.15s",
                    }}>
                    <Camera size={22} style={{ color: "rgba(196,163,90,0.5)" }}/>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(122,59,15,0.5)" }}>
                      Tap to add a photo from your visit
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "rgba(122,59,15,0.35)" }}>
                      Stored locally on your device
                    </div>
                  </button>
                ) : (
                  /* Photo grid */
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 6 }}>
                    {photos.map((p, i) => (
                      <div key={p.id} style={{ position: "relative", aspectRatio: "1", background: "#1A0E06", overflow: "hidden" }}>
                        <img
                          src={photoUrls[p.id]}
                          alt={`Photo ${i + 1}`}
                          onClick={() => setLightbox(photoUrls[p.id])}
                          style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }}
                        />
                        <button
                          onClick={() => handleDeletePhoto(p.id)}
                          style={{
                            position: "absolute", top: 3, right: 3,
                            background: "rgba(26,14,6,0.75)", border: "none", borderRadius: "50%",
                            width: 22, height: 22, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#F5B8A8",
                          }}>
                          <Trash2 size={11}/>
                        </button>
                        {/* Date tooltip */}
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "rgba(0,0,0,0.55)", padding: "2px 4px",
                          fontFamily: "var(--font-display)", fontSize: "0.44rem", color: "#F8F0D8", letterSpacing: "0.04em",
                        }}>
                          {new Date(p.addedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    ))}
                    {/* Add more slot */}
                    {photos.length < MAX_PHOTOS && (
                      <button onClick={() => fileRef.current?.click()}
                        style={{ aspectRatio: "1", background: "var(--ivory)", border: "2px dashed rgba(196,163,90,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(196,163,90,0.5)" }}>
                        <ImagePlus size={16}/>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSave}
                  style={{
                    flex: 1, padding: "10px 0",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "var(--spine)", color: "var(--sandstone)",
                    border: "1px solid rgba(196,163,90,0.3)", borderRightColor: "rgba(26,14,6,0.25)", borderBottomColor: "rgba(26,14,6,0.25)",
                    fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    cursor: "pointer",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5"/>
                    <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                  </svg>
                  {visited ? "Update Record" : "Stamp It"}
                </button>
                {visited && (
                  <button onClick={handleRemove}
                    style={{ padding: "10px 14px", background: "#2A0808", color: "#C45A5A", border: "1px solid #7A1010", borderRightColor: "#060300", borderBottomColor: "#060300", fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
