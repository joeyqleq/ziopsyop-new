"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TracedCard } from "@/components/fx/TracedCard";

// ---------- Source config ----------
const SOURCES = [
  { key: "almanar", label: "Al-Manar", color: "#b6ff7c" },
  { key: "almayadeen", label: "Al-Mayadeen", color: "#7b39d0" },
  { key: "channel_14", label: "Channel 14", color: "#ff4d5e" },
] as const;

type SourceKey = (typeof SOURCES)[number]["key"];

const CATEGORIES = [
  { value: "all", label: "ALL" },
  { value: "military_action", label: "MILITARY" },
  { value: "political", label: "POLITICAL" },
  { value: "casualties", label: "CASUALTIES" },
  { value: "media_narrative", label: "NARRATIVE" },
] as const;

type CategoryFilter = (typeof CATEGORIES)[number]["value"];

// ---------- Interfaces ----------
interface MediaEvent {
  id: string;
  source: SourceKey;
  event_date: string;
  text: string;
  category: string;
  topics: string[];
}

interface DayBucket {
  date: string; // YYYY-MM-DD
  almanar: number;
  almayadeen: number;
  channel_14: number;
  total: number;
  isContradiction: boolean;
}

interface DayBriefing {
  date: string;
  events: MediaEvent[];
  counts: Record<SourceKey, number>;
}

// Summary row from API summary mode
interface SummaryRow {
  date: string;
  almanar: number;
  almayadeen: number;
  channel_14: number;
}

// ---------- Layout constants ----------
const MARGIN_LEFT = 50;
const MARGIN_TOP = 30;
const MARGIN_BOTTOM = 40;
const MARGIN_RIGHT = 20;
const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 80;

// ---------- Helpers ----------
function formatDateInput(d: Date): string {
  return d.toISOString().split("T")[0];
}

