"use client";

import { PageShell } from "@/components/PageShell";
import { motion } from "framer-motion";
import Link from "next/link";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function SynthesisPage() {
  return (
    <PageShell backdrop="warp">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-28 pb-20 space-y-20">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            THE LOOP CLOSES
          </h1>
          <p className="font-mono text-xs md:text-sm text-gray-400 tracking-[0.15em] uppercase">
            Part I proved a narrative was manufactured. Part II proved what it was built to bury.
          </p>
          <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </motion.header>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
            01 — The Information Operation
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Part I documented a state-adjacent influence campaign operating on Reddit. 120 physical
            war rooms were established across Israel during the 2023-2026 conflict cycle, explicitly
            tasked with social media manipulation. On r/ForbiddenBromance, we measured coordinated
            downvoting patterns, narrative convergence across ostensibly independent accounts, and
            behavioral fingerprints consistent with organized — not organic — activity. Lebanese
            voices were systematically suppressed through vote manipulation until they self-censored
            or left.
          </p>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="font-mono text-xs text-threat uppercase tracking-[0.2em]">
            02 — What It Hides
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Part II assembled the documented record the operation was built to suppress: over 3,500
            civilians killed, 10,000+ structures systematically bulldozed, double-tap strikes on
            paramedics, a military censor suppressing 15 articles per day from domestic publication,
            and a 7x gap between Israel&rsquo;s claimed enemy combatant kills and independently
            verified figures. The &ldquo;most moral army&rdquo; claim does not survive contact with
            its own documented conduct.
          </p>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
            03 — The Connection
          </h2>
          <div className="border-l-2 border-primary/40 pl-6 space-y-4">
            <p className="text-gray-300 leading-relaxed">
              The information operation exists <em>because</em> the data is catastrophic. If the
              documented record of civilian targeting, systematic destruction, and institutional
              lying ever entered mainstream international discourse intact, the narrative of a
              &ldquo;surgical, moral military&rdquo; collapses irreversibly.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The Reddit manipulation is not a separate phenomenon from the war crimes. It is their
              informational component — the same campaign, different domain. One destroys villages;
              the other destroys the discourse that would make that destruction politically
              untenable. They are a single system.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          <h2 className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
            04 — The Evidence Chain
          </h2>
          <ol className="space-y-4">
            {[
              {
                label: "IDF commits documented war crimes",
                ref: "Part II, EX-19 through EX-32",
              },
              {
                label: "Military censor suppresses 15 articles/day domestically",
                ref: "EX-30b",
              },
              {
                label: "International audience targeted via coordinated social media operation",
                ref: "Part I, network analysis",
              },
              {
                label: "Organic Lebanese voices silenced via mass downvoting",
                ref: "Part I, behavioral analysis",
              },
              {
                label: "Net effect: reality replaced with manufactured narrative",
                ref: "Synthesis",
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="font-mono text-lg text-primary shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-foreground font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">[{item.ref}]</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="font-mono text-xs text-gray-400 uppercase tracking-[0.2em]">
            05 — Navigate
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/part-i"
              className="group block border border-primary/20 rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <p className="font-mono text-xs text-primary tracking-wider mb-2">PART I</p>
              <p className="text-foreground font-semibold text-lg mb-2">
                The Information Operation
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                NLP forensics, network analysis, and behavioral fingerprinting proving coordinated
                narrative manufacturing on r/ForbiddenBromance.
              </p>
              <span className="inline-block mt-3 text-xs text-primary font-mono group-hover:translate-x-1 transition-transform">
                ENTER →
              </span>
            </Link>
            <Link
              href="/battlefield"
              className="group block border border-threat/20 rounded-lg p-6 hover:border-threat/50 hover:bg-threat/5 transition-all"
            >
              <p className="font-mono text-xs text-threat tracking-wider mb-2">PART II</p>
              <p className="text-foreground font-semibold text-lg mb-2">
                The Most Moral Army
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Documented civilian toll, double-tap patterns, systematic lying about casualties,
                infrastructure destruction, and military censorship.
              </p>
              <span className="inline-block mt-3 text-xs text-threat font-mono group-hover:translate-x-1 transition-transform">
                ENTER →
              </span>
            </Link>
          </div>
        </motion.section>
      </div>
    </PageShell>
  );
}
