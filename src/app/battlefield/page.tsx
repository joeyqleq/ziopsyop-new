import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { BattlefieldHeader } from "@/components/battlefield/BattlefieldHeader";
import { BattlefieldSections } from "@/components/battlefield/BattlefieldSections";
import {
  getTargetingDisparity,
  getCostAsymmetry,
  getHardwareAttrition,
  getIHLMatrix,
  getWeaponInnovation,
  getObjectivesScorecard,
  getQuoteWall,
  getStrikeTaxonomy,
  getCivilianWaffle,
  getDoubleTapData,
  getInfrastructureTreemap,
  getCampaignTimeline,
  getLieDetector,
  getMoralityInversion,
  getSayVsDo,
  getAdmissionGap,
  getDeadReckoning,
  getCostROI,
  getFogOfWarClock,
} from "@/lib/battlefield";

export const metadata: Metadata = {
  title: "Part II — The Most Moral Army | ZIOPSYOP",
  description:
    "Testing the 'most moral army' claim against the documented record of the 2024–2026 IDF–Hezbollah war: targeting disparity, IHL compliance, cost asymmetry, hardware attrition and strategic outcome — every figure sourced.",
};

export const revalidate = 3600;

export default async function BattlefieldPage() {
  const [
    targeting, cost, hardware, ihl, weapons, objectives, quotes, taxonomy,
    civilianWaffle, doubleTap, infraTreemap, timeline,
    lieDetector, moralityInversion, sayVsDo, admissionGap,
    deadReckoning, costROI, fogOfWar,
  ] = await Promise.all([
    getTargetingDisparity(),
    getCostAsymmetry(),
    getHardwareAttrition(),
    getIHLMatrix(),
    getWeaponInnovation(),
    getObjectivesScorecard(),
    getQuoteWall(),
    getStrikeTaxonomy(),
    getCivilianWaffle(),
    getDoubleTapData(),
    getInfrastructureTreemap(),
    getCampaignTimeline(),
    getLieDetector(),
    getMoralityInversion(),
    getSayVsDo(),
    getAdmissionGap(),
    getDeadReckoning(),
    getCostROI(),
    getFogOfWarClock(),
  ]);

  return (
    <PageShell backdrop="warp">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-10">
        <BattlefieldHeader />
        <BattlefieldSections
          data={{
            targeting, cost, hardware, ihl, weapons, objectives, quotes, taxonomy,
            civilianWaffle, doubleTap, infraTreemap, timeline,
            lieDetector, moralityInversion, sayVsDo, admissionGap,
            deadReckoning, costROI, fogOfWar,
          }}
        />
      </div>
    </PageShell>
  );
}
