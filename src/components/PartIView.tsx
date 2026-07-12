"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { PartIHeader } from "@/components/PartIHeader";
import { StatsOverview } from "@/components/StatsOverview";
import { TimelineChart } from "@/components/TimelineChart";
import { AnomalyDetector } from "@/components/AnomalyDetector";
import { KeywordHeatmap } from "@/components/KeywordHeatmap";
import { FlairComposition } from "@/components/FlairComposition";
import { TopActors } from "@/components/TopActors";
import { EventCorrelation } from "@/components/EventCorrelation";
import { SubredditGrowth } from "@/components/SubredditGrowth";
import { ChartFrame } from "@/components/fx/ChartFrame";
import { TracedCard } from "@/components/fx/TracedCard";
import { DecryptText } from "@/components/fx/DecryptText";
import { PixelReveal } from "@/components/fx/PixelReveal";
import type { AnalysisData } from "@/lib/reddit";
import { trackEvent } from "@/lib/analytics";

function DiscordLightbox() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* thumbnail */}
      <button
        onClick={() => { setOpen(true); trackEvent("discord_lightbox_open"); }}
        className="group relative mt-3 block w-full max-w-xs rounded border border-threat/40 overflow-hidden hover:border-threat/70 transition-colors cursor-zoom-in"
        aria-label="Expand Discord DM screenshot"
      >
        <img
          src="/discord.png"
          alt="Discord DM — Klar admits mutual coordination team"
          className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono text-[10px] tracking-[0.2em] text-primary border border-primary/50 px-2 py-1">EXPAND</span>
        </div>
      </button>
      <p className="text-[10px] text-muted-2 italic mt-1">
        Discord DM — &ldquo;Klar&rdquo; admits coordination team. Account deleted next day.
      </p>

      {/* lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-2xl w-full rounded-md border border-threat/50 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 bg-black/80 border-b border-threat/30">
                <span className="font-mono text-[10px] tracking-[0.25em] text-threat">EXHIBIT A — DIRECT ADMISSION</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-2 hover:text-foreground font-mono text-xs"
                  aria-label="Close"
                >✕</button>
              </div>
              <img
                src="/discord.png"
                alt="Discord DM screenshot showing admin Klar admitting mutual coordination team"
                className="w-full h-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Section label — the narrative spine connecting exhibits into one case. */
function CaseStep({
  step,
  title,
  lede,
}: {
  step: string;
  title: string;
  lede: string;
}) {
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
        <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-3xl text-pretty">
          {lede}
        </p>
      </div>
    </motion.div>
  );
}

