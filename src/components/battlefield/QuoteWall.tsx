"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { QuoteWall as QuoteData } from "@/lib/battlefield";

const AMBER = "#e8b44c";
const THREAT = "#ff4d5e";

export function QuoteWall({ data }: { data: QuoteData }) {
  return (
    <div>
      <p className="text-xs text-muted leading-relaxed mb-5 max-w-2xl text-pretty">
        Admissions against interest — statements by Israeli commanders, officials and media conceding the outcomes the
        official narrative denies. Each is sourced to Israeli outlets.
      </p>

      <div className="columns-1 md:columns-2 gap-3 [column-fill:_balance]">
        {data.quotes.map((q, i) => (
          <motion.figure
            key={q.speaker + i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 4) * 0.06 }}
            className="mb-3 break-inside-avoid rounded-md border border-borderc bg-card/50 p-4"
            style={{ borderLeft: `2px solid ${q.confirms ? THREAT : AMBER}` }}
          >
            <Quote size={16} style={{ color: q.confirms ? THREAT : AMBER }} className="mb-2 opacity-70" />
            <blockquote className="text-sm text-foreground leading-relaxed text-pretty">
              &ldquo;{q.text}&rdquo;
            </blockquote>
            <figcaption className="mt-3 pt-2.5 border-t border-borderc">
              <p className="font-mono text-[11px] tracking-[0.06em] text-foreground">{q.speaker}</p>
              {q.role && <p className="font-mono text-[9px] tracking-[0.1em] text-muted-2 mt-0.5">{q.role}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {q.outlet && <span className="font-mono text-[9px] text-muted">{q.outlet}</span>}
                {q.confirms && (
                  <span className="font-mono text-[8px] tracking-[0.12em] px-1.5 rounded-[3px] border border-threat/40 text-threat">
                    CONFIRMS HEZBOLLAH EFFECTIVENESS
                  </span>
                )}
              </div>
              {q.significance && (
                <p className="text-[11px] text-muted leading-relaxed mt-2 italic text-pretty">{q.significance}</p>
              )}
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
