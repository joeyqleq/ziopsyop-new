"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
} from "react";
import * as d3 from "d3";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

// ─── colour tokens ─────────────────────────────────────────────────────────────
const MINT = "#3ee6c1";
const BLUE = "#4ea8ff";
const AMBER = "#eab308";
const THREAT = "#ff4d5e";
const DIM_RED = "rgba(255,77,94,0.45)";

// ─── data interface ────────────────────────────────────────────────────────────
export interface CostROIData {
  weapons: {
    name: string;
    unitCost: number;
    confirmedKills: number;
    avgTargetValue: number;
    totalValueDestroyed: number;
    roi: number;
    fiberOptic: boolean;
  }[];
  source: string;
}

// ─── animated counter ──────────────────────────────────────────────────────────
function Counter({
  to,
  duration = 1.4,
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

// ─── tooltip component ────────────────────────────────────────────────────────
function WeaponTooltip({
  weapon,
  x,
  y,
}: {
  weapon: CostROIData["weapons"][number] | null;
  x: number;
  y: number;
}) {
  if (!weapon) return null;
  const color = weapon.fiberOptic ? MINT : BLUE;

  return (
    <motion.div
      key={weapon.name}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.16 }}
      className="pointer-events-none fixed z-50 max-w-[230px] rounded-lg p-3"
      style={{
        left: x + 14,
        top: y - 10,
        background: "rgba(8,10,14,0.95)",
        border: `1px solid ${color}55`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 18px ${color}22`,
        backdropFilter: "blur(14px)",
      }}
    >
      <p
        className="font-mono text-[9px] tracking-[0.22em] mb-1 uppercase"
        style={{ color }}
      >
        {weapon.fiberOptic ? "FIBER-OPTIC GUIDED" : "STANDARD"}
      </p>
      <p className="font-mono text-xs text-white font-semibold mb-2 leading-snug">
        {weapon.name}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-3">
          <span className="font-mono text-[9px] text-white/50">Unit Cost</span>
          <span className="font-mono text-[9px] text-white">
            ${weapon.unitCost.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="font-mono text-[9px] text-white/50">
            Confirmed Kills
          </span>
          <span className="font-mono text-[9px] text-white">
            {weapon.confirmedKills.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="font-mono text-[9px] text-white/50">
            Avg Target Value
          </span>
          <span className="font-mono text-[9px] text-white">
            ${weapon.avgTargetValue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="font-mono text-[9px] text-white/50">
            Value Destroyed
          </span>
          <span className="font-mono text-[9px] text-white">
            ${(weapon.totalValueDestroyed / 1_000_000).toFixed(1)}M
          </span>
        </div>
        <div
          className="mt-1.5 pt-1.5 flex justify-between gap-3"
          style={{ borderTop: `1px solid ${color}30` }}
        >
          <span className="font-mono text-[9px] text-white/50">ROI</span>
          <span className="font-mono text-xs font-bold" style={{ color }}>
            {weapon.roi.toLocaleString()}:1
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── D3 scatter plot ──────────────────────────────────────────────────────────
function ScatterPlot({
  weapons,
  onHover,
}: {
  weapons: CostROIData["weapons"];
  onHover: (
    w: CostROIData["weapons"][number] | null,
    x: number,
    y: number
  ) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });
  const [animated, setAnimated] = useState(false);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const W = container.clientWidth || 700;
    const H = Math.max(340, W * 0.52);
    const margin = { top: 28, right: 32, bottom: 52, left: 68 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(H));

    const root = d3.select(svg);

    // ── defs: glow filters + gradients ──
    const defs = root.append("defs");

    const glowMint = defs
      .append("filter")
      .attr("id", "roi-glow-mint")
      .attr("x", "-60%")
      .attr("y", "-60%")
      .attr("width", "220%")
      .attr("height", "220%");
    glowMint
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
    glowMint
      .append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    const glowBlue = defs
      .append("filter")
      .attr("id", "roi-glow-blue")
      .attr("x", "-60%")
      .attr("y", "-60%")
      .attr("width", "220%")
      .attr("height", "220%");
    glowBlue
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
    glowBlue
      .append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // ── scales ──
    const xScale = d3
      .scaleLog()
      .domain([180, 35000])
      .range([0, innerW])
      .clamp(true);

    const allROIs = weapons.map((w) => w.roi);
    const yScale = d3
      .scaleLog()
      .domain([
        Math.max(0.5, d3.min(allROIs)! * 0.6),
        d3.max(allROIs)! * 2.5,
      ])
      .range([innerH, 0])
      .clamp(true);

    const allKills = weapons.map((w) => w.confirmedKills);
    const rScale = d3
      .scaleSqrt()
      .domain([0, d3.max(allKills)!])
      .range([6, 36]);

    // ── chart group ──
    const g = root
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── subtle grid lines ──
    const yTicks = yScale.ticks(5);
    g.selectAll(".grid-y")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-y")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-width", 1);

    const xTicks = xScale.ticks(5);
    g.selectAll(".grid-x")
      .data(xTicks)
      .enter()
      .append("line")
      .attr("class", "grid-x")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerH)
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-width", 1);

    // ── break-even line at ROI = 1 ──
    const breakEvenY = yScale(1);
    if (breakEvenY >= 0 && breakEvenY <= innerH) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", breakEvenY)
        .attr("y2", breakEvenY)
        .attr("stroke", DIM_RED)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "6,4")
        .attr("opacity", 0.7);

      g.append("text")
        .attr("x", innerW - 4)
        .attr("y", breakEvenY - 5)
        .attr("text-anchor", "end")
        .attr("fill", THREAT)
        .attr("font-size", 8)
        .attr("font-family", "monospace")
        .attr("opacity", 0.7)
        .text("BREAK-EVEN (ROI = 1)");
    }

    // ── X axis ──
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([200, 500, 1000, 5000, 10000, 30000])
      .tickFormat((d) => {
        const v = +d;
        if (v >= 1000) return `$${v / 1000}k`;
        return `$${v}`;
      });

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .call((ax) => {
        ax.select(".domain").attr("stroke", "rgba(255,255,255,0.15)");
        ax.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.15)");
        ax.selectAll(".tick text")
          .attr("fill", "rgba(255,255,255,0.45)")
          .attr("font-size", 9)
          .attr("font-family", "monospace");
      });

    g.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 42)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.35)")
      .attr("font-size", 9)
      .attr("font-family", "monospace")
      .attr("letter-spacing", "0.18em")
      .text("UNIT COST (USD · LOG SCALE)");

    // ── Y axis ──
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        const v = +d;
        if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
        return String(Math.round(v));
      });

    g.append("g")
      .call(yAxis)
      .call((ax) => {
        ax.select(".domain").attr("stroke", "rgba(255,255,255,0.15)");
        ax.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.15)");
        ax.selectAll(".tick text")
          .attr("fill", "rgba(255,255,255,0.45)")
          .attr("font-size", 9)
          .attr("font-family", "monospace");
      });

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -52)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.35)")
      .attr("font-size", 9)
      .attr("font-family", "monospace")
      .attr("letter-spacing", "0.18em")
      .text("VALUE DESTROYED PER $ SPENT (LOG)");

    // ── bubbles ──
    const bubbleGs = g
      .selectAll(".bubble-g")
      .data(weapons)
      .enter()
      .append("g")
      .attr("class", "bubble-g")
      .attr("transform", (d) => `translate(${xScale(d.unitCost)},${yScale(d.roi)})`)
      .style("cursor", "pointer");

    // outer glow ring (fiber-optic only)
    bubbleGs
      .filter((d) => d.fiberOptic)
      .append("circle")
      .attr("r", 0)
      .attr("fill", "none")
      .attr("stroke", MINT)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.3)
      .attr("stroke-dasharray", "3,3")
      .transition()
      .delay((_, i) => i * 120 + 200)
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr("r", (d) => rScale(d.confirmedKills) + 8);

    // main bubble
    bubbleGs
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => {
        const c = d.fiberOptic ? MINT : BLUE;
        return c;
      })
      .attr("fill-opacity", (d) => (d.fiberOptic ? 0.22 : 0.18))
      .attr("stroke", (d) => (d.fiberOptic ? MINT : BLUE))
      .attr("stroke-width", (d) => (d.fiberOptic ? 2 : 1.5))
      .attr("stroke-opacity", 0.85)
      .style("filter", (d) =>
        d.fiberOptic ? "url(#roi-glow-mint)" : "url(#roi-glow-blue)"
      )
      .transition()
      .delay((_, i) => i * 120)
      .duration(650)
      .ease(d3.easeBackOut.overshoot(1.4))
      .attr("r", (d) => rScale(d.confirmedKills));

    // label (for larger bubbles / FPV only)
    bubbleGs
      .filter((d) => rScale(d.confirmedKills) >= 12 || d.name.includes("FPV"))
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d) => (d.fiberOptic ? MINT : BLUE))
      .attr("font-size", 8)
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("opacity", 0)
      .text((d) => {
        const parts = d.name.split(" ");
        return parts.length > 2 ? parts.slice(0, 2).join(" ") : d.name;
      })
      .transition()
      .delay((_, i) => i * 120 + 500)
      .duration(400)
      .attr("opacity", 0.9);

    // hover targets
    bubbleGs
      .append("circle")
      .attr("r", (d) => rScale(d.confirmedKills) + 10)
      .attr("fill", "transparent")
      .on("mouseenter", function (event: MouseEvent, d: CostROIData["weapons"][number]) {
        onHover(d, event.clientX, event.clientY);
        d3.select(this.parentNode as SVGGElement)
          .select("circle:nth-child(2)")
          .transition()
          .duration(150)
          .attr("fill-opacity", 0.38)
          .attr("stroke-opacity", 1);
      })
      .on("mousemove", function (event: MouseEvent, d: CostROIData["weapons"][number]) {
        onHover(d, event.clientX, event.clientY);
      })
      .on("mouseleave", function (_event: MouseEvent, d: CostROIData["weapons"][number]) {
        onHover(null, 0, 0);
        d3.select(this.parentNode as SVGGElement)
          .select("circle:nth-child(2)")
          .transition()
          .duration(200)
          .attr("fill-opacity", d.fiberOptic ? 0.22 : 0.18)
          .attr("stroke-opacity", 0.85);
      });

    // ── annotation arrow for FPV Quadcopter ──
    const fpv = weapons.find(
      (w) => w.name.toLowerCase().includes("fpv") || w.unitCost <= 250
    );
    if (fpv) {
      const bx = xScale(fpv.unitCost);
      const by = yScale(fpv.roi);
      const r = rScale(fpv.confirmedKills);
      const arrowOffX = 42;
      const arrowOffY = -38;

      // line from bubble edge to label
      const lineX1 = bx + r * 0.6;
      const lineY1 = by + arrowOffY * 0.5;
      const lineX2 = bx + arrowOffX;
      const lineY2 = by + arrowOffY;

      g.append("line")
        .attr("x1", lineX1)
        .attr("y1", lineY1)
        .attr("x2", lineX2)
        .attr("y2", lineY2)
        .attr("stroke", AMBER)
        .attr("stroke-width", 1.2)
        .attr("opacity", 0)
        .attr("marker-end", "url(#roi-arrowhead)")
        .transition()
        .delay(weapons.length * 120 + 200)
        .duration(400)
        .attr("opacity", 0.85);

      // arrowhead marker
      const marker = defs
        .append("marker")
        .attr("id", "roi-arrowhead")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("refX", 6)
        .attr("refY", 3)
        .attr("orient", "auto");
      marker
        .append("path")
        .attr("d", "M0,0 L0,6 L8,3 z")
        .attr("fill", AMBER)
        .attr("opacity", 0.85);

      // annotation text box
      const labelX = lineX2 + 4;
      const labelY = lineY2 - 14;
      g.append("rect")
        .attr("x", labelX - 4)
        .attr("y", labelY - 2)
        .attr("width", 110)
        .attr("height", 32)
        .attr("rx", 3)
        .attr("fill", "rgba(234,179,8,0.08)")
        .attr("stroke", `${AMBER}44`)
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .delay(weapons.length * 120 + 300)
        .duration(400)
        .attr("opacity", 1);

      g.append("text")
        .attr("x", labelX + 2)
        .attr("y", labelY + 10)
        .attr("fill", AMBER)
        .attr("font-size", 9.5)
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text("\"The $200 Problem\"")
        .transition()
        .delay(weapons.length * 120 + 350)
        .duration(400)
        .attr("opacity", 1);

      g.append("text")
        .attr("x", labelX + 2)
        .attr("y", labelY + 24)
        .attr("fill", AMBER)
        .attr("font-size", 7.5)
        .attr("font-family", "monospace")
        .attr("opacity", 0)
        .text("impossible to intercept at scale")
        .transition()
        .delay(weapons.length * 120 + 420)
        .duration(400)
        .attr("opacity", 0.7);
    }
  }, [weapons, onHover]);

  useEffect(() => {
    if (inView && !animated) setAnimated(true);
  }, [inView, animated]);

  useEffect(() => {
    if (animated) draw();
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

// ─── legend ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-5 justify-center">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: `${MINT}30`,
            border: `1.5px solid ${MINT}`,
            boxShadow: `0 0 6px ${MINT}88`,
          }}
        />
        <span className="font-mono text-[9px] tracking-[0.15em] text-white/50">
          FIBER-OPTIC GUIDED
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: `${BLUE}25`,
            border: `1.5px solid ${BLUE}`,
          }}
        />
        <span className="font-mono text-[9px] tracking-[0.15em] text-white/50">
          STANDARD GUIDANCE
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-0.5 rounded" style={{ background: DIM_RED }} />
        <span className="font-mono text-[9px] tracking-[0.15em] text-white/50">
          BREAK-EVEN LINE (ROI = 1)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[4, 7, 10].map((r) => (
            <div
              key={r}
              className="rounded-full"
              style={{
                width: r * 2,
                height: r * 2,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
        <span className="font-mono text-[9px] tracking-[0.15em] text-white/50">
          BUBBLE SIZE = CONFIRMED KILLS
        </span>
      </div>
    </div>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────
export function CostROI({ data }: { data: CostROIData }) {
  const [hovered, setHovered] = useState<CostROIData["weapons"][number] | null>(
    null
  );
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const avgROI = Math.round(
    data.weapons.reduce((s, w) => s + w.roi, 0) / data.weapons.length
  );

  const handleHover = useCallback(
    (
      w: CostROIData["weapons"][number] | null,
      x: number,
      y: number
    ) => {
      setHovered(w);
      setTooltipPos({ x, y });
    },
    []
  );

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="text-center">
        <p className="font-mono text-[9px] tracking-[0.28em] text-white/35">
          UNIT COST vs VALUE DESTROYED PER DOLLAR · LOG-LOG SCALE
        </p>
        <p className="text-xs text-white/45 mt-1 max-w-xl mx-auto">
          Top-left = maximum asymmetry. Every dollar spent on a{" "}
          <span className="font-mono font-bold" style={{ color: MINT }}>
            fiber-optic drone
          </span>{" "}
          destroys orders of magnitude more than it costs.
        </p>
      </div>

      {/* scatter plot */}
      <div
        className="relative rounded-xl p-4"
        style={{
          background: "rgba(8,10,14,0.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "inset 0 0 50px rgba(0,0,0,0.35)",
        }}
      >
        <ScatterPlot weapons={data.weapons} onHover={handleHover} />
      </div>

      {/* legend */}
      <Legend />

      {/* floating tooltip */}
      <WeaponTooltip weapon={hovered} x={tooltipPos.x} y={tooltipPos.y} />

      {/* average ROI headline */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border p-5 text-center"
        style={{
          borderColor: `${MINT}30`,
          background: "rgba(62,230,193,0.04)",
          boxShadow: `0 0 40px rgba(62,230,193,0.06), inset 0 0 30px rgba(62,230,193,0.03)`,
        }}
      >
        <p className="font-mono text-[9px] tracking-[0.3em] text-white/35 mb-2">
          AVERAGE RETURN ON INVESTMENT ACROSS ALL WEAPON SYSTEMS
        </p>
        <Counter
          to={avgROI}
          suffix=":1"
          duration={2}
          delay={0.3}
          className="block font-mono text-5xl md:text-6xl font-bold"
          style={{ color: MINT, textShadow: `0 0 30px ${MINT}88` } as CSSProperties}
        />
        <p className="font-mono text-[10px] tracking-[0.18em] text-white/40 mt-2">
          AVERAGE ROI · VALUE DESTROYED ÷ WEAPON COST
        </p>
        <p className="mt-3 text-xs text-white/45 max-w-lg mx-auto leading-relaxed">
          For every $1 Hezbollah spends on these systems, an estimated{" "}
          <span className="font-mono font-bold" style={{ color: MINT }}>
            ${avgROI.toLocaleString()}
          </span>{" "}
          in Israeli military hardware, personnel, and strategic assets is destroyed
          or degraded. The break-even line is not a ceiling — it is a floor they
          cleared{" "}
          <span className="font-mono font-bold" style={{ color: AMBER }}>
            years ago
          </span>
          .
        </p>
      </motion.div>

      <p className="font-mono text-[9px] tracking-[0.12em] text-white/25">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
