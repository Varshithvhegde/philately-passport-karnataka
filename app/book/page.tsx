"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { locations, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/data";
import { STAMP_ARTWORKS } from "@/components/StampArtwork";
import { getVisits, type Visit } from "@/lib/visits";
import { getPhotos, blobToUrl } from "@/lib/imageStore";
import { BookOpen, Home, ChevronLeft, ChevronRight } from "lucide-react";

// ── Book structure: 104 spreads total ──────────────────────────────
// Spread 0  : Cover
// Spread 1  : Inside-cover / Contents
// Spread 2–101 : PPC #1–#100  (left=info, right=stamp)
// Spread 102 : Back matter
// Spread 103 : Back cover
const TOTAL_LOCATIONS = 100;
const COVER_SPREADS   = 2;
const TOTAL_SPREADS   = COVER_SPREADS + TOTAL_LOCATIONS + 2; // 104

// Paper grain data-uri
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

// ── Page content ────────────────────────────────────────────────────

function PageCoverFront() {
  return (
    <div style={{
      width:"100%", height:"100%", position:"relative", overflow:"hidden",
      background:"linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)",
      backgroundImage: GRAIN+",linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    }}>
      {/* Diagonal texture */}
      <div style={{ position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 22px,rgba(196,163,90,0.025) 22px,rgba(196,163,90,0.025) 23px)",pointerEvents:"none" }}/>
      {/* India Post red top stripe */}
      <div style={{ position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#C4391A,#E05020 50%,#C4391A)" }}/>
      {/* Corner ornaments */}
      {[{top:14,left:14},{top:14,right:14,transform:"scaleX(-1)"},{bottom:14,left:14,transform:"scaleY(-1)"},{bottom:14,right:14,transform:"scale(-1)"}].map((s,i)=>(
        <svg key={i} width="28" height="28" viewBox="0 0 28 28" fill="none" style={{position:"absolute",...s}}>
          <path d="M2 2L2 12M2 2L12 2" stroke="#C4A35A" strokeWidth="1.5" opacity="0.5"/>
          <circle cx="2" cy="2" r="1.5" fill="#C4A35A" opacity="0.4"/>
        </svg>
      ))}
      <svg width="42" height="32" viewBox="0 0 20 20" fill="none" style={{marginBottom:16,opacity:0.55}}>
        <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)"/>
        <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A" opacity="0.7"/>
      </svg>
      <div style={{fontFamily:"var(--font-display)",fontSize:"0.85rem",color:"rgba(196,163,90,0.6)",letterSpacing:"0.08em",marginBottom:6}}>फिलाटेली पासपोर्ट</div>
      <div style={{fontFamily:"var(--font-kannada)",fontSize:"1.45rem",color:"#E8D9B8",lineHeight:1.2,marginBottom:10,textAlign:"center"}}>ಕರ್ನಾಟಕ<br/>ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್</div>
      <div style={{width:"52%",height:8,marginBottom:12}}><div style={{height:"100%",background:"repeating-linear-gradient(90deg,transparent 0,transparent 7px,rgba(196,163,90,0.2) 7px,rgba(196,163,90,0.2) 9px)"}} /></div>
      <div style={{fontFamily:"var(--font-display)",fontSize:"0.75rem",letterSpacing:"0.12em",color:"var(--sandstone)",marginBottom:4}}>PHILATELY PASSPORT</div>
      <div style={{fontFamily:"var(--font-display)",fontSize:"0.5rem",letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(196,163,90,0.38)",marginBottom:18}}>Permanent Pictorial Cancellations · Karnataka</div>
      <div style={{padding:"3px 14px",border:"1px solid rgba(196,163,90,0.35)",fontFamily:"var(--font-display)",fontSize:"0.58rem",letterSpacing:"0.16em",color:"rgba(196,163,90,0.5)"}}>VERSION 3.0</div>
    </div>
  );
}

function PageContents() {
  return (
    <div style={{width:"100%",height:"100%",background:"#F7EFDB",backgroundImage:GRAIN+",linear-gradient(160deg,#F7EFDB 0%,#F0E4C0 100%)",padding:"24px 22px",display:"flex",flexDirection:"column",overflow:"hidden",boxSizing:"border-box"}}>
      <div style={{fontFamily:"var(--font-display)",fontSize:"0.48rem",letterSpacing:"0.22em",textTransform:"uppercase",color:"var(--copper)",marginBottom:12}}>Contents</div>
      <h3 style={{fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:600,color:"var(--temple)",marginBottom:10,lineHeight:1.2}}>Karnataka Philately Passport V3</h3>
      <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 16px",alignContent:"start",overflow:"hidden"}}>
        {locations.map(l=>(
          <div key={l.sno} style={{display:"flex",alignItems:"baseline",gap:3,padding:"2.5px 0",borderBottom:"1px dotted rgba(196,163,90,0.18)"}}>
            <span style={{fontFamily:"var(--font-display)",fontSize:"0.42rem",color:"var(--copper)",flexShrink:0,minWidth:20,letterSpacing:"0.05em"}}>{String(l.sno).padStart(3,"0")}</span>
            <span style={{fontFamily:"var(--font-body)",fontSize:"0.56rem",color:"var(--temple)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{l.place}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageLeft({ loc, visit, photoUrl }: { loc: typeof locations[0]; visit: Visit|null; photoUrl:string|null }) {
  const color = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const icon  = CATEGORY_ICONS[loc.category] ?? "📍";
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",background:"#F7EFDB",backgroundImage:GRAIN+",linear-gradient(160deg,#F7EFDB 0%,#F0E4C0 100%)",overflow:"hidden",boxSizing:"border-box"}}>
      {/* Header */}
      <div style={{background:"var(--temple)",padding:"7px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <span style={{fontFamily:"var(--font-display)",fontSize:"0.46rem",letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--sandstone)"}}>Karnataka Philately Passport</span>
        <span style={{fontFamily:"var(--font-display)",fontSize:"0.46rem",color:"rgba(196,163,90,0.55)",letterSpacing:"0.08em"}}>{String(loc.sno).padStart(3,"0")} / 100</span>
      </div>
      <div style={{flex:1,padding:"16px 18px 12px",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Category */}
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
          <span style={{fontSize:"0.8rem"}}>{icon}</span>
          <span style={{fontFamily:"var(--font-display)",fontSize:"0.46rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--copper)"}}>{loc.category}</span>
        </div>
        <h2 style={{fontFamily:"var(--font-display)",fontWeight:700,color:"var(--temple)",fontSize:"1.18rem",lineHeight:1.15,marginBottom:3}}>{loc.place}</h2>
        <div style={{fontFamily:"var(--font-body)",fontSize:"0.62rem",color:"var(--copper)",marginBottom:12}}>{loc.district} District · PIN {loc.pincode}</div>
        <div style={{height:1,background:`linear-gradient(90deg,${color}60,transparent)`,marginBottom:10}}/>
        {/* Grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px 10px",marginBottom:10}}>
          {[["District",loc.district],["Pincode",loc.pincode],["Post Office",loc.post_office.replace(/\s+\d{6}$/,"")],["Type",loc.office_type??"PO"]].map(([label,val])=>(
            <div key={label}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"0.4rem",letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--copper)",marginBottom:1}}>{label}</div>
              <div style={{fontFamily:"var(--font-body)",fontSize:"0.62rem",fontWeight:600,color:"var(--temple)",lineHeight:1.2}}>{val}</div>
            </div>
          ))}
        </div>
        {/* Description */}
        {loc.description && (
          <div style={{padding:"7px 9px",background:`${color}0D`,borderLeft:`2px solid ${color}80`,flex:1,overflow:"hidden",minHeight:0}}>
            <p style={{fontFamily:"var(--font-body)",fontSize:"0.62rem",color:"#4A2C12",lineHeight:1.6,margin:0,display:"-webkit-box",WebkitLineClamp:5,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{loc.description}</p>
          </div>
        )}
        {/* Photo or visit note */}
        {photoUrl ? (
          <div style={{flexShrink:0,marginTop:8}}>
            <div style={{background:"#1A0E06",overflow:"hidden",aspectRatio:"16/6"}}>
              <img src={photoUrl} alt="Visit" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            </div>
            {visit && <div style={{fontFamily:"var(--font-kalam,cursive)",fontSize:"0.6rem",color:"var(--forest)",marginTop:3,textAlign:"right"}}>✓ {new Date(visit.visitedAt+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>}
          </div>
        ) : visit && (
          <div style={{marginTop:"auto",paddingTop:6,fontFamily:"var(--font-kalam,cursive)",fontSize:"0.65rem",color:"var(--forest)"}}>
            ✓ collected {new Date(visit.visitedAt+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
            {visit.notes && <div style={{fontStyle:"italic",color:"var(--laterite)",fontSize:"0.6rem",marginTop:2}}>"{visit.notes.slice(0,55)}{visit.notes.length>55?"…":""}"</div>}
          </div>
        )}
      </div>
      <div style={{padding:"5px 18px",borderTop:"1px solid rgba(196,163,90,0.2)",display:"flex",justifyContent:"flex-end"}}>
        <span style={{fontFamily:"var(--font-display)",fontSize:"0.45rem",color:"rgba(74,40,16,0.38)",letterSpacing:"0.08em"}}>{(loc.sno-1)*2+4}</span>
      </div>
    </div>
  );
}

function PageRight({ loc, visit }: { loc: typeof locations[0]; visit: Visit|null }) {
  const color  = CATEGORY_COLORS[loc.category] ?? "#C4A35A";
  const artFn  = STAMP_ARTWORKS[loc.sno];
  const r = 50, outer = r-4, inner = r-14, ticks = 26;
  const d  = visit?.visitedAt ? new Date(visit.visitedAt+"T12:00:00") : null;
  const dy = d?.getDate(), mo = d?.toLocaleString("en-IN",{month:"short"}).toUpperCase(), yr = d?.getFullYear();
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",background:"#F7EFDB",backgroundImage:GRAIN+",linear-gradient(160deg,#EFE5C8 0%,#F7EFDB 100%)",overflow:"hidden",boxSizing:"border-box"}}>
      <div style={{background:"var(--temple)",padding:"7px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <span style={{fontFamily:"var(--font-display)",fontSize:"0.46rem",letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--sandstone)"}}>Pictorial Cancellation</span>
        <span style={{fontFamily:"var(--font-display)",fontSize:"0.46rem",color:"rgba(196,163,90,0.55)",letterSpacing:"0.08em"}}>PPC {String(loc.sno).padStart(3,"0")}</span>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"12px 16px",gap:10}}>
        {/* Stamp */}
        <div style={{padding:"12px",border:visit?`1.5px solid ${color}80`:"1.5px dashed rgba(196,163,90,0.3)",background:visit?`${color}06`:"transparent",display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:"0.42rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--copper)",marginBottom:10}}>Permanent Pictorial Cancellation</div>
          <svg width={r*2} height={r*2} viewBox={`0 0 ${r*2} ${r*2}`} style={visit?{filter:"drop-shadow(1px 2px 5px rgba(26,14,6,0.3))"}:{}}>
            {visit ? (<>
              <circle cx={r} cy={r} r={outer-1} fill={`${color}08`}/>
              {Array.from({length:ticks},(_,i)=>{const a=(i/ticks)*Math.PI*2;return<line key={i} x1={r+(outer-2)*Math.cos(a)} y1={r+(outer-2)*Math.sin(a)} x2={r+(outer+2)*Math.cos(a)} y2={r+(outer+2)*Math.sin(a)} stroke={color} strokeWidth="1.1"/>;}) }
              <circle cx={r} cy={r} r={outer} fill="none" stroke={color} strokeWidth="2"/>
              <circle cx={r} cy={r} r={inner+2} fill="none" stroke={color} strokeWidth="0.8"/>
              <defs>
                <path id={`at-${loc.sno}`} d={`M ${r-inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,1 ${r+inner*0.85},${r}`}/>
                <path id={`ab-${loc.sno}`} d={`M ${r-inner*0.85},${r} A ${inner*0.85},${inner*0.85} 0 0,0 ${r+inner*0.85},${r}`}/>
              </defs>
              <text fontSize={r*0.155} fill={color} fontFamily="serif" fontWeight="700" letterSpacing="1.2"><textPath href={`#at-${loc.sno}`} startOffset="50%" textAnchor="middle">{loc.place.toUpperCase().slice(0,12)}</textPath></text>
              {artFn && artFn(r,inner)}
              {dy && <><text x={r} y={r+inner*0.38} textAnchor="middle" fontSize={r*0.4} fill={color} fontWeight="bold" fontFamily="serif">{dy}</text><text x={r} y={r+inner*0.6} textAnchor="middle" fontSize={r*0.165} fill={color} fontFamily="serif" letterSpacing="1">{mo} {yr}</text></>}
              <text fontSize={r*0.125} fill={color} fontFamily="serif" letterSpacing="1"><textPath href={`#ab-${loc.sno}`} startOffset="50%" textAnchor="middle">{loc.district.toUpperCase().slice(0,11)}</textPath></text>
            </>) : (<>
              <circle cx={r} cy={r} r={outer} fill="none" stroke="var(--sandstone)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.3"/>
              <circle cx={r} cy={r} r={inner} fill="none" stroke="var(--sandstone)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.18"/>
              {artFn && artFn(r,inner)}
              <text x={r} y={r+inner*0.52} textAnchor="middle" fontSize={r*0.13} fill="var(--sandstone)" fillOpacity="0.28" fontFamily="serif" letterSpacing="1.5">AFFIX STAMP</text>
            </>)}
          </svg>
          {visit ? (
            <div style={{fontFamily:"var(--font-kalam,cursive)",fontSize:"0.65rem",color:"var(--forest)",marginTop:6}}>✓ collected {new Date(visit.visitedAt+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
          ) : (
            <div style={{fontFamily:"var(--font-display)",fontSize:"0.44rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(122,59,15,0.38)",marginTop:6}}>Visit post office to collect</div>
          )}
        </div>
        {/* Address */}
        <div style={{width:"100%",padding:"7px 9px",background:"rgba(240,228,192,0.4)",border:"1px solid rgba(196,163,90,0.22)",borderLeft:"2.5px solid var(--temple)"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:"0.42rem",letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--copper)",marginBottom:3}}>Post Office</div>
          <div style={{fontFamily:"var(--font-body)",fontSize:"0.65rem",fontWeight:600,color:"var(--temple)",lineHeight:1.25}}>{loc.post_office.replace(/\s+\d{6}$/,"")}</div>
          {loc.address && <div style={{fontFamily:"var(--font-body)",fontSize:"0.56rem",color:"var(--laterite)",marginTop:2,lineHeight:1.35}}>{loc.address.split(",").slice(0,2).join(",")}</div>}
          <div style={{fontFamily:"monospace",fontSize:"0.7rem",fontWeight:700,color:"var(--temple)",marginTop:3,letterSpacing:"0.1em"}}>{loc.pincode}</div>
        </div>
        {/* Notes */}
        <div style={{width:"100%",borderTop:"1px dashed rgba(122,59,15,0.18)",paddingTop:6}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:"0.42rem",letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--copper)",marginBottom:4}}>Notes</div>
          {visit?.notes ? (
            <div style={{fontFamily:"var(--font-kalam,cursive)",fontSize:"0.65rem",color:"#4A2C12",fontStyle:"italic",lineHeight:1.5}}>"{visit.notes.slice(0,70)}{visit.notes.length>70?"…":""}"</div>
          ) : (
            <div style={{height:18,borderBottom:"1px solid rgba(122,59,15,0.12)"}}/>
          )}
        </div>
      </div>
      <div style={{padding:"5px 18px",borderTop:"1px solid rgba(196,163,90,0.2)",display:"flex",justifyContent:"flex-start"}}>
        <span style={{fontFamily:"var(--font-display)",fontSize:"0.45rem",color:"rgba(74,40,16,0.38)",letterSpacing:"0.08em"}}>{(loc.sno-1)*2+5}</span>
      </div>
    </div>
  );
}

function PageBackMatter() {
  return (
    <div style={{width:"100%",height:"100%",background:"#F7EFDB",backgroundImage:GRAIN,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24,boxSizing:"border-box"}}>
      <div style={{fontFamily:"var(--font-kannada)",fontSize:"1.1rem",color:"var(--temple)",marginBottom:10}}>ಪ್ರತಿ ಅಂಚೆ ಕಚೇರಿ ಒಂದು ಕಥೆ ಹೇಳುತ್ತದೆ</div>
      <div style={{fontFamily:"var(--font-body)",fontSize:"0.7rem",color:"var(--copper)",fontStyle:"italic",marginBottom:18}}>Every post office tells a story.</div>
      <div style={{width:60,height:8,marginBottom:18}}><div style={{height:"100%",background:"repeating-linear-gradient(90deg,transparent 0,transparent 7px,rgba(196,163,90,0.2) 7px,rgba(196,163,90,0.2) 9px)"}}/></div>
      <div style={{fontFamily:"var(--font-display)",fontSize:"0.52rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--copper)",lineHeight:2}}>Karnataka Circle · India Post<br/>100 Permanent Pictorial Cancellations<br/>Version 3.0</div>
    </div>
  );
}

function PageBackCover() {
  return (
    <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden",background:"linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)",backgroundImage:GRAIN+",linear-gradient(160deg,#162D56 0%,#0D1F3A 50%,#0A1628 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",bottom:24,left:0,right:0,height:8,background:"repeating-linear-gradient(90deg,transparent 0,transparent 7px,rgba(196,163,90,0.15) 7px,rgba(196,163,90,0.15) 9px)"}}/>
      <div style={{position:"absolute",top:24,left:0,right:0,height:8,background:"repeating-linear-gradient(90deg,transparent 0,transparent 7px,rgba(196,163,90,0.15) 7px,rgba(196,163,90,0.15) 9px)"}}/>
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none" style={{opacity:0.25}}>
        <path d="M3 10 Q3 6 7 6 L14 8 Q17 9 17 10 Q17 11 14 12 L7 14 Q3 14 3 10Z" stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)"/>
        <circle cx="17.5" cy="10" r="1.5" fill="#C4A35A"/>
      </svg>
    </div>
  );
}

// ── What goes on each face of a page ─────────────────────────────────
// Each "leaf" has a front and a back face.
// spread S → page leaf index P = S (we reveal left/right by stacking, not leaves)
// Actually: we model pages as single-leaf elements.
// front = right side when closed / back = left side when flipped
function getPageContent(spread: number, side: "front"|"back", loc: typeof locations[0]|null, visit: Visit|null, photoUrl: string|null) {
  // Cover spread (0): front=cover, back=inside-cover
  if (spread === 0) return side === "front" ? <PageCoverFront/> : <PageContents/>;
  // Intro spread (1): front=contents-right, back=first-PPC-left  (but we handle intro as special)
  if (spread === 1) return side === "front" ? <PageContents/> : <PageBackMatter/>;
  // PPC spreads
  if (loc) return side === "front" ? <PageLeft loc={loc} visit={visit} photoUrl={photoUrl}/> : <PageRight loc={loc} visit={visit}/>;
  // Back spreads
  if (spread === TOTAL_SPREADS-2) return side === "front" ? <PageBackMatter/> : <PageBackCover/>;
  if (spread === TOTAL_SPREADS-1) return side === "front" ? <PageBackCover/> : <PageBackCover/>;
  return <div style={{background:"#F7EFDB",width:"100%",height:"100%"}}/>;
}

// ── Flip state machine ───────────────────────────────────────────────
// currentPage = the page index (0..TOTAL_SPREADS-1) we're ON
// A "page turn forward" flips the right page of current spread to left
// Each leaf has: front (shown when leaf is on right stack) and back (shown when on left stack)

export default function BookPage() {
  // current leaf index (0 = cover, 103 = back cover)
  const [page, setPage]         = useState(0);
  // Pages currently mid-flip (Map from index to angle -180..0)
  const [flipAngles, setFlipAngles] = useState<Record<number, number>>({});
  const [visits, setVisits]     = useState<Record<number, Visit>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});

  // Drag state
  const dragRef = useRef<{ pageIdx:number; startX:number; startAngle:number; active:boolean }>({ pageIdx:-1, startX:0, startAngle:0, active:false });
  const rafRef  = useRef<number>(0);
  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    setVisits(getVisits());
    const h = ()=>setVisits(getVisits());
    window.addEventListener("philately:update",h);
    return ()=>window.removeEventListener("philately:update",h);
  },[]);

  // Lazy-load photos for adjacent pages
  useEffect(()=>{
    const load = async ()=>{
      const toLoad = [page-1, page, page+1, page+2];
      for (const s of toLoad) {
        const sno = s - COVER_SPREADS + 1;
        if (sno<1||sno>100||photoUrls[sno]) continue;
        try { const ps=await getPhotos(sno); if(ps.length) { const url=blobToUrl(ps[0].blob); setPhotoUrls(p=>({...p,[sno]:url})); } } catch{}
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[page]);

  // Animate a flip smoothly
  const animateFlip = useCallback((leafIdx:number, fromAngle:number, toAngle:number, onDone:()=>void)=>{
    const el = document.querySelector(`[data-leaf="${leafIdx}"]`) as HTMLElement|null;
    if (!el) { onDone(); return; }
    el.style.willChange = "transform";
    el.style.transition = "transform 700ms cubic-bezier(0.45,0.05,0.55,0.95)";
    setFlipAngles(prev=>({...prev,[leafIdx]:toAngle}));
    const tid = setTimeout(()=>{ el.style.transition=""; el.style.willChange="auto"; onDone(); },720);
    return ()=>clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const goForward = useCallback(()=>{
    if (page >= TOTAL_SPREADS-1) return;
    const leafIdx = page;
    setFlipAngles(prev=>({...prev,[leafIdx]:0}));
    animateFlip(leafIdx, 0, -180, ()=>{ setPage(p=>p+1); setFlipAngles(prev=>{ const n={...prev}; delete n[leafIdx]; return n; }); });
  },[page, animateFlip]);

  const goBackward = useCallback(()=>{
    if (page <= 0) return;
    const leafIdx = page-1;
    setFlipAngles(prev=>({...prev,[leafIdx]:-180}));
    animateFlip(leafIdx, -180, 0, ()=>{ setPage(p=>p-1); setFlipAngles(prev=>{ const n={...prev}; delete n[leafIdx]; return n; }); });
  },[page, animateFlip]);

  const goTo = useCallback((target:number)=>{
    if (target===page) return;
    setPage(target);
  },[page]);

  // Keyboard
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(e.key==="ArrowRight"||e.key==="ArrowDown") goForward();
      if(e.key==="ArrowLeft" ||e.key==="ArrowUp")   goBackward();
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[goForward,goBackward]);

  const collectedCount = Object.keys(visits).length;
  const pct = Math.round((collectedCount/100)*100);

  // Current location
  const locIdx = page - COVER_SPREADS;
  const loc    = (locIdx>=0&&locIdx<TOTAL_LOCATIONS) ? locations[locIdx] : null;
  const visit  = loc ? (visits[loc.sno]??null) : null;
  const photoUrl = loc ? (photoUrls[loc.sno]??null) : null;

  // We render the book as two static pages (left/right) plus a flipping overlay
  // Left page content = previous spread's right face
  // Right page content = current spread's left face
  const prevLoc   = (locIdx-1>=0&&locIdx-1<TOTAL_LOCATIONS) ? locations[locIdx-1] : null;
  const prevVisit = prevLoc ? (visits[prevLoc.sno]??null) : null;
  const prevPhotoUrl = prevLoc ? (photoUrls[prevLoc.sno]??null) : null;

  return (
    <div style={{ background:"#0E0804", minHeight:"100vh", display:"flex", flexDirection:"column" }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{ background:"var(--spine)", borderBottom:"1px solid rgba(196,163,90,0.18)", padding:"9px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Link href="/" style={{color:"rgba(196,163,90,0.55)",display:"flex",alignItems:"center",gap:4,textDecoration:"none",fontFamily:"var(--font-display)",fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>
            <Home size={11}/> Home
          </Link>
          <span style={{color:"rgba(196,163,90,0.2)"}}>·</span>
          <Link href="/passport" style={{color:"rgba(196,163,90,0.55)",display:"flex",alignItems:"center",gap:4,textDecoration:"none",fontFamily:"var(--font-display)",fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>
            <BookOpen size={11}/> Passport
          </Link>
          {loc && <>
            <span style={{color:"rgba(196,163,90,0.2)"}}>·</span>
            <span style={{fontFamily:"var(--font-display)",fontSize:"0.58rem",letterSpacing:"0.06em",color:"var(--sandstone)"}}>PPC #{String(loc.sno).padStart(3,"0")} — {loc.place}</span>
          </>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:56,height:3,background:"rgba(196,163,90,0.12)",overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:"var(--sandstone)",transition:"width 0.4s"}}/>
            </div>
            <span style={{fontFamily:"var(--font-display)",fontSize:"0.55rem",color:"rgba(196,163,90,0.45)",letterSpacing:"0.06em"}}>{collectedCount}/100</span>
          </div>
          <span style={{fontFamily:"var(--font-display)",fontSize:"0.55rem",color:"rgba(196,163,90,0.3)",letterSpacing:"0.06em"}}>{page+1}/{TOTAL_SPREADS}</span>
        </div>
      </div>

      {/* ── Book stage ───────────────────────────────────────────── */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"24px 64px 16px",
        /* Warm amber desk surface */
        background:"radial-gradient(ellipse 80% 60% at 50% 70%, #2A1A0A 0%, #0E0804 100%)",
        position:"relative",
      }}>

        {/* Desk surface glow */}
        <div style={{ position:"absolute", bottom:0, left:"15%", right:"15%", height:80, background:"radial-gradient(ellipse, rgba(196,163,90,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>

        {/* Book drop shadow on desk */}
        <div style={{ position:"absolute", bottom:"14%", left:"50%", transform:"translateX(-50%)", width:"60%", height:22, background:"radial-gradient(ellipse, rgba(0,0,0,0.65) 0%, transparent 70%)", filter:"blur(10px)", pointerEvents:"none" }}/>

        {/* ── THE BOOK ─────────────────────────────────────────── */}
        {/*
          Perspective on this wrapper (rule #1).
          The book is two page areas side by side.
          The flipping page overlays one side.
        */}
        <div
          ref={bookRef}
          style={{
            width:"min(860px,92vw)",
            height:"min(560px,65vh)",
            perspective:"2400px",         /* rule #1 */
            perspectiveOrigin:"50% 45%",
            position:"relative",
          }}
        >
          {/* The physical open book — both pages as one unit, slightly tilted */}
          <div style={{
            width:"100%", height:"100%",
            display:"flex",
            transform:"rotateX(3deg)",
            transformStyle:"preserve-3d",
            boxShadow:"0 18px 55px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.35)",
            borderRadius:"2px 4px 4px 2px",
          }}>

            {/* ── LEFT page (shows previous spread's right face) ── */}
            <div style={{
              flex:1, overflow:"hidden",
              borderRadius:"2px 0 0 2px",
              boxShadow:"inset -8px 0 20px rgba(26,14,6,0.14)",
              position:"relative",
            }}>
              {page===0 ? (
                /* Before any flip: show cover back */
                <PageCoverFront/>
              ) : page===1 ? (
                <PageContents/>
              ) : prevLoc ? (
                <PageRight loc={prevLoc} visit={prevVisit}/>
              ) : (
                <PageBackMatter/>
              )}

              {/* Hover arrow hint */}
              {page>0 && (
                <div onClick={goBackward} style={{position:"absolute",left:0,top:0,bottom:0,width:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-start",paddingLeft:8,background:"linear-gradient(to right,rgba(26,14,6,0.06),transparent)",opacity:0,transition:"opacity 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0")}>
                  <ChevronLeft size={14} style={{color:"var(--copper)",opacity:0.55}}/>
                </div>
              )}
            </div>

            {/* ── SPINE ─────────────────────────────────────────── */}
            <div style={{
              width:18, flexShrink:0,
              background:"linear-gradient(90deg,rgba(26,14,6,0.3) 0%,rgba(26,14,6,0.08) 40%,rgba(26,14,6,0.02) 50%,rgba(26,14,6,0.08) 60%,rgba(26,14,6,0.25) 100%)",
              position:"relative",
            }}>
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(26,14,6,0.12)"}}/>
            </div>

            {/* ── RIGHT page (shows current spread's right face) ── */}
            <div style={{
              flex:1, overflow:"hidden",
              borderRadius:"0 4px 4px 0",
              boxShadow:"inset 8px 0 20px rgba(26,14,6,0.1)",
              position:"relative",
            }}>
              {page===0 ? (
                <PageCoverFront/>
              ) : loc ? (
                <PageRight loc={loc} visit={visit}/>
              ) : page===TOTAL_SPREADS-2 ? (
                <PageBackMatter/>
              ) : (
                <PageBackCover/>
              )}

              {/* Hover arrow hint */}
              {page<TOTAL_SPREADS-1 && (
                <div onClick={goForward} style={{position:"absolute",right:0,top:0,bottom:0,width:44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8,background:"linear-gradient(to left,rgba(26,14,6,0.06),transparent)",opacity:0,transition:"opacity 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0")}>
                  <ChevronRight size={14} style={{color:"var(--copper)",opacity:0.55}}/>
                </div>
              )}
            </div>
          </div>

          {/* ── FLIPPING PAGE OVERLAY ─────────────────────────── */}
          {/* This is the 3D leaf that rotates over the top.
              transform-origin: left center → hinges at the spine (rule #2)
              Front face = left page content (visible before 90°)
              Back  face = right page content (visible after 90°) — rule #3 */}
          {Object.entries(flipAngles).map(([leafStr, angle])=>{
            const leafIdx = Number(leafStr);
            const leafLoc   = (leafIdx-COVER_SPREADS>=0&&leafIdx-COVER_SPREADS<TOTAL_LOCATIONS) ? locations[leafIdx-COVER_SPREADS] : null;
            const leafVisit = leafLoc ? (visits[leafLoc.sno]??null) : null;
            const leafPhoto = leafLoc ? (photoUrls[leafLoc.sno]??null) : null;
            const shadow = Math.abs(angle+90)/90; // 0 at rest, 1 at 90°
            return (
              <div key={leafIdx}
                data-leaf={leafIdx}
                style={{
                  position:"absolute",
                  top:0, left:"calc(50% + 9px)", /* start at right half */
                  width:"calc(50% - 9px)", height:"100%",
                  transformStyle:"preserve-3d",  /* rule #3 needs this */
                  transformOrigin:"left center",   /* rule #2: spine hinge */
                  transform:`rotateY(${angle}deg)`,
                  zIndex:50,
                  pointerEvents:"none",
                }}
              >
                {/* Front face (what you see while page is still on right stack) */}
                <div style={{ position:"absolute", inset:0, backfaceVisibility:"hidden", overflow:"hidden", borderRadius:"0 4px 4px 0" }}>
                  {leafLoc ? <PageLeft loc={leafLoc} visit={leafVisit} photoUrl={leafPhoto}/> : <PageCoverFront/>}
                  {/* Shadow overlay tied to flip progress (rule: shadow sells illusion) */}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(26,14,6,0.35),rgba(26,14,6,0.05) 60%,transparent)", opacity:shadow, pointerEvents:"none" }}/>
                </div>

                {/* Back face (visible after 90° — rule #3) */}
                <div style={{ position:"absolute", inset:0, backfaceVisibility:"hidden", transform:"rotateY(180deg)", overflow:"hidden", borderRadius:"2px 0 0 2px" }}>
                  {leafLoc ? <PageRight loc={leafLoc} visit={leafVisit}/> : <PageContents/>}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to left,rgba(26,14,6,0.35),rgba(26,14,6,0.05) 60%,transparent)", opacity:shadow, pointerEvents:"none" }}/>
                </div>
              </div>
            );
          })}

          {/* ── Page-edge tap targets (full-height clickable strips) ─ */}
          {page > 0 && (
            <button onClick={goBackward} aria-label="Previous page"
              style={{ position:"absolute", left:0, top:0, bottom:0, width:56, background:"transparent", border:"none", cursor:"pointer", zIndex:40 }}/>
          )}
          {page < TOTAL_SPREADS-1 && (
            <button onClick={goForward} aria-label="Next page"
              style={{ position:"absolute", right:0, top:0, bottom:0, width:56, background:"transparent", border:"none", cursor:"pointer", zIndex:40 }}/>
          )}
        </div>

        {/* ── External nav arrows ────────────────────────────── */}
        <button onClick={goBackward} disabled={page===0}
          style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", background:page===0?"rgba(26,14,6,0.2)":"rgba(196,163,90,0.12)", border:"1px solid rgba(196,163,90,0.2)", color:page===0?"rgba(196,163,90,0.2)":"var(--sandstone)", cursor:page===0?"not-allowed":"pointer", padding:"13px 9px", lineHeight:1, transition:"all 0.15s" }}>
          <ChevronLeft size={18}/>
        </button>
        <button onClick={goForward} disabled={page===TOTAL_SPREADS-1}
          style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:page===TOTAL_SPREADS-1?"rgba(26,14,6,0.2)":"rgba(196,163,90,0.12)", border:"1px solid rgba(196,163,90,0.2)", color:page===TOTAL_SPREADS-1?"rgba(196,163,90,0.2)":"var(--sandstone)", cursor:page===TOTAL_SPREADS-1?"not-allowed":"pointer", padding:"13px 9px", lineHeight:1, transition:"all 0.15s" }}>
          <ChevronRight size={18}/>
        </button>
      </div>

      {/* ── Bottom toolbar ────────────────────────────────────────── */}
      <div style={{ background:"rgba(6,3,0,0.92)", borderTop:"1px solid rgba(196,163,90,0.1)", padding:"7px 14px", display:"flex", alignItems:"center", gap:10, flexShrink:0, overflowX:"auto" }}>
        <button onClick={()=>goTo(0)}
          style={{ fontFamily:"var(--font-display)", fontSize:"0.52rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"5px 10px", background:page===0?"var(--sandstone)":"transparent", color:page===0?"var(--spine)":"rgba(196,163,90,0.45)", border:"1px solid rgba(196,163,90,0.18)", cursor:"pointer", flexShrink:0 }}>
          Cover
        </button>

        {/* District chips */}
        <div style={{display:"flex",gap:4,overflowX:"auto",flex:1,scrollbarWidth:"none"}}>
          {Array.from(new Set(locations.map(l=>l.district))).map(d=>{
            const first = locations.find(l=>l.district===d);
            const isActive = loc?.district===d;
            return (
              <button key={d} onClick={()=>first&&goTo(COVER_SPREADS+first.sno-1)}
                style={{ fontFamily:"var(--font-display)", fontSize:"0.48rem", letterSpacing:"0.08em", textTransform:"uppercase", padding:"4px 8px", background:isActive?"var(--sandstone)":"transparent", color:isActive?"var(--spine)":"rgba(196,163,90,0.35)", border:isActive?"1px solid var(--gilt)":"1px solid rgba(196,163,90,0.12)", cursor:"pointer", flexShrink:0, transition:"all 0.1s", whiteSpace:"nowrap" }}>
                {d.slice(0,8)}
              </button>
            );
          })}
        </div>

        {/* PPC jump */}
        <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          <span style={{fontFamily:"var(--font-display)",fontSize:"0.52rem",color:"rgba(196,163,90,0.3)",letterSpacing:"0.08em"}}>PPC</span>
          <input type="number" min="1" max="100" placeholder="1–100"
            onKeyDown={e=>{
              if (e.key==="Enter") {
                const val=parseInt((e.target as HTMLInputElement).value);
                if(val>=1&&val<=100){goTo(COVER_SPREADS+val-1);(e.target as HTMLInputElement).value="";}
              }
            }}
            style={{ width:50, padding:"4px 6px", background:"rgba(196,163,90,0.07)", border:"1px solid rgba(196,163,90,0.18)", color:"var(--sandstone)", fontFamily:"var(--font-display)", fontSize:"0.6rem", outline:"none", textAlign:"center" }}
          />
        </div>
      </div>
    </div>
  );
}
