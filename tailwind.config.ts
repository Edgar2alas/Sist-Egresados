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
        naranja: {
          DEFAULT: "#cc7000",
          light:   "#FFF3E0",
        },
        // Azul institucional profundo (headers, footers, secciones oscuras)
        institucional: {
          DEFAULT: "#001d3d",
          mid:     "#003666",
          light:   "#00447e",
          muted:   "#002a52",
        },
        // Azul de acción y acento de carrera
        accion: {
          DEFAULT: "#00447e",
          dark:    "#002956",
          hover:   "#003a6b",
        },
        // Naranja de énfasis (CTAs, badges, highlights)
        enfasis: {
          DEFAULT: "#ea580c",
          dark:    "#c2410c",
          light:   "#FFF3E0",
          pale:    "#FEF2F2",
        },
        // Textos
        pizarra:  "#1E293B",
        grafito:  "#475569",
        placeholder: "#94A3B8",
        // Fondos
        humo:    "#F8FAFC",
        crema:   "#f1f5f9",
        // Bordes
        borde:        "#E2E8F0",
        "borde-suave": "#EEF2F7",
        // Alias primary para compatibilidad
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
        mono:    ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Escala de texto ligeramente generosa (igual que el proyecto fuente)
        "xs":   ["13px", { lineHeight: "1.4" }],
        "sm":   ["15px", { lineHeight: "1.5" }],
        "base": ["17px", { lineHeight: "1.6" }],
        "lg":   ["19px", { lineHeight: "1.6" }],
      },
      letterSpacing: {
        widest: "0.4em",
        wider:  "0.3em",
        wide:   "0.2em",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        // Sombras turquesa (acciones primarias de tu sistema)
        "turq":    "0 4px 16px rgba(0,165,168,0.20)",
        "turq-lg": "0 10px 30px rgba(0,165,168,0.25)",
        // Sombras naranja (énfasis/CTAs del proyecto fuente)
        "enfasis":    "0 4px 16px rgba(234,88,12,0.20)",
        "enfasis-lg": "0 10px 30px rgba(234,88,12,0.30)",
        // Sombras azul institucional
        "institucional":    "0 4px 16px rgba(0,68,126,0.20)",
        "institucional-lg": "0 15px 40px rgba(0,29,61,0.20)",
        // Cards generales
        "card":       "0 1px 3px rgba(30,41,59,0.06), 0 1px 2px rgba(30,41,59,0.04)",
        "card-hover": "0 4px 12px rgba(30,41,59,0.08), 0 2px 4px rgba(30,41,59,0.04)",
        "card-xl":    "0 10px 30px rgba(30,41,59,0.10), 0 4px 8px rgba(30,41,59,0.06)",
      },
      backgroundImage: {
        // Gradientes institucionales del proyecto fuente
        "grad-header":  "linear-gradient(135deg, #00447e 0%, #003a6b 50%, #00325a 100%)",
        "grad-footer":  "linear-gradient(170deg, #001d3d 0%, #003d6e 50%, #00447e 100%)",
        "grad-hero":    "linear-gradient(160deg, #001d3d 0%, #003666 55%, #00447e 100%)",
        "grad-cta":     "linear-gradient(135deg, #00447e 0%, #00447ecc 100%)",
        "grad-enfasis": "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
        "grad-sia":     "linear-gradient(135deg, #ffffff 0%, #e8f4f8 100%)",
      },
      keyframes: {
        fadeUp:  { from:{ opacity:"0", transform:"translateY(14px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        fadeIn:  { from:{ opacity:"0" }, to:{ opacity:"1" } },
        slideIn: { from:{ opacity:"0", transform:"translateX(-12px)" }, to:{ opacity:"1", transform:"translateX(0)" } },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up":  "fadeUp .35s cubic-bezier(.16,1,.3,1) both",
        "fade-in":  "fadeIn .25s ease-out both",
        "slide-in": "slideIn .3s cubic-bezier(.16,1,.3,1) both",
        "shimmer":  "shimmer 2s infinite linear",
        "marquee":  "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;