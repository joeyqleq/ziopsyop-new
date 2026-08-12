import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { MediaWarContent } from "./MediaWarContent";

export const metadata: Metadata = {
  title: "Part III — The Media Battlefield | ZIOPSYOP",
  description:
    "Forensic comparison of Channel 14, Al-Manar, and Al Mayadeen coverage — what each outlet amplified, omitted, or framed across the 2023-2026 Lebanon-Israel media war.",
};

export default function MediaWarPage() {
  return (
    <PageShell>
      <MediaWarContent />
    </PageShell>
  );
}
