"use client";

import { PageShell } from "@/components/PageShell";
import { motion } from "framer-motion";
import { useState } from "react";
import { AsciiEyeField } from "@/components/fx/AsciiEyeField";

interface SourceEntry { title: string; org: string; date: string; url?: string; exhibits: string[] }
interface SourceCategory { category: string; entries: SourceEntry[] }

const sources: SourceCategory[] = [
  {
    category: "Live Media Corpus — Original Publishers",
    entries: [
      { title: "27,104 stored events · 08 Aug 2023–12 Jul 2026 · currently loaded", org: "Al-Manar", date: "2023–2026", url: "https://english.almanar.com.lb/", exhibits: ["LIVE"] },
      { title: "13,287 stored events · 07 Dec 2023–13 Jul 2026 · currently loaded", org: "Al Mayadeen English", date: "2023–2026", url: "https://english.almayadeen.net/", exhibits: ["LIVE"] },
      { title: "6,164 stored events · 04 Aug 2023–13 Jul 2026 · currently loaded", org: "Channel 14", date: "2023–2026", url: "https://www.c14.co.il/", exhibits: ["LIVE"] },
      { title: "Benchmark stream named in the research design; ingestion pending", org: "Times of Israel", date: "planned", url: "https://www.timesofisrael.com/", exhibits: ["QUEUED"] },
      { title: "Neutral/control benchmark named in the research design; ingestion pending", org: "Al Jazeera English", date: "planned", url: "https://www.aljazeera.com/", exhibits: ["QUEUED"] },
      { title: "Independent verification benchmark; ingestion pending", org: "BBC / BBC Verify", date: "planned", url: "https://www.bbc.com/news/bbcverify", exhibits: ["QUEUED"] },
    ],
  },
  {
    category: "International Organizations",
    entries: [
      { title: 'MDE 18/9552/2025 — "Nowhere to Return: Israel\'s extensive destruction of Southern Lebanon"', org: "Amnesty International", date: "Aug 2025", url: "https://www.amnesty.org/en/documents/mde18/9552/2025/en/", exhibits: ["EX-32"] },
      { title: "Lebanon conflict reports 2024-2025", org: "Human Rights Watch", date: "2024-2025", url: "https://www.hrw.org", exhibits: [] },
      { title: "Press releases and incident reports 2024-2025", org: "UNIFIL", date: "2024-2025", url: "https://unifil.unmissions.org", exhibits: [] },
      { title: "Healthcare worker casualties — Lebanon", org: "WHO", date: "2024-2025", url: "https://www.who.int", exhibits: [] },
    ],
  },
  {
    category: "Independent Verification",
    entries: [
      { title: "35 geolocated FPV drone strikes — Hezbollah drone tactics", org: "BBC Verify", date: "May 2026", url: "https://www.bbc.com/news/articles/c1j2zwe9g5no", exhibits: ["EX-27b"] },
      { title: "Military Censor FOIA data (15 years)", org: "+972 Magazine", date: "2024", url: "https://www.972mag.com", exhibits: ["EX-30b"] },
      { title: "Hospital records discrepancy reporting", org: "Haaretz", date: "2025", url: "https://www.haaretz.com", exhibits: ["EX-27b"] },
      { title: 'Army chief 5,942 bereaved families admission', org: "The New Arab", date: "2025", url: "https://www.newarab.com", exhibits: ["EX-27c"] },
    ],
  },
  {
    category: "Government/Military Sources",
    entries: [
      { title: "Official statements, casualty notices and press releases", org: "Israel Defense Forces", date: "2024-2026", url: "https://www.idf.il/en/", exhibits: [] },
      { title: "Lebanon emergency reports and casualty figures", org: "Lebanese Ministry of Public Health", date: "2024-2026", url: "https://www.moph.gov.lb/en", exhibits: [] },
      { title: "Official communiqués and deployment statements", org: "Lebanese Armed Forces", date: "2024-2026", url: "https://www.lebarmy.gov.lb/en", exhibits: [] },
      { title: "Military reporting and quoted commander statements", org: "Israeli Army Radio", date: "2024-2026", url: "https://glz.co.il/", exhibits: ["EX-31"] },
    ],
  },
  {
    category: "Data Archives",
    entries: [
      { title: "r/ForbiddenBromance activity (Sep 2019 – Jun 2026)", org: "Reddit Arctic Shift API", date: "2019-2026", url: "https://arctic-shift.photon-reddit.com", exhibits: ["Part I"] },
      { title: "Structured storage and query layer—not an original evidence publisher", org: "ZIOPSYOP Supabase", date: "live", exhibits: ["DATA LAYER"] },
      { title: '"Misinformation in the Israel-Hamas war"', org: "Wikipedia", date: "2024", url: "https://en.wikipedia.org", exhibits: ["EX-29b"] },
    ],
  },
  {
    category: "Media",
    entries: [
      { title: "Commander quotes and battlefield reporting", org: "Yedioth Ahronoth / Ynet", date: "2024-2026", url: "https://www.ynetnews.com/", exhibits: [] },
      { title: "Domestic reporting and casualty-accountability coverage", org: "Haaretz", date: "2024-2026", url: "https://www.haaretz.com/", exhibits: ["EX-27b"] },
      { title: "Israeli broadcast reporting", org: "Channel 12 / N12", date: "2024-2026", url: "https://www.n12.co.il/", exhibits: [] },
      { title: "International wire reporting and satellite analysis", org: "Reuters", date: "2024-2026", url: "https://www.reuters.com/world/middle-east/", exhibits: [] },
      { title: "Timeline and breaking-news corroboration", org: "Associated Press", date: "2023-2026", url: "https://apnews.com/hub/israel-hamas-war", exhibits: [] },
    ],
  },
  {
    category: "Humanitarian and Civilian Impact",
    entries: [
      { title: "Health-facility, health-worker and emergency reporting", org: "World Health Organization — Lebanon", date: "2024-2026", url: "https://www.emro.who.int/countries/lbn/index.html", exhibits: ["EX-20", "EX-22"] },
      { title: "Children, displacement and humanitarian situation reports", org: "UNICEF Lebanon", date: "2024-2026", url: "https://www.unicef.org/lebanon/", exhibits: [] },
      { title: "Peacekeeper incidents, Blue Line reporting and official statements", org: "UNIFIL", date: "2024-2026", url: "https://unifil.unmissions.org/", exhibits: [] },
      { title: "Journalist casualty documentation", org: "Committee to Protect Journalists", date: "2024-2026", url: "https://cpj.org/mideast/lebanon/", exhibits: [] },
    ],
  },
  {
    category: "Legal Frameworks",
    entries: [
      { title: "Geneva Conventions (I-IV) and Additional Protocols", org: "ICRC", date: "1949/1977", url: "https://ihl-databases.icrc.org", exhibits: [] },
      { title: "Rome Statute of the ICC", org: "International Criminal Court", date: "1998", url: "https://www.icc-cpi.int", exhibits: [] },
      { title: "Customary International Humanitarian Law (ICRC study)", org: "ICRC", date: "2005", url: "https://ihl-databases.icrc.org/customary-ihl", exhibits: [] },
    ],
  },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function SourcesPage() {
  const [filter, setFilter] = useState("");

  const filtered = sources
    .map((cat) => ({
      ...cat,
      entries: cat.entries.filter((e) => {
        const q = filter.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.org.toLowerCase().includes(q) ||
          e.date.toLowerCase().includes(q) ||
          e.exhibits.some((ex) => ex.toLowerCase().includes(q))
        );
      }),
    }))
    .filter((cat) => cat.entries.length > 0);

  return (
    <PageShell backdrop="none">
      <AsciiEyeField seed={17} />
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-cyan-400 font-mono mb-2">
            Bibliography
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">SOURCE INDEX</h1>
          <p className="text-gray-400 text-sm max-w-2xl mb-10">
            Original publishers, institutional records, archive interfaces and the structured layer that joins them. Supabase stores observations; it is never presented as their origin.
          </p>
        </motion.div>

        <div className="mb-10 grid gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
          {[
            ["46,555", "MEDIA EVENTS", "Current public.media_events rows"],
            ["3 / 6", "STREAMS LIVE", "Three loaded; three named benchmarks queued"],
            ["19", "PUBLIC TABLES", "Structured exhibits, summaries and provenance"],
          ].map(([value, label, note]) => (
            <div key={label} className="bg-background/90 p-4">
              <p className="font-mono text-2xl text-cyan-200">{value}</p>
              <p className="mt-1 font-mono text-[8px] tracking-[0.18em] text-foreground">{label}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-gray-500">{note}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 border-l-2 border-amber-300/50 bg-amber-300/[0.035] px-4 py-3">
          <p className="font-mono text-[9px] tracking-[0.16em] text-amber-200">PROVENANCE STATUS // CURRENT VS INTENDED</p>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
            Al-Manar, Al Mayadeen and Channel 14 are currently ingested. Times of Israel, Al Jazeera English and BBC are the next benchmark streams. Labels marked QUEUED describe the approved research design, not rows already present in the database.
          </p>
        </div>

        <div className="mb-12">
          <input
            type="text"
            placeholder="Filter sources by title, org, date, or exhibit..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded px-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 font-mono transition-colors"
          />
        </div>

        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-14">
          {filtered.map((cat) => (
            <motion.div key={cat.category} variants={item}>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-cyan-400 font-mono mb-4 border-b border-white/10 pb-2">
                {cat.category}
              </h2>
              <div className="grid gap-3">
                {cat.entries.map((entry, i) => (
                  <motion.div
                    key={`${cat.category}-${i}`}
                    variants={item}
                    className="group bg-white/[0.02] border border-white/5 rounded-lg px-5 py-4 hover:bg-white/[0.05] hover:border-cyan-400/20 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-sm leading-relaxed">{entry.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-mono">
                            {entry.org}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">{entry.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {entry.exhibits.map((ex) => (
                          <span
                            key={ex}
                            className="text-[10px] tracking-[0.2em] uppercase font-mono bg-rose-400/10 text-rose-400 border border-rose-400/20 rounded px-2 py-0.5"
                          >
                            {ex}
                          </span>
                        ))}
                        {entry.url && (
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] tracking-[0.2em] uppercase font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            [src]
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm font-mono mt-8">No sources match your filter.</p>
        )}
      </section>
    </PageShell>
  );
}
