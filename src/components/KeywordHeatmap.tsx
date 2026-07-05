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

interface KeywordData {
  month: string;
  hezbollah: number;
  iran: number;
  peace: number;
  sectarian: number;
  gaza_palestine: number;
  identity: number;
}

interface Props {
  data: KeywordData[];
}

const KEYWORD_COLORS: Record<string, string> = {
  hezbollah: "#ff4d5e",
  iran: "#e8b44c",
  sectarian: "#a78bfa",
  gaza_palestine: "#5b9bff",
  peace: "#3ee6c1",
  identity: "#8a8f98",
};

const KEYS = Object.keys(KEYWORD_COLORS);

type Norm = "raw" | "share";

export function KeywordHeatmap({ data }: Props) {
  const [norm, setNorm] = useState<Norm>("raw");

  const chartData = useMemo(() => {
    return data.map((d) => {
      const label = d.month.slice(2);
      if (norm === "raw") return { ...d, label };
      const total = KEYS.reduce((s, k) => s + (d[k as keyof KeywordData] as number), 0) || 1;
      const row: Record<string, string | number> = { label };
      KEYS.forEach((k) => {
        row[k] = Math.round(((d[k as keyof KeywordData] as number) / total) * 100);
      });
      return row;
    });
  }, [data, norm]);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <SegToggle<Norm>
          options={[
            { value: "raw", label: "Counts" },
            { value: "share", label: "% Share" },
          ]}
          value={norm}
          onChange={setNorm}
        />
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {Object.entries(KEYWORD_COLORS).map(([key, color]) => (
              <linearGradient key={key} id={`kw-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0.04} />
              </linearGradient>
            ))}
          </defs>
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
            unit={norm === "share" ? "%" : undefined}
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
              norm === "share" ? `${value}%` : String(value ?? ""),
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
          {Object.entries(KEYWORD_COLORS).map(([key, color]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={1.2}
              fill={`url(#kw-${key})`}
              dot={false}
              stackId="1"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
