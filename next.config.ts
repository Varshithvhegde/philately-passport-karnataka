import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor Android app
  output: "export",
  // Disable image optimization (not available in static export)
  images: { unoptimized: true },
  // Trailing slash so file paths resolve correctly in WebView
  trailingSlash: true,
};

export default nextConfig;
