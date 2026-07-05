"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SayVsDoData } from "@/lib/battlefield";

const THREAT = "#ff4d5e";
const MINT = "#3ee6c1";

export function SayVsDo({ data }: { data: SayVsDoData }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 mb-1">
          CLAIM VS DOCUMENTED REALITY
        </p>
        <p className="text-xs text-muted">
          IDF commanders on record — then what actually happened.
        </p>
      </div>

      <div className="space-y-3">
        {data.entries.map((entry, i) => {
          const isOpen = expanded === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-md border border-borderc bg-black/30 overflow-hidden cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : i)}
            >
              {/* Quote (the claim) */}
              <div className="p-3 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold"
                    style={{
                      background: `${THREAT}15`,
                      color: THREAT,
                      border: `1px solid ${THREAT}44`,
                    }}
                  >
                    {entry.lieScore}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground italic leading-snug">
                    &ldquo;{entry.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-[9px] text-muted">
                      {entry.speaker}
                    </span>
                    {entry.date && (
                      <span className="font-mono text-[8px] text-muted-2">
                        {entry.date}
                      </span>
                    )}
                    <span className="font-mono text-[8px] text-muted-2">
                      ({entry.outlet})
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="block text-muted text-xs"
                  >
                    ▾
                  </motion.span>
                </div>
              </div>

              {/* Outcome (reality) */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-3 py-3 border-t border-borderc"
                      style={{ background: `${MINT}06` }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className="font-mono text-[8px] tracking-[0.15em] flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded-sm"
                          style={{
                            color: MINT,
                            background: `${MINT}15`,
                            border: `1px solid ${MINT}33`,
                          }}
                        >
                          REALITY
                        </span>
                        <p className="text-xs text-foreground leading-relaxed">
                          {entry.outcome}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-md border border-borderc bg-black/40 p-3 text-center">
        <p className="font-mono text-[10px] text-muted">
          <span style={{ color: THREAT }}>{data.entries.length} claims</span> from IDF
          leadership. <span style={{ color: MINT }}>{data.entries.filter((e) => e.lieScore >= 9).length} directly
          contradicted</span> by their own documented outcomes.
        </p>
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
