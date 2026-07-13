import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: "#F1EEE8", deep: "#E9E4D6", soft: "#F6F4EF" },
        olive: { DEFAULT: "#787E59", deep: "#565B3F", mist: "#A9AE93" },
        ink: "#23261C",
        silver: "#B9BCB2",
        plum: "#4A3247",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        "display-ar": ["var(--font-display-ar)", "serif"],
        "body-ar": ["var(--font-body-ar)", "sans-serif"],
      },
      letterSpacing: { luxe: "0.28em", wide2: "0.14em" },
      transitionTimingFunction: { luxe: "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        bloom: {
          "0%": { opacity: "0", transform: "scale(0.4)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        bloom: "bloom 0.9s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
