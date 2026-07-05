"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  flair: string;
  activity: number;
  contradictionScore: number;
  group: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: "reply" | "brigading" | "coordination";
  weight: number;
}

const FLAIR_COLORS: Record<string, string> = {
  Israeli: "#3b82f6",
  Lebanese: "#ef4444",
  "No flair": "#6b7280",
  "Suspected bot": "#eab308",
  "High anomaly": "#f97316",
  "Jewish/Diaspora": "#8b5cf6",
};

const EXCLUDED_USER = "joeyleq";

function generateSampleData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const users = [
    { id: "EmperorChaos", flair: "Lebanese", activity: 850, contradictionScore: 5, group: "lebanese" },
    { id: "cha3bghachim", flair: "Lebanese", activity: 620, contradictionScore: 8, group: "lebanese" },
    { id: "levnon14", flair: "Lebanese", activity: 480, contradictionScore: 3, group: "lebanese" },
    { id: "victoryismind", flair: "Lebanese", activity: 390, contradictionScore: 12, group: "lebanese" },
    { id: "DaDerpyDude", flair: "Israeli", activity: 720, contradictionScore: 2, group: "israeli" },
    { id: "tFighterPilot", flair: "Israeli", activity: 680, contradictionScore: 4, group: "israeli" },
    { id: "IbnEzra613", flair: "Israeli", activity: 550, contradictionScore: 3, group: "israeli" },
    { id: "amazing9999", flair: "Israeli", activity: 490, contradictionScore: 5, group: "israeli" },
    { id: "Tamtumtam", flair: "Israeli", activity: 460, contradictionScore: 6, group: "israeli" },
    { id: "TheGooblyGamer", flair: "Israeli", activity: 410, contradictionScore: 2, group: "israeli" },
    { id: "OptimismNeeded", flair: "Israeli", activity: 380, contradictionScore: 8, group: "israeli" },
    { id: "FriendlyJewThrowaway", flair: "Jewish/Diaspora", activity: 340, contradictionScore: 7, group: "diaspora" },
    { id: "ConnorStreetmann", flair: "No flair", activity: 300, contradictionScore: 35, group: "anomaly" },
    { id: "MajorTechnology8827", flair: "No flair", activity: 280, contradictionScore: 42, group: "anomaly" },
    { id: "MuskyScent972", flair: "Israeli", activity: 260, contradictionScore: 48, group: "anomaly" },
    { id: "Worldineatydays", flair: "No flair", activity: 240, contradictionScore: 38, group: "anomaly" },
    { id: "CruntyMcNugget", flair: "Israeli", activity: 350, contradictionScore: 15, group: "israeli" },
    { id: "62TiredOfLiving", flair: "No flair", activity: 220, contradictionScore: 28, group: "anomaly" },
    { id: "AdVivid8910", flair: "No flair", activity: 200, contradictionScore: 55, group: "anomaly" },
    { id: "Basic_Suggestion3476", flair: "No flair", activity: 190, contradictionScore: 31, group: "anomaly" },
    { id: "Curious_Diver1005", flair: "Lebanese", activity: 180, contradictionScore: 62, group: "anomaly" },
    { id: "Current-Meal9360", flair: "No flair", activity: 170, contradictionScore: 45, group: "anomaly" },
    { id: "No-Mathematician5020", flair: "Israeli", activity: 310, contradictionScore: 9, group: "israeli" },
    { id: "Glad-Difference-3238", flair: "Israeli", activity: 250, contradictionScore: 12, group: "israeli" },
    { id: "LevantinePlantCult", flair: "Lebanese", activity: 160, contradictionScore: 18, group: "lebanese" },
    { id: "Israelidru", flair: "Israeli", activity: 320, contradictionScore: 4, group: "israeli" },
    { id: "Anonymous-Balls", flair: "No flair", activity: 270, contradictionScore: 22, group: "anomaly" },
  ].filter((u) => u.id.toLowerCase() !== EXCLUDED_USER);

  const links: GraphLink[] = [];

  // Reply relationships
  const replyPairs = [
    ["EmperorChaos", "tFighterPilot"], ["EmperorChaos", "DaDerpyDude"],
    ["cha3bghachim", "IbnEzra613"], ["cha3bghachim", "amazing9999"],
    ["levnon14", "Tamtumtam"], ["victoryismind", "OptimismNeeded"],
    ["DaDerpyDude", "IbnEzra613"], ["tFighterPilot", "amazing9999"],
    ["ConnorStreetmann", "EmperorChaos"], ["MajorTechnology8827", "cha3bghachim"],
    ["MuskyScent972", "levnon14"], ["Worldineatydays", "victoryismind"],
    ["FriendlyJewThrowaway", "EmperorChaos"], ["CruntyMcNugget", "levnon14"],
    ["AdVivid8910", "EmperorChaos"], ["Curious_Diver1005", "DaDerpyDude"],
  ];

  replyPairs.forEach(([s, t]) => {
    if (users.find((u) => u.id === s) && users.find((u) => u.id === t)) {
      links.push({ source: s as any, target: t as any, type: "reply", weight: Math.random() * 5 + 2 });
    }
  });

  // Coordination signals (anomaly cluster)
  const anomalyUsers = users.filter((u) => u.contradictionScore > 30).map((u) => u.id);
  for (let i = 0; i < anomalyUsers.length; i++) {
    for (let j = i + 1; j < anomalyUsers.length; j++) {
      if (Math.random() > 0.4) {
        links.push({ source: anomalyUsers[i] as any, target: anomalyUsers[j] as any, type: "coordination", weight: 3 });
      }
    }
  }

  return { nodes: users as GraphNode[], links };
}

