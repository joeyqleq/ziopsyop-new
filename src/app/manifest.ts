import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZIOPSYOP — Signal From Noise",
    short_name: "ZIOPSYOP",
    description:
      "Open-source forensic analysis of a coordinated influence operation targeting Lebanese communities on Reddit.",
    start_url: "/",
    display: "standalone",
    background_color: "#060608",
    theme_color: "#060608",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
