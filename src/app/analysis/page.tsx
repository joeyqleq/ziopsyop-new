"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/PageShell";
import { ChartFrame } from "@/components/fx/ChartFrame";
import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { DecryptText } from "@/components/fx/DecryptText";

const SankeyDiagram = dynamic(
  () => import("@/components/viz/SankeyDiagram").then((m) => m.SankeyDiagram),
  { ssr: false, loading: () => <LoadingViz /> }
);
const NetworkGraph = dynamic(
  () => import("@/components/viz/NetworkGraph").then((m) => m.NetworkGraph),
  { ssr: false, loading: () => <LoadingViz /> }
);
const WordCloud = dynamic(
  () => import("@/components/viz/WordCloud").then((m) => m.WordCloud),
  { ssr: false, loading: () => <LoadingViz /> }
);
const SentimentDrift = dynamic(
  () => import("@/components/viz/SentimentDrift").then((m) => m.SentimentDrift),
  { ssr: false, loading: () => <LoadingViz /> }
);
const VoteAnomaly = dynamic(
  () => import("@/components/viz/VoteAnomaly").then((m) => m.VoteAnomaly),
  { ssr: false, loading: () => <LoadingViz /> }
);
const InfluenceHeatmap = dynamic(
  () => import("@/components/viz/InfluenceHeatmap").then((m) => m.InfluenceHeatmap),
  { ssr: false, loading: () => <LoadingViz /> }
);
const SwimLaneTimeline = dynamic(
  () => import("@/components/viz/SwimLaneTimeline").then((m) => m.SwimLaneTimeline),
  { ssr: false, loading: () => <LoadingViz /> }
);
const ShiaPivotChart = dynamic(
  () => import("@/components/viz/ShiaPivotChart").then((m) => m.ShiaPivotChart),
  { ssr: false, loading: () => <LoadingViz /> }
);
const CoverageGapMatrix = dynamic(
  () => import("@/components/viz/CoverageGapMatrix").then((m) => m.CoverageGapMatrix),
  { ssr: false, loading: () => <LoadingViz /> }
);

function LoadingViz() {
  return (
    <div className="h-[400px] flex items-center justify-center">
      <p className="font-mono text-xs tracking-[0.3em] text-primary caret">
        RENDERING EXHIBIT
      </p>
    </div>
  );
}

/** Numbered narrative connector between exhibits. */
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

