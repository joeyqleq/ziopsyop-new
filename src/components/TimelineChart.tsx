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
  ReferenceArea,
  Brush,
} from "recharts";
import { SegToggle } from "@/components/fx/ChartFrame";

// ─── types ───────────────────────────────────────────────────────────────────

interface TimelineChartProps {
  data: Array<{
    month: string;
    posts: number;
    comments: number;
    hebrew_posts: number;
    hebrew_comments: number;
  }>;
  dailyData?: Array<{
    date: string;
    posts: number;
    comments: number;
    hebrew_comments: number;
    unique_users: number;
  }>;
  events: Array<{
    window_month: string;
    event_date: string;
    label: string;
    description: string;
    category?: string;
  }>;
  eras?: Array<{
    start: string;
    end: string;
    label: string;
    tone: string;
  }>;
}

type EventShape = TimelineChartProps["events"][number];
type Mode   = "area" | "bars";
type Series = "all" | "hebrew";
type Preset = "ALL" | "PRE-OCT7" | "OCT 7 ERA" | "INVASION" | "2026" | "CUSTOM";

// ─── constants ────────────────────────────────────────────────────────────────

const PRIMARY = "#b6ff7c";
const THREAT  = "#ff4d5e";
const AMBER   = "#e8b44c";

const ERA_COLORS: Record<string, string> = {
  active_war:        "rgba(255,77,94,0.07)",
  escalation:        "rgba(232,180,76,0.06)",
  ceasefire:         "rgba(182,255,124,0.06)",
  "de-escalation":   "rgba(91,155,255,0.05)",
  political:         "rgba(123,57,208,0.05)",
};

const PRESET_RANGES: Record<Preset, { start?: string; end?: string }> = {
  "ALL":       {},
  "PRE-OCT7":  { start: "2019-09", end: "2023-09" },
  "OCT 7 ERA": { start: "2023-10", end: "2024-03" },
  "INVASION":  { start: "2024-04", end: "2024-12" },
  "2026":      { start: "2026-01" },
  "CUSTOM":    {},
};

const PRESET_LIST: Preset[] = [
  "ALL",
  "PRE-OCT7",
  "OCT 7 ERA",
  "INVASION",
  "2026",
  "CUSTOM",
];

// ─── EraLabel — SVG text rendered inside ReferenceArea ────────────────────────

