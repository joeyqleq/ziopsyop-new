"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export interface TimelineEvent {
  id: string;
  date: string;
  lane: string;
  label: string;
  description: string;
  severity: number;
  keyLabel: string | null;
}

export interface CampaignTimelineData {
  events: TimelineEvent[];
  source: string;
}

const LANE_CONFIG: Record<string, { color: string; label: string; row: number }> = {
  political: { color: "#a78bfa", label: "POLITICAL", row: 0 },
  hezbollah: { color: "#3ee6c1", label: "HEZBOLLAH OPS", row: 1 },
  battlefield: { color: "#4ea8ff", label: "BATTLEFIELD", row: 2 },
  civilian_casualties: { color: "#ff4d5e", label: "CIVILIAN TOLL", row: 3 },
};

function fmtDate(d: string): string {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export function CampaignTimeline({ data }: { data: CampaignTimelineData }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filterLane, setFilterLane] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...data.events].sort((a, b) => a.date.localeCompare(b.date)),
    [data.events]
  );

  const filtered = filterLane ? sorted.filter((e) => e.lane === filterLane) : sorted;

  const dateRange = useMemo(() => {
    if (!sorted.length) return { min: 0, max: 1 };
    const min = new Date(sorted[0].date).getTime();
    const max = new Date(sorted[sorted.length - 1].date).getTime();
    return { min, max: max === min ? max + 1 : max };
  }, [sorted]);

  const getX = (date: string) => {
    const t = new Date(date).getTime();
    return ((t - dateRange.min) / (dateRange.max - dateRange.min)) * 100;
  };

  const selectedEvent = selected ? data.events.find((e) => e.id === selected) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-2">
            CAMPAIGN TIMELINE — MULTI-LANE SWIMLANE
          </p>
          <p className="text-xs text-muted mt-1">
            {sorted.length} key events across {Object.keys(LANE_CONFIG).length} dimensions.
            Click any event to expand.
          </p>
        </div>
        {/* Lane filter */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterLane(null)}
            className="font-mono text-[9px] tracking-[0.1em] px-2 py-1 rounded-[3px] border transition-colors"
            style={{
              borderColor: !filterLane ? "var(--primary)" : "var(--borderc)",
              color: !filterLane ? "var(--primary)" : "var(--muted)",
            }}
          >
            ALL
          </button>
          {Object.entries(LANE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterLane(filterLane === key ? null : key)}
              className="font-mono text-[9px] tracking-[0.1em] px-2 py-1 rounded-[3px] border transition-colors"
              style={{
                borderColor: filterLane === key ? cfg.color : "var(--borderc)",
                color: filterLane === key ? cfg.color : "var(--muted)",
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swimlane chart */}
      <div className="overflow-x-auto rounded-md border border-borderc bg-black/30 p-4">
        <div className="relative min-w-[600px]" style={{ height: 220 }}>
          {/* Lane backgrounds */}
          {Object.values(LANE_CONFIG).map((cfg) => (
            <div
              key={cfg.label}
              className="absolute left-0 right-0 border-b border-borderc/30"
              style={{ top: cfg.row * 52, height: 52 }}
            >
              <span
                className="absolute left-0 top-1 font-mono text-[8px] tracking-[0.15em] opacity-60"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>
          ))}

          {/* Event dots */}
          {filtered.map((event) => {
            const lane = LANE_CONFIG[event.lane];
            if (!lane) return null;
            const x = getX(event.date);
            const y = lane.row * 52 + 26;
            const size = Math.max(8, Math.min(16, event.severity * 1.5));
            const isSelected = selected === event.id;

            return (
              <motion.button
                key={event.id}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                onClick={() => setSelected(isSelected ? null : event.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all"
                style={{
                  left: `${x}%`,
                  top: y,
                  width: size,
                  height: size,
                  background: lane.color,
                  opacity: isSelected ? 1 : 0.75,
                  boxShadow: isSelected ? `0 0 12px ${lane.color}` : "none",
                  border: event.keyLabel ? `2px solid white` : "none",
                  zIndex: isSelected ? 10 : 1,
                }}
                title={event.label}
              />
            );
          })}
        </div>

        {/* Time axis */}
        <div className="flex justify-between mt-2 font-mono text-[9px] text-muted-2">
          <span>{sorted[0] ? fmtDate(sorted[0].date) : ""}</span>
          <span>{sorted[Math.floor(sorted.length / 2)] ? fmtDate(sorted[Math.floor(sorted.length / 2)].date) : ""}</span>
          <span>{sorted[sorted.length - 1] ? fmtDate(sorted[sorted.length - 1].date) : ""}</span>
        </div>
      </div>

      {/* Selected event detail */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-md border bg-card/60 p-4"
          style={{ borderColor: LANE_CONFIG[selectedEvent.lane]?.color || "var(--borderc)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            {selectedEvent.keyLabel && (
              <span
                className="font-mono text-[9px] tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border"
                style={{
                  color: LANE_CONFIG[selectedEvent.lane]?.color,
                  borderColor: `${LANE_CONFIG[selectedEvent.lane]?.color}66`,
                }}
              >
                {selectedEvent.keyLabel}
              </span>
            )}
            <span className="font-mono text-[10px] text-muted">{fmtDate(selectedEvent.date)}</span>
            <span className="font-mono text-[9px] text-muted-2">
              SEVERITY {selectedEvent.severity}/10
            </span>
          </div>
          <p className="text-sm text-foreground font-medium mb-1">{selectedEvent.label}</p>
          <p className="text-xs text-muted leading-relaxed text-pretty">{selectedEvent.description}</p>
        </motion.div>
      )}

      {/* Key dates summary */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sorted
          .filter((e) => e.keyLabel && e.severity >= 9)
          .slice(0, 6)
          .map((e) => (
            <div
              key={e.id}
              className="rounded-md border border-borderc bg-black/25 p-2.5 cursor-pointer hover:bg-card/40 transition-colors"
              onClick={() => setSelected(e.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: LANE_CONFIG[e.lane]?.color }}
                />
                <span className="font-mono text-[9px] text-muted">{fmtDate(e.date)}</span>
              </div>
              <p className="font-mono text-[11px] text-foreground leading-snug">{e.label}</p>
            </div>
          ))}
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-[0.12em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