export function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 800;
    const height = 500;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const { nodes, links } = generateSampleData();

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GraphNode>().radius((d) => Math.sqrt(d.activity) / 3 + 8));

    const linkGroup = svg.append("g");
    const nodeGroup = svg.append("g");

    const linkElements = linkGroup
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => {
        if (d.type === "coordination") return "#f97316";
        if (d.type === "brigading") return "#ef4444";
        return "rgba(100,100,200,0.3)";
      })
      .attr("stroke-width", (d) => d.weight * 0.5)
      .attr("stroke-dasharray", (d) => (d.type === "coordination" ? "4 2" : "none"))
      .attr("stroke-opacity", 0.5);

    const dragBehavior =
      d3
        .drag<SVGGElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });

    const nodeElements = nodeGroup
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g");

    nodeElements.call(
      dragBehavior as unknown as (
        selection: d3.Selection<
          SVGGElement,
          GraphNode,
          SVGGElement,
          unknown
        >
      ) => void
    );

    nodeElements
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.activity) / 3 + 4)
      .attr("fill", (d) => {
        if (d.contradictionScore > 30) return FLAIR_COLORS["High anomaly"];
        return FLAIR_COLORS[d.flair] || FLAIR_COLORS["No flair"];
      })
      .attr("stroke", (d) => {
        if (d.contradictionScore > 40) return "#ef4444";
        if (d.contradictionScore > 20) return "#f97316";
        return "rgba(255,255,255,0.2)";
      })
      .attr("stroke-width", (d) => Math.max(1, d.contradictionScore / 15))
      .attr("opacity", 0.85)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1).attr("r", Math.sqrt(d.activity) / 3 + 7);
        setSelectedNode(d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("opacity", 0.85).attr("r", Math.sqrt(d.activity) / 3 + 4);
      });

    nodeElements
      .append("text")
      .attr("dy", (d) => -(Math.sqrt(d.activity) / 3 + 8))
      .attr("text-anchor", "middle")
      .attr("fill", "#aaa")
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .text((d) => (d.activity > 300 ? d.id : ""));

    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeElements.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" style={{ height: 500 }} />
      {selectedNode && (
        <div className="absolute top-4 right-4 glass-panel p-3 max-w-xs z-10 text-xs font-mono">
          <p className="text-cyan-400 font-bold">u/{selectedNode.id}</p>
          <p className="text-gray-400 mt-1">Flair: {selectedNode.flair}</p>
          <p className="text-gray-400">Activity: {selectedNode.activity} posts+comments</p>
          <p className={selectedNode.contradictionScore > 30 ? "text-red-400" : "text-gray-400"}>
            Identity contradiction: {selectedNode.contradictionScore}%
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(FLAIR_COLORS).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
