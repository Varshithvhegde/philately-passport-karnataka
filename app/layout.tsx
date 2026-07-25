import type { Metadata } from "next";
import { EB_Garamond, Lora, Tiro_Kannada } from "next/font/google";
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

export const metadata: Metadata = {
  title: "ಕರ್ನಾಟಕ ಫಿಲಾಟೆಲಿ ಪಾಸ್ಪೋರ್ಟ್ | Karnataka Philately Passport",
  description:
    "Digital companion to the Karnataka Philately Passport V3 — 100 permanent pictorial cancellations across Karnataka's heritage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kn" className={`${garamond.variable} ${lora.variable} ${tiroKannada.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ background: "var(--ivory)" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <div className="hoysala-rule-thin" />
        <div
          className="py-3 text-center"
          style={{
            background: "var(--temple)",
            color: "var(--stone)",
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
          }}
        >
          ಕರ್ನಾಟಕ ವೃತ್ತ &nbsp;·&nbsp; KARNATAKA CIRCLE &nbsp;·&nbsp; 100 PERMANENT PICTORIAL CANCELLATIONS &nbsp;·&nbsp; INDIA POST
        </div>
      </body>
    </html>
  );
}
