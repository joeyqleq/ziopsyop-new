"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { motion, useInView } from "framer-motion";

interface DestructionData {
  totalStructuresDestroyed: number;
  villages: {
    name: string;
    totalStructures: number;
    destroyed: number;
    percentDestroyed: number;
    method: string;
    duringCeasefire: boolean;
  }[];
  verifiedVideos: number;
  timespan: string;
  source: string;
}

const ROSE = "#f43f5e";
const AMBER = "#f59e0b";
const CYAN = "#22d3ee";
const GRAY_BAR = "rgba(255,255,255,0.08)";

export function DestructionAudit({ data }: { data: DestructionData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartWrapRef, { once: true, margin: "-60px" });
  const [drawn, setDrawn] = useState(false);

  const sorted = [...data.villages].sort((a, b) => b.percentDestroyed - a.percentDestroyed);
  const villagesOver70 = sorted.filter((v) => v.percentDestroyed >= 70).length;

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const container = chartWrapRef.current;
    if (!svg || !container) return;

    const W = container.clientWidth || 600;
    const isMobile = W < 500;
    const rowH = isMobile ? 40 : 48;
    const gap = isMobile ? 4 : 6;
    const marginLeft = isMobile ? 80 : 130;
    const marginRight = isMobile ? 40 : 60;
    const marginTop = 8;
    const H = sorted.length * (rowH + gap) + marginTop + 16;
    const barWidth = W - marginLeft - marginRight;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(H));

    const root = d3.select(svg);

    const xScale = d3.scaleLinear().domain([0, d3.max(sorted, (d) => d.totalStructures) ?? 1]).range([0, barWidth]);

    sorted.forEach((village, i) => {
      const y = marginTop + i * (rowH + gap);
      const g = root.append("g");

      // village name label
      const nameLabel = isMobile && village.name.length > 10
        ? village.name.slice(0, 9) + "…"
        : village.name;
      g.append("text")
        .attr("x", marginLeft - 8)
        .attr("y", y + rowH / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#d1d5db")
        .attr("font-size", isMobile ? 9 : 11)
        .attr("font-family", "monospace")
        .text(nameLabel);

      // ceasefire badge (below label on mobile, inline on desktop)
      if (village.duringCeasefire) {
        const badgeW = isMobile ? 44 : 62;
        const badgeX = isMobile
          ? marginLeft - 8 - nameLabel.length * 5.5 - badgeW - 4
          : marginLeft - 10 - village.name.length * 6.5 - 70;
        const clampedBadgeX = Math.max(2, badgeX);

        g.append("rect")
          .attr("x", clampedBadgeX)
          .attr("y", y + rowH / 2 - 8)
          .attr("width", badgeW)
          .attr("height", 16)
          .attr("rx", 3)
          .attr("fill", `${AMBER}22`)
          .attr("stroke", AMBER)
          .attr("stroke-width", 0.8)
          .attr("stroke-opacity", 0.6);

        g.append("text")
          .attr("x", clampedBadgeX + badgeW / 2)
          .attr("y", y + rowH / 2 + 1)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", AMBER)
          .attr("font-size", isMobile ? 7 : 8)
          .attr("font-family", "monospace")
          .attr("font-weight", "bold")
          .text(isMobile ? "C/F" : "CEASEFIRE");
      }

      // total structures bar (gray background)
      const totalW = xScale(village.totalStructures);
      g.append("rect")
        .attr("x", marginLeft)
        .attr("y", y + 8)
        .attr("width", totalW)
        .attr("height", rowH - 16)
        .attr("rx", 3)
        .attr("fill", GRAY_BAR);

      // destroyed portion bar (rose)
      const destroyedW = xScale(village.destroyed);
      g.append("rect")
        .attr("x", marginLeft)
        .attr("y", y + 8)
        .attr("width", 0)
        .attr("height", rowH - 16)
        .attr("rx", 3)
        .attr("fill", ROSE)
        .attr("opacity", 0.75)
        .transition()
        .delay(i * 120 + 200)
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr("width", destroyedW);

      // percentage label at end of destroyed bar
      g.append("text")
        .attr("x", marginLeft + destroyedW + 8)
        .attr("y", y + rowH / 2)
        .attr("dominant-baseline", "middle")
        .attr("fill", ROSE)
        .attr("font-size", 12)
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("opacity", 0)
        .text(`${village.percentDestroyed}%`)
        .transition()
        .delay(i * 120 + 600)
        .duration(400)
        .attr("opacity", 1);

      // method label (small text below bar)
      g.append("text")
        .attr("x", marginLeft)
        .attr("y", y + rowH - 4)
        .attr("fill", "#6b7280")
        .attr("font-size", 9)
        .attr("font-family", "monospace")
        .attr("opacity", 0)
        .text(village.method)
        .transition()
        .delay(i * 120 + 700)
        .duration(300)
        .attr("opacity", 0.7);
    });
  }, [sorted]);

  useEffect(() => {
    if (inView && !drawn) setDrawn(true);
  }, [inView, drawn]);

  useEffect(() => {
    if (!drawn) return;
    draw();
    const ro = new ResizeObserver(() => draw());
    if (chartWrapRef.current) ro.observe(chartWrapRef.current);
    return () => ro.disconnect();
  }, [drawn, draw]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <p className="font-mono text-[9px] tracking-[0.3em] text-gray-500 mb-1">
          SATELLITE FORENSICS
        </p>
        <h2 className="font-mono text-lg md:text-xl font-bold text-gray-300 tracking-wide">
          EX-32 &middot; NOWHERE TO RETURN
        </h2>
        <p className="text-xs text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Amnesty International satellite verification of systematic village destruction across
          southern Lebanon &mdash; {data.timespan}
        </p>
      </motion.div>

      {/* Key stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {[
          {
            value: `${(data.totalStructuresDestroyed / 1000).toFixed(0)},000+`,
            label: "STRUCTURES",
            color: ROSE,
          },
          {
            value: String(data.verifiedVideos),
            label: "VERIFIED SOLDIER VIDEOS",
            color: CYAN,
          },
          {
            value: `${villagesOver70} villages`,
            label: ">70% RAZED",
            color: AMBER,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg p-3 text-center"
            style={{
              background: `${stat.color}0a`,
              border: `1px solid ${stat.color}30`,
            }}
          >
            <p className="font-mono text-xl md:text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="font-mono text-[8px] tracking-[0.18em] text-gray-500 uppercase mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <div
        ref={chartWrapRef}
        className="w-full rounded-xl p-4"
        style={{
          background: "rgba(10,12,16,0.5)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <svg ref={svgRef} className="w-full overflow-visible" />
      </div>

      {/* Footnote */}
      <p className="font-mono text-[9px] tracking-[0.12em] text-gray-500">
        SOURCE: {data.source} &middot; Amnesty International MDE 18/9552/2025
      </p>
    </div>
  );
}
