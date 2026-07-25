import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karnataka Philately Passport",
  description:
    "Digital companion to the Karnataka Philately Passport V3 — track 100 permanent pictorial cancellations across Karnataka",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ background: "#FDF5E6" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="chalukya-border py-3 text-center text-xs" style={{ color: "#8B4513", fontFamily: "var(--font-body)" }}>
          Karnataka Philately Passport V3 &bull; 100 Permanent Pictorial Cancellations &bull; India Post
        </footer>
      </body>
    </html>
  );
}
