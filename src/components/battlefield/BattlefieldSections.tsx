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
        text="Before judging conduct, fix the facts. Every confirmed Hezbollah strike of the war, classified by target. The distribution is the first piece of evidence — and it is exclusively military."
      />
      <ChartFrame
        exhibit="EX-17"
        title="STRIKE TAXONOMY — TARGET CLASSIFICATION"
        subtitle="All confirmed Hezbollah strikes, classified by target type."
        accent="var(--primary)"
        classification="STRIKE LOG"
        commentary={{
          reads: "The full population of confirmed Hezbollah strikes, broken down by the class of target each one hit.",
          means: "There is no civilian-target band of any consequence. Hezbollah's fire was directed at military formations, armor and bases — the legal definition of distinction, met.",
          puzzle: "This is the baseline the subreddit operation must invert: an actor fighting a disciplined military campaign reframed as the indiscriminate aggressor.",
        }}
        plain={{
          what: "A breakdown of every confirmed Hezbollah strike by what it hit: tanks, bases, vehicles, soldiers. Zero civilian targets.",
          why: "If the 'terrorist' label were true, you'd see civilian targets dominating. They don't appear at all.",
          proves: "Hezbollah fought a textbook military campaign against military targets only — the opposite of what 'terrorist' means.",
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
          proves: "The 'most moral army' produces the largest violation footprint on every single dimension measured.",
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
          proves: "Israel killed 3,500 civilians including 276 healthcare workers and 11 journalists. This is documented mass civilian killing.",
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
          means: "This is not a heat-of-battle error. It is a deliberate pattern: the timing between strikes is calibrated to catch ambulances on scene.",
          puzzle: "160 paramedics dead. 130 ambulances destroyed. This systematic targeting of protected medical personnel defines terrorism under any legal framework.",
        }}
        plain={{
          what: "A list of incidents where Israel bombed a target, waited for paramedics to arrive, then bombed the paramedics too. Some did it 3 or 4 times.",
          why: "Deliberately killing rescuers is one of the clearest war crimes possible. Paramedics are protected under international law — always.",
          proves: "160 paramedics killed by a deliberate, repeated pattern. This is terrorism by any definition of the word.",
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
          proves: "$5 billion in destruction, 60 villages demolished, 1.4 million displaced. This is collective punishment, not self-defense.",
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
          means: "Hezbollah registers compliant or not-applicable across the board; the IDF registers violations on every principle, each backed by counted incidents.",
          puzzle: "This is the legal spine of Part 2. The subreddit's job was to make sure this matrix was never assembled in public view.",
        }}
        plain={{
          what: "A report card grading both sides on international law: Did they distinguish military from civilian? Protect medics? Avoid collective punishment?",
          why: "This is how courts decide war crimes — principle by principle. One side passes every test. The other fails every one.",
          proves: "The IDF violates every single principle of international humanitarian law. Hezbollah complies with all of them. The 'moral army' claim is legally inverted.",
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
          puzzle: "The timeline reveals that escalation was always initiated by Israeli violations — the resistance responded, it didn't provoke.",
        }}
        plain={{
          what: "A visual timeline of the entire war showing political events, Hezbollah strikes, battlefield outcomes, and civilian deaths — all on one chart.",
          why: "Seeing everything together reveals who escalated when. Every civilian casualty spike follows an Israeli violation, not a Hezbollah attack.",
          proves: "The war's chronology shows Israel as the consistent aggressor and ceasefire violator — Hezbollah responded to provocations, not the reverse.",
        }}
      >
        <CampaignTimeline data={data.timeline} />
      </ChartFrame>

      {/* ═══════════════════════════════════════════════════════════
          ACT III — THE VERDICT
          What the evidence proves about the two claims
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
          why: "Israel literally cannot afford this war. Every $200 drone forces $100,000+ in response. Do the math on 649 strikes.",
          proves: "The cost ratio is 15,000:1 in Hezbollah's favor. This war is economically unwinnable for Israel — confirmed by their own withdrawal.",
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
          means: "The FPV drone at $200 delivers returns of 10,000:1 or higher. Every weapon system sits far above break-even. The war's economics are mathematically unwinnable for Israel.",
          puzzle: "When every engagement costs the defender orders of magnitude more than the attacker, 'winning' becomes a function of time — and time favors the cheaper side.",
        }}
        plain={{
          what: "A scatter chart showing each Hezbollah weapon: what it costs to build vs how much damage it does. The $200 drone destroys $4M targets. Every weapon is above the profit line.",
          why: "This is why Israel lost. Not because of tactics or bravery — because of math. You cannot defend $4M assets from $200 weapons indefinitely.",
          proves: "Every single Hezbollah weapon system operates above break-even. The war is economically unwinnable for Israel — proven by simple division.",
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
          proves: "The IDF lost over 900 pieces of military equipment worth $1.6B+. They were outfought by a force spending 1/15,000th per engagement.",
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
          means: "The progression toward jam-proof guided munitions explains the attrition curve: countermeasures that work against radio-controlled drones are useless against a fiber tether.",
          puzzle: "A learning, innovating adversary contradicts the 'primitive terrorist' frame — so the innovation had to go unreported.",
        }}
        plain={{
          what: "A timeline showing how Hezbollah's weapons evolved: from basic rockets to unjammable fiber-optic drones that Israel cannot stop.",
          why: "This is engineering, not terrorism. A $400 fiber-optic drone that defeats electronic warfare systems worth millions represents genuine military innovation.",
          proves: "Hezbollah is a sophisticated military force that out-innovated the IDF's countermeasures. 'Primitive terrorists' don't develop EW-immune precision weapons.",
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
        subtitle="Five data points from different tables. One conclusion: systematic underreporting."
        accent="var(--threat)"
        classification="CROSS-REFERENCE"
        commentary={{
          reads: "A funnel narrowing from 665 documented strikes to 42 IDF-admitted KIA — each step sourced from a different database table.",
          means: "The shrinkage ratio is the lie. 665 strikes with confirmed hits produce an official admission of only 42 deaths. The gap between filmed drone kills and official figures is the proof of systematic lying.",
          puzzle: "This is why the subreddit operation matters: if these numbers ever reach mainstream discourse, the 'low casualty' narrative collapses.",
        }}
        plain={{
          what: "A funnel visualization showing how IDF casualty numbers shrink from reality (665 strikes) to their official admission (42 dead). Five independent data sources, one conclusion.",
          why: "Each step in the funnel comes from a DIFFERENT database table. This isn't one source claiming they lied — it's five independent datasets proving it mathematically.",
          proves: "The IDF admits only 35% of estimated casualties. They are systematically lying about their losses — provable by cross-referencing their own data.",
        }}
      >
        <LieDetector data={data.lieDetector} />
      </ChartFrame>

      {/* 11b — ADMISSION GAP: BBC-verified proof of systematic lying */}
      <Lede
        step="11b"
        title="The gap between reality and propaganda"
        text="BBC Verify independently geolocated 35 FPV drone strikes. The IDF admits 21 soldiers killed total. The Israeli army chief admitted 5,942 bereaved families vs 844 official KIA in Gaza. Multiple independent sources, one conclusion: systematic lying at industrial scale."
      />
      <ChartFrame
        exhibit="EX-27b"
        title="ADMISSION GAP — MULTI-SOURCE VERIFICATION"
        subtitle="Independent data sources vs official IDF claims. The gap between them is the lie, measured."
        accent="var(--threat)"
        classification="CROSS-REFERENCE"
        commentary={{
          reads: "A waterfall visualization showing how verified strike data shrinks to official Israeli admissions, with each layer sourced independently.",
          means: "35 strikes geolocated by BBC Verify alone. ~100 claimed total. Yet only 21 deaths admitted. In Gaza: 844 official vs 5,942 bereaved families. The pattern is identical across theatres.",
          puzzle: "When the army chief himself admits the numbers don't add up, the only remaining question is the magnitude of the lie — not its existence.",
        }}
        plain={{
          what: "Multiple independent sources (BBC, Haaretz, army chief) all showing the IDF admits far fewer casualties than actually occurred. Visual proof of systematic lying.",
          why: "This isn't one source's claim — it's BBC Verify, Israeli hospital records, and Israel's own army chief all saying the same thing independently.",
          proves: "The IDF lies about casualties by a factor of 5-7x. This is provable from their own data, their own hospitals, their own chief of staff's admission.",
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
        classification="PARTICLE PROOF"
        commentary={{
          reads: "5,942 particles drifting in a field. 844 illuminate red. The rest remain ghostly — present but unacknowledged.",
          means: "Israel's own bereaved families registry contains 7× more entries than official KIA figures. The army chief admitted this publicly. The particles make the ratio visceral.",
          puzzle: "When your own bereaved families registry contradicts your casualty figures by 7:1, the lie isn't a matter of opinion — it's a matter of arithmetic.",
        }}
        plain={{
          what: "A field of 5,942 dots — each one a real bereaved family registered in Israel. Only 844 light up red (the ones Israel officially admits). The remaining 5,098 stay as ghosts.",
          why: "Israel's own army chief admitted these numbers don't match. This isn't an enemy's claim — it's their own internal registry contradicting their public statements.",
          proves: "Israel acknowledges only 14% of its actual casualties. The remaining 86% are hidden from public discourse. Their own data proves it.",
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
          means: "The inversion is total. On every metric of civilian harm, the side labeled 'terrorist' scores zero and the side labeled 'moral' scores catastrophically.",
          puzzle: "The entire information operation — Part 1's subreddit manipulation — exists to prevent this comparison from being seen.",
        }}
        plain={{
          what: "A split-screen showing both sides' records on identical metrics. Hezbollah: 0 across all civilian harm categories. IDF: thousands killed, hospitals destroyed, ambulances bombed.",
          why: "You don't need analysis. You don't need context. Put the same metrics side by side and the 'terrorist' label inverts itself.",
          proves: "The data proves Hezbollah is a disciplined military force and the IDF commits systematic war crimes. The labels are exactly backwards.",
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
          puzzle: "When commanders contradict themselves on camera, the only defense is making sure nobody sees both clips side by side. That's what the operation does.",
        }}
        plain={{
          what: "Israeli commanders making confident claims on TV — then what actually happened. The colonel who said 'they're weakened' was critically wounded by a drone weeks later.",
          why: "These are Israeli sources, Israeli media, Israeli commanders. The contradiction isn't between Israel and its enemies — it's between Israel and itself.",
          proves: "The IDF leadership systematically lied to its own public about the war's progress. Their own subsequent injuries and retreats prove the lies.",
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
        subtitle="Each pair: IDF claim (left/red) vs verified truth (right/green). The number between them = days the lie held."
        accent="var(--archive)"
        classification="TEMPORAL FORENSICS"
        commentary={{
          reads: "A timeline of documented IDF claims paired with their debunking — from '40 beheaded babies' (3 days) to 'death tolls are inflated' (792 days).",
          means: "Tactical lies ('it was Hamas') collapse in days. Strategic lies ('we're winning', 'death tolls are fake') hold for months or years — long enough to shape policy and public opinion.",
          puzzle: "The subreddit operation exists to extend propaganda half-life. Every day a lie survives unchallenged is a day it shapes someone's worldview.",
        }}
        plain={{
          what: "A timeline showing how long each IDF lie survived before being exposed. Some lasted 2 days. One lasted 792 days (over 2 years) before Israel admitted it was true.",
          why: "Propaganda works not because it's believed forever — but because it holds long enough to matter. 792 days of 'death tolls are fake' = 792 days of impunity.",
          proves: "IDF propaganda has a measurable half-life. Every claim documented here was eventually contradicted — often by Israel's own officials or media.",
        }}
      >
        <FogOfWarClock data={data.fogOfWar} />
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
          puzzle: "When the battlefield delivers defeat, the information space must manufacture the missing victory. That is the operation's reason to exist.",
        }}
        plain={{
          what: "A scorecard checking every goal Israel stated for this war: reach the Litani River, destroy Hezbollah, restore deterrence, return settlers. Grade: FAILED on all.",
          why: "You don't need an analyst's opinion. Judge them by their own stated goals. They failed every single one.",
          proves: "The 'most moral army' launched a war, killed 3,500 civilians, destroyed $5B in infrastructure — and achieved none of its stated objectives. That is the definition of a failed military campaign.",
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
          means: "These are admissions against interest — the strongest class of evidence. The defeated side's own command echelon corroborates the data in every preceding exhibit.",
          puzzle: "Part 1 proved a narrative was manufactured. Part 2 proves what it was built to bury. These voices are where the two halves of the case meet.",
        }}
        plain={{
          what: "Direct quotes from Israeli commanders and media admitting defeat: 'We would not dare stick our heads out,' 'Duck and pray,' 'The military is about to collapse inward.'",
          why: "You don't have to trust a Lebanese source or an outside analyst. These are Israeli officers speaking to Israeli media. They're admitting it themselves.",
          proves: "The IDF's own commanders confirm Hezbollah's military effectiveness and their own operational failure. The 'most moral army' narrative contradicts their own testimony.",
        }}
      >
        <QuoteWall data={data.quotes} />
      </ChartFrame>
    </div>
  );
}
