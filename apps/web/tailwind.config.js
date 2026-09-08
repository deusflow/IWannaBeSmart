/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FAFAF7",
          muted: "#F1F1EB",
        },
        ink: {
          DEFAULT: "#1E293B",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        accent: {
          blue: "#2563EB",
          ok: "#16A34A",
          break: "#DC2626",
          signal: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};
