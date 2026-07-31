"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

export type ActorMediaSource = "alManar" | "alMayadeen" | "channel14";
export type EvidenceConfidence = "high" | "medium" | "low" | "not-assessed";

export interface ActorMediaDailyPulse {
  /** Civil calendar date, formatted as YYYY-MM-DD. */
  date: string;
  alManar?: number;
  alMayadeen?: number;
  channel14?: number;
}

export interface ActorRedditDailyVolume {
  /** UTC calendar date, formatted as YYYY-MM-DD. */
  date: string;
  volume: number;
}

export interface ActorActivityObservation {
  /** UTC calendar date, formatted as YYYY-MM-DD. */
  date: string;
  actor: string;
  count: number;
}

export interface ActorMediaSourcedEvent {
  id: string;
  /** UTC calendar date, or an ISO timestamp. */
  date: string;
  title: string;
  sourceLabel: string;
  sourceUrl?: string;
  summary?: string;
  confidence?: EvidenceConfidence;
}

export interface ActorMediaHourlyObservation {
  /** UTC calendar date, formatted as YYYY-MM-DD. */
  date: string;
  /** Integer UTC hour from 0 through 23. */
  hour: number;
  media?: Partial<Record<ActorMediaSource, number>>;
  redditVolume?: number;
  actors?: Array<{ actor: string; count: number }>;
}

export interface ActorHourProfileObservation {
  actor: string;
  hour: number;
  activityPct: number;
}

export interface AssociationCoverage {
  observed: number;
  expected: number;
  unit: string;
  label?: string;
}

export interface ActorMediaAssociation {
  id: string;
  title: string;
  /** A descriptive association only; the explorer does not infer causality. */
  statement: string;
  basis?: string;
  confidence: EvidenceConfidence;
  coverage: AssociationCoverage | string;
  limitations?: string[];
}

export interface ActorMediaDatePreset {
  id: string;
  label: string;
  /** Number of inclusive days ending at the latest supplied observation. */
  days?: number;
  /** Fixed UTC bounds. Used instead of days when both are supplied. */
  startDate?: string;
  endDate?: string;
}

export interface ActorMediaActivationExplorerProps {
  mediaDaily: ActorMediaDailyPulse[];
  redditDaily: ActorRedditDailyVolume[];
  actorActivity: ActorActivityObservation[];
  events: ActorMediaSourcedEvent[];
  hourlyActivity: ActorMediaHourlyObservation[];
  actorHourProfiles?: ActorHourProfileObservation[];
  associations: ActorMediaAssociation[];
  datePresets?: ActorMediaDatePreset[];
  coverageStartDate?: string;
  coverageEndDate?: string;
  initialPresetId?: string;
  initialSelectedDate?: string;
  actorOrder?: string[];
  heatmapGranularity?: "auto" | "day" | "month";
  timezoneLabel?: string;
  className?: string;
  onRangeChange?: (range: { startDate: string; endDate: string; presetId: string }) => void;
  onSelectedDateChange?: (date: string) => void;
}

const DAY_MS = 86_400_000;
const PLOT_LEFT = 132;
const PLOT_RIGHT = 18;

const SOURCES: Array<{ key: ActorMediaSource; label: string; short: string; color: string }> = [
  { key: "alManar", label: "Al-Manar", short: "MANAR", color: "#b6ff7c" },
  { key: "alMayadeen", label: "Al-Mayadeen", short: "MAYADEEN", color: "#a78bfa" },
  { key: "channel14", label: "Channel 14", short: "CH 14", color: "#ff4d5e" },
];

const DEFAULT_PRESETS: ActorMediaDatePreset[] = [
  { id: "30d", label: "30D", days: 30 },
  { id: "90d", label: "90D", days: 90 },
  { id: "1y", label: "1Y", days: 365 },
  { id: "all", label: "ALL" },
];

function utcTime(value: string): number {
  if (!value) return Number.NaN;
  const time = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? Date.parse(`${value}T00:00:00Z`)
    : Date.parse(value);
  return Number.isFinite(time) ? time : Number.NaN;
}

function utcDateKey(value: string | number): string {
  const time = typeof value === "number" ? value : utcTime(value);
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : "";
}

function addUtcDays(date: string, amount: number): string {
  return utcDateKey(utcTime(date) + amount * DAY_MS);
}

function enumerateUtcDays(startDate: string, endDate: string): string[] {
  const start = utcTime(startDate);
  const end = utcTime(endDate);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return [];
  const days: string[] = [];
  for (let time = start; time <= end; time += DAY_MS) days.push(utcDateKey(time));
  return days;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatUtcDate(date: string, includeYear = true): string {
  const time = utcTime(date);
  if (!Number.isFinite(time)) return date;
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" as const } : {}),
  }).format(time);
}

function confidenceClasses(confidence: EvidenceConfidence): string {
  if (confidence === "high") return "border-primary/35 bg-primary/10 text-primary";
  if (confidence === "medium") return "border-archive/35 bg-archive/10 text-archive";
  if (confidence === "low") return "border-threat/35 bg-threat/10 text-threat";
  return "border-borderc bg-white/[0.025] text-muted";
}

