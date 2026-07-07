import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "THE DOSSIER — Subject Behavioral Forensics",
  description:
    "Deep behavioral forensics on 22 high-volume actors in the r/ForbiddenBromance influence operation. Cross-subreddit activity, temporal coordination, language fingerprinting, and persona contradiction analysis.",
  alternates: { canonical: "https://ziopsyop.me/forensics" },
  openGraph: {
    type: "article",
    url: "https://ziopsyop.me/forensics",
    title: "THE DOSSIER — 22 Subject Profiles | ZIOPSYOP",
    description:
      "22 behavioral dossiers. Cross-subreddit analysis, timezone fingerprinting, language-identity mismatches, dormancy gaps aligned with IDF operations. The foot soldiers of a coordinated influence campaign — exposed.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZIOPSYOP Dossier — Subject behavioral forensics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE DOSSIER — Subject Behavioral Forensics | ZIOPSYOP",
    description:
      "22 behavioral dossiers from the r/ForbiddenBromance influence operation. Temporal coordination, language fingerprinting, persona contradictions.",
    images: ["/og-image.png"],
  },
};

export default function ForensicsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
