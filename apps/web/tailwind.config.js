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
          '"Plus Jakarta Sans"',
          '"Inter Tight"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        sans: [
          '"Plus Jakarta Sans"',
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
        porcelain: {
          DEFAULT: "#F8F9FA", // Pure porcelain canvas
          subtle: "#FFFFFF", // Pure white elevated card
          muted: "#F0F2F5", // Subtle soft platinum field
          border: "rgba(15, 23, 42, 0.08)", // Ultra-crisp hairline
        },
        paper: {
          DEFAULT: "#F8F9FA", // Alabaster porcelain canvas
          subtle: "#FFFFFF", // Pure white card surface
          muted: "#F0F2F5", // Clean platinum recessed surface
          border: "rgba(15, 23, 42, 0.08)", // Delicate hairline border
        },
        titanium: {
          DEFAULT: "#2B2F38", // Satin medium titanium / graphite
          light: "#3E4450", // Hover titanium
          dark: "#1A1D24", // Deep titanium
          border: "rgba(255, 255, 255, 0.12)",
          surface: "#F1F3F6", // Light titanium wash
        },
        graphite: {
          DEFAULT: "#1E2229",
          muted: "#4A5260",
        },
        obsidian: {
          DEFAULT: "#0F141C", // Pure luxury obsidian black
          light: "#1E2229",
          muted: "#252932",
        },
        ink: {
          DEFAULT: "#0F141C", // Obsidian Black text
          light: "#F8F9FA",
          muted: "#525866", // Refined neutral slate
          subtle: "#868C98", // Delicate micro-annotations
          border: "rgba(15, 23, 42, 0.12)",
        },
        gold: {
          DEFAULT: "#C5A059", // Champagne / Platinum Gold
          light: "#FBF7EF",
          hover: "#B28D44",
          border: "rgba(197, 160, 89, 0.28)",
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
        "2xs": "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        xs: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "paper-sm": "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        paper:
          "0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)",
        "paper-lg":
          "0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
        porcelain:
          "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
        luxury:
          "0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
        "glow-gold": "0 0 16px rgba(197, 160, 89, 0.35)",
        "glow-emerald": "0 0 16px rgba(16, 185, 129, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      spacing: {
        "0.2": "0.05rem",
      },
      scale: {
        "115": "1.15",
      },
      ringWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};
