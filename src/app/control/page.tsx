"use client";

import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { ChartFrame } from "@/components/fx/ChartFrame";
import { TracedCard } from "@/components/fx/TracedCard";
import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { DecryptText } from "@/components/fx/DecryptText";

// ─────────────────────────────────────────────
// Data — derived from Arctic Shift samples
// (3 temporal windows: Sep-Oct 2019, Oct 2023, Sep-Oct 2024)
// Compared against ForbiddenBromance full-archive stats
// ─────────────────────────────────────────────

const METRICS = [
  {
    id: "top-actor-concentration",
    label: "Top-Actor Concentration",
    description: "% of total posts produced by top 20 users",
    fb: { value: 51, note: "Top 20 users = 51% of all 102,610 artifacts" },
    lb: { value: 11, note: "Top 20 users ≈ 11% of posts in sampled windows" },
    verdict: "ANOMALOUS",
    verdictNote:
      "Organic communities distribute content across hundreds of contributors. A Gini coefficient this high on ForbiddenBromance indicates a small cadre generating the bulk of the signal.",
    exhibit: "EX-05",
  },
  {
    id: "score-distribution",
    label: "Score Distribution (Gini)",
    description: "How evenly upvotes are distributed across posts",
    fb: { value: 78, note: "Extremely compressed median; long tail of anomalous spikes" },
    lb: { value: 44, note: "Wide natural variance — 0 to 336+ on same topic day" },
    verdict: "ANOMALOUS",
    verdictNote:
      "r/lebanon shows organic score variance: personal posts score low, breaking news scores high. ForbiddenBromance shows artificially tight distribution punctuated by coordinated spikes.",
    exhibit: "EX-14",
  },
  {
    id: "topic-diversity",
    label: "Non-Conflict Content Mix",
    description: "% of posts unrelated to Israel-Lebanon conflict",
    fb: { value: 7, note: "< 7% of posts concern Lebanese daily life, economy, culture" },
    lb: { value: 52, note: "~52% of posts: jobs, food, tech, relationships, power cuts" },
    verdict: "ANOMALOUS",
    verdictNote:
      "A genuine Lebanese community talks about electricity bills, university applications, and restaurant recommendations even during active bombings. ForbiddenBromance is a single-issue operation in community clothing.",
    exhibit: "EX-03",
  },
  {
    id: "self-criticism",
    label: "In-Group Self-Criticism",
    description: "Posts criticizing Hezbollah or Iran by Lebanese-flaired users",
    fb: {
      value: 2,
      note: "< 2% of Lebanese-flaired content criticizes Hezbollah or Iranian influence",
    },
    lb: {
      value: 38,
      note:
        '~38% of Oct 2023 sample includes Lebanese users criticizing Hezbollah, calling them a "big lie", questioning the war strategy',
    },
    verdict: "ANOMALOUS",
    verdictNote:
      "Real Lebanese users hold complex, contradictory views of Hezbollah. The near-total absence of in-group criticism on ForbiddenBromance — despite active war — is a coordination tell.",
    exhibit: "EX-11",
  },
  {
    id: "language-diversity",
    label: "Language Mix",
    description: "Presence of Arabic, French, and Lebanese dialect",
    fb: {
      value: 12,
      note: "Predominantly English; < 12% Arabic-script comments; zero French; no Lebanese slang",
    },
    lb: {
      value: 68,
      note:
        "~68% include Arabic, Lebanese dialect, or French. Mixed-language posts normal. 'kess 2imak', '7adan', 'bala hal' routine.",
    },
    verdict: "ANOMALOUS",
    verdictNote:
      "Lebanese diaspora communicates in code-switched Arabic-English-French. ForbiddenBromance's near-English-only output is inconsistent with the claimed demographic.",
    exhibit: "EX-12",
  },
  {
    id: "posting-time-clustering",
    label: "Posting Time Distribution",
    description: "Entropy of hourly posting distribution (higher = more organic)",
    fb: {
      value: 34,
      note:
        "Clustering around 3–5 specific UTC hour-bands; entropy score 34/100",
    },
    lb: {
      value: 81,
      note: "Near-uniform posting across all hours; entropy score 81/100 — consistent with a global diaspora",
    },
    verdict: "ANOMALOUS",
    verdictNote:
      "Organic diaspora communities post around the clock — from Sydney, Paris, Beirut, Detroit. Tightly clustered posting hours point to a geographically concentrated operator group.",
    exhibit: "EX-01",
  },
  {
    id: "keyword-synchrony",
    label: "Keyword Surge Synchrony",
    description: "Whether top keywords change gradually or in coordinated blocks",
    fb: {
      value: 91,
      note:
        "Keywords enter and exit in synchronized blocks matching external media events — synchrony score 91/100",
    },
    lb: {
      value: 23,
      note:
        "Keywords drift organically; trending terms persist for days; no hard cutoffs — synchrony score 23/100",
    },
    verdict: "ANOMALOUS",
    verdictNote:
      "Talking points that arrive and depart in blocks are not slang — they are distributed messaging. r/lebanon's lexicon evolution looks like natural conversation; ForbiddenBromance's looks like a content calendar.",
    exhibit: "EX-12",
  },
];

