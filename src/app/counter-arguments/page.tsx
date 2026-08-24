"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { AsciiEyeField } from "@/components/fx/AsciiEyeField";
import { PageIntro } from "@/components/PageIntro";
import { BrandedText } from "@/components/BrandedText";

interface Objection {
  id: string;
  claim: string;
  response: string;
  exhibits?: string[];
}

const objections: Objection[] = [
  {
    id: "terrorist-label",
    claim: "But Hezbollah IS a terrorist organization",
    response:
      "Terrorist is a jurisdiction-dependent legal and political label; it is not a substitute for incident analysis. In the 100 Hezbollah strike rows currently structured in Supabase, every target_is_civilian field is false and every row carries source text. That describes the loaded record—not the entire campaign, not civilian harm outside the sample, and not a legal ruling on the organization.",
    exhibits: ["EX-18", "EX-22", "EX-28"],
  },
  {
    id: "both-sides",
    claim: "Both sides committed war crimes",
    response:
      "The loaded records are strongly asymmetric on the axes this project measures, especially civilian harm and infrastructure destruction. But absence from a selected or incomplete table is not proof that an event never occurred. The defensible claim is narrower: compare like with like, publish the denominator and coverage, and do not use 'both sides' to erase a measured difference in scale or target class.",
    exhibits: ["EX-28"],
  },
  {
    id: "unreliable-figures",
    claim: "The casualty figures are from Hamas/Hezbollah and unreliable",
    response:
      "The investigation consults independent, Israeli, Lebanese and institutional records rather than accepting one belligerent's total wholesale. BBC Verify, Haaretz, official Israeli statements and humanitarian organizations serve different corroboration roles. Disagreement is retained as a range or contradiction; it is not averaged into fake certainty.",
    exhibits: ["EX-27b", "EX-30b"],
  },
  {
    id: "one-sided",
    claim: "This is one-sided / anti-Israel propaganda",
    response:
      "The author has a declared Lebanese standpoint. The safeguard is not a claim of neutrality; it is a visible method, stable comparison rules, source links, coverage bounds and correction paths. Some legacy rows still carry source text rather than a direct URL, and the source ledger says so. A strong conclusion must survive that disclosure.",
    exhibits: [],
  },
  {
    id: "self-defense",
    claim: "Hezbollah started it / Israel has a right to self-defense",
    response:
      "Self-defense does not suspend IHL. Even if the casus belli is granted entirely (it's contested), the CONDUCT of war is still governed by law. You can have a legitimate reason to fight and still commit war crimes. Self-defense is not a license to kill paramedics.",
    exhibits: ["EX-22", "EX-20"],
  },
  {
    id: "cherry-picking",
    claim: "You're cherry-picking data",
    response:
      "The current database is not the full population of the war. It contains 100 structured Hezbollah strike rows, 49 named IDF fatalities, 19 civilian-casualty records and separate aggregate tables; the 35-video gallery is a publisher-derived campaign archive. Selection bias is therefore a live risk. The remedy is to publish inclusion rules, missing periods and the update queue—not to call an incomplete corpus complete.",
    exhibits: [],
  },
  {
    id: "reddit-irrelevant",
    claim: "Reddit manipulation proves nothing about the war itself",
    response:
      "Part I and Part II are parallel investigations, not dependent ones. Part I documents a multi-signal coordination case. Part II assembles the physical and institutional record. Neither requires the other; together they test whether narrative management tracks the conduct it reframes.",
    exhibits: [],
  },
];

function ObjectionCard({ objection, index }: { objection: Objection; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="border border-white/10 rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <span className="text-[10px] font-mono text-gray-600 mt-1 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-rose-400 font-bold text-sm md:text-base leading-snug">
            &ldquo;{objection.claim}&rdquo;
          </span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500 shrink-0 text-lg"
        >
          &#9662;
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 border-t border-white/5">
              <p className="text-gray-300 text-sm leading-relaxed">
                {objection.response}
              </p>
              {objection.exhibits && objection.exhibits.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {objection.exhibits.map((ex) => (
                    <Link
                      key={ex}
                      href="/battlefield"
                      className="text-xs font-mono text-cyan-400 border border-cyan-400/30 rounded px-2 py-0.5 hover:bg-cyan-400/10 transition-colors"
                    >
                      {ex}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CounterArgumentsPage() {
  return (
    <PageShell backdrop="none">
      <AsciiEyeField seed={29} />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16">
        <PageIntro
          marker="COUNTER-ANALYSIS // ADVERSARIAL REVIEW"
          title="OBJECTIONS"
          systemLine="STEEL-MAN THE CLAIM · TEST THE RECORD"
          accent="var(--threat)"
          description="The strongest counter-arguments are stated in good faith, then tested against the same evidence contract used everywhere else in the investigation."
          className="mb-5"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 text-sm text-gray-400 leading-relaxed max-w-3xl mx-auto text-center"
        >
          <p>
            Good-faith objections deserve good-faith answers. Below are the strongest
            versions of the most common criticisms this investigation receives &mdash;
            stated as forcefully as their proponents would state them &mdash; followed by
            what the documented evidence actually shows.
          </p>
        </motion.div>

        <div className="space-y-4">
          {objections.map((objection, i) => (
            <ObjectionCard key={objection.id} objection={objection} index={i} />
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 border border-white/10 rounded-lg bg-black/40 backdrop-blur-sm p-6 md:p-8"
        >
          <h2 aria-label="A Note on Bias" className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">
            <BrandedText text="A Note on Bias" />
          </h2>
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed italic">
            <p>
              I am Lebanese. I watched this war happen to my country. I have biases &mdash; every
              human does. This is precisely why I chose data over narrative, methodology over
              opinion and cross-referenced sources over single claims. Not every legacy row has the
              same provenance depth, so the source ledger publishes what is loaded, what is derived,
              and what remains incomplete.
            </p>
            <p>
              My bias is towards my people &mdash; I acknowledge that openly. But bias in
              motivation does not invalidate methodology. The data either holds up to scrutiny or
              it doesn&rsquo;t. I invite anyone to check my sources, replicate my analysis, and
              publish corrections.
            </p>
            <p>
              This investigation is my attempt to be rigorous despite caring deeply. I&rsquo;d
              rather be honestly biased and methodologically sound than pretend a neutrality that
              doesn&rsquo;t exist.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12 neo-inset p-6 rounded-lg"
        >
          <h2 aria-label="Analytical Standard" className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
            <BrandedText text="Analytical Standard" />
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            The standard is falsifiability: retrieval dates, source URLs, methodology notes and
            coverage bounds should accompany each dataset, and missing fields remain visible until
            repaired. The same rubric should evaluate each armed actor. Where current evidence cannot
            support that symmetry, the limitation belongs beside the chart—not in a footnote hidden
            from the reader.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/battlefield"
            aria-label="VIEW THE DATA"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] px-5 py-2.5 rounded-md border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            <BrandedText text="VIEW THE DATA" />
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/about"
            aria-label="METHODOLOGY"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] px-5 py-2.5 rounded-md border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
          >
            <BrandedText text="METHODOLOGY" />
          </Link>
        </motion.div>

        <footer className="mt-16 text-center">
          <p className="text-[10px] text-gray-600 font-mono">
            ZIOPSYOP.me &mdash; Counter-Intelligence Sentiment Analysis Platform
          </p>
        </footer>
      </div>
    </PageShell>
  );
}