function coverageLabel(coverage: AssociationCoverage | string): string {
  if (typeof coverage === "string") return coverage;
  if (coverage.label) return coverage.label;
  const ratio = coverage.expected > 0
    ? ` · ${Math.round((coverage.observed / coverage.expected) * 100)}%`
    : "";
  return `${coverage.observed}/${coverage.expected} ${coverage.unit}${ratio}`;
}

function makeSegments(
  dates: string[],
  values: Map<string, number>,
  x: (index: number) => number,
  y: (value: number) => number,
): string[] {
  const segments: string[] = [];
  let current = "";
  dates.forEach((date, index) => {
    const value = values.get(date);
    if (value === undefined) {
      if (current) segments.push(current);
      current = "";
      return;
    }
    current += `${current ? " L" : "M"} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`;
  });
  if (current) segments.push(current);
  return segments;
}

function ChartPanel({
  eyebrow,
  title,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-borderc last:border-b-0">
      <div className="flex flex-wrap items-end justify-between gap-2 px-3 pb-2 pt-3 md:px-4">
        <div>
          <p className="font-mono text-[8px] tracking-[0.24em] text-muted-2">{eyebrow}</p>
          <h3 className="mt-0.5 font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground">
            {title}
          </h3>
        </div>
        {meta && <p className="font-mono text-[9px] text-muted-2">{meta}</p>}
      </div>
      {children}
    </section>
  );
}

function SharedDateAxis({
  dates,
  chartWidth,
  plotWidth,
  selectedIndex,
  onSelect,
  timezoneLabel,
}: {
  dates: string[];
  chartWidth: number;
  plotWidth: number;
  selectedIndex: number;
  onSelect: (date: string) => void;
  timezoneLabel: string;
}) {
  const tickCount = Math.min(7, dates.length);
  const tickIndexes = Array.from({ length: tickCount }, (_, index) =>
    Math.round((index / Math.max(1, tickCount - 1)) * (dates.length - 1))
  );
  const x = (index: number) =>
    PLOT_LEFT + (index / Math.max(1, dates.length - 1)) * plotWidth;

  return (
    <svg
      width={chartWidth}
      height={48}
      viewBox={`0 0 ${chartWidth} 48`}
      role="slider"
      tabIndex={0}
      aria-label={`Shared ${timezoneLabel} date axis`}
      aria-valuemin={0}
      aria-valuemax={Math.max(0, dates.length - 1)}
      aria-valuenow={Math.max(0, selectedIndex)}
      aria-valuetext={dates[Math.max(0, selectedIndex)]}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" && selectedIndex > 0) {
          event.preventDefault();
          onSelect(dates[selectedIndex - 1]);
        } else if (event.key === "ArrowRight" && selectedIndex < dates.length - 1) {
          event.preventDefault();
          onSelect(dates[selectedIndex + 1]);
        } else if (event.key === "Home") {
          event.preventDefault();
          onSelect(dates[0]);
        } else if (event.key === "End") {
          event.preventDefault();
          onSelect(dates.at(-1)!);
        }
      }}
      className="block outline-none focus-visible:ring-1 focus-visible:ring-primary/70"
    >
      <text x={12} y={18} fill="#565b64" fontSize={8} fontFamily="JetBrains Mono, monospace">
        SHARED {timezoneLabel} AXIS
      </text>
      <line x1={PLOT_LEFT} x2={chartWidth - PLOT_RIGHT} y1={12} y2={12} stroke="rgba(232,234,233,.14)" />
      {selectedIndex >= 0 && (
        <line x1={x(selectedIndex)} x2={x(selectedIndex)} y1={5} y2={42} stroke="#e8b44c" strokeOpacity={0.8} />
      )}
      {tickIndexes.map((index) => (
        <g key={`${dates[index]}-${index}`}>
          <line x1={x(index)} x2={x(index)} y1={9} y2={16} stroke="rgba(232,234,233,.25)" />
          <text
            x={x(index)}
            y={31}
            fill="#8a8f98"
            fontSize={8}
            textAnchor={index === 0 ? "start" : index === dates.length - 1 ? "end" : "middle"}
            fontFamily="JetBrains Mono, monospace"
          >
            {formatUtcDate(dates[index], tickCount <= 4)}
          </text>
        </g>
      ))}
      {dates.map((date, index) => {
        const left = index === 0 ? PLOT_LEFT : (x(index - 1) + x(index)) / 2;
        const right = index === dates.length - 1 ? chartWidth - PLOT_RIGHT : (x(index) + x(index + 1)) / 2;
        return (
          <rect
            key={date}
            x={left}
            y={0}
            width={Math.max(1, right - left)}
            height={48}
            fill="transparent"
            className="cursor-crosshair"
            onClick={() => onSelect(date)}
          />
        );
      })}
    </svg>
  );
}

