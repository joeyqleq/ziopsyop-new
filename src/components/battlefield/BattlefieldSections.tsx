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
import { CivilianWaffle } from "./CivilianWaffle";
import { DoubleTapPattern } from "./DoubleTapPattern";
import { InfrastructureTreemap } from "./InfrastructureTreemap";
import { CampaignTimeline } from "./CampaignTimeline";
import { LieDetector } from "./LieDetector";
import { MoralityInversion } from "./MoralityInversion";
import { SayVsDo } from "./SayVsDo";
import { AdmissionGap } from "./AdmissionGap";
import { DeadReckoning } from "./DeadReckoning";
import { CostROI } from "./CostROI";
import { FogOfWarClock } from "./FogOfWarClock";
import { CensorshipScale } from "./CensorshipScale";
import { DestructionAudit } from "./DestructionAudit";
import { MethodologySection } from "./MethodologySection";
import type {
  TargetingDisparity,
  CostAsymmetry as CostData,
  HardwareAttrition as HwData,
  IHLMatrix,
  WeaponInnovation,
  ObjectivesScorecard as ScorecardData,
  QuoteWall as QuoteData,
  StrikeTaxonomy as TaxData,
  CivilianWaffleData,
  DoubleTapData,
  InfrastructureTreemapData,
  CampaignTimelineData,
  LieDetectorData,
  MoralityInversionData,
  SayVsDoData,
  AdmissionGapData,
  DeadReckoningData,
  CostROIData,
  FogOfWarClockData,
  CensorshipData,
  DestructionData,
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
  civilianWaffle: CivilianWaffleData;
  doubleTap: DoubleTapData;
  infraTreemap: InfrastructureTreemapData;
  timeline: CampaignTimelineData;
  lieDetector: LieDetectorData;
  moralityInversion: MoralityInversionData;
  sayVsDo: SayVsDoData;
  admissionGap: AdmissionGapData;
  deadReckoning: DeadReckoningData;
  costROI: CostROIData;
  fogOfWar: FogOfWarClockData;
  censorship: CensorshipData;
  destruction: DestructionData;
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

function ActDivider({ act, title, subtitle }: { act: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-12 text-center border-t border-borderc/50 mt-12"
    >
      <p className="font-mono text-[10px] tracking-[0.4em] text-primary/50 mb-2">{act}</p>
      <h2 className="font-mono text-xl md:text-2xl font-bold tracking-[0.15em] text-foreground uppercase">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted max-w-xl mx-auto text-pretty">{subtitle}</p>
    </motion.div>
  );
}

export function BattlefieldSections({ data }: { data: BattlefieldData }) {
  return (
    <div className="space-y-8">

      {/* ═══════════════════════════════════════════════════════════
          METHODOLOGY — How this investigation was conducted
         ═══════════════════════════════════════════════════════════ */}
      <MethodologySection />

      {/* ═══════════════════════════════════════════════════════════
          ACT I — THE CLAIM
          What is the propaganda framework we're testing?
         ═══════════════════════════════════════════════════════════ */}
      <ActDivider
        act="ACT I"
        title="The Claim"
        subtitle="Two statements form the backbone of Israeli wartime propaganda. We test each against the documented record."
      />

      {/* 01 — Who was fighting whom (strike taxonomy) */}
      <Lede
        step="01"
        title="Who was actually fighting whom"
        text="Before judging conduct, inspect the coded record. Confirmed Hezbollah strikes in the current dataset are classified by reported target; the distribution is overwhelmingly military, subject to source and coverage limits."
      />
      <ChartFrame
        exhibit="EX-17"
        title="STRIKE TAXONOMY — TARGET CLASSIFICATION"
        subtitle="The 100 Hezbollah strike rows currently structured in Supabase, classified by reported target type."
        accent="var(--primary)"
        classification="STRIKE LOG"
        commentary={{
          reads: "The 100 Hezbollah strike rows currently structured in Supabase, broken down by the class of target coded for each record.",
          means: "The coded records are dominated by military formations, armor and bases. That supports a distinction finding inside this dataset; it does not establish that every strike in the wider war is captured.",
          puzzle: "This is the baseline the subreddit operation must invert: an actor fighting a disciplined military campaign reframed as the indiscriminate aggressor.",
        }}
        plain={{
          what: "A breakdown of the confirmed Hezbollah strikes currently coded by reported target: tanks, bases, vehicles, and soldiers.",
          why: "The observed target distribution can test claims of indiscriminate targeting, but only within the dataset's documented coverage.",
          proves: "The current strike ledger supports a predominantly military-target campaign; uncaptured incidents and publisher bias remain explicit limitations.",
        }}
      >
        <StrikeTaxonomy data={data.taxonomy} />
      </ChartFrame>

      {/* 02 — Targeting disparity radar */}
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
          reads: "A radar plot comparing Hezbollah and the IDF across six harm dimensions, each normalised to a 0–100 index.",
          means: "The IDF polygon engulfs the Hezbollah one on every civilian-harm axis. The disparity isn't marginal — it is categorical.",
          puzzle: "The narrative operation exists precisely to collapse this shape into a flat 'both sides' line. The data refuses.",
        }}
        plain={{
          what: "A shape comparison: Hezbollah's harm footprint vs the IDF's, measured on 6 axes (civilian kills, medics, journalists, villages, etc).",
          why: "You can see with your eyes which shape is bigger. The IDF's red polygon fills the entire chart. Hezbollah's barely registers.",
          proves: "The current coded record assigns Israel the larger IHL-risk footprint on the dimensions shown; coverage and legal-attribution limits remain part of the finding.",
        }}
      >
        <TargetingRadar data={data.targeting} />
      </ChartFrame>

      {/* ═══════════════════════════════════════════════════════════
          ACT II — THE EVIDENCE
          What actually happened on the ground
         ═══════════════════════════════════════════════════════════ */}
      <ActDivider
        act="ACT II"
        title="The Evidence"
        subtitle="The documented record of who was killed, how they were killed, and what was destroyed. Every number sourced. Every dot on the chart is a human being."
      />

      {/* 03 — Civilian toll (waffle) */}
      <Lede
        step="03"
        title="3,500 dots. One per life."
        text="The numbers are abstract until you see them at scale. Each colored square below is one person killed by IDF strikes in Lebanon. The colors tell you who they were."
      />
      <ChartFrame
        exhibit="EX-19"
        title="CIVILIAN TOLL — EVERY LIFE COUNTED"
        subtitle="One dot per person killed. Color = who they were when the strike hit them."
        accent="var(--threat)"
        classification="CASUALTY AUDIT"
        commentary={{
          reads: "3,500 rectangles arranged in a grid. Each rectangle is one person killed. Colors distinguish general civilians, healthcare workers, journalists, and non-combatant army.",
          means: "This is what 3,500 deaths looks like as a data structure. The orange cluster — healthcare workers — is visible from across the room.",
          puzzle: "The subreddit's 'peace' narrative requires you to never see this grid. Each dot is a reason the operation exists.",
        }}
        plain={{
          what: "A grid where every tiny square is one person Israel killed in Lebanon. Colors show who they were: red = civilian, orange = medic/paramedic, yellow = journalist.",
          why: "Numbers like '3,500 dead' are easy to scroll past. Seeing 3,500 individual squares makes it impossible to ignore.",
          proves: "The compiled casualty sources attribute roughly 3,500 civilian deaths, including protected professional groups, to Israeli strikes; the source contract governs each category.",
        }}
      >
        <CivilianWaffle data={data.civilianWaffle} />
      </ChartFrame>

      {/* 04 — Double-tap pattern */}
      <Lede
        step="04"
        title="Strike. Wait for the ambulance. Strike again."
        text="The double-tap is not collateral damage. It is a doctrine: hit a target, then hit the people who come to help. The IDF did this repeatedly, on camera, to paramedics wearing vests marked with the Red Cross."
      />
      <ChartFrame
        exhibit="EX-20"
        title="THE DOUBLE-TAP DOCTRINE"
        subtitle="Documented incidents where IDF struck first responders arriving to rescue victims of an initial strike."
        accent="var(--threat)"
        classification="WAR CRIME PATTERN"
        commentary={{
          reads: "A catalog of incidents where the IDF struck, waited for emergency responders, then struck again — sometimes a third or fourth time.",
          means: "Repeated secondary strikes after responders arrive are consistent with a deliberate double-tap pattern; intent must be assessed incident by incident.",
          puzzle: "The reported toll among paramedics and ambulances demands legal scrutiny because medical personnel and transports receive special IHL protection.",
        }}
        plain={{
          what: "A list of incidents where Israel bombed a target, waited for paramedics to arrive, then bombed the paramedics too. Some did it 3 or 4 times.",
          why: "Knowingly attacking protected rescuers can constitute a war crime. The sequence, target knowledge, and military necessity must be established for each incident.",
          proves: "The reported responder deaths and repeated strike sequences support a priority war-crime-pattern inquiry, not a substitute for a judicial finding.",
        }}
      >
        <DoubleTapPattern data={data.doubleTap} />
      </ChartFrame>

      {/* 05 — Infrastructure destruction treemap */}
      <Lede
        step="05"
        title="$5 billion in rubble"
        text="Homes, hospitals, bridges, ambulance stations, mosques, schools, UN bases — demolished by airstrikes and D9 bulldozers. The bigger the rectangle, the bigger the rebuild bill."
      />
      <ChartFrame
        exhibit="EX-21"
        title="INFRASTRUCTURE DESTRUCTION TREEMAP"
        subtitle="Area = rebuild cost. Border = IHL-protected status. Yellow text = Dahiyeh Doctrine."
        accent="var(--archive)"
        classification="DESTRUCTION AUDIT"
        commentary={{
          reads: "A treemap where each rectangle represents a category of destroyed infrastructure. Size is proportional to estimated rebuild cost.",
          means: "Residential destruction dominates — $1.85B for 1,847+ homes alone. Hospitals, bridges, ambulance stations fill the rest. Most are IHL-protected structures.",
          puzzle: "The Dahiyeh Doctrine — officially named after Israel's own 2006 strategy of deliberate civilian infrastructure destruction — is visible in the largest rectangles.",
        }}
        plain={{
          what: "A visual map of everything Israel destroyed in Lebanon: homes, hospitals, bridges, ambulance stations. Bigger rectangle = more expensive to rebuild.",
          why: "This is not military targeting. It's the deliberate destruction of civilian life — where people live, where they get healed, how they travel.",
          proves: "The compiled destruction and displacement record supports a collective-punishment analysis; legal classification depends on intent, necessity, and proportionality evidence.",
        }}
      >
        <InfrastructureTreemap data={data.infraTreemap} />
      </ChartFrame>

      {/* 06 — IHL compliance matrix */}
      <Lede
        step="06"
        title="The law, applied line by line"
        text="Move from quantity to legality. Each principle of international humanitarian law, scored for each belligerent against the documented record."
      />
      <ChartFrame
        exhibit="EX-22"
        title="IHL COMPLIANCE MATRIX"
        subtitle="Principle-by-principle verdict for each belligerent, with the underlying evidence."
        accent="var(--archive)"
        classification="LEGAL AUDIT"
        commentary={{
          reads: "A scorecard of core IHL principles — distinction, proportionality, medical and press protection, the double-tap ban — judged for each side.",
          means: "Under the current coding rules, Hezbollah records are compliant or not-applicable while IDF records flag violations across the tested principles. This is a dataset assessment, not a court judgment.",
          puzzle: "This is the legal spine of Part 2. The subreddit's job was to make sure this matrix was never assembled in public view.",
        }}
        plain={{
          what: "A report card grading both sides on international law: Did they distinguish military from civilian? Protect medics? Avoid collective punishment?",
          why: "A principle-by-principle matrix makes the legal reasoning auditable and exposes where evidence, coding rules, or counterarguments could change a result.",
          proves: "The coded evidence produces a severe asymmetry in IHL risk flags. It supports further legal review while preserving source and coverage limits.",
        }}
      >
        <IHLComplianceMatrix data={data.ihl} />
      </ChartFrame>

      {/* 07 — Campaign timeline */}
      <Lede
        step="07"
        title="The war, day by day"
        text="24 key events across four dimensions — political decisions, Hezbollah operations, battlefield shifts, and civilian toll. The timeline shows how they correlate."
      />
      <ChartFrame
        exhibit="EX-23"
        title="CAMPAIGN TIMELINE — MULTI-DIMENSIONAL"
        subtitle="Click any event to expand. Filter by lane. Color = dimension."
        accent="var(--viz-blue)"
        classification="CHRONOLOGY"
        commentary={{
          reads: "A swimlane chart placing political, military, battlefield, and civilian events on the same time axis.",
          means: "Patterns emerge: ceasefire violations cluster with civilian casualty spikes. Hezbollah operational tempo increases exactly when IDF advances stall.",
          puzzle: "The timeline tests whether selected escalation and casualty spikes follow the event sequence encoded here; events outside its coverage can change the interpretation.",
        }}
        plain={{
          what: "A visual timeline of the entire war showing political events, Hezbollah strikes, battlefield outcomes, and civilian deaths — all on one chart.",
          why: "Seeing the lanes together makes sequence claims auditable, but a 24-event selection cannot establish a universal initiator for the whole war.",
          proves: "The selected chronology records repeated Israeli strikes and post-ceasefire incidents. It supports scoped sequence findings, not a sole-causation verdict.",
        }}
      >
        <CampaignTimeline data={data.timeline} />
      </ChartFrame>

      {/* ═══════════════════════════════════════════════════════════
          ACT III — THE VERDICT
          What the current evidence supports
         ═══════════════════════════════════════════════════════════ */}
      <ActDivider
        act="ACT III"
        title="The Verdict"
        subtitle="The cost, the failure, the admissions. Judged against its own words and its own stated goals."
      />

      {/* 08 — Cost asymmetry (proportional circles) */}
      <Lede
        step="08"
        title="A $200 drone against a $4,000,000 launcher"
        text="The war's economics are its strategy. When a fiber-optic drone that costs less than a laptop forces the expenditure of a million-dollar interceptor, attrition runs in only one direction."
      />
      <ChartFrame
        exhibit="EX-24"
        title="COST-EXCHANGE ASYMMETRY"
        subtitle="Circle area = unit cost. True proportional scale. The visual ratio is the argument."
        accent="var(--primary)"
        classification="ECONOMIC"
        commentary={{
          reads: "Proportional area circles showing unit costs: Hezbollah FPV drone ($200–400) vs Tamir interceptor ($50–100K) vs Iron Dome launcher ($4–100M).",
          means: "The exchange ratio is catastrophic for the higher-spending side. Defending against cheap precision mass is unaffordable by design.",
          puzzle: "An adversary winning the economic war must be rebranded as the loser — that reframing is the operation's deliverable.",
        }}
        plain={{
          what: "Circles showing the actual size difference between what Hezbollah spends per attack ($200) and what Israel spends to defend ($4,000,000). The small dot vs the huge circle IS the story.",
          why: "Cheap guided systems can force a defender to spend much more per engagement and can make prolonged defense harder to sustain.",
          proves: "Under the declared unit-cost assumptions, some engagements impose a severe exchange-cost burden on Israel. The model does not prove the strategic outcome of the war.",
        }}
      >
        <CostAsymmetry data={data.cost} />
      </ChartFrame>

      {/* 08b — COST ROI: weapon system return on investment */}
      <Lede
        step="08b"
        title="The $200 Problem"
        text="Plot every Hezbollah weapon by what it costs vs what it destroys. The scatter plot is the war's economics reduced to geometry: everything above the break-even line means the attacker profits per engagement."
      />
      <ChartFrame
        exhibit="EX-24b"
        title="COST ROI — RETURN ON INVESTMENT PER WEAPON"
        subtitle="X = unit cost (log). Y = value destroyed per dollar. Bubble size = confirmed kills. Above the line = attacker profits."
        accent="var(--primary)"
        classification="ECONOMIC"
        commentary={{
          reads: "A scatter plot with each Hezbollah weapon system positioned by unit cost vs return on investment. Fiber-optic weapons highlighted.",
          means: "The input estimates place some low-cost FPV engagements far above break-even. Unit cost is one campaign pressure, not a mathematical verdict on victory or defeat.",
          puzzle: "When every engagement costs the defender orders of magnitude more than the attacker, 'winning' becomes a function of time — and time favors the cheaper side.",
        }}
        plain={{
          what: "A scatter chart showing each Hezbollah weapon: what it costs to build vs how much damage it does. The $200 drone destroys $4M targets. Every weapon is above the profit line.",
          why: "Repeatedly defending high-value assets from cheap guided systems creates a serious sustainability problem even when many attacks fail.",
          proves: "Given the current cost inputs, the modeled weapon rows sit above break-even. Source uncertainty and unobserved failed attacks can materially change the ratios.",
        }}
      >
        <CostROI data={data.costROI} />
      </ChartFrame>

      {/* 09 — Hardware attrition */}
      <Lede
        step="09"
        title="The armor that didn't come back"
        text="Translate the asymmetry into steel. Documented IDF equipment losses, grouped by class — the physical residue of a drone war."
      />
      <ChartFrame
        exhibit="EX-25"
        title="IDF HARDWARE ATTRITION"
        subtitle="Documented equipment losses by category. Toggle between dollar value and unit count."
        accent="var(--threat)"
        classification="BATTLE DAMAGE"
        commentary={{
          reads: "Confirmed IDF equipment losses aggregated by category, sortable by destroyed value or by unit count.",
          means: "Armor and air-defense dominate the loss ledger — exactly the high-value systems FPV drones and ATGMs were built to kill.",
          puzzle: "Each destroyed Merkava is a fact that had to be kept off the subreddit's feed while it pivoted to 'peace'.",
        }}
        plain={{
          what: "A bar chart showing every type of IDF equipment destroyed: 211 armored vehicles, 197 air defense units, 144 engineering vehicles, 40 drones — $1.6 billion total.",
          why: "This is what 'the strongest army in the Middle East' looks like after facing an organized resistance with $200 drones.",
          proves: "The current loss table produces a large hardware and replacement-cost estimate. Counts, condition and unit prices must be audited before treating the total as a confirmed loss bill.",
        }}
      >
        <HardwareAttrition data={data.hardware} />
      </ChartFrame>

      {/* 10 — Weapon innovation timeline */}
      <Lede
        step="10"
        title="How they out-innovated a superpower-backed army"
        text="The capability didn't appear overnight. Trace the weapons program from crude rockets to electronic-warfare-immune fiber-optic drones — each milestone dated and sourced."
      />
      <ChartFrame
        exhibit="EX-26"
        title="WEAPON INNOVATION TIMELINE"
        subtitle="Hezbollah's documented weapon systems in order of first use. Highlighted entries are fiber-optic, EW-immune."
        accent="var(--viz-blue)"
        classification="CAPABILITY"
        commentary={{
          reads: "A dated rail of Hezbollah weapon systems, from unguided rockets to fiber-optic-guided FPV drones, with cost and confirmed kills.",
          means: "The progression toward fiber-guided munitions offers a plausible explanation for part of the attrition curve because a tether can bypass some radio-frequency jamming.",
          puzzle: "A learning, innovating adversary contradicts the 'primitive terrorist' frame — so the innovation had to go unreported.",
        }}
        plain={{
          what: "A timeline showing how Hezbollah's weapons evolved: from basic rockets to unjammable fiber-optic drones that Israel cannot stop.",
          why: "This is engineering, not terrorism. A $400 fiber-optic drone that defeats electronic warfare systems worth millions represents genuine military innovation.",
          proves: "The loaded record depicts an adaptive weapons program and challenges a 'primitive' framing; it does not establish superiority across every countermeasure or engagement.",
        }}
      >
        <WeaponTimeline data={data.weapons} />
      </ChartFrame>

      {/* 11 — LIE DETECTOR: cross-table admission funnel */}
      <Lede
        step="11"
        title="The admission funnel: how many did they really lose?"
        text="Cross-reference five independent data sources: total strikes, confirmed vehicle hits, filmed kills, personnel engagements, and official IDF admissions. Watch the numbers shrink from reality to propaganda."
      />
      <ChartFrame
        exhibit="EX-27"
        title="LIE DETECTOR — CROSS-TABLE ADMISSION FUNNEL"
        subtitle="Five data points from different tables. Different units that require event-level reconciliation."
        accent="var(--threat)"
        classification="CROSS-REFERENCE"
        commentary={{
          reads: "A funnel narrowing from 665 documented strikes to 42 IDF-admitted KIA — each step sourced from a different database table.",
          means: "The funnel shows a large unresolved gap between documented engagements and official fatality admissions. Strike counts cannot be converted directly into deaths without per-event outcome verification.",
          puzzle: "Part I can test how a low-casualty narrative circulates while these discrepancies remain unresolved; the counts alone do not identify who directs that framing.",
        }}
        plain={{
          what: "A funnel-shaped comparison of published strike, engagement and fatality counts. The visual narrows, but the layers do not share one denominator.",
          why: "Cross-table agreement can expose inconsistencies, but the tables measure different units—strikes, hits, engagements, and deaths—and must not be treated as interchangeable.",
          proves: "The current sources support an undercounting hypothesis and define the records needed to test it; they do not mathematically prove a casualty total.",
        }}
      >
        <LieDetector data={data.lieDetector} />
      </ChartFrame>

      {/* 11b — ADMISSION GAP: multi-source reconciliation test */}
      <Lede
        step="11b"
        title="The gap between reality and propaganda"
        text="BBC Verify independently geolocated 35 FPV strike videos. Other public figures cited in the project describe different theatres, periods, and units. Their gaps warrant reconciliation before any single undercount factor is asserted."
      />
      <ChartFrame
        exhibit="EX-27b"
        title="ADMISSION GAP — MULTI-SOURCE VERIFICATION"
        subtitle="Published figures with different scopes and denominators. The gap is a reconciliation problem before it is a conclusion."
        accent="var(--threat)"
        classification="CROSS-REFERENCE"
        commentary={{
          reads: "A waterfall visualization showing how verified strike data shrinks to official Israeli admissions, with each layer sourced independently.",
          means: "The sources expose discrepancies, but geolocated strike videos, claimed attacks, official fatalities, and bereaved-family registrations are not the same denominator.",
          puzzle: "The evidentiary task is to reconcile scope, period, duplicate family registrations, wounded survivors, and verified per-event outcomes before estimating an undercount.",
        }}
        plain={{
          what: "Multiple public sources whose figures appear difficult to reconcile without a shared scope and denominator.",
          why: "Independent sources make the discrepancies worth investigating, but their figures must be aligned by theatre, period, event and unit before comparison.",
          proves: "The discrepancies support an underreporting investigation; a defensible factor requires record linkage and denominator alignment not yet present here.",
        }}
      >
        <AdmissionGap data={data.admissionGap} />
      </ChartFrame>

      {/* 11c — DEAD RECKONING: particle visualization of hidden dead */}
      <Lede
        step="11c"
        title="5,942 families. 844 acknowledged."
        text="The Israeli army chief admitted 5,942 bereaved families are registered — yet only 844 deaths are officially acknowledged. Each particle below is one family. Watch how few light up."
      />
      <ChartFrame
        exhibit="EX-27c"
        title="DEAD RECKONING — THE HIDDEN DEAD"
        subtitle="Each dot is one bereaved family. Red = officially acknowledged. Ghost = denied."
        accent="var(--threat)"
        classification="COUNT MISMATCH"
        commentary={{
          reads: "5,942 particles drifting in a field. 844 illuminate red. The rest remain ghostly — present but unacknowledged.",
          means: "The cited bereaved-family and official KIA figures differ sharply, but one death can affect multiple registered families and the scopes may differ. The particles visualize the published counts, not an inferred death total.",
          puzzle: "The discrepancy is a source-reconciliation problem: verify the statement, definitions, period, duplicates, and theatre before inferring hidden deaths.",
        }}
        plain={{
          what: "A field of 5,942 dots — each one a real bereaved family registered in Israel. Only 844 light up red (the ones Israel officially admits). The remaining 5,098 stay as ghosts.",
          why: "An internal registry figure deserves scrutiny, but it cannot be divided by KIA and relabeled as a hidden-death percentage without matching definitions.",
          proves: "The published figures are unresolved and justify a provenance audit; this exhibit does not convert bereaved-family registrations into casualty counts.",
        }}
      >
        <DeadReckoning data={data.deadReckoning} />
      </ChartFrame>

      {/* 12 — MORALITY INVERSION: who is the terrorist? */}
      <Lede
        step="12"
        title="Who is the terrorist? The data answers."
        text="Place both belligerents' targeting records side by side — not on abstract indices, but on concrete counts. Civilian targets, hospitals destroyed, ambulances hit, UN bases attacked. Let the numbers speak."
      />
      <ChartFrame
        exhibit="EX-28"
        title="MORALITY INVERSION — SIDE BY SIDE"
        subtitle="Same metrics. Both sides. The labels don't survive contact with the data."
        accent="var(--primary)"
        classification="CROSS-REFERENCE"
        commentary={{
          reads: "A split comparison: Hezbollah's record (0 civilian targets, 0 hospitals, 0 ambulances, 0 journalists) vs IDF (7,072 killed, 27 ambulance stations, 2 hospitals, 7 UNIFIL bases).",
          means: "Within the current coded records, the civilian-harm asymmetry is severe. Zeroes mean no qualifying observation in this dataset—not proof that no incident occurred.",
          puzzle: "Part I tests whether platform behavior and framing react when this comparison enters discussion; motive and command require evidence beyond correlation.",
        }}
        plain={{
          what: "A split-screen showing both sides' currently coded records on identical civilian-harm metrics.",
          why: "Putting the same metrics side by side challenges a simple moral binary, provided the reader also sees coverage gaps and source asymmetry.",
          proves: "The coded record strongly challenges the simple 'terrorist versus moral army' frame while leaving zero-coverage and legal-attribution limits visible.",
        }}
      >
        <MoralityInversion data={data.moralityInversion} />
      </ChartFrame>

      {/* 13 — SAY VS DO: commander lies confronted */}
      <Lede
        step="13"
        title="What they said vs what happened"
        text="Israeli commanders made specific claims on Israeli television, to Israeli media. Then the documented outcomes contradicted every one. Click each to see the reality."
      />
      <ChartFrame
        exhibit="EX-29"
        title="SAY VS DO — CLAIMS AGAINST OUTCOMES"
        subtitle="Tap each claim to reveal the documented outcome. Lie score = how badly reality contradicted the statement."
        accent="var(--archive)"
        classification="FORENSIC CONTRAST"
        commentary={{
          reads: "A list of on-record statements by IDF commanders and officials, each paired with the documented outcome that followed.",
          means: "These aren't cherry-picked gotchas. These are the war's strategic claims — 'they are weakened,' 'objectives achieved,' 'Stone Age' — each followed by the speaker being wounded, the army withdrawing, or the cost ratio inverting.",
          puzzle: "Part I tests whether contradicting records are suppressed or reframed in platform discussion; the paired clips do not prove who directs that response.",
        }}
        plain={{
          what: "Israeli commanders making confident claims on TV — then what actually happened. The colonel who said 'they're weakened' was critically wounded by a drone weeks later.",
          why: "These are Israeli sources, Israeli media, Israeli commanders. The contradiction isn't between Israel and its enemies — it's between Israel and itself.",
          proves: "The paired records identify statements that appear inconsistent with later outcomes. A lie finding additionally requires evidence that the speaker knew the statement was false when made.",
        }}
      >
        <SayVsDo data={data.sayVsDo} />
      </ChartFrame>

      {/* 13b — FOG OF WAR CLOCK: how long do lies hold? */}
      <Lede
        step="13b"
        title="How long does a lie hold?"
        text="Every propaganda claim has a half-life — the time between when it's broadcast and when independent verification exposes it. Some last days. Others survive years. Track the decay."
      />
      <ChartFrame
        exhibit="EX-29b"
        title="FOG OF WAR CLOCK — PROPAGANDA HALF-LIFE"
        subtitle="Each pair: a published claim and a later contradicting or correcting record. The interval measures time between records—not proven intent to deceive."
        accent="var(--archive)"
        classification="TEMPORAL FORENSICS"
        commentary={{
          reads: "A timeline of documented IDF claims paired with their debunking — from '40 beheaded babies' (3 days) to 'death tolls are inflated' (792 days).",
          means: "Tactical lies ('it was Hamas') collapse in days. Strategic lies ('we're winning', 'death tolls are fake') hold for months or years — long enough to shape policy and public opinion.",
          puzzle: "Part I can test whether repeated platform framing tracks the interval before a correcting record appears; it cannot assume the platform caused the delay.",
        }}
        plain={{
          what: "A timeline showing how long each IDF lie survived before being exposed. Some lasted 2 days. One lasted 792 days (over 2 years) before Israel admitted it was true.",
          why: "Propaganda works not because it's believed forever — but because it holds long enough to matter. 792 days of 'death tolls are fake' = 792 days of impunity.",
          proves: "The exhibit measures correction latency for its selected claim pairs. It does not establish that every original statement was knowingly false.",
        }}
      >
        <FogOfWarClock data={data.fogOfWar} />
      </ChartFrame>

      {/* 13c — CENSORSHIP SCALE: how much is suppressed */}
      <Lede
        step="13c"
        title="15 articles censored per day"
        text="Israel's military censor — a unit inside Military Intelligence — blocked or redacted 5,700+ news reports in 2025 alone. The spike from baseline is the war's information signature: what can't be published is what would contradict the narrative."
      />
      <ChartFrame
        exhibit="EX-30b"
        title="THE CENSOR'S SPIKE — MILITARY MEDIA SUPPRESSION"
        subtitle="15 years of Israeli military censorship data. The wartime spike is the information operation's shadow."
        accent="var(--archive)"
        classification="INFORMATION CONTROL"
        commentary={{
          reads: "A stacked area chart showing military censor interventions (redacted + blocked) from 2011 to 2025, with a dramatic spike in 2024-2025.",
          means: "Baseline censorship ran ~2,600 items/year for a decade. Then war began: 7,900 in 2024, 5,700 in 2025. The censor's workload IS the measure of what the state needed hidden.",
          puzzle: "When your military censors 15 news items per day, the question isn't 'are they lying' — it's 'how much truth would collapse the narrative if published.'",
        }}
        plain={{
          what: "A chart showing Israel censored 15 news articles every single day during the war. Before the war: ~7/day. During: 15/day. They doubled the suppression.",
          why: "This is Israel's own military censor, documented by FOIA request. They're not hiding this — they're legally required to report it.",
          proves: "The Israeli military systematically suppressed 5,700+ news reports in one year. This is state-level information control — documented by their own freedom of information law.",
        }}
      >
        <CensorshipScale data={data.censorship} />
      </ChartFrame>

      {/* 13d — DESTRUCTION AUDIT: Amnesty satellite verification */}
      <Lede
        step="13d"
        title="10,000 structures. Bulldozed after the ceasefire."
        text="Amnesty International's Evidence Lab verified 77 soldier videos and analysed satellite imagery: more than 10,000 structures destroyed with bulldozers and explosives — most AFTER the ceasefire took effect. Three villages razed above 70%."
      />
      <ChartFrame
        exhibit="EX-32"
        title="NOWHERE TO RETURN — SATELLITE-VERIFIED DESTRUCTION"
        subtitle="Amnesty MDE 18/9552/2025. Each bar = one village. Rose = structures destroyed. Most occurred during ceasefire."
        accent="var(--threat)"
        classification="DESTRUCTION AUDIT"
        commentary={{
          reads: "Horizontal bars showing 8 Lebanese villages, each with total structures vs destroyed count. Most flagged as destroyed during ceasefire.",
          means: "Satellite imagery and verified videos support findings of bulldozer and explosive demolitions, including after the ceasefire. Whether each act was militarily necessary requires site-level evidence.",
          puzzle: "The timing and method support investigations into collective punishment and unlawful destruction. Legal intent is not made unambiguous by imagery alone.",
        }}
        plain={{
          what: "A bar chart showing 8 Lebanese villages and what percentage Israel bulldozed. Three villages: 70-75% destroyed. Most destruction happened AFTER the ceasefire — not during fighting.",
          why: "Amnesty's satellite and video verification makes the demolition pattern unusually well documented and suitable for incident-level legal review.",
          proves: "The verified demolitions after active fighting support investigations into collective punishment, unlawful destruction, and forcible-transfer risk; legal intent requires additional evidence.",
        }}
      >
        <DestructionAudit data={data.destruction} />
      </ChartFrame>

      {/* 14 — Objectives scorecard */}
      <Lede
        step="14"
        title="Did the war achieve what it promised?"
        text="Judge the campaign against its own stated goals — not its opponents' claims. Reach the Litani, destroy Hezbollah, restore deterrence, return the settlers. Audit each."
      />
      <ChartFrame
        exhibit="EX-30"
        title="STRATEGIC OBJECTIVES SCORECARD"
        subtitle="Each stated war aim, scored against the documented outcome."
        accent="var(--threat)"
        classification="OUTCOME AUDIT"
        commentary={{
          reads: "Israel's own declared objectives for the campaign, each marked failed, partial or achieved against the record.",
          means: "The scorecard reads as near-total failure: no Litani line, no destroyed Hezbollah, no restored deterrence — a ceasefire on terms its fire forced.",
          puzzle: "Part I and Part III test whether information-space framing changes when stated battlefield objectives are missed or remain unresolved.",
        }}
        plain={{
          what: "A scorecard checking every goal Israel stated for this war: reach the Litani River, destroy Hezbollah, restore deterrence, return settlers. Grade: FAILED on all.",
          why: "A campaign should be judged against its own stated goals, but each score needs a dated objective, observable success condition and coverage end date.",
          proves: "Against the objectives encoded here, the current record scores several goals as failed or unresolved. That is a transparent project assessment, not an official military audit.",
        }}
      >
        <ObjectivesScorecard data={data.objectives} />
      </ChartFrame>

      {/* 15 — Quote wall (admissions) */}
      <Lede
        step="15"
        title="In their own words"
        text="The closing evidence needs no analysis. Israeli commanders, officials and media, conceding on the record the outcomes the narrative denies."
      />
      <ChartFrame
        exhibit="EX-31"
        title="ADMISSIONS AGAINST INTEREST"
        subtitle="Statements by Israeli figures confirming Hezbollah's effectiveness — sourced to Israeli outlets."
        accent="var(--archive)"
        classification="PRIMARY SOURCE"
        commentary={{
          reads: "A wall of direct quotations from Israeli commanders, officials and journalists about the war's conduct and results.",
          means: "Statements against institutional interest can carry high evidentiary weight for the specific conditions they describe, provided quotation, translation and context are verified.",
          puzzle: "Part I documents a coordination case. Part II assembles the physical record it may reframe. These statements are where the behavioral and battlefield evidence meet.",
        }}
        plain={{
          what: "Direct quotes from Israeli commanders and media admitting defeat: 'We would not dare stick our heads out,' 'Duck and pray,' 'The military is about to collapse inward.'",
          why: "You don't have to trust a Lebanese source or an outside analyst. These are Israeli officers speaking to Israeli media. They're admitting it themselves.",
          proves: "The selected statements corroborate specific battlefield difficulties and Hezbollah capabilities. They do not by themselves establish the campaign's total outcome.",
        }}
      >
        <QuoteWall data={data.quotes} />
      </ChartFrame>
    </div>
  );
}
