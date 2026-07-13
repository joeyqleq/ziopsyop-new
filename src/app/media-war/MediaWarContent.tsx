"use client";

import { motion } from "framer-motion";
import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { DecryptText } from "@/components/fx/DecryptText";
import { TracedCard } from "@/components/fx/TracedCard";
import { MediaNarrativeTimeline } from "@/components/viz/MediaNarrativeTimeline";

const CLAIMS = [
  {
    claim: "Hezbollah initiated the war",
    verdict: "DISPUTED",
    verdictColor: "text-archive",
    detail:
      "Channel 14 framed Hezbollah as the aggressor. Documentary evidence shows Israeli escalation preceded the October 8 solidarity strikes. The timeline tells a different story.",
  },
  {
    claim: "IDF targets only militants",
    verdict: "REFUTED",
    verdictColor: "text-threat",
    detail:
      "10,000+ civilian structures demolished. Amnesty International, HRW, and OCHA all documented systematic targeting of civilian infrastructure across southern Lebanon.",
  },
  {
    claim: "Ceasefire was observed",
    verdict: "REFUTED",
    verdictColor: "text-threat",
    detail:
      "IDF unilaterally extended its presence past the January 2025 deadline, then again past the extended deadline. Continued strikes documented throughout the 'ceasefire' period into 2026.",
  },
];

export function MediaWarContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-[10px] tracking-[0.5em] text-threat mb-4">
            PART III
          </p>
          <CinematicTitle
            text="THE MEDIA BATTLEFIELD"
            as="h1"
            className="text-3xl md:text-5xl font-bold tracking-[0.06em]"
            animateOnMount
          />
          <div className="mt-4">
            <DecryptText
              text="WHO LIED, WHEN, AND HOW"
              className="font-mono text-sm md:text-base tracking-[0.3em] text-muted"
              delay={600}
            />
          </div>
        </motion.div>
      </section>

      {/* Thesis Card */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 mt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TracedCard traceColor="var(--threat)" className="p-6 md:p-8">
            <p className="font-mono text-[9px] tracking-[0.4em] text-threat mb-3">
              THESIS
            </p>
            <p className="text-sm md:text-base text-foreground leading-relaxed">
              Israel&apos;s propaganda machine doesn&apos;t just aim outward. Channel 14 is
              the number one TV station in Israel. Whatever the government tells
              it to say, it says. Al-Manar documents the reality on the ground.
              Al-Mayadeen provides the regional context.
            </p>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              This is the forensic record — three media channels, parsed
              message by message, compared day by day. When Channel 14 said
              &quot;surgical strike,&quot; what did the other side document? When Al-Manar
              reported casualties, did Channel 14 even acknowledge the event?
            </p>
            <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-threat">
              THE RECORD SPEAKS. THE CONTRADICTIONS ARE THE EVIDENCE.
            </p>
          </TracedCard>
        </motion.div>
      </section>

      {/* Narrative Timeline */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-[10px] tracking-[0.4em] text-muted-2 mb-3">
            // EX-MW-01 — DAY-BY-DAY NARRATIVE COMPARISON
          </p>
          <MediaNarrativeTimeline />
        </motion.div>
      </section>

      {/* Stats Row */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { value: "17,451", label: "AL-MANAR MESSAGES", color: "text-primary", traceColor: "lime" },
            { value: "9,079", label: "AL-MAYADEEN MESSAGES", color: "text-purple-400", traceColor: "purple" },
            { value: "5,015", label: "CHANNEL 14 MESSAGES", color: "text-threat", traceColor: "var(--threat)" },
          ].map((stat) => (
            <TracedCard
              key={stat.label}
              traceColor={stat.traceColor}
              className="p-4 text-center"
            >
              <p className={`font-mono text-xl md:text-2xl font-bold ${stat.color} tabular-nums`}>
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[8px] tracking-[0.2em] text-muted-2">
                {stat.label}
              </p>
            </TracedCard>
          ))}
        </motion.div>
      </section>

      {/* Key Claims */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 mt-14">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-[10px] tracking-[0.4em] text-muted-2 mb-6">
            KEY CLAIMS UNDER FORENSIC EXAMINATION
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {CLAIMS.map((item, i) => (
            <motion.div
              key={item.claim}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TracedCard
                traceColor={
                  item.verdictColor === "text-threat"
                    ? "var(--threat)"
                    : "var(--archive)"
                }
                className="p-5 h-full flex flex-col"
              >
                <p className="font-mono text-[9px] tracking-[0.3em] text-muted-2">
                  CLAIM
                </p>
                <p className="mt-2 font-mono text-xs font-bold text-foreground leading-snug">
                  &ldquo;{item.claim}&rdquo;
                </p>
                <p
                  className={`mt-3 font-mono text-[10px] tracking-[0.3em] font-bold ${item.verdictColor}`}
                >
                  {item.verdict}
                </p>
                <p className="mt-3 text-xs text-muted leading-relaxed flex-1">
                  {item.detail}
                </p>
              </TracedCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 mt-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <div className="h-px w-24 mx-auto bg-borderc mb-6" />
          <p className="font-mono text-[9px] tracking-[0.3em] text-muted-2">
            DATA SOURCE
          </p>
          <p className="mt-2 text-xs text-muted leading-relaxed max-w-lg mx-auto">
            Telegram channel exports: ManarTV-EN (Al-Manar, Hezbollah media
            arm), Al Mayadeen English (pro-resistance), Channel 14 English
            Edition (Israeli state media). All messages parsed, filtered for
            Lebanon-Israel axis relevance, and auto-categorized.
          </p>
          <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-muted-2">
            EVERY CLAIM IS VERIFIABLE. EVERY CONTRADICTION IS DOCUMENTED.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
