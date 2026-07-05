"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

const HASBARA_BUZZWORDS = new Set([
  "terrorist", "antisemite", "hamas", "propaganda", "iran proxy",
  "existential threat", "right to defend", "human shields", "islamist",
  "radical", "barbaric", "7 october", "never again", "only democracy",
]);

const DEHUMANIZATION = new Set([
  "terrorist", "barbaric", "savages", "animals", "radical", "islamist",
  "extremist", "fanatic", "jihadist",
]);

const BRIDGE_TERMS = new Set([
  "peace", "coexist", "dialogue", "friendship", "love", "together",
  "neighbor", "empathy", "understanding", "humanity",
]);

interface WordEntry {
  text: string;
  size: number;
  category: "hasbara" | "dehumanization" | "bridge" | "neutral";
}

const SAMPLE_MONTHS: Record<string, WordEntry[]> = {
  "2024-01": [
    { text: "peace", size: 45, category: "bridge" }, { text: "hezbollah", size: 60, category: "neutral" },
    { text: "terrorist", size: 55, category: "dehumanization" }, { text: "lebanon", size: 50, category: "neutral" },
    { text: "israel", size: 48, category: "neutral" }, { text: "war", size: 40, category: "neutral" },
    { text: "ceasefire", size: 35, category: "neutral" }, { text: "iran proxy", size: 32, category: "hasbara" },
    { text: "right to defend", size: 30, category: "hasbara" }, { text: "human shields", size: 28, category: "hasbara" },
    { text: "dialogue", size: 25, category: "bridge" }, { text: "friendship", size: 22, category: "bridge" },
    { text: "radical", size: 38, category: "dehumanization" }, { text: "propaganda", size: 33, category: "hasbara" },
    { text: "october 7", size: 42, category: "hasbara" }, { text: "antisemite", size: 26, category: "hasbara" },
    { text: "neighbor", size: 20, category: "bridge" }, { text: "civilians", size: 36, category: "neutral" },
    { text: "bombs", size: 30, category: "neutral" }, { text: "occupation", size: 28, category: "neutral" },
  ],
  "2024-10": [
    { text: "hezbollah", size: 80, category: "neutral" }, { text: "terrorist", size: 70, category: "dehumanization" },
    { text: "iran proxy", size: 55, category: "hasbara" }, { text: "right to defend", size: 50, category: "hasbara" },
    { text: "human shields", size: 48, category: "hasbara" }, { text: "pager", size: 65, category: "neutral" },
    { text: "explosion", size: 60, category: "neutral" }, { text: "invasion", size: 55, category: "neutral" },
    { text: "dahiyeh", size: 50, category: "neutral" }, { text: "war crime", size: 35, category: "neutral" },
    { text: "radical", size: 45, category: "dehumanization" }, { text: "barbaric", size: 40, category: "dehumanization" },
    { text: "propaganda", size: 42, category: "hasbara" }, { text: "existential", size: 38, category: "hasbara" },
    { text: "peace", size: 15, category: "bridge" }, { text: "genocide", size: 30, category: "neutral" },
    { text: "civilians", size: 55, category: "neutral" }, { text: "antisemite", size: 36, category: "hasbara" },
    { text: "nasrallah", size: 58, category: "neutral" }, { text: "resistance", size: 32, category: "neutral" },
  ],
  "2026-02": [
    { text: "shia brothers", size: 45, category: "neutral" }, { text: "christians", size: 50, category: "neutral" },
    { text: "phoenician", size: 40, category: "hasbara" }, { text: "peace", size: 55, category: "bridge" },
    { text: "victims", size: 48, category: "neutral" }, { text: "hezbollah hostage", size: 42, category: "hasbara" },
    { text: "love", size: 38, category: "bridge" }, { text: "occupation", size: 35, category: "neutral" },
    { text: "drone", size: 10, category: "neutral" }, { text: "coexist", size: 44, category: "bridge" },
    { text: "friendship", size: 40, category: "bridge" }, { text: "divide", size: 30, category: "neutral" },
    { text: "sectarian", size: 36, category: "neutral" }, { text: "maronite", size: 32, category: "neutral" },
    { text: "sunni", size: 28, category: "neutral" }, { text: "dialogue", size: 42, category: "bridge" },
    { text: "neighbor", size: 35, category: "bridge" }, { text: "propaganda", size: 20, category: "hasbara" },
    { text: "together", size: 38, category: "bridge" }, { text: "understanding", size: 30, category: "bridge" },
  ],
};

const MONTHS = Object.keys(SAMPLE_MONTHS);

const CATEGORY_COLORS: Record<string, string> = {
  hasbara: "#f97316",
  dehumanization: "#ef4444",
  bridge: "#22c55e",
  neutral: "#94a3b8",
};

export function WordCloud() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [monthIndex, setMonthIndex] = useState(0);
  const currentMonth = MONTHS[monthIndex];
  const words = SAMPLE_MONTHS[currentMonth];

  useEffect(() => {
    if (!svgRef.current || !words) return;

    const width = svgRef.current.clientWidth || 700;
    const height = 350;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const sortedWords = [...words].sort((a, b) => b.size - a.size);

    const spiralPositions = sortedWords.map((word, i) => {
      const angle = i * 0.7;
      const radius = 10 + i * 12;
      return {
        ...word,
        x: Math.cos(angle) * radius * (width / 700),
        y: Math.sin(angle) * radius * (height / 400),
      };
    });

    g.selectAll("text")
      .data(spiralPositions)
      .join("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => `${d.size * 0.35}px`)
      .attr("font-family", "monospace")
      .attr("font-weight", (d) => (d.category !== "neutral" ? "bold" : "normal"))
      .attr("fill", (d) => CATEGORY_COLORS[d.category])
      .attr("opacity", 0)
      .text((d) => d.text)
      .transition()
      .delay((_, i) => i * 40)
      .duration(300)
      .attr("opacity", (d) => (d.category !== "neutral" ? 1 : 0.7));
  }, [words, currentMonth]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={MONTHS.length - 1}
          value={monthIndex}
          onChange={(e) => setMonthIndex(Number(e.target.value))}
          className="flex-1 accent-cyan-400"
        />
        <span className="text-xs font-mono text-cyan-400 w-20">{currentMonth}</span>
      </div>
      <svg ref={svgRef} className="w-full" style={{ height: 350 }} />
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
