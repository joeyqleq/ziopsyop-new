"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "01<>/\\|+=*#%@[]{}·:";

function hashCell(x: number, y: number, salt: number) {
  let value = Math.imul(x + 17, 374761393) ^ Math.imul(y + 31, 668265263) ^ salt;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
}

export function AsciiSignalField({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-jet").trim() ||
      '"JetBrains Mono"';
    let width = 0;
    let height = 0;
    let raf = 0;
    let lastFrame = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pointerRef.current.active) {
        pointerRef.current = { x: width * 0.58, y: height * 0.46, active: false };
      }
    };

    const draw = (time: number) => {
      const phase = reduced ? 0 : Math.floor(time / 110);
      const fontSize = width < 640 ? 9 : 11;
      const cellX = width < 640 ? 9 : 11;
      const cellY = width < 640 ? 12 : 14;
      const pointer = pointerRef.current;
      const px = reduced ? width * 0.58 : pointer.x;
      const py = reduced ? height * 0.46 : pointer.y;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px ${fontFamily}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let y = cellY / 2, row = 0; y < height; y += cellY, row++) {
        for (let x = cellX / 2, col = 0; x < width; x += cellX, col++) {
          const dx = x - px;
          const dy = y - py;
          const distance = Math.hypot(dx, dy);
          const seed = hashCell(col, row, phase);
          const angle = Math.atan2(dy, dx);
          const ring = Math.abs((distance % 46) - 23) < 1.8;
          const trace = Math.abs(Math.sin(angle * 3 + distance * 0.025)) < 0.075;
          const revealed = distance < 210 && (ring || trace || seed % 7 === 0);
          const ambient = seed % 17 === 0;
          if (!revealed && !ambient) continue;

          const glyph = revealed
            ? GLYPHS[(seed + phase) % GLYPHS.length]
            : "·";
          const falloff = Math.max(0, 1 - distance / 260);
          ctx.globalAlpha = revealed ? 0.22 + falloff * 0.68 : 0.13;
          ctx.fillStyle = ring ? "#e8b44c" : trace ? "#b6ff7c" : "#8a8f98";
          ctx.fillText(glyph, x, y);
        }
      }

      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#e8b44c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 24 + (reduced ? 0 : Math.sin(time / 420) * 3), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const loop = (time: number) => {
      if (time - lastFrame > 70) {
        draw(time);
        lastFrame = time;
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    observer.observe(host);
    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          active: true,
        };
      }}
      onPointerLeave={() => {
        const rect = hostRef.current?.getBoundingClientRect();
        if (rect) pointerRef.current = { x: rect.width * 0.58, y: rect.height * 0.46, active: false };
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
