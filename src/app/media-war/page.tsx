import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { MediaWarContent } from "./MediaWarContent";

export const metadata: Metadata = {
  title: "Part III — The Media Battlefield | ZIOPSYOP",
  description:
    "Forensic comparison of Israeli state media (Channel 14) vs. resistance media (Al-Manar, Al-Mayadeen) — who lied, when, and how. Day-by-day narrative analysis of the 2023-2026 Lebanon-Israel media war.",
};

export default function MediaWarPage() {
  return (
    <PageShell>
      <MediaWarContent />
    </PageShell>
  );
}
