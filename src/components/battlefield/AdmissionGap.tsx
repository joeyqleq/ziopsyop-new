"use client";

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import * as d3 from "d3";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import type { AdmissionGapData } from "@/lib/battlefield";

// ─── colour tokens ────────────────────────────────────────────────────────────
const MINT = "#3ee6c1";
const THREAT = "#ff4d5e";
const AMBER = "#eab308";
const BLUE = "#4ea8ff";
const VIOLET = "#a78bfa";

// ─── animated counter ─────────────────────────────────────────────────────────
function Counter({
  to,
  duration = 1.2,
  delay = 0,
  prefix = "",
  suffix = "",
  className = "",
  style,
}: {
  to: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(mv, to, { duration, delay, ease: "easeOut" });
    return ctrl.stop;
  }, [inView, to, duration, delay, mv]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

// ─── waterfall D3 chart ───────────────────────────────────────────────────────
function WaterfallChart({
  layers,
  active,
  onHover,
}: {
  layers: AdmissionGapData["layers"];
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });
  const [animated, setAnimated] = useState(false);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const W = container.clientWidth || 600;
    const barH = 44;
    const gap = 14;
    const paddingTop = 16;
    const paddingLeft = 8;
    const paddingRight = 8;
    const maxVal = layers[0]?.value ?? 1;
    const H = layers.length * (barH + gap) + paddingTop + 32;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(H));

    const root = d3.select(svg);

    // defs — gradients + glow filter
    const defs = root.append("defs");
    const filter = defs.append("filter").attr("id", "ag-glow").attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    filter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    const clipG = defs.append("clipPath").attr("id", "ag-clip-full");
    clipG.append("rect").attr("width", W).attr("height", H);

    layers.forEach((l, i) => {
      const gid = `ag-grad-${i}`;
      const grad = defs
        .append("linearGradient")
        .attr("id", gid)
        .attr("x1", "0%")
        .attr("x2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", l.color).attr("stop-opacity", 0.18);
      grad.append("stop").attr("offset", "100%").attr("stop-color", l.color).attr("stop-opacity", 0.04);
    });

    // flow connecting lines between bars
    layers.forEach((l, i) => {
      if (i === 0) return;
      const prevW = Math.max(40, ((layers[i - 1].value / maxVal) * (W - paddingLeft - paddingRight)));
      const curW = Math.max(40, ((l.value / maxVal) * (W - paddingLeft - paddingRight)));
      const y1 = paddingTop + (i - 1) * (barH + gap) + barH;
      const y2 = paddingTop + i * (barH + gap);
      const midY = (y1 + y2) / 2;

      // trapezoid connector
      const path = `M ${paddingLeft} ${y1}
        L ${paddingLeft + prevW} ${y1}
        Q ${paddingLeft + prevW} ${midY} ${paddingLeft + curW} ${y2}
        L ${paddingLeft} ${y2}
        Z`;

      root
        .append("path")
        .attr("d", path)
        .attr("fill", l.color)
        .attr("opacity", 0)
        .attr("class", `ag-conn ag-conn-${i}`)
        .transition()
        .delay(i * 220 + 100)
        .duration(400)
        .attr("opacity", 0.055);

      // "disappeared" annotation line at right edge of gap
      const gapX = paddingLeft + curW + (prevW - curW) / 2 + 4;
      root
        .append("line")
        .attr("x1", gapX)
        .attr("x2", gapX + 20)
        .attr("y1", midY)
        .attr("y2", midY)
        .attr("stroke", AMBER)
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .attr("stroke-dasharray", "3,3")
        .transition()
        .delay(i * 220 + 300)
        .duration(300)
        .attr("opacity", 0.5);

      const hidden = layers[i - 1].value - l.value;
      if (hidden > 0 && gapX + 24 < W - 20) {
        root
          .append("text")
          .attr("x", gapX + 24)
          .attr("y", midY + 4)
          .attr("fill", AMBER)
          .attr("font-size", 9)
          .attr("font-family", "monospace")
          .attr("opacity", 0)
          .text(`-${hidden.toLocaleString()} hidden`)
          .transition()
          .delay(i * 220 + 400)
          .duration(300)
          .attr("opacity", 0.7);
      }
    });

    // bars
    layers.forEach((l, i) => {
      const barW = Math.max(40, ((l.value / maxVal) * (W - paddingLeft - paddingRight)));
      const y = paddingTop + i * (barH + gap);
      const isActive = active === i;
      const isLast = i === layers.length - 1;

      const g = root.append("g").attr("class", `ag-bar ag-bar-${i}`).style("cursor", "pointer");

      // bar background
      g.append("rect")
        .attr("x", paddingLeft)
        .attr("y", y)
        .attr("width", 0)
        .attr("height", barH)
        .attr("rx", 4)
        .attr("fill", `url(#ag-grad-${i})`)
        .attr("stroke", l.color)
        .attr("stroke-width", isLast ? 2 : 1.5)
        .attr("stroke-opacity", isLast ? 1 : 0.55)
        .style("filter", isLast ? "url(#ag-glow)" : "none")
        .transition()
        .delay(i * 220)
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("width", barW);

      // label — place outside bar if bar too narrow for text
      const labelOutside = barW < 260;
      g.append("text")
        .attr("x", labelOutside ? paddingLeft + barW + 10 : paddingLeft + 10)
        .attr("y", y + barH / 2 + 1)
        .attr("dominant-baseline", "middle")
        .attr("fill", isLast ? l.color : "var(--foreground)")
        .attr("font-size", isLast ? 11 : 10)
        .attr("font-family", "monospace")
        .attr("font-weight", isLast ? "bold" : "normal")
        .attr("opacity", 0)
        .text(l.label)
        .transition()
        .delay(i * 220 + 200)
        .duration(400)
        .attr("opacity", 1);

      // value badge — inside bar if wide enough, else inside at right edge
      const valueX = labelOutside ? paddingLeft + barW / 2 : paddingLeft + barW - 8;
      const valueAnchor = labelOutside ? "middle" : "end";
      g.append("text")
        .attr("x", valueX)
        .attr("y", y + barH / 2 + 1)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", valueAnchor)
        .attr("fill", l.color)
        .attr("font-size", isLast ? 16 : 13)
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(l.value.toLocaleString())
        .transition()
        .delay(i * 220 + 300)
        .duration(400)
        .attr("opacity", 1);

      // hit target (transparent overlay for hover)
      g.append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", W)
        .attr("height", barH)
        .attr("fill", "transparent")
        .on("mouseenter", () => onHover(i))
        .on("mouseleave", () => onHover(null))
        .on("touchstart", () => onHover(i))
        .on("touchend", () => onHover(null));

      // active highlight ring
      if (isActive) {
        g.append("rect")
          .attr("x", paddingLeft - 2)
          .attr("y", y - 2)
          .attr("width", barW + 4)
          .attr("height", barH + 4)
          .attr("rx", 5)
          .attr("fill", "none")
          .attr("stroke", l.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,3")
          .attr("opacity", 0.8);
      }
    });
  }, [layers, active, onHover]);

  useEffect(() => {
    if (inView && !animated) {
      setAnimated(true);
    }
  }, [inView, animated]);

  useEffect(() => {
    if (animated) draw();
    // also redraw on resize
    const ro = new ResizeObserver(() => draw());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [animated, draw]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full overflow-visible" />
    </div>
  );
}

