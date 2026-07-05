"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface SwimEvent {
  id: string;
  date: string;
  lane: string;
  label: string;
  description: string;
  severity: number;
  color: string;
}

const LANES = [
  { key: "idf", label: "IDF Actions", color: "#ef4444" },
  { key: "hezbollah", label: "Hezbollah Actions", color: "#eab308" },
  { key: "unifil", label: "UNIFIL Incidents", color: "#3b82f6" },
  { key: "civilian_casualties", label: "Civilian Casualties", color: "#22c55e" },
  { key: "political", label: "Political Events", color: "#a855f7" },
  { key: "media_divergence", label: "Media Divergence", color: "#f97316" },
  { key: "reddit_spike", label: "r/FB Activity Spikes", color: "#06b6d4" },
];

const SAMPLE_EVENTS: SwimEvent[] = [
  { id: "S001", date: "2024-01-08", lane: "hezbollah", label: "Hezbollah opens northern front", description: "Daily cross-border strikes begin in solidarity with Gaza", severity: 8, color: "#eab308" },
  { id: "S002", date: "2024-01-08", lane: "reddit_spike", label: "ForbiddenBromance spike", description: "Post volume 3x normal — coordinated 'why do they attack us' narratives", severity: 6, color: "#06b6d4" },
  { id: "S003", date: "2024-07-30", lane: "idf", label: "Shukr assassination", description: "IDF assassinates Fuad Shukr in Beirut suburb — 5 killed, 60+ wounded", severity: 9, color: "#ef4444" },
  { id: "S004", date: "2024-09-17", lane: "idf", label: "Pager attacks", description: "Coordinated pager detonations — 12 killed, 2800 wounded across Lebanon", severity: 10, color: "#ef4444" },
  { id: "S005", date: "2024-09-17", lane: "civilian_casualties", label: "Mass civilian casualties", description: "Indiscriminate harm: doctors, nurses, children among victims", severity: 10, color: "#22c55e" },
  { id: "S006", date: "2024-09-17", lane: "media_divergence", label: "Hebrew media celebrates", description: "Israeli Hebrew media frames as 'brilliant operation' — English media omits civilian toll", severity: 9, color: "#f97316" },
  { id: "S007", date: "2024-09-17", lane: "reddit_spike", label: "Massive FB spike", description: "r/ForbiddenBromance posts surge 8x — 'look how precise Israel is' framing dominates", severity: 9, color: "#06b6d4" },
  { id: "S008", date: "2024-09-27", lane: "idf", label: "Nasrallah assassination", description: "Bunker-buster strike on residential block kills Nasrallah + 6 others, 91 wounded", severity: 10, color: "#ef4444" },
  { id: "S009", date: "2024-10-01", lane: "idf", label: "Ground invasion begins", description: "IDF crosses Blue Line into south Lebanon", severity: 9, color: "#ef4444" },
  { id: "S010", date: "2024-10-10", lane: "unifil", label: "IDF attacks UNIFIL", description: "IDF fires on UNIFIL headquarters at Naqoura — 5 peacekeepers wounded", severity: 8, color: "#3b82f6" },
  { id: "S011", date: "2024-10-29", lane: "civilian_casualties", label: "Journalists killed", description: "Three journalists killed in marked press vehicle — clear targeting", severity: 8, color: "#22c55e" },
  { id: "S012", date: "2024-11-27", lane: "political", label: "Ceasefire agreement", description: "60-day ceasefire takes effect — IDF to withdraw", severity: 7, color: "#a855f7" },
  { id: "S013", date: "2025-01-26", lane: "political", label: "IDF refuses withdrawal", description: "Deadline passes — IDF unilaterally extends occupation", severity: 8, color: "#a855f7" },
  { id: "S014", date: "2025-02-10", lane: "civilian_casualties", label: "Return shootings", description: "IDF fires on civilians returning to homes post-ceasefire", severity: 7, color: "#22c55e" },
  { id: "S015", date: "2025-02-10", lane: "media_divergence", label: "Hebrew silence", description: "No Hebrew outlet covers civilian shootings — English outlets brief mention only", severity: 7, color: "#f97316" },
  { id: "S016", date: "2026-01-15", lane: "idf", label: "Second invasion", description: "IDF launches second ground operation into Lebanon", severity: 9, color: "#ef4444" },
  { id: "S017", date: "2026-01-28", lane: "hezbollah", label: "FPV drones deployed", description: "Fiber-optic FPV kamikaze drones destroy IDF Merkava — unjammable", severity: 9, color: "#eab308" },
  { id: "S018", date: "2026-02-01", lane: "reddit_spike", label: "Narrative pivot begins", description: "Anti-Shia content disappears overnight. Pro-Shia posts appear for first time.", severity: 8, color: "#06b6d4" },
  { id: "S019", date: "2026-02-01", lane: "media_divergence", label: "FPV blackout", description: "Zero FPV drone coverage on r/ForbiddenBromance despite global virality", severity: 9, color: "#f97316" },
  { id: "S020", date: "2026-03-01", lane: "idf", label: "Hospital strike", description: "Airstrike on Sidon Government Hospital — 11 killed", severity: 9, color: "#ef4444" },
];

