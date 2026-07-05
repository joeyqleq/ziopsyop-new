"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface UserSentiment {
  username: string;
  flair: string;
  data: Array<{ period: string; score: number }>;
  shiftMagnitude: number;
}

const EXCLUDED_USER = "joeyleq";

const SAMPLE_USERS: UserSentiment[] = [
  { username: "EmperorChaos", flair: "Lebanese", shiftMagnitude: 1.2, data: [
    { period: "2024-H1", score: -6 }, { period: "2024-H2", score: -7 }, { period: "2025-H1", score: -5 }, { period: "2025-H2", score: -6 }, { period: "2026-H1", score: -7 },
  ]},
  { username: "cha3bghachim", flair: "Lebanese", shiftMagnitude: 2.8, data: [
    { period: "2024-H1", score: -4 }, { period: "2024-H2", score: -5 }, { period: "2025-H1", score: -3 }, { period: "2025-H2", score: -2 }, { period: "2026-H1", score: -1 },
  ]},
  { username: "levnon14", flair: "Lebanese", shiftMagnitude: 0.5, data: [
    { period: "2024-H1", score: -5 }, { period: "2024-H2", score: -6 }, { period: "2025-H1", score: -5 }, { period: "2025-H2", score: -5 }, { period: "2026-H1", score: -5 },
  ]},
  { username: "victoryismind", flair: "Lebanese", shiftMagnitude: 4.2, data: [
    { period: "2024-H1", score: -3 }, { period: "2024-H2", score: -4 }, { period: "2025-H1", score: -1 }, { period: "2025-H2", score: 1 }, { period: "2026-H1", score: 1 },
  ]},
  { username: "DaDerpyDude", flair: "Israeli", shiftMagnitude: 0.8, data: [
    { period: "2024-H1", score: 6 }, { period: "2024-H2", score: 7 }, { period: "2025-H1", score: 6 }, { period: "2025-H2", score: 6 }, { period: "2026-H1", score: 5 },
  ]},
  { username: "tFighterPilot", flair: "Israeli", shiftMagnitude: 0.5, data: [
    { period: "2024-H1", score: 8 }, { period: "2024-H2", score: 8 }, { period: "2025-H1", score: 7 }, { period: "2025-H2", score: 8 }, { period: "2026-H1", score: 7 },
  ]},
  { username: "OptimismNeeded", flair: "Israeli", shiftMagnitude: 1.0, data: [
    { period: "2024-H1", score: 4 }, { period: "2024-H2", score: 5 }, { period: "2025-H1", score: 5 }, { period: "2025-H2", score: 4 }, { period: "2026-H1", score: 4 },
  ]},
  { username: "ConnorStreetmann", flair: "No flair", shiftMagnitude: 0.3, data: [
    { period: "2024-H1", score: 7 }, { period: "2024-H2", score: 8 }, { period: "2025-H1", score: 7 }, { period: "2025-H2", score: 7 }, { period: "2026-H1", score: 7 },
  ]},
  { username: "Curious_Diver1005", flair: "Lebanese", shiftMagnitude: 5.5, data: [
    { period: "2024-H1", score: -6 }, { period: "2024-H2", score: -4 }, { period: "2025-H1", score: -1 }, { period: "2025-H2", score: 0 }, { period: "2026-H1", score: -1 },
  ]},
  { username: "LevantinePlantCult", flair: "Lebanese", shiftMagnitude: 3.0, data: [
    { period: "2024-H1", score: -2 }, { period: "2024-H2", score: -3 }, { period: "2025-H1", score: 0 }, { period: "2025-H2", score: 1 }, { period: "2026-H1", score: 1 },
  ]},
].filter((u) => u.username.toLowerCase() !== EXCLUDED_USER);

const FLAIR_LINE_COLORS: Record<string, string> = {
  Lebanese: "#ef4444",
  Israeli: "#3b82f6",
  "No flair": "#6b7280",
  "Jewish/Diaspora": "#8b5cf6",
};

export function SentimentDrift() {
  const periods = ["2024-H1", "2024-H2", "2025-H1", "2025-H2", "2026-H1"];

  const chartData = useMemo(() => {
    return periods.map((period) => {
      const row: Record<string, number | string> = { period };
      SAMPLE_USERS.forEach((user) => {
        const point = user.data.find((d) => d.period === period);
        if (point) row[user.username] = point.score;
      });
      return row;
    });
  }, []);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="period"
            tick={{ fill: "#666", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#333" }}
          />
          <YAxis
            domain={[-10, 10]}
            tick={{ fill: "#666", fontSize: 10, fontFamily: "monospace" }}
            axisLine={{ stroke: "#333" }}
            label={{ value: "← Anti-Israel / Pro-Israel →", angle: -90, position: "insideLeft", fill: "#666", fontSize: 9 }}
          />
          <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,30,0.95)",
              border: "1px solid rgba(0,245,255,0.3)",
              borderRadius: 8,
              fontSize: 11,
              fontFamily: "monospace",
            }}
          />
          {SAMPLE_USERS.map((user) => (
            <Line
              key={user.username}
              type="monotone"
              dataKey={user.username}
              stroke={FLAIR_LINE_COLORS[user.flair] || "#888"}
              strokeWidth={user.shiftMagnitude > 3 ? 2.5 : 1.5}
              strokeDasharray={user.shiftMagnitude > 4 ? "none" : "4 2"}
              dot={{ r: user.shiftMagnitude > 3 ? 4 : 2, fill: FLAIR_LINE_COLORS[user.flair] || "#888" }}
              opacity={user.shiftMagnitude > 2 ? 1 : 0.6}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="neo-inset p-4">
        <p className="text-[10px] font-mono text-cyan-400 mb-2">SIGNIFICANT SHIFTS (Δ &gt; 3 points)</p>
        <div className="space-y-1">
          {SAMPLE_USERS.filter((u) => u.shiftMagnitude > 3).map((user) => (
            <div key={user.username} className="flex items-center gap-2 text-xs">
              <span className="text-rose-400">⚡</span>
              <span className="text-gray-300">u/{user.username}</span>
              <span className="text-gray-500">({user.flair})</span>
              <span className="text-amber-400">Δ{user.shiftMagnitude.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
