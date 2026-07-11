"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Brush,
  Legend,
} from "recharts";
import { SegToggle } from "@/components/fx/ChartFrame";

// ─── types ───────────────────────────────────────────────────────────────────

export interface GrowthPoint {
  month: string; // YYYY-MM
  cumulative_unique_users: number;
  new_users_this_month: number;
  active_users: number;
  subscriber_count: number;
  posts: number;
  comments: number;
  israeli_flair_users: number;
  lebanese_flair_users: number;
  other_flair_users: number;
  no_flair_users: number;
}

export interface SubredditGrowthProps {
  data: GrowthPoint[];
  eras?: Array<{ start: string; end: string; label: string; tone: string }>;
}

type TabId = "GROWTH" | "ACTIVITY" | "IDENTITY" | "CONTENT";
const TABS: { value: TabId; label: string }[] = [
  { value: "GROWTH", label: "GROWTH" },
  { value: "ACTIVITY", label: "ACTIVITY" },
  { value: "IDENTITY", label: "IDENTITY" },
  { value: "CONTENT", label: "CONTENT" },
];

// ─── palette ──────────────────────────────────────────────────────────────────

const PRIMARY   = "#b6ff7c";
const THREAT    = "#ff4d5e";
const AMBER     = "#e8b44c";
const PURPLE    = "#7b39d0";
const VIZ_BLUE  = "#5b9bff";

const ERA_COLORS: Record<string, string> = {
  active_war:       "rgba(255,77,94,0.07)",
  escalation:       "rgba(232,180,76,0.06)",
  ceasefire:        "rgba(182,255,124,0.06)",
  "de-escalation":  "rgba(91,155,255,0.05)",
  political:        "rgba(123,57,208,0.05)",
};

// ─── shared axis / tooltip style ─────────────────────────────────────────────

const axisProps = {
  tick:     { fill: "#565b64", fontSize: 10, fontFamily: "var(--font-jet), monospace" },
  axisLine: { stroke: "rgba(232,234,233,0.08)" },
  tickLine: false as const,
};

const tooltipStyle = {
  contentStyle: {
    background:   "rgba(8,8,12,0.96)",
    border:       "1px solid rgba(232,234,233,0.16)",
    borderRadius: 6,
    fontSize:     11,
    fontFamily:   "var(--font-jet), monospace",
  },
  labelStyle: { color: PRIMARY },
  cursor:     { stroke: "rgba(232,234,233,0.15)" },
};

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

// ─── EraLabel ─────────────────────────────────────────────────────────────────

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
      fill="rgba(255,255,255,0.18)"
      fontSize={8}
      fontFamily="var(--font-jet), monospace"
      letterSpacing={1}
    >
      {text.toUpperCase()}
    </text>
  );
}

// ─── helper: build era ReferenceAreas ────────────────────────────────────────

function buildEraAreas(
  eras: SubredditGrowthProps["eras"],
  labelKey: (m: string) => string
) {
  if (!eras) return null;
  return eras.map((era) => (
    <ReferenceArea
      key={`era-${era.label}`}
      x1={labelKey(era.start)}
      x2={labelKey(era.end)}
      fill={ERA_COLORS[era.tone] ?? "rgba(255,255,255,0.03)"}
      fillOpacity={1}
      stroke="none"
      label={<EraLabel text={era.label} />}
    />
  ));
}

// ─── S-curve reference generator ─────────────────────────────────────────────

function sCurveRef(n: number, peak: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return Math.round(peak / (1 + Math.exp(-10 * (t - 0.5))));
  });
}

// ─── main component ───────────────────────────────────────────────────────────

