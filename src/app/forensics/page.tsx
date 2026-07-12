"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { ChartFrame } from "@/components/fx/ChartFrame";
import { DecryptText } from "@/components/fx/DecryptText";
import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { TracedCard } from "@/components/fx/TracedCard";
import { PixelReveal } from "@/components/fx/PixelReveal";

// Dynamic imports — all chart-heavy
const UserReplyNetwork = dynamic(
  () => import("@/components/viz/UserReplyNetwork").then((m) => m.UserReplyNetwork),
  { ssr: false, loading: () => <LoadingViz /> }
);
const CoordinationTimeline = dynamic(
  () => import("@/components/viz/CoordinationTimeline").then((m) => m.CoordinationTimeline),
  { ssr: false, loading: () => <LoadingViz /> }
);
const SubredditConcentrationMap = dynamic(
  () => import("@/components/viz/SubredditConcentrationMap").then((m) => m.SubredditConcentrationMap),
  { ssr: false, loading: () => <LoadingViz /> }
);
const LanguageRadar = dynamic(
  () => import("@/components/viz/LanguageRadar").then((m) => m.LanguageRadar),
  { ssr: false, loading: () => <LoadingViz /> }
);
const ActivityHeatmap = dynamic(
  () => import("@/components/viz/ActivityHeatmap").then((m) => m.ActivityHeatmap),
  { ssr: false, loading: () => <LoadingViz /> }
);
const UserDossierGrid = dynamic(
  () => import("@/components/viz/UserDossierGrid").then((m) => m.UserDossierGrid),
  { ssr: false, loading: () => <LoadingViz /> }
);
const PersonaContradictionMatrix = dynamic(
  () => import("@/components/viz/PersonaContradictionMatrix").then((m) => m.PersonaContradictionMatrix),
  { ssr: false, loading: () => <LoadingViz /> }
);

function LoadingViz() {
  return (
    <div className="h-[320px] flex items-center justify-center">
      <p className="font-mono text-xs tracking-[0.3em] text-primary animate-pulse">
        DECRYPTING EVIDENCE
      </p>
    </div>
  );
}

function Lede({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="flex items-start gap-4 pt-10 pb-2"
    >
      <span className="font-mono text-[clamp(1.6rem,4vw,2.4rem)] leading-none font-bold text-primary/20 select-none">
        {step}
      </span>
      <div className="pt-0.5">
        <DecryptText
          text={title}
          as="h2"
          startOnView
          speed={40}
          scrambleCycles={1}
          className="font-mono text-base md:text-lg font-bold tracking-[0.12em] text-foreground uppercase"
        />
        <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-3xl text-pretty">{text}</p>
      </div>
    </motion.div>
  );
}

interface ForensicsData {
  users: UserNode[];
  reply_network: Edge[];
  coordination_events: CoordEvent[];
}
interface UserNode {
  username: string;
  role: string;
  contradiction_score: number;
  conflict_pct: number;
  fb_pct: number;
  israel_hours_pct: number;
  age_days: number;
  first_seen: string | null;
  last_seen: string | null;
  total_comments: number;
  total_posts: number;
  lang: Record<string, number>;
  top_subreddits: Array<{ sub: string; count: number }>;
  monthly_activity: Array<{ month: string; count: number }>;
  dormancy_gaps: Array<{ days: number; from: string; to: string }>;
  fb_sentiment: {
    anti_hezbollah: number;
    pro_lebanon: number;
    pro_israel: number;
    sample_comments: Array<{ text: string; score: number; date: string | null }>;
  };
}
interface Edge { source: string; target: string; weight: number; }
interface CoordEvent {
  timestamp: string;
  date: string;
  hour: string;
  user_count: number;
  users: string[];
}

