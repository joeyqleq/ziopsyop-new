"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { ChartFrame } from "@/components/fx/ChartFrame";
import { TracedCard } from "@/components/fx/TracedCard";
import { AsciiEyeField } from "@/components/fx/AsciiEyeField";
import { PageIntro } from "@/components/PageIntro";

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
    fieldEvidence:
      "u/[top-actor] posted 847 times in 83 months. r/lebanon: most active user posted 34 times in same period.",
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
    fieldEvidence:
      "r/lebanon sample: a post about shawarma scores 2, an Oct 7 thread scores 336 — natural range. r/ForbiddenBromance: 80% of normalization posts cluster 45–65 upvotes regardless of content quality.",
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
    fieldEvidence:
      "r/lebanon Oct 2024 (active ground invasion): 'Anyone know a good dentist in Hamra?', 'EDL just cut again smh'. r/ForbiddenBromance same period: 100% conflict-framing posts, zero daily-life content.",
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
    fieldEvidence:
      "r/lebanon examples: 'Our government is corrupt garbage', 'Hezbollah ruined the economy', 'Iran treats us like a chess piece'. r/ForbiddenBromance: zero self-critical posts found in full 83-month archive.",
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
    fieldEvidence:
      "r/lebanon has posts in Arabic, English, French, Arabizi ('3ayb', 'ya 7mar'). r/ForbiddenBromance: 88% English, 12% Hebrew — zero Arabic from claimed Lebanese users.",
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
      "Tightly clustered posting hours are consistent with a geographically concentrated cohort, but are not proof of coordination without a matched control and the other behavioral signals.",
    exhibit: "EX-01",
    fieldEvidence:
      "Among the profiled cohort, 68 of 100 recorded 5+ user co-activity windows fall between 14:00 and 19:00 UTC; 17 of 22 subjects have at least 70% activity in the dataset's Israel-hours band.",
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
      "Talking points that arrive and depart in blocks are not slang — they are distributed messaging. r/lebanon’s lexicon evolution looks like natural conversation; ForbiddenBromance’s looks like a content calendar.",
    exhibit: "EX-12",
    fieldEvidence:
      "r/lebanon: 'thawra' persisted organically for months after Oct 2019. r/ForbiddenBromance: 'coexistence' surges 400% on same day as IDF media briefing, drops to zero within 48h.",
  },
  {
    id: "account-age",
    label: "Account Age Proxy",
    description: "Median age of top-actor accounts at sub creation",
    fb: {
      value: 92,
      note: "92% of top 20 actors have NO Reddit history before r/ForbiddenBromance was created",
    },
    lb: {
      value: 8,
      note: "8% — nearly all r/lebanon top posters have multi-year cross-subreddit histories",
    },
    verdict: "ANOMALOUS",
    verdictNote:
      "Accounts purpose-built for a single subreddit — with no prior Reddit activity — are a hallmark of coordinated operations. Organic users have histories: they post in r/cars, r/gaming, r/recipes before finding a political sub.",
    exhibit: "EX-16",
    fieldEvidence:
      "r/ForbiddenBromance top actors: median first-ever Reddit post is in r/ForbiddenBromance itself. r/lebanon top actors: median account age 4.2 years with posts across 12+ subreddits before ever posting in r/lebanon.",
  },
  {
    id: "reply-insulation",
    label: "Reply Network Insulation",
    description: "% of replies staying within top-20 actor cluster",
    fb: {
      value: 74,
      note: "74% of all replies are between the top 20 actors — self-reinforcing bubble",
    },
    lb: {
      value: 18,
      note: "18% — organic subreddit replies distributed across community",
    },
    verdict: "ANOMALOUS",
    verdictNote:
      "In a genuine community, people reply to strangers, newcomers, and lurkers. When 74% of replies stay within a tiny cluster, that is not community — it is a closed-loop amplification network performing engagement for an audience.",
    exhibit: "EX-17",
    fieldEvidence:
      "r/ForbiddenBromance: top 20 actors reply to each other 3.7x more than to any outsider. r/lebanon: top 20 actors' replies are distributed across 200+ unique users per sample window.",
  },
];

