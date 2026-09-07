import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.myroutine.app",
  appName: "MY routine",
  webDir: "dist-mobile",
  androidScheme: "https",
  plugins: {
    LocalNotifications: {
      iconColor: "#7c5cff",
    },
  },
};

export default config;