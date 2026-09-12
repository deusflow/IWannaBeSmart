import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@iw/ui": path.resolve(__dirname, "packages/ui/src/index.ts"),
      "@iw/i18n": path.resolve(__dirname, "packages/i18n/src/index.ts"),
      "@iw/sim-engine": path.resolve(__dirname, "packages/sim-engine/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: [
      "packages/**/*.test.ts",
      "apps/**/*.test.ts",
      "apps/**/*.test.tsx",
    ],
  },
});
