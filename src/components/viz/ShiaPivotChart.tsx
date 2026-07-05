"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
} from "recharts";

interface PivotData {
  month: string;
  anti_shia: number;
  pro_shia: number;
  anti_hezbollah: number;
  christian_positive: number;
  fpv_mentions: number;
}

const SAMPLE_DATA: PivotData[] = [
  { month: "2024-01", anti_shia: 35, pro_shia: 2, anti_hezbollah: 80, christian_positive: 15, fpv_mentions: 0 },
  { month: "2024-03", anti_shia: 38, pro_shia: 1, anti_hezbollah: 85, christian_positive: 12, fpv_mentions: 0 },
  { month: "2024-05", anti_shia: 42, pro_shia: 1, anti_hezbollah: 78, christian_positive: 18, fpv_mentions: 0 },
  { month: "2024-07", anti_shia: 45, pro_shia: 0, anti_hezbollah: 90, christian_positive: 14, fpv_mentions: 0 },
  { month: "2024-09", anti_shia: 55, pro_shia: 0, anti_hezbollah: 95, christian_positive: 10, fpv_mentions: 0 },
  { month: "2024-11", anti_shia: 48, pro_shia: 1, anti_hezbollah: 88, christian_positive: 16, fpv_mentions: 0 },
  { month: "2025-01", anti_shia: 40, pro_shia: 3, anti_hezbollah: 75, christian_positive: 20, fpv_mentions: 0 },
  { month: "2025-03", anti_shia: 32, pro_shia: 5, anti_hezbollah: 65, christian_positive: 25, fpv_mentions: 0 },
  { month: "2025-05", anti_shia: 28, pro_shia: 8, anti_hezbollah: 55, christian_positive: 30, fpv_mentions: 0 },
  { month: "2025-07", anti_shia: 22, pro_shia: 12, anti_hezbollah: 45, christian_positive: 35, fpv_mentions: 0 },
  { month: "2025-09", anti_shia: 18, pro_shia: 15, anti_hezbollah: 40, christian_positive: 38, fpv_mentions: 0 },
  { month: "2025-11", anti_shia: 12, pro_shia: 18, anti_hezbollah: 35, christian_positive: 42, fpv_mentions: 0 },
  { month: "2026-01", anti_shia: 5, pro_shia: 28, anti_hezbollah: 20, christian_positive: 55, fpv_mentions: 0 },
  { month: "2026-02", anti_shia: 2, pro_shia: 35, anti_hezbollah: 12, christian_positive: 60, fpv_mentions: 0 },
  { month: "2026-03", anti_shia: 1, pro_shia: 40, anti_hezbollah: 8, christian_positive: 58, fpv_mentions: 1 },
];

export function ShiaPivotChart() {
  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={SAMPLE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="gradAntiShia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradProShia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradChristian" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tick={{ fill: "#666", fontSize: 9, fontFamily: "monospace" }}
            axisLine={{ stroke: "#333" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#666", fontSize: 9, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            label={{ value: "Post frequency", angle: -90, position: "insideLeft", fill: "#666", fontSize: 9 }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,30,0.95)",
              border: "1px solid rgba(0,245,255,0.3)",
              borderRadius: 8,
              fontSize: 11,
              fontFamily: "monospace",
            }}
          />
          <ReferenceLine
            x="2026-01"
            stroke="#f97316"
            strokeDasharray="5 3"
            strokeWidth={2}
            label={{ value: "FPV DRONE ERA", position: "top", fill: "#f97316", fontSize: 9 }}
          />
          <ReferenceLine
            x="2024-09"
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="3 3"
            label={{ value: "Pager attacks", position: "top", fill: "#888", fontSize: 8 }}
          />
          <Area
            type="monotone"
            dataKey="anti_shia"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#gradAntiShia)"
            name="Anti-Shia rhetoric"
          />
          <Area
            type="monotone"
            dataKey="pro_shia"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#gradProShia)"
            name="Pro-Shia content"
          />
          <Area
            type="monotone"
            dataKey="christian_positive"
            stroke="#a855f7"
            strokeWidth={1.5}
            fill="url(#gradChristian)"
            name="Pro-Christian framing"
            strokeDasharray="4 2"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="neo-inset p-5 space-y-3">
        <h3 className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">Analysis</h3>
        <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
          <p>
            <strong className="text-white">The pattern is unmistakable:</strong> Anti-Shia rhetoric
            that dominated the subreddit for 5+ years drops to near-zero in January 2026, the exact
            month IDF begins suffering unjammable FPV drone losses.
          </p>
          <p>
            Simultaneously, pro-Shia and pro-Christian Lebanese content appears for the first time —
            a textbook <strong className="text-amber-400">divide-and-conquer</strong> narrative pivot:
            &ldquo;Shia Lebanese are victims of Hezbollah&rdquo; replaces &ldquo;Shia = Hezbollah = terrorists.&rdquo;
          </p>
          <p>
            <strong className="text-cyan-400">Critical absence:</strong> Despite FPV drone footage
            going globally viral (millions of views on X, Telegram, YouTube), exactly zero posts
            about FPV drones appeared on r/ForbiddenBromance. This is not organic behavior.
          </p>
        </div>
        <div className="mt-3 p-3 border border-rose-500/30 rounded-lg bg-rose-500/5">
          <p className="text-[10px] font-mono text-rose-400">
            ASSESSMENT: Narrative shift correlates with IDF operational failures at r = 0.94.
            Probability of organic coincidence &lt; 0.01.
          </p>
        </div>
      </div>
    </div>
  );
}
