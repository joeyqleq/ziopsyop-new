"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { SegToggle } from "@/components/fx/ChartFrame";

interface Spike {
  month: string;
  posts: number;
  comments: number;
  total: number;
  post_zscore: number;
  comment_zscore: number;
}

interface Props {
  data: Spike[];
}

type Metric = "comment_zscore" | "post_zscore";

const SIGMA = 1.5;

export function AnomalyDetector({ data }: Props) {
  const [metric, setMetric] = useState<Metric>("comment_zscore");

  const chartData = useMemo(
    () => data.map((d) => ({ ...d, label: d.month.slice(2) })),
    [data]
  );

  const anomalies = useMemo(
    () => chartData.filter((d) => d[metric] > SIGMA).length,
    [chartData, metric]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <SegToggle<Metric>
          options={[
            { value: "comment_zscore", label: "Comments σ" },
            { value: "post_zscore", label: "Posts σ" },
          ]}
          value={metric}
          onChange={setMetric}
        />
        <p className="font-mono text-[10px] tracking-[0.15em] text-muted">
          <span className="text-threat">{anomalies}</span> MONTHS EXCEED +{SIGMA}σ
          BASELINE
        </p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#565b64", fontSize: 9 }}
            interval={7}
            axisLine={{ stroke: "rgba(232,234,233,0.08)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#565b64", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={40}
            label={{
              value: "σ from baseline",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#565b64", fontSize: 9, fontFamily: "var(--font-jet), monospace" },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(8,8,12,0.96)",
              border: "1px solid rgba(232,234,233,0.16)",
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "var(--font-jet), monospace",
            }}
            formatter={(v) => [`${Number(v ?? 0).toFixed(2)}σ`, "deviation"]}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <ReferenceLine
            y={SIGMA}
            stroke="rgba(255,77,94,0.6)"
            strokeDasharray="4 4"
            label={{
              value: `+${SIGMA}σ anomaly threshold`,
              position: "insideTopRight",
              style: { fill: "#ff4d5e", fontSize: 9, fontFamily: "var(--font-jet), monospace" },
            }}
          />
          <ReferenceLine y={0} stroke="rgba(232,234,233,0.15)" />
          <Bar dataKey={metric} radius={[2, 2, 0, 0]}>
            {chartData.map((d) => (
              <Cell
                key={d.month}
                fill={d[metric] > SIGMA ? "#ff4d5e" : "rgba(62,230,193,0.45)"}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
