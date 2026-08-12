"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { AsciiEyeField } from "@/components/fx/AsciiEyeField";
import { trackEvent } from "@/lib/analytics";

interface CampaignClip {
  id: string;
  xId: string;
  title: string;
  date: string;
  articleUrl: string;
  image: string;
  location: string;
  claimedTarget: string;
  sequence: string;
}

const article = {
  may05: {
    url: "https://english.almanar.com.lb/article/66667/",
    image: "https://english.almanar.com.lb/uploads/2026/03/manar-083b2a4fc6b5f6d9.jpg",
  },
  may16: {
    url: "https://english.almanar.com.lb/article/73447/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-e3fe1d4b8ed2d6f0.png",
  },
  may18: {
    url: "https://english.almanar.com.lb/article/74392/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-2e3071acdbc3f208.png",
  },
  may22: {
    url: "https://english.almanar.com.lb/article/77537/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-84323bcc5296cebb.png",
  },
  may23: {
    url: "https://english.almanar.com.lb/article/77762/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-a27fb283d98d71f1.png",
  },
  may24: {
    url: "https://english.almanar.com.lb/article/78102/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-86e30601c0e630ff.png",
  },
  may25: {
    url: "https://english.almanar.com.lb/article/79102/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-08224c4e154ac6af.png",
  },
  may26: {
    url: "https://english.almanar.com.lb/article/80092/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-0bdc9bdf226eee11.jpg",
  },
  may29: {
    url: "https://english.almanar.com.lb/article/81627/",
    image: "https://english.almanar.com.lb/uploads/2026/05/manar-abeecc0c97fb0be3.jpg",
  },
  jun06: {
    url: "https://english.almanar.com.lb/article/87677/",
    image: "https://english.almanar.com.lb/uploads/2026/06/manar-c7f93c8be6e2619d.png",
  },
  jun10: {
    url: "https://english.almanar.com.lb/article/89692/",
    image: "https://english.almanar.com.lb/uploads/2026/06/manar-bde3bf7b539e4af2.png",
  },
  jun15: {
    url: "https://english.almanar.com.lb/article/92152/",
    image: "https://english.almanar.com.lb/uploads/2026/06/manar-0785a2c8d9fd9e94.png",
  },
} as const;

function campaignClip(
  id: string,
  xId: string,
  title: string,
  date: string,
  source: (typeof article)[keyof typeof article],
  location: string,
  claimedTarget: string,
  sequence: string,
): CampaignClip {
  return { id, xId, title, date, articleUrl: source.url, image: source.image, location, claimedTarget, sequence };
}

