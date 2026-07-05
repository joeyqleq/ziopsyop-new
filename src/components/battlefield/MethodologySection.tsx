"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TracedCard } from "@/components/fx/TracedCard";
import { DecryptText } from "@/components/fx/DecryptText";
import {
  Database,
  FileJson,
  Video,
  Globe,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowDown,
  Table2,
  Cpu,
} from "lucide-react";

// ─── colour tokens ──────────────────────────────────────────────────────────
const C = {
  primary: "var(--primary)",
  threat: "var(--threat)",
  archive: "var(--archive)",
  vizBlue: "var(--viz-blue)",
};

// ─── Pipeline node definition ───────────────────────────────────────────────
interface PipelineNode {
  id: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  /** display on the right side of the pipeline */
  right?: boolean;
}

const PIPELINE: PipelineNode[] = [
  {
    id: "reddit",
    icon: <Database size={14} />,
    label: "Reddit Archive",
    sublabel: "7-year corpus 2019–2026",
    color: C.primary,
  },
  {
    id: "parquet",
    icon: <Table2 size={14} />,
    label: "Parquet Extraction",
    sublabel: "via ModelScope MCP",
    color: C.primary,
  },
  {
    id: "arkive",
    icon: <FileJson size={14} />,
    label: "Arkive JSON",
    sublabel: "Speaker · Quote · Source · Date",
    color: C.archive,
  },
  {
    id: "supabase",
    icon: <Database size={14} />,
    label: "Supabase Tables",
    sublabel: "14 normalised evidence tables",
    color: C.archive,
  },
  {
    id: "drone",
    icon: <Video size={14} />,
    label: "Drone Footage",
    sublabel: "2 h+ manually reviewed",
    color: C.threat,
  },
  {
    id: "cross-drone",
    icon: <ShieldCheck size={14} />,
    label: "Kill / Damage Estimation",
    sublabel: "Cross-ref IDF admissions",
    color: C.threat,
  },
  {
    id: "bbc",
    icon: <Globe size={14} />,
    label: "BBC Verify Geolocations",
    sublabel: "Independent strike verification",
    color: C.vizBlue,
  },
  {
    id: "moh",
    icon: <CheckCircle2 size={14} />,
    label: "Lebanese MoH + WHO",
    sublabel: "Casualty figures",
    color: C.vizBlue,
  },
  {
    id: "idf",
    icon: <AlertTriangle size={14} />,
    label: "IDF Official Statements",
    sublabel: "Propaganda baseline",
    color: C.archive,
  },
];

// ─── Supabase table names from battlefield.ts ────────────────────────────────
const TABLES = [
  "targeting_disparity_comparison",
  "cost_to_israel_summary",
  "idf_hardware_losses",
  "hezbollah_weapon_systems",
  "hezbollah_strike_categories",
  "hezbollah_strikes",
  "timeline_events",
  "idf_commander_quotes",
  "lebanese_civilian_casualties",
  "lebanese_casualties_meta",
  "infrastructure_destruction",
  "infrastructure_destruction_meta",
  "idf_kia_meta",
  "idf_kia_meta",
] as const;
const UNIQUE_TABLES = [...new Set(TABLES)];

// ─── Mock data sample snippets ───────────────────────────────────────────────
const ARKIVE_SAMPLE = `{
  "speaker":  "Col. Beerman",
  "role":     "401st Armored Brigade, IDF",
  "quote":    "We will come here with many surprises…
               They are weakened.",
  "source":   "Israeli Television",
  "date":     "2025-03-01",
  "confirms_effectiveness": true
}`;

const PARQUET_SAMPLE = `| author          | subreddit      | created_utc | body_preview                  |
|-----------------|----------------|-------------|-------------------------------|
| u/ProIsrael_Bot | r/worldnews    | 1704067200  | "Hezbollah started this…"     |
| u/HasbNarrate   | r/israel       | 1704153600  | "The IDF is defending…"       |
| u/MidEastWatch  | r/geopolitics  | 1704326400  | "Terrorists attacked first…"  |`;

// ─── Small reusable pieces ───────────────────────────────────────────────────
function SectionLabel({ color, children }: { color?: string; children: string }) {
  return (
    <p
      className="font-mono text-[9px] tracking-[0.28em] mb-3"
      style={{ color: color ?? C.primary }}
    >
      {children}
    </p>
  );
}

