"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, BookOpen, LayoutGrid } from "lucide-react";

const links = [
  { href: "/",         label: "Home",     icon: LayoutGrid },
  { href: "/map",      label: "Map",      icon: MapPin },
  { href: "/passport", label: "Passport", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header style={{ background: "#5C3317", borderBottom: "3px solid #C4A35A" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl" style={{ color: "#C4A35A" }}>✦</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "#F5E9CC", letterSpacing: "0.04em" }}>
            Karnataka Philately Passport
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: "#C4A35A", color: "#5C3317", fontWeight: 700 }}>V3</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors"
                style={{
                  background: active ? "#C4A35A" : "transparent",
                  color: active ? "#5C3317" : "#EAD9B8",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