export function SubredditGrowth({ data, eras }: SubredditGrowthProps) {
  const [tab, setTab] = useState<TabId>("GROWTH");

  // enrich data with short label
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: d.month.slice(2),
      })),
    [data]
  );

  // s-curve reference
  const sCurve = useMemo(() => {
    const peak = Math.max(...data.map((d) => d.cumulative_unique_users));
    return sCurveRef(data.length, peak);
  }, [data]);

  const enrichedData = useMemo(
    () =>
      chartData.map((d, i) => ({
        ...d,
        s_curve_ref: sCurve[i] ?? 0,
      })),
    [chartData, sCurve]
  );

  // identity forensics stats
  const identityStats = useMemo(() => {
    const peakIsraeli   = Math.max(...data.map((d) => d.israeli_flair_users));
    const peakLebanese  = Math.max(...data.map((d) => d.lebanese_flair_users));
    const ratio         = peakLebanese > 0
      ? (peakIsraeli / peakLebanese).toFixed(1)
      : "∞";
    return { peakIsraeli, peakLebanese, ratio };
  }, [data]);

  // find first month where israeli >= 3x lebanese
  const threeToOneMonth = useMemo(() => {
    const found = data.find(
      (d) =>
        d.lebanese_flair_users > 0 &&
        d.israeli_flair_users >= 3 * d.lebanese_flair_users
    );
    return found ? found.month.slice(2) : null;
  }, [data]);

  const labelKey = (m: string) => m.slice(2);
  const eraAreas = buildEraAreas(eras, labelKey);

  return (
    <div className="border border-borderc rounded bg-surface/40 p-4 font-mono">
      {/* header + tab selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
          Subreddit Growth Analysis
        </p>
        <SegToggle
          options={TABS}
          value={tab}
          onChange={(v) => setTab(v as TabId)}
        />
      </div>

      {/* ── GROWTH tab ────────────────────────────────────────────────────── */}
      {tab === "GROWTH" && (
        <div tabIndex={-1}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={enrichedData} margin={{ top: 8, right: 48, bottom: 0, left: 0 }}>
              {eraAreas}
              <XAxis dataKey="label" {...axisProps} />
              <YAxis
                yAxisId="left"
                {...axisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                {...axisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip {...tooltipStyle} />
              {/* s-curve reference — faint dashed */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="s_curve_ref"
                stroke="rgba(182,255,124,0.2)"
                strokeDasharray="4 3"
                dot={false}
                strokeWidth={1}
                name="Natural S-curve"
              />
              {/* cumulative unique users */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cumulative_unique_users"
                stroke={PRIMARY}
                fill="rgba(182,255,124,0.08)"
                strokeWidth={2}
                dot={false}
                name="Cumulative unique users"
              />
              {/* subscriber count — right axis */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="subscriber_count"
                stroke={AMBER}
                strokeWidth={1.5}
                dot={false}
                name="Subscriber count"
              />
              {brushEl}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-[10px] text-muted">
            <span><span style={{ color: PRIMARY }}>━</span> Cumulative unique users</span>
            <span><span style={{ color: AMBER }}>━</span> Subscriber count (right axis)</span>
            <span><span style={{ color: "rgba(182,255,124,0.4)" }}>╌</span> Natural S-curve ref</span>
          </div>
        </div>
      )}

      {/* ── ACTIVITY tab ───────────────────────────────────────────────────── */}
      {tab === "ACTIVITY" && (
        <div tabIndex={-1}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={enrichedData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {eraAreas}
              <XAxis dataKey="label" {...axisProps} />
              <YAxis
                {...axisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip {...tooltipStyle} />
              <Bar
                dataKey="new_users_this_month"
                fill={PURPLE}
                opacity={0.8}
                name="New users this month"
              />
              <Line
                type="monotone"
                dataKey="active_users"
                stroke={PRIMARY}
                strokeWidth={2}
                dot={false}
                name="Active users"
              />
              {brushEl}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-[10px] text-muted">
            <span><span style={{ color: PURPLE }}>█</span> New users / month</span>
            <span><span style={{ color: PRIMARY }}>━</span> Active users</span>
          </div>
        </div>
      )}

      {/* ── IDENTITY tab ───────────────────────────────────────────────────── */}
      {tab === "IDENTITY" && (
        <div tabIndex={-1}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={enrichedData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {eraAreas}
              <XAxis dataKey="label" {...axisProps} />
              <YAxis
                {...axisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip {...tooltipStyle} />
              {threeToOneMonth && (
                <ReferenceLine
                  x={threeToOneMonth}
                  stroke={THREAT}
                  strokeDasharray="4 3"
                  label={{
                    value: "3:1 RATIO",
                    position: "insideTopRight",
                    fill: THREAT,
                    fontSize: 9,
                    fontFamily: "var(--font-jet), monospace",
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="no_flair_users"
                stackId="1"
                stroke="none"
                fill="rgba(232,234,233,0.10)"
                name="No flair"
              />
              <Area
                type="monotone"
                dataKey="other_flair_users"
                stackId="1"
                stroke="none"
                fill={AMBER}
                fillOpacity={0.55}
                name="Other flair"
              />
              <Area
                type="monotone"
                dataKey="lebanese_flair_users"
                stackId="1"
                stroke={VIZ_BLUE}
                strokeWidth={1}
                fill={VIZ_BLUE}
                fillOpacity={0.55}
                name="Lebanese flair"
              />
              <Area
                type="monotone"
                dataKey="israeli_flair_users"
                stackId="1"
                stroke={THREAT}
                strokeWidth={1}
                fill={THREAT}
                fillOpacity={0.75}
                name="Israeli flair"
              />
              {brushEl}
            </AreaChart>
          </ResponsiveContainer>

          {/* forensic annotation */}
          <p className="mt-2 text-[10px] tracking-[0.14em] text-muted uppercase">
            Identity Claim vs Reality —{" "}
            <span className="text-threat">
              the &ldquo;Lebanese dialogue space&rdquo; is majority Israeli.
            </span>
          </p>

          {/* forensic stats box */}
          <div className="mt-3 flex flex-wrap gap-4 border border-borderc rounded px-3 py-2 bg-black/30 text-[11px]">
            <span>
              <span className="text-muted tracking-widest text-[10px]">PEAK ISRAELI USERS</span>{" "}
              <span className="text-threat font-bold">
                {identityStats.peakIsraeli.toLocaleString()}
              </span>
            </span>
            <span className="text-muted-2">|</span>
            <span>
              <span className="text-muted tracking-widest text-[10px]">PEAK LEBANESE USERS</span>{" "}
              <span className="text-viz-blue font-bold">
                {identityStats.peakLebanese.toLocaleString()}
              </span>
            </span>
            <span className="text-muted-2">|</span>
            <span>
              <span className="text-muted tracking-widest text-[10px]">RATIO</span>{" "}
              <span className="text-archive font-bold">{identityStats.ratio}:1</span>
            </span>
          </div>

          <div className="flex gap-4 mt-2 text-[10px] text-muted">
            <span><span style={{ color: THREAT }}>█</span> Israeli flair</span>
            <span><span style={{ color: VIZ_BLUE }}>█</span> Lebanese flair</span>
            <span><span style={{ color: AMBER }}>█</span> Other flair</span>
            <span><span style={{ color: "rgba(232,234,233,0.4)" }}>█</span> No flair</span>
          </div>
        </div>
      )}

      {/* ── CONTENT tab ────────────────────────────────────────────────────── */}
      {tab === "CONTENT" && (
        <div tabIndex={-1}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={enrichedData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              {eraAreas}
              <XAxis dataKey="label" {...axisProps} />
              <YAxis
                {...axisProps}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip {...tooltipStyle} />
              <Bar
                dataKey="comments"
                fill={PRIMARY}
                opacity={0.7}
                name="Comments"
              />
              <Line
                type="monotone"
                dataKey="posts"
                stroke={THREAT}
                strokeWidth={2}
                dot={false}
                name="Posts"
              />
              {brushEl}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-[10px] text-muted">
            <span><span style={{ color: PRIMARY }}>█</span> Comments</span>
            <span><span style={{ color: THREAT }}>━</span> Posts</span>
          </div>
        </div>
      )}
    </div>
  );
}
