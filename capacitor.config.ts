import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.karnataka.philately.passport",
  appName: "Karnataka Philately Passport",
  webDir: "out",
  plugins: {
    // SplashScreen: auto-hide after web content loads
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0D1F3A",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    // Capacitor Camera — used for photo uploads
    Camera: {
      // permissions declared in AndroidManifest.xml
    },
  },
};

export default config;
