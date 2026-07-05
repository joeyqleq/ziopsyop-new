"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { motion, AnimatePresence } from "framer-motion";

interface VideoSource {
  id: string;
  title: string;
  outlet: string;
  url: string;
  type: "drone-footage" | "analysis" | "investigation" | "destruction";
  description: string;
  date: string;
  exhibits: string[];
}

const videos: VideoSource[] = [
  {
    id: "bbc-fpv-verify",
    title: "Hezbollah drone strike videos show evolving tactics against Israel",
    outlet: "BBC Verify",
    url: "https://www.bbc.com/news/articles/c1j2zwe9g5no",
    type: "investigation",
    description: "BBC Verify geolocated 35 FPV drone strike videos. Experts confirm IDF 'unable to develop effective countermeasures'. $300-500 drones destroying $4M targets.",
    date: "May 2026",
    exhibits: ["EX-27b", "EX-24b"],
  },
  {
    id: "aje-beaufort",
    title: "Hezbollah video shows attack on Israeli troops at Beaufort Castle",
    outlet: "Al Jazeera",
    url: "https://www.aljazeera.com/video/newsfeed/2026/6/3/hezbollah-video-shows-attack-on-israeli-troops-at-lebanons-beaufort-castle",
    type: "drone-footage",
    description: "Released drone footage showing FPV strikes on Israeli forces occupying Beaufort Castle in southern Lebanon.",
    date: "Jun 2026",
    exhibits: ["EX-24b"],
  },
  {
    id: "aje-perception",
    title: "The battle of perception: From Israel's Fauda to Hezbollah's FPV footage",
    outlet: "Al Jazeera",
    url: "https://www.aljazeera.com/features/2026/5/20/the-battle-of-perception-from-israels-fauda-to-hezbollahs-fpv-footage",
    type: "analysis",
    description: "How FPV drone footage reshapes war propaganda and perception. Analysis of information warfare through combat video.",
    date: "May 2026",
    exhibits: ["EX-29b", "EX-30b"],
  },
  {
    id: "ei-thermal",
    title: "Thermal drones deployed against Israeli forces",
    outlet: "Electronic Intifada",
    url: "https://www.youtube.com/watch?v=nUPsl11MO3Y",
    type: "drone-footage",
    description: "Hezbollah thermal/night-vision drone footage showing strikes on Israeli positions. Fiber-optic guidance systems demonstrated.",
    date: "2025",
    exhibits: ["EX-24b", "EX-26"],
  },
  {
    id: "ei-hightech",
    title: "Israel struggles against Hizballah's high-tech drones",
    outlet: "Electronic Intifada",
    url: "https://electronicintifada.net/blogs/eli-gerzon/livestream-israel-struggles-against-hizballahs-high-tech-drones",
    type: "analysis",
    description: "Analysis of fiber-optic FPV drone technology rendering Israeli electronic warfare countermeasures obsolete.",
    date: "2025",
    exhibits: ["EX-26", "EX-24b"],
  },
  {
    id: "ei-401st",
    title: "Israeli officer of 401st Brigade injured by Hizballah drone",
    outlet: "Electronic Intifada / Jon Elmer",
    url: "https://www.facebook.com/electronicintifada/videos/1510978463907886/",
    type: "drone-footage",
    description: "Col. Beerman of 401st Armored Brigade critically wounded by FPV drone through open command center door — weeks after declaring Hezbollah 'weakened'.",
    date: "2025",
    exhibits: ["EX-29", "EX-29b"],
  },
  {
    id: "elmer-tanks",
    title: "Hizballah drones torch Israeli tanks — Jon Elmer analysis",
    outlet: "Electronic Intifada / Jon Elmer",
    url: "https://www.youtube.com/watch?v=OCeQCiRHn7A",
    type: "analysis",
    description: "Week 14 of South Lebanon battle. Jon Elmer covers armed FPV drone operations and anti-tank missile strikes destroying Merkava tanks.",
    date: "2025",
    exhibits: ["EX-24b", "EX-25"],
  },
  {
    id: "elmer-fiber",
    title: "Hizballah missile destroys Israeli drone — Jon Elmer",
    outlet: "Electronic Intifada / Jon Elmer",
    url: "https://www.youtube.com/watch?v=Q2ZY8nlbNWI",
    type: "analysis",
    description: "Coverage of fiber-optic FPV operations, armed FPV strikes, and Beaufort Castle battle. Timestamped analysis of each weapon system.",
    date: "2025",
    exhibits: ["EX-24b", "EX-26"],
  },
  {
    id: "fpv-chase",
    title: "Hezbollah FPV Drone Chases IDF Soldier in Dramatic Footage",
    outlet: "YouTube / Viral",
    url: "https://www.youtube.com/watch?v=DA7NxMV7_5A",
    type: "drone-footage",
    description: "Viral video from Israel-Lebanon front: Israeli soldier scrambling for cover as FPV drone pursues. Demonstrates psychological impact on troops.",
    date: "2026",
    exhibits: ["EX-24b"],
  },
  {
    id: "aje-deadly-drones",
    title: "Hezbollah's new deadly drones spark renewed Israeli alarm",
    outlet: "Al Jazeera / YouTube",
    url: "https://www.youtube.com/watch?v=WIZ31TqyfiI",
    type: "analysis",
    description: "How FPV drones shaped the Lebanon battle. Features Jon Elmer analysis of targeting patterns and IDF troop response.",
    date: "2025",
    exhibits: ["EX-24b", "EX-25"],
  },
  {
    id: "amnesty-destruction",
    title: "Nowhere to Return: Israel's extensive destruction of Southern Lebanon",
    outlet: "Amnesty International",
    url: "https://www.amnesty.org/en/latest/research/2025/08/israel-lebanon-extensive-destruction/",
    type: "destruction",
    description: "77 verified soldier videos showing deliberate destruction of civilian structures with bulldozers and explosives. Satellite imagery of 10,000+ structures destroyed.",
    date: "Aug 2025",
    exhibits: ["EX-32"],
  },
  {
    id: "elmer-iran",
    title: "Iran hammers Israel, US bases — Jon Elmer",
    outlet: "Electronic Intifada / Jon Elmer",
    url: "https://www.youtube.com/watch?v=Dord3Ef5ELQ",
    type: "analysis",
    description: "Week four of expanded war including Strait of Hormuz operations, Iran missile/drone strikes, and Hezbollah escalation analysis.",
    date: "2026",
    exhibits: [],
  },
];