function StatPill({
  value,
  label,
  color,
  delay,
}: {
  value: string;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-md border p-4 bg-black/30"
      style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}
    >
      <p className="font-mono font-bold text-2xl" style={{ color }}>
        {value}
      </p>
      <p className="font-mono text-[10px] tracking-[0.15em] text-muted mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Pipeline flow diagram ───────────────────────────────────────────────────
function PipelineFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-0">
      {PIPELINE.map((node, i) => (
        <div key={node.id} className="flex flex-col items-center w-full max-w-lg">
          {/* Node box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-md border px-4 py-3 flex items-center gap-3 bg-black/40"
            style={{
              borderColor: `color-mix(in srgb, ${node.color} 40%, transparent)`,
              boxShadow: `0 0 12px color-mix(in srgb, ${node.color} 10%, transparent)`,
            }}
          >
            <span style={{ color: node.color }} className="shrink-0">
              {node.icon}
            </span>
            <div className="min-w-0">
              <p
                className="font-mono text-[11px] tracking-[0.12em] font-semibold"
                style={{ color: node.color }}
              >
                {node.label}
              </p>
              <p className="font-mono text-[9px] text-muted-2 tracking-wide mt-0.5">
                {node.sublabel}
              </p>
            </div>
          </motion.div>

          {/* Connector arrow (not after last node) */}
          {i < PIPELINE.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.1 + 0.15 }}
              className="flex flex-col items-center py-0.5"
            >
              {/* dashed line */}
              <div
                className="w-px"
                style={{
                  height: 18,
                  background: `repeating-linear-gradient(
                    to bottom,
                    ${PIPELINE[i + 1].color}55 0,
                    ${PIPELINE[i + 1].color}55 4px,
                    transparent 4px,
                    transparent 8px
                  )`,
                }}
              />
              <ArrowDown
                size={10}
                style={{ color: PIPELINE[i + 1].color, opacity: 0.6 }}
              />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Code block component ────────────────────────────────────────────────────
function CodeBlock({
  title,
  lang,
  code,
  accent,
  delay,
}: {
  title: string;
  lang: string;
  code: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay ?? 0, duration: 0.5 }}
      className="rounded-md overflow-hidden border"
      style={{ borderColor: `color-mix(in srgb, ${accent} 30%, transparent)` }}
    >
      {/* header bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{
          background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
        }}
      >
        <span className="font-mono text-[9px] tracking-[0.25em]" style={{ color: accent }}>
          {title}
        </span>
        <span className="font-mono text-[8px] text-muted-2 tracking-widest uppercase">
          {lang}
        </span>
      </div>
      {/* code body */}
      <pre
        className="text-[10px] leading-relaxed p-3 overflow-x-auto font-mono text-muted bg-black/50"
        style={{ tabSize: 2 }}
      >
        <code>{code}</code>
      </pre>
    </motion.div>
  );
}

// ─── Verification standard row ───────────────────────────────────────────────
function VerifyRow({
  icon,
  label,
  detail,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45 }}
      className="flex items-start gap-3 py-3 border-b border-borderc last:border-0"
    >
      <span className="mt-0.5 shrink-0" style={{ color }}>
        {icon}
      </span>
      <div>
        <p className="font-mono text-[10px] tracking-[0.18em] font-semibold" style={{ color }}>
          {label}
        </p>
        <p className="text-xs text-muted leading-relaxed mt-0.5 text-pretty">{detail}</p>
      </div>
    </motion.div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function MethodologySection() {
  return (
    <TracedCard traceColor={C.primary} className="overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-borderc">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="font-mono text-[9px] tracking-[0.25em] px-1.5 py-0.5 border rounded-[3px]"
              style={{
                color: C.primary,
                borderColor: `color-mix(in srgb, ${C.primary} 40%, transparent)`,
              }}
            >
              EX-00
            </span>
            <span className="stamp text-muted-2">METHODOLOGY</span>
          </div>
          <DecryptText
            text="HOW THIS ANALYSIS WAS BUILT"
            as="h2"
            startOnView
            speed={22}
            className="font-mono text-sm md:text-base font-semibold tracking-[0.08em] text-foreground"
          />
          <p className="mt-1 text-xs text-muted leading-relaxed max-w-2xl text-pretty">
            Every exhibit in Part II is derived from open-source evidence. This section documents the
            data pipeline, source samples, and the verification standards applied before any figure
            was treated as reliable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[9px] tracking-[0.2em] px-2 py-1 rounded border"
            style={{
              color: C.archive,
              borderColor: `color-mix(in srgb, ${C.archive} 35%, transparent)`,
              background: `color-mix(in srgb, ${C.archive} 6%, transparent)`,
            }}
          >
            OPEN SOURCE INTEL
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-6 space-y-10">

        {/* ── 1. Data Pipeline ── */}
        <section>
          <SectionLabel color={C.primary}>01 · DATA PIPELINE</SectionLabel>
          <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr]">
            {/* Left: pipeline flow diagram */}
            <div className="md:col-span-1">
              <PipelineFlow />
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-borderc self-stretch" />

            {/* Right: Supabase table index */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 mb-3 flex items-center gap-1.5">
                  <Database size={10} style={{ color: C.archive }} />
                  SUPABASE EVIDENCE TABLES
                </p>
                <ul className="space-y-1.5">
                  {UNIQUE_TABLES.map((t, i) => (
                    <motion.li
                      key={t}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: C.archive }}
                      />
                      <span className="font-mono text-[10px] text-muted tracking-wide">{t}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Table legend */}
                <div
                  className="mt-4 rounded-md border px-3 py-2.5 bg-black/30"
                  style={{
                    borderColor: `color-mix(in srgb, ${C.archive} 25%, transparent)`,
                  }}
                >
                  <p className="font-mono text-[9px] tracking-[0.2em] text-archive mb-1">
                    SCHEMA NOTE
                  </p>
                  <p className="text-[10px] text-muted leading-relaxed">
                    All tables loaded server-side via Supabase PostgREST. Duplicate and draft rows
                    are normalised by taking the maximum authoritative value per metric. Every row
                    carries a <code className="text-primary text-[9px]">source</code> column
                    identifying the primary document.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 2. Source Data Samples ── */}
        <section>
          <SectionLabel color={C.archive}>02 · SOURCE DATA SAMPLES</SectionLabel>
          <div className="grid gap-4 md:grid-cols-2">
            <CodeBlock
              title="ARKIVE JSON — COMMANDER QUOTE RECORD"
              lang="JSON"
              code={ARKIVE_SAMPLE}
              accent={C.archive}
              delay={0}
            />
            <CodeBlock
              title="PARQUET TABLE — REDDIT CORPUS PREVIEW"
              lang="PARQUET / SQL"
              code={PARQUET_SAMPLE}
              accent={C.primary}
              delay={0.08}
            />
          </div>
        </section>

        {/* ── 3. AI Analysis Methodology ── */}
        <section>
          <SectionLabel color={C.vizBlue}>03 · AI-ASSISTED ANALYSIS</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatPill
              value="649+"
              label="DOCUMENTED HEZBOLLAH STRIKES ANALYZED"
              color={C.primary}
              delay={0}
            />
            <StatPill
              value="5"
              label="INDEPENDENT DATABASES CROSS-REFERENCED"
              color={C.vizBlue}
              delay={0.1}
            />
            <StatPill
              value="7 yrs"
              label="REDDIT ACTIVITY PATTERN DETECTION (2019–2026)"
              color={C.archive}
              delay={0.2}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4 rounded-md border border-borderc bg-black/30 px-4 py-3"
          >
            <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 mb-2 flex items-center gap-1.5">
              <Cpu size={10} style={{ color: C.vizBlue }} />
              MODEL PIPELINE
            </p>
            <p className="text-xs text-muted leading-relaxed text-pretty">
              Supabase tables were populated via structured extraction prompts applied to the Arkive
              JSON corpus and Jon Elmer transcript transcriptions. Each extracted claim was validated
              against at least one independent source before insertion. AI-assisted pattern detection
              was used to surface Reddit co-ordination signals; no AI-inferred fact is presented
              without a human-verified primary document citation.
            </p>
          </motion.div>
        </section>

        {/* ── 4. Drone Footage Analysis ── */}
        <section>
          <SectionLabel color={C.threat}>04 · DRONE FOOTAGE ANALYSIS</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="rounded-md border bg-black/30 p-4"
              style={{
                borderColor: `color-mix(in srgb, ${C.threat} 30%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Video size={13} style={{ color: C.threat }} />
                <p className="font-mono text-[9px] tracking-[0.22em]" style={{ color: C.threat }}>
                  FOOTAGE REVIEW
                </p>
              </div>
              <ul className="space-y-2">
                {[
                  "2+ hours of published Hezbollah drone footage manually reviewed",
                  "Kill/damage ratio estimated per engagement",
                  "Vehicle identification and loss categorisation by type",
                  "Cross-referenced against IDF official admissions and denial patterns",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2 text-xs text-muted leading-relaxed"
                  >
                    <span
                      className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                      style={{ background: C.threat }}
                    />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-md border bg-black/30 p-4"
              style={{
                borderColor: `color-mix(in srgb, ${C.threat} 30%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={13} style={{ color: C.threat }} />
                <p className="font-mono text-[9px] tracking-[0.22em]" style={{ color: C.threat }}>
                  KILL / DAMAGE METHODOLOGY
                </p>
              </div>
              <p className="text-xs text-muted leading-relaxed text-pretty">
                Drone engagements were classified as <em>confirmed kill</em>,{" "}
                <em>probable kill</em>, or <em>damage only</em> using a conservative threshold:
                a kill is logged only when secondary explosion, catastrophic penetration, or crew
                abandonment is visible on-frame. Ambiguous hits are counted only as damage.
                The resulting figures are then cross-tabulated against{" "}
                <code className="font-mono text-[9px] text-archive">idf_kia_meta</code> to derive
                the admission-gap metric in Exhibit EX-27.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 5. Verification Standards ── */}
        <section>
          <SectionLabel color={C.vizBlue}>05 · VERIFICATION STANDARDS</SectionLabel>
          <TracedCard traceColor={C.vizBlue} className="px-4 py-1" brackets={false}>
            <VerifyRow
              icon={<CheckCircle2 size={13} />}
              label="MULTI-SOURCE TRIANGULATION"
              detail="No casualty figure, equipment loss, or targeting statistic is treated as reliable unless corroborated by at least two independent sources (e.g. Lebanese MoH + WHO + BBC Verify, or drone footage + IDF admission)."
              color={C.primary}
              delay={0}
            />
            <VerifyRow
              icon={<Globe size={13} />}
              label="BBC VERIFY GEOLOCATED STRIKES"
              detail="Geolocation work from BBC Verify is used as the independent verification layer for strike locations. BBC Verify's published methodology — GPS metadata, satellite imagery cross-check, shadow analysis — is treated as the gold standard for location claims."
              color={C.vizBlue}
              delay={0.07}
            />
            <VerifyRow
              icon={<Database size={13} />}
              label="OFFICIAL SOURCES FOR BASELINE"
              detail="IDF official statements and Israeli government communications are ingested as the propaganda baseline and compared against documented outcomes — not accepted at face value. Discrepancies are quantified and exhibited."
              color={C.archive}
              delay={0.14}
            />
            <VerifyRow
              icon={<AlertTriangle size={13} />}
              label="CIRCUMSTANTIAL EVIDENCE FLAGGING"
              detail="Where evidence is inferential rather than directly documented, it is explicitly flagged in the associated exhibit with a CIRCUMSTANTIAL or ESTIMATED label. Figures marked this way are excluded from cross-table aggregates."
              color={C.threat}
              delay={0.21}
            />
            <VerifyRow
              icon={<ShieldCheck size={13} />}
              label="ADVERSARIAL SELF-AUDIT"
              detail="Each exhibit was stress-tested against the strongest plausible counter-argument before publication. If the counter-argument could not be falsified with the available evidence, the claim was either softened or removed."
              color={C.primary}
              delay={0.28}
            />
          </TracedCard>
        </section>

        {/* ── Source footer ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-mono text-[9px] tracking-[0.12em] text-muted-2 pt-2 border-t border-borderc"
        >
          SOURCE CORPUS: Jon Elmer transcripts · Lebanese MoH · WHO Lebanon · BBC Verify · IDF
          official (gov.il) · Arkive JSON · Reddit Archive (ModelScope) · Supabase structured
          tables · 2+ h Hezbollah drone footage (open-source)
        </motion.p>
      </div>
    </TracedCard>
  );
}
