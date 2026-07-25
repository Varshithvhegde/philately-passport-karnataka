"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/passport", label: "Passport" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <>
      <div className="hoysala-rule" />
      <header style={{ background: "var(--temple)" }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: 54 }}>
          <Link href="/" className="flex items-center gap-3">
            {/* Compass-rose medallion mark */}
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="13.5" stroke="#C4A35A" strokeWidth="1.5" />
              <circle cx="15" cy="15" r="9" stroke="#C4A35A" strokeWidth="0.8" strokeDasharray="2.5 2" />
              <circle cx="15" cy="15" r="2.8" fill="#C4A35A" />
              <line x1="15" y1="1.5" x2="15" y2="6" stroke="#C4A35A" strokeWidth="1.5" />
              <line x1="15" y1="24" x2="15" y2="28.5" stroke="#C4A35A" strokeWidth="1.5" />
              <line x1="1.5" y1="15" x2="6" y2="15" stroke="#C4A35A" strokeWidth="1.5" />
              <line x1="24" y1="15" x2="28.5" y2="15" stroke="#C4A35A" strokeWidth="1.5" />
              <line x1="6.5" y1="6.5" x2="9" y2="9" stroke="#C4A35A" strokeWidth="0.8" opacity="0.6" />
              <line x1="21" y1="21" x2="23.5" y2="23.5" stroke="#C4A35A" strokeWidth="0.8" opacity="0.6" />
              <line x1="6.5" y1="23.5" x2="9" y2="21" stroke="#C4A35A" strokeWidth="0.8" opacity="0.6" />
              <line x1="21" y1="9" x2="23.5" y2="6.5" stroke="#C4A35A" strokeWidth="0.8" opacity="0.6" />
            </svg>
            <div>
              <div style={{ fontFamily: "var(--font-kannada)", color: "#F8F0D8", fontSize: "0.92rem", lineHeight: 1.15 }}>
                ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್
              </div>
              <div style={{ fontFamily: "var(--font-display)", color: "var(--sandstone)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Karnataka · Version III
              </div>
            </div>
          </Link>

          <nav className="flex items-center">
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "6px 18px",
                  color: active ? "var(--temple)" : "var(--sandstone)",
                  background: active ? "var(--sandstone)" : "transparent",
                  transition: "all 0.15s",
                }}>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="hoysala-rule-thin" />
    </>
  );
}
