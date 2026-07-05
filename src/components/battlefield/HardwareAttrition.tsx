"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { SegToggle } from "@/components/fx/ChartFrame";
import type { HardwareAttrition as HwData } from "@/lib/battlefield";
import { fmtUSD } from "@/lib/utils";

const PALETTE = ["#ff4d5e", "#e8b44c", "#5b9bff", "#3ee6c1", "#a78bfa", "#4ea8ff", "#ffd23f"];

type Metric = "lossUsd" | "count";

interface BarRow {
  category: string;
  count: number;
  lossUsd: number;
}

function HwTip({ active, payload, metric }: { active?: boolean; payload?: { payload: BarRow }[]; metric: Metric }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="text-foreground font-semibold mb-1">{d.category.replace(/_/g, " ")}</p>
      <p className="text-muted">Units lost: <span className="text-foreground">{d.count}</span></p>
      <p className="text-muted">Value: <span className="text-threat">{fmtUSD(d.lossUsd)}</span></p>
      <p className="font-mono text-[9px] text-muted-2 mt-1">{metric === "lossUsd" ? "sorted by value" : "sorted by units"}</p>
    </div>
  );
}

export function HardwareAttrition({ data }: { data: HwData }) {
  const [metric, setMetric] = useState<Metric>("lossUsd");
  const rows = [...data.categories].sort((a, b) => b[metric] - a[metric]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-3">
          <div className="rounded-md border border-borderc bg-black/25 px-3 py-1.5">
            <span className="font-mono text-[9px] tracking-[0.15em] text-muted-2">TOTAL UNITS</span>
            <p className="font-mono text-base font-bold text-threat">{data.totalUnits.toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-borderc bg-black/25 px-3 py-1.5">
            <span className="font-mono text-[9px] tracking-[0.15em] text-muted-2">TOTAL VALUE DESTROYED</span>
            <p className="font-mono text-base font-bold text-threat">{fmtUSD(data.totalLoss)}</p>
          </div>
        </div>
        <SegToggle<Metric>
          options={[
            { value: "lossUsd", label: "By value" },
            { value: "count", label: "By units" },
          ]}
          value={metric}
          onChange={setMetric}
          threat
        />
      </div>

      <ResponsiveContainer width="100%" height={Math.max(220, rows.length * 38)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 60, left: 8, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            width={120}
            tick={{ fill: "#8a8f98", fontSize: 9, fontFamily: "var(--font-jet), monospace" }}
            tickFormatter={(v: string) => v.replace(/_/g, " ")}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<HwTip metric={metric} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey={metric} radius={[0, 3, 3, 0]}>
            <LabelList
              dataKey={metric}
              position="right"
              fill="#8a8f98"
              fontSize={10}
              fontFamily="var(--font-jet), monospace"
              formatter={(v: unknown) => (metric === "lossUsd" ? fmtUSD(Number(v)) : String(v))}
            />
            {rows.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.82} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="mt-2 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