export function PartIView({ data }: { data: AnalysisData }) {
  return (
    <PageShell backdrop="warp">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-10">
        <PartIHeader />

        <div className="space-y-8">
          {/* ledger */}
          <section aria-label="Dataset overview" className="pt-4">
            <StatsOverview overview={data.overview} />
          </section>

          {/* origin + case file — compressed to one viewport */}
          <PixelReveal>
            <TracedCard traceColor="var(--threat)" className="p-4 md:p-5 border-l-2 border-l-threat">
              <div className="flex items-center gap-3 mb-3">
                <span className="stamp text-threat">ORIGIN</span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-muted-2">r/ForbiddenBromance · 2019—2026</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* left: narrative + DM quotes */}
                <div className="space-y-3 text-sm text-muted leading-relaxed">
                  <p>
                    A Reddit community called{" "}
                    <strong className="text-foreground">r/ForbiddenBromance</strong>{" "}
                    claimed grassroots Lebanese-Israeli dialogue. The timing was wrong.
                    The demographics were wrong. The messaging was uniform.
                    102,610 artifacts across 83 months later — the verdict was clear.
                  </p>

                  <div className="rounded border border-borderc bg-black/40 p-3 font-mono text-xs">
                    <p className="text-threat tracking-[0.18em] mb-2 text-[9px]">DIRECT QUOTES — DISCORD DM:</p>
                    <p className="text-foreground mb-1">&ldquo;we have a mutual coordination team&rdquo;</p>
                    <p className="text-foreground">&ldquo;i run the day to day on the server&rdquo;</p>
                    <p className="mt-2 text-muted-2 text-[9px]">Account deleted the next day.</p>
                  </div>

                  <div className="rounded border border-borderc bg-black/30 p-3 font-mono text-[10px] space-y-1">
                    <p className="text-threat tracking-[0.18em] text-[9px] mb-2">ASSESSMENT:</p>
                    <p className="text-muted">▸ Centralized coordination confirmed</p>
                    <p className="text-muted">▸ Dedicated operational management</p>
                    <p className="text-muted">▸ Asset burned within 24h of exposure</p>
                    <p className="text-muted">▸ Consistent with Unit 8200 methodology</p>
                  </div>
                </div>

                {/* right: thumbnail + hypotheses */}
                <div className="flex flex-col gap-3">
                  <DiscordLightbox />

                  <div className="rounded border border-archive/25 bg-archive/[0.03] p-3">
                    <p className="font-mono text-[9px] tracking-[0.25em] text-archive mb-2">FIVE FALSIFIABLE CLAIMS:</p>
                    <ol className="space-y-1 font-mono text-[10px] text-muted">
                      {[
                        "H1 — Activity tracks military events, not user growth",
                        "H2 — Spikes are statistically anomalous",
                        "H3 — Agenda is set top-down, not by users",
                        "H4 — The 'Lebanese' community is not Lebanese",
                        "H5 — A small cadre produces the bulk of content",
                      ].map((h) => (
                        <li key={h} className="flex gap-1.5">
                          <span className="text-primary shrink-0">▸</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </TracedCard>
          </PixelReveal>

          {/* H1 */}
          <CaseStep
            step="01"
            title="The pulse follows the war, not the people"
            lede="If this community were organic, its activity would track user growth and slow news cycles. Instead, every major surge lines up with an Israeli military operation. The conversation breathes with the battlefield."
          />
          <ChartFrame
            exhibit="EX-01"
            title="ACTIVITY TIMELINE — 83 MONTHS UNDER OBSERVATION"
            subtitle="Posts and comments per month. Dashed red verticals mark real-world military events. Toggle to Hebrew-only traffic to see who the surge actually is."
            accent="var(--primary)"
            commentary={{
              reads:
                "Monthly volume of posts and comments from Sept 2019 to Mar 2026, with military events overlaid. The Hebrew-only view isolates artifacts written in Hebrew script.",
              means:
                "Volume is flat for years, then erupts in lockstep with October 2023 and the 2024 Lebanon escalation. Organic communities grow in curves; this one moves in steps that match an operations calendar. Hebrew-language traffic surges at exactly the same moments — the 'Lebanese dialogue space' speaks Hebrew when it matters.",
              puzzle:
                "This is hypothesis H1 and the foundation of the case: the community's heartbeat is external. Every exhibit that follows asks who is pumping the blood.",
            }}
            plain={{
              what: "This chart shows how often people posted on this subreddit each month for 6+ years — spikes mean lots of activity, flat means quiet.",
              why: "A real friendship community posts steadily. This one goes silent for months, then explodes exactly when Israel starts bombing Lebanon. That is not friendship. That is a media operation.",
              proves: "The subreddit was switched on and off by events in the real war — not by its users.",
            }}
          >
            <TimelineChart
              data={data.monthly_activity}
              dailyData={data.daily_activity}
              events={data.event_timeline}
              eras={data.eras}
            />
          </ChartFrame>

          {/* EX-00b: Subreddit Growth */}
          <ChartFrame
            exhibit="EX-00b"
            title="SUBREDDIT GROWTH — 83 MONTHS OF EXPANSION"
            subtitle="Cumulative unique users, flair identity split, and content volume since inception. Toggle views to isolate the Israeli-Lebanese divergence over time."
            accent="var(--primary)"
            commentary={{
              reads:
                "Four views: cumulative growth with subscriber count overlay, new vs active users per month, identity flair breakdown (Israeli/Lebanese/other), and raw posts/comments volume.",
              means:
                "Israeli-flaired participation reached a 3:1 ratio vs Lebanese and held it through every military escalation. Lebanese user share flatlined while Israeli-flaired accounts drove every growth phase. The 'dialogue' community grew primarily by adding Israeli voices.",
              puzzle:
                "A genuine dialogue community would grow both sides in tandem. This one grew one side in sync with military operations. The identity tab makes the imbalance impossible to ignore.",
            }}
            plain={{
              what: "This shows how the subreddit grew from 2019 to 2026 — who joined, when, and what their self-reported identity was.",
              why: "If this were a real friendship community, Lebanese and Israeli users would grow together. Instead, Israeli accounts outnumber Lebanese 3-to-1 and drove every growth surge. The 'Lebanese dialogue' is mostly Israelis talking.",
              proves: "The community was built and grown primarily by the Israeli side — structurally incompatible with its claimed purpose.",
            }}
          >
            <SubredditGrowth data={data.subreddit_growth} eras={data.eras} />
          </ChartFrame>

          {/* H2 */}
          <CaseStep
            step="02"
            title="The spikes are statistically impossible"
            lede="Eyeballing a chart can deceive. Z-scores cannot. We measured how far each month deviates from the community's own baseline — anything beyond +1.5σ is an anomaly demanding explanation."
          />
          <ChartFrame
            exhibit="EX-02"
            title="ANOMALY DETECTOR — DEVIATION FROM BASELINE"
            subtitle="Each bar is one month's z-score against the full 83-month baseline. Red bars breach the +1.5σ anomaly threshold."
            accent="var(--threat)"
            classification="STATISTICAL"
            commentary={{
              reads:
                "Standard-score deviation of monthly activity. A z-score of +2 means that month was two standard deviations busier than this community's normal life.",
              means:
                "The anomalous months are not randomly distributed — they cluster precisely around military operations. Random user enthusiasm produces scattered noise; coordinated mobilization produces exactly this clustered signature.",
              puzzle:
                "H2 confirmed: the surges in EX-01 aren't just visually striking, they're mathematically aberrant. Something external switches this community on and off.",
            }}
            plain={{
              what: "Each bar shows how statistically 'weird' a month was — how far above normal. Red bars are mathematically impossible without outside coordination.",
              why: "Random people do not all suddenly become very active online at the same time Israel launches an operation. Soldiers following orders do.",
              proves: "The activity spikes are not coincidence. They are coordinated.",
            }}
          >
            <AnomalyDetector data={data.monthly_spikes} />
          </ChartFrame>

          {/* H3 */}
          <CaseStep
            step="03"
            title="Someone sets the agenda"
            lede="What a community talks about — and when it stops talking about it — reveals who is steering. Track six narrative threads across the full archive and watch topics get switched on like floodlights."
          />
          <ChartFrame
            exhibit="EX-03"
            title="NARRATIVE TRACKING — KEYWORD FREQUENCY BY MONTH"
            subtitle="Stacked frequency of six topic clusters. Switch to % Share to see narrative dominance independent of raw volume."
            accent="var(--viz-violet)"
            commentary={{
              reads:
                "Monthly mention counts for Hezbollah, Iran, sectarian framing, Gaza/Palestine, peace messaging and identity talk — stacked to show the shape of the conversation.",
              means:
                "'Hezbollah' mentions explode to ~40x baseline during operations, then vanish. 'Peace' language surges in windows when softening Lebanese sentiment is strategically useful. Organic discourse drifts; managed discourse snaps between talking points.",
              puzzle:
                "H3: the agenda moves first, the 'community' follows. Combined with EX-01's timing evidence, the conversation looks scripted around an information-operations calendar.",
            }}
            plain={{
              what: "This shows what topics the subreddit talked about each month — you can see which narratives dominate and when they suddenly appear or vanish.",
              why: "Real communities drift between topics naturally. This one snaps to new talking points overnight — like someone is sending a memo. When Israel bombs Lebanon, the subreddit floods with anti-Hezbollah content. When they need soft power, 'peace' talk appears on command.",
              proves: "The conversation topics are centrally directed. Someone is choosing what this community talks about and when.",
            }}
          >
            <KeywordHeatmap data={data.keyword_trends} />
          </ChartFrame>

          {/* H4 + H5 side pair */}
          <CaseStep
            step="04"
            title="Who is actually in the room?"
            lede="A Lebanese-Israeli dialogue space should be roughly balanced. Self-reported flairs and per-actor output tell a different story: the room is Israeli-majority and a small cadre does most of the talking."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartFrame
              exhibit="EX-04"
              title="FLAIR COMPOSITION — WHO SPEAKS"
              subtitle="Share of monthly activity by self-reported identity flair."
              accent="var(--viz-blue)"
              commentary={{
                reads:
                  "Monthly percentage of activity from Israeli, Jewish/Diaspora, Lebanese and unflaired accounts.",
                means:
                  "Israeli-flaired users outnumber Lebanese roughly 3:1 across the entire archive — in a subreddit ostensibly built for Lebanese voices. The Lebanese share never reaches parity, even at peak 'dialogue' periods.",
                puzzle:
                  "H4: the audience is the cover story; the operators are the population. A dialogue space where one side is permanently outnumbered 3:1 is a stage, not a bridge.",
              }}
              plain={{
                what: "This shows who is actually posting — broken down by whether users label themselves Israeli, Lebanese, Jewish diaspora, or unlabeled.",
                why: "A 'Lebanese-Israeli dialogue' space should be roughly half Lebanese. This one is 75% Israeli. The Lebanese are the stage decoration, not the participants. You cannot have a dialogue when one side is talking to itself.",
                proves: "The community claiming to represent Lebanese voices is overwhelmingly Israeli. The 'bridge' is a one-way megaphone.",
              }}
            >
              <FlairComposition data={data.flair_monthly} />
            </ChartFrame>

            <ChartFrame
              exhibit="EX-05"
              title="TOP ACTORS — CONCENTRATION OF VOICE"
              subtitle="The 20 highest-volume accounts. Sort by posts vs comments to see role specialization."
              accent="var(--archive)"
              commentary={{
                reads:
                  "Ranked output of the most active accounts with their flair and post/comment split.",
                means:
                  "A handful of accounts generates a wildly disproportionate share of all content. Several show role separation — some seed posts, others flood comments — a hallmark of coordinated amplification cells rather than hobbyist users.",
                puzzle:
                  "H5: you don't need thousands of operators to simulate a community. You need twenty disciplined ones. These are them.",
              }}
              plain={{
                what: "This ranks the 20 most active accounts and shows how much of the total conversation they produce. Some only start topics, others only reply — like they have assigned roles.",
                why: "In a real community, thousands of people contribute small amounts. Here, a tiny group produces most of the content. Some only post, others only comment — that is not hobbyists. That is a team with job assignments.",
                proves: "A small coordinated cell is manufacturing the illusion of a large community. Twenty accounts doing shifts, not thousands of people having conversations.",
              }}
            >
              <TopActors data={data.top_authors} />
            </ChartFrame>
          </div>

          {/* event ledger */}
          <CaseStep
            step="05"
            title="The correlation ledger"
            lede="Every anomalous window from EX-02, matched to the real-world event that opened it. This is the case's chain of custody — each entry links a statistical spike to a documented operation."
          />
          <ChartFrame
            exhibit="EX-06"
            title="EVENT CORRELATION — SPIKE-TO-OPERATION LEDGER"
            subtitle="Thirteen documented real-world events mapped to the activity windows they triggered."
            accent="var(--threat)"
            classification="CORROBORATED"
            commentary={{
              reads:
                "A chronological ledger pairing each military or political event with the subreddit activity window that immediately followed it.",
              means:
                "Thirteen for thirteen. Every significant activity window has a corresponding kinetic or political trigger. The probability of that mapping arising from organic interest alone is negligible.",
              puzzle:
                "This ledger stitches EX-01 through EX-05 into a single chain: events trigger anomalous volume, produced by a concentrated Israeli-majority cadre, pushing a centrally-set narrative.",
            }}
            plain={{
              what: "This is a timeline matching every real-world military event to the exact moment the subreddit surged. Thirteen events, thirteen spikes — one-to-one.",
              why: "If this were a real community, some events would get attention and others would not. Instead, every single Israeli military operation triggered a response — like clockwork. That is not interest. That is activation.",
              proves: "The subreddit is a response mechanism for Israeli military operations. Thirteen out of thirteen is not coincidence — it is a standing order.",
            }}
          >
            <EventCorrelation events={data.event_timeline} />
          </ChartFrame>

          {/* smoking gun */}
          <CaseStep
            step="06"
            title="The smoking gun: the 2026 pivot"
            lede="The strongest evidence of central direction isn't what the community said — it's what it suddenly, perfectly, stopped saying."
          />
          <PixelReveal>
            <TracedCard
              traceColor="var(--threat)"
              className="p-6 md:p-8 border-l-2 border-l-threat"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="stamp text-threat">PRIORITY FINDING</span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-muted-2">
                  EX-07 / BEHAVIORAL
                </span>
              </div>
              <div className="space-y-4 text-sm text-muted leading-relaxed">
                <p>
                  In early 2026, Israel launched a second ground invasion of
                  Lebanon. For the first time, Hezbollah deployed fiber-optic
                  FPV kamikaze drones — unjammable, launched from 40km away.
                  Daily compilation videos of IDF losses went viral worldwide.
                </p>
                <p className="text-foreground font-medium">
                  Despite being the most-discussed military development on
                  Earth, not a single post about FPV drones appeared on
                  r/ForbiddenBromance.
                </p>
                <p>
                  Instead the subreddit pivoted overnight: anti-Hezbollah and
                  anti-Shia content — the dominant theme for over five years —
                  ceased entirely. Posts praising Shia communities appeared for
                  the first time in the archive.
                </p>
                <div className="mt-2 rounded-md border border-borderc bg-black/40 p-4 font-mono text-xs leading-relaxed">
                  <p className="text-primary tracking-[0.2em] mb-3">
                    BEHAVIORAL INDICATORS:
                  </p>
                  <div className="space-y-1.5 text-muted">
                    <p>▸ Topic blackout on globally-viral FPV drone footage</p>
                    <p>▸ Instantaneous cessation of 5+ years of anti-Shia rhetoric</p>
                    <p>▸ Emergence of unprecedented pro-Shia content</p>
                    <p>▸ Timing correlates precisely with IDF operational failures</p>
                  </div>
                  <p className="mt-4 text-threat">
                    ASSESSMENT: Narrative shift directed by operational command,
                    not organic sentiment change.
                  </p>
                </div>
                <p className="text-xs text-muted-2">
                  Full pivot analysis, sentiment drift and network forensics
                  continue on the{" "}
                  <a
                    href="/analysis"
                    className="text-primary hover:glow-primary transition-all"
                  >
                    Psy-Ops Analysis
                  </a>{" "}
                  page.
                </p>
              </div>
            </TracedCard>
          </PixelReveal>

          {/* bridge to Part II — the two operations are one machine */}
          <PixelReveal>
            <TracedCard
              traceColor="var(--accent-yellow)"
              className="p-6 md:p-8 border-l-2 border-l-accent-yellow"
            >
              <span className="stamp text-accent-yellow">CROSS-REFERENCE</span>
              <p className="mt-4 text-sm text-muted leading-relaxed max-w-3xl">
                The pivot only makes sense once you see what it was hiding. The
                same machine that manufactured this friendship also manufactured
                a <span className="text-foreground">moral alibi</span> for the
                war it was covering — the claim that Hezbollah are the terrorists
                and the IDF the most moral army on earth. Part II puts that claim
                on the evidence table.
              </p>
              <a
                href="/battlefield"
                className="group mt-5 inline-flex items-center gap-2 rounded-md border border-accent-yellow/40 bg-accent-yellow/5 px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-accent-yellow transition-all hover:bg-accent-yellow/10"
              >
                PART II — THE MOST MORAL ARMY
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </TracedCard>
          </PixelReveal>
        </div>
      </div>
    </PageShell>
  );
}
