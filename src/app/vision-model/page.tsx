import type { Metadata } from "next";
import { sbSelect } from "@/lib/supabase";
import {
  VisionModelExperience,
  type VisionStrikeSample,
} from "@/components/vision/VisionModelExperience";

export const metadata: Metadata = {
  title: "Computer Vision Method",
  description:
    "How ZIOPSYOP converted a 35-video FPV campaign corpus into human-reviewed, structured battlefield observations.",
  alternates: { canonical: "/vision-model" },
};

export default async function VisionModelPage() {
  const [sampleRows, allIds] = await Promise.all([
    sbSelect<VisionStrikeSample>(
      "hezbollah_strikes",
      "select=id,period,strike_date,weapon_system,target_class,target_detail,location_town,confirmation_source,source_transcript_ep,idf_kia_in_event,idf_wounded_in_event&weapon_category=eq.DRONE&order=id.asc&limit=6",
    ),
    sbSelect<{ id: string }>("hezbollah_strikes", "select=id"),
  ]);

  return (
    <VisionModelExperience
      sampleRows={sampleRows}
      totalStrikeRows={allIds.length}
    />
  );
}
