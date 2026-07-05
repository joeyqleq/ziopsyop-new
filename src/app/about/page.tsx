"use client";

import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Navigation } from "@/components/Navigation";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-16">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel-strong p-8 md:p-12 space-y-8"
        >
          <header>
            <h1 className="text-3xl md:text-4xl font-bold glow-text mb-2">About This Project</h1>
            <div className="h-px bg-gradient-to-r from-cyan-400/50 via-violet-500/50 to-transparent" />
          </header>

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
              management. What began as government press offices and university campus groups has
              metastasized in the social media era into something ambient — a{" "}
              <em>consciousness</em>, a shared rhetorical operating system so widely internalized
              that it is now nearly impossible to tell where the organic ends and the organized
              begins. Israel documented running 120 in-person &ldquo;war room&rdquo; operations
              rooms across the country during the 2023–2026 conflict cycle, specifically tasked with
              social media influence. Reddit was explicitly named.
            </p>

            <p>
              This is not a project about hating Israelis. Many Israeli voices in this dataset are
              thoughtful, honest, and deeply critical of their own government. This is a project
              about <strong className="text-white">measuring a system</strong> — the same rigor
              applied to any other information operation, whether Russian, American, or Chinese. The
              question is not whether it exists (it does, it is documented), but whether its effects
              are <strong className="text-white">measurable at the individual user level</strong>,
              and whether those effects <strong className="text-white">worked</strong>.
            </p>

            <p>
              A secondary, equally important layer: <strong className="text-white">the Beirut port
              explosion</strong>, the 15-year occupation, the 24 ground invasions, the Litani River,
              the systematic destruction of south Lebanese villages — these are not disconnected
              episodes. They form a documented, longitudinal pattern that only makes sense in the
              context of <strong className="text-rose-400">the Greater Israel project</strong>, a
              concept openly discussed by sitting Israeli ministers. The data does not argue. It
              accumulates.
            </p>

            <p>
              One last note:{" "}
              <strong className="text-amber-400">
                it is a criminal offense under Lebanese law
              </strong>{" "}
              for any Lebanese citizen to communicate with any Israeli citizen or Israeli entity. The
              Lebanese people engaging on r/ForbiddenBromance are doing so at legal risk. The
              asymmetry of who can speak freely, and who cannot, is itself a data point.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              What This Dashboard Answers
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
                  qualify as attacks on protected persons/sites vs. Hezbollah military targets? Same
                  for Hezbollah.
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
                  <strong className="text-white">What does the Litani tell us?</strong> Map the
                  progression of IDF ground position relative to the Litani River over time — is
                  there a documented territorial creep pattern?
                </span>
              </li>
            </ul>
          </section>

          <section className="neo-inset p-6 space-y-3">
            <h2 className="text-xs font-mono text-rose-400 uppercase tracking-widest">
              Methodology Note
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
              Military events documented from January 2024 to present. Media landscape analysis
              covers Lebanese trilingual (Arabic/English/French) and Israeli dual-language
              (Hebrew/English) outlets.
            </p>
          </section>

          <footer className="text-center pt-4">
            <p className="text-[10px] text-gray-600 font-mono">
              ZIOPSYOP.me — Counter-Intelligence Sentiment Analysis Platform
            </p>
          </footer>
        </motion.article>
      </div>
    </main>
  );
}
