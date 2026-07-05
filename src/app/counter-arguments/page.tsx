"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

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
      "Terrorist is a legal/political label. This investigation tests conduct, not labels. By every IHL metric measured: zero civilian targets, zero hospitals, zero ambulances. The data shows disciplined military targeting of exclusively military assets. Compare to the other side's documented record on the same metrics.",
    exhibits: ["EX-18", "EX-22", "EX-28"],
  },
  {
    id: "both-sides",
    claim: "Both sides committed war crimes",
    response:
      "The data doesn't support symmetry. One side: 0 civilian targets, 0 hospitals, 0 ambulances destroyed. The other: 3,500 civilians killed, 27 ambulance stations destroyed, 160 paramedics killed, 10,000 structures bulldozed after ceasefire. \"Both sides\" requires comparable numbers on comparable axes. The numbers aren't comparable.",
    exhibits: ["EX-28"],
  },
  {
    id: "unreliable-figures",
    claim: "The casualty figures are from Hamas/Hezbollah and unreliable",
    response:
      "This investigation uses BBC Verify (independent British journalism), Haaretz (Israeli newspaper), and admissions from the Israeli army chief himself. It documents 5,700 items censored per year by Israel's own military censor. The investigation cross-references 5+ independent sources including Israeli domestic ones.",
    exhibits: ["EX-27b", "EX-30b"],
  },
  {
    id: "one-sided",
    claim: "This is one-sided / anti-Israel propaganda",
    response:
      "The methodology is documented. Every data point is sourced. The same analytical framework applied to any armed actor would produce the same verdict given the same inputs. If the IDF's targeting record showed 0 civilian casualties, the charts would show that. They don't — because the data doesn't.",
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
      "The investigation uses the FULL population of documented strikes, casualties, and infrastructure damage — not samples. All 665 confirmed Hezbollah strikes. All 3,500+ Lebanese casualties. All confirmed IDF equipment losses. Cherry-picking requires selecting favorable subsets. This uses the complete record.",
    exhibits: [],
  },
  {
    id: "reddit-irrelevant",
    claim: "Reddit manipulation proves nothing about the war itself",
    response:
      "Part I and Part II are parallel investigations, not dependent ones. Part I proves the information operation exists. Part II proves what the physical record shows. Neither requires the other. But together they reveal a system: commit, censor, then manufacture consent for what you censored.",
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
    <PageShell backdrop="waves">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold glow-text mb-3">
            ANTICIPATED OBJECTIONS
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Steel-man the counter-arguments. Then test them against the data.
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
        </motion.header>

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
          <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">
            A Note on Bias
          </h2>
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed italic">
            <p>
              I am Lebanese. I watched this war happen to my country. I have biases &mdash; every
              human does. This is precisely why I chose data over narrative, methodology over
              opinion, cross-referenced sources over single claims. Every number on this site is
              independently verifiable. Every source is cited. Every analytical framework is
              documented and reproducible.
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
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
            Analytical Standard
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Every claim on this site is falsifiable. Every dataset is cited with retrieval
            date, source URL, and methodology notes. The framework is designed to be applied
            symmetrically &mdash; the same scoring rubric that evaluates IDF conduct evaluates
            Hezbollah conduct. Where the data favors one side, the charts show it. Where it
            does not, they show that too. Reproducibility is the standard, not persuasion.
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
            className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] px-5 py-2.5 rounded-md border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            VIEW THE DATA
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
            className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] px-5 py-2.5 rounded-md border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
          >
            METHODOLOGY
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