// ─── pulse gap bar ─────────────────────────────────────────────────────────────
function GapBar({ verified, admitted, color }: { verified: number; admitted: number; color: string }) {
  const pct = verified > 0 ? (admitted / verified) * 100 : 0;
  return (
    <div className="relative h-5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}22` }}>
      {/* admitted portion */}
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: THREAT, boxShadow: `0 0 8px ${THREAT}88` }}
      />
      {/* hidden portion pulse */}
      <motion.div
        className="absolute top-0 h-full rounded-r-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.55, 0.2, 0.55, 0.2, 0.55] }}
        viewport={{ once: true }}
        transition={{ delay: 1.3, duration: 2.4, ease: "easeInOut" }}
        style={{
          left: `${pct}%`,
          right: 0,
          background: `linear-gradient(90deg, ${AMBER}44, ${AMBER}18)`,
          border: `1px dashed ${AMBER}66`,
        }}
      />
      {/* label */}
      <span className="absolute right-2 top-0 bottom-0 flex items-center font-mono text-[9px] text-amber-400 opacity-80">
        {(100 - pct).toFixed(0)}% HIDDEN
      </span>
    </div>
  );
}

// ─── discrepancy card ─────────────────────────────────────────────────────────
function DiscrepancyCard({
  d,
  i,
}: {
  d: AdmissionGapData["discrepancies"][number];
  i: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg border border-threat/25 bg-black/35 p-4 backdrop-blur-sm"
      style={{ boxShadow: "inset 0 0 20px rgba(255,77,94,0.04)" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="shrink-0 rounded px-2 py-0.5 font-mono text-xs font-bold"
          style={{ background: `${THREAT}22`, color: THREAT, border: `1px solid ${THREAT}44` }}
        >
          {d.ratio}
        </div>
        <p className="font-mono text-[10px] tracking-wider text-muted-2 uppercase pt-0.5">
          Discrepancy Factor
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <div className="rounded p-2" style={{ background: `${THREAT}12`, border: `1px solid ${THREAT}30` }}>
          <p className="font-mono text-[8px] tracking-[0.2em] text-muted-2 mb-1">IDF CLAIMS</p>
          <p className="font-mono text-xs text-threat">{d.claimed}</p>
        </div>
        <div className="rounded p-2" style={{ background: `${MINT}08`, border: `1px solid ${MINT}25` }}>
          <p className="font-mono text-[8px] tracking-[0.2em] text-muted-2 mb-1">VERIFIED REALITY</p>
          <p className="font-mono text-xs" style={{ color: MINT }}>{d.actual}</p>
        </div>
      </div>
      <p className="text-[11px] text-muted leading-relaxed">{d.evidence}</p>
    </motion.div>
  );
}

// ─── BBC cross-reference panel ────────────────────────────────────────────────
function BBCPanel({ bbc }: { bbc: AdmissionGapData["bbcVerified"] }) {
  const stats = [
    { label: "FPV Strikes Claimed (Telegram)", value: bbc.totalClaimed, color: VIOLET, suffix: "+" },
    { label: "BBC Independently Geolocated", value: bbc.geolocated, color: BLUE },
    { label: "IDF Officially Admitted Dead", value: bbc.idfAdmitted, color: THREAT },
    { label: "Lebanon Health Min. Killed", value: bbc.lebaHealthMinistry, color: MINT },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-borderc bg-black/30 p-5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest"
          style={{ background: `${BLUE}22`, color: BLUE, border: `1px solid ${BLUE}44` }}
        >
          BBC VERIFY
        </div>
        <p className="font-mono text-[9px] tracking-[0.18em] text-muted-2">
          INDEPENDENT GEOLOCATED CROSS-REFERENCE · MAY 2026
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg p-3 text-center"
            style={{
              background: `${s.color}0a`,
              border: `1px solid ${s.color}35`,
              boxShadow: `0 0 12px ${s.color}15`,
            }}
          >
            <Counter
              to={s.value}
              delay={i * 0.12}
              suffix={s.suffix}
              className="block font-mono text-xl font-bold"
              style={{ color: s.color } as React.CSSProperties}
            />
            <p className="font-mono text-[8px] tracking-[0.15em] text-muted-2 uppercase mt-1 leading-snug">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* The key ratio: 35 geolocated, 21 admitted */}
      <div className="rounded-lg p-4 text-center" style={{ background: "rgba(255,77,94,0.06)", border: "1px solid rgba(255,77,94,0.2)" }}>
        <p className="font-mono text-[9px] tracking-[0.25em] text-muted-2 mb-1">
          BBC GEOLOCATED HITS vs IDF ADMITTED DEAD
        </p>
        <div className="flex items-baseline justify-center gap-3 mb-2">
          <span className="font-mono text-4xl font-bold" style={{ color: BLUE }}>35</span>
          <span className="font-mono text-muted-2 text-lg">vs</span>
          <span className="font-mono text-4xl font-bold" style={{ color: THREAT }}>21</span>
        </div>
        <p className="font-mono text-xs text-muted max-w-lg mx-auto leading-relaxed">
          BBC verified <span style={{ color: BLUE }}>35 FPV strikes</span> — each hitting armoured vehicles or soldiers.
          IDF admits only <span style={{ color: THREAT }}>21 dead</span> in the entire Lebanon theatre.
          {" "}<span style={{ color: AMBER }}>Mathematically impossible</span> unless each strike killed 0.6 soldiers.
        </p>
        <GapBar verified={35} admitted={21} color={THREAT} />
      </div>
    </motion.div>
  );
}

// ─── Gaza discrepancy panel ───────────────────────────────────────────────────
function GazaPanel({ gaza }: { gaza: AdmissionGapData["gazaDiscrepancy"] }) {
  const ratio = (gaza.bereavedFamilies / Math.max(1, gaza.officialKIA)).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-borderc bg-black/30 p-5 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest"
          style={{ background: `${AMBER}22`, color: AMBER, border: `1px solid ${AMBER}44` }}
        >
          GAZA PROOF
        </div>
        <p className="font-mono text-[9px] tracking-[0.18em] text-muted-2">
          BEREAVED FAMILIES REGISTRY vs OFFICIAL KIA COUNT
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg p-4 text-center" style={{ background: `${THREAT}0a`, border: `1px solid ${THREAT}30` }}>
          <p className="font-mono text-[8px] tracking-[0.2em] text-muted-2 mb-2">IDF OFFICIAL KIA</p>
          <Counter
            to={gaza.officialKIA}
            className="block font-mono text-3xl font-bold"
            style={{ color: THREAT } as React.CSSProperties}
          />
          <p className="font-mono text-[8px] text-muted-2 mt-1">gov.il announcement</p>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background: `${MINT}08`, border: `1px solid ${MINT}28` }}>
          <p className="font-mono text-[8px] tracking-[0.2em] text-muted-2 mb-2">BEREAVED FAMILIES REG.</p>
          <Counter
            to={gaza.bereavedFamilies}
            className="block font-mono text-3xl font-bold"
            style={{ color: MINT } as React.CSSProperties}
          />
          <p className="font-mono text-[8px] text-muted-2 mt-1">Army Chief Zamir admission</p>
        </div>
      </div>

      {/* ratio callout */}
      <div className="rounded-lg p-3 mb-3 text-center" style={{ background: `${AMBER}0a`, border: `1px solid ${AMBER}30` }}>
        <p className="font-mono text-[8px] tracking-[0.25em] text-muted-2 mb-0.5">DISCREPANCY FACTOR</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="font-mono text-5xl font-bold glow-archive" style={{ color: AMBER }}>
            {ratio}×
          </span>
        </div>
        <p className="font-mono text-[9px] text-muted mt-1">
          {gaza.bereavedFamilies.toLocaleString()} families registered vs {gaza.officialKIA.toLocaleString()} admitted
        </p>
      </div>

      <GapBar verified={gaza.bereavedFamilies} admitted={gaza.officialKIA} color={MINT} />

      <p className="mt-3 text-[11px] text-muted leading-relaxed italic border-l-2 border-archive/40 pl-3">
        &ldquo;{gaza.hospitalRecords}&rdquo;
      </p>
    </motion.div>
  );
}

