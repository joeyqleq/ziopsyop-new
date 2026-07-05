"use client";

import { motion } from "framer-motion";
import type { MoralityInversionData } from "@/lib/battlefield";

const MINT = "#3ee6c1";
const THREAT = "#ff4d5e";

export function MoralityInversion({ data }: { data: MoralityInversionData }) {
  return (
    <div>
      <div className="mb-5 text-center">
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 mb-2">
          CROSS-TABLE VERDICT: WHO IS THE TERRORIST?
        </p>
        <p className="text-sm text-foreground font-medium max-w-xl mx-auto leading-relaxed">
          {data.headline}
        </p>
      </div>

      {/* Split comparison grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hezbollah side */}
        <div className="rounded-md border border-borderc bg-black/30 overflow-hidden">
          <div
            className="px-4 py-2.5 border-b border-borderc"
            style={{ background: `${MINT}08` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: MINT }}
              />
              <span className="font-mono text-[10px] tracking-[0.15em]" style={{ color: MINT }}>
                HEZBOLLAH — &quot;THE TERRORISTS&quot;
              </span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {data.hezbollah.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between gap-3 py-1.5 border-b border-borderc/30 last:border-0"
              >
                <span className="text-xs text-muted">{row.label}</span>
                <span className="font-mono text-sm font-bold" style={{ color: MINT }}>
                  {typeof row.value === "number" ? row.value.toLocaleString() : row.value}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-borderc bg-black/20 text-center">
            <span className="font-mono text-[9px] tracking-[0.12em]" style={{ color: MINT }}>
              ZERO CIVILIAN HARM
            </span>
          </div>
        </div>

        {/* IDF side */}
        <div className="rounded-md border border-borderc bg-black/30 overflow-hidden">
          <div
            className="px-4 py-2.5 border-b border-borderc"
            style={{ background: `${THREAT}08` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: THREAT }}
              />
              <span className="font-mono text-[10px] tracking-[0.15em]" style={{ color: THREAT }}>
                IDF — &quot;MOST MORAL ARMY&quot;
              </span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {data.idf.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between gap-3 py-1.5 border-b border-borderc/30 last:border-0"
              >
                <span className="text-xs text-muted">{row.label}</span>
                <span className="font-mono text-sm font-bold" style={{ color: THREAT }}>
                  {typeof row.value === "number" ? row.value.toLocaleString() : row.value}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-borderc bg-black/20 text-center">
            <span className="font-mono text-[9px] tracking-[0.12em]" style={{ color: THREAT }}>
              SYSTEMATIC WAR CRIMES
            </span>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-5 rounded-md border border-borderc bg-black/40 p-4 text-center"
      >
        <p className="font-mono text-[9px] tracking-[0.25em] text-muted-2 mb-2">
          THE INVERSION
        </p>
        <p className="text-sm text-foreground leading-relaxed max-w-lg mx-auto">
          The party labeled <span style={{ color: THREAT }}>&quot;most moral&quot;</span> has
          killed <span className="font-bold text-foreground">7,072 civilians</span> and destroyed
          hospitals, ambulances, and UN bases. The party labeled{" "}
          <span style={{ color: MINT }}>&quot;terrorist&quot;</span> has hit{" "}
          <span className="font-bold text-foreground">zero civilian targets</span> across 665
          documented strikes.
        </p>
        <p className="mt-3 font-mono text-[10px] text-muted">
          The data doesn&apos;t require interpretation. It requires inversion of every label.
        </p>
      </motion.div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
