"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from "d3-sankey";

interface SNode {
  name: string;
  category: "attacker" | "target";
}

interface SLink {
  source: number;
  target: number;
  value: number;
  casualties: number;
}

const NODES: SNode[] = [
  { name: "IDF", category: "attacker" },
  { name: "Hezbollah", category: "attacker" },
  { name: "Iran/IRGC", category: "attacker" },
  { name: "Unknown", category: "attacker" },
  { name: "Lebanese Civilians", category: "target" },
  { name: "Lebanese Infrastructure", category: "target" },
  { name: "Medical/Paramedics", category: "target" },
  { name: "Journalists", category: "target" },
  { name: "UNIFIL Personnel", category: "target" },
  { name: "UNIFIL Bases", category: "target" },
  { name: "Cultural Heritage", category: "target" },
  { name: "Lebanese Military (LAF)", category: "target" },
  { name: "Hezbollah Fighters", category: "target" },
  { name: "IDF Soldiers", category: "target" },
  { name: "Israeli Civilians", category: "target" },
  { name: "Israeli Infrastructure", category: "target" },
];

const LINKS: SLink[] = [
  // IDF → targets (heavy civilian weighting)
  { source: 0, target: 4, value: 340, casualties: 2100 },
  { source: 0, target: 5, value: 180, casualties: 0 },
  { source: 0, target: 6, value: 45, casualties: 89 },
  { source: 0, target: 7, value: 28, casualties: 56 },
  { source: 0, target: 8, value: 22, casualties: 15 },
  { source: 0, target: 9, value: 18, casualties: 0 },
  { source: 0, target: 10, value: 35, casualties: 0 },
  { source: 0, target: 11, value: 15, casualties: 23 },
  { source: 0, target: 12, value: 95, casualties: 380 },
  // Hezbollah → targets (overwhelmingly military)
  { source: 1, target: 13, value: 220, casualties: 145 },
  { source: 1, target: 14, value: 18, casualties: 32 },
  { source: 1, target: 15, value: 45, casualties: 0 },
  // Iran → targets
  { source: 2, target: 13, value: 8, casualties: 3 },
  { source: 2, target: 15, value: 5, casualties: 0 },
  // Unknown
  { source: 3, target: 4, value: 12, casualties: 8 },
];

const NODE_COLORS: Record<string, string> = {
  IDF: "#ef4444",
  Hezbollah: "#eab308",
  "Iran/IRGC": "#f97316",
  Unknown: "#6b7280",
  "Lebanese Civilians": "#22c55e",
  "Lebanese Infrastructure": "#06b6d4",
  "Medical/Paramedics": "#ec4899",
  Journalists: "#a855f7",
  "UNIFIL Personnel": "#3b82f6",
  "UNIFIL Bases": "#60a5fa",
  "Cultural Heritage": "#f59e0b",
  "Lebanese Military (LAF)": "#10b981",
  "Hezbollah Fighters": "#84cc16",
  "IDF Soldiers": "#f87171",
  "Israeli Civilians": "#fb923c",
  "Israeli Infrastructure": "#fbbf24",
};

export function SankeyDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 900;
    const height = 500;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const sankeyGen = sankey<SNode, SLink>()
      .nodeId((d: any) => d.index)
      .nodeWidth(20)
      .nodePadding(12)
      .extent([[40, 20], [width - 40, height - 20]]);

    const graph = sankeyGen({
      nodes: NODES.map((d) => ({ ...d })),
      links: LINKS.map((d) => ({ ...d })),
    } as any);

    const maxCasualties = Math.max(...LINKS.map((l) => l.casualties));

    svg
      .append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d: any) => {
        const sourceNode = graph.nodes[typeof d.source === "number" ? d.source : d.source.index];
        return NODE_COLORS[(sourceNode as any).name] || "#444";
      })
      .attr("stroke-opacity", (d: any) => {
        const intensity = 0.3 + 0.5 * ((d as any).casualties / maxCasualties);
        return Math.min(0.8, intensity);
      })
      .attr("stroke-width", (d: any) => Math.max(2, d.width))
      .on("mouseover", function (event: any, d: any) {
        d3.select(this).attr("stroke-opacity", 0.9);
        const sourceNode = graph.nodes[typeof d.source === "number" ? d.source : d.source.index];
        const targetNode = graph.nodes[typeof d.target === "number" ? d.target : d.target.index];
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${(sourceNode as any).name} → ${(targetNode as any).name}</strong><br/>Incidents: ${d.value}<br/>Casualties: ${(d as any).casualties}`
          )
          .style("left", event.offsetX + 10 + "px")
          .style("top", event.offsetY - 30 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", 0.4);
        tooltip.style("opacity", 0);
      });

    svg
      .append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => Math.max(4, d.y1 - d.y0))
      .attr("fill", (d: any) => NODE_COLORS[d.name] || "#444")
      .attr("rx", 3);

    svg
      .append("g")
      .selectAll("text")
      .data(graph.nodes)
      .join("text")
      .attr("x", (d: any) => (d.category === "attacker" ? d.x0 - 6 : d.x1 + 6))
      .attr("y", (d: any) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.category === "attacker" ? "end" : "start"))
      .attr("fill", "#ccc")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .text((d: any) => d.name);

    const tooltip = d3
      .select(svgRef.current.parentElement!)
      .append("div")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background", "rgba(10,10,30,0.95)")
      .style("border", "1px solid rgba(0,245,255,0.3)")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("font-size", "11px")
      .style("font-family", "monospace")
      .style("color", "#e8e8f0")
      .style("pointer-events", "none")
      .style("z-index", "100");

    return () => {
      tooltip.remove();
    };
  }, []);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" style={{ height: 500 }} />
    </div>
  );
}
