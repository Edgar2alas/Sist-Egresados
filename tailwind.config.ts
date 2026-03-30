import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:"#f0f9ff", 100:"#e0f2fe", 200:"#bae6fd", 300:"#7dd3fc",
          400:"#38bdf8", 500:"#0ea5e9", 600:"#0284c7", 700:"#0369a1",
          800:"#075985", 900:"#0c4a6e", 950:"#082f49",
        },
      },
      fontFamily: {
        sans:    ["var(--font-geist)", "system-ui", "sans-serif"],
        display: ["var(--font-cal)",   "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: { from:{ opacity:"0", transform:"translateY(12px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        fadeIn: { from:{ opacity:"0" }, to:{ opacity:"1" } },
      },
      animation: {
        "fade-up": "fadeUp .3s ease-out both",
        "fade-in": "fadeIn .2s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
