"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TracedCard } from "@/components/fx/TracedCard";

// Verified SQL-sourced values (deduplicated unique messages)
const SOURCES = [
  {
    key: "almanar",
    label: "Al-Manar",
    color: "#b6ff7c",
    totalUnique: 17443,
    terrorCount: 56,
    terrorPct: 0.32,
  },
  {
    key: "almayadeen",
    label: "Al-Mayadeen",
    color: "#7b39d0",
    totalUnique: 9063,
    terrorCount: 210,
    terrorPct: 2.32,
  },
  {
    key: "channel_14",
    label: "Channel 14",
    color: "#ff4d5e",
    totalUnique: 3981,
    terrorCount: 717,
    terrorPct: 18.01,
  },
];

const MAX_PCT = 20; // scale cap

export function TerrorDensityGauge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dims, setDims] = useState({ w: 600, h: 260 });
  const animRef = useRef(0);
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setDims({ w: e.contentRect.width, h: Math.min(300, Math.max(200, e.contentRect.width * 0.38)) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    const W = dims.w;
    const H = dims.h;
    const barW = Math.min(120, (W - 80) / SOURCES.length - 20);
    const barGap = (W - 40 - SOURCES.length * barW) / (SOURCES.length + 1);
    const maxBarH = H - 80;
    const baseY = H - 40;

    let start: number | null = null;
    const DURATION = 1200;

    function draw(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / DURATION, 1);
      // ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      animRef.current = ease;
      progressRef.current = ease;

      ctx!.clearRect(0, 0, W, H);

      // Grid lines
      ctx!.strokeStyle = "rgba(255,255,255,0.06)";
      ctx!.lineWidth = 1;
      for (let p = 0; p <= MAX_PCT; p += 5) {
        const y = baseY - (p / MAX_PCT) * maxBarH;
        ctx!.beginPath();
        ctx!.moveTo(20, y);
        ctx!.lineTo(W - 20, y);
        ctx!.stroke();
        ctx!.fillStyle = "rgba(255,255,255,0.3)";
        ctx!.font = `${Math.max(9, dims.w * 0.015)}px monospace`;
        ctx!.textAlign = "right";
        ctx!.fillText(`${p}%`, 16, y + 4);
      }

      // Bars
      SOURCES.forEach((src, i) => {
        const x = 20 + barGap + i * (barW + barGap);
        const fullH = (src.terrorPct / MAX_PCT) * maxBarH;
        const animH = fullH * ease;
        const isHov = hovered === i;

        // Bar glow
        if (isHov) {
          const grd = ctx!.createLinearGradient(x, baseY - animH, x, baseY);
          grd.addColorStop(0, src.color + "ff");
          grd.addColorStop(1, src.color + "44");
          ctx!.fillStyle = grd;
          ctx!.shadowColor = src.color;
          ctx!.shadowBlur = 18;
        } else {
          const grd = ctx!.createLinearGradient(x, baseY - animH, x, baseY);
          grd.addColorStop(0, src.color + "cc");
          grd.addColorStop(1, src.color + "33");
          ctx!.fillStyle = grd;
          ctx!.shadowBlur = 0;
        }

        // Draw bar
        const radius = 3;
        ctx!.beginPath();
        ctx!.moveTo(x + radius, baseY - animH);
        ctx!.lineTo(x + barW - radius, baseY - animH);
        ctx!.quadraticCurveTo(x + barW, baseY - animH, x + barW, baseY - animH + radius);
        ctx!.lineTo(x + barW, baseY);
        ctx!.lineTo(x, baseY);
        ctx!.lineTo(x, baseY - animH + radius);
        ctx!.quadraticCurveTo(x, baseY - animH, x + radius, baseY - animH);
        ctx!.closePath();
        ctx!.fill();
        ctx!.shadowBlur = 0;

        // Baseline tick
        ctx!.strokeStyle = src.color + "66";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(x, baseY);
        ctx!.lineTo(x + barW, baseY);
        ctx!.stroke();

        // Percentage label above bar
        const labelY = baseY - animH - 8;
        ctx!.fillStyle = src.color;
        ctx!.font = `bold ${Math.max(11, dims.w * 0.018)}px monospace`;
        ctx!.textAlign = "center";
        if (t > 0.3) {
          ctx!.fillText(`${src.terrorPct.toFixed(2)}%`, x + barW / 2, labelY);
        }

        // Source label below
        ctx!.fillStyle = "rgba(255,255,255,0.6)";
        ctx!.font = `${Math.max(9, dims.w * 0.014)}px monospace`;
        ctx!.textAlign = "center";
        ctx!.fillText(src.label, x + barW / 2, baseY + 18);

        // Count label
        ctx!.fillStyle = "rgba(255,255,255,0.35)";
        ctx!.font = `${Math.max(8, dims.w * 0.011)}px monospace`;
        ctx!.fillText(`${src.terrorCount} msgs`, x + barW / 2, baseY + 30);
      });

      // 56x annotation arrow between bar 0 and bar 2
      if (t > 0.7) {
        const x0 = 20 + barGap + barW / 2;
        const x2 = 20 + barGap * 3 + barW * 2 + barW / 2;
        const arrowY = baseY - (SOURCES[2].terrorPct / MAX_PCT) * maxBarH * ease - 24;
        ctx!.strokeStyle = "rgba(255,77,94,0.5)";
        ctx!.lineWidth = 1;
        ctx!.setLineDash([3, 3]);
        ctx!.beginPath();
        ctx!.moveTo(x0, arrowY);
        ctx!.lineTo(x2, arrowY);
        ctx!.stroke();
        ctx!.setLineDash([]);

        const midX = (x0 + x2) / 2;
        ctx!.fillStyle = "#ff4d5e";
        ctx!.font = `bold ${Math.max(10, dims.w * 0.016)}px monospace`;
        ctx!.textAlign = "center";
        ctx!.fillText("56×", midX, arrowY - 6);
      }

      if (t < 1) rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dims, hovered]);

  function getHoverIndex(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const barW = Math.min(120, (dims.w - 80) / SOURCES.length - 20);
    const barGap = (dims.w - 40 - SOURCES.length * barW) / (SOURCES.length + 1);
    for (let i = 0; i < SOURCES.length; i++) {
      const x = 20 + barGap + i * (barW + barGap);
      if (mx >= x && mx <= x + barW) return i;
    }
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <TracedCard traceColor="var(--threat)" className="p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[9px] tracking-[0.4em] text-threat mb-1">
              // EX-MW-02 — LOADED LANGUAGE FORENSICS
            </p>
            <p className="font-mono text-sm md:text-base font-bold text-foreground">
              TERROR DENSITY — % OF UNIQUE MESSAGES USING "TERROR/TERRORIST"
            </p>
          </div>
          <div className="font-mono text-[8px] tracking-[0.15em] text-muted-2 text-right">
            <span className="text-threat font-bold">DEDUPLICATED</span>
            <br />
            UNIQUE MSGS ONLY
          </div>
        </div>

        <div ref={containerRef} className="w-full">
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: dims.h }}
            onMouseMove={(e) => setHovered(getHoverIndex(e))}
            onMouseLeave={() => setHovered(null)}
            className="cursor-crosshair"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {SOURCES.map((src) => (
            <div key={src.key} className="border border-borderc p-2 rounded">
              <p className="font-mono text-[10px] tracking-[0.2em]" style={{ color: src.color }}>
                {src.label.toUpperCase()}
              </p>
              <p className="font-mono text-lg font-bold mt-1" style={{ color: src.color }}>
                {src.terrorPct.toFixed(2)}%
              </p>
              <p className="font-mono text-[8px] text-muted-2 mt-0.5">
                {src.terrorCount.toLocaleString()} / {src.totalUnique.toLocaleString()} msgs
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 font-mono text-[9px] tracking-[0.15em] text-muted-2 leading-relaxed">
          METHODOLOGY: COUNT(DISTINCT CASE WHEN text ILIKE &apos;%terror%&apos; THEN text END) / COUNT(DISTINCT text).
          Deduplication removes Telegram forwards. Channel 14 uses "terror" in{" "}
          <span className="text-threat font-bold">1 of every 5.5 unique messages</span> — 56× Al-Manar&apos;s rate.
          This is not editorial framing. It is systematic psychological conditioning.
        </p>
      </TracedCard>
    </motion.div>
  );
}
