"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Database, Eye, ScanLine, TriangleAlert } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { DroneReconstruction } from "@/components/vision/DroneReconstruction";
import { BrandedText } from "@/components/BrandedText";

export interface VisionStrikeSample {
  id: string;
  period: string | null;
  strike_date: string | null;
  weapon_system: string | null;
  target_class: string | null;
  target_detail: string | null;
  location_town: string | null;
  confirmation_source: string | null;
  source_transcript_ep: string | null;
  idf_kia_in_event: number | null;
  idf_wounded_in_event: number | null;
}

interface VisionModelExperienceProps {
  sampleRows: VisionStrikeSample[];
  totalStrikeRows: number;
}

const PIPELINE = [
  ["01", "SOURCE VIDEO", "Thirty-five campaign releases; more than two hours of footage."],
  ["02", "FRAME DECODE", "Frames, cuts and timestamps are normalized into a reviewable timebase."],
  ["03", "VISION PASS", "People, vehicles, motion vectors, approach geometry and scene changes become candidate observations."],
  ["04", "PHYSICS CHECK", "Scale cues, perspective, elapsed time and blast relationships constrain—not prove—the estimate."],
  ["05", "HUMAN REVIEW", "Every candidate is replayed, corrected, contextualized and rejected when the image cannot support it."],
  ["06", "OPEN-SOURCE JOIN", "Location, target and casualty reporting are compared with named external sources."],
  ["07", "STRUCTURED RECORD", "Reviewed fields enter the evidence tables used by the battlefield exhibits."],
] as const;

const MODEL_TASKS = [
  {
    label: "APPROACH GEOMETRY",
    body: "Track the incoming drone across successive frames, estimate bearing changes, and separate a real turn from camera roll or editorial cutting.",
  },
  {
    label: "TARGET CLASSIFICATION",
    body: "Distinguish a soldier, vehicle, armoured platform, earthmover, structure or technical system before a human validates the label.",
  },
  {
    label: "FRAME-LEVEL COUNTS",
    body: "Maintain candidate counts of visible people through motion and partial occlusion instead of relying on one memorable still frame.",
  },
  {
    label: "MOVEMENT VECTORS",
    body: "Measure where visible people move or run, over how many frames, and whether the apparent direction persists after camera motion is removed.",
  },
  {
    label: "IMPACT RELATIONSHIPS",
    body: "Compare the terminal frame, target position and visible blast envelope. It does not infer a casualty from an explosion alone.",
  },
  {
    label: "REVIEW PRIORITY",
    body: "Surface uncertain, contradictory or high-consequence segments first so human attention is spent where a wrong label would matter most.",
  },
] as const;

const LIMITS = [
  "Unknown camera field of view and lens distortion",
  "Compression, dropped frames and edited sequences",
  "No reliable scale reference in many scenes",
  "Rolling shutter, vibration and terminal signal loss",
  "Occlusion by terrain, smoke, vehicles or structures",
  "Casualty outcomes require external corroboration",
] as const;

const SOURCES = [
  {
    label: "BBC VERIFY // 35 GEOLOCATED VIDEOS",
    href: "https://www.bbc.com/news/articles/c1j2zwe9g5no",
    note: "Independent corpus count, locations, commercial-parts estimate and 10–20 km optical spool diagram.",
  },
  {
    label: "AL JAZEERA // FIBRE-OPTIC SYSTEM",
    href: "https://www.aljazeera.com/news/2026/4/29/how-hezbollahs-fibre-optic-drones-test-israels-sophisticated-radar-system",
    note: "Released airframe image and reporting on camera, construction and the wider 10–30 km range claim.",
  },
  {
    label: "ALMA // FPV THREAT REPORT",
    href: "https://israel-alma.org/special-report-hezbollahs-fpv-explosive-drone-threat/",
    note: "Israeli research-center assessment of four-motor quadcopters, commercial components and fibre guidance.",
  },
  {
    label: "U.S. ARMY // FIBRE-OPTIC FPV PRIMER",
    href: "https://www.army.mil/article/287737/fiber_optic_drones_posing_a_significant_c_uas_challenge",
    note: "Technical context for optical guidance and the limits of radio-frequency countermeasures.",
  },
] as const;