// ─── tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ layer }: { layer: AdmissionGapData["layers"][number] | null }) {
  if (!layer) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.18 }}
      className="rounded-lg p-3 max-w-xs pointer-events-none"
      style={{
        background: "rgba(10,12,16,0.92)",
        border: `1px solid ${layer.color}55`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${layer.color}22`,
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="font-mono text-[9px] tracking-[0.2em] mb-1" style={{ color: layer.color }}>
        DATA POINT
      </p>
      <p className="font-mono text-xs text-foreground font-semibold mb-1">{layer.label}</p>
      <p className="font-mono text-xl font-bold mb-2" style={{ color: layer.color }}>
        {layer.value.toLocaleString()}
      </p>
      <p className="font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {layer.source}
      </p>
    </motion.div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export function AdmissionGap({ data }: { data: AdmissionGapData }) {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const firstVal = data.layers[0]?.value ?? 1;
  const lastVal = data.layers[data.layers.length - 1]?.value ?? 1;
  const overallRatio = (firstVal / Math.max(1, lastVal)).toFixed(1);

  const activeLayer = activeBar !== null ? data.layers[activeBar] ?? null : null;

  return (
    <div ref={topRef} className="space-y-6">
      {/* ── header ── */}
      <div className="text-center">
        <p className="font-mono text-[9px] tracking-[0.28em] text-muted-2">
          MULTI-SOURCE CROSS-VERIFICATION: WHERE DO THE NUMBERS GO?
        </p>
        <p className="text-xs text-muted mt-1 max-w-xl mx-auto">
          Five independent data layers. Each confirms the same thing: the IDF systematically
          under-reports losses by a factor of{" "}
          <span className="font-mono font-bold" style={{ color: THREAT }}>
            {overallRatio}×
          </span>{" "}
          or more.
        </p>
      </div>

      {/* ── big discrepancy factor ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-threat/30 bg-black/40 p-5 text-center backdrop-blur-sm"
        style={{ boxShadow: `0 0 40px rgba(255,77,94,0.08), inset 0 0 30px rgba(255,77,94,0.04)` }}
      >
        <p className="font-mono text-[9px] tracking-[0.3em] text-muted-2 mb-1">
          OVERALL DISCREPANCY FACTOR
        </p>
        <p className="font-mono text-6xl md:text-7xl font-bold glow-threat" style={{ color: THREAT }}>
          {overallRatio}×
        </p>
        <p className="font-mono text-xs text-muted mt-2">
          documented strikes ÷ official admission
        </p>
      </motion.div>

      {/* ── waterfall chart + tooltip ── */}
      <div className="relative">
        <div
          className="rounded-xl p-4 backdrop-blur-sm"
          style={{
            background: "rgba(10,12,16,0.55)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.3)",
          }}
        >
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 mb-3">
            FUNNEL: REALITY → PROPAGANDA
          </p>
          <WaterfallChart
            layers={data.layers}
            active={activeBar}
            onHover={setActiveBar}
          />
        </div>

        {/* floating tooltip */}
        {activeLayer && (
          <div className="absolute top-4 right-4 z-20">
            <Tooltip layer={activeLayer} />
          </div>
        )}
      </div>

      {/* ── layer source legend ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {data.layers.map((l, i) => (
          <motion.div
            key={l.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex items-start gap-2 rounded-md p-2"
            style={{ background: `${l.color}08`, border: `1px solid ${l.color}20` }}
          >
            <div
              className="mt-0.5 shrink-0 w-2 h-2 rounded-full"
              style={{ background: l.color, boxShadow: `0 0 6px ${l.color}88` }}
            />
            <div>
              <p className="font-mono text-[9px] text-foreground leading-snug">{l.label}</p>
              <p className="font-mono text-[8px] text-muted-2 mt-0.5">{l.source}</p>
            </div>
            <span className="ml-auto font-mono text-xs font-bold shrink-0" style={{ color: l.color }}>
              {l.value.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── BBC Verify + Gaza panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BBCPanel bbc={data.bbcVerified} />
        <GazaPanel gaza={data.gazaDiscrepancy} />
      </div>

      {/* ── discrepancy cards ── */}
      <div>
        <p className="font-mono text-[9px] tracking-[0.25em] text-muted-2 mb-3">
          KEY DISCREPANCIES — CLAIM vs VERIFIED REALITY
        </p>
        <div className="space-y-3">
          {data.discrepancies.map((d, i) => (
            <DiscrepancyCard key={i} d={d} i={i} />
          ))}
        </div>
      </div>

      {/* ── verdict ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-xl border border-threat/35 bg-black/45 p-5 text-center backdrop-blur-sm"
        style={{ boxShadow: `0 0 50px rgba(255,77,94,0.07)` }}
      >
        <p className="font-mono text-[9px] tracking-[0.3em] text-muted-2 mb-2">VERDICT</p>
        <p className="font-mono text-sm md:text-base text-foreground leading-relaxed max-w-2xl mx-auto">
          The IDF does not lose soldiers. They{" "}
          <span className="font-bold" style={{ color: THREAT }}>
            disappear them
          </span>{" "}
          — from press releases, from official counts, from history. The gap between{" "}
          <span style={{ color: MINT }}>BBC-geolocated strikes</span> and{" "}
          <span style={{ color: THREAT }}>official admissions</span> is not a rounding error.
          It is a{" "}
          <span className="font-bold" style={{ color: AMBER }}>
            systematic propaganda operation
          </span>
          .
        </p>
      </motion.div>

      <p className="font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
