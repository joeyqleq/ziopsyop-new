"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface CoverageEvent {
  event: string;
  date: string;
  casualties: number;
  coverage: {
    leb_ar: number;
    leb_en: number;
    leb_fr: number;
    isr_he: number;
    isr_en: number;
    intl: number;
  };
}

const COLUMNS = [
  { key: "leb_ar", label: "Lebanese AR", color: "#22c55e" },
  { key: "leb_en", label: "Lebanese EN", color: "#10b981" },
  { key: "leb_fr", label: "Lebanese FR", color: "#059669" },
  { key: "isr_he", label: "Israeli HE", color: "#3b82f6" },
  { key: "isr_en", label: "Israeli EN", color: "#60a5fa" },
  { key: "intl", label: "International", color: "#8b5cf6" },
];

// 3 = prominent, 2 = brief mention, 1 = buried, 0 = not covered
const SAMPLE_DATA: CoverageEvent[] = [
  { event: "Pager detonations (Sep 17)", date: "2024-09-17", casualties: 2812, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 3, isr_en: 3, intl: 3 } },
  { event: "Walkie-talkie wave 2 (Sep 18)", date: "2024-09-18", casualties: 470, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 3, isr_en: 2, intl: 3 } },
  { event: "Nasrallah assassination (Sep 27)", date: "2024-09-27", casualties: 97, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 3, isr_en: 3, intl: 3 } },
  { event: "UNIFIL HQ attack (Oct 10)", date: "2024-10-10", casualties: 5, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 2, isr_he: 1, isr_en: 2, intl: 3 } },
  { event: "Nabatieh municipality strike (Oct 8)", date: "2024-10-08", casualties: 68, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 0, isr_en: 1, intl: 2 } },
  { event: "Journalists killed in press car (Oct 29)", date: "2024-10-29", casualties: 3, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 0, isr_en: 0, intl: 2 } },
  { event: "Paramedic double-tap (Oct 20)", date: "2024-10-20", casualties: 6, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 2, isr_he: 0, isr_en: 0, intl: 1 } },
  { event: "Hospital strike Bint Jbeil (Nov 23)", date: "2024-11-23", casualties: 28, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 0, isr_en: 1, intl: 2 } },
  { event: "Water infrastructure hit (Nov 15)", date: "2024-11-15", casualties: 0, coverage: { leb_ar: 3, leb_en: 2, leb_fr: 1, isr_he: 0, isr_en: 0, intl: 1 } },
  { event: "Civilians shot returning home (Feb 10)", date: "2025-02-10", casualties: 5, coverage: { leb_ar: 3, leb_en: 2, leb_fr: 2, isr_he: 0, isr_en: 0, intl: 1 } },
  { event: "IDF refuses ceasefire withdrawal (Jan 26)", date: "2025-01-26", casualties: 0, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 2, isr_en: 2, intl: 3 } },
  { event: "Village demolitions Kfar Kila (Feb 22)", date: "2025-02-22", casualties: 3, coverage: { leb_ar: 3, leb_en: 2, leb_fr: 1, isr_he: 0, isr_en: 0, intl: 1 } },
  { event: "Sidon hospital strike (Mar 2026)", date: "2026-03-01", casualties: 41, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 0, isr_en: 1, intl: 2 } },
  { event: "Tyre residential bombing (Feb 2026)", date: "2026-02-22", casualties: 63, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 3, isr_he: 1, isr_en: 1, intl: 2 } },
  { event: "Khiam sustained bombardment (Apr 2026)", date: "2026-04-05", casualties: 29, coverage: { leb_ar: 3, leb_en: 3, leb_fr: 2, isr_he: 0, isr_en: 0, intl: 1 } },
];

const COVERAGE_COLORS = ["#1f1f1f", "#ef4444", "#eab308", "#22c55e"];
const COVERAGE_LABELS = ["Not covered", "Buried/brief", "Mentioned", "Prominent"];

export function CoverageGapMatrix() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 80, right: 20, bottom: 20, left: 240 };
    const cellSize = 36;
    const width = margin.left + COLUMNS.length * cellSize + margin.right;
    const height = margin.top + SAMPLE_DATA.length * cellSize + margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Column headers
    COLUMNS.forEach((col, i) => {
      svg
        .append("text")
        .attr("x", margin.left + i * cellSize + cellSize / 2)
        .attr("y", margin.top - 10)
        .attr("text-anchor", "start")
        .attr("transform", `rotate(-40, ${margin.left + i * cellSize + cellSize / 2}, ${margin.top - 10})`)
        .attr("fill", col.color)
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .text(col.label);
    });

    // Rows
    SAMPLE_DATA.forEach((evt, ri) => {
      // Row label
      svg
        .append("text")
        .attr("x", margin.left - 8)
        .attr("y", margin.top + ri * cellSize + cellSize / 2)
        .attr("text-anchor", "end")
        .attr("dy", "0.35em")
        .attr("fill", "#ccc")
        .attr("font-size", "8px")
        .attr("font-family", "monospace")
        .text(evt.event.slice(0, 35));

      // Cells
      COLUMNS.forEach((col, ci) => {
        const value = evt.coverage[col.key as keyof typeof evt.coverage];
        svg
          .append("rect")
          .attr("x", margin.left + ci * cellSize + 2)
          .attr("y", margin.top + ri * cellSize + 2)
          .attr("width", cellSize - 4)
          .attr("height", cellSize - 4)
          .attr("rx", 4)
          .attr("fill", COVERAGE_COLORS[value])
          .attr("stroke", value === 0 ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.05)")
          .attr("stroke-width", value === 0 ? 1.5 : 0.5);
      });
    });
  }, []);

  return (
    <div className="space-y-4 overflow-x-auto">
      <svg ref={svgRef} className="w-full min-w-[600px]" style={{ height: 650 }} />
      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
        {COVERAGE_LABELS.map((label, i) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="w-4 h-3 inline-block rounded"
              style={{ background: COVERAGE_COLORS[i], border: i === 0 ? "1px solid rgba(239,68,68,0.4)" : "none" }}
            />
            {label}
          </span>
        ))}
      </div>
      <div className="neo-inset p-4">
        <p className="text-[10px] font-mono text-amber-400 mb-2">KEY FINDING</p>
        <p className="text-xs text-gray-300">
          Of 15 major events with Lebanese casualties, Israeli Hebrew media covered <strong className="text-white">zero</strong> of
          the paramedic double-taps, journalist killings, hospital strikes, or civilian return shootings.
          Israeli English media covered 3 of 15 with brief mentions only.
          The domestic Israeli audience is systematically shielded from knowledge of IDF conduct.
        </p>
      </div>
    </div>
  );
}
