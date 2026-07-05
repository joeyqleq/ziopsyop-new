"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TargetingDisparity } from "@/lib/battlefield";

const MINT = "#3ee6c1";
const THREAT = "#ff4d5e";

interface TipPayload {
  payload: TargetingDisparity["dimensions"][number];
}

function RadarTip({ active, payload }: { active?: boolean; payload?: TipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip max-w-[240px]">
      <p className="text-foreground font-semibold mb-1.5">{d.dimension}</p>
      <p className="flex justify-between gap-4">
        <span style={{ color: MINT }}>HEZBOLLAH</span>
        <span className="text-foreground">{d.raw.hezbollah}</span>
      </p>
      <p className="flex justify-between gap-4">
        <span style={{ color: THREAT }}>IDF</span>
        <span className="text-foreground">{d.raw.idf}</span>
      </p>
    </div>
  );
}

export function TargetingRadar({ data }: { data: TargetingDisparity }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex gap-4 font-mono text-[10px] tracking-[0.15em] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 inline-block" style={{ background: MINT }} />
            HEZBOLLAH · {data.hezStrikes.toLocaleString()} STRIKES
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 inline-block" style={{ background: THREAT }} />
            IDF · {data.idfStrikes.toLocaleString()} STRIKES
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-[0.15em] text-muted-2">
          NORMALISED HARM INDEX · 0–100
        </span>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={data.dimensions} outerRadius="72%">
          <PolarGrid stroke="rgba(232,234,233,0.10)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#8a8f98", fontSize: 10, fontFamily: "var(--font-jet), monospace" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#565b64", fontSize: 9 }}
            axisLine={false}
            tickCount={5}
          />
          <Tooltip content={<RadarTip />} />
          <Radar name="IDF" dataKey="idf" stroke={THREAT} fill={THREAT} fillOpacity={0.28} strokeWidth={1.5} />
          <Radar
            name="Hezbollah"
            dataKey="hezbollah"
            stroke={MINT}
            fill={MINT}
            fillOpacity={0.18}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid gap-3 md:grid-cols-2 mt-2">
        <div className="rounded-md border border-borderc bg-black/25 p-3">
          <p className="font-mono text-[9px] tracking-[0.2em] mb-1.5" style={{ color: MINT }}>
            HEZBOLLAH — IHL ASSESSMENT
          </p>
          <p className="text-xs text-muted leading-relaxed text-pretty">{data.hezAssessment}</p>
        </div>
        <div className="rounded-md border border-borderc bg-black/25 p-3">
          <p className="font-mono text-[9px] tracking-[0.2em] mb-1.5" style={{ color: THREAT }}>
            IDF — IHL ASSESSMENT
          </p>
          <p className="text-xs text-muted leading-relaxed text-pretty">{data.idfAssessment}</p>
        </div>
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">SOURCE: {data.source}</p>
    </div>
  );
}
