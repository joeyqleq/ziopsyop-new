"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";

export interface TreemapNode {
  id: string;
  type: string;
  name: string | null;
  location: string;
  method: string;
  count: number;
  rebuildCost: number;
  ihlProtected: boolean;
  dahiyeh: boolean;
}

export interface InfrastructureTreemapData {
  nodes: TreemapNode[];
  totalCost: number;
  villagesDemolished: number;
  structuresDestroyed: number;
  displaced: number;
  source: string;
}

const COLORS: Record<string, string> = {
  RESIDENTIAL: "#ff4d5e",
  RESIDENTIAL_AGGREGATE: "#ff4d5e",
  HOSPITAL: "#e8b44c",
  BRIDGE: "#5b9bff",
  AMBULANCE_STATION: "#f97316",
  ROAD: "#8b5cf6",
  TELECOM: "#06b6d4",
  MOSQUE: "#a78bfa",
  SCHOOL: "#fbbf24",
  UNIFIL_BASE: "#3ee6c1",
};

function treemapLayout(
  items: { value: number; id: string }[],
  width: number,
  height: number
): { id: string; x: number; y: number; w: number; h: number }[] {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return items.map((i) => ({ id: i.id, x: 0, y: 0, w: 0, h: 0 }));

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const rects: { id: string; x: number; y: number; w: number; h: number }[] = [];

  let x = 0, y = 0, remainW = width, remainH = height, remainTotal = total;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const ratio = item.value / remainTotal;

    if (remainW >= remainH) {
      const w = remainW * ratio;
      rects.push({ id: item.id, x, y, w, h: remainH });
      x += w;
      remainW -= w;
    } else {
      const h = remainH * ratio;
      rects.push({ id: item.id, x, y, w: remainW, h });
      y += h;
      remainH -= h;
    }
    remainTotal -= item.value;
  }

  return rects;
}

function fmtCost(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export function InfrastructureTreemap({ data }: { data: InfrastructureTreemapData }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const WIDTH = 800;
  const HEIGHT = 420;

  const layout = useMemo(() => {
    const items = data.nodes
      .filter((n) => n.rebuildCost > 0)
      .map((n) => ({ value: n.rebuildCost, id: n.id }));
    return treemapLayout(items, WIDTH, HEIGHT);
  }, [data.nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, TreemapNode>();
    data.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [data.nodes]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-2">
            INFRASTRUCTURE DESTROYED — AREA = REBUILD COST
          </p>
          <p className="font-mono text-3xl font-bold text-threat glow-threat mt-1">
            {fmtCost(data.totalCost)}{" "}
            <span className="text-sm text-muted font-normal">minimum rebuild cost</span>
          </p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="rounded-md border border-borderc bg-black/30 px-3 py-1.5">
            <p className="font-mono text-base font-bold text-threat">{data.villagesDemolished}</p>
            <p className="font-mono text-[8px] tracking-[0.15em] text-muted">VILLAGES</p>
          </div>
          <div className="rounded-md border border-borderc bg-black/30 px-3 py-1.5">
            <p className="font-mono text-base font-bold text-amber-400">{data.structuresDestroyed.toLocaleString()}</p>
            <p className="font-mono text-[8px] tracking-[0.15em] text-muted">STRUCTURES</p>
          </div>
          <div className="rounded-md border border-borderc bg-black/30 px-3 py-1.5">
            <p className="font-mono text-base font-bold text-viz-blue">{(data.displaced / 1e6).toFixed(1)}M</p>
            <p className="font-mono text-[8px] tracking-[0.15em] text-muted">DISPLACED</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(COLORS).slice(0, 8).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: color }} />
            <span className="font-mono text-[9px] text-muted">
              {type.replace(/_/g, " ")}
            </span>
          </span>
        ))}
        <span className="flex items-center gap-1 ml-2">
          <Shield size={10} className="text-amber-400" />
          <span className="font-mono text-[9px] text-amber-400">IHL PROTECTED</span>
        </span>
      </div>

      {/* Treemap SVG */}
      <div className="overflow-x-auto rounded-md border border-borderc">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ minHeight: 300 }}>
          {layout.map((rect) => {
            const node = nodeMap.get(rect.id);
            if (!node) return null;
            const color = COLORS[node.type] || "#6b7280";
            const isHovered = hovered === rect.id;
            const showLabel = rect.w > 60 && rect.h > 40;
            return (
              <g
                key={rect.id}
                onMouseEnter={() => setHovered(rect.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <rect
                  x={rect.x + 1}
                  y={rect.y + 1}
                  width={Math.max(0, rect.w - 2)}
                  height={Math.max(0, rect.h - 2)}
                  rx={3}
                  fill={color}
                  opacity={isHovered ? 0.95 : hovered ? 0.4 : 0.7}
                  stroke={node.ihlProtected ? "#e8b44c" : "transparent"}
                  strokeWidth={node.ihlProtected ? 2 : 0}
                  className="transition-opacity duration-150"
                />
                {showLabel && (
                  <>
                    <text
                      x={rect.x + 8}
                      y={rect.y + 18}
                      fill="white"
                      fontSize={10}
                      fontFamily="var(--font-jet), monospace"
                      fontWeight="bold"
                    >
                      {node.type.replace(/_/g, " ")}
                    </text>
                    <text
                      x={rect.x + 8}
                      y={rect.y + 32}
                      fill="rgba(255,255,255,0.7)"
                      fontSize={9}
                      fontFamily="var(--font-jet), monospace"
                    >
                      {fmtCost(node.rebuildCost)}
                    </text>
                    {node.dahiyeh && rect.h > 50 && (
                      <text
                        x={rect.x + 8}
                        y={rect.y + 46}
                        fill="#fbbf24"
                        fontSize={8}
                        fontFamily="var(--font-jet), monospace"
                      >
                        DAHIYEH DOCTRINE
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover tooltip */}
      {hovered && nodeMap.get(hovered) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-md border border-borderc bg-card/80 backdrop-blur-sm p-3"
        >
          {(() => {
            const n = nodeMap.get(hovered)!;
            return (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-[2px]" style={{ background: COLORS[n.type] || "#6b7280" }} />
                  <span className="font-mono text-xs text-foreground font-semibold">
                    {n.name || n.type.replace(/_/g, " ")}
                  </span>
                  {n.ihlProtected && (
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] text-amber-400">
                      <Shield size={10} /> IHL PROTECTED
                    </span>
                  )}
                  {n.dahiyeh && (
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] text-threat">
                      <AlertTriangle size={10} /> DAHIYEH DOCTRINE
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-muted">
                  <span>Location: <span className="text-foreground">{n.location}</span></span>
                  <span>Method: <span className="text-foreground">{n.method.replace(/_/g, " ")}</span></span>
                  <span>Rebuild: <span className="text-threat">{fmtCost(n.rebuildCost)}</span></span>
                  {n.count > 0 && <span>Count: <span className="text-foreground">{n.count}</span></span>}
                </div>
              </>
            );
          })()}
        </motion.div>
      )}

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
