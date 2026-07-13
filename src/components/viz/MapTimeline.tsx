"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// ---------- Types ----------
export interface SwimEvent {
  id: string;
  date: string;
  lane: string;
  label: string;
  description: string;
  severity: number;
  color: string;
}

export interface Lane {
  key: string;
  label: string;
  color: string;
}

// ---------- Constants ----------
export const LANES: Lane[] = [
  { key: "idf", label: "IDF Actions", color: "#ef4444" },
  { key: "hezbollah", label: "Hezbollah Actions", color: "#eab308" },
  { key: "unifil", label: "UNIFIL Incidents", color: "#3b82f6" },
  { key: "civilian_casualties", label: "Civilian Casualties", color: "#22c55e" },
  { key: "political", label: "Political Events", color: "#a855f7" },
  { key: "media_divergence", label: "Media Divergence", color: "#f97316" },
  { key: "reddit_spike", label: "r/FB Activity Spikes", color: "#06b6d4" },
];

export const SAMPLE_EVENTS: SwimEvent[] = [
  { id: "S001", date: "2024-01-08", lane: "hezbollah", label: "Hezbollah opens northern front", description: "Daily cross-border strikes begin in solidarity with Gaza", severity: 8, color: "#eab308" },
  { id: "S002", date: "2024-01-08", lane: "reddit_spike", label: "ForbiddenBromance spike", description: "Post volume 3x normal — coordinated 'why do they attack us' narratives", severity: 6, color: "#06b6d4" },
  { id: "S003", date: "2024-07-30", lane: "idf", label: "Shukr assassination", description: "IDF assassinates Fuad Shukr in Beirut suburb — 5 killed, 60+ wounded", severity: 9, color: "#ef4444" },
  { id: "S004", date: "2024-09-17", lane: "idf", label: "Pager attacks", description: "Coordinated pager detonations — 12 killed, 2800 wounded across Lebanon", severity: 10, color: "#ef4444" },
  { id: "S005", date: "2024-09-17", lane: "civilian_casualties", label: "Mass civilian casualties", description: "Indiscriminate harm: doctors, nurses, children among victims", severity: 10, color: "#22c55e" },
  { id: "S006", date: "2024-09-17", lane: "media_divergence", label: "Hebrew media celebrates", description: "Israeli Hebrew media frames as 'brilliant operation' — English media omits civilian toll", severity: 9, color: "#f97316" },
  { id: "S007", date: "2024-09-17", lane: "reddit_spike", label: "Massive FB spike", description: "r/ForbiddenBromance posts surge 8x — 'look how precise Israel is' framing dominates", severity: 9, color: "#06b6d4" },
  { id: "S008", date: "2024-09-27", lane: "idf", label: "Nasrallah assassination", description: "Bunker-buster strike on residential block kills Nasrallah + 6 others, 91 wounded", severity: 10, color: "#ef4444" },
  { id: "S009", date: "2024-10-01", lane: "idf", label: "Ground invasion begins", description: "IDF crosses Blue Line into south Lebanon", severity: 9, color: "#ef4444" },
  { id: "S010", date: "2024-10-10", lane: "unifil", label: "IDF attacks UNIFIL", description: "IDF fires on UNIFIL headquarters at Naqoura — 5 peacekeepers wounded", severity: 8, color: "#3b82f6" },
  { id: "S011", date: "2024-10-29", lane: "civilian_casualties", label: "Journalists killed", description: "Three journalists killed in marked press vehicle — clear targeting", severity: 8, color: "#22c55e" },
  { id: "S012", date: "2024-11-27", lane: "political", label: "Ceasefire agreement", description: "60-day ceasefire takes effect — IDF to withdraw", severity: 7, color: "#a855f7" },
  { id: "S013", date: "2025-01-26", lane: "political", label: "IDF refuses withdrawal", description: "Deadline passes — IDF unilaterally extends occupation", severity: 8, color: "#a855f7" },
  { id: "S014", date: "2025-02-10", lane: "civilian_casualties", label: "Return shootings", description: "IDF fires on civilians returning to homes post-ceasefire", severity: 7, color: "#22c55e" },
  { id: "S015", date: "2025-02-10", lane: "media_divergence", label: "Hebrew silence", description: "No Hebrew outlet covers civilian shootings — English outlets brief mention only", severity: 7, color: "#f97316" },
  { id: "S016", date: "2026-01-15", lane: "idf", label: "Second invasion", description: "IDF launches second ground operation into Lebanon", severity: 9, color: "#ef4444" },
  { id: "S017", date: "2026-01-28", lane: "hezbollah", label: "FPV drones deployed", description: "Fiber-optic FPV kamikaze drones destroy IDF Merkava — unjammable", severity: 9, color: "#eab308" },
  { id: "S018", date: "2026-02-01", lane: "reddit_spike", label: "Narrative pivot begins", description: "Anti-Shia content disappears overnight. Pro-Shia posts appear for first time.", severity: 8, color: "#06b6d4" },
  { id: "S019", date: "2026-02-01", lane: "media_divergence", label: "FPV blackout", description: "Zero FPV drone coverage on r/ForbiddenBromance despite global virality", severity: 9, color: "#f97316" },
  { id: "S020", date: "2026-03-01", lane: "idf", label: "Hospital strike", description: "Airstrike on Sidon Government Hospital — 11 killed", severity: 9, color: "#ef4444" },
];

