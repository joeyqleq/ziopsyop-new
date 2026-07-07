"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Edge { source: string; target: string; weight: number; }
interface UserNode {
  username: string;
  contradiction_score: number;
  conflict_pct: number;
  role: string;
  total_comments: number;
  lang: Record<string, number>;
}
interface Props {
  users: UserNode[];
  edges: Edge[];
}

const ROLE_COLORS: Record<string, string> = {
  EMBEDDED_OPERATIVE: "#ff4d5e",
  CONFLICT_SPECIALIST: "#e8b44c",
  HEBREW_SPEAKER: "#7b39d0",
  VETERAN_ACTOR: "#5b9bff",
  PARTICIPANT: "#8a8f98",
};

export function UserReplyNetwork({ users, edges }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; user: UserNode } | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 520 });

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setDims({ w: e.contentRect.width, h: Math.max(420, e.contentRect.width * 0.6) });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !users.length || !edges.length) return;

    d3.select(svg).selectAll("*").remove();

    const { w, h } = dims;
    const userMap = new Map(users.map((u) => [u.username, u]));

    // build adjacency for node sizing
    const degree = new Map<string, number>();
    edges.forEach((e) => {
      degree.set(e.source, (degree.get(e.source) || 0) + e.weight);
      degree.set(e.target, (degree.get(e.target) || 0) + e.weight);
    });

    const nodeData = users.map((u) => ({
      id: u.username,
      r: Math.max(8, Math.min(28, 6 + Math.sqrt(degree.get(u.username) || 0) * 1.4)),
      color: ROLE_COLORS[u.role] || "#8a8f98",
      ...u,
    }));

    const edgeData = edges
      .filter((e) => userMap.has(e.source) && userMap.has(e.target))
      .map((e) => ({ ...e, value: e.weight }));

    const linkScale = d3.scaleLinear()
      .domain([0, d3.max(edgeData, (d) => d.value) || 1])
      .range([0.5, 3.5]);

    const root = d3.select(svg)
      .attr("width", w)
      .attr("height", h)
      .attr("viewBox", `0 0 ${w} ${h}`);

    const defs = root.append("defs");
    // glow filter
    const filt = defs.append("filter").attr("id", "node-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filt.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "3").attr("result", "blur");
    filt.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    const g = root.append("g");

    // zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));
    root.call(zoom);

    const sim = d3.forceSimulation(nodeData as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(edgeData).id((d: d3.SimulationNodeDatum) => (d as { id: string }).id).distance(100).strength(0.3))
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius((d) => (d as { r: number }).r + 10));

    const link = g.append("g")
      .selectAll("line")
      .data(edgeData)
      .join("line")
      .attr("stroke", "rgba(255,255,255,0.12)")
      .attr("stroke-width", (d) => linkScale(d.value));

    const node = g.append("g")
      .selectAll("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer");

    const dragHandler = d3.drag<SVGGElement, typeof nodeData[0]>()
      .on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        (d as d3.SimulationNodeDatum).fx = (d as d3.SimulationNodeDatum).x;
        (d as d3.SimulationNodeDatum).fy = (d as d3.SimulationNodeDatum).y;
      })
      .on("drag", (event, d) => {
        (d as d3.SimulationNodeDatum).fx = event.x;
        (d as d3.SimulationNodeDatum).fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        (d as d3.SimulationNodeDatum).fx = null;
        (d as d3.SimulationNodeDatum).fy = null;
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node as any).call(dragHandler);

    // contradiction ring
    node.append("circle")
      .attr("r", (d) => d.r + 4)
      .attr("fill", "none")
      .attr("stroke", (d) => d.contradiction_score > 40 ? "#ff4d5e" : "transparent")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", (d) => `${d.contradiction_score * 0.01 * 2 * Math.PI * (d.r + 4)} ${2 * Math.PI * (d.r + 4)}`);

    // main circle
    node.append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.color)
      .attr("fill-opacity", 0.85)
      .attr("filter", (d) => d.contradiction_score > 50 ? "url(#node-glow)" : null);

    // label
    node.append("text")
      .text((d) => d.id.length > 12 ? d.id.slice(0, 10) + "…" : d.id)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.r + 14)
      .attr("fill", "#8a8f98")
      .attr("font-size", 9)
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("pointer-events", "none");

    // hover
    node.on("mouseenter", (event, d) => {
      const rect = svg.getBoundingClientRect();
      const nd = d as d3.SimulationNodeDatum & typeof nodeData[0];
      setTooltip({
        x: (nd.x || 0) / w * rect.width,
        y: (nd.y || 0) / h * rect.height,
        user: userMap.get(d.id)!,
      });
    }).on("mouseleave", () => setTooltip(null));

    sim.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as d3.SimulationNodeDatum).x || 0)
        .attr("y1", (d) => (d.source as d3.SimulationNodeDatum).y || 0)
        .attr("x2", (d) => (d.target as d3.SimulationNodeDatum).x || 0)
        .attr("y2", (d) => (d.target as d3.SimulationNodeDatum).y || 0);
      node.attr("transform", (d) => `translate(${(d as d3.SimulationNodeDatum).x || 0},${(d as d3.SimulationNodeDatum).y || 0})`);
    });

    return () => { sim.stop(); };
  }, [users, edges, dims]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" style={{ height: dims.h }} />

      {/* legend */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 bg-black/60 border border-borderc rounded p-2">
        {Object.entries(ROLE_COLORS).map(([role, color]) => (
          <div key={role} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="font-mono text-[9px] text-muted">{role.replace(/_/g, " ")}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1 border-t border-borderc pt-1">
          <div className="w-3 h-3 rounded-full border border-threat bg-transparent" />
          <span className="font-mono text-[9px] text-threat">HIGH CONTRADICTION</span>
        </div>
      </div>

      <p className="text-[10px] text-muted-2 text-center mt-1 font-mono">drag nodes · scroll to zoom</p>

      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-black/95 border border-borderc rounded p-3 w-56 text-[10px] font-mono"
          style={{ left: tooltip.x + 16, top: tooltip.y - 40 }}
        >
          <p className="text-foreground font-bold mb-1">u/{tooltip.user.username}</p>
          <p style={{ color: ROLE_COLORS[tooltip.user.role] }}>{tooltip.user.role.replace(/_/g, " ")}</p>
          <div className="mt-2 space-y-0.5 text-muted">
            <p>conflict activity: <span className="text-archive">{tooltip.user.conflict_pct}%</span></p>
            <p>contradiction score: <span className={tooltip.user.contradiction_score > 40 ? "text-threat" : "text-primary"}>{tooltip.user.contradiction_score}/100</span></p>
            <p>total comments: {tooltip.user.total_comments.toLocaleString()}</p>
            {(tooltip.user.lang?.hebrew || 0) > 2 && (
              <p>hebrew content: <span className="text-eye-purple">{tooltip.user.lang.hebrew}%</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
