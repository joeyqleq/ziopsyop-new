"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ContactModal } from "@/components/ContactModal";
import { PageShell } from "@/components/PageShell";
import { PageIntro } from "@/components/PageIntro";
import { BrandedText } from "@/components/BrandedText";

export default function AboutPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <PageShell backdrop="none">
      <AuroraBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16">
        <PageIntro
          marker="ABOUT // INDEPENDENT LEBANESE RESEARCH"
          title="WHY THIS PROJECT EXISTS"
          systemLine="ONE RESEARCHER · NO SPONSORS · OPEN METHODS"
          align="left"
          accent="var(--archive)"
          description="ZIOPSYOP is a personal attempt to measure the propaganda systems wrapped around Israel's wars on Lebanon—and to keep the underlying evidence visible, testable, and open to correction."
        />
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel-strong p-8 md:p-12 space-y-8"
        >
          <section className="space-y-4 text-sm md:text-base text-gray-300 leading-relaxed">
            <p>
              This project began with a simple observation: on r/ForbiddenBromance, a subreddit
              presenting itself as a neutral space for Lebanese–Israeli dialogue, something felt
              systematically off. Not one user, not one thread — a <em>pattern</em>. The same
              rhetorical structure. The same buzzwords deployed at the same emotional register. The
              same pivot from &ldquo;I just want peace&rdquo; to &ldquo;but Hezbollah are terrorists
              and their supporters deserve no platform&rdquo; the moment any Lebanese user offered
              structural criticism of Israeli military conduct.
            </p>

            <p>
              The phenomenon has a name: <strong className="text-cyan-400">Hasbara</strong>{" "}
              (הסברה) — Hebrew for &ldquo;explanation&rdquo; or &ldquo;public diplomacy,&rdquo; but
              in practice, a decades-old, state-adjacent infrastructure of coordinated narrative
              management. What began as government press offices and university campus groups now
              includes volunteer operations rooms, platform campaigns and state-adjacent advocacy.
              The corpus contains a widely repeated &ldquo;120 war rooms&rdquo; claim and references to
              Reddit; this site treats those as source leads, not as proof that any specific account
              was directed by a state. The measurable question is where organic persuasion ends and
              coordinated behavior begins.
            </p>

            <p>
              This is not a project about hating Israelis. Many Israeli voices in this dataset are
              thoughtful, honest, and deeply critical of their own government. This is a project
              about <strong className="text-white">measuring a system</strong> — the same rigor
              applied to any other information operation, whether Russian, American, or Chinese. The
              existence of organized advocacy is documented; the harder question is whether its
              effects are <strong className="text-white">measurable at the individual user level</strong>,
              and whether those effects <strong className="text-white">worked</strong>. Behavioral
              anomalies can support that inquiry. They cannot identify an employer by themselves.
            </p>

            <p>
              A secondary, equally important layer is the longer record: the 15-year occupation,
              repeated incursions, the Litani River, offshore boundaries, and the destruction of
              south Lebanese villages. That history makes annexation and resource-motive hypotheses
              legitimate questions. It does not make geography, benefit, or political rhetoric proof
              of operational intent. ZIOPSYOP therefore keeps those hypotheses visible while requiring
              a dated primary record before promoting any one of them to a finding.
            </p>

            <p>
              One last note:{" "}
              <strong className="text-amber-400">Lebanon&rsquo;s anti-normalization regime can expose
              citizens to legal risk.</strong> This is not legal advice and the application depends on
              the facts, but the asymmetry between who can speak freely and who may face consequences
              matters when interpreting participation in r/ForbiddenBromance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 aria-label="What This Dashboard Answers" className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <BrandedText text="What This Dashboard Answers" />
            </h2>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">01</span>
                <span>
                  <strong className="text-white">Does the media cover it?</strong> When Israel kills
                  Lebanese paramedics in a documented double-tap, does any Israeli outlet (Hebrew or
                  English) report it? If so, how?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">02</span>
                <span>
                  <strong className="text-white">Is there a Hebrew–English divergence?</strong> Are
                  Israeli readers being told materially different stories than the international
                  audience Israel courts?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">03</span>
                <span>
                  <strong className="text-white">Does downvoting work as a weapon?</strong> Can we
                  show that Lebanese users who received sustained anomalous downvoting shifted their
                  rhetoric, reduced posting, or stopped engaging entirely?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">04</span>
                <span>
                  <strong className="text-white">Who are the anomalous users?</strong> Which
                  accounts show the behavioral/linguistic fingerprint of coordinated operation
                  participation vs. genuine organic users?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">05</span>
                <span>
                  <strong className="text-white">Is the Shia pivot real and timed?</strong> Can we
                  pinpoint when and by whom the narrative shifted from &ldquo;Hezbollah=all
                  Lebanon&rdquo; to &ldquo;we love Christians, Shia are victims&rdquo; — and does it
                  correlate with IDF strategic announcements?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">06</span>
                <span>
                  <strong className="text-white">What does the attack data actually show?</strong>{" "}
                  When weighted by target type and IHL standards, what percentage of IDF strikes
                  carry protected-person or protected-site indicators versus military-target
                  indicators? This is a reproducible classification layer, not a judicial finding.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">07</span>
                <span>
                  <strong className="text-white">Where did it happen?</strong> Geolocated map of
                  every documented attack in Lebanon since 2024.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 shrink-0">08</span>
                <span>
                  <strong className="text-white">What would test the Litani hypothesis?</strong> A
                  future position-by-date layer must compare verified ground locations with declared
                  objectives, withdrawals and the river line. Until that evidence contract is loaded,
                  territorial intent remains a research question.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 aria-label="Who Is Behind This" className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <BrandedText text="Who Is Behind This" />
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              One person. A freelancer. I don&rsquo;t represent any organization, political party,
              NGO, or state actor. No funding, no editorial board, no handlers. This is my personal
              resistance — a decision to apply the tools I have (data analysis, AI, forensic
              methodology) to document what I see happening to my country.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              I watched over two hours of published drone footage, cross-referenced independent source
              families, and used AI-assisted workflows to process seven years of Reddit activity. I
              built this site alone, in my own time, because the information exists and nobody was
              assembling it in one place.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              If you want to contribute data, report an error, or collaborate — reach out.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => setContactOpen(true)}
                className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] px-4 py-2.5 rounded-md border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1 4.5L8 9.5L15 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                CONTACT
              </button>
              <Link
                href="/counter-arguments"
                className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] px-4 py-2.5 rounded-md border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                OBJECTIONS &amp; BIAS
              </Link>
              <Link
                href="/synthesis"
                className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] px-4 py-2.5 rounded-md border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                THE LOOP CLOSES
              </Link>
            </div>
          </section>

          <section className="neo-inset p-6 space-y-3">
            <h2 aria-label="Methodology Note" className="text-xs font-mono text-rose-400 uppercase tracking-widest">
              <BrandedText text="Methodology Note" />
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              All data sourced from publicly available archives: Reddit via Arctic Shift API, UNIFIL
              press releases, Lebanese Army communiqués, Human Rights Watch, Amnesty International,
              and public media outlets. No private data, no hacked materials, no speculation
              presented as fact. Where evidence is circumstantial, it is labeled as such. Where
              patterns are suggestive but unproven, the framework flags them for further
              investigation rather than asserting conclusions.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Analysis covers r/ForbiddenBromance activity from September 2019 through June 2026.
              The current structured military tables are densest from November 2024 through June
              2025. The loaded media index spans August 2023 through July 2026 across three publisher
              streams. Exact table counts, coverage bounds and queued streams are published in the{" "}
              <Link href="/sources" className="text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 hover:text-cyan-200">
                source ledger
              </Link>.
            </p>
          </section>

        </motion.article>
      </div>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </PageShell>
  );
}
