"use client";

import { motion } from "framer-motion";
import { TracedCard } from "@/components/fx/TracedCard";
import { MediaNarrativeTimeline } from "@/components/viz/MediaNarrativeTimeline";
import { TerrorDensityGauge } from "@/components/viz/TerrorDensityGauge";
import { SilenceMap } from "@/components/viz/SilenceMap";
import { ContradictionRegistry } from "@/components/viz/ContradictionRegistry";
import { PageIntro } from "@/components/PageIntro";
import Link from "next/link";

const CLAIMS = [
  {
    claim: "Hezbollah initiated the war",
    verdict: "DISPUTED",
    verdictColor: "text-archive",
    detail:
      "The answer changes with the selected baseline: October 8 cross-border strikes, the October 7 regional war, or the longer occupation and strike history. The publisher corpus measures how initiation was framed; it does not by itself adjudicate the legal question.",
    sourceLabel: "TEST THE TIMELINE",
    href: "/synthesis",
  },
  {
    claim: "IDF targets only militants",
    verdict: "REFUTED",
    verdictColor: "text-threat",
    detail:
      "Amnesty's evidence work documents extensive destruction of civilian structures in southern Lebanon, including destruction after the ceasefire. That record refutes the literal claim that only militants were hit; it does not make every individual strike unlawful without incident-level review.",
    sourceLabel: "SOURCE LEDGER",
    href: "/sources",
  },
  {
    claim: "Ceasefire was observed",
    verdict: "REFUTED",
    verdictColor: "text-threat",
    detail:
      "Post-ceasefire positions, strikes and deadline extensions are documented across official and independent records. The exhibit tests each dated incident rather than treating the word 'ceasefire' as proof that fire stopped.",
    sourceLabel: "SOURCE LEDGER",
    href: "/sources",
  },
];

export function MediaWarContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-20">
        <PageIntro
          marker="PART III // COMPETING MEDIA SYSTEMS"
          title="THE MEDIA BATTLEFIELD"
          systemLine="WHO PUBLISHED · WHO OMITTED · WHO REFRAMED"
          accent="var(--threat)"
          description="A day-level comparison of rival publication systems around the same conflict record—built to distinguish measured output, documented omissions, and interpretation."
        />
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
              Channel 14 is an influential right-wing Israeli broadcaster whose
              coverage frequently tracks official security narratives. Al-Manar is
              affiliated with Hezbollah; Al Mayadeen is a regional outlet aligned
              with the resistance axis. None is treated here as a neutral truth machine.
            </p>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              Their 46,555 indexed publications are treated as primary material:
              parsed message by message, compared at day grain, and checked against
              the separately sourced incident record. The question is not which feed
              to believe wholesale, but what each one amplified, reframed, or omitted.
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
            {"// EX-MW-01 — DAY-BY-DAY NARRATIVE COMPARISON"}
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
            { value: "27,104", label: "AL-MANAR MESSAGES", color: "text-primary", traceColor: "lime" },
            { value: "13,287", label: "AL-MAYADEEN MESSAGES", color: "text-purple-400", traceColor: "purple" },
            { value: "6,164", label: "CHANNEL 14 MESSAGES", color: "text-threat", traceColor: "var(--threat)" },
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

      {/* Terror Density Gauge */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 mt-10">
        <TerrorDensityGauge />
      </section>

      {/* Silence Map */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 mt-6">
        <SilenceMap />
      </section>

      {/* Contradiction Registry */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 mt-6">
        <ContradictionRegistry />
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
                <Link
                  href={item.href}
                  className="mt-4 font-mono text-[8px] tracking-[0.16em] text-cyan-300 transition-colors hover:text-cyan-100"
                >
                  [{item.sourceLabel} →]
                </Link>
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
            Publisher-feed exports: ManarTV-EN (Al-Manar, Hezbollah-affiliated),
            Al Mayadeen English (resistance-axis aligned), and Channel 14 English
            Edition (right-wing Israeli broadcaster). Publications are parsed,
            filtered for Lebanon-Israel relevance, and categorized; feed silence
            is preserved as missing observation unless a separately verified omission
            test supports a stronger claim.
          </p>
          <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-muted-2">
            EVERY CLAIM SHOULD BE TRACEABLE. EVERY GAP STAYS VISIBLE.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
