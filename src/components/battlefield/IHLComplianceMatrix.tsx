"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import type { IHLMatrix } from "@/lib/battlefield";

const MINT = "#3ee6c1";
const THREAT = "#ff4d5e";

type Verdict = "COMPLIANT" | "VIOLATION" | "N/A";

function Cell({ verdict }: { verdict: Verdict }) {
  if (verdict === "COMPLIANT")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em]" style={{ color: MINT }}>
        <Check size={13} /> COMPLIANT
      </span>
    );
  if (verdict === "VIOLATION")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em]" style={{ color: THREAT }}>
        <X size={13} /> VIOLATION
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] text-muted-2">
      <Minus size={13} /> N/A
    </span>
  );
}

export function IHLComplianceMatrix({ data }: { data: IHLMatrix }) {
  return (
    <div>
      {/* desktop grid header */}
      <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr] gap-px bg-borderc rounded-md overflow-hidden border border-borderc">
        <div className="bg-black/50 px-4 py-2.5 font-mono text-[9px] tracking-[0.2em] text-muted-2">
          PRINCIPLE OF INTERNATIONAL HUMANITARIAN LAW
        </div>
        <div className="bg-black/50 px-4 py-2.5 font-mono text-[9px] tracking-[0.2em] text-center" style={{ color: MINT }}>
          HEZBOLLAH
        </div>
        <div className="bg-black/50 px-4 py-2.5 font-mono text-[9px] tracking-[0.2em] text-center" style={{ color: THREAT }}>
          IDF
        </div>

        {data.rows.map((r, i) => (
          <motion.div
            key={r.principle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="contents"
          >
            <div className="bg-card/60 px-4 py-3">
              <p className="text-xs text-foreground font-medium">{r.principle}</p>
              <p className="font-mono text-[9px] text-muted-2 mt-0.5">{r.article}</p>
              <p className="text-[11px] text-muted leading-relaxed mt-1.5 text-pretty">{r.evidence}</p>
            </div>
            <div className="bg-card/60 px-4 py-3 flex items-center justify-center">
              <Cell verdict={r.hezbollah} />
            </div>
            <div className="bg-card/60 px-4 py-3 flex items-center justify-center">
              <Cell verdict={r.idf} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* mobile stacked cards */}
      <div className="md:hidden space-y-2">
        {data.rows.map((r) => (
          <div key={r.principle} className="rounded-md border border-borderc bg-card/60 p-3">
            <p className="text-xs text-foreground font-medium">{r.principle}</p>
            <p className="font-mono text-[9px] text-muted-2 mt-0.5">{r.article}</p>
            <p className="text-[11px] text-muted leading-relaxed my-2 text-pretty">{r.evidence}</p>
            <div className="flex gap-4 pt-1 border-t border-borderc">
              <span className="font-mono text-[9px] text-muted-2">HEZ:</span>
              <Cell verdict={r.hezbollah} />
              <span className="font-mono text-[9px] text-muted-2 ml-auto">IDF:</span>
              <Cell verdict={r.idf} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-l-2 border-l-threat border-borderc bg-black/30 p-3">
          <p className="font-mono text-xl font-bold text-threat">{data.doubleTaps}</p>
          <p className="font-mono text-[9px] tracking-[0.15em] text-muted uppercase mt-0.5">Double/triple-tap incidents</p>
        </div>
        <div className="rounded-md border border-l-2 border-l-threat border-borderc bg-black/30 p-3">
          <p className="font-mono text-xl font-bold text-threat">{data.protectedHit}</p>
          <p className="font-mono text-[9px] tracking-[0.15em] text-muted uppercase mt-0.5">Unprotected structure demolitions</p>
        </div>
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
