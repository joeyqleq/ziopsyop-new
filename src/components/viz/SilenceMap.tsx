"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TracedCard } from "@/components/fx/TracedCard";

interface DayRow {
  date: string;
  almanar: number;
  ch14: number;
  casualties: number;
}

interface TooltipState {
  x: number;
  y: number;
  day: DayRow;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const CELL = 11;
const GAP = 2;
const STEP = CELL + GAP;

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function SilenceMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 120 });
  const dayMapRef = useRef<Map<string, DayRow>>(new Map());

  // Fetch
  useEffect(() => {
    fetch("/api/silence-map")
      .then((r) => r.json())
      .then((data: DayRow[]) => {
        setRows(data);
        const m = new Map<string, DayRow>();
        data.forEach((d) => m.set(d.date, d));
        dayMapRef.current = m;
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Resize
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) {
        const w = e.contentRect.width;
        setDims({ w, h: Math.max(130, Math.min(180, w * 0.22)) });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Draw
  useEffect(() => {
    if (loading || rows.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, dims.w, dims.h);

    // Build week columns: one column per week starting Sunday
    const startDate = new Date(2023, 7, 1); // Aug 1 2023
    const endDate = new Date(2026, 6, 14);  // Jul 14 2026

    const MARGIN_LEFT = 28;
    const MARGIN_TOP = 20;

    // Day-of-week labels
    const DOW_LABELS = ["", "M", "", "W", "", "F", ""];
    DOW_LABELS.forEach((label, i) => {
      if (!label) return;
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = `8px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(label, MARGIN_LEFT - 4, MARGIN_TOP + i * STEP + CELL - 1);
    });

    let col = 0;
    let lastMonthLabel = -1;
    const cur = new Date(startDate);
    // Align to Sunday
    while (cur.getDay() !== 0) cur.setDate(cur.getDate() - 1);

    while (cur <= endDate) {
      const weekStartCol = col;

      for (let dow = 0; dow < 7; dow++) {
        const dateStr = cur.toISOString().split("T")[0];
        const day = dayMapRef.current.get(dateStr);
        const inRange = cur >= startDate && cur <= endDate;

        if (inRange) {
          let color = "rgba(255,255,255,0.06)"; // no data

          if (day) {
            const isBlackout = day.almanar > 0 && day.ch14 === 0;
            const hasCasualties = day.casualties > 0;

            if (isBlackout && hasCasualties) {
              // Most critical: Al-Manar reports casualties, Channel 14 silent
              const intensity = Math.min(1, day.casualties / 8);
              const r = Math.round(255);
              const g = Math.round(77 * (1 - intensity * 0.6));
              const b = Math.round(94 * (1 - intensity * 0.6));
              color = `rgba(${r},${g},${b},${0.7 + intensity * 0.3})`;
            } else if (isBlackout) {
              // Al-Manar active, Channel 14 silent (no casualties)
              color = "rgba(255,180,0,0.55)";
            } else if (day.ch14 > 0 && day.almanar > 0) {
              // Both active — normal
              color = "rgba(255,255,255,0.12)";
            } else if (day.ch14 > 0) {
              // Only Channel 14
              color = "rgba(255,77,94,0.3)";
            }
          }

          const x = MARGIN_LEFT + col * STEP;
          const y = MARGIN_TOP + dow * STEP;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x, y, CELL, CELL, 2);
          ctx.fill();
        }

        // Month label on first week that contains the 1st
        if (cur.getDate() === 1 && inRange) {
          const m = cur.getMonth();
          if (m !== lastMonthLabel) {
            lastMonthLabel = m;
            ctx.fillStyle = "rgba(255,255,255,0.45)";
            ctx.font = "8px monospace";
            ctx.textAlign = "left";
            const x = MARGIN_LEFT + col * STEP;
            ctx.fillText(MONTHS[m], x, MARGIN_TOP - 6);

            // Year label
            if (m === 0) {
              ctx.fillStyle = "rgba(255,255,255,0.7)";
              ctx.font = "bold 8px monospace";
              ctx.fillText(String(cur.getFullYear()), x, MARGIN_TOP - 6);
            }
          }
        }

        cur.setDate(cur.getDate() + 1);
      }
      col++;
    }

    // Legend
    const legendY = dims.h - 18;
    const legendItems = [
      { color: "rgba(255,77,94,0.95)", label: "Blackout + casualties" },
      { color: "rgba(255,180,0,0.55)", label: "Blackout (no casualties)" },
      { color: "rgba(255,255,255,0.12)", label: "Both active" },
      { color: "rgba(255,255,255,0.06)", label: "No data" },
    ];
    let lx = MARGIN_LEFT;
    legendItems.forEach((li) => {
      ctx.fillStyle = li.color;
      ctx.beginPath();
      ctx.roundRect(lx, legendY, 9, 9, 1);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "8px monospace";
      ctx.textAlign = "left";
      ctx.fillText(li.label, lx + 12, legendY + 8);
      lx += li.label.length * 5.2 + 22;
    });
  }, [rows, dims, loading]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const MARGIN_LEFT = 28;
      const MARGIN_TOP = 20;

      const col = Math.floor((mx - MARGIN_LEFT) / STEP);
      const dow = Math.floor((my - MARGIN_TOP) / STEP);
      if (col < 0 || dow < 0 || dow > 6) {
        setTooltip(null);
        return;
      }

      const startDate = new Date(2023, 7, 1);
      const alignedStart = new Date(startDate);
      while (alignedStart.getDay() !== 0) alignedStart.setDate(alignedStart.getDate() - 1);

      const targetDate = new Date(alignedStart);
      targetDate.setDate(targetDate.getDate() + col * 7 + dow);

      const dateStr = targetDate.toISOString().split("T")[0];
      const day = dayMapRef.current.get(dateStr);
      if (day) {
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, day });
      } else {
        setTooltip(null);
      }
    },
    []
  );

  const blackoutCount = rows.filter((r) => r.almanar > 0 && r.ch14 === 0).length;
  const blackoutWithCasualties = rows.filter((r) => r.almanar > 0 && r.ch14 === 0 && r.casualties > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <TracedCard traceColor="var(--threat)" className="p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[9px] tracking-[0.4em] text-threat mb-1">
              // EX-MW-03 — COVERAGE BLACKOUT MAP
            </p>
            <p className="font-mono text-sm md:text-base font-bold text-foreground">
              CHANNEL 14 SILENCE MAP — AUG 2023 TO JUL 2026
            </p>
          </div>
          <div className="flex gap-4 font-mono text-right">
            <div>
              <p className="text-[20px] font-bold text-threat leading-none">{blackoutCount}</p>
              <p className="text-[8px] tracking-[0.15em] text-muted-2 mt-0.5">BLACKOUT DAYS</p>
            </div>
            <div>
              <p className="text-[20px] font-bold text-threat leading-none">{blackoutWithCasualties}</p>
              <p className="text-[8px] tracking-[0.15em] text-muted-2 mt-0.5">WITH CASUALTIES</p>
            </div>
          </div>
        </div>

        <div ref={containerRef} className="w-full relative">
          {loading ? (
            <div className="flex items-center justify-center h-[130px]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-muted-2 animate-pulse">
                LOADING MAP...
              </p>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height: dims.h }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-crosshair"
              />
              {tooltip && (
                <div
                  className="absolute pointer-events-none z-10 bg-bg border border-borderc rounded p-2 font-mono text-[9px] leading-relaxed min-w-[160px]"
                  style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
                >
                  <p className="text-foreground font-bold">{tooltip.day.date}</p>
                  <p style={{ color: "#b6ff7c" }}>Al-Manar: {tooltip.day.almanar} msgs</p>
                  <p style={{ color: "#ff4d5e" }}>
                    Channel 14: {tooltip.day.ch14 === 0 ? (
                      <span className="font-bold text-threat">SILENT</span>
                    ) : tooltip.day.ch14}
                  </p>
                  {tooltip.day.casualties > 0 && (
                    <p className="text-threat">{tooltip.day.casualties} casualty reports</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-3 font-mono text-[9px] tracking-[0.15em] text-muted-2 leading-relaxed">
          EACH CELL = ONE DAY. RED = Channel 14 published nothing while Al-Manar reported casualties.
          AMBER = Channel 14 silent while Al-Manar active. These are not slow news days.
          On <span className="text-threat font-bold">Sep 24, 2024</span>: Al-Manar reported 569 martyrs including 50 children and 94 women.
          Channel 14 published zero posts.
        </p>
      </TracedCard>
    </motion.div>
  );
}