type FilterType = "all" | "drone-footage" | "analysis" | "investigation" | "destruction";

const typeLabels: Record<FilterType, string> = {
  all: "ALL",
  "drone-footage": "COMBAT FOOTAGE",
  analysis: "ANALYSIS",
  investigation: "INVESTIGATION",
  destruction: "DESTRUCTION EVIDENCE",
};

const typeColors: Record<string, string> = {
  "drone-footage": "text-rose-400 border-rose-400/30 bg-rose-400/10",
  analysis: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  investigation: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  destruction: "text-violet-400 border-violet-400/30 bg-violet-400/10",
};

export default function EvidencePage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? videos : videos.filter((v) => v.type === filter);

  return (
    <PageShell backdrop="warp">
      <section className="max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-[10px] tracking-[0.4em] text-cyan-400 uppercase mb-2">
            // video evidence archive
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            PRIMARY VIDEO SOURCES
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mb-4">
            Drone footage, investigative journalism, and destruction documentation referenced
            throughout this investigation. Every video is independently published by a named outlet.
          </p>
          <p className="text-xs text-gray-500 max-w-2xl mb-10">
            These videos document military operations and their aftermath. They contain footage of
            combat, destruction, and casualties. They are presented here as primary evidence — the
            raw material the exhibits in Part II are built from.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-10">
          {(Object.keys(typeLabels) as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`font-mono text-[10px] tracking-[0.15em] px-3 py-1.5 rounded border transition-all ${
                filter === t
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                  : "border-white/10 bg-white/[0.02] text-gray-500 hover:text-gray-300 hover:border-white/20"
              }`}
            >
              {typeLabels[t]}
              {t !== "all" && (
                <span className="ml-1.5 text-gray-600">
                  ({videos.filter((v) => v.type === t).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <motion.div layout className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((v, i) => (
              <motion.a
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group block rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`shrink-0 text-[9px] tracking-[0.2em] uppercase font-mono border rounded px-2 py-0.5 ${typeColors[v.type]}`}
                  >
                    {v.type.replace("-", " ")}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono shrink-0">{v.date}</span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1.5 leading-snug">
                  {v.title}
                </h3>

                <p className="text-[11px] text-cyan-400/70 font-mono mb-2">{v.outlet}</p>

                <p className="text-xs text-gray-400 leading-relaxed mb-3">{v.description}</p>

                {v.exhibits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {v.exhibits.map((ex) => (
                      <span
                        key={ex}
                        className="text-[9px] tracking-[0.15em] font-mono text-rose-400/80 bg-rose-400/5 border border-rose-400/15 rounded px-1.5 py-0.5"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 border-t border-white/[0.06] pt-8"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-3">
            Methodology note
          </p>
          <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
            Over two hours of published drone footage was reviewed for this investigation.
            Videos are only included if published by a named journalist or media outlet with
            editorial accountability. Telegram-sourced footage is referenced only when
            independently verified by BBC Verify or equivalent. No footage from anonymous
            or unverifiable sources is cited as primary evidence.
          </p>
        </motion.div>
      </section>
    </PageShell>
  );
}
