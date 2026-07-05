"use client";

import { motion } from "framer-motion";
import type { CostAsymmetry as CostData } from "@/lib/battlefield";
import { fmtUSD } from "@/lib/utils";

const MINT = "#3ee6c1";
const THREAT = "#ff4d5e";

function areaRadius(cost: number, maxCost: number, maxR: number): number {
  return Math.max(3, Math.sqrt(cost / maxCost) * maxR);
}

export function CostAsymmetry({ data }: { data: CostData }) {
  const maxCost = Math.max(...data.units.map((u) => u.cost));
  const MAX_R = 120;

  return (
    <div>
      {/* Proportional area circles — visual ratio is instant */}
      <div className="flex flex-col items-center mb-6">
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 mb-4">
          CIRCLE AREA = UNIT COST · TRUE PROPORTIONAL SCALE
        </p>
        <div className="relative flex items-end justify-center gap-6 sm:gap-10 py-4" style={{ minHeight: 280 }}>
          {data.units.map((u, i) => {
            const r = areaRadius(u.cost, maxCost, MAX_R);
            const color = u.side === "hezbollah" ? MINT : THREAT;
            return (
              <motion.div
                key={u.name}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="rounded-full flex items-center justify-center transition-transform hover:scale-105"
                  style={{
                    width: r * 2,
                    height: r * 2,
                    background: `radial-gradient(circle at 35% 35%, ${color}40, ${color}15)`,
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 ${r / 3}px ${color}44, inset 0 0 ${r / 4}px ${color}22`,
                  }}
                >
                  <span
                    className="font-mono font-bold text-center leading-tight"
                    style={{
                      color,
                      fontSize: Math.max(10, Math.min(18, r / 4)),
                    }}
                  >
                    {fmtUSD(u.cost)}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-foreground text-center max-w-[100px]">
                  {u.name}
                </span>
              </motion.div>
            );
          })}
        </div>
        <p className="font-mono text-[10px] text-muted-2 mt-2">
          One Iron Dome launcher = <span className="text-foreground font-bold">20,000</span> Hezbollah FPV drones
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
          &ldquo;{data.morale}&rdquo;
        </p>
      )}

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