function EraLabel({
  viewBox,
  text,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
  text: string;
}) {
  if (!viewBox || viewBox.width < 24) return null;
  return (
    <text
      x={viewBox.x + viewBox.width / 2}
      y={viewBox.y + 13}
      textAnchor="middle"
      fill="rgba(255,255,255,0.20)"
      fontSize={8}
      fontFamily="var(--font-jet), monospace"
      letterSpacing={1}
    >
      {text.toUpperCase()}
    </text>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function TimelineChart({ data, events, eras }: TimelineChartProps) {
  const [hoveredEvent, setHoveredEvent] = useState<EventShape | null>(null);
  const [mode,         setMode]         = useState<Mode>("area");
  const [series,       setSeries]       = useState<Series>("all");
  const [showEvents,   setShowEvents]   = useState(true);
  const [preset,       setPreset]       = useState<Preset>("ALL");
  const [customStart,  setCustomStart]  = useState("");
  const [customEnd,    setCustomEnd]    = useState("");

  // base chart data with derived short label ("YYYY-MM" → "YY-MM")
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        total:        d.posts + d.comments,
        hebrew_total: d.hebrew_posts + d.hebrew_comments,
        label:        d.month.slice(2),
      })),
    [data]
  );

  // apply date-range filter
  const filteredData = useMemo(() => {
    if (preset === "ALL") return chartData;

    let start: string | undefined;
    let end:   string | undefined;

    if (preset === "CUSTOM") {
      start = customStart || undefined;
      end   = customEnd   || undefined;
    } else {
      const r = PRESET_RANGES[preset];
      start = r.start;
      end   = r.end;
    }

    return chartData.filter((d) => {
      if (start && d.month < start) return false;
      if (end   && d.month > end)   return false;
      return true;
    });
  }, [chartData, preset, customStart, customEnd]);

  // series config for current toggle
  const seriesDef =
    series === "all"
      ? [
          { key: "comments",        color: PRIMARY, name: "Comments"        },
          { key: "posts",           color: THREAT,  name: "Posts"           },
        ]
      : [
          { key: "hebrew_comments", color: AMBER,   name: "Hebrew comments" },
          { key: "hebrew_posts",    color: THREAT,  name: "Hebrew posts"    },
        ];

  // shared recharts props
  const axisProps = {
    tick:     { fill: "#565b64", fontSize: 10 },
    axisLine: { stroke: "rgba(232,234,233,0.08)" },
    tickLine: false as const,
  };

  const tooltipStyle = {
    contentStyle: {
      background:   "rgba(8,8,12,0.96)",
      border:       "1px solid rgba(232,234,233,0.16)",
      borderRadius: 6,
      fontSize:     12,
      fontFamily:   "var(--font-jet), monospace",
    },
    labelStyle: { color: PRIMARY },
    cursor:     { stroke: "rgba(232,234,233,0.15)" },
  };

  // era bands (rendered before data series so they sit behind)
  const eraAreas = eras?.map((era) => (
    <ReferenceArea
      key={`era-${era.label}`}
      x1={era.start.slice(2)}
      x2={era.end.slice(2)}
      fill={ERA_COLORS[era.tone] ?? "rgba(255,255,255,0.03)"}
      fillOpacity={1}
      stroke="none"
      label={<EraLabel text={era.label} />}
    />
  ));

  // event reference lines
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

  // brush (shared between both chart types)
  const brushEl = (
    <Brush
      dataKey="label"
      height={20}
      stroke="rgba(255,255,255,0.1)"
      fill="rgba(0,0,0,0.3)"
      travellerWidth={6}
      tickFormatter={(v: unknown) => String(v)}
    />
  );

  return (
    <div className="relative" tabIndex={-1}>

      {/* ── date range presets row ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="font-mono text-[10px] tracking-[0.15em] text-muted-2 shrink-0">
          RANGE
        </span>
        <div className="flex flex-wrap gap-1">
          {PRESET_LIST.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={[
                "font-mono text-[10px] tracking-[0.12em] px-2 py-0.5 rounded border transition-colors",
                preset === p
                  ? "border-primary text-primary"
                  : "border-borderc text-muted hover:text-foreground hover:border-muted",
              ].join(" ")}
              style={
                preset === p
                  ? { backgroundColor: "rgba(182,255,124,0.06)" }
                  : undefined
              }
            >
              {p}
            </button>
          ))}
        </div>

        {preset === "CUSTOM" && (
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="month"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="font-mono text-[10px] bg-black/60 border border-borderc rounded px-1.5 py-0.5 text-foreground"
            />
            <span className="font-mono text-[10px] text-muted-2">→</span>
            <input
              type="month"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="font-mono text-[10px] bg-black/60 border border-borderc rounded px-1.5 py-0.5 text-foreground"
            />
          </div>
        )}
      </div>

      {/* ── mode / series / events toggles row ──────────────────────────── */}
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
              { value: "all",    label: "All traffic" },
              { value: "hebrew", label: "Hebrew only" },
            ]}
            value={series}
            onChange={setSeries}
            threat={series === "hebrew"}
          />
          <SegToggle<"on" | "off">
            options={[
              { value: "on",  label: "Events" },
              { value: "off", label: "Hide"   },
            ]}
            value={showEvents ? "on" : "off"}
            onChange={(v) => setShowEvents(v === "on")}
          />
        </div>

        {/* legend */}
        <div className="flex gap-4 font-mono text-[10px] tracking-[0.15em] text-muted">
          {seriesDef.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 inline-block"
                style={{ background: s.color }}
              />
              {s.name.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* ── chart ───────────────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={340}>
        {mode === "area" ? (
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {seriesDef.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`tl-${s.key}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="0%"   stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="label" interval={5} {...axisProps} />
            <YAxis width={45} {...axisProps} axisLine={false} />
            <Tooltip {...tooltipStyle} />
            {eraAreas}
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
            {brushEl}
          </AreaChart>
        ) : (
          <BarChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barCategoryGap={1}
          >
            <XAxis dataKey="label" interval={5} {...axisProps} />
            <YAxis width={45} {...axisProps} axisLine={false} />
            <Tooltip
              {...tooltipStyle}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            {eraAreas}
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
            {brushEl}
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* ── hovered event tooltip ────────────────────────────────────────── */}
      {hoveredEvent && (
        <div
          className="absolute z-20 pointer-events-none bg-black/95 border border-borderc rounded p-3 max-w-[260px] font-mono text-[10px]"
          style={{ top: 16, right: 8 }}
        >
          <p className="text-threat mb-1">{hoveredEvent.event_date}</p>
          <p className="text-foreground font-bold mb-1">{hoveredEvent.label}</p>
          <p className="text-muted leading-relaxed">{hoveredEvent.description}</p>
          {hoveredEvent.category && (
            <span className="mt-1 inline-block px-1.5 py-0.5 border border-borderc rounded text-[9px] text-muted-2">
              {hoveredEvent.category.toUpperCase()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