export function SwimLaneTimeline() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ event: SwimEvent; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 30, right: 20, bottom: 40, left: 140 };
    const width = (svgRef.current.clientWidth || 1000) - margin.left - margin.right;
    const laneHeight = 50;
    const height = LANES.length * laneHeight;
    const totalHeight = height + margin.top + margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${totalHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const timeExtent = [new Date("2024-01-01"), new Date("2026-06-01")] as [Date, Date];
    const x = d3.scaleTime().domain(timeExtent).range([0, width]);

    const y = d3
      .scaleBand()
      .domain(LANES.map((l) => l.key))
      .range([0, height])
      .padding(0.15);

    // Lane backgrounds
    LANES.forEach((lane, i) => {
      g.append("rect")
        .attr("x", 0)
        .attr("y", y(lane.key)!)
        .attr("width", width)
        .attr("height", y.bandwidth())
        .attr("fill", i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.1)")
        .attr("rx", 4);
    });

    // Lane labels
    LANES.forEach((lane) => {
      g.append("text")
        .attr("x", -10)
        .attr("y", y(lane.key)! + y.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dy", "0.35em")
        .attr("fill", lane.color)
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .text(lane.label);
    });

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x).ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%b %y") as any)
      )
      .selectAll("text")
      .attr("fill", "#666")
      .attr("font-size", "8px");

    g.selectAll(".domain, .tick line").attr("stroke", "#333");

    // Event markers
    SAMPLE_EVENTS.forEach((evt) => {
      const eventDate = new Date(evt.date);
      const cx = x(eventDate);
      const cy = y(evt.lane)! + y.bandwidth() / 2;
      const r = 3 + evt.severity * 0.8;

      g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("fill", evt.color)
        .attr("opacity", 0.8)
        .attr("stroke", evt.severity >= 9 ? "#fff" : "none")
        .attr("stroke-width", evt.severity >= 9 ? 1.5 : 0)
        .style("cursor", "pointer")
        .on("mouseover", function (event) {
          d3.select(this).attr("opacity", 1).attr("r", r + 3);
          const rect = svgRef.current!.getBoundingClientRect();
          setTooltip({
            event: evt,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 0.8).attr("r", r);
          setTooltip(null);
        });
    });

    // Key date markers
    const keyDates = [
      { date: "2024-09-17", label: "Pager attacks" },
      { date: "2024-11-27", label: "Ceasefire" },
      { date: "2026-01-15", label: "2nd invasion" },
    ];
    keyDates.forEach((kd) => {
      const xPos = x(new Date(kd.date));
      g.append("line")
        .attr("x1", xPos).attr("x2", xPos)
        .attr("y1", 0).attr("y2", height)
        .attr("stroke", "rgba(255,255,255,0.15)")
        .attr("stroke-dasharray", "4 2");
      g.append("text")
        .attr("x", xPos)
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("fill", "#888")
        .attr("font-size", "7px")
        .attr("font-family", "monospace")
        .text(kd.label);
    });
  }, []);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" style={{ height: 450 }} />
      {tooltip && (
        <div
          className="absolute z-50 glass-panel p-3 max-w-xs pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 60 }}
        >
          <p className="text-[10px] font-mono text-cyan-400">{tooltip.event.date}</p>
          <p className="text-xs font-semibold text-white mt-1">{tooltip.event.label}</p>
          <p className="text-[11px] text-gray-400 mt-1">{tooltip.event.description}</p>
          <p className="text-[9px] text-gray-500 mt-1">Severity: {tooltip.event.severity}/10</p>
        </div>
      )}
    </div>
  );
}
