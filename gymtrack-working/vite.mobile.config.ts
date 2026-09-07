import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  base: "./",
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist-mobile",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.mobile.html",
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
});