"use client";

import { motion } from "framer-motion";
import { ChartFrame } from "@/components/fx/ChartFrame";
import { DecryptText } from "@/components/fx/DecryptText";
import { TargetingRadar } from "./TargetingRadar";
import { CostAsymmetry } from "./CostAsymmetry";
import { HardwareAttrition } from "./HardwareAttrition";
import { IHLComplianceMatrix } from "./IHLComplianceMatrix";
import { WeaponTimeline } from "./WeaponTimeline";
import { ObjectivesScorecard } from "./ObjectivesScorecard";
import { QuoteWall } from "./QuoteWall";
import { StrikeTaxonomy } from "./StrikeTaxonomy";
import type {
  TargetingDisparity,
  CostAsymmetry as CostData,
  HardwareAttrition as HwData,
  IHLMatrix,
  WeaponInnovation,
  ObjectivesScorecard as ScorecardData,
  QuoteWall as QuoteData,
  StrikeTaxonomy as TaxData,
} from "@/lib/battlefield";

export interface BattlefieldData {
  targeting: TargetingDisparity;
  cost: CostData;
  hardware: HwData;
  ihl: IHLMatrix;
  weapons: WeaponInnovation;
  objectives: ScorecardData;
  quotes: QuoteData;
  taxonomy: TaxData;
}

function Lede({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="flex items-start gap-4 pt-8 pb-1"
    >
      <span className="font-mono text-[clamp(1.6rem,4vw,2.4rem)] leading-none font-bold text-primary/20 select-none">
        {step}
      </span>
      <div className="pt-0.5">
        <DecryptText
          text={title}
          as="h2"
          startOnView
          speed={20}
          className="font-mono text-base md:text-lg font-bold tracking-[0.12em] text-foreground uppercase"
        />
        <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-3xl text-pretty">{text}</p>
      </div>
    </motion.div>
  );
}

export function BattlefieldSections({ data }: { data: BattlefieldData }) {
  return (
    <div className="space-y-8">
      {/* 01 — taxonomy */}
      <Lede
        step="01"
        title="Who was actually fighting whom"
        text="Before judging conduct, fix the facts. Every confirmed Hezbollah strike of the war, classified by target. The distribution is the first piece of evidence — and it is exclusively military."
      />
      <ChartFrame
        exhibit="EX-17"
        title="STRIKE TAXONOMY — TARGET CLASSIFICATION"
        subtitle="All confirmed Hezbollah strikes, classified by target type. Hover any band to isolate it."
        accent="var(--primary)"
        classification="STRIKE LOG"
        commentary={{
          reads:
            "The full population of confirmed Hezbollah strikes, broken down by the class of target each one hit.",
          means:
            "There is no civilian-target band of any consequence. Hezbollah's fire was directed at military formations, armor and bases — the legal definition of distinction, met.",
          puzzle:
            "This is the baseline the subreddit operation must invert: an actor fighting a disciplined military campaign reframed as the indiscriminate aggressor.",
        }}
      >
        <StrikeTaxonomy data={data.taxonomy} />
      </ChartFrame>

      {/* 02 — targeting disparity radar */}
      <Lede
        step="02"
        title="Two doctrines, measured side by side"
        text="Lay both belligerents' conduct on the same axes — civilian targeting, casualties, medics, journalists, demolished villages — and the moral asymmetry stops being rhetoric and becomes geometry."
      />
      <ChartFrame
        exhibit="EX-18"
        title="TARGETING DISPARITY RADAR"
        subtitle="Normalised harm index across six IHL dimensions. Larger area = greater violation footprint."
        accent="var(--threat)"
        classification="IHL ASSESSMENT"
        commentary={{
          reads:
            "A radar plot comparing Hezbollah and the IDF across six harm dimensions, each normalised to a 0–100 index.",
          means:
            "The IDF polygon engulfs the Hezbollah one on every civilian-harm axis. The disparity isn't marginal — it is categorical.",
          puzzle:
            "The narrative operation exists precisely to collapse this shape into a flat 'both sides' line. The data refuses.",
        }}
      >
        <TargetingRadar data={data.targeting} />
      </ChartFrame>

      {/* 03 — IHL matrix */}
      <Lede
        step="03"
        title="The law, applied line by line"
        text="Move from quantity to legality. Each principle of international humanitarian law, scored for each belligerent against the documented record."
      />
      <ChartFrame
        exhibit="EX-19"
        title="IHL COMPLIANCE MATRIX"
        subtitle="Principle-by-principle verdict for each belligerent, with the underlying evidence."
        accent="var(--archive)"
        classification="LEGAL AUDIT"
        commentary={{
          reads:
            "A scorecard of core IHL principles — distinction, proportionality, medical and press protection, the double-tap ban — judged for each side.",
          means:
            "Hezbollah registers compliant or not-applicable across the board; the IDF registers violations on every principle, each backed by counted incidents.",
          puzzle:
            "This is the legal spine of Part 2. The subreddit's job was to make sure this matrix was never assembled in public view.",
        }}
      >
        <IHLComplianceMatrix data={data.ihl} />
      </ChartFrame>

      {/* 04 — cost asymmetry */}
      <Lede
        step="04"
        title="A $200 drone against a $4,000,000 launcher"
        text="The war's economics are its strategy. When a fiber-optic drone that costs less than a laptop forces the expenditure of a million-dollar interceptor, attrition runs in only one direction."
      />
      <ChartFrame
        exhibit="EX-20"
        title="COST-EXCHANGE ASYMMETRY"
        subtitle="Per-unit cost on a logarithmic scale, plus the campaign's running cost ledger."
        accent="var(--primary)"
        classification="ECONOMIC"
        commentary={{
          reads:
            "Unit costs of Hezbollah's drones against Israel's interceptors and launchers, then the aggregate cost the campaign imposed.",
          means:
            "The exchange ratio is catastrophic for the higher-spending side. Defending against cheap precision mass is unaffordable by design.",
          puzzle:
            "An adversary winning the economic war must be rebranded as the loser — that reframing is the operation's deliverable.",
        }}
      >
        <CostAsymmetry data={data.cost} />
      </ChartFrame>

      {/* 05 — hardware attrition */}
      <Lede
        step="05"
        title="The armor that didn't come back"
        text="Translate the asymmetry into steel. Documented IDF equipment losses, grouped by class — the physical residue of a drone war."
      />
      <ChartFrame
        exhibit="EX-21"
        title="IDF HARDWARE ATTRITION"
        subtitle="Documented equipment losses by category. Toggle between dollar value and unit count."
        accent="var(--threat)"
        classification="BATTLE DAMAGE"
        commentary={{
          reads:
            "Confirmed IDF equipment losses aggregated by category, sortable by destroyed value or by unit count.",
          means:
            "Armor and air-defense dominate the loss ledger — exactly the high-value systems FPV drones and ATGMs were built to kill.",
          puzzle:
            "Each destroyed Merkava is a fact that had to be kept off the subreddit's feed while it pivoted to 'peace'.",
        }}
      >
        <HardwareAttrition data={data.hardware} />
      </ChartFrame>

      {/* 06 — weapon innovation timeline */}
      <Lede
        step="06"
        title="How they out-innovated a superpower-backed army"
        text="The capability didn't appear overnight. Trace the weapons program from crude rockets to electronic-warfare-immune fiber-optic drones — each milestone dated and sourced."
      />
      <ChartFrame
        exhibit="EX-22"
        title="WEAPON INNOVATION TIMELINE"
        subtitle="Hezbollah's documented weapon systems in order of first use. Highlighted entries are fiber-optic, EW-immune."
        accent="var(--viz-blue)"
        classification="CAPABILITY"
        commentary={{
          reads:
            "A dated rail of Hezbollah weapon systems, from unguided rockets to fiber-optic-guided FPV drones, with cost and confirmed kills.",
          means:
            "The progression toward jam-proof guided munitions explains the attrition curve: countermeasures that work against radio-controlled drones are useless against a fiber tether.",
          puzzle:
            "A learning, innovating adversary contradicts the 'primitive terrorist' frame — so the innovation had to go unreported.",
        }}
      >
        <WeaponTimeline data={data.weapons} />
      </ChartFrame>

      {/* 07 — objectives scorecard */}
      <Lede
        step="07"
        title="Did the war achieve what it promised?"
        text="Judge the campaign against its own stated goals — not its opponents' claims. Reach the Litani, destroy Hezbollah, restore deterrence, return the settlers. Audit each."
      />
      <ChartFrame
        exhibit="EX-23"
        title="STRATEGIC OBJECTIVES SCORECARD"
        subtitle="Each stated war aim, scored against the documented outcome."
        accent="var(--threat)"
        classification="OUTCOME AUDIT"
        commentary={{
          reads:
            "Israel's own declared objectives for the campaign, each marked failed, partial or achieved against the record.",
          means:
            "The scorecard reads as near-total failure: no Litani line, no destroyed Hezbollah, no restored deterrence — a ceasefire on terms its fire forced.",
          puzzle:
            "When the battlefield delivers defeat, the information space must manufacture the missing victory. That is the operation's reason to exist.",
        }}
      >
        <ObjectivesScorecard data={data.objectives} />
      </ChartFrame>

      {/* 08 — quote wall */}
      <Lede
        step="08"
        title="In their own words"
        text="The closing evidence needs no analysis. Israeli commanders, officials and media, conceding on the record the outcomes the narrative denies."
      />
      <ChartFrame
        exhibit="EX-24"
        title="ADMISSIONS AGAINST INTEREST"
        subtitle="Statements by Israeli figures confirming Hezbollah's effectiveness — sourced to Israeli outlets."
        accent="var(--archive)"
        classification="PRIMARY SOURCE"
        commentary={{
          reads:
            "A wall of direct quotations from Israeli commanders, officials and journalists about the war's conduct and results.",
          means:
            "These are admissions against interest — the strongest class of evidence. The defeated side's own command echelon corroborates the data in every preceding exhibit.",
          puzzle:
            "Part 1 proved a narrative was manufactured. Part 2 proves what it was built to bury. These voices are where the two halves of the case meet.",
        }}
      >
        <QuoteWall data={data.quotes} />
      </ChartFrame>
    </div>
  );
}
