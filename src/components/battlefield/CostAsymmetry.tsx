"use client";

import { motion } from "framer-motion";
import type { CostAsymmetry as CostData } from "@/lib/battlefield";
import { fmtUSD } from "@/lib/utils";

const MINT = "#3ee6c1";
const THREAT = "#ff4d5e";

export function CostAsymmetry({ data }: { data: CostData }) {
  const maxCost = Math.max(...data.units.map((u) => u.cost));
  // log scale so a $200 bar is still visible beside a $4M bar
  const logW = (v: number) => {
    const lo = Math.log10(100);
    const hi = Math.log10(maxCost);
    return `${Math.max(6, ((Math.log10(v) - lo) / (hi - lo)) * 100)}%`;
  };

  return (
    <div>
      {/* unit cost comparison — log scale */}
      <div className="space-y-3">
        {data.units.map((u, i) => {
          const color = u.side === "hezbollah" ? MINT : THREAT;
          return (
            <div key={u.name}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-mono text-[11px] tracking-[0.1em] text-foreground">{u.name}</span>
                <span className="font-mono text-sm font-bold" style={{ color }}>
                  {fmtUSD(u.cost)}
                </span>
              </div>
              <div className="h-3 rounded-sm bg-black/40 overflow-hidden border border-borderc">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: logW(u.cost) }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-sm"
                  style={{ background: color, boxShadow: `0 0 12px ${color}66` }}
                />
              </div>
            </div>
          );
        })}
        <p className="font-mono text-[9px] tracking-[0.12em] text-muted-2">
          * logarithmic scale — a single Iron Dome launcher equals 20,000 Hezbollah drones.
        </p>
      </div>

      {/* the ratio headline */}
      <div className="my-5 rounded-md border border-borderc bg-black/30 p-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.25em] text-muted-2 mb-1">COST-EXCHANGE RATIO</p>
        <p className="font-mono text-3xl md:text-4xl font-bold text-archive glow-primary">
          {data.ratioNote.split(" ")[0]}
        </p>
        <p className="font-mono text-[10px] tracking-[0.15em] text-muted mt-1">{data.ratioNote}</p>
      </div>

      {/* campaign cost ledger */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Hardware Losses", value: fmtUSD(data.hardwareTotal), cls: "text-threat" },
          { label: "Operations Cost", value: fmtUSD(data.opsTotal), cls: "text-archive" },
          { label: "Direct Cost (min)", value: fmtUSD(data.directTotal), cls: "text-threat" },
          { label: "Iron Dome Destroyed", value: String(data.ironDomeDestroyed), cls: "text-viz-blue" },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-borderc bg-black/25 p-3 text-center">
            <p className={`font-mono text-lg md:text-xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="font-mono text-[8px] tracking-[0.18em] text-muted uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {data.strategicText && (
        <p className="mt-4 text-xs text-muted leading-relaxed text-pretty">
          <span className="text-foreground font-medium">Total strategic cost: </span>
          {data.strategicText}
        </p>
      )}
      {data.morale && (
        <p className="mt-2 rounded-md border-l-2 border-l-threat bg-black/30 px-3 py-2 text-xs text-muted italic">
          “{data.morale}”
        </p>
      )}

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
