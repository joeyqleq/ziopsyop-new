"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

const EXCLUDED_USER = "joeyleq";

const BEHAVIORS = [
  "Coordinated timing",
  "Hasbara buzzwords",
  "Downvoting Lebanese",
  "\"Outsider\" questions",
  "Muslim/Arab badmouthing",
  "Phoenician identity push",
  "Antisemitism accusation",
  "Terrorism labeling",
  "Oct 7 justification",
  "Human shields claim",
];

const USERS = [
  { id: "ConnorStreetmann", flair: "No flair" },
  { id: "MajorTechnology8827", flair: "No flair" },
  { id: "MuskyScent972", flair: "Israeli" },
  { id: "Worldineatydays", flair: "No flair" },
  { id: "62TiredOfLiving", flair: "No flair" },
  { id: "AdVivid8910", flair: "No flair" },
  { id: "Basic_Suggestion3476", flair: "No flair" },
  { id: "Curious_Diver1005", flair: "Lebanese" },
  { id: "Current-Meal9360", flair: "No flair" },
  { id: "Glad-Difference-3238", flair: "Israeli" },
  { id: "Anonymous-Balls", flair: "No flair" },
  { id: "tFighterPilot", flair: "Israeli" },
  { id: "DaDerpyDude", flair: "Israeli" },
  { id: "CruntyMcNugget", flair: "Israeli" },
  { id: "OptimismNeeded", flair: "Israeli" },
].filter((u) => u.id.toLowerCase() !== EXCLUDED_USER);

// Simulated frequency data (0-10 scale)
const MATRIX: number[][] = [
  [9, 8, 7, 8, 9, 7, 8, 6, 3, 2, 1, 2, 3, 4],
  [8, 9, 6, 7, 5, 8, 6, 4, 2, 3, 4, 7, 6, 5],
  [7, 7, 9, 8, 8, 6, 7, 5, 6, 2, 3, 5, 4, 6],
  [6, 5, 4, 7, 3, 6, 5, 8, 2, 1, 3, 2, 3, 2],
  [8, 7, 6, 5, 7, 8, 9, 3, 1, 2, 4, 4, 3, 3],
  [5, 6, 3, 4, 4, 7, 4, 9, 1, 2, 2, 1, 2, 1],
  [9, 8, 8, 7, 8, 6, 8, 5, 4, 5, 5, 7, 5, 6],
  [9, 9, 8, 9, 9, 7, 9, 4, 3, 4, 3, 8, 7, 7],
  [7, 6, 5, 4, 5, 4, 5, 2, 1, 3, 2, 6, 5, 4],
  [8, 7, 7, 6, 7, 5, 7, 3, 2, 3, 3, 7, 6, 5],
];

const FLAIR_COLORS: Record<string, string> = {
  Israeli: "#3b82f6",
  Lebanese: "#ef4444",
  "No flair": "#6b7280",
};

export function InfluenceHeatmap() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 60, right: 20, bottom: 30, left: 160 };
    const cellSize = 32;
    const width = margin.left + USERS.length * cellSize + margin.right;
    const height = margin.top + BEHAVIORS.length * cellSize + margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 10]);

    // Draw cells
    BEHAVIORS.forEach((_, bi) => {
      USERS.forEach((_, ui) => {
        const value = MATRIX[bi]?.[ui] || 0;
        svg
          .append("rect")
          .attr("x", margin.left + ui * cellSize)
          .attr("y", margin.top + bi * cellSize)
          .attr("width", cellSize - 2)
          .attr("height", cellSize - 2)
          .attr("rx", 3)
          .attr("fill", colorScale(value))
          .attr("opacity", 0.85)
          .attr("stroke", value >= 7 ? "rgba(255,255,255,0.3)" : "none")
          .attr("stroke-width", value >= 7 ? 1 : 0);

        if (value >= 5) {
          svg
            .append("text")
            .attr("x", margin.left + ui * cellSize + cellSize / 2 - 1)
            .attr("y", margin.top + bi * cellSize + cellSize / 2 + 1)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", value >= 7 ? "#fff" : "#ccc")
            .attr("font-size", "9px")
            .attr("font-family", "monospace")
            .text(value);
        }
      });
    });

    // Row labels (behaviors)
    BEHAVIORS.forEach((behavior, i) => {
      svg
        .append("text")
        .attr("x", margin.left - 8)
        .attr("y", margin.top + i * cellSize + cellSize / 2)
        .attr("text-anchor", "end")
        .attr("dy", "0.35em")
        .attr("fill", "#aaa")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .text(behavior);
    });

    // Column labels (users)
    USERS.forEach((user, i) => {
      svg
        .append("text")
        .attr("x", margin.left + i * cellSize + cellSize / 2)
        .attr("y", margin.top - 8)
        .attr("text-anchor", "start")
        .attr("transform", `rotate(-45, ${margin.left + i * cellSize + cellSize / 2}, ${margin.top - 8})`)
        .attr("fill", FLAIR_COLORS[user.flair] || "#aaa")
        .attr("font-size", "8px")
        .attr("font-family", "monospace")
        .text(user.id.slice(0, 12));
    });

  }, []);

  return (
    <div className="overflow-x-auto">
      <svg ref={svgRef} className="w-full min-w-[700px]" style={{ height: 420 }} />
      <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400">
        <span>Low</span>
        <div className="flex">
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <span
              key={v}
              className="w-4 h-3 inline-block"
              style={{ background: d3.interpolateReds(v / 10) }}
            />
          ))}
        </div>
        <span>High frequency</span>
      </div>
    </div>
  );
}