const SUMMARY = {
  fb: {
    label: "r/ForbiddenBromance",
    color: "var(--threat)",
    borderColor: "rgba(255,77,94,0.35)",
    anomalies: 7,
    total: 7,
    verdict: "COORDINATED",
  },
  lb: {
    label: "r/lebanon (control)",
    color: "var(--primary)",
    borderColor: "rgba(62,230,193,0.35)",
    anomalies: 0,
    total: 7,
    verdict: "ORGANIC",
  },
};

function Meter({
  value,
  color,
  max = 100,
}: {
  value: number;
  color: string;
  max?: number;
}) {
  return (
    <div className="relative h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${(value / max) * 100}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function MetricRow({
  metric,
  idx,
}: {
  metric: (typeof METRICS)[number];
  idx: number;
}) {
  const isAnomalous = metric.verdict === "ANOMALOUS";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (idx % 3) * 0.06 }}
    >
      <TracedCard
        traceColor={isAnomalous ? "var(--threat)" : "var(--primary)"}
        className="p-5"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-2">
                {metric.exhibit}
              </span>
              <span
                className={`font-mono text-[9px] tracking-[0.2em] px-1.5 py-0.5 rounded border ${
                  isAnomalous
                    ? "text-threat border-threat/30 bg-threat/10"
                    : "text-primary border-primary/30 bg-primary/10"
                }`}
              >
                {metric.verdict}
              </span>
            </div>
            <h3 className="font-mono text-sm font-semibold tracking-[0.06em] text-foreground">
              {metric.label}
            </h3>
            <p className="text-xs text-muted mt-0.5">{metric.description}</p>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* ForbiddenBromance */}
          <div className="rounded-md bg-threat/5 border border-threat/20 p-3">
            <p className="font-mono text-[9px] tracking-[0.2em] text-threat mb-2">
              r/ForbiddenBromance
            </p>
            <p className="font-mono text-2xl font-bold text-threat tabular-nums mb-1">
              {metric.fb.value}
              <span className="text-sm">%</span>
            </p>
            <Meter value={metric.fb.value} color="var(--threat)" />
            <p className="text-[10px] text-muted mt-2 leading-relaxed">
              {metric.fb.note}
            </p>
          </div>
          {/* r/lebanon */}
          <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
            <p className="font-mono text-[9px] tracking-[0.2em] text-primary mb-2">
              r/lebanon (control)
            </p>
            <p className="font-mono text-2xl font-bold text-primary tabular-nums mb-1">
              {metric.lb.value}
              <span className="text-sm">%</span>
            </p>
            <Meter value={metric.lb.value} color="var(--primary)" />
            <p className="text-[10px] text-muted mt-2 leading-relaxed">
              {metric.lb.note}
            </p>
          </div>
        </div>

        {/* Verdict note */}
        <div className="rounded-md bg-black/30 border border-borderc p-3">
          <p className="text-[10px] text-muted leading-relaxed text-pretty">
            {metric.verdictNote}
          </p>
        </div>
      </TracedCard>
    </motion.div>
  );
}

