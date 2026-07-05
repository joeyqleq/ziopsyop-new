import type { Metadata } from "next";
import { getPartIData } from "@/lib/reddit";
import { PartIView } from "@/components/PartIView";

export const metadata: Metadata = {
  title: "Part I — The Manufactured Friend | ZIOPSYOP",
  description:
    "Forensic dissection of r/ForbiddenBromance: 93,000+ artifacts across 79 months showing a Lebanese-Israeli 'dialogue' community whose pulse tracks the battlefield, not its people. Every figure sourced from a live database.",
};

// Data comes from Supabase at request time; keep it fresh.
export const revalidate = 3600;

export default async function PartOne() {
  const data = await getPartIData();
  return <PartIView data={data} />;
}
