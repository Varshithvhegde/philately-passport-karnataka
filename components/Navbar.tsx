"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",         label: "Home" },
  { href: "/map",      label: "Map" },
  { href: "/passport", label: "Passport" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* India Post red accent stripe — 3px at very top */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #C4391A 0%, #E05020 50%, #C4391A 100%)" }} />

      <header style={{ background: "var(--spine)", borderBottom: "1px solid rgba(196,163,90,0.2)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 58 }}>

          {/* Logotype */}
          <Link href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            {/* Postal horn / compass — India Post's own mark simplified */}
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              {/* Outer ring */}
              <circle cx="17" cy="17" r="15.5" stroke="#C4A35A" strokeWidth="1"/>
              {/* Inner ring */}
              <circle cx="17" cy="17" r="10" stroke="#C4A35A" strokeWidth="0.6" strokeDasharray="2.5 2"/>
              {/* Postal horn shape */}
              <path d="M10 17 Q10 12 15 12 L22 14 Q25 15 25 17 Q25 19 22 20 L15 22 Q10 22 10 17Z"
                stroke="#C4A35A" strokeWidth="1" fill="rgba(196,163,90,0.08)"/>
              <circle cx="26" cy="17" r="2" fill="#C4A35A" fillOpacity="0.7"/>
              {/* Compass cardinal marks */}
              <line x1="17" y1="1.5" x2="17" y2="5"   stroke="#C4A35A" strokeWidth="1.2"/>
              <line x1="17" y1="29" x2="17" y2="32.5"  stroke="#C4A35A" strokeWidth="1.2"/>
              <line x1="1.5" y1="17" x2="5" y2="17"   stroke="#C4A35A" strokeWidth="1.2"/>
              <line x1="29" y1="17" x2="32.5" y2="17"  stroke="#C4A35A" strokeWidth="1.2"/>
            </svg>

            <div>
              <div style={{
                fontFamily: "var(--font-kannada)",
                color: "#E8D9B8",
                fontSize: "1rem",
                lineHeight: 1.1,
                letterSpacing: "0.01em",
              }}>
                ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
              </div>
              <div style={{
                fontFamily: "var(--font-display)",
                color: "rgba(196,163,90,0.65)",
                fontSize: "0.58rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginTop: 1,
              }}>
                Karnataka · Version III
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "8px 18px",
                    color: active ? "var(--spine)" : "rgba(196,163,90,0.8)",
                    background: active ? "var(--sandstone)" : "transparent",
                    borderTop:    active ? "1px solid var(--gilt)"  : "1px solid transparent",
                    borderLeft:   active ? "1px solid var(--gilt)"  : "1px solid transparent",
                    borderRight:  active ? "1px solid #060300" : "1px solid transparent",
                    borderBottom: active ? "1px solid #060300" : "1px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
