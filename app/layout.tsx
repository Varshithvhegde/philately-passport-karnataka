import type { Metadata } from "next";
import { EB_Garamond, Lora, Tiro_Kannada, Kalam } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const garamond = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const tiroKannada = Tiro_Kannada({
  variable: "--font-kannada",
  subsets: ["kannada", "latin"],
  weight: ["400"],
});

// Handwritten notes — the single typeface that makes this feel personal
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "ಕರ್ನಾಟಕ ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್ | Karnataka Philately Passport",
  description:
    "Digital companion to the Karnataka Philately Passport V3 — 100 permanent pictorial cancellations across Karnataka's heritage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kn" className={`${garamond.variable} ${lora.variable} ${tiroKannada.variable} ${kalam.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ background: "var(--ivory)" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <div className="hoysala-rule-thin" />
        <div style={{
          background: "var(--spine)",
          color: "rgba(196,163,90,0.7)",
          fontFamily: "var(--font-display)",
          fontSize: "0.62rem",
          letterSpacing: "0.16em",
          padding: "10px 0",
          textAlign: "center",
        }}>
          ಕರ್ನಾಟಕ ವೃತ್ತ &nbsp;·&nbsp; KARNATAKA CIRCLE &nbsp;·&nbsp; 100 PERMANENT PICTORIAL CANCELLATIONS &nbsp;·&nbsp; INDIA POST
        </div>
      </body>
    </html>
  );
}