// 35 distinct publisher-posted video IDs recovered from Al-Manar English archive
// bundles. Titles below paraphrase the publisher's captions; they do not verify
// the target identity or claimed outcome.
const campaignClips: CampaignClip[] = [
  campaignClip("CV-01", "2051646811526311968", "Hummer approach at Al-Bayyada", "05 MAY 2026", article.may05, "Al-Bayyada", "Hummer vehicle", "MAY-05 / A"),
  campaignClip("CV-02", "2051697089596318037", "Dive approach toward armor at Qouzah", "05 MAY 2026", article.may05, "Qouzah", "Merkava tank", "MAY-05 / B"),
  campaignClip("CV-03", "2051697100807676399", "Loitering-glider run over Al-Bayyada", "05 MAY 2026", article.may05, "Al-Bayyada", "Soldiers / position", "MAY-05 / C"),

  campaignClip("CV-04", "2055620448558125233", "Namera vehicle in Bint Jbeil", "16 MAY 2026", article.may16, "Bint Jbeil", "Namera vehicle", "MAY-16 / A"),
  campaignClip("CV-05", "2055621963838619677", "Combined operation at Odaisseh and Al-Bayyada", "16 MAY 2026", article.may16, "Odaisseh / Al-Bayyada", "Soldier gatherings", "MAY-16 / B"),
  campaignClip("CV-06", "2055662751456825409", "Engineering vehicle at Khallet Al-Raj", "16 MAY 2026", article.may16, "Deir Seryan", "Engineering vehicle", "MAY-16 / C"),
  campaignClip("CV-07", "2055698543659118757", "Armored carrier in Bint Jbeil", "16 MAY 2026", article.may16, "Bint Jbeil", "Armored personnel carrier", "MAY-16 / D"),
  campaignClip("CV-08", "2055736375371051185", "Humvee on the Naqoura–Iskandarouna road", "16 MAY 2026", article.may16, "Naqoura–Iskandarouna", "Humvee vehicle", "MAY-16 / E"),

  campaignClip("CV-09", "2056369041724318025", "Engineering vehicle at Deir Seryan", "18 MAY 2026", article.may18, "Khallet Al-Raj", "Engineering vehicle", "MAY-18 / A"),
  campaignClip("CV-10", "2056451459705684196", "Loitering-glider run at Tayr Harfa", "18 MAY 2026", article.may18, "Tayr Harfa", "Hummer vehicle", "MAY-18 / D"),

  campaignClip("CV-11", "2058183755362128100", "Air-defense system engagement — first release", "22 MAY 2026", article.may22, "Southern Lebanon front", "Iron Dome system", "MAY-22 / A"),
  campaignClip("CV-12", "2058188246438265116", "Air-defense system engagement — second release", "22 MAY 2026", article.may22, "Southern Lebanon front", "Iron Dome system", "MAY-22 / B"),
  campaignClip("CV-13", "2058273687715877315", "Ababil flight over a northern settlement", "23 MAY 2026", article.may23, "Northern occupied Palestine", "Settlement / reconnaissance", "MAY-23 / A"),

  campaignClip("CV-14", "2058497424289677359", "Namera vehicle in Haddatha", "24 MAY 2026", article.may24, "Haddatha", "Namera vehicle", "MAY-24 / A"),
  campaignClip("CV-15", "2058498624640717257", "Namera vehicle at Khallet Al-Raj", "24 MAY 2026", article.may24, "Deir Seryan", "Namera vehicle", "MAY-24 / B"),
  campaignClip("CV-16", "2058544905853534641", "Communications vehicle in Al-Taybeh", "24 MAY 2026", article.may24, "Al-Taybeh", "Communications vehicle", "MAY-24 / C"),
  campaignClip("CV-17", "2058545258317717761", "Merkava approach in Al-Taybeh", "24 MAY 2026", article.may24, "Al-Taybeh", "Merkava tank", "MAY-24 / D"),
  campaignClip("CV-18", "2058557226533425480", "Personnel pursuit near Al-Manara", "24 MAY 2026", article.may24, "Al-Manara", "Individual soldier", "MAY-24 / E"),
  campaignClip("CV-19", "2058650007025111329", "Rashaf multi-drone sequence", "24 MAY 2026", article.may24, "Rashaf", "Forces / vehicles", "MAY-24 / F"),

  campaignClip("CV-20", "2058890907462603152", "Reconnaissance-to-strike sequence at Al-Bayyada", "25 MAY 2026", article.may25, "Al-Bayyada", "Newly established outpost", "MAY-25 / A"),
  campaignClip("CV-21", "2058859477139394904", "Military tanker in Bint Jbeil", "25 MAY 2026", article.may25, "Bint Jbeil", "Military tanker", "MAY-25 / B"),
  campaignClip("CV-22", "2058954266136412340", "Personnel gathering at Al-Bayyada", "25 MAY 2026", article.may25, "Al-Bayyada", "Soldier gathering", "MAY-25 / C"),
  campaignClip("CV-23", "2058954736854880713", "Military vehicle at Misgav Am", "25 MAY 2026", article.may25, "Misgav Am", "Military vehicle", "MAY-25 / D"),

  campaignClip("CV-24", "2059371855031435634", "Bint Jbeil / Markaba release — clip A", "26 MAY 2026", article.may26, "Bint Jbeil / Markaba", "Hummer or Merkava", "MAY-26 / A"),
  campaignClip("CV-25", "2059246545216639163", "Bint Jbeil / Markaba release — clip B", "26 MAY 2026", article.may26, "Bint Jbeil / Markaba", "Hummer or Merkava", "MAY-26 / B"),
  campaignClip("CV-26", "2060391653114814788", "Command Humvee at Al-Manara", "29 MAY 2026", article.may29, "Al-Manara", "Command Humvee", "MAY-29 / A"),

  campaignClip("CV-27", "2063242582751068641", "Merkava sequence at Zawtar — first angle", "06 JUN 2026", article.jun06, "Zawtar Al-Sharqiyah", "Merkava tank", "JUN-06 / A"),
  campaignClip("CV-28", "2063313613725614358", "Merkava sequence at Zawtar — second angle", "06 JUN 2026", article.jun06, "Zawtar Al-Sharqiyah", "Merkava tank", "JUN-06 / B"),
  campaignClip("CV-29", "2063320663855714397", "Zawtar multi-drone operation", "06 JUN 2026", article.jun06, "Zawtar Al-Sharqiyah", "Forces / vehicles", "JUN-06 / C"),

  campaignClip("CV-30", "2064716480910942452", "Loitering-drone sequence at Naqoura and Qantara", "10 JUN 2026", article.jun10, "Naqoura / Qantara", "Military positions", "JUN-10 / A"),
  campaignClip("CV-31", "2064918099376095619", "Merkava at the newly established Blat site", "11 JUN 2026", article.jun10, "Blat", "Merkava tank", "JUN-11 / C"),

  campaignClip("CV-32", "2066461143464337413", "Armored carrier in Ainatha", "15 JUN 2026", article.jun15, "Ainatha", "Armored personnel carrier", "JUN-15 / A"),
  campaignClip("CV-33", "2066470229048185034", "Merkava near Al-Shaqif Castle", "15 JUN 2026", article.jun15, "Al-Shaqif Castle", "Merkava tank", "JUN-15 / B"),
  campaignClip("CV-34", "2066558119753167051", "Namera vehicle in Khiam", "15 JUN 2026", article.jun15, "Khiam", "Namera vehicle", "JUN-15 / C"),
  campaignClip("CV-35", "2066561610987045165", "Personnel pursuit at Misgav Am", "15 JUN 2026", article.jun15, "Misgav Am", "Individual soldier", "JUN-15 / D"),
];

