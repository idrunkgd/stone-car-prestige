import type { Config } from "tailwindcss";

/**
 * Design System — Stone Car Prestige
 * Extrait de la banderole : noir profond, or métallisé (signature),
 * blanc cassé, rouge d'urgence. Ambiance nocturne, automobile, haut de gamme.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#F4F2EC", // texte principal (blanc cassé)
          muted: "#A2A0A6",
          faint: "#78767D",
        },
        night: {
          DEFAULT: "#0C0C0E", // fond
          2: "#121216",
          panel: "#17171C",
          panel2: "#1D1D23",
        },
        gold: {
          1: "#E9CE7B", // or clair
          DEFAULT: "#C9A227", // or signature
          2: "#C9A227",
          3: "#9C7B1E", // or profond
        },
        state: {
          red: "#C0392B",
          green: "#3FB27F",
          blue: "#4A90D9",
          orange: "#E08A2B",
        },
        line: {
          gold: "rgba(201,162,39,0.18)",
          soft: "rgba(255,255,255,0.07)",
        },
      },
      fontFamily: {
        display: ["var(--font-oswald)", "Oswald", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        premium: "0 20px 50px -20px rgba(0,0,0,0.7)",
        gold: "0 10px 24px -10px rgba(201,162,39,0.6)",
      },
      backgroundImage: {
        "gold-grad":
          "linear-gradient(135deg,#E9CE7B 0%,#C9A227 55%,#9C7B1E 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
