"use client";

import { motion } from "framer-motion";
import { Cpu, Crosshair } from "lucide-react";
import type { WeaponInnovation } from "@/lib/battlefield";
import { fmtUSD } from "@/lib/utils";

const MINT = "#3ee6c1";
const BLUE = "#4ea8ff";

function fmtDate(d: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function WeaponTimeline({ data }: { data: WeaponInnovation }) {
  return (
    <div>
      <p className="text-xs text-muted leading-relaxed mb-5 max-w-2xl text-pretty">
        Hezbollah&apos;s weapon program evolved from unguided rockets to fiber-optic-guided FPV drones immune to
        electronic warfare — each milestone documented and dated. Highlighted entries are fiber-optic systems.
      </p>

      {/* weapon evolution rail */}
      <div className="relative pl-6">
        <div
          className="absolute left-[7px] top-1 bottom-1 w-px"
          style={{ background: `linear-gradient(to bottom, ${MINT}, ${BLUE})` }}
        />
        <div className="space-y-4">
          {data.weapons.map((w, i) => (
            <motion.div
              key={w.name + i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <span
                className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: w.fiberOptic ? BLUE : MINT,
                  background: "var(--background)",
                  boxShadow: w.fiberOptic ? `0 0 10px ${BLUE}` : "none",
                }}
              />
              <div
                className="rounded-md border bg-card/50 p-3.5"
                style={{ borderColor: w.fiberOptic ? `color-mix(in srgb, ${BLUE} 35%, transparent)` : "var(--borderc)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {w.fiberOptic && <Cpu size={13} style={{ color: BLUE }} />}
                    <span className="font-mono text-[12px] tracking-[0.08em] text-foreground font-semibold">{w.name}</span>
                    <span className="font-mono text-[9px] tracking-[0.15em] text-muted-2 uppercase">{w.category}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted">{fmtDate(w.firstUse)}</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed text-pretty">{w.description}</p>
                <div className="flex flex-wrap gap-4 mt-2 font-mono text-[10px]">
                  {w.unitCost > 0 && (
                    <span className="text-muted">
                      UNIT COST <span style={{ color: MINT }}>{fmtUSD(w.unitCost)}</span>
                    </span>
                  )}
                  {w.kills > 0 && (
                    <span className="text-muted inline-flex items-center gap-1">
                      <Crosshair size={11} className="text-threat" />
                      CONFIRMED KILLS <span className="text-threat">{w.kills}</span>
                    </span>
                  )}
                  {w.fiberOptic && (
                    <span className="font-mono text-[9px] tracking-[0.12em] px-1.5 rounded-[3px] border" style={{ color: BLUE, borderColor: `color-mix(in srgb, ${BLUE} 40%, transparent)` }}>
                      EW-IMMUNE · FIBER-OPTIC
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="mt-4 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
