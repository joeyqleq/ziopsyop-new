"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { StrikeTaxonomy as TaxData } from "@/lib/battlefield";

const PALETTE = ["#3ee6c1", "#5b9bff", "#e8b44c", "#ff4d5e", "#a78bfa", "#4ea8ff", "#ffd23f", "#2dd4bf"];

export function StrikeTaxonomy({ data }: { data: TaxData }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-2">CONFIRMED HEZBOLLAH STRIKES BY TARGET CLASS</p>
          <p className="font-mono text-2xl font-bold text-primary glow-primary mt-1">
            {data.totalStrikes.toLocaleString()} <span className="text-sm text-muted">documented strikes</span>
          </p>
        </div>
        <p className="font-mono text-[9px] tracking-[0.12em] text-muted-2 max-w-[220px] text-right">
          Every confirmed strike classified — the distribution shows an exclusively military target profile.
        </p>
      </div>

      {/* proportion bar — single 100% stacked rail */}
      <div className="flex h-9 w-full overflow-hidden rounded-md border border-borderc">
        {data.categories.map((c, i) => (
          <motion.button
            key={c.label}
            initial={{ width: 0 }}
            whileInView={{ width: `${c.pct}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="h-full relative group"
            style={{
              background: PALETTE[i % PALETTE.length],
              opacity: active === null || active === i ? 0.9 : 0.35,
            }}
            aria-label={`${c.label}: ${c.pct}%`}
          />
        ))}
      </div>

      {/* legend / breakdown */}
      <div className="grid gap-2 sm:grid-cols-2 mt-4">
        {data.categories.map((c, i) => (
          <div
            key={c.label}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="flex items-center justify-between rounded-md border border-borderc bg-card/40 px-3 py-2 transition-opacity"
            style={{ opacity: active === null || active === i ? 1 : 0.5 }}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="font-mono text-[11px] text-foreground truncate">{c.label}</span>
            </span>
            <span className="flex items-baseline gap-2 shrink-0 font-mono">
              <span className="text-sm font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>{c.pct}%</span>
              <span className="text-[10px] text-muted-2">{c.count.toLocaleString()}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