export function ActorMediaActivationExplorer({
  mediaDaily,
  redditDaily,
  actorActivity,
  events,
  hourlyActivity,
  actorHourProfiles = [],
  associations,
  datePresets = DEFAULT_PRESETS,
  coverageStartDate,
  coverageEndDate,
  initialPresetId,
  initialSelectedDate,
  actorOrder,
  heatmapGranularity = "auto",
  timezoneLabel = "ASIA/BEIRUT",
  className = "",
  onRangeChange,
  onSelectedDateChange,
}: ActorMediaActivationExplorerProps) {
  const extent = useMemo(() => {
    const dates = [
      ...mediaDaily.map((row) => row.date),
      ...redditDaily.map((row) => row.date),
      ...actorActivity.map((row) => row.date),
      ...events.map((event) => event.date),
      ...hourlyActivity.map((row) => row.date),
      ...(coverageStartDate ? [coverageStartDate] : []),
      ...(coverageEndDate ? [coverageEndDate] : []),
    ]
      .map(utcDateKey)
      .filter(Boolean)
      .sort();
    return dates.length ? { startDate: dates[0], endDate: dates.at(-1)! } : null;
  }, [
    actorActivity,
    coverageEndDate,
    coverageStartDate,
    events,
    hourlyActivity,
    mediaDaily,
    redditDaily,
  ]);

  const initialPreset = initialPresetId && datePresets.some((preset) => preset.id === initialPresetId)
    ? initialPresetId
    : datePresets[0]?.id ?? "all";
  const [activePresetId, setActivePresetId] = useState(initialPreset);
  const [selectedDateState, setSelectedDateState] = useState(initialSelectedDate ?? "");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const resolvedRange = useMemo(() => {
    if (!extent) return null;
    const preset = datePresets.find((candidate) => candidate.id === activePresetId) ?? datePresets[0];
    if (preset?.startDate && preset.endDate) {
      const startDate = utcDateKey(preset.startDate);
      const endDate = utcDateKey(preset.endDate);
      if (startDate && endDate) {
        return {
          startDate: startDate < extent.startDate ? extent.startDate : startDate,
          endDate: endDate > extent.endDate ? extent.endDate : endDate,
        };
      }
    }
    const startDate = preset?.days
      ? addUtcDays(extent.endDate, -(Math.max(1, preset.days) - 1))
      : extent.startDate;
    return {
      startDate: startDate < extent.startDate ? extent.startDate : startDate,
      endDate: extent.endDate,
    };
  }, [activePresetId, datePresets, extent]);

  useEffect(() => {
    if (!resolvedRange) return;
    onRangeChange?.({ ...resolvedRange, presetId: activePresetId });
  }, [activePresetId, onRangeChange, resolvedRange]);

  const dates = useMemo(
    () => resolvedRange ? enumerateUtcDays(resolvedRange.startDate, resolvedRange.endDate) : [],
    [resolvedRange],
  );
  const dateIndex = useMemo(() => new Map(dates.map((date, index) => [date, index])), [dates]);
  const selectedDate = selectedDateState && dateIndex.has(utcDateKey(selectedDateState))
    ? utcDateKey(selectedDateState)
    : dates.at(-1) ?? "";
  const selectedIndex = dateIndex.get(selectedDate) ?? -1;
  const dayWidth = dates.length <= 45 ? 11 : dates.length <= 120 ? 6 : dates.length <= 400 ? 2.4 : 1.35;
  const plotWidth = Math.max(610, Math.round(Math.max(1, dates.length - 1) * dayWidth));
  const chartWidth = PLOT_LEFT + plotWidth + PLOT_RIGHT;

  const selectDate = (date: string) => {
    setSelectedDateState(date);
    onSelectedDateChange?.(date);
  };

  const mediaMaps = useMemo(() => {
    const maps: Record<ActorMediaSource, Map<string, number>> = {
      alManar: new Map(),
      alMayadeen: new Map(),
      channel14: new Map(),
    };
    mediaDaily.forEach((row) => {
      const date = utcDateKey(row.date);
      if (!date || !dateIndex.has(date)) return;
      SOURCES.forEach(({ key }) => {
        const value = row[key];
        if (value === undefined || value === null) return;
        maps[key].set(date, (maps[key].get(date) ?? 0) + Math.max(0, value));
      });
    });
    return maps;
  }, [dateIndex, mediaDaily]);

  const redditMap = useMemo(() => {
    const map = new Map<string, number>();
    redditDaily.forEach((row) => {
      const date = utcDateKey(row.date);
      if (date && dateIndex.has(date)) map.set(date, (map.get(date) ?? 0) + Math.max(0, row.volume));
    });
    return map;
  }, [dateIndex, redditDaily]);

  const suppliedMediaDays = new Set(
    SOURCES.flatMap(({ key }) => [...mediaMaps[key].keys()])
  ).size;
  const maxMedia = Math.max(1, ...SOURCES.flatMap(({ key }) => [...mediaMaps[key].values()]));
  const maxReddit = Math.max(1, ...redditMap.values());
  const x = (index: number) => PLOT_LEFT + (index / Math.max(1, dates.length - 1)) * plotWidth;
  const chartHeight = 128;
  const yMedia = (value: number) => 104 - (value / maxMedia) * 84;
  const yReddit = (value: number) => 104 - (value / maxReddit) * 78;

  const visibleEvents = useMemo(
    () => events
      .filter((event) => dateIndex.has(utcDateKey(event.date)))
      .sort((a, b) => utcTime(a.date) - utcTime(b.date)),
    [dateIndex, events],
  );
  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId) ?? null;

  const actors = useMemo(() => {
    const observed = Array.from(new Set(actorActivity.map((row) => row.actor)));
    if (!actorOrder?.length) {
      const totals = new Map<string, number>();
      actorActivity.forEach((row) => totals.set(row.actor, (totals.get(row.actor) ?? 0) + row.count));
      return observed.sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0) || a.localeCompare(b));
    }
    const preferred = actorOrder.filter((actor) => observed.includes(actor));
    return [...preferred, ...observed.filter((actor) => !preferred.includes(actor))];
  }, [actorActivity, actorOrder]);

  const useMonths = heatmapGranularity === "month" || (heatmapGranularity === "auto" && dates.length > 120);
  const heatmapColumns = useMemo(() => {
    if (!useMonths) {
      return dates.map((date, index) => ({ key: date, start: index, end: index, label: date }));
    }
    const grouped = new Map<string, { key: string; start: number; end: number; label: string }>();
    dates.forEach((date, index) => {
      const key = date.slice(0, 7);
      const current = grouped.get(key);
      if (current) current.end = index;
      else grouped.set(key, { key, start: index, end: index, label: key });
    });
    return [...grouped.values()];
  }, [dates, useMonths]);

  const activityCells = useMemo(() => {
    const byCell = new Map<string, { count: number; observations: number }>();
    actorActivity.forEach((row) => {
      const date = utcDateKey(row.date);
      if (!dateIndex.has(date)) return;
      const column = useMonths ? date.slice(0, 7) : date;
      const key = `${row.actor}\u0000${column}`;
      const current = byCell.get(key) ?? { count: 0, observations: 0 };
      current.count += Math.max(0, row.count);
      current.observations += 1;
      byCell.set(key, current);
    });
    return byCell;
  }, [actorActivity, dateIndex, useMonths]);
  const maxActorCount = Math.max(1, ...[...activityCells.values()].map((cell) => cell.count));

  const actorClock = useMemo(() => {
    const actorNames = Array.from(
      new Set(actorHourProfiles.map((row) => row.actor)),
    ).sort();
    const values = new Map<string, number>();
    actorHourProfiles.forEach((row) => {
      if (row.hour < 0 || row.hour > 23) return;
      values.set(`${row.actor}\u0000${Math.trunc(row.hour)}`, row.activityPct);
    });
    const max = Math.max(1, ...actorHourProfiles.map((row) => row.activityPct));
    return { actors: actorNames, values, max };
  }, [actorHourProfiles]);

  const selectedHours = useMemo(() => {
    const byHour = new Map<number, ActorMediaHourlyObservation>();
    hourlyActivity
      .filter((row) => utcDateKey(row.date) === selectedDate && row.hour >= 0 && row.hour <= 23)
      .forEach((row) => {
        const hour = Math.trunc(row.hour);
        const current = byHour.get(hour);
        if (!current) {
          byHour.set(hour, { ...row, hour });
          return;
        }
        const media: Partial<Record<ActorMediaSource, number>> = { ...current.media };
        SOURCES.forEach(({ key }) => {
          const total = (current.media?.[key] ?? 0) + (row.media?.[key] ?? 0);
          if (total > 0) media[key] = total;
        });
        const actorTotals = new Map<string, number>();
        [...(current.actors ?? []), ...(row.actors ?? [])].forEach((actor) =>
          actorTotals.set(actor.actor, (actorTotals.get(actor.actor) ?? 0) + actor.count)
        );
        byHour.set(hour, {
          date: selectedDate,
          hour,
          media,
          redditVolume: (current.redditVolume ?? 0) + (row.redditVolume ?? 0),
          actors: [...actorTotals].map(([actor, count]) => ({ actor, count })),
        });
      });
    return Array.from({ length: 24 }, (_, hour) => byHour.get(hour) ?? null);
  }, [hourlyActivity, selectedDate]);
  const maxHourly = Math.max(
    1,
    ...selectedHours.map((row) =>
      row
        ? (row.redditVolume ?? 0) + SOURCES.reduce((sum, source) => sum + (row.media?.[source.key] ?? 0), 0)
        : 0
    ),
  );

  if (!extent || !resolvedRange || dates.length === 0) {
    return (
      <div className={`rounded-md border border-borderc bg-surface/50 p-5 ${className}`}>
        <p className="font-mono text-[10px] tracking-[0.2em] text-muted">NO SUPPLIED OBSERVATIONS</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-2">
          This explorer is props-driven. Provide dated media, Reddit, actor, event, or hourly observations to render it.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-md border border-borderc bg-[rgba(6,6,8,.72)] ${className}`}>
      <header className="border-b border-borderc bg-black/20 px-3 py-3 md:px-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.26em] text-primary">ACTOR ↔ MEDIA ACTIVATION EXPLORER</p>
            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted">
              Aligned {timezoneLabel} civil-day observations for timing comparison. Temporal proximity is descriptive
              evidence of association, not proof that one stream caused another.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(182,255,124,.7)]" />
            <span className="font-mono text-[9px] text-muted">{timezoneLabel} NORMALIZED</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Date range presets">
          <span className="mr-1 font-mono text-[8px] tracking-[0.18em] text-muted-2">RANGE</span>
          {datePresets.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setActivePresetId(preset.id);
                  const nextEnd = preset.startDate && preset.endDate
                    ? utcDateKey(preset.endDate)
                    : extent.endDate;
                  if (nextEnd) selectDate(nextEnd > extent.endDate ? extent.endDate : nextEnd);
                }}
                className={`min-h-8 rounded border px-3 font-mono text-[9px] tracking-[0.12em] transition-colors ${
                  active
                    ? "border-primary/45 bg-primary/10 text-primary"
                    : "border-borderc bg-white/[0.02] text-muted hover:border-white/20 hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          <span className="ml-auto font-mono text-[9px] text-archive">
            {resolvedRange.startDate} → {resolvedRange.endDate}
          </span>
        </div>
      </header>

      <div className="overflow-x-auto overscroll-x-contain">
        <div style={{ width: chartWidth }} className="min-w-full">
          <ChartPanel
            eyebrow="PANEL 01 · DAILY"
            title="MEDIA PULSE"
            meta={`${suppliedMediaDays}/${dates.length} supplied days`}
          >
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-1 md:px-4">
              {SOURCES.map((source) => (
                <span key={source.key} className="flex items-center gap-1.5 font-mono text-[8px] text-muted">
                  <span className="h-px w-4" style={{ backgroundColor: source.color }} />
                  {source.label}
                </span>
              ))}
              <span className="font-mono text-[8px] text-muted-2">gaps = no supplied daily observation</span>
            </div>
            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Daily media pulse for Al-Manar, Al-Mayadeen, and Channel 14"
              className="block"
            >
              <text x={12} y={22} fill="#565b64" fontSize={8} fontFamily="JetBrains Mono, monospace">ITEMS / DAY</text>
              <text x={PLOT_LEFT - 10} y={24} textAnchor="end" fill="#565b64" fontSize={8}>{formatCompact(maxMedia)}</text>
              {[0, 0.5, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={PLOT_LEFT}
                  x2={chartWidth - PLOT_RIGHT}
                  y1={20 + ratio * 84}
                  y2={20 + ratio * 84}
                  stroke="rgba(232,234,233,.06)"
                />
              ))}
              {selectedIndex >= 0 && (
                <line x1={x(selectedIndex)} x2={x(selectedIndex)} y1={14} y2={110} stroke="#e8b44c" strokeOpacity={0.45} />
              )}
              {SOURCES.map((source) =>
                makeSegments(dates, mediaMaps[source.key], x, yMedia).map((path, index) => (
                  <path
                    key={`${source.key}-${index}`}
                    d={path}
                    fill="none"
                    stroke={source.color}
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))
              )}
              {SOURCES.map((source) => {
                const value = mediaMaps[source.key].get(selectedDate);
                return value === undefined ? null : (
                  <circle key={source.key} cx={x(selectedIndex)} cy={yMedia(value)} r={3} fill={source.color}>
                    <title>{`${selectedDate} · ${source.label} · ${value}`}</title>
                  </circle>
                );
              })}
            </svg>
          </ChartPanel>

          <ChartPanel
            eyebrow="PANEL 02 · DAILY"
            title="REDDIT VOLUME"
            meta={`${redditMap.size}/${dates.length} supplied days`}
          >
            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Daily Reddit volume"
              className="block"
            >
              <text x={12} y={22} fill="#565b64" fontSize={8} fontFamily="JetBrains Mono, monospace">ARTIFACTS / DAY</text>
              <text x={PLOT_LEFT - 10} y={24} textAnchor="end" fill="#565b64" fontSize={8}>{formatCompact(maxReddit)}</text>
              {[0, 0.5, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={PLOT_LEFT}
                  x2={chartWidth - PLOT_RIGHT}
                  y1={20 + ratio * 84}
                  y2={20 + ratio * 84}
                  stroke="rgba(232,234,233,.06)"
                />
              ))}
              {dates.map((date, index) => {
                const value = redditMap.get(date);
                if (value === undefined) return null;
                const barWidth = Math.max(1, plotWidth / Math.max(1, dates.length) - 0.5);
                const top = yReddit(value);
                return (
                  <rect
                    key={date}
                    x={x(index) - barWidth / 2}
                    y={top}
                    width={barWidth}
                    height={104 - top}
                    fill={date === selectedDate ? "#e8b44c" : "#5b9bff"}
                    fillOpacity={date === selectedDate ? 0.9 : 0.62}
                  >
                    <title>{`${date} · ${value} Reddit artifacts`}</title>
                  </rect>
                );
              })}
              {selectedIndex >= 0 && (
                <line x1={x(selectedIndex)} x2={x(selectedIndex)} y1={14} y2={110} stroke="#e8b44c" strokeOpacity={0.5} />
              )}
            </svg>
          </ChartPanel>

          <ChartPanel
            eyebrow={`PANEL 03 · ${useMonths ? "MONTHLY CELLS" : "DAILY CELLS"}`}
            title="ACTOR ACTIVITY HEATMAP"
            meta={`${actors.length} actors · ${activityCells.size} supplied cells`}
          >
            <svg
              width={chartWidth}
              height={Math.max(66, actors.length * 20 + 30)}
              viewBox={`0 0 ${chartWidth} ${Math.max(66, actors.length * 20 + 30)}`}
              role="img"
              aria-label={`Actor activity heatmap by ${useMonths ? "month" : "day"}`}
              className="block"
            >
              {actors.length === 0 && (
                <text x={PLOT_LEFT} y={28} fill="#565b64" fontSize={9} fontFamily="JetBrains Mono, monospace">
                  NO ACTOR OBSERVATIONS IN THIS RANGE
                </text>
              )}
              {selectedIndex >= 0 && (
                <line
                  x1={x(selectedIndex)}
                  x2={x(selectedIndex)}
                  y1={8}
                  y2={Math.max(46, actors.length * 20 + 8)}
                  stroke="#e8b44c"
                  strokeOpacity={0.5}
                />
              )}
              {actors.map((actor, actorIndex) => (
                <g key={actor}>
                  <text
                    x={PLOT_LEFT - 10}
                    y={actorIndex * 20 + 19}
                    textAnchor="end"
                    fill="#8a8f98"
                    fontSize={8}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {actor.length > 18 ? `${actor.slice(0, 17)}…` : actor}
                  </text>
                  {heatmapColumns.map((column) => {
                    const cell = activityCells.get(`${actor}\u0000${column.key}`);
                    const left = column.start === 0 ? PLOT_LEFT : (x(column.start - 1) + x(column.start)) / 2;
                    const right = column.end === dates.length - 1
                      ? chartWidth - PLOT_RIGHT
                      : (x(column.end) + x(column.end + 1)) / 2;
                    const alpha = cell ? 0.14 + (cell.count / maxActorCount) * 0.82 : 0;
                    return (
                      <rect
                        key={column.key}
                        x={left + 0.5}
                        y={actorIndex * 20 + 7}
                        width={Math.max(0.75, right - left - 1)}
                        height={13}
                        fill={cell ? `rgba(123,57,208,${alpha})` : "transparent"}
                        stroke={cell ? "rgba(167,139,250,.12)" : "rgba(232,234,233,.025)"}
                        strokeWidth={0.5}
                      >
                        <title>
                          {cell
                            ? `${actor} · ${column.label} · ${cell.count} observed actions${useMonths ? ` · ${cell.observations} supplied row(s)` : ""}`
                            : `${actor} · ${column.label} · no supplied observation`}
                        </title>
                      </rect>
                    );
                  })}
                </g>
              ))}
            </svg>
          </ChartPanel>

          <ChartPanel
            eyebrow="PANEL 04 · SOURCED CONTEXT"
            title="EVENT STRIP"
            meta={`${visibleEvents.length} events in range`}
          >
            <svg
              width={chartWidth}
              height={64}
              viewBox={`0 0 ${chartWidth} 64`}
              role="img"
              aria-label={`Context events aligned to the shared ${timezoneLabel} timeline`}
              className="block"
            >
              <text x={12} y={21} fill="#565b64" fontSize={8} fontFamily="JetBrains Mono, monospace">SOURCED EVENTS</text>
              <line x1={PLOT_LEFT} x2={chartWidth - PLOT_RIGHT} y1={28} y2={28} stroke="rgba(232,234,233,.12)" />
              {visibleEvents.map((event, index) => {
                const eventDate = utcDateKey(event.date);
                const eventIndex = dateIndex.get(eventDate) ?? 0;
                const selected = event.id === selectedEventId;
                const markerY = 21 - (index % 2) * 7;
                return (
                  <g
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${event.title}, ${eventDate}, source ${event.sourceLabel}`}
                    className="cursor-pointer outline-none"
                    onClick={() => {
                      setSelectedEventId(selected ? null : event.id);
                      selectDate(eventDate);
                    }}
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                        keyboardEvent.preventDefault();
                        setSelectedEventId(selected ? null : event.id);
                        selectDate(eventDate);
                      }
                    }}
                  >
                    <line
                      x1={x(eventIndex)}
                      x2={x(eventIndex)}
                      y1={markerY}
                      y2={45}
                      stroke={selected ? "#e8b44c" : "#b6ff7c"}
                      strokeOpacity={selected ? 1 : 0.55}
                    />
                    <circle cx={x(eventIndex)} cy={markerY} r={selected ? 4 : 3} fill={selected ? "#e8b44c" : "#b6ff7c"}>
                      <title>{`${eventDate} · ${event.title} · ${event.sourceLabel}`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>
            <div className="px-3 pb-3 md:px-4">
              {selectedEvent ? (
                <div className="flex flex-wrap items-start justify-between gap-3 rounded border border-archive/25 bg-archive/[0.05] p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[9px] text-archive">{utcDateKey(selectedEvent.date)} {timezoneLabel}</span>
                      {selectedEvent.confidence && (
                        <span className={`rounded border px-1.5 py-0.5 font-mono text-[8px] ${confidenceClasses(selectedEvent.confidence)}`}>
                          {selectedEvent.confidence.toUpperCase()} CONFIDENCE
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium text-foreground">{selectedEvent.title}</p>
                    {selectedEvent.summary && (
                      <p className="mt-1 text-[10px] leading-relaxed text-muted">{selectedEvent.summary}</p>
                    )}
                  </div>
                  {selectedEvent.sourceUrl ? (
                    <a
                      href={selectedEvent.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-8 items-center gap-1.5 rounded border border-borderc px-2.5 font-mono text-[9px] text-primary hover:border-primary/35"
                    >
                      {selectedEvent.sourceLabel}
                      <ExternalLink size={10} aria-hidden />
                    </a>
                  ) : (
                    <span className="font-mono text-[9px] text-muted-2">
                      {selectedEvent.sourceLabel} · citation URL not supplied
                    </span>
                  )}
                </div>
              ) : (
                <p className="font-mono text-[9px] text-muted-2">Select a marker to inspect its citation and context.</p>
              )}
            </div>
          </ChartPanel>

          <SharedDateAxis
            dates={dates}
            chartWidth={chartWidth}
            plotWidth={plotWidth}
            selectedIndex={selectedIndex}
            onSelect={selectDate}
            timezoneLabel={timezoneLabel}
          />
        </div>
      </div>

      {actorClock.actors.length > 0 && (
        <section className="border-t border-borderc bg-eye-purple/[0.025] px-3 py-4 md:px-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[8px] tracking-[0.24em] text-muted-2">
                ALL-HISTORY ACTOR RHYTHM · DATE-UNLINKED
              </p>
              <h3 className="mt-0.5 font-mono text-xs font-semibold text-foreground">
                RECURRING UTC ACTIVITY CLOCK
              </h3>
            </div>
            <span className="rounded border border-eye-purple/30 bg-eye-purple/[0.08] px-2 py-1 font-mono text-[8px] text-eye-purple">
              24-HOUR PROFILE · NOT EVENT LATENCY
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-[10px] leading-relaxed text-muted-2">
            Each row is an actor&apos;s aggregate share of activity by UTC hour across the available history.
            It can reveal recurring schedules, but it is intentionally kept separate from the dated media/Reddit layer.
          </p>

          <div className="mt-3 overflow-x-auto pb-1">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[124px_repeat(24,minmax(22px,1fr))] gap-px font-mono text-[8px] text-muted-2">
                <span>ACTOR / UTC</span>
                {Array.from({ length: 24 }, (_, hour) => (
                  <span key={hour} className="text-center">
                    {hour.toString().padStart(2, "0")}
                  </span>
                ))}
              </div>
              <div className="mt-1 space-y-px">
                {actorClock.actors.map((actor) => (
                  <div
                    key={actor}
                    className="grid grid-cols-[124px_repeat(24,minmax(22px,1fr))] gap-px"
                  >
                    <span
                      className="truncate pr-2 font-mono text-[8px] leading-5 text-muted"
                      title={actor}
                    >
                      {actor}
                    </span>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const value = actorClock.values.get(`${actor}\u0000${hour}`);
                      const alpha = value === undefined
                        ? 0
                        : 0.08 + (value / actorClock.max) * 0.82;
                      return (
                        <span
                          key={hour}
                          role="img"
                          aria-label={
                            value === undefined
                              ? `${actor}, ${hour}:00 UTC, no supplied profile value`
                              : `${actor}, ${hour}:00 UTC, ${value.toFixed(2)} percent of observed activity`
                          }
                          className="h-5 rounded-[1px] border border-white/[0.025]"
                          style={{
                            backgroundColor:
                              value === undefined
                                ? "transparent"
                                : `rgba(167,139,250,${alpha})`,
                          }}
                          title={
                            value === undefined
                              ? "No supplied profile value"
                              : `${actor} · ${hour.toString().padStart(2, "0")}:00 UTC · ${value.toFixed(2)}%`
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {hourlyActivity.length > 0 ? (
        <section className="border-t border-borderc px-3 py-4 md:px-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[8px] tracking-[0.24em] text-muted-2">SELECTED {timezoneLabel} DAY · 24-HOUR DETAIL</p>
            <h3 className="mt-0.5 font-mono text-xs font-semibold text-foreground">{formatUtcDate(selectedDate)}</h3>
          </div>
          <p className="font-mono text-[9px] text-muted-2">
            {selectedHours.filter(Boolean).length}/24 supplied hours · unfilled hours are not inferred as zero
          </p>
        </div>

        <div className="mt-3 overflow-x-auto pb-1">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[92px_repeat(24,minmax(22px,1fr))] gap-px font-mono text-[8px] text-muted-2">
              <span>{timezoneLabel} HOUR</span>
              {Array.from({ length: 24 }, (_, hour) => (
                <span key={hour} className="text-center">{hour.toString().padStart(2, "0")}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-[92px_repeat(24,minmax(22px,1fr))] gap-px">
              <span className="self-end pb-1 font-mono text-[8px] text-muted-2">ALL STREAMS</span>
              {selectedHours.map((row, hour) => {
                const mediaTotal = row
                  ? SOURCES.reduce((sum, source) => sum + (row.media?.[source.key] ?? 0), 0)
                  : 0;
                const total = mediaTotal + (row?.redditVolume ?? 0);
                const height = row ? clamp((total / maxHourly) * 52, total > 0 ? 3 : 1, 52) : 0;
                const actorNames = row?.actors?.filter((actor) => actor.count > 0).map((actor) => actor.actor) ?? [];
                return (
                  <div key={hour} className="group relative flex h-16 items-end justify-center rounded-sm bg-white/[0.015]">
                    {row ? (
                      <span
                        className="w-[68%] rounded-t-sm bg-gradient-to-t from-viz-blue/80 via-eye-purple/75 to-primary/80"
                        style={{ height }}
                      />
                    ) : (
                      <span className="mb-1 h-px w-2 bg-white/[0.06]" />
                    )}
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-52 -translate-x-1/2 rounded border border-borderc bg-black/95 p-2 font-mono text-[8px] leading-relaxed text-muted shadow-xl group-hover:block">
                      {row ? (
                        <>
                          <strong className="text-foreground">{selectedDate} {hour.toString().padStart(2, "0")}:00 {timezoneLabel}</strong>
                          <br />Al-Manar {row.media?.alManar ?? 0} · Al-Mayadeen {row.media?.alMayadeen ?? 0}
                          <br />Channel 14 {row.media?.channel14 ?? 0} · Reddit {row.redditVolume ?? 0}
                          <br />Actors: {actorNames.length ? actorNames.join(", ") : "none supplied"}
                        </>
                      ) : "No hourly observation supplied"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {SOURCES.map((source) => {
            const total = selectedHours.reduce((sum, row) => sum + (row?.media?.[source.key] ?? 0), 0);
            return (
              <span key={source.key} className="font-mono text-[9px] text-muted">
                <span style={{ color: source.color }}>{source.short}</span> {formatCompact(total)}
              </span>
            );
          })}
          <span className="font-mono text-[9px] text-muted">
            <span className="text-viz-blue">REDDIT</span>{" "}
            {formatCompact(selectedHours.reduce((sum, row) => sum + (row?.redditVolume ?? 0), 0))}
          </span>
        </div>
        </section>
      ) : (
        <section className="border-t border-borderc px-3 py-4 md:px-4">
          <p className="font-mono text-[8px] tracking-[0.24em] text-muted-2">
            DATE-LINKED HOURLY DETAIL · NOT AVAILABLE
          </p>
          <p className="mt-2 max-w-3xl text-[10px] leading-relaxed text-muted">
            The current canonical dataset supports civil-day alignment and separate all-history actor hour profiles.
            It does not contain a joined actor/media/Reddit timestamp table, so this exhibit does not manufacture
            hour-level reaction latency.
          </p>
        </section>
      )}

      <section className="border-t border-borderc bg-white/[0.012] px-3 py-4 md:px-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[8px] tracking-[0.24em] text-muted-2">INTERPRETATION LEDGER</p>
            <h3 className="mt-0.5 font-mono text-xs font-semibold text-foreground">ASSOCIATION SUMMARY</h3>
          </div>
          <span className="rounded border border-archive/30 bg-archive/[0.06] px-2 py-1 font-mono text-[8px] tracking-[0.12em] text-archive">
            ASSOCIATION ≠ CAUSATION
          </span>
        </div>

        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {associations.map((association) => (
            <article key={association.id} className="rounded border border-borderc bg-black/20 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="text-xs font-medium text-foreground">{association.title}</h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[8px] ${confidenceClasses(association.confidence)}`}>
                    {association.confidence.toUpperCase()} CONFIDENCE
                  </span>
                  <span className="rounded border border-borderc bg-white/[0.025] px-1.5 py-0.5 font-mono text-[8px] text-muted">
                    COVERAGE · {coverageLabel(association.coverage)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">{association.statement}</p>
              {association.basis && (
                <p className="mt-2 border-l border-primary/30 pl-2 font-mono text-[9px] leading-relaxed text-muted-2">
                  BASIS · {association.basis}
                </p>
              )}
              {association.limitations?.length ? (
                <div className="mt-2">
                  <p className="font-mono text-[8px] tracking-[0.14em] text-threat">LIMITATIONS</p>
                  <ul className="mt-1 space-y-1">
                    {association.limitations.map((limitation) => (
                      <li key={limitation} className="text-[10px] leading-relaxed text-muted-2">
                        — {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
          {associations.length === 0 && (
            <p className="rounded border border-borderc p-3 font-mono text-[9px] text-muted-2">
              No association assessments supplied. The aligned observations above are intentionally left uninterpreted.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ActorMediaActivationExplorer;
