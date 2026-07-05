"use client";

import { motion } from "framer-motion";
import type { LieDetectorData } from "@/lib/battlefield";

const COLORS = ["#3ee6c1", "#4ea8ff", "#a78bfa", "#eab308", "#ff4d5e"];

export function LieDetector({ data }: { data: LieDetectorData }) {
  const maxVal = data.funnelSteps[0]?.value ?? 1;

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2">
          CROSS-TABLE VERIFICATION: HOW MANY DID THEY REALLY LOSE?
        </p>
        <p className="text-xs text-muted mt-1">
          Five independent data points. One conclusion: they&apos;re lying.
        </p>
      </div>

      {/* Funnel */}
      <div className="flex flex-col items-center gap-2 py-4">
        {data.funnelSteps.map((step, i) => {
          const widthPct = Math.max(15, (step.value / maxVal) * 100);
          const color = COLORS[i] ?? COLORS[COLORS.length - 1];
          const isLast = i === data.funnelSteps.length - 1;

          return (
            <motion.div
              key={step.label}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-sm overflow-hidden"
              style={{
                width: `${widthPct}%`,
                minWidth: 200,
                height: isLast ? 56 : 44,
                background: `linear-gradient(90deg, ${color}20, ${color}08)`,
                border: `1.5px solid ${color}${isLast ? "" : "66"}`,
                boxShadow: isLast ? `0 0 20px ${color}44, inset 0 0 12px ${color}22` : "none",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span
                  className="font-mono text-[10px] tracking-wide"
                  style={{ color: isLast ? color : "var(--foreground)" }}
                >
                  {step.label}
                </span>
                <span
                  className="font-mono font-bold"
                  style={{ color, fontSize: isLast ? 22 : 16 }}
                >
                  {step.value.toLocaleString()}
                </span>
              </div>
              {/* source tag */}
              <span className="absolute bottom-0.5 right-2 font-mono text-[7px] text-muted-2 opacity-60">
                {step.source}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Shrinkage arrow + rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="mt-4 rounded-md border border-threat/40 bg-black/40 p-4 text-center"
      >
        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-2 mb-1">
          ADMISSION RATE
        </p>
        <p className="font-mono text-4xl font-bold text-threat glow-threat">
          {data.admissionRate}%
        </p>
        <p className="font-mono text-xs text-muted mt-2 max-w-lg mx-auto leading-relaxed">
          The IDF admits only <span className="text-threat font-bold">{data.admissionRate}%</span> of
          estimated actual casualties. The gap between filmed drone kills and official figures
          is the proof they lie about losses.
        </p>
      </motion.div>

      {/* Key contrast block */}
      <div className="mt-3 rounded-md border border-borderc bg-black/30 px-3 py-2">
        <p className="text-xs text-muted leading-relaxed text-pretty">
          <span className="text-archive font-mono text-[9px] tracking-[0.1em] mr-2">EVIDENCE:</span>
          {data.keyContrast}
        </p>
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