export default function AnalysisPage() {
  return (
    <PageShell backdrop="waves">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-10">
        {/* page header */}
        <header className="text-center pb-6">
          <p className="font-mono text-[10px] tracking-[0.5em] text-primary mb-3">
            <DecryptText text="//  SECTION 02 — BEHAVIORAL FORENSICS" speed={28} />
          </p>
          <CinematicTitle
            as="h1"
            text="PSY-OPS ANALYSIS"
            className="font-mono font-bold text-[clamp(1.8rem,6vw,3.4rem)] leading-none tracking-[0.08em] text-foreground"
          />
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted leading-relaxed text-balance">
            The dashboard established that the community&apos;s pulse is external.
            This section goes deeper: who coordinates with whom, what language
            they deploy, how dissent is suppressed — and the moment the mask
            slipped.
          </p>
        </header>

        <div className="space-y-8">
          {/* 01 — kinetic context */}
          <Lede
            step="01"
            title="First, the kinetic context"
            text="Information operations don't happen in a vacuum. Seven parallel lanes — IDF actions, Hezbollah actions, UNIFIL incidents, civilian casualties, political events, media divergence and Reddit spikes — let you see cause and echo on a single axis."
          />
          <ChartFrame
            exhibit="EX-08"
            title="ANNOTATED SWIMLANE TIMELINE"
            subtitle="Seven event lanes on one time axis. Hover any marker for the full incident record."
            accent="var(--primary)"
            classification="MULTI-SOURCE"
            commentary={{
              reads:
                "Every documented incident across seven categories, plotted on a shared timeline so kinetic events, political moves and online activity can be compared directly.",
              means:
                "Reddit spikes (bottom lane) consistently trail kinetic lanes by hours-to-days — the signature of a reactive messaging apparatus, not a community discovering news organically through diverse feeds.",
              puzzle:
                "This is the master clock for the whole case. Each exhibit below zooms into one relationship this timeline exposes.",
            }}
          >
            <SwimLaneTimeline />
          </ChartFrame>

          {/* 02 — asymmetry */}
          <Lede
            step="02"
            title="The asymmetry the conversation must hide"
            text="To understand why a narrative operation is needed at all, look at what it must explain away: the directional flow of violence and who absorbs it."
          />
          <ChartFrame
            exhibit="EX-09"
            title="IHL ASYMMETRY — ATTACKER → TARGET FLOW"
            subtitle="Flow width = incident count, color intensity = casualty weight. The Dahiyeh Doctrine rendered as data."
            accent="var(--threat)"
            classification="IHL ASSESSMENT"
            commentary={{
              reads:
                "A Sankey flow from attacker to target category. Wide red flows into civilian categories represent documented strikes on non-military targets.",
              means:
                "The overwhelming mass of civilian-directed force flows in one direction. This is the ground truth that the subreddit's 'both sides' framing is engineered to dilute.",
              puzzle:
                "The operation's core job: keep this asymmetry out of frame. Every peace-themed surge in EX-03 coincides with windows when this flow was at its most lopsided.",
            }}
          >
            <SankeyDiagram />
          </ChartFrame>

          {/* 03 — coverage gap */}
          <Lede
            step="03"
            title="What the media did and didn't show you"
            text="If an atrocity isn't covered, did it happen? Cross-reference the deadliest incidents against outlet coverage and the editorial pattern becomes its own dataset."
          />
          <ChartFrame
            exhibit="EX-10"
            title="MEDIA COVERAGE GAP MATRIX"
            subtitle="Rows: incidents sorted by casualty count. Columns: outlets. Green = prominent coverage, red = silence."
            accent="var(--archive)"
            classification="MEDIA AUDIT"
            commentary={{
              reads:
                "A binary coverage matrix: which mass-casualty incidents received prominent coverage in which outlets.",
              means:
                "Casualty count does not predict coverage — the attacker's identity does. High-casualty incidents with the 'wrong' attacker vanish from Western front pages while lower-casualty incidents with the 'right' one dominate cycles.",
              puzzle:
                "The subreddit is one node of a larger information ecosystem. The same selection function that filters front pages filters r/ForbiddenBromance's feed — because both are downstream of the same messaging priorities.",
            }}
          >
            <CoverageGapMatrix />
          </ChartFrame>

          {/* 04 — network */}
          <Lede
            step="04"
            title="The cadre, mapped"
            text="EX-05 showed twenty accounts produce most of the content. Force-direct their reply patterns and the cell structure becomes visible: who amplifies whom, and whose claimed identity contradicts their behavior."
          />
          <ChartFrame
            exhibit="EX-11"
            title="USER RELATIONSHIP NETWORK"
            subtitle="Node size = activity, color = flair identity, ring = identity-contradiction score. Drag nodes to interrogate the structure."
            accent="var(--viz-violet)"
            classification="NETWORK FORENSICS"
            commentary={{
              reads:
                "A force-directed graph of who replies to whom. Tightly-bound clusters indicate accounts that consistently engage each other.",
              means:
                "Instead of the diffuse mesh of a real community, we find dense hubs: high-volume accounts orbiting each other, amplifying the same threads within minutes. Accounts flaired 'Lebanese' that interact exclusively inside Israeli-flaired clusters carry high contradiction scores.",
              puzzle:
                "This is the operational chart of H5's cadre — the same names from the Top Actors ledger, now shown working together.",
            }}
          >
            <NetworkGraph />
          </ChartFrame>

          {/* 05 — lexicon */}
          <Lede
            step="05"
            title="The vocabulary of the operation"
            text="Language is the payload. Slice the archive's lexicon by era and watch dehumanization terms, Hasbara buzzwords and scripted 'empathy' rotate in and out on cue."
          />
          <ChartFrame
            exhibit="EX-12"
            title="SUBREDDIT LEXICON OVER TIME"
            subtitle="Time-sliced word frequency. Red = dehumanization, amber = Hasbara buzzwords, mint = bridge/empathy vocabulary."
            accent="var(--archive)"
            classification="LINGUISTIC"
            commentary={{
              reads:
                "The highest-frequency terms in each time slice, color-coded by rhetorical function.",
              means:
                "Vocabularies switch in blocks, not gradients. 'Human shields' and 'terror tunnels' arrive together, peak together, and exit together — the lifecycle of distributed talking points, not of organic slang.",
              puzzle:
                "Pair each lexicon era with EX-03's keyword surges: the words change exactly when the agenda changes. Same hand, different glove.",
            }}
          >
            <WordCloud />
          </ChartFrame>

          {/* 06 — enforcement */}
          <Lede
            step="06"
            title="How dissent is disciplined"
            text="A managed space needs enforcement. Two instruments detect it: longitudinal sentiment drift under downvote pressure, and the statistical fingerprint of vote brigading."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartFrame
              exhibit="EX-13"
              title="USER SENTIMENT DRIFT"
              subtitle="Slope chart of the top 40 users' expressed positions over time."
              accent="var(--primary)"
              commentary={{
                reads:
                  "Each line is one user; its slope tracks how their expressed stance moved between observation windows.",
                means:
                  "Users who voiced criticism of Israeli operations drift toward silence or conformity after sustained downvote campaigns. Pro-operation voices show no equivalent drift.",
                puzzle:
                  "Enforcement works. The 'dialogue' converges toward the operation's preferred range — not because minds changed, but because deviation is made expensive.",
              }}
            >
              <SentimentDrift />
            </ChartFrame>

            <ChartFrame
              exhibit="EX-14"
              title="VOTE ANOMALY DETECTION"
              subtitle="Upvote ratio vs comment engagement. Points below the line carry the brigading signature."
              accent="var(--threat)"
              classification="STATISTICAL"
              commentary={{
                reads:
                  "Each point is a post: engagement (comments) against upvote ratio. Organically controversial posts scatter; brigaded posts cluster in a specific low-ratio, high-engagement band.",
                means:
                  "A distinct population of posts — overwhelmingly those critical of Israeli actions — sits in the weaponized-downvoting band: heavily discussed, mechanically suppressed.",
                puzzle:
                  "This is the enforcement layer that produces EX-13's drift. Suppression isn't a feeling; it's a measurable signature.",
              }}
            >
              <VoteAnomaly />
            </ChartFrame>
          </div>

          {/* 07 — fingerprint */}
          <Lede
            step="07"
            title="The fingerprint"
            text="Stack every behavioral signal — timing, clustering, vocabulary, voting — into a single co-occurrence matrix. Coordination leaves a bright, unmistakable block."
          />
          <ChartFrame
            exhibit="EX-15"
            title="INFLUENCE OPERATION FINGERPRINT MATRIX"
            subtitle="Behavioral co-occurrence across all tracked signals. The bright cluster is the operation."
            accent="var(--threat)"
            classification="SYNTHESIS"
            commentary={{
              reads:
                "A heatmap of how strongly each behavioral indicator co-occurs with each other across accounts and time windows.",
              means:
                "Independent organic behaviors correlate weakly. Here, a block of indicators — synchronized posting, shared vocabulary, mutual amplification, vote-pattern alignment — lights up together. That block is mathematically equivalent to a coordination signature.",
              puzzle:
                "Every exhibit so far is one row or column of this matrix. The case doesn't rest on any single chart — it rests on their joint probability.",
            }}
          >
            <InfluenceHeatmap />
          </ChartFrame>

          {/* 08 — pivot */}
          <Lede
            step="08"
            title="The moment the mask slipped"
            text="Five years of anti-Shia framing ends in a single week — precisely as Hezbollah's FPV drones begin erasing IDF armor from the battlefield. Organic communities don't pivot like this. Commands do."
          />
          <ChartFrame
            exhibit="EX-16"
            title="THE 2026 SHIA PERCEPTION PIVOT"
            subtitle="Anti-Shia vs pro-Shia framing volume, overlaid with IDF operational losses."
            accent="var(--threat)"
            classification="PRIORITY FINDING"
            commentary={{
              reads:
                "Framing polarity of Shia-related content over time, against the curve of documented IDF operational failures in the 2026 ground campaign.",
              means:
                "The crossover is near-instantaneous and precisely timed: as drone losses mount, anti-Shia content stops and pro-Shia content appears for the first time in the archive — while the most viral military story on Earth goes unmentioned.",
              puzzle:
                "This is the case's QED. Timing (EX-01/02), agenda control (EX-03/12), demographics (EX-04), the cadre (EX-05/11) and enforcement (EX-13/14) all predicted central direction. The pivot proved it.",
            }}
          >
            <ShiaPivotChart />
          </ChartFrame>
        </div>
      </div>
    </PageShell>
  );
}