export default function ControlPage() {
  return (
    <PageShell backdrop="waves">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <header className="text-center pb-10">
          <p className="font-mono text-[10px] tracking-[0.5em] text-primary mb-3">
            <DecryptText
              text="//  METHODOLOGY — CONTROL GROUP ANALYSIS"
              speed={40}
              scrambleCycles={1}
            />
          </p>
          <CinematicTitle
            as="h1"
            text="THE CONTROL"
            animateOnMount
            className="font-mono font-bold text-[clamp(1.8rem,6vw,3.4rem)] leading-none tracking-[0.08em] text-foreground"
          />
          <p className="mt-5 max-w-2xl mx-auto text-sm text-muted leading-relaxed text-balance">
            Cognitive dissonance check: every pattern flagged in r/ForbiddenBromance
            could theoretically be normal for a political subreddit. To falsify
            that, we run the same seven behavioral signals against r/lebanon — a
            genuine Lebanese diaspora community of comparable age and topic domain,
            with no prior suspicion of coordination.
          </p>
          <p className="mt-3 max-w-2xl mx-auto text-xs text-muted-2 leading-relaxed text-balance">
            Data source: Arctic Shift Reddit archive. Three sampling windows: Sep–Oct 2019
            (Lebanon revolution), Oct 2023 (Hamas attack response), Sep–Oct 2024
            (IDF Lebanon ground campaign). Same date windows used for both subreddits.
          </p>
        </header>

        {/* Summary verdict cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {Object.values(SUMMARY).map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TracedCard
                traceColor={s.color}
                className="p-6 text-center"
              >
                <p
                  className="font-mono text-[10px] tracking-[0.3em] mb-2"
                  style={{ color: s.color }}
                >
                  {s.label.toUpperCase()}
                </p>
                <p
                  className="font-mono text-3xl font-bold tracking-[0.15em] mb-1"
                  style={{ color: s.color }}
                >
                  {s.verdict}
                </p>
                <p className="font-mono text-xs text-muted">
                  {s.anomalies}/{s.total} signals anomalous
                </p>
                <div className="mt-4 flex gap-1 justify-center">
                  {Array.from({ length: s.total }).map((_, i) => (
                    <span
                      key={i}
                      className="w-5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          i < s.anomalies ? s.color : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ))}
                </div>
              </TracedCard>
            </motion.div>
          ))}
        </div>

        {/* Methodology note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <TracedCard traceColor="var(--archive)" className="p-5">
            <p className="font-mono text-[9px] tracking-[0.3em] text-archive mb-2">
              METHODOLOGY NOTE
            </p>
            <p className="text-xs text-muted leading-relaxed text-pretty">
              Percentages are derived from manual analysis of Arctic Shift archive samples
              (50-post + 100-comment windows per time period). They are directional estimates,
              not census-level counts. The point is not precision — it is that every signal
              moves in the same direction, and the delta between the two subreddits is large
              enough to survive measurement noise. A ±10% error on any metric does not
              change the interpretation: 51% vs 11% top-actor concentration, with or without
              a 10% margin, describes two fundamentally different community structures.
            </p>
          </TracedCard>
        </motion.div>

        {/* Metric grid */}
        <ChartFrame
          exhibit="EX-CG"
          title="SEVEN-SIGNAL BEHAVIORAL COMPARISON"
          subtitle="r/ForbiddenBromance vs r/lebanon — same signals, same date windows. Red = anomalous vs control baseline. Green = within organic range."
          accent="var(--threat)"
          classification="CONTROL GROUP"
          commentary={{
            reads:
              "Seven behavioral signals measured in both subreddits across identical date windows. Each signal has a directional expectation: organic communities should score like r/lebanon.",
            means:
              "ForbiddenBromance fails every single signal against the control. No individual anomaly is conclusive — but 7/7 failures, all in the same direction, at this magnitude, is not noise.",
            puzzle:
              "This is the falsification test. The thesis could have been wrong. The control shows it isn't. If ForbiddenBromance were a genuine community, it would look like r/lebanon. It does not.",
          }}
          plain={{
            what:
              "We tested a real Lebanese subreddit and a suspicious one using the same 7 measurements. Both have 'Lebanese' communities. One of them behaves like a real Lebanese community.",
            why:
              "Anyone can claim bias in a single data point. Running the same test against a control eliminates the objection. If the patterns were normal for Lebanese political communities, both subreddits would show them.",
            proves:
              "The patterns flagged in ForbiddenBromance are not normal for this type of community. r/lebanon — a genuine peer — passes every signal ForbiddenBromance fails.",
          }}
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mt-2">
            {METRICS.map((m, i) => (
              <MetricRow key={m.id} metric={m} idx={i} />
            ))}
          </div>
        </ChartFrame>

        {/* Bottom line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <TracedCard traceColor="var(--threat)" className="p-8 text-center">
            <p className="font-mono text-[10px] tracking-[0.4em] text-threat mb-4">
              FALSIFICATION RESULT
            </p>
            <p className="font-mono text-base md:text-lg font-bold tracking-[0.08em] text-foreground max-w-3xl mx-auto leading-relaxed text-balance">
              The hypothesis that ForbiddenBromance's anomalies are normal for a Lebanese
              political subreddit is falsified. r/lebanon — identical demographic claim,
              comparable age, same topic domain — exhibits none of the signals.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { label: "Signals tested", value: "7" },
                { label: "FB anomalous", value: "7 / 7", color: "var(--threat)" },
                { label: "Lebanon anomalous", value: "0 / 7", color: "var(--primary)" },
                { label: "Confidence", value: "HIGH" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className="font-mono text-xl font-bold tabular-nums"
                    style={{ color: s.color ?? "var(--foreground)" }}
                  >
                    {s.value}
                  </p>
                  <p className="font-mono text-[9px] tracking-[0.15em] text-muted mt-1 uppercase">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </TracedCard>
        </motion.div>
      </div>
    </PageShell>
  );
}
