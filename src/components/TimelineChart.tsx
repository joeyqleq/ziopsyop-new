"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { SegToggle } from "@/components/fx/ChartFrame";

interface TimelineData {
  month: string;
  posts: number;
  comments: number;
  hebrew_posts: number;
  hebrew_comments: number;
}

interface Event {
  window_month: string;
  event_date: string;
  label: string;
  description: string;
}

interface Props {
  data: TimelineData[];
  events: Event[];
}

const MINT = "#3ee6c1";
const THREAT = "#ff4d5e";
const AMBER = "#e8b44c";

type Mode = "area" | "bars";
type Series = "all" | "hebrew";

export function TimelineChart({ data, events }: Props) {
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [mode, setMode] = useState<Mode>("area");
  const [series, setSeries] = useState<Series>("all");
  const [showEvents, setShowEvents] = useState(true);

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        total: d.posts + d.comments,
        hebrew_total: d.hebrew_posts + d.hebrew_comments,
        label: d.month.slice(2),
      })),
    [data]
  );

  const seriesDef =
    series === "all"
      ? [
          { key: "comments", color: MINT, name: "Comments" },
          { key: "posts", color: THREAT, name: "Posts" },
        ]
      : [
          { key: "hebrew_comments", color: AMBER, name: "Hebrew comments" },
          { key: "hebrew_posts", color: THREAT, name: "Hebrew posts" },
        ];

  const axisProps = {
    tick: { fill: "#565b64", fontSize: 10 },
    axisLine: { stroke: "rgba(232,234,233,0.08)" },
    tickLine: false as const,
  };

  const tooltipProps = {
    contentStyle: {
      background: "rgba(8,8,12,0.96)",
      border: "1px solid rgba(232,234,233,0.16)",
      borderRadius: 6,
      fontSize: 12,
      fontFamily: "var(--font-jet), monospace",
    },
    labelStyle: { color: MINT },
    cursor: { stroke: "rgba(232,234,233,0.15)" },
  };

  const refLines = showEvents
    ? events.map((evt) => (
        <ReferenceLine
          key={evt.event_date}
          x={evt.window_month.slice(2)}
          stroke="rgba(255,77,94,0.45)"
          strokeDasharray="3 3"
          onMouseEnter={() => setHoveredEvent(evt)}
          onMouseLeave={() => setHoveredEvent(null)}
        />
      ))
    : null;

  return (
    <div className="relative">
      {/* data-function controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <SegToggle<Mode>
            options={[
              { value: "area", label: "Area" },
              { value: "bars", label: "Bars" },
            ]}
            value={mode}
            onChange={setMode}
          />
          <SegToggle<Series>
            options={[
              { value: "all", label: "All traffic" },
              { value: "hebrew", label: "Hebrew only" },
            ]}
            value={series}
            onChange={setSeries}
            threat={series === "hebrew"}
          />
          <SegToggle<"on" | "off">
            options={[
              { value: "on", label: "Events" },
              { value: "off", label: "Hide" },
            ]}
            value={showEvents ? "on" : "off"}
            onChange={(v) => setShowEvents(v === "on")}
          />
        </div>
        <div className="flex gap-4 font-mono text-[10px] tracking-[0.15em] text-muted">
          {seriesDef.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 inline-block" style={{ background: s.color }} />
              {s.name.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        {mode === "area" ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {seriesDef.map((s) => (
                <linearGradient key={s.key} id={`tl-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="label" interval={5} {...axisProps} />
            <YAxis width={45} {...axisProps} axisLine={false} />
            <Tooltip {...tooltipProps} />
            {refLines}
            {seriesDef.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={1.5}
                fill={`url(#tl-${s.key})`}
                dot={false}
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap={1}>
            <XAxis dataKey="label" interval={5} {...axisProps} />
            <YAxis width={45} {...axisProps} axisLine={false} />
            <Tooltip {...tooltipProps} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            {refLines}
            {seriesDef.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stackId="a"
                fill={s.color}
                fillOpacity={0.75}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>

      {hoveredEvent && (
        <div className="absolute top-16 right-2 max-w-xs z-10 rounded-md border border-borderc bg-black/90 backdrop-blur-md p-3">
          <p className="font-mono text-[10px] tracking-[0.15em] text-threat">{hoveredEvent.event_date}</p>
          <p className="text-sm font-semibold mt-1 text-foreground">{hoveredEvent.label}</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">{hoveredEvent.description}</p>
        </div>
      )}
    </div>
  );
}
