"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// ─── Color tokens ──────────────────────────────────────────────────────────────
const CLAIM_COLOR = "#ff4d5e";
const TRUTH_COLOR = "#3ee6c1";
const DELAY_COLOR = "#eab308";

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  casualties: { label: "CASUALTIES", color: "#f97316" },
  objectives: { label: "OBJECTIVES", color: "#a78bfa" },
  targeting:  { label: "TARGETING",  color: "#38bdf8" },
  weapons:    { label: "WEAPONS",    color: "#fb7185" },
};

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface FogOfWarClockData {
  entries: {
    claimDate: string;
    claimText: string;
    claimSource: string;
    truthDate: string;
    truthText: string;
    truthSource: string;
    delayDays: number;
    category: "casualties" | "objectives" | "targeting" | "weapons";
  }[];
  avgDelayDays: number;
  source: string;
}

// ─── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  duration = 1800,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

// ─── Animated dashed spine ─────────────────────────────────────────────────────
function SpineLine({ active }: { active: boolean }) {
  return (
    <div className="hidden md:flex flex-col items-center flex-shrink-0 w-2 self-stretch">
      <motion.div
        className="w-[2px] flex-1 rounded-full"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            ${DELAY_COLOR}88 0px,
            ${DELAY_COLOR}88 8px,
            transparent 8px,
            transparent 16px
          )`,
        }}
        initial={{ scaleY: 0, originY: 0 }}
        animate={active ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Pulse dot on the spine ────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  return (
    <div className="relative flex-shrink-0 w-3 h-3">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: color, opacity: 0.3 }}
        animate={{ scale: [1, 2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-[3px] rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

// ─── Single claim/truth card ───────────────────────────────────────────────────
function ClaimCard({
  text,
  source,
  date,
  side,
}: {
  text: string;
  source: string;
  date: string;
  side: "claim" | "truth";
}) {
  const color = side === "claim" ? CLAIM_COLOR : TRUTH_COLOR;
  const label = side === "claim" ? "IDF CLAIM" : "VERIFIED TRUTH";
  const fmt = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="rounded-md p-3 flex flex-col gap-2 text-left"
      style={{
        background: `${color}0a`,
        border: `1px solid ${color}33`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[8px] tracking-[0.18em] px-1.5 py-0.5 rounded-[3px] border flex-shrink-0"
          style={{ color, borderColor: `${color}55`, background: `${color}15` }}
        >
          {label}
        </span>
        <span className="font-mono text-[8px] text-muted-2 truncate">{fmt}</span>
      </div>
      {/* Text */}
      <p className="text-[13px] leading-snug text-foreground">{text}</p>
      {/* Source */}
      <p
        className="font-mono text-[9px] tracking-[0.08em] truncate"
        style={{ color: `${color}99` }}
      >
        {source}
      </p>
    </div>
  );
}

// ─── Delay badge ───────────────────────────────────────────────────────────────
function DelayBadge({
  days,
  category,
}: {
  days: number;
  category: string;
}) {
  const cat = CATEGORY_CONFIG[category] ?? { label: category.toUpperCase(), color: "#888" };

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      {/* Pulse dot top */}
      <PulseDot color={CLAIM_COLOR} />

      {/* Days badge */}
      <motion.div
        className="flex flex-col items-center gap-0.5 rounded-md px-3 py-2"
        style={{
          background: `${DELAY_COLOR}12`,
          border: `1px solid ${DELAY_COLOR}55`,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <span
          className="font-mono font-bold leading-none tabular-nums"
          style={{ color: DELAY_COLOR, fontSize: "clamp(1.1rem, 3vw, 1.5rem)" }}
        >
          {days}
        </span>
        <span
          className="font-mono text-[8px] tracking-[0.2em]"
          style={{ color: `${DELAY_COLOR}cc` }}
        >
          DAYS
        </span>
      </motion.div>

      {/* Category pill */}
      <span
        className="font-mono text-[7px] tracking-[0.15em] px-1.5 py-0.5 rounded-[3px]"
        style={{ color: cat.color, background: `${cat.color}18`, border: `1px solid ${cat.color}44` }}
      >
        {cat.label}
      </span>

      {/* Pulse dot bottom */}
      <PulseDot color={TRUTH_COLOR} />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function FogOfWarClock({ data }: { data: FogOfWarClockData }) {
  const spineRef = useRef<HTMLDivElement>(null);
  const spineInView = useInView(spineRef, { once: true, margin: "-60px" });

  return (
    <div>
      {/* ── Header stat ── */}
      <div className="mb-6 text-center space-y-1">
        <p className="font-mono text-[9px] tracking-[0.22em] text-muted-2">
          FOG OF WAR CLOCK — CLAIM-TO-RETRACTION LATENCY
        </p>
        <div
          className="inline-block rounded-md px-4 py-3 mt-1"
          style={{
            background: `${DELAY_COLOR}0d`,
            border: `1px solid ${DELAY_COLOR}44`,
          }}
        >
          <p
            className="font-mono text-[10px] tracking-[0.18em] mb-1"
            style={{ color: `${DELAY_COLOR}99` }}
          >
            AVERAGE PROPAGANDA HALF-LIFE
          </p>
          <p
            className="font-mono font-bold tabular-nums leading-none"
            style={{ color: DELAY_COLOR, fontSize: "clamp(1.8rem, 6vw, 3rem)" }}
          >
            <AnimatedCounter target={data.avgDelayDays} />
            <span
              className="font-mono text-[14px] tracking-[0.15em] ml-2 align-middle"
              style={{ color: `${DELAY_COLOR}cc` }}
            >
              DAYS
            </span>
          </p>
        </div>
        <p className="text-xs text-muted mt-1">
          How long each IDF narrative held before independent verification exposed it.
        </p>
      </div>

      {/* ── Timeline entries ── */}
      <div ref={spineRef} className="relative flex gap-3">
        {/* Animated spine (desktop, absolute) */}
        <SpineLine active={spineInView} />

        {/* Entries column */}
        <div className="flex-1 flex flex-col gap-6">
          {data.entries.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
            >
              {/* ── Desktop: side-by-side ── */}
              <div className="hidden md:grid grid-cols-[1fr_120px_1fr] gap-3 items-center">
                <ClaimCard
                  text={entry.claimText}
                  source={entry.claimSource}
                  date={entry.claimDate}
                  side="claim"
                />
                <DelayBadge days={entry.delayDays} category={entry.category} />
                <ClaimCard
                  text={entry.truthText}
                  source={entry.truthSource}
                  date={entry.truthDate}
                  side="truth"
                />
              </div>

              {/* ── Mobile: stacked ── */}
              <div className="md:hidden flex flex-col gap-2">
                <ClaimCard
                  text={entry.claimText}
                  source={entry.claimSource}
                  date={entry.claimDate}
                  side="claim"
                />
                {/* Mobile delay badge */}
                <div className="flex items-center gap-2 px-1">
                  <div
                    className="h-px flex-1"
                    style={{
                      background: `repeating-linear-gradient(to right, ${DELAY_COLOR}66 0px, ${DELAY_COLOR}66 6px, transparent 6px, transparent 12px)`,
                    }}
                  />
                  <div
                    className="flex items-center gap-1 rounded-md px-2 py-1"
                    style={{
                      background: `${DELAY_COLOR}12`,
                      border: `1px solid ${DELAY_COLOR}55`,
                    }}
                  >
                    <span
                      className="font-mono font-bold text-base tabular-nums"
                      style={{ color: DELAY_COLOR }}
                    >
                      {entry.delayDays}
                    </span>
                    <span
                      className="font-mono text-[8px] tracking-[0.15em]"
                      style={{ color: `${DELAY_COLOR}cc` }}
                    >
                      DAYS
                    </span>
                    <span
                      className="font-mono text-[7px] tracking-[0.12em] ml-1"
                      style={{
                        color: CATEGORY_CONFIG[entry.category]?.color ?? "#888",
                      }}
                    >
                      {CATEGORY_CONFIG[entry.category]?.label ?? entry.category.toUpperCase()}
                    </span>
                  </div>
                  <div
                    className="h-px flex-1"
                    style={{
                      background: `repeating-linear-gradient(to right, ${DELAY_COLOR}66 0px, ${DELAY_COLOR}66 6px, transparent 6px, transparent 12px)`,
                    }}
                  />
                </div>
                <ClaimCard
                  text={entry.truthText}
                  source={entry.truthSource}
                  date={entry.truthDate}
                  side="truth"
                />
              </div>

              {/* Connector arrow (desktop) — animated */}
              <div className="hidden md:flex items-center justify-center mt-2">
                <motion.div
                  className="font-mono text-[9px] tracking-[0.12em]"
                  style={{ color: `${DELAY_COLOR}55` }}
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                >
                  ▼ EXPOSURE
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Summary footer ── */}
      <div
        className="mt-6 rounded-md border p-3 text-center"
        style={{ borderColor: "var(--borderc)", background: "rgba(0,0,0,0.3)" }}
      >
        <p className="font-mono text-[10px] text-muted">
          <span style={{ color: CLAIM_COLOR }}>{data.entries.length} documented claims</span>
          {" · "}
          <span style={{ color: DELAY_COLOR }}>
            avg {data.avgDelayDays}-day window
          </span>
          {" · "}
          <span style={{ color: TRUTH_COLOR }}>
            {data.entries.filter((e) => e.delayDays > data.avgDelayDays).length} outliers above average
          </span>
        </p>
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
