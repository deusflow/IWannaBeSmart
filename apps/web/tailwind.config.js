/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: [
          '"Sniglet"',
          '"Comfortaa"',
          '"Space Grotesk"',
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
        sniglet: [
          '"Sniglet"',
          '"Comfortaa"',
          "cursive",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          '"SF Mono"',
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        paper: {
          DEFAULT: "#F4F0E8", // Warm Cotton paper base
          subtle: "#FAF7F2", // Card / Surface background
          muted: "#EBE5DA", // Recessed track, subtle field
          border: "rgba(26, 29, 32, 0.10)", // Subtle paper hairline
        },
        ink: {
          DEFAULT: "#1A1D20", // Carbon / Graphite ink text
          muted: "#5A6065", // Technical secondary text
          subtle: "#858D94", // Delicate technical annotations
          border: "rgba(26, 29, 32, 0.15)",
        },
        accent: {
          blue: {
            DEFAULT: "#1E3A8A", // Blueprint / Ballpoint Navy
            hover: "#172554",
            light: "#EFF3FA",
            border: "rgba(30, 58, 138, 0.22)",
          },
          ok: {
            DEFAULT: "#1D5C42", // Deep Pine / Archive stamp
            hover: "#144230",
            light: "#EDF5F1",
            border: "rgba(29, 92, 66, 0.22)",
          },
          break: {
            DEFAULT: "#A82D24", // Cinnabar / Vermilion red
            hover: "#86231C",
            light: "#FBF1F0",
            border: "rgba(168, 45, 36, 0.22)",
          },
          signal: {
            DEFAULT: "#C06A1B", // Technical Amber / Ochre
            hover: "#9F5412",
            light: "#FCF6EE",
            border: "rgba(192, 106, 27, 0.22)",
          },
        },
      },
      boxShadow: {
        "paper-sm": "0 1px 2px 0 rgba(26, 29, 32, 0.04)",
        paper:
          "0 2px 6px -1px rgba(26, 29, 32, 0.06), 0 1px 3px 0 rgba(26, 29, 32, 0.03)",
        "paper-lg":
          "0 10px 25px -5px rgba(26, 29, 32, 0.06), 0 4px 10px -2px rgba(26, 29, 32, 0.03)",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};
