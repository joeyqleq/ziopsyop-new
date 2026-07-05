"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

interface CensorshipData {
  years: { year: number; redacted: number; blocked: number; submitted: number }[];
  perDay2025: number;
  source: string;
}

const AMBER = "#f59e0b";
const ROSE = "#f43f5e";
const CYAN = "#22d3ee";

export function CensorshipScale({ data }: { data: CensorshipData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const W = container.clientWidth || 700;
    const H = 320;
    const margin = { top: 30, right: 24, bottom: 36, left: 48 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(H));

    const root = d3.select(svg);

    const x = d3.scaleLinear()
      .domain(d3.extent(data.years, (d) => d.year) as [number, number])
      .range([0, innerW]);

    const maxY = d3.max(data.years, (d) => d.redacted + d.blocked) ?? 1;
    const y = d3.scaleLinear().domain([0, maxY * 1.1]).range([innerH, 0]);

    const g = root.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // defs
    const defs = root.append("defs");
    const gradAmber = defs.append("linearGradient").attr("id", "cs-grad-amber").attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1");
    gradAmber.append("stop").attr("offset", "0%").attr("stop-color", AMBER).attr("stop-opacity", 0.6);
    gradAmber.append("stop").attr("offset", "100%").attr("stop-color", AMBER).attr("stop-opacity", 0.05);

    const gradRose = defs.append("linearGradient").attr("id", "cs-grad-rose").attr("x1", "0").attr("y1", "0").attr("x2", "0").attr("y2", "1");
    gradRose.append("stop").attr("offset", "0%").attr("stop-color", ROSE).attr("stop-opacity", 0.6);
    gradRose.append("stop").attr("offset", "100%").attr("stop-color", ROSE).attr("stop-opacity", 0.05);

    // WAR zone highlight (2024-2025)
    const warX1 = x(2024);
    const warX2 = x(d3.max(data.years, (d) => d.year) as number);
    g.append("rect")
      .attr("x", warX1)
      .attr("y", 0)
      .attr("width", warX2 - warX1)
      .attr("height", innerH)
      .attr("fill", ROSE)
      .attr("opacity", 0.06)
      .attr("rx", 4);

    g.append("text")
      .attr("x", (warX1 + warX2) / 2)
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("fill", ROSE)
      .attr("font-size", 11)
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("opacity", 0.7)
      .text("WAR");

    // Oct 7 vertical line at 2023.75
    const oct7X = x(2023.75);
    g.append("line")
      .attr("x1", oct7X)
      .attr("x2", oct7X)
      .attr("y1", 0)
      .attr("y2", innerH)
      .attr("stroke", CYAN)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,3")
      .attr("opacity", 0.7);

    g.append("text")
      .attr("x", oct7X - 4)
      .attr("y", -6)
      .attr("text-anchor", "end")
      .attr("fill", CYAN)
      .attr("font-size", 9)
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .text("Oct 7");

    // stacked area
    const stack = d3.stack<(typeof data.years)[number]>()
      .keys(["redacted", "blocked"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(data.years);

    const area = d3.area<d3.SeriesPoint<(typeof data.years)[number]>>()
      .x((d) => x(d.data.year))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    const colors = [AMBER, ROSE];
    const fills = ["url(#cs-grad-amber)", "url(#cs-grad-rose)"];

    series.forEach((s, i) => {
      g.append("path")
        .datum(s)
        .attr("d", area)
        .attr("fill", fills[i])
        .attr("stroke", colors[i])
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .transition()
        .delay(i * 200)
        .duration(800)
        .attr("opacity", 1);
    });

    // axes
    const xAxis = d3.axisBottom(x)
      .tickValues(data.years.filter((_, i) => i % 2 === 0).map((d) => d.year))
      .tickFormat(d3.format("d"));
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .attr("font-size", 9)
      .attr("font-family", "monospace");
    g.selectAll(".domain").attr("stroke", "#374151");
    g.selectAll(".tick line").attr("stroke", "#374151");

    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format(","));
    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .attr("font-size", 9)
      .attr("font-family", "monospace");

    // "15/day" badge near 2025
    const lastYear = data.years[data.years.length - 1];
    if (lastYear) {
      const badgeX = x(lastYear.year) + 4;
      const badgeY = y(lastYear.redacted + lastYear.blocked) - 12;

      const badge = g.append("g").attr("transform", `translate(${badgeX},${badgeY})`);
      badge.append("rect")
        .attr("x", -4)
        .attr("y", -12)
        .attr("width", 52)
        .attr("height", 18)
        .attr("rx", 3)
        .attr("fill", "#0f172a")
        .attr("stroke", CYAN)
        .attr("stroke-width", 1);
      badge.append("text")
        .attr("x", 22)
        .attr("y", 1)
        .attr("text-anchor", "middle")
        .attr("fill", CYAN)
        .attr("font-size", 10)
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .text(`${data.perDay2025}/day`);
    }
  }, [data]);

  useEffect(() => {
    if (!drawn) return;
    draw();
    const ro = new ResizeObserver(() => draw());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [drawn, draw]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[9px] tracking-[0.28em] text-muted-2 mb-1">
          EX-31 &middot; THE CENSOR&rsquo;S SPIKE
        </p>
        <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
          Israeli military censorship items submitted, redacted, and fully blocked per year.
          Data obtained via FOIA by +972 Magazine reveals a wartime spike unprecedented in
          the censor&rsquo;s recorded history.
        </p>
      </motion.div>

      <motion.div
        ref={containerRef}
        className="w-full rounded-xl border border-white/[0.07] bg-black/30 p-4 backdrop-blur-sm"
        style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.3)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        onViewportEnter={() => setDrawn(true)}
        transition={{ duration: 0.5 }}
      >
        <svg ref={svgRef} className="w-full overflow-visible" />
        <div className="flex items-center gap-4 mt-3 pl-12">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ background: AMBER }} />
            <span className="font-mono text-[9px] text-gray-300">Redacted</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ background: ROSE }} />
            <span className="font-mono text-[9px] text-gray-300">Blocked</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full border" style={{ borderColor: CYAN }} />
            <span className="font-mono text-[9px] text-gray-300">Oct 7 marker</span>
          </span>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {[
          { label: "Baseline (2011–2023)", value: "~2,600/yr", color: AMBER },
          { label: "Wartime (2024)", value: "7,900", color: ROSE },
          { label: "Suppressed Daily", value: `${data.perDay2025} items/day`, color: CYAN },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border bg-black/25 p-4 text-center"
            style={{ borderColor: `${s.color}33` }}
          >
            <p className="font-mono text-lg md:text-xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="font-mono text-[8px] tracking-[0.18em] text-gray-300 uppercase mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>

      <p className="font-mono text-[9px] tracking-[0.12em] text-gray-500">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
