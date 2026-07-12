"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileSearch, Puzzle, Crosshair, BookOpen, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { TracedCard } from "./TracedCard";
import { DecryptText } from "./DecryptText";
import { cn } from "@/lib/utils";

export interface Commentary {
  /** What does this chart literally show? */
  reads: string;
  /** What does it mean — the interpretation? */
  means: string;
  /** How does it connect to the broader ZIOPSYOP thesis? */
  puzzle: string;
}

export interface PlainBrief {
  /** "What am I looking at?" — one sentence, explain like I'm 10 */
  what: string;
  /** "Why does this matter?" — emotional/political significance */
  why: string;
  /** "What does this prove?" — the bottom line */
  proves: string;
}

interface ChartFrameProps {
  /** exhibit identifier, e.g. "EX-04" — stable IDs make future additions seamless */
  exhibit: string;
  title: string;
  subtitle?: string;
  /** trace/accent color for this exhibit */
  accent?: string;
  /** classification chip text */
  classification?: string;
  /** right-side slot for view toggles / data function controls */
  controls?: React.ReactNode;
  commentary?: Commentary;
  /** Plain-language brief for non-technical readers */
  plain?: PlainBrief;
  children: React.ReactNode;
  className?: string;
}

/**
 * Every visualization on the site is mounted inside a ChartFrame —
 * a uniform "evidence exhibit" chrome: dossier header, traced border,
 * control slot, and an expandable analyst-commentary drawer that ties
 * the chart back to the investigation's thesis.
 *
 * Adding a future chart = drop it in a ChartFrame with the next EX-id.
 */
export function ChartFrame({
  exhibit,
  title,
  subtitle,
  accent = "var(--primary)",
  classification = "OPEN SOURCE",
  controls,
  commentary,
  plain,
  children,
  className,
}: ChartFrameProps) {
  const [open, setOpen] = useState(false);
  const [plainOpen, setPlainOpen] = useState(false);

  const anchorId = exhibit.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <TracedCard
      id={anchorId}
      traceColor={accent}
      className={cn("overflow-hidden scroll-mt-20", className)}
    >
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-borderc">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="font-mono text-[9px] tracking-[0.25em] px-1.5 py-0.5 border rounded-[3px]"
              style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 40%, transparent)` }}
            >
              {exhibit}
            </span>
            <span className="stamp text-muted-2">{classification}</span>
          </div>
          <DecryptText
            text={title}
            as="h2"
            startOnView
            speed={40}
            scrambleCycles={1}
            className="font-mono text-sm md:text-base font-semibold tracking-[0.08em] text-foreground text-balance"
          />
          {subtitle && (
            <p className="mt-1 text-xs text-muted leading-relaxed max-w-2xl text-pretty">
              {subtitle}
            </p>
          )}
        </div>
        {controls && <div className="flex items-center gap-2 shrink-0">{controls}</div>}
      </div>

      {/* chart body */}
      <div className="px-3 py-4 md:px-5">{children}</div>

      {/* analyst commentary drawer */}
      {commentary && (
        <div className="border-t border-borderc">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 group cursor-pointer"
            aria-expanded={open}
          >
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted group-hover:text-foreground transition-colors">
              <FileSearch size={12} style={{ color: accent }} />
              ANALYST COMMENTARY
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              className="text-muted-2 group-hover:text-foreground transition-colors"
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 grid gap-3 md:grid-cols-3">
                  <CommentaryBlock
                    icon={<Crosshair size={11} />}
                    label="WHAT IT SHOWS"
                    text={commentary.reads}
                    accent={accent}
                  />
                  <CommentaryBlock
                    icon={<FileSearch size={11} />}
                    label="WHAT IT MEANS"
                    text={commentary.means}
                    accent={accent}
                  />
                  <CommentaryBlock
                    icon={<Puzzle size={11} />}
                    label="THE LARGER PUZZLE"
                    text={commentary.puzzle}
                    accent={accent}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* plain language brief drawer */}
      {plain && (
        <div className="border-t border-borderc">
          <button
            onClick={() => setPlainOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 group cursor-pointer"
            aria-expanded={plainOpen}
          >
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted group-hover:text-foreground transition-colors">
              <BookOpen size={12} className="text-muted" />
              PLAIN LANGUAGE BRIEF
            </span>
            <motion.span
              animate={{ rotate: plainOpen ? 180 : 0 }}
              className="text-muted-2 group-hover:text-foreground transition-colors"
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {plainOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 grid gap-3 md:grid-cols-3">
                  <PlainBlock
                    icon={<Eye size={11} />}
                    label="WHAT AM I LOOKING AT"
                    text={plain.what}
                  />
                  <PlainBlock
                    icon={<AlertTriangle size={11} />}
                    label="WHY THIS MATTERS"
                    text={plain.why}
                  />
                  <PlainBlock
                    icon={<CheckCircle size={11} />}
                    label="WHAT THIS PROVES"
                    text={plain.proves}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </TracedCard>
  );
}

function CommentaryBlock({
  icon,
  label,
  text,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  accent: string;
}) {
  return (
    <div className="rounded-md bg-black/30 border border-borderc p-3.5">
      <p
        className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] mb-2"
        style={{ color: accent }}
      >
        {icon}
        {label}
      </p>
      <p className="text-xs text-muted leading-relaxed text-pretty">{text}</p>
    </div>
  );
}

function PlainBlock({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-md bg-black/30 border border-borderc p-3.5">
      <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] mb-2 text-muted">
        {icon}
        {label}
      </p>
      <p className="text-xs text-muted leading-relaxed text-pretty">{text}</p>
    </div>
  );
}

/** Segmented view-toggle for chart data functions. */
export function SegToggle<T extends string>({
  options,
  value,
  onChange,
  threat = false,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  threat?: boolean;
}) {
  return (
    <div className={cn("seg-toggle", threat && "seg-threat")} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          data-active={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
