"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Crosshair, Heart } from "lucide-react";

export interface DoubleTapIncident {
  id: string;
  date: string;
  description: string;
  location: string;
  killed: number;
  wounded: number;
  occupation: string;
  isTriple: boolean;
  isQuadruple: boolean;
}

export interface DoubleTapData {
  incidents: DoubleTapIncident[];
  totalDoubleTaps: number;
  totalKilled: number;
  paramedicsKilled: number;
  source: string;
}

const THREAT = "#ff4d5e";
const AMBER = "#e8b44c";
const CRIMSON = "#9f1239";

function TapBadge({ level }: { level: 2 | 3 | 4 }) {
  const colors = { 2: THREAT, 3: AMBER, 4: CRIMSON };
  const labels = { 2: "DOUBLE-TAP", 3: "TRIPLE-TAP", 4: "QUADRUPLE-TAP" };
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border"
      style={{ color: colors[level], borderColor: `${colors[level]}66` }}
    >
      <Crosshair size={10} />
      {labels[level]}
    </span>
  );
}

export function DoubleTapPattern({ data }: { data: DoubleTapData }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-2">
            PATTERN: STRIKE, WAIT FOR RESCUERS, STRIKE AGAIN
          </p>
          <p className="font-mono text-2xl font-bold text-threat glow-threat mt-1">
            {data.totalDoubleTaps}{" "}
            <span className="text-sm text-muted font-normal">documented incidents</span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-md border border-borderc bg-black/30 px-3 py-1.5 text-center">
            <p className="font-mono text-base font-bold text-threat">{data.paramedicsKilled}</p>
            <p className="font-mono text-[8px] tracking-[0.15em] text-muted">PARAMEDICS KILLED</p>
          </div>
        </div>
      </div>

      {/* Pattern diagram */}
      <div className="rounded-md border border-threat/30 bg-black/40 p-4 mb-5">
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 mb-3">
          THE DOUBLE-TAP DOCTRINE
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full border-2 border-threat/60 flex items-center justify-center">
              <Crosshair size={18} className="text-threat" />
            </div>
            <span className="font-mono text-[8px] text-muted">STRIKE 1</span>
            <span className="font-mono text-[7px] text-muted-2">Initial target</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-threat/60 to-amber-500/60 min-w-[40px]" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500/60 flex items-center justify-center">
              <Heart size={18} className="text-amber-400" />
            </div>
            <span className="font-mono text-[8px] text-muted">RESCUERS</span>
            <span className="font-mono text-[7px] text-muted-2">Paramedics arrive</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-500/60 to-threat/80 min-w-[40px]" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full border-2 border-threat flex items-center justify-center bg-threat/10">
              <Crosshair size={18} className="text-threat" />
            </div>
            <span className="font-mono text-[8px] text-threat">STRIKE 2</span>
            <span className="font-mono text-[7px] text-muted-2">Kill the medics</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-threat/80 to-crimson-500/80 min-w-[40px] hidden sm:block" />
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: CRIMSON, background: `${CRIMSON}20` }}>
              <AlertTriangle size={18} style={{ color: CRIMSON }} />
            </div>
            <span className="font-mono text-[8px]" style={{ color: CRIMSON }}>STRIKE 3-4</span>
            <span className="font-mono text-[7px] text-muted-2">Repeated</span>
          </div>
        </div>
        <p className="text-[11px] text-muted mt-3 text-pretty leading-relaxed">
          The double-tap is a deliberate doctrine: strike a target, wait for emergency responders
          to arrive, then strike again to kill the rescuers. It is a war crime under customary IHL
          (Rule 5) and constitutes deliberate targeting of medical personnel (Geneva Convention I, Art. 24).
        </p>
      </div>

      {/* Incident list */}
      <div className="space-y-2">
        {data.incidents.map((inc, i) => {
          const level = inc.isQuadruple ? 4 : inc.isTriple ? 3 : 2;
          const isOpen = expanded === inc.id;
          return (
            <motion.button
              key={inc.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setExpanded(isOpen ? null : inc.id)}
              className="w-full text-left rounded-md border border-borderc bg-card/50 p-3 transition-colors hover:bg-card/70"
              style={{ borderLeftColor: level >= 4 ? CRIMSON : level >= 3 ? AMBER : THREAT, borderLeftWidth: 2 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TapBadge level={level as 2 | 3 | 4} />
                  <span className="font-mono text-[10px] text-muted">{inc.date}</span>
                </div>
                <div className="flex gap-3 font-mono text-[10px]">
                  {inc.killed > 0 && (
                    <span className="text-threat">{inc.killed} killed</span>
                  )}
                  {inc.wounded > 0 && (
                    <span className="text-amber-400">{inc.wounded} wounded</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground mt-1.5 text-pretty">{inc.description}</p>
              {isOpen && (
                <div className="mt-2 pt-2 border-t border-borderc text-[11px] text-muted space-y-1">
                  <p>Location: {inc.location}</p>
                  <p>Victims: {inc.occupation}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