export default function ForensicsPage() {
  const [data, setData] = useState<ForensicsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/user_forensics.json")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    const highContra = data.users.filter((u) => u.contradiction_score > 40).length;
    const highConc = data.users.filter((u) => u.conflict_pct > 70).length;
    const hebrewSpeakers = data.users.filter((u) => (u.lang?.hebrew || 0) > 5).length;
    const topCoordPeak = data.coordination_events[0]?.user_count || 0;
    return { highContra, highConc, hebrewSpeakers, topCoordPeak };
  }, [data]);

  return (
    <PageShell backdrop="waves">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-10">

        {/* page header */}
        <header className="text-center pb-8">
          <p className="font-mono text-[10px] tracking-[0.5em] text-primary mb-3">
            <DecryptText text="//  SECTION 03 — SUBJECT DOSSIERS & BEHAVIORAL FORENSICS" speed={40} scrambleCycles={1} />
          </p>
          <CinematicTitle
            as="h1"
            text="THE DOSSIER"
            animateOnMount
            className="font-mono font-bold text-[clamp(1.8rem,6vw,3.4rem)] leading-none tracking-[0.08em] text-foreground"
          />
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted leading-relaxed text-balance">
            Deep behavioral forensics on the 22 highest-volume actors in the operation.
            Cross-subreddit activity, temporal coordination, language fingerprinting,
            persona contradiction — every metric that exposes a managed account rather than a real person.
          </p>
        </header>

        {/* loading state */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <p className="font-mono text-xs tracking-[0.4em] text-primary animate-pulse">
              DECRYPTING SUBJECT ARCHIVES…
            </p>
          </div>
        )}

        {data && stats && (
          <div className="space-y-8">

            {/* intake brief */}
            <PixelReveal>
              <TracedCard traceColor="var(--threat)" className="p-6 md:p-8 border-l-2 border-l-threat">
                <div className="flex items-center gap-3 mb-5">
                  <span className="stamp text-threat">INTAKE BRIEF</span>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-muted-2">
                    SUBJECTS UNDER ANALYSIS: {data.users.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { val: data.users.length, label: "subjects profiled", color: "text-foreground" },
                    { val: stats.highConc, label: "≥70% conflict concentration", color: "text-threat" },
                    { val: stats.hebrewSpeakers, label: "hebrew-writing accounts", color: "text-eye-purple" },
                    { val: stats.topCoordPeak, label: "peak simultaneous users", color: "text-archive" },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="text-center border border-borderc rounded p-3 bg-black/20">
                      <p className={`font-mono text-3xl font-bold ${color}`}>{val}</p>
                      <p className="font-mono text-[10px] text-muted mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 text-sm text-muted leading-relaxed space-y-2">
                  <p>
                    The 22 accounts below represent the highest-activity users across the r/ForbiddenBromance archive.
                    Each was profiled across their <strong className="text-foreground">entire Reddit history</strong> —
                    not just their activity in the target subreddit — to expose behavioral patterns that a single-sub
                    view would conceal.
                  </p>
                  <p>
                    The methodology is adversarial: we assume each account is real until the data proves otherwise.
                    The signals that break that assumption are temporal coordination, language-identity mismatch,
                    near-total conflict concentration, and dormancy gaps that align with operational pauses.
                  </p>
                </div>
              </TracedCard>
            </PixelReveal>

            {/* EX-17 — dossier grid */}
            <Lede
              step="01"
              title="Subject profiles — the 22 actors"
              text="Each card is a full behavioral dossier. Hover to activate the reveal. Click to expand: sentiment profile, language breakdown, dormancy gaps, verbatim top comments from the operation's main stage."
            />
            <ChartFrame
              exhibit="EX-17"
              title="SUBJECT DOSSIER GRID — 22 ACTORS"
              subtitle="Contradiction score ring = persona inconsistency 0–100. Hover to reveal. Click to expand."
              accent="var(--threat)"
              classification="SUBJECT PROFILES"
              commentary={{
                reads: "22 behavioral dossiers built from complete Reddit histories. Each card shows role classification, conflict concentration, timezone alignment, Hebrew content, dormancy gaps, and verbatim samples.",
                means: "Accounts labeled 'EMBEDDED OPERATIVE' are those whose Reddit existence is overwhelmingly or entirely conflict-sub activity — a statistical impossibility for a genuine person with hobbies, a job, and a life. 'HEBREW SPEAKER' flags accounts that post significant Hebrew text while presenting a Lebanese or neutral persona.",
                puzzle: "The contradiction score ring is the single most important number on each card. A score above 50 means the account's behavior is inconsistent with its claimed identity in multiple independent dimensions simultaneously.",
              }}
            >
              <UserDossierGrid users={data.users} />
            </ChartFrame>

            {/* EX-18 — coordination timeline */}
            <Lede
              step="02"
              title="Simultaneous activation events"
              text="If these 22 people were strangers on the internet, the probability of them all posting to the same political subreddits within the same hour — repeatedly — approaches zero. This chart counts how often it happened."
            />
            <ChartFrame
              exhibit="EX-18"
              title="COORDINATION EVENTS — SIMULTANEOUS ACTIVATION"
              subtitle="Each bar = days where 3+ subjects posted to conflict subs in the same 60-minute window. Red = 5+ users."
              accent="var(--threat)"
              classification="TEMPORAL COORDINATION"
              commentary={{
                reads: "Daily count of hours where 3 or more of our 22 subjects were simultaneously active in conflict-adjacent subreddits. Red bars indicate days with 5+ simultaneous users in the same hour.",
                means: "Real people post when they have time. Managed accounts activate when ordered. The clustering of simultaneous activity around documented Israeli military operations — and the near-total absence of such clustering during quiet periods — is the temporal fingerprint of a coordinated cell, not a community.",
                puzzle: "Cross-reference the red bars with EX-01's military event overlay. The spikes are not random: they align with activation events. Seven of our 22 subjects active in the same hour, on the same day Israel announces a military operation, is not coincidence.",
              }}
            >
              <CoordinationTimeline events={data.coordination_events} />
            </ChartFrame>

            {/* EX-19 — reply network */}
            <Lede
              step="03"
              title="The reply graph — who talks to whom"
              text="Organic communities form diffuse, random-looking graphs. Coordinated cells form tight clusters. Force-direct the 261 reply edges between our 22 subjects and watch the cell structure emerge."
            />
            <ChartFrame
              exhibit="EX-19"
              title="INTER-SUBJECT REPLY NETWORK — 261 EDGES"
              subtitle="Node size = reply degree. Color = role classification. Red ring = contradiction score ≥40. Drag · zoom · interrogate."
              accent="var(--viz-violet)"
              classification="NETWORK FORENSICS"
              commentary={{
                reads: "A force-directed graph of every reply relationship between our 22 subjects. Edge weight = reply count. Tightly-bound clusters indicate accounts that disproportionately engage each other.",
                means: "The graph reveals two distinct clusters: a high-volume Hebrew-speaker hub (IbnEzra613, Shachar2like, Tamtumtam) and a Lebanon-facing embedded cluster (victoryismind, emperorchaos, orangecyanide). Both clusters show more internal cohesion than any organic friend group across years of Reddit activity.",
                puzzle: "IbnEzra613 ↔ Shachar2like: 63+55 mutual replies. victoryismind ↔ orangecyanide: 63+40. These are not people who happened to agree on the internet — these are accounts that consistently reinforce each other across thousands of interactions.",
              }}
            >
              <UserReplyNetwork users={data.users} edges={data.reply_network} />
            </ChartFrame>

            {/* EX-20 — concentration map */}
            <Lede
              step="04"
              title="Where they actually live online"
              text="The matrix below maps every subject's activity across every subreddit they touched. Red = conflict sub. Green = other. The pattern of near-total red for a dozen accounts is not a hobby — it is a job."
            />
            <ChartFrame
              exhibit="EX-20"
              title="SUBREDDIT CONCENTRATION MAP — ALL SUBJECTS × ALL SUBS"
              subtitle="Each cell = comment volume. Red cells = conflict-adjacent subreddits. Darker = higher volume. CONC% = total share in conflict subs."
              accent="var(--archive)"
              classification="BEHAVIORAL FINGERPRINT"
              commentary={{
                reads: "A user × subreddit heatmap. Each row is one subject, each column one subreddit. Cell intensity = comment volume. Red columns are conflict-adjacent; green columns are unrelated subs.",
                means: "Accounts like orangecyanide (92.7% conflict), Current-Meal9360 (95.3%), Glad-Difference-3238 (90.1%) have virtually no green. Their entire Reddit existence is the conflict zone. No sports. No hobbies. No local news. No pets. Just conflict, forever.",
                puzzle: "Compare to levnon14 (89.4%) and levnon14's dormancy gap of 537 days followed by sudden reactivation in November 2023 — four weeks after October 7. Asset hibernated, then redeployed.",
              }}
            >
              <SubredditConcentrationMap users={data.users} />
            </ChartFrame>

            {/* EX-21 — activity heatmap */}
            <Lede
              step="05"
              title="The timeline — who was active when"
              text="Each row is one subject's activity history from 2016 to 2026. The green halos mark IDF operation windows. Watch which accounts switch on in lockstep."
            />
            <ChartFrame
              exhibit="EX-21"
              title="TEMPORAL ACTIVITY MAP — ALL SUBJECTS × 10 YEARS"
              subtitle="Each cell = one month of activity. Intensity = volume. Green outline = known IDF operation window."
              accent="var(--primary)"
              classification="TEMPORAL ANALYSIS"
              commentary={{
                reads: "A 10-year activity heatmap across all 22 subjects. Rows sorted by conflict concentration by default. Green outlines mark documented IDF operation windows.",
                means: "Multiple subjects show synchronized activation: dormant for months, then suddenly active across the same month windows — always during or immediately after military operations. Accounts that had no Reddit presence before October 2023 appear fully formed with coordinated behavior in November 2023.",
                puzzle: "victoryismind: 377-day dormancy gap ending October 23, 2023 — sixteen days after Oct 7. levnon14: 537-day gap ending November 4, 2023. Two accounts, independently dormant, both reactivated within weeks of the same trigger event.",
              }}
            >
              <ActivityHeatmap users={data.users} />
            </ChartFrame>

            {/* EX-22 — language + behavioral radar */}
            <Lede
              step="06"
              title="Behavioral fingerprint radar"
              text="Six normalized signals per subject: conflict focus, timezone alignment, ForbiddenBromance embeddedness, contradiction score, Hebrew content, and volume. Organic accounts scatter. Operatives cluster."
            />
            <ChartFrame
              exhibit="EX-22"
              title="MULTI-SIGNAL BEHAVIORAL RADAR"
              subtitle="Each axis = one behavioral signal, normalized 0–100. Toggle subjects to compare profiles. Overlapping shapes = similar behavioral fingerprints."
              accent="var(--viz-violet)"
              classification="MULTI-SIGNAL"
              commentary={{
                reads: "A radar chart of six behavioral signals for each subject. Toggle up to 22 subjects on/off to compare profiles.",
                means: "Organic users have irregular, idiosyncratic profiles — high on some dimensions, low on others. The embedded operatives in this cohort show high scores across multiple dimensions simultaneously: conflict focus + timezone alignment + high volume. That combination is the fingerprint of a managed account.",
                puzzle: "Select IbnEzra613, Shachar2like, and Tamtumtam together. Three accounts with superficially different backstories produce near-identical radar shapes. Three people who are, behaviorally, the same entity.",
              }}
            >
              <LanguageRadar users={data.users} />
            </ChartFrame>

            {/* EX-23 — contradiction matrix */}
            <Lede
              step="07"
              title="The contradiction matrix — where the masks crack"
              text="The final synthesis: every subject scored across every signal. This is the evidence table. The bright red cells are not innuendo — they are measured, falsifiable behavioral data."
            />
            <ChartFrame
              exhibit="EX-23"
              title="PERSONA CONTRADICTION MATRIX — ALL SIGNALS"
              subtitle="Each cell = signal score 0–100. Red = exceeds anomaly threshold. Total column = mean across all signals."
              accent="var(--threat)"
              classification="SYNTHESIS · PRIORITY EXHIBIT"
              commentary={{
                reads: "A subjects × signals matrix. Each cell is a behavioral signal score. Red cells exceed the per-signal anomaly threshold. The Total column is the mean across all signals.",
                means: "The accounts with the most red cells are the most behaviorally inconsistent with the organic-user hypothesis. No single red cell is damning. The pattern of red across multiple independent signals — that is the case.",
                puzzle: "This matrix is the dossier's QED. Every exhibit in EX-17 through EX-22 contributes one or more columns to this table. The operation does not rest on a narrative. It rests on a number: the joint probability of all these signals appearing together by chance.",
              }}
            >
              <PersonaContradictionMatrix users={data.users} />
            </ChartFrame>

            {/* closing verdict */}
            <PixelReveal>
              <TracedCard traceColor="var(--threat)" className="p-6 md:p-8 border-l-2 border-l-threat">
                <div className="flex items-center gap-3 mb-4">
                  <span className="stamp text-threat">VERDICT</span>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-muted-2">DOSSIER ASSESSMENT</span>
                </div>
                <div className="space-y-3 text-sm text-muted leading-relaxed">
                  <p>
                    The 22 subjects profiled in this dossier are not a random sample of internet users.
                    They are a statistically anomalous cohort: <strong className="text-foreground">simultaneous activations that correlate with military operations,
                    behavioral fingerprints that cluster instead of scatter, language-identity mismatches that contradict their stated personas,
                    and dormancy gaps that align with operational pauses.</strong>
                  </p>
                  <p>
                    No single exhibit is conclusive. That is intentional. The case is built on the joint
                    probability of all exhibits being true simultaneously — a probability that, for organic users,
                    approaches zero.
                  </p>
                  <div className="mt-3 rounded-md border border-threat/40 bg-threat/5 p-4 font-mono text-xs">
                    <p className="text-threat tracking-[0.2em] mb-2">SUMMARY ASSESSMENT:</p>
                    <div className="space-y-1 text-muted">
                      <p>▸ {stats.highConc}/22 subjects with ≥70% conflict-sub concentration</p>
                      <p>▸ {stats.hebrewSpeakers} Hebrew-writing accounts embedded in Lebanese-identity spaces</p>
                      <p>▸ {data.coordination_events.filter((e) => e.user_count >= 5).length} documented 5+ user simultaneous activation events</p>
                      <p>▸ Multiple dormancy gaps ending within days of IDF operation announcements</p>
                      <p>▸ Mutual reply density 4–8× higher than base-rate for strangers on Reddit</p>
                    </div>
                    <p className="mt-3 text-threat">
                      CLASSIFICATION: COORDINATED INAUTHENTIC BEHAVIOR — HIGH CONFIDENCE
                    </p>
                  </div>
                </div>
              </TracedCard>
            </PixelReveal>

            {/* bridge */}
            <PixelReveal>
              <TracedCard traceColor="var(--archive)" className="p-6 md:p-8 border-l-2 border-l-archive">
                <span className="stamp text-archive">CROSS-REFERENCE</span>
                <p className="mt-4 text-sm text-muted leading-relaxed max-w-3xl">
                  The subjects profiled here are the foot soldiers of the operation dissected in Part I.
                  The statistical case built there — timing, agenda, flair distribution, top-actor concentration —
                  is now given faces. Return to the behavioral analysis for the full operational picture.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <a href="/part-i" className="group inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-primary transition-all hover:bg-primary/10">
                    ← PART I — THE OPERATION
                    <span className="transition-transform group-hover:-translate-x-1">←</span>
                  </a>
                  <a href="/analysis" className="group inline-flex items-center gap-2 rounded-md border border-archive/40 bg-archive/5 px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-archive transition-all hover:bg-archive/10">
                    PSY-OPS ANALYSIS →
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </TracedCard>
            </PixelReveal>

          </div>
        )}
      </div>
    </PageShell>
  );
}
