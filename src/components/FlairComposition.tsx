"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SegToggle } from "@/components/fx/ChartFrame";

interface FlairMonth {
  month: string;
  categories: Record<string, { posts: number; comments: number; total: number }>;
}

interface Props {
  data: FlairMonth[];
}

const FLAIR_COLORS: Record<string, string> = {
  Israeli: "#ff4d5e",
  "Jewish/Diaspora": "#e8b44c",
  Lebanese: "#3ee6c1",
  "Unflaired/Other": "#565b64",
};

type Mode = "share" | "raw";

export function FlairComposition({ data }: Props) {
  const [mode, setMode] = useState<Mode>("share");

  const chartData = useMemo(() => {
    return data.map((d) => {
      const row: Record<string, string | number> = { month: d.month.slice(2) };
      const total = Object.values(d.categories).reduce((s, c) => s + c.total, 0) || 1;
      Object.keys(FLAIR_COLORS).forEach((cat) => {
        const val = d.categories[cat]?.total || 0;
        row[cat] = mode === "share" ? Math.round((val / total) * 100) : val;
      });
      return row;
    });
  }, [data, mode]);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <SegToggle<Mode>
          options={[
            { value: "share", label: "% Share" },
            { value: "raw", label: "Volume" },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="month"
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
            domain={mode === "share" ? [0, 100] : undefined}
            unit={mode === "share" ? "%" : undefined}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(8,8,12,0.96)",
              border: "1px solid rgba(232,234,233,0.16)",
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "var(--font-jet), monospace",
            }}
            formatter={(value, name) => [
              mode === "share" ? `${Number(value ?? 0)}%` : String(value ?? ""),
              name,
            ]}
          />
          <Legend
            wrapperStyle={{
              fontSize: 10,
              paddingTop: 8,
              fontFamily: "var(--font-jet), monospace",
              letterSpacing: "0.1em",
            }}
            iconType="square"
            iconSize={8}
          />
          {Object.entries(FLAIR_COLORS).map(([cat, color]) => (
            <Area
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={color}
              strokeWidth={0.5}
              fill={color}
              fillOpacity={0.65}
              stackId="1"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
