"use client";

import { motion } from "framer-motion";
import { XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ObjectivesScorecard as ScorecardData } from "@/lib/battlefield";

const THREAT = "#ff4d5e";
const AMBER = "#e8b44c";
const MINT = "#3ee6c1";

type Status = "FAILED" | "PARTIAL" | "ACHIEVED";

const STATUS_META: Record<Status, { color: string; icon: typeof XCircle; label: string }> = {
  FAILED: { color: THREAT, icon: XCircle, label: "FAILED" },
  PARTIAL: { color: AMBER, icon: AlertTriangle, label: "PARTIAL" },
  ACHIEVED: { color: MINT, icon: CheckCircle2, label: "ACHIEVED" },
};

export function ObjectivesScorecard({ data }: { data: ScorecardData }) {
  const failed = data.objectives.filter((o) => o.status === "FAILED").length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-2">STATED WAR OBJECTIVES — OUTCOME AUDIT</span>
        <span className="font-mono text-[10px] tracking-[0.15em] px-2 py-0.5 rounded-[3px] border border-threat/40 text-threat">
          {failed}/{data.objectives.length} FAILED
        </span>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2">
        {data.objectives.map((o, i) => {
          const meta = STATUS_META[o.status as Status] ?? STATUS_META.FAILED;
          const Icon = meta.icon;
          return (
            <motion.div
              key={o.objective}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-md border border-borderc bg-card/50 p-3.5"
              style={{ borderLeft: `2px solid ${meta.color}` }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs text-foreground font-medium leading-snug text-pretty">{o.objective}</p>
                <span
                  className="shrink-0 inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.12em]"
                  style={{ color: meta.color }}
                >
                  <Icon size={12} />
                  {meta.label}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed text-pretty">{o.detail}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-threat/40 bg-threat/5 px-4 py-3 text-center">
        <p className="font-mono text-[9px] tracking-[0.25em] text-muted-2 mb-1">OVERALL CAMPAIGN OUTCOME</p>
        <p className="font-mono text-xl font-bold text-threat tracking-[0.1em]">{data.overallStatus}</p>
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
