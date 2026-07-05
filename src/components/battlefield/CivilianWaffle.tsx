"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export interface CivilianWaffleData {
  total: number;
  categories: {
    label: string;
    count: number;
    color: string;
  }[];
  source: string;
}

const DOT_SIZE = 4;
const GAP = 2;

export function CivilianWaffle({ data }: { data: CivilianWaffleData }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const dots = useMemo(() => {
    const result: { category: string; color: string; index: number }[] = [];
    let idx = 0;
    for (const cat of data.categories) {
      for (let i = 0; i < cat.count; i++) {
        result.push({ category: cat.label, color: cat.color, index: idx++ });
      }
    }
    return result;
  }, [data.categories]);

  const cols = 70;
  const rows = Math.ceil(dots.length / cols);
  const svgW = cols * (DOT_SIZE + GAP);
  const svgH = rows * (DOT_SIZE + GAP);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-2">
            EACH DOT IS ONE PERSON KILLED
          </p>
          <p className="font-mono text-3xl font-bold text-threat glow-threat mt-1">
            {data.total.toLocaleString()}{" "}
            <span className="text-sm text-muted font-normal">civilians killed</span>
          </p>
        </div>
        <p className="font-mono text-[9px] tracking-[0.12em] text-muted-2 max-w-[260px] text-right">
          3,500 dots. One per life extinguished. Color-coded by who they were when the strike hit.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {data.categories.map((cat) => (
          <button
            key={cat.label}
            onMouseEnter={() => setHovered(cat.label)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5 transition-opacity"
            style={{ opacity: hovered === null || hovered === cat.label ? 1 : 0.3 }}
          >
            <span
              className="w-3 h-3 rounded-[2px]"
              style={{ background: cat.color }}
            />
            <span className="font-mono text-[10px] text-foreground">
              {cat.label}
            </span>
            <span className="font-mono text-[10px] text-muted-2">
              ({cat.count.toLocaleString()})
            </span>
          </button>
        ))}
      </div>

      {/* Waffle grid */}
      <div className="overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full max-w-full"
          style={{ minHeight: Math.min(svgH, 320) }}
          role="img"
          aria-label={`Waffle chart: ${data.total} civilians killed`}
        >
          {dots.map((dot, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const dimmed = hovered !== null && dot.category !== hovered;
            return (
              <rect
                key={i}
                x={col * (DOT_SIZE + GAP)}
                y={row * (DOT_SIZE + GAP)}
                width={DOT_SIZE}
                height={DOT_SIZE}
                rx={1}
                fill={dot.color}
                opacity={dimmed ? 0.12 : 0.85}
                className="transition-opacity duration-200"
              />
            );
          })}
        </svg>
      </div>

      {/* Callout stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {data.categories.slice(0, 4).map((cat) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-md border border-borderc bg-black/30 p-3 text-center"
            style={{ borderLeftColor: cat.color, borderLeftWidth: 2 }}
          >
            <p className="font-mono text-lg font-bold" style={{ color: cat.color }}>
              {cat.count.toLocaleString()}
            </p>
            <p className="font-mono text-[8px] tracking-[0.15em] text-muted uppercase mt-0.5">
              {cat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