const researchSources = [
  {
    title: "BBC Verify: 35 geolocated strike videos",
    text: "Independent visual investigation establishing the corpus count and geolocating the published footage.",
    href: "https://www.bbc.com/news/articles/c1j2zwe9g5no",
  },
  {
    title: "Al Jazeera: battle of perception",
    text: "Analysis of how the footage operates simultaneously as battlefield evidence and information warfare.",
    href: "https://www.aljazeera.com/features/2026/5/20/the-battle-of-perception-from-israels-fauda-to-hezbollahs-fpv-footage",
  },
  {
    title: "Vision-model methodology",
    text: "The frame-to-record workflow, human review layer, reconstruction, limits, and future provenance contract.",
    href: "/vision-model",
  },
];

const reviewAxes = [
  "APPROACH GEOMETRY",
  "TARGET CLASS",
  "VISIBLE PERSONNEL",
  "MOTION VECTORS",
  "IMPACT RELATIONSHIP",
  "OCCLUSION / CONFIDENCE",
];

export default function EvidencePage() {
  const [selected, setSelected] = useState<CampaignClip | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return campaignClips;
    return campaignClips.filter((clip) =>
      [clip.id, clip.title, clip.location, clip.claimedTarget, clip.date]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  return (
    <PageShell backdrop="none">
      <AsciiEyeField seed={11} />
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-28 md:px-6">
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400">
            {"// campaign video corpus"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">35 WINDOWS INTO THE BATTLE</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-400">
            Thirty-five distinct publisher-posted video IDs recovered from the Al-Manar English archive
            as a working campaign set. BBC Verify separately reported a 35-video geolocated corpus; this
            archive does not claim a one-to-one match until clip-level provenance is ingested. These are
            primary claims from a conflict party&apos;s affiliated outlet—not self-verifying proof of target
            identity, casualties, or outcome.
          </p>
        </motion.header>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[["35", "UNIQUE VIDEO POSTS"], ["2H+", "REVIEWED FOOTAGE"], ["12", "ARCHIVE BUNDLES"]].map(([value, label]) => (
            <div key={label} className="border border-white/10 bg-black/30 p-4">
              <p className="font-mono text-2xl font-bold text-cyan-300">{value}</p>
              <p className="mt-1 font-mono text-[9px] tracking-[0.22em] text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-y border-white/[0.07] py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-amber-300">CONTENT WARNING · COMBAT FOOTAGE</p>
            <p className="mt-1 text-xs text-gray-500">Click a card to load the publisher&apos;s embedded post inside the archive viewer.</p>
          </div>
          <label className="font-mono text-[10px] tracking-[0.15em] text-gray-500">
            SEARCH CORPUS
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="location, target, date…"
              className="ml-3 w-full border border-white/10 bg-black/40 px-3 py-2 text-xs tracking-normal text-gray-200 outline-none placeholder:text-gray-700 focus:border-cyan-400/50 md:w-60"
            />
          </label>
        </div>

        <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((clip, index) => (
              <motion.button
                key={clip.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.035 } }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => {
                  setSelected(clip);
                  trackEvent("campaign_clip_open", { id: clip.id, x_id: clip.xId });
                }}
                className="group overflow-hidden border border-white/[0.08] bg-black/35 text-left transition-colors hover:border-cyan-300/35 hover:bg-cyan-300/[0.035]"
              >
                <div
                  className="relative aspect-video bg-cover bg-center grayscale-[35%] transition duration-500 group-hover:grayscale-0"
                  style={{ backgroundImage: `linear-gradient(to top, rgba(3,7,10,.92), rgba(3,7,10,.08)), url(${clip.image})` }}
                >
                  <span className="absolute left-3 top-3 border border-cyan-300/30 bg-black/70 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-cyan-300">{clip.id}</span>
                  <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/45 text-lg text-white backdrop-blur-sm transition-transform group-hover:scale-110">▶</span>
                  </span>
                  <span className="absolute bottom-3 right-3 font-mono text-[9px] tracking-[0.15em] text-gray-300">{clip.sequence}</span>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[9px] tracking-[0.18em] text-gray-600">{clip.date} · {clip.location}</p>
                  <h2 className="mt-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-cyan-300">{clip.title}</h2>
                  <p className="mt-2 text-xs text-gray-500">Publisher-described target: {clip.claimedTarget}</p>
                  <div className="mt-4 flex items-center justify-between font-mono text-[9px] tracking-[0.15em]">
                    <span className="text-amber-300/80">SOURCE CLAIM</span>
                    <span className="text-cyan-300">OPEN VIEWER →</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <div className="mt-10 border border-white/10 bg-black/30 p-8 text-center font-mono text-xs tracking-[0.18em] text-gray-500">NO MATCHING CORPUS RECORD</div>
        )}

        <section className="mt-16 border-t border-white/[0.08] pt-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-gray-500">CORPUS CONTEXT & METHOD</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {researchSources.map((source) => {
              const external = source.href.startsWith("http");
              return (
                <Link
                  key={source.href}
                  href={source.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="border border-white/[0.08] bg-black/25 p-5 transition-colors hover:border-cyan-300/30"
                >
                  <h3 className="font-mono text-xs tracking-[0.1em] text-cyan-300">{source.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-gray-500">{source.text}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-6 max-w-4xl text-xs leading-relaxed text-gray-500">
            Video IDs are unique at the publisher-post level. Some posts may show alternate angles,
            compilations, or closely related phases of one operation. The archive preserves that distinction.
            A clip only becomes a structured model record after frame extraction, human review, source linkage,
            and confidence labeling; those row-level provenance links are not yet present in the current database.
          </p>
        </section>
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setSelected(null);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="clip-title"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.985 }}
              className="max-h-[94vh] w-full max-w-6xl overflow-y-auto border border-cyan-300/20 bg-[#06090c] shadow-2xl shadow-cyan-950/30"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
                <p className="font-mono text-[10px] tracking-[0.22em] text-cyan-300">{selected.id} · ARCHIVE VIEWER</p>
                <button type="button" onClick={() => setSelected(null)} className="border border-white/10 px-3 py-1 font-mono text-xs text-gray-400 hover:border-white/30 hover:text-white">CLOSE ×</button>
              </div>

              <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]">
                <div className="min-h-[360px] bg-black">
                  <iframe
                    key={selected.xId}
                    title={`${selected.title} — embedded publisher post`}
                    src={`https://platform.twitter.com/embed/Tweet.html?dnt=true&theme=dark&id=${selected.xId}`}
                    className="h-[70vh] max-h-[680px] min-h-[420px] w-full border-0"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  />
                </div>

                <aside className="border-t border-white/10 p-5 lg:border-l lg:border-t-0 md:p-6">
                  <p className="font-mono text-[9px] tracking-[0.2em] text-gray-600">{selected.date} · {selected.sequence}</p>
                  <h2 id="clip-title" className="mt-3 text-xl font-semibold leading-tight text-white">{selected.title}</h2>
                  <dl className="mt-5 space-y-3 text-xs">
                    <div><dt className="font-mono text-[9px] tracking-[0.2em] text-gray-600">LOCATION</dt><dd className="mt-1 text-gray-300">{selected.location}</dd></div>
                    <div><dt className="font-mono text-[9px] tracking-[0.2em] text-gray-600">PUBLISHER-DESCRIBED TARGET</dt><dd className="mt-1 text-gray-300">{selected.claimedTarget}</dd></div>
                    <div><dt className="font-mono text-[9px] tracking-[0.2em] text-gray-600">EVIDENCE STATUS</dt><dd className="mt-1 text-amber-300">PRIMARY CLAIM · OUTCOME NOT INDEPENDENTLY VERIFIED HERE</dd></div>
                  </dl>

                  <div className="mt-6 border border-primary/15 bg-primary/[0.035] p-4">
                    <p className="font-mono text-[9px] tracking-[0.2em] text-primary">VISION REVIEW LANES</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {reviewAxes.map((axis) => <span key={axis} className="border border-primary/15 px-2 py-1 font-mono text-[8px] tracking-[0.12em] text-primary/75">{axis}</span>)}
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                      These are the fields the vision/human pipeline is designed to inspect—not a claim
                      that this clip already has a fully linked model-output row.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <a href={`https://x.com/manarenglish/status/${selected.xId}`} target="_blank" rel="noopener noreferrer" className="border border-cyan-300/30 bg-cyan-300/5 px-4 py-3 text-center font-mono text-[10px] tracking-[0.16em] text-cyan-300 hover:bg-cyan-300/10">OPEN ORIGINAL POST ↗</a>
                    <a href={selected.articleUrl} target="_blank" rel="noopener noreferrer" className="border border-white/10 px-4 py-3 text-center font-mono text-[10px] tracking-[0.16em] text-gray-400 hover:border-white/25 hover:text-white">OPEN AL-MANAR ARCHIVE PAGE ↗</a>
                    <Link href="/vision-model" className="border border-primary/20 px-4 py-3 text-center font-mono text-[10px] tracking-[0.16em] text-primary hover:bg-primary/5">HOW FRAMES BECOME DATA →</Link>
                  </div>
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
