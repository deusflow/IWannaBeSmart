import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@iw/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@iw/i18n": path.resolve(__dirname, "../../packages/i18n/src/index.ts"),
      "@iw/sim-engine": path.resolve(__dirname, "../../packages/sim-engine/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
});
