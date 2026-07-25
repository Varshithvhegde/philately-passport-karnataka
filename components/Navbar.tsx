"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/",         label: "Home" },
  { href: "/map",      label: "Map" },
  { href: "/passport", label: "Passport" },
];

export default function Navbar() {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={{ height: 3, background: "linear-gradient(90deg,#C4391A,#E05020 50%,#C4391A)" }} />
      <header style={{ background: "var(--spine)", borderBottom: "1px solid rgba(196,163,90,0.2)" }}>
        <div className="max-w-6xl mx-auto px-4" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="13.5" stroke="#C4A35A" strokeWidth="1.5" />
              <circle cx="15" cy="15" r="9" stroke="#C4A35A" strokeWidth="0.8" strokeDasharray="2.5 2" />
              <circle cx="15" cy="15" r="2.8" fill="#C4A35A" />
              <line x1="15" y1="1.5" x2="15" y2="6"   stroke="#C4A35A" strokeWidth="1.5" />
              <line x1="15" y1="24" x2="15" y2="28.5" stroke="#C4A35A" strokeWidth="1.5" />
              <line x1="1.5" y1="15" x2="6"  y2="15"  stroke="#C4A35A" strokeWidth="1.5" />
              <line x1="24"  y1="15" x2="28.5" y2="15" stroke="#C4A35A" strokeWidth="1.5" />
            </svg>
            <div>
              <div style={{ fontFamily: "var(--font-kannada)", color: "#E8D9B8", fontSize: "0.88rem", lineHeight: 1.1 }}>
                ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
              </div>
              <div style={{ fontFamily: "var(--font-display)", color: "rgba(196,163,90,0.55)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Karnataka · Version III
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="hide-mobile">
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{
                  fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "10px 18px",
                  color: active ? "var(--spine)" : "var(--sandstone)",
                  background: active ? "var(--sandstone)" : "transparent",
                  textDecoration: "none", transition: "all 0.15s", display: "block",
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="show-mobile"
            aria-label="Open menu"
            style={{
              display: "none", /* shown via .show-mobile CSS */
              background: "none", border: "none", cursor: "pointer",
              padding: "8px", color: "var(--sandstone)",
            }}
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
              <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="0" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`mobile-nav-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      {/* Mobile drawer */}
      <div className={`mobile-nav-drawer ${open ? "open" : ""}`}>
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 16px", borderBottom: "1px solid rgba(196,163,90,0.2)", marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--font-kannada)", color: "#E8D9B8", fontSize: "0.9rem" }}>
            ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sandstone)", padding: 6 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {links.map(({ href, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 22px",
              fontFamily: "var(--font-display)", fontSize: "0.9rem", letterSpacing: "0.1em",
              textTransform: "uppercase", textDecoration: "none",
              color: active ? "var(--sandstone)" : "rgba(196,163,90,0.7)",
              background: active ? "rgba(196,163,90,0.12)" : "transparent",
              borderLeft: active ? "3px solid var(--sandstone)" : "3px solid transparent",
            }}>
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
