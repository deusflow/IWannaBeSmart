import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/IWannaBeSmart/",
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
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/zustand/") || id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@uiw/react-codemirror") || id.includes("node_modules/@codemirror")) {
            return "vendor-codemirror";
          }
          if (id.includes("node_modules/@xyflow")) {
            return "vendor-xyflow";
          }
          if (id.includes("node_modules/@supabase")) {
            return "vendor-supabase";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("packages/i18n")) {
            return "i18n-translations";
          }
          if (id.includes("packages/sim-engine")) {
            return "sim-engine-core";
          }
        },
      },
    },
  },
});