// ---------- Props ----------
interface MapTimelineProps {
  events?: SwimEvent[];
  lanes?: Lane[];
  height?: number;
}

// ---------- Component ----------
export function MapTimeline({
  events = SAMPLE_EVENTS,
  lanes = LANES,
  height = 420,
}: MapTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [viewRange, setViewRange] = useState({
    start: new Date("2023-10-07"),
    end: new Date("2026-07-01"),
  });
  const [selectedEvent, setSelectedEvent] = useState<SwimEvent | null>(null);
  const [bulletinPos, setBulletinPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; startRange: { start: Date; end: Date } } | null>(null);
  const touchStartRef = useRef<{ x: number; dist: number; startRange: { start: Date; end: Date } } | null>(null);

  // Layout constants
  const MARGIN_LEFT = 130;
  const MARGIN_RIGHT = 20;
  const MARGIN_TOP = 40;
  const MARGIN_BOTTOM = 50;
  const DOT_RADIUS = 6;
  const HIT_RADIUS = 10;
  const DPR = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // ---------- Coordinate transforms ----------
  const timeToX = useCallback(
    (date: Date) => {
      const totalMs = viewRange.end.getTime() - viewRange.start.getTime();
      const offsetMs = date.getTime() - viewRange.start.getTime();
      const drawWidth = canvasWidth - MARGIN_LEFT - MARGIN_RIGHT;
      return MARGIN_LEFT + (offsetMs / totalMs) * drawWidth;
    },
    [viewRange, canvasWidth]
  );

  const xToTime = useCallback(
    (x: number) => {
      const drawWidth = canvasWidth - MARGIN_LEFT - MARGIN_RIGHT;
      const ratio = (x - MARGIN_LEFT) / drawWidth;
      const totalMs = viewRange.end.getTime() - viewRange.start.getTime();
      return new Date(viewRange.start.getTime() + ratio * totalMs);
    },
    [viewRange, canvasWidth]
  );

  const laneToY = useCallback(
    (laneKey: string) => {
      const idx = lanes.findIndex((l) => l.key === laneKey);
      if (idx < 0) return MARGIN_TOP;
      const drawHeight = height - MARGIN_TOP - MARGIN_BOTTOM;
      const laneHeight = drawHeight / lanes.length;
      return MARGIN_TOP + idx * laneHeight + laneHeight / 2;
    },
    [lanes, height]
  );

  // ---------- Canvas draw ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvasWidth;
    const h = height;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(DPR, DPR);

    // Clear
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, w, h);

    const drawWidth = w - MARGIN_LEFT - MARGIN_RIGHT;
    const drawHeight = h - MARGIN_TOP - MARGIN_BOTTOM;
    const laneHeight = drawHeight / lanes.length;

    // Lane backgrounds (alternating)
    lanes.forEach((lane, i) => {
      const y = MARGIN_TOP + i * laneHeight;
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.12)";
      ctx.fillRect(MARGIN_LEFT, y, drawWidth, laneHeight);
    });

    // Lane labels
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    lanes.forEach((lane, i) => {
      const y = MARGIN_TOP + i * laneHeight + laneHeight / 2;
      ctx.font = "11px monospace";
      ctx.fillStyle = lane.color;
      ctx.fillText(lane.label, MARGIN_LEFT - 10, y);
    });

    // Time axis ticks
    const rangeMs = viewRange.end.getTime() - viewRange.start.getTime();
    const rangeDays = rangeMs / (1000 * 60 * 60 * 24);

    // Determine tick interval based on zoom level
    let tickInterval: "year" | "quarter" | "month" | "week" | "day";
    if (rangeDays > 1000) tickInterval = "year";
    else if (rangeDays > 400) tickInterval = "quarter";
    else if (rangeDays > 120) tickInterval = "month";
    else if (rangeDays > 30) tickInterval = "week";
    else tickInterval = "day";

    const ticks: Date[] = [];
    const tickStart = new Date(viewRange.start);
    tickStart.setHours(0, 0, 0, 0);

    if (tickInterval === "year") {
      tickStart.setMonth(0, 1);
      if (tickStart < viewRange.start) tickStart.setFullYear(tickStart.getFullYear() + 1);
      while (tickStart <= viewRange.end) {
        ticks.push(new Date(tickStart));
        tickStart.setFullYear(tickStart.getFullYear() + 1);
      }
    } else if (tickInterval === "quarter") {
      tickStart.setDate(1);
      tickStart.setMonth(Math.floor(tickStart.getMonth() / 3) * 3);
      if (tickStart < viewRange.start) tickStart.setMonth(tickStart.getMonth() + 3);
      while (tickStart <= viewRange.end) {
        ticks.push(new Date(tickStart));
        tickStart.setMonth(tickStart.getMonth() + 3);
      }
    } else if (tickInterval === "month") {
      tickStart.setDate(1);
      if (tickStart < viewRange.start) tickStart.setMonth(tickStart.getMonth() + 1);
      while (tickStart <= viewRange.end) {
        ticks.push(new Date(tickStart));
        tickStart.setMonth(tickStart.getMonth() + 1);
      }
    } else if (tickInterval === "week") {
      tickStart.setDate(tickStart.getDate() - tickStart.getDay());
      if (tickStart < viewRange.start) tickStart.setDate(tickStart.getDate() + 7);
      while (tickStart <= viewRange.end) {
        ticks.push(new Date(tickStart));
        tickStart.setDate(tickStart.getDate() + 7);
      }
    } else {
      if (tickStart < viewRange.start) tickStart.setDate(tickStart.getDate() + 1);
      while (tickStart <= viewRange.end) {
        ticks.push(new Date(tickStart));
        tickStart.setDate(tickStart.getDate() + 1);
      }
    }

    // Draw ticks
    const axisY = MARGIN_TOP + drawHeight;
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.font = "10px monospace";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ticks.forEach((tick) => {
      const x = timeToX(tick);
      if (x < MARGIN_LEFT || x > w - MARGIN_RIGHT) return;

      // Vertical gridline
      ctx.beginPath();
      ctx.moveTo(x, MARGIN_TOP);
      ctx.lineTo(x, axisY);
      ctx.stroke();

      // Tick mark
      ctx.beginPath();
      ctx.moveTo(x, axisY);
      ctx.lineTo(x, axisY + 6);
      ctx.strokeStyle = "#555";
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";

      // Label
      let label: string;
      if (tickInterval === "year") {
        label = tick.getFullYear().toString();
      } else if (tickInterval === "quarter" || tickInterval === "month") {
        label = tick.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      } else if (tickInterval === "week") {
        label = tick.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else {
        label = tick.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      ctx.fillText(label, x, axisY + 10);
    });

    // Axis baseline
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, axisY);
    ctx.lineTo(w - MARGIN_RIGHT, axisY);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw event dots
    events.forEach((evt) => {
      const evtDate = new Date(evt.date);
      if (evtDate < viewRange.start || evtDate > viewRange.end) return;

      const x = timeToX(evtDate);
      const y = laneToY(evt.lane);
      const r = DOT_RADIUS;

      // Glow for high severity
      if (evt.severity >= 9) {
        ctx.shadowColor = evt.color;
        ctx.shadowBlur = 8;
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = evt.color;
      ctx.globalAlpha = selectedEvent?.id === evt.id ? 1 : 0.8;
      ctx.fill();

      // Border for high severity
      if (evt.severity >= 9) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Highlight ring for selected
      if (selectedEvent?.id === evt.id) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Key date markers
    const keyDates = [
      { date: "2024-09-17", label: "Pagers" },
      { date: "2024-11-27", label: "Ceasefire" },
      { date: "2026-01-15", label: "2nd Invasion" },
    ];
    keyDates.forEach((kd) => {
      const kdDate = new Date(kd.date);
      if (kdDate < viewRange.start || kdDate > viewRange.end) return;
      const x = timeToX(kdDate);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, MARGIN_TOP);
      ctx.lineTo(x, axisY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "9px monospace";
      ctx.fillStyle = "#888";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(kd.label, x, MARGIN_TOP - 4);
    });
  }, [viewRange, events, lanes, selectedEvent, canvasWidth, height, timeToX, laneToY, DPR]);

  // ---------- Resize observer ----------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });
    ro.observe(container);
    setCanvasWidth(container.clientWidth);
    return () => ro.disconnect();
  }, []);

  // ---------- Hit detection ----------
  const findEventAt = useCallback(
    (clientX: number, clientY: number): SwimEvent | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      for (const evt of events) {
        const evtDate = new Date(evt.date);
        if (evtDate < viewRange.start || evtDate > viewRange.end) continue;
        const ex = timeToX(evtDate);
        const ey = laneToY(evt.lane);
        const dist = Math.sqrt((x - ex) ** 2 + (y - ey) ** 2);
        if (dist <= HIT_RADIUS) return evt;
      }
      return null;
    },
    [events, viewRange, timeToX, laneToY]
  );

  // ---------- Zoom ----------
  const zoom = useCallback(
    (factor: number, pivotX?: number) => {
      setViewRange((prev) => {
        const totalMs = prev.end.getTime() - prev.start.getTime();
        const newTotalMs = totalMs * factor;

        // Clamp: minimum 7 days, maximum 10 years
        const minMs = 7 * 24 * 60 * 60 * 1000;
        const maxMs = 10 * 365.25 * 24 * 60 * 60 * 1000;
        const clampedMs = Math.max(minMs, Math.min(maxMs, newTotalMs));

        // Pivot point: default center
        const drawWidth = canvasWidth - MARGIN_LEFT - MARGIN_RIGHT;
        const pivotRatio = pivotX !== undefined
          ? (pivotX - MARGIN_LEFT) / drawWidth
          : 0.5;
        const clampedPivot = Math.max(0, Math.min(1, pivotRatio));

        const pivotMs = prev.start.getTime() + totalMs * clampedPivot;
        const newStart = new Date(pivotMs - clampedMs * clampedPivot);
        const newEnd = new Date(pivotMs + clampedMs * (1 - clampedPivot));

        return { start: newStart, end: newEnd };
      });
    },
    [canvasWidth]
  );

  // ---------- Mouse handlers ----------
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.15 : 0.87;
      const rect = canvasRef.current?.getBoundingClientRect();
      const pivotX = rect ? e.clientX - rect.left : undefined;
      zoom(factor, pivotX);
    },
    [zoom]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Right-click or middle-click: ignore
      if (e.button !== 0) return;
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        startRange: { ...viewRange },
      };
    },
    [viewRange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning || !panStartRef.current) {
        // Update cursor based on hover
        const hit = findEventAt(e.clientX, e.clientY);
        const canvas = canvasRef.current;
        if (canvas) canvas.style.cursor = hit ? "pointer" : "grab";
        return;
      }

      const dx = e.clientX - panStartRef.current.x;
      const drawWidth = canvasWidth - MARGIN_LEFT - MARGIN_RIGHT;
      const { startRange } = panStartRef.current;
      const totalMs = startRange.end.getTime() - startRange.start.getTime();
      const msPerPx = totalMs / drawWidth;
      const shiftMs = -dx * msPerPx;

      setViewRange({
        start: new Date(startRange.start.getTime() + shiftMs),
        end: new Date(startRange.end.getTime() + shiftMs),
      });
    },
    [isPanning, canvasWidth, findEventAt]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = Math.abs(e.clientX - panStartRef.current.x);
        // If minimal movement, treat as click
        if (dx < 4) {
          const hit = findEventAt(e.clientX, e.clientY);
          if (hit) {
            setSelectedEvent(hit);
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              setBulletinPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
          } else {
            setSelectedEvent(null);
          }
        }
      }
      setIsPanning(false);
      panStartRef.current = null;
    },
    [isPanning, findEventAt]
  );

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  // ---------- Touch handlers (mobile) ----------
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          dist: 0,
          startRange: { ...viewRange },
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        touchStartRef.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          dist: Math.sqrt(dx * dx + dy * dy),
          startRange: { ...viewRange },
        };
      }
    },
    [viewRange]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;

      if (e.touches.length === 1) {
        // Pan
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const drawWidth = canvasWidth - MARGIN_LEFT - MARGIN_RIGHT;
        const { startRange } = touchStartRef.current;
        const totalMs = startRange.end.getTime() - startRange.start.getTime();
        const msPerPx = totalMs / drawWidth;
        const shiftMs = -dx * msPerPx;
        setViewRange({
          start: new Date(startRange.start.getTime() + shiftMs),
          end: new Date(startRange.end.getTime() + shiftMs),
        });
      } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
        // Pinch zoom
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const scale = touchStartRef.current.dist / newDist;
        const { startRange } = touchStartRef.current;
        const totalMs = startRange.end.getTime() - startRange.start.getTime();
        const newTotalMs = totalMs * scale;
        const center = startRange.start.getTime() + totalMs / 2;
        setViewRange({
          start: new Date(center - newTotalMs / 2),
          end: new Date(center + newTotalMs / 2),
        });
      }
    },
    [canvasWidth]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Tap detection: if single touch with minimal movement
      if (e.changedTouches.length === 1 && touchStartRef.current) {
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
        if (dx < 8) {
          const hit = findEventAt(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
          if (hit) {
            setSelectedEvent(hit);
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              setBulletinPos({
                x: e.changedTouches[0].clientX - rect.left,
                y: e.changedTouches[0].clientY - rect.top,
              });
            }
          } else {
            setSelectedEvent(null);
          }
        }
      }
      touchStartRef.current = null;
    },
    [findEventAt]
  );

  // ---------- Date range inputs ----------
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value);
    if (!isNaN(d.getTime()) && d < viewRange.end) {
      setViewRange((prev) => ({ ...prev, start: d }));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value);
    if (!isNaN(d.getTime()) && d > viewRange.start) {
      setViewRange((prev) => ({ ...prev, end: d }));
    }
  };

  const formatDateInput = (d: Date) => d.toISOString().split("T")[0];

  // ---------- Render ----------
  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        {/* Date range picker */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">From</label>
          <input
            type="date"
            value={formatDateInput(viewRange.start)}
            onChange={handleStartDateChange}
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-gray-300 focus:border-cyan-500/50 focus:outline-none"
          />
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">To</label>
          <input
            type="date"
            value={formatDateInput(viewRange.end)}
            onChange={handleEndDateChange}
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-gray-300 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        {/* Zoom buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => zoom(0.7)}
            className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm font-mono text-gray-300 transition-colors"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => zoom(1.4)}
            className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm font-mono text-gray-300 transition-colors"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            onClick={() => setViewRange({ start: new Date("2023-10-07"), end: new Date("2026-07-01") })}
            className="px-2 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-mono text-gray-400 transition-colors"
            aria-label="Reset zoom"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full rounded-md"
          style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
        />

        {/* Bulletin card (above timeline) */}
        {selectedEvent && (
          <div
            className="absolute z-50 glass-panel p-3 max-w-[280px] sm:max-w-xs pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{
              left: Math.max(8, Math.min(bulletinPos.x - 80, canvasWidth - 300)),
              top: Math.max(4, bulletinPos.y - 130),
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: selectedEvent.color }}
              />
              <span className="font-mono text-[10px] text-cyan-400 tracking-wide">
                {selectedEvent.date}
              </span>
              <span className="font-mono text-[9px] text-gray-600 ml-auto">
                {lanes.find((l) => l.key === selectedEvent.lane)?.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-white leading-tight">
              {selectedEvent.label}
            </p>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              {selectedEvent.description}
            </p>
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/5">
              <span className="text-[9px] font-mono text-gray-500">
                SEVERITY
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-3 rounded-sm"
                    style={{
                      backgroundColor:
                        i < selectedEvent.severity
                          ? selectedEvent.color
                          : "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-gray-500 ml-1">
                {selectedEvent.severity}/10
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 px-1">
        {lanes.map((lane) => (
          <div key={lane.key} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: lane.color }}
            />
            <span className="font-mono text-[9px] text-gray-500">{lane.label}</span>
          </div>
        ))}
      </div>

      {/* Instructions hint */}
      <p className="font-mono text-[9px] text-gray-600 mt-2 px-1">
        Drag to pan | Scroll to zoom | Click dot for details | Use date inputs to jump
      </p>
    </div>
  );
}