const SUMMARY = {
  fb: {
    label: "r/ForbiddenBromance",
    color: "var(--threat)",
    borderColor: "rgba(255,77,94,0.35)",
    anomalies: 9,
    total: 9,
    verdict: "COORDINATED",
  },
  lb: {
    label: "r/lebanon (control)",
    color: "var(--primary)",
    borderColor: "rgba(62,230,193,0.35)",
    anomalies: 0,
    total: 9,
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
  showComparison,
}: {
  metric: (typeof METRICS)[number];
  idx: number;
  showComparison: boolean;
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

        {/* ForbiddenBromance — always visible */}
        <div className={showComparison ? "grid grid-cols-2 gap-3 mb-4" : "mb-4"}>
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

          {/* r/lebanon — conditionally visible */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-md bg-primary/5 border border-primary/20 p-3"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Field Evidence — only visible when comparison is on */}
        <AnimatePresence>
          {showComparison && metric.fieldEvidence && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-md bg-archive/5 border border-archive/20 p-3 mb-4">
                <p className="font-mono text-[9px] tracking-[0.2em] text-archive mb-2">
                  FIELD EVIDENCE
                </p>
                <p className="text-[10px] text-muted leading-relaxed italic">
                  {metric.fieldEvidence}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
  const [showComparison, setShowComparison] = useState(false);

  return (
    <PageShell backdrop="none">
      <AsciiEyeField seed={23} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <PageIntro
          marker="METHODOLOGY // CONTROL GROUP ANALYSIS"
          title="THE CONTROL"
          systemLine="SAME WINDOWS · SAME SIGNALS · DIFFERENT COMMUNITY"
          description={<>
            Cognitive dissonance check: every pattern flagged in r/ForbiddenBromance
            could theoretically be normal for a political subreddit. To falsify
            that, we run the same nine behavioral signals against r/lebanon — a
            genuine Lebanese diaspora community of comparable age and topic domain,
            with no prior suspicion of coordination.
          </>}
        />
          <p className="mt-3 max-w-2xl mx-auto text-xs text-muted-2 leading-relaxed text-balance">
            Data source: Arctic Shift Reddit archive. Three sampling windows: Sep–Oct 2019
            (Lebanon revolution), Oct 2023 (Hamas attack response), Sep–Oct 2024
            (IDF Lebanon ground campaign). Same date windows used for both subreddits.
          </p>

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

        {/* Toggle comparison button */}
        <div className="flex justify-center mb-10">
          <motion.button
            onClick={() => setShowComparison(!showComparison)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`font-mono text-[11px] tracking-[0.2em] px-6 py-3 rounded border transition-colors duration-200 ${
              showComparison
                ? "text-primary border-primary/40 bg-primary/10 hover:bg-primary/15"
                : "text-muted border-borderc bg-white/[0.03] hover:bg-white/[0.06] hover:text-foreground"
            }`}
          >
            {showComparison ? "HIDE COMPARISON" : "SHOW ORGANIC COMPARISON ↕"}
          </motion.button>
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
          title="NINE-SIGNAL BEHAVIORAL COMPARISON"
          subtitle="r/ForbiddenBromance vs r/lebanon — same signals, same date windows. Red = anomalous vs control baseline. Green = within organic range."
          accent="var(--threat)"
          classification="CONTROL GROUP"
          commentary={{
            reads:
              "Nine behavioral signals measured in both subreddits across identical date windows. Each signal has a directional expectation: organic communities should score like r/lebanon.",
            means:
              "ForbiddenBromance fails every single signal against the control. No individual anomaly is conclusive — but 9/9 failures, all in the same direction, at this magnitude, is not noise.",
            puzzle:
              "This is the falsification test. The thesis could have been wrong. The control shows it isn’t. If ForbiddenBromance were a genuine community, it would look like r/lebanon. It does not.",
          }}
          plain={{
            what:
              "We tested a real Lebanese subreddit and a suspicious one using the same 9 measurements. Both have 'Lebanese' communities. One of them behaves like a real Lebanese community.",
            why:
              "Anyone can claim bias in a single data point. Running the same test against a control eliminates the objection. If the patterns were normal for Lebanese political communities, both subreddits would show them.",
            proves:
              "The patterns flagged in ForbiddenBromance are not normal for this type of community. r/lebanon — a genuine peer — passes every signal ForbiddenBromance fails.",
          }}
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mt-2">
            {METRICS.map((m, i) => (
              <MetricRow key={m.id} metric={m} idx={i} showComparison={showComparison} />
            ))}
          </div>
        </ChartFrame>

        {/* Convergence Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <TracedCard traceColor="var(--archive)" className="p-8">
            <p className="font-mono text-[10px] tracking-[0.4em] text-archive mb-6 text-center">
              CONVERGENCE TEST — NO FALSE PRECISION
            </p>

            <div className="max-w-3xl mx-auto">
              <div className="rounded-md bg-black/40 border border-borderc p-6 mb-6">
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-2 mb-4">
                  WHAT THE CONTROL CAN ESTABLISH
                </p>
                <p className="text-sm text-muted leading-relaxed">
                  All nine directional indicators separate the investigated community from the
                  matched r/lebanon sample. That convergence is evidence against the claim that
                  these patterns are simply normal features of a Lebanese political community.
                  It is not, by itself, a calibrated probability of coordination or proof of who
                  operated the accounts.
                </p>
              </div>

              {/* Explanation */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-md bg-threat/5 border border-threat/20 p-4">
                  <p className="font-mono text-[9px] tracking-[0.2em] text-threat mb-2">
                    r/ForbiddenBromance
                  </p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    All 9 sampled indicators move in the anomalous direction relative to the
                    control: concentration, timing, topic diversity, language mix, reply
                    insulation, and related behavioral measures.
                  </p>
                </div>
                <div className="rounded-md bg-primary/5 border border-primary/20 p-4">
                  <p className="font-mono text-[9px] tracking-[0.2em] text-primary mb-2">
                    r/lebanon (CONTROL)
                  </p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Observed probability of r/lebanon showing any of these 9 patterns:
                    effectively zero. The control registers 0/9 anomalous — exactly what
                    organic community theory predicts.
                  </p>
                </div>
              </div>

              {/* Caveat */}
              <div className="mt-4 rounded-md bg-black/30 border border-borderc p-3">
                <p className="text-[10px] text-muted leading-relaxed text-pretty">
                  <span className="text-archive font-mono">NOTE:</span> Signals are not perfectly
                  independent, so multiplying assumed per-signal probabilities would manufacture
                  false precision. A defensible probability estimate requires a larger preregistered
                  reference set, calibrated thresholds, uncertainty intervals, and out-of-sample
                  validation. This page therefore reports directional convergence only.
                </p>
              </div>
            </div>
          </TracedCard>
        </motion.div>

        {/* Bottom line — Falsification result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <TracedCard traceColor="var(--threat)" className="p-8 text-center">
            <p className="font-mono text-[10px] tracking-[0.4em] text-threat mb-4">
            CONTROL RESULT
            </p>
            <p className="font-mono text-base md:text-lg font-bold tracking-[0.08em] text-foreground max-w-3xl mx-auto leading-relaxed text-balance">
              The matched r/lebanon sample does not reproduce the investigated community&apos;s
              nine-indicator pattern. That result strengthens the coordination hypothesis while
              leaving operator identity and causal attribution to the wider evidence chain.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { label: "Signals tested", value: "9" },
                { label: "FB anomalous", value: "9 / 9", color: "var(--threat)" },
                { label: "Lebanon anomalous", value: "0 / 9", color: "var(--primary)" },
                { label: "Claim level", value: "DIRECTIONAL", color: "var(--archive)" },
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

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <a href="/analysis" className="rounded-md border border-primary/30 bg-primary/5 p-4 font-mono text-xs tracking-[0.12em] text-primary transition-colors hover:bg-primary/10">
            ← RETURN TO ANALYSIS
          </a>
          <a href="/forensics" className="rounded-md border border-archive/30 bg-archive/5 p-4 font-mono text-xs tracking-[0.12em] text-archive transition-colors hover:bg-archive/10">
            CROSS-CHECK THE DOSSIERS →
          </a>
          <a href="/sources" className="rounded-md border border-borderc bg-black/20 p-4 font-mono text-xs tracking-[0.12em] text-muted transition-colors hover:text-foreground">
            INSPECT SOURCES & LIMITS →
          </a>
        </div>
      </div>
    </PageShell>
  );
}
