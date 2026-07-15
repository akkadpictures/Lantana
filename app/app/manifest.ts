import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LANTANA — Maison de Parfum",
    short_name: "LANTANA",
    description: "Luxury eaux de parfum, born in Damascus.",
    start_url: "/",
    display: "standalone",
    background_color: "#F1EEE8",
    theme_color: "#787E59",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
