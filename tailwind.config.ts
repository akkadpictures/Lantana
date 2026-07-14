import type { Config } from "tailwindcss";

/**
 * One type scale, one spacing rhythm.
 *
 * Every size below is a step on a single ratio (~1.25) anchored at a 17px body,
 * so a heading is never "a bit bigger than" the one beside it — it is a
 * deliberate step away. Line heights loosen as type grows: display sizes are set
 * tight because at 60px generous leading reads as a gap, not as air.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: "#F1EEE8", deep: "#E9E4D6", soft: "#F6F4EF" },
        olive: { DEFAULT: "#787E59", deep: "#565B3F", mist: "#A9AE93", pale: "#D5D8C9" },
        ink: { DEFAULT: "#23261C", soft: "#3C4034" },
        silver: "#B9BCB2",
        plum: "#4A3247",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        "display-ar": ["var(--font-display-ar)", "serif"],
        "body-ar": ["var(--font-body-ar)", "sans-serif"],
      },
      fontSize: {
        /* Utility / label tier */
        micro: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.18em" }],
        label: ["0.8125rem", { lineHeight: "1.45", letterSpacing: "0.16em" }],
        nav: ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
        /* Reading tier */
        sm2: ["0.9375rem", { lineHeight: "1.7" }],
        base2: ["1.0625rem", { lineHeight: "1.75" }],
        lead: ["1.1875rem", { lineHeight: "1.75" }],
        /* Display tier */
        d1: ["clamp(2.75rem, 6vw, 4.75rem)", { lineHeight: "1.05", letterSpacing: "0.02em" }],
        d2: ["clamp(2.25rem, 4.4vw, 3.5rem)", { lineHeight: "1.12", letterSpacing: "0.02em" }],
        d3: ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.2", letterSpacing: "0.03em" }],
        d4: ["clamp(1.375rem, 2.2vw, 1.75rem)", { lineHeight: "1.3", letterSpacing: "0.04em" }],
        d5: ["1.25rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
      },
      letterSpacing: { luxe: "0.28em", wide2: "0.14em" },
      transitionTimingFunction: { luxe: "cubic-bezier(0.22, 1, 0.36, 1)" },
      maxWidth: { prose2: "68ch" },
      keyframes: {
        bloom: {
          "0%": { opacity: "0", transform: "scale(0.4)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        bloom: "bloom 0.9s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 2.4s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
