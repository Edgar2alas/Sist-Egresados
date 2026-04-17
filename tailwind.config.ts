import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta institucional Estadística UMSA
        turquesa: {
          DEFAULT: "#00A5A8",
          dark:    "#008A8D",
          light:   "#E0F7F7",
          pale:    "#F0FAFA",
        },
        marino: {
          DEFAULT: "#1E2B3B",
          mid:     "#243244",
          light:   "#2D3E52",
          muted:   "#3D5166",
        },
        verde: {
          DEFAULT: "#1a6b1a",
          light:   "#E8F5E8",
        },
        pizarra: "#1E293B",
        grafito: "#475569",
        humo:    "#F8FAFC",
        borde:   "#E2E8F0",
        // Mantener primary como alias de turquesa para compatibilidad
        primary: {
          50:  "#F0FAFA",
          100: "#E0F7F7",
          200: "#99E6E7",
          300: "#4DD4D5",
          400: "#00C2C4",
          500: "#00A5A8",
          600: "#008A8D",
          700: "#006E70",
          800: "#005254",
          900: "#003638",
          950: "#001A1B",
        },
      },
      fontFamily: {
        sans:    ["DM Sans", "system-ui", "sans-serif"],
        serif:   ["Source Serif 4", "Georgia", "serif"],
        display: ["Source Serif 4", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "turq": "0 4px 16px rgba(0,165,168,0.20)",
        "turq-lg": "0 10px 30px rgba(0,165,168,0.25)",
        "card": "0 1px 3px rgba(30,41,59,0.06), 0 1px 2px rgba(30,41,59,0.04)",
        "card-hover": "0 4px 12px rgba(30,41,59,0.08), 0 2px 4px rgba(30,41,59,0.04)",
      },
      keyframes: {
        fadeUp:  { from:{ opacity:"0", transform:"translateY(14px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        fadeIn:  { from:{ opacity:"0" }, to:{ opacity:"1" } },
        slideIn: { from:{ opacity:"0", transform:"translateX(-12px)" }, to:{ opacity:"1", transform:"translateX(0)" } },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up":  "fadeUp .35s cubic-bezier(.16,1,.3,1) both",
        "fade-in":  "fadeIn .25s ease-out both",
        "slide-in": "slideIn .3s cubic-bezier(.16,1,.3,1) both",
        "shimmer":  "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
} satisfies Config;