function truncate(s: string, max: number): string {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

// ---------- Component ----------
export function MediaNarrativeTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dimensions
  const [canvasWidth, setCanvasWidth] = useState(800);
  const canvasHeight = 340;

  // View range (pannable/zoomable)
  const [viewRange, setViewRange] = useState({
    start: new Date("2023-10-01"),
    end: new Date("2026-07-01"),
  });

  // Fetch range (debounced from viewRange)
  const [fetchRange, setFetchRange] = useState({
    start: "2023-10-01",
    end: "2026-07-01",
  });

  // Filters
  const [enabledSources, setEnabledSources] = useState<Record<SourceKey, boolean>>({
    almanar: true,
    almayadeen: true,
    channel_14: true,
  });
  const [category, setCategory] = useState<CategoryFilter>("all");

  // Data
  const [summaryData, setSummaryData] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction state
  const [hoveredBucketIdx, setHoveredBucketIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedDay, setSelectedDay] = useState<DayBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; startRange: { start: Date; end: Date } } | null>(null);
  const touchStartRef = useRef<{ x: number; dist: number; startRange: { start: Date; end: Date } } | null>(null);

  // DPR (stable after mount)
  const DPR = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // ---------- Debounce viewRange -> fetchRange ----------
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setFetchRange({
        start: formatDateInput(viewRange.start),
        end: formatDateInput(viewRange.end),
      });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [viewRange.start, viewRange.end]);

  // ---------- Fetch summary data (lightweight: daily counts per source) ----------
  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      setError(null);

      const sourceFilter = Object.entries(enabledSources)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(",");

      const params = new URLSearchParams({
        start: fetchRange.start,
        end: fetchRange.end,
        source: sourceFilter || "all",
        category: category,
        summary: "true",
      });

      try {
        const res = await fetch(`/api/media-events?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json: SummaryRow[] = await res.json();
        if (!cancelled) {
          setSummaryData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [fetchRange.start, fetchRange.end, enabledSources, category]);

  // ---------- Aggregate into day buckets ----------
  const buckets: DayBucket[] = useMemo(() => {
    if (summaryData.length === 0) return [];

    return summaryData.map((row) => {
      const almanar = enabledSources.almanar ? row.almanar : 0;
      const almayadeen = enabledSources.almayadeen ? row.almayadeen : 0;
      const channel_14 = enabledSources.channel_14 ? row.channel_14 : 0;

      const activeSources = [
        row.almanar > 0,
        row.almayadeen > 0,
        row.channel_14 > 0,
      ].filter(Boolean).length;

      return {
        date: row.date,
        almanar,
        almayadeen,
        channel_14,
        total: almanar + almayadeen + channel_14,
        isContradiction: activeSources === 3,
      };
    });
  }, [summaryData, enabledSources]);

  // ---------- Contradiction density ----------
  const contradictionDensity = useMemo(() => {
    if (buckets.length === 0) return 0;
    const contradictionCount = buckets.filter((b) => b.isContradiction).length;
    return Math.round((contradictionCount / buckets.length) * 100);
  }, [buckets]);

  // ---------- Y scale ----------
  const maxCount = useMemo(() => {
    if (buckets.length === 0) return 10;
    return Math.max(10, ...buckets.map((b) => b.total));
  }, [buckets]);

  // ---------- Coordinate helpers ----------
  const drawWidth = canvasWidth - MARGIN_LEFT - MARGIN_RIGHT;
  const drawHeight = canvasHeight - MARGIN_TOP - MARGIN_BOTTOM;

  const dateToX = useCallback(
    (dateStr: string): number => {
      const d = new Date(dateStr + "T00:00:00Z");
      const totalMs = viewRange.end.getTime() - viewRange.start.getTime();
      const offsetMs = d.getTime() - viewRange.start.getTime();
      return MARGIN_LEFT + (offsetMs / totalMs) * drawWidth;
    },
    [viewRange, drawWidth]
  );

  const valueToY = useCallback(
    (val: number): number => {
      return MARGIN_TOP + drawHeight - (val / maxCount) * drawHeight;
    },
    [drawHeight, maxCount]
  );

  // ---------- Canvas draw ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvasWidth;
    const h = canvasHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(DPR, DPR);

    // Clear
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, w, h);

    // Loading skeleton
    if (loading && buckets.length === 0) {
      ctx.globalAlpha = 0.15;
      const skeletonBars = 40;
      const barW = drawWidth / skeletonBars - 1;
      for (let i = 0; i < skeletonBars; i++) {
        const barH = 20 + Math.random() * (drawHeight - 40);
        const x = MARGIN_LEFT + i * (barW + 1);
        const y = MARGIN_TOP + drawHeight - barH;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, barW, barH);
      }
      ctx.globalAlpha = 1;
      ctx.font = "12px monospace";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Loading media events…", w / 2, h / 2);
      return;
    }

    // Error state
    if (error) {
      ctx.font = "13px monospace";
      ctx.fillStyle = "#ff4d5e";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DATA UNAVAILABLE", w / 2, h / 2 - 10);
      ctx.font = "11px monospace";
      ctx.fillStyle = "#666";
      ctx.fillText(error, w / 2, h / 2 + 12);
      return;
    }

    if (buckets.length === 0) {
      ctx.font = "12px monospace";
      ctx.fillStyle = "#555";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No data in range", w / 2, h / 2);
      return;
    }

    // --- Draw y-axis ---
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round((maxCount / yTicks) * i);
      const y = valueToY(val);
      // Gridline
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGIN_LEFT, y);
      ctx.lineTo(MARGIN_LEFT + drawWidth, y);
      ctx.stroke();
      // Label
      ctx.fillStyle = "#555";
      ctx.fillText(val.toString(), MARGIN_LEFT - 6, y);
    }

    // --- Draw x-axis date labels ---
    const rangeMs = viewRange.end.getTime() - viewRange.start.getTime();
    const rangeDays = rangeMs / 86400000;

    const axisY = MARGIN_TOP + drawHeight;

    // Axis line
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, axisY);
    ctx.lineTo(MARGIN_LEFT + drawWidth, axisY);
    ctx.stroke();

    // Month ticks — adaptive interval
    const tickStart = new Date(viewRange.start);
    tickStart.setUTCDate(1);
    if (tickStart < viewRange.start) {
      tickStart.setUTCMonth(tickStart.getUTCMonth() + 1);
    }

    let tickLabelInterval = 1;
    if (rangeDays > 1000) tickLabelInterval = 6;
    else if (rangeDays > 600) tickLabelInterval = 3;
    else if (rangeDays > 300) tickLabelInterval = 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "9px monospace";

    let tickIdx = 0;
    const currentTick = new Date(tickStart);
    while (currentTick <= viewRange.end) {
      if (tickIdx % tickLabelInterval === 0) {
        const x = dateToX(formatDateInput(currentTick));
        if (x >= MARGIN_LEFT && x <= MARGIN_LEFT + drawWidth) {
          // Vertical gridline at month
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, MARGIN_TOP);
          ctx.lineTo(x, axisY);
          ctx.stroke();
          // Tick mark
          ctx.strokeStyle = "#444";
          ctx.beginPath();
          ctx.moveTo(x, axisY);
          ctx.lineTo(x, axisY + 5);
          ctx.stroke();
          // Label
          ctx.fillStyle = "#555";
          const lbl = currentTick.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
            timeZone: "UTC",
          });
          ctx.fillText(lbl, x, axisY + 8);
        }
      }
      currentTick.setUTCMonth(currentTick.getUTCMonth() + 1);
      tickIdx++;
    }

    // --- Draw bars ---
    const numBuckets = buckets.length;
    const barWidth = Math.max(1, (drawWidth / numBuckets) - 1);

    for (let i = 0; i < numBuckets; i++) {
      const bucket = buckets[i];
      const x = dateToX(bucket.date);

      // Skip if out of viewport
      if (x + barWidth / 2 < MARGIN_LEFT || x - barWidth / 2 > MARGIN_LEFT + drawWidth) continue;

      let currentY = MARGIN_TOP + drawHeight; // bottom of chart

      // Draw stacked: almanar (bottom), almayadeen (middle), channel_14 (top)
      const segments: { count: number; color: string }[] = [
        { count: bucket.almanar, color: "#b6ff7c" },
        { count: bucket.almayadeen, color: "#7b39d0" },
        { count: bucket.channel_14, color: "#ff4d5e" },
      ];

      for (const seg of segments) {
        if (seg.count === 0) continue;
        const segHeight = (seg.count / maxCount) * drawHeight;
        currentY -= segHeight;

        ctx.fillStyle = seg.color;
        ctx.globalAlpha = hoveredBucketIdx === i ? 1.0 : 0.75;
        ctx.fillRect(x - barWidth / 2, currentY, barWidth, segHeight);
      }

      ctx.globalAlpha = 1;

      // Contradiction highlight: amber top marker
      if (bucket.isContradiction) {
        const topY = valueToY(bucket.total);
        ctx.fillStyle = "#f59e0b";
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x - barWidth / 2, topY - 2, barWidth, 2);
        ctx.globalAlpha = 1;
      }

      // Hover overlay
      if (hoveredBucketIdx === i) {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(x - barWidth / 2 - 1, MARGIN_TOP, barWidth + 2, drawHeight);
      }
    }
  }, [
    buckets, canvasWidth, canvasHeight, drawWidth, drawHeight,
    loading, error, maxCount, viewRange, hoveredBucketIdx,
    dateToX, valueToY, DPR,
  ]);

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

  // ---------- Hit detection (which bucket is at x?) ----------
  const findBucketAt = useCallback(
    (clientX: number): number | null => {
      const canvas = canvasRef.current;
      if (!canvas || buckets.length === 0) return null;
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;

      if (mx < MARGIN_LEFT || mx > MARGIN_LEFT + drawWidth) return null;

      // Find closest bucket by x position
      let closest = -1;
      let closestDist = Infinity;
      const barWidth = Math.max(1, (drawWidth / buckets.length) - 1);

      for (let i = 0; i < buckets.length; i++) {
        const bx = dateToX(buckets[i].date);
        const dist = Math.abs(mx - bx);
        if (dist < closestDist && dist <= barWidth) {
          closestDist = dist;
          closest = i;
        }
      }

      return closest >= 0 ? closest : null;
    },
    [buckets, drawWidth, dateToX]
  );

  // ---------- Zoom ----------
  const zoom = useCallback(
    (factor: number, pivotX?: number) => {
      setViewRange((prev) => {
        const totalMs = prev.end.getTime() - prev.start.getTime();
        const newTotalMs = totalMs * factor;

        // Clamp: minimum 14 days, maximum 10 years
        const minMs = 14 * 86400000;
        const maxMs = 10 * 365.25 * 86400000;
        const clampedMs = Math.max(minMs, Math.min(maxMs, newTotalMs));

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
    [drawWidth]
  );

  // ---------- Day Briefing loader ----------
  const loadDayBriefing = useCallback(async (date: string) => {
    setBriefingLoading(true);
    setSelectedDay(null);

    try {
      const params = new URLSearchParams({ start: date, end: date });
      const res = await fetch(`/api/media-events?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const events: MediaEvent[] = json.events || [];

      const counts: Record<SourceKey, number> = { almanar: 0, almayadeen: 0, channel_14: 0 };
      for (const evt of events) {
        if (evt.source in counts) {
          counts[evt.source]++;
        }
      }

      setSelectedDay({ date, events, counts });
    } catch {
      setSelectedDay({ date, events: [], counts: { almanar: 0, almayadeen: 0, channel_14: 0 } });
    } finally {
      setBriefingLoading(false);
    }
  }, []);

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
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const { startRange } = panStartRef.current;
        const totalMs = startRange.end.getTime() - startRange.start.getTime();
        const msPerPx = totalMs / drawWidth;
        const shiftMs = -dx * msPerPx;
        setViewRange({
          start: new Date(startRange.start.getTime() + shiftMs),
          end: new Date(startRange.end.getTime() + shiftMs),
        });
        return;
      }

      // Hover detection
      const idx = findBucketAt(e.clientX);
      setHoveredBucketIdx(idx);
      if (idx !== null) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = idx !== null ? "pointer" : "grab";
      }
    },
    [isPanning, drawWidth, findBucketAt]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && panStartRef.current) {
        const dx = Math.abs(e.clientX - panStartRef.current.x);
        // Treat as click if minimal movement
        if (dx < 4) {
          const idx = findBucketAt(e.clientX);
          if (idx !== null) {
            loadDayBriefing(buckets[idx].date);
          }
        }
      }
      setIsPanning(false);
      panStartRef.current = null;
    },
    [isPanning, findBucketAt, buckets, loadDayBriefing]
  );

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
    setHoveredBucketIdx(null);
  }, []);

  // ---------- Touch handlers ----------
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
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const { startRange } = touchStartRef.current;
        const totalMs = startRange.end.getTime() - startRange.start.getTime();
        const msPerPx = totalMs / drawWidth;
        const shiftMs = -dx * msPerPx;
        setViewRange({
          start: new Date(startRange.start.getTime() + shiftMs),
          end: new Date(startRange.end.getTime() + shiftMs),
        });
      } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
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
    [drawWidth]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.changedTouches.length === 1 && touchStartRef.current) {
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
        if (dx < 8) {
          const idx = findBucketAt(e.changedTouches[0].clientX);
          if (idx !== null) {
            loadDayBriefing(buckets[idx].date);
          }
        }
      }
      touchStartRef.current = null;
    },
    [findBucketAt, buckets, loadDayBriefing]
  );

  // ---------- Date range inputs ----------
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value + "T00:00:00Z");
    if (!isNaN(d.getTime()) && d < viewRange.end) {
      setViewRange((prev) => ({ ...prev, start: d }));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value + "T00:00:00Z");
    if (!isNaN(d.getTime()) && d > viewRange.start) {
      setViewRange((prev) => ({ ...prev, end: d }));
    }
  };

  // ---------- Source toggle ----------
  const toggleSource = (key: SourceKey) => {
    setEnabledSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------- Hovered bucket data for tooltip ----------
  const hoveredBucket = hoveredBucketIdx !== null ? buckets[hoveredBucketIdx] : null;

  // ---------- Render ----------
  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* Contradiction density metric */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded px-2.5 py-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono text-[10px] tracking-wider text-amber-400 uppercase">
            Contradiction Density
          </span>
          <span className="font-mono text-sm font-bold text-amber-300">
            {contradictionDensity}%
          </span>
        </div>
        <span className="font-mono text-[9px] text-gray-600">
          Days where all 3 sources covered same events with different framing
        </span>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        {/* Date range picker */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">From</label>
          <input
            type="date"
            value={formatDateInput(viewRange.start)}
            onChange={handleStartDateChange}
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-gray-300 focus:border-[#b6ff7c]/50 focus:outline-none"
          />
          <label className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">To</label>
          <input
            type="date"
            value={formatDateInput(viewRange.end)}
            onChange={handleEndDateChange}
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-gray-300 focus:border-[#b6ff7c]/50 focus:outline-none"
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
            onClick={() => setViewRange({ start: new Date("2023-10-01"), end: new Date("2026-07-01") })}
            className="px-2 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-mono text-gray-400 transition-colors"
            aria-label="Reset zoom"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4 mb-3 px-1">
        {/* Source toggles */}
        <div className="flex items-center gap-3">
          {SOURCES.map((src) => (
            <label key={src.key} className="flex items-center gap-1.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={enabledSources[src.key]}
                onChange={() => toggleSource(src.key)}
                className="sr-only peer"
              />
              <span
                className="w-3 h-3 rounded-sm border transition-all peer-checked:border-transparent"
                style={{
                  borderColor: enabledSources[src.key] ? src.color : "#444",
                  backgroundColor: enabledSources[src.key] ? src.color : "transparent",
                }}
              />
              <span className="font-mono text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors">
                {src.label}
              </span>
            </label>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 bg-white/5 rounded border border-white/10 p-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider transition-all ${
                category === cat.value
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas + error overlay */}
      <div className="relative">
        {error ? (
          <TracedCard traceColor="#ff4d5e" className="p-6 flex flex-col items-center justify-center" style={{ minHeight: canvasHeight }}>
            <p className="font-mono text-sm text-[#ff4d5e] tracking-wider mb-2">DATA UNAVAILABLE</p>
            <p className="font-mono text-xs text-gray-500">{error}</p>
            <button
              onClick={() => setFetchRange({ start: formatDateInput(viewRange.start), end: formatDateInput(viewRange.end) })}
              className="mt-3 px-3 py-1 rounded border border-white/10 hover:border-white/20 font-mono text-[10px] text-gray-400 hover:text-white transition-colors"
            >
              RETRY
            </button>
          </TracedCard>
        ) : (
          <>
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

            {/* Tooltip */}
            {hoveredBucket && hoveredBucketIdx !== null && (
              <div
                className="absolute z-50 pointer-events-none bg-black/90 border border-white/10 rounded-md px-3 py-2 backdrop-blur-sm"
                style={{
                  left: Math.max(8, Math.min(tooltipPos.x - TOOLTIP_WIDTH / 2, canvasWidth - TOOLTIP_WIDTH - 8)),
                  top: Math.max(4, tooltipPos.y - TOOLTIP_HEIGHT - 8),
                  width: TOOLTIP_WIDTH,
                }}
              >
                <p className="font-mono text-[10px] text-gray-400 mb-1.5">{hoveredBucket.date}</p>
                <div className="flex flex-col gap-0.5">
                  {SOURCES.map((src) => (
                    <div key={src.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: src.color }} />
                        <span className="font-mono text-[9px] text-gray-400">{src.label}</span>
                      </div>
                      <span className="font-mono text-[10px] text-white">
                        {hoveredBucket[src.key as SourceKey]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 pt-1 border-t border-white/5 flex justify-between">
                  <span className="font-mono text-[9px] text-gray-500">TOTAL</span>
                  <span className="font-mono text-[10px] text-white font-bold">{hoveredBucket.total}</span>
                </div>
                {hoveredBucket.isContradiction && (
                  <p className="mt-1 font-mono text-[8px] text-amber-400 uppercase tracking-wider">
                    Contradiction day
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 px-1">
        {SOURCES.map((src) => (
          <div key={src.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: src.color }} />
            <span className="font-mono text-[9px] text-gray-500">{src.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-amber-500 rounded" />
          <span className="font-mono text-[9px] text-gray-500">Contradiction marker</span>
        </div>
      </div>

      {/* Instructions */}
      <p className="font-mono text-[9px] text-gray-600 mt-2 px-1">
        Drag to pan | Scroll to zoom | Click bar for day briefing
      </p>

      {/* Day Briefing Panel */}
      <AnimatePresence>
        {(selectedDay || briefingLoading) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden mt-4"
          >
            <div className="rounded-md border border-white/10 bg-black/50 backdrop-blur-sm p-4">
              {briefingLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-[#b6ff7c]/50 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs text-gray-400">Loading day briefing...</span>
                </div>
              ) : selectedDay ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono text-sm font-semibold text-white tracking-wider">
                        DAY BRIEFING
                      </h3>
                      <span className="font-mono text-xs text-[#b6ff7c]">{selectedDay.date}</span>
                    </div>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="font-mono text-[10px] text-gray-500 hover:text-white transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
                    >
                      CLOSE
                    </button>
                  </div>

                  {/* Source columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {SOURCES.map((src) => {
                      const count = selectedDay.counts[src.key];
                      const eventsForSource = selectedDay.events
                        .filter((e) => e.source === src.key)
                        .slice(0, 5);

                      // Check if source is silent while others are active
                      const otherSourcesActive = SOURCES
                        .filter((s) => s.key !== src.key)
                        .some((s) => selectedDay.counts[s.key] > 3);
                      const isSilent = count === 0 && otherSourcesActive;

                      return (
                        <div
                          key={src.key}
                          className="rounded-md bg-black/30 border border-white/5 p-3"
                        >
                          {/* Source header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-sm"
                                style={{ backgroundColor: src.color }}
                              />
                              <span className="font-mono text-[10px] text-gray-300 uppercase tracking-wider">
                                {src.label}
                              </span>
                            </div>
                            <span
                              className="font-mono text-xs font-bold px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${src.color}20`,
                                color: src.color,
                              }}
                            >
                              {count}
                            </span>
                          </div>

                          {/* Silent notice */}
                          {isSilent && (
                            <p className="font-mono text-[9px] text-amber-400 uppercase tracking-wider mb-2">
                              {src.label.toUpperCase()} SILENT
                            </p>
                          )}

                          {/* Event snippets */}
                          {eventsForSource.length > 0 ? (
                            <ul className="space-y-1.5">
                              {eventsForSource.map((evt, idx) => (
                                <li key={evt.id || idx} className="flex gap-1.5">
                                  <span className="text-gray-600 mt-0.5 text-[10px] select-none">&bull;</span>
                                  <span className="font-mono text-[10px] text-gray-400 leading-relaxed">
                                    {truncate(evt.text, 120)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : !isSilent ? (
                            <p className="font-mono text-[9px] text-gray-600 italic">No messages</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
