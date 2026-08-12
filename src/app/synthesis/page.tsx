"use client";

import { PageShell } from "@/components/PageShell";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { BrandedText } from "@/components/BrandedText";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function SynthesisPage() {
  return (
    <PageShell backdrop="warp">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-28 pb-20 space-y-20">
        <PageIntro
          marker="SYNTHESIS // THREE FRONTS, ONE EVIDENCE CHAIN"
          title="THE LOOP CLOSES"
          systemLine="NETWORK → BATTLEFIELD → MEDIA SYSTEM"
          description="Part I identifies the influence network. Part II tests the moral frame against battlefield conduct. Part III follows the same conflict through competing media systems."
        />

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 aria-label="01 — The Information Operation" className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
            <BrandedText text="01 — The Information Operation" />
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Part I measures an influence environment rather than assigning secret employers. Public
            reporting and the research corpus contain organized-advocacy and &ldquo;120 war rooms&rdquo;
            leads; the Reddit record contributes vote anomalies, synchronized activity, narrative
            convergence and behavioral fingerprints consistent with coordination. Those signals can
            support a coordination hypothesis. They do not identify state direction on their own.
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
          <h2 aria-label="02 — What It Hides" className="font-mono text-xs text-threat uppercase tracking-[0.2em]">
            <BrandedText text="02 — What It Hides" />
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Part II assembles the conflict record behind the rhetoric: civilian-casualty incidents,
            protected-site indicators, double-tap patterns, extensive destruction documented by
            Amnesty&rsquo;s evidence work, censorship records and disputed casualty totals. It tests
            Israel&rsquo;s &ldquo;most moral army&rdquo; claim against traceable observations while keeping
            legal findings, estimates and source allegations in separate lanes.
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
          <h2 aria-label="03 — The Media Battlefield" className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
            <BrandedText text="03 — The Media Battlefield" />
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Part III places 46,555 indexed media events from Al-Manar, Al Mayadeen, and Channel 14
            beside the Reddit record. It asks which events were amplified, reframed, or omitted,
            while preserving missing observations as gaps rather than synthetic zeroes. This is the
            transmission layer between battlefield events and the public story built around them.
          </p>
          <Link
            href="/media-war"
            className="inline-flex font-mono text-xs tracking-[0.15em] text-primary hover:text-foreground transition-colors"
          >
            ENTER THE MEDIA BATTLEFIELD →
          </Link>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fade}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 aria-label="04 — The Connection" className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
            <BrandedText text="04 — The Connection" />
          </h2>
          <div className="border-l-2 border-primary/40 pl-6 space-y-4">
            <p className="text-gray-300 leading-relaxed">
              The cross-domain hypothesis is straightforward: sanitizing or fragmenting the
              battlefield record benefits a narrative of surgical, moral force. The site can test
              whether media framing and platform behavior react to the same dated events; it cannot
              infer one command structure from political alignment alone.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The Reddit record, battlefield record and publisher record are therefore compared as
              three fronts of one investigation—not declared to be one proven machine. Convergence,
              lag and omission are measurable. Intent and direction require additional primary
              evidence.
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
          <h2 aria-label="05 — The Evidence Chain" className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
            <BrandedText text="05 — The Evidence Chain" />
          </h2>
          <ol className="space-y-4">
            {[
              {
                label: "Documented conduct is tested against IHL and alleged war-crime patterns",
                ref: "Part II, EX-19 through EX-32",
              },
              {
                label: "Military censor suppresses 15 articles/day domestically",
                ref: "EX-30b",
              },
              {
                label: "Social-platform behavior tested for coordination and narrative convergence",
                ref: "Part I, network analysis",
              },
              {
                label: "Competing media systems amplify, reframe, and omit the same events",
                ref: "Part III, media battlefield",
              },
              {
                label: "Lebanese participation changes compared with anomalous voting windows",
                ref: "Part I, behavioral analysis",
              },
              {
                label: "Synthesis tests whether the three records move together—and where they do not",
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
          <h2 aria-label="06 — Navigate" className="font-mono text-xs text-gray-400 uppercase tracking-[0.2em]">
            <BrandedText text="06 — Navigate" />
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/part-i"
              className="group block border border-primary/20 rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <p className="font-mono text-xs text-primary tracking-wider mb-2">PART I</p>
              <p aria-label="The Information Operation" className="text-foreground font-semibold text-lg mb-2">
                <BrandedText text="The Information Operation" />
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                NLP forensics, network analysis and behavioral fingerprinting testing coordinated
                narrative behavior on r/ForbiddenBromance.
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
              <p aria-label="The Most Moral Army" className="text-foreground font-semibold text-lg mb-2">
                <BrandedText text="The Most Moral Army" />
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Documented civilian toll, double-tap patterns, systematic lying about casualties,
                infrastructure destruction, and military censorship.
              </p>
              <span className="inline-block mt-3 text-xs text-threat font-mono group-hover:translate-x-1 transition-transform">
                ENTER →
              </span>
            </Link>
            <Link
              href="/media-war"
              className="group block border border-archive/20 rounded-lg p-6 hover:border-archive/50 hover:bg-archive/5 transition-all"
            >
              <p className="font-mono text-xs text-archive tracking-wider mb-2">PART III</p>
              <p aria-label="The Manufactured Reality" className="text-foreground font-semibold text-lg mb-2">
                <BrandedText text="The Manufactured Reality" />
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                A day-level comparison of what rival media systems publish, suppress, and repeat
                around the same conflict record.
              </p>
              <span className="inline-block mt-3 text-xs text-archive font-mono group-hover:translate-x-1 transition-transform">
                ENTER →
              </span>
            </Link>
          </div>
        </motion.section>
      </div>
    </PageShell>
  );
}