export function VisionModelExperience({ sampleRows, totalStrikeRows }: VisionModelExperienceProps) {
  return (
    <PageShell backdrop="none">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(182,255,124,.08),transparent_27%),radial-gradient(circle_at_82%_34%,rgba(94,188,255,.07),transparent_24%),linear-gradient(#060808,#050606)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(182,255,124,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(182,255,124,.16)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
        <div className="absolute inset-y-0 right-[17%] w-px bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 md:px-6 md:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end"
        >
          <div>
            <div className="mb-5 flex items-center gap-3 font-mono text-[9px] tracking-[0.28em] text-primary">
              <span>METHOD // COMPUTER VISION</span>
              <span className="h-px w-12 bg-primary/40" />
              <span className="text-muted">35-VIDEO CORPUS</span>
            </div>
            <h1 aria-label="FROM PIXELS TO EVIDENCE." className="max-w-5xl text-balance text-[clamp(2.7rem,7.4vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.04em] text-foreground">
              <BrandedText text="FROM PIXELS" />
              <span className="block text-primary"><BrandedText text="TO EVIDENCE." /></span>
            </h1>
            <p className="mt-7 max-w-3xl text-pretty text-base leading-relaxed text-muted md:text-lg">
              The vision model did not watch the war like a person watches a clip. It converted successive frames into candidate measurements: approach angle, target class, visible-person count, movement direction, impact relationship and uncertainty. Human review then decided what survived.
            </p>
          </div>
          <div className="border-l border-primary/30 pl-5">
            <p className="font-mono text-[9px] tracking-[0.26em] text-muted">CORPUS DECLARATION</p>
            <div className="mt-5 grid grid-cols-3 gap-px bg-white/[0.08]">
              {[
                ["35", "VIDEOS"],
                ["2+", "HOURS"],
                ["2", "REVIEW LAYERS"],
              ].map(([value, label]) => (
                <div key={label} className="bg-background/90 px-3 py-4">
                  <p className="font-mono text-2xl text-foreground">{value}</p>
                  <p className="mt-1 font-mono text-[7px] tracking-[0.18em] text-muted">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-2">
              Model-assisted does not mean model-certified. The system is a quantification springboard; the evidence standard remains human-reviewed and source-aware.
            </p>
          </div>
        </motion.div>

        <div className="mt-16">
          <DroneReconstruction />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-l-2 border-amber-300/60 bg-amber-300/[0.035] px-4 py-3 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-4xl gap-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-[11px] leading-relaxed text-muted">
              <span className="font-mono tracking-[0.14em] text-amber-200">RECONSTRUCTION NOTICE //</span>{" "}
              No public schematic has been authenticated. Form and component placement combine visible campaign imagery with independently reported long-range FPV architecture. Dimensions, vendors, motor ratings, battery configuration, internal electronics and exact payload integration remain unresolved.
            </p>
          </div>
          <span className="shrink-0 font-mono text-[8px] tracking-[0.18em] text-amber-300/70">EVIDENCE ≠ BLUEPRINT</span>
        </div>
      </section>

      <section className="relative border-y border-white/[0.07] bg-black/20 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div>
              <p className="font-mono text-[9px] tracking-[0.28em] text-cyan-300">THE PIPELINE</p>
              <h2 aria-label="WHAT HAPPENED BETWEEN VIDEO AND TABLE." className="mt-3 text-3xl font-bold uppercase tracking-[-0.035em] text-foreground md:text-4xl">
                <BrandedText text="WHAT HAPPENED BETWEEN VIDEO AND TABLE." />
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                This is the chain the site uses to explain the result. It separates machine output, human judgment, outside reporting and the final structured record.
              </p>
            </div>
            <div className="relative">
              <div className="absolute bottom-0 left-[17px] top-0 w-px bg-gradient-to-b from-primary/50 via-cyan-300/25 to-violet-300/40" />
              {PIPELINE.map(([index, label, body]) => (
                <div key={index} className="relative grid grid-cols-[36px_1fr] gap-4 pb-8 last:pb-0">
                  <span className="relative z-10 grid h-9 w-9 place-items-center border border-white/15 bg-background font-mono text-[9px] text-primary">{index}</span>
                  <div className="border-b border-white/[0.06] pb-8 last:border-0">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-foreground">{label}</p>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-10 grid gap-5 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="font-mono text-[9px] tracking-[0.28em] text-primary">MODEL WORK // ACTUAL TASKS</p>
            <h2 aria-label="NOT “AI ANALYSIS.” SIX SPECIFIC JOBS." className="mt-3 text-3xl font-bold uppercase tracking-[-0.035em] text-foreground md:text-5xl">
              <BrandedText text="NOT “AI ANALYSIS.” SIX SPECIFIC JOBS." />
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted md:justify-self-end">
            The advantage was not that the model “understood war.” It was that it could apply the same narrow measurements to thousands of consecutive frames, then hand uncertain cases to a person.
          </p>
        </div>
        <div className="grid border-l border-t border-white/[0.08] md:grid-cols-2 lg:grid-cols-3">
          {MODEL_TASKS.map((task, index) => (
            <article key={task.label} className="min-h-52 border-b border-r border-white/[0.08] p-5 md:p-6">
              <div className="flex items-center justify-between">
                <ScanLine className="h-4 w-4 text-primary/75" />
                <span className="font-mono text-[8px] text-muted-2">TASK_{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-8 font-mono text-[10px] tracking-[0.18em] text-foreground">{task.label}</h3>
              <p className="mt-3 text-[12px] leading-relaxed text-muted">{task.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <div className="grid overflow-hidden border border-white/[0.08] lg:grid-cols-2">
          <div className="bg-primary/[0.035] p-6 md:p-9">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <p className="font-mono text-[9px] tracking-[0.24em] text-primary">WHY THE MODEL MATTERED</p>
            </div>
            <h2 aria-label="A HUMAN SEES CONTEXT. A MODEL HOLDS THE SAME MEASUREMENT ACROSS EVERY FRAME." className="mt-5 text-2xl font-bold uppercase tracking-[-0.025em] text-foreground">
              <BrandedText text="A HUMAN SEES CONTEXT. A MODEL HOLDS THE SAME MEASUREMENT ACROSS EVERY FRAME." />
            </h2>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <li><span className="mr-3 text-primary">01</span>It does not forget the previous frame when the camera rolls, vibrates or cuts.</li>
              <li><span className="mr-3 text-primary">02</span>It can revisit every candidate person and vehicle with the same threshold instead of a changing impression.</li>
              <li><span className="mr-3 text-primary">03</span>It turns motion into a review trail: frame, time, track and confidence—not just a conclusion.</li>
              <li><span className="mr-3 text-primary">04</span>It finds the small contradictory segment a human may miss after hours of repetitive footage.</li>
            </ul>
          </div>
          <div className="bg-rose-400/[0.025] p-6 md:p-9">
            <div className="flex items-center gap-3">
              <TriangleAlert className="h-5 w-5 text-rose-300" />
              <p className="font-mono text-[9px] tracking-[0.24em] text-rose-300">WHY THE HUMAN REMAINED ESSENTIAL</p>
            </div>
            <h2 aria-label="A TRACK IS NOT A FACT UNTIL THE IMAGE AND THE SOURCE CAN SUPPORT IT." className="mt-5 text-2xl font-bold uppercase tracking-[-0.025em] text-foreground">
              <BrandedText text="A TRACK IS NOT A FACT UNTIL THE IMAGE AND THE SOURCE CAN SUPPORT IT." />
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {LIMITS.map((limit) => (
                <li key={limit} className="border-l border-rose-300/30 pl-3 text-[12px] leading-relaxed text-muted">{limit}</li>
              ))}
            </ul>
            <p className="mt-7 border-t border-white/[0.08] pt-5 text-[11px] leading-relaxed text-muted-2">
              The model can indicate that three figures were visible before an impact. It cannot, from that image alone, establish who they were or what happened after the camera feed ended.
            </p>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/[0.07] bg-[#040606]/80 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-cyan-300" />
                <p className="font-mono text-[9px] tracking-[0.24em] text-cyan-300">LIVE DATA WINDOW</p>
              </div>
              <h2 aria-label="THE CURRENT STRUCTURED LAYER." className="mt-4 text-3xl font-bold uppercase tracking-[-0.035em] text-foreground">
                <BrandedText text="THE CURRENT STRUCTURED LAYER." />
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted">
                This is a presentation of rows fetched from <span className="font-mono text-foreground/80">public.hezbollah_strikes</span> at render time—not a screenshot of the Supabase dashboard.
              </p>
              <dl className="mt-7 border-t border-white/[0.08] font-mono text-[9px]">
                <div className="flex justify-between border-b border-white/[0.08] py-3"><dt className="text-muted">TABLE ROWS</dt><dd className="text-cyan-200">{totalStrikeRows || "OFFLINE"}</dd></div>
                <div className="flex justify-between border-b border-white/[0.08] py-3"><dt className="text-muted">WINDOW</dt><dd className="text-cyan-200">{sampleRows.length} DRONE RECORDS</dd></div>
                <div className="flex justify-between border-b border-white/[0.08] py-3"><dt className="text-muted">STATE</dt><dd className="text-amber-200">LEGACY + EXPANDING</dd></div>
              </dl>
              <p className="mt-4 text-[10px] leading-relaxed text-muted-2">
                The recovered table predates the new 35-video provenance mapping. New video IDs, source URLs, model version and confidence fields remain a later ingestion step.
              </p>
            </div>
            <div className="overflow-x-auto border border-white/[0.08] bg-black/25">
              <table className="min-w-[820px] w-full border-collapse text-left font-mono text-[9px]">
                <thead className="bg-white/[0.035] text-[8px] tracking-[0.15em] text-muted">
                  <tr>
                    <th className="border-b border-white/[0.08] px-3 py-3">ID</th>
                    <th className="border-b border-white/[0.08] px-3 py-3">SYSTEM</th>
                    <th className="border-b border-white/[0.08] px-3 py-3">TARGET</th>
                    <th className="border-b border-white/[0.08] px-3 py-3">LOCATION</th>
                    <th className="border-b border-white/[0.08] px-3 py-3">HUMAN SOURCE</th>
                    <th className="border-b border-white/[0.08] px-3 py-3">OBSERVED NOTE</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((row) => (
                    <tr key={row.id} className="align-top text-muted hover:bg-white/[0.025]">
                      <td className="border-b border-white/[0.055] px-3 py-3 text-cyan-200">{row.id}</td>
                      <td className="border-b border-white/[0.055] px-3 py-3">{row.weapon_system ?? "—"}</td>
                      <td className="border-b border-white/[0.055] px-3 py-3 text-foreground/80">{row.target_class ?? "—"}</td>
                      <td className="border-b border-white/[0.055] px-3 py-3">{row.location_town ?? "—"}</td>
                      <td className="border-b border-white/[0.055] px-3 py-3">{row.confirmation_source ?? row.source_transcript_ep ?? "—"}</td>
                      <td className="max-w-[280px] border-b border-white/[0.055] px-3 py-3 leading-relaxed">{row.target_detail ?? "—"}</td>
                    </tr>
                  ))}
                  {sampleRows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted">SUPABASE WINDOW UNAVAILABLE — METHODOLOGY CONTENT REMAINS ACCESSIBLE.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="font-mono text-[9px] tracking-[0.28em] text-primary">SOURCE DISCIPLINE</p>
            <h2 aria-label="THE AIRCRAFT IS A RECONSTRUCTION. THE CLAIMS ARE TRACEABLE." className="mt-3 text-3xl font-bold uppercase tracking-[-0.035em] text-foreground md:text-5xl">
              <BrandedText text="THE AIRCRAFT IS A RECONSTRUCTION. THE CLAIMS ARE TRACEABLE." />
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
              Exact Hezbollah schematics are not public. The page therefore distinguishes what is visible, what multiple sources make probable, and what remains unresolved instead of disguising a plausible model as recovered hardware.
            </p>
          </div>
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {SOURCES.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 py-4 transition-colors hover:bg-white/[0.025] md:grid-cols-[230px_1fr_20px] md:items-start md:px-3"
              >
                <span className="font-mono text-[9px] tracking-[0.14em] text-cyan-200">{source.label}</span>
                <span className="text-[11px] leading-relaxed text-muted">{source.note}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-24 md:px-6">
        <div className="grid gap-px bg-white/[0.08] md:grid-cols-3">
          {[
            ["WATCH THE CORPUS", "/evidence", "Open the sourced video archive and its release-level evidence."],
            ["READ THE FINDINGS", "/battlefield", "Move from structured observations to the Part II battlefield exhibits."],
            ["AUDIT THE SOURCES", "/sources", "See original outlets, stored feeds, planned inputs and provenance status."],
          ].map(([label, href, body]) => (
            <Link key={href} href={href} className="group bg-background/95 p-6 transition-colors hover:bg-primary/[0.04]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.18em] text-primary">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-muted">{body}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
