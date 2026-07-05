"use client";
import { useEffect, useRef } from "react";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=|<>?~.,;:";

const CW = 9;
const CH = 15;

interface LetterGlitchProps {
  glitchSpeed?: number;
  speed?: number;
  colors?: string[];
  centerVignette?: boolean;
  outerVignette?: boolean;
  eyeCenterYFrac?: number;
  eyeRadiusX?: number;
  eyeRadiusY?: number;
  tearCount?: number;
  style?: React.CSSProperties;
}

interface Cell {
  char: string;
  colorIdx: number;
  excluded: boolean;
}

export function LetterGlitch({
  glitchSpeed = 50,
  speed = 25,
  colors = ["#360094", "#61dca3", "#EAB308"],
  centerVignette = true,
  outerVignette = true,
  eyeCenterYFrac = 0.34,
  eyeRadiusX = 0,
  eyeRadiusY = 0,
  tearCount = 20,
  style,
}: LetterGlitchProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cells: Cell[] = [];
    let cols = 0;
    let rows = 0;
    let W = 0;
    let H = 0;
    let rafId = 0;
    let lastUpdate = 0;

    function pickChar(): string {
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    function init() {
      const rect = wrap!.getBoundingClientRect();
      W = Math.floor(rect.width);
      H = Math.floor(rect.height);
      if (W < 1 || H < 1) return;

      canvas!.width = W;
      canvas!.height = H;

      cols = Math.floor(W / CW);
      rows = Math.floor(H / CH);

      const ecx = W / 2;
      const ecy = H * eyeCenterYFrac;

      // Generate tear rectangles (in cell coordinates)
      const tears: { col: number; row: number; w: number; h: number }[] = [];
      for (let t = 0; t < tearCount; t++) {
        const tw = 2 + Math.floor(Math.random() * 8); // 2-9 cells wide
        const th = 1 + Math.floor(Math.random() * 3); // 1-3 cells tall
        const tc = Math.floor(Math.random() * (cols - tw));
        const tr = Math.floor(Math.random() * (rows - th));

        // Check if tear overlaps eye zone (1.3x exclusion)
        const tearCX = (tc + tw / 2) * CW;
        const tearCY = (tr + th / 2) * CH;
        const exR = eyeRadiusX * 1.3;
        const eyR = eyeRadiusY * 1.3;
        if (
          eyeRadiusX > 0 &&
          ((tearCX - ecx) / exR) ** 2 + ((tearCY - ecy) / eyR) ** 2 < 1
        ) {
          continue; // skip tears overlapping eye
        }
        tears.push({ col: tc, row: tr, w: tw, h: th });
      }

      cells = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * CW + CW / 2;
          const cy = row * CH + CH / 2;

          let excluded = false;

          // Eye exclusion
          if (eyeRadiusX > 0) {
            const eyeSDF =
              ((cx - ecx) / eyeRadiusX) ** 2 +
              ((cy - ecy) / eyeRadiusY) ** 2;
            if (eyeSDF < 1) {
              excluded = true;
            }
          }

          // Tear exclusion
          if (!excluded) {
            for (const tear of tears) {
              if (
                col >= tear.col &&
                col < tear.col + tear.w &&
                row >= tear.row &&
                row < tear.row + tear.h
              ) {
                excluded = true;
                break;
              }
            }
          }

          cells.push({
            char: excluded ? " " : pickChar(),
            colorIdx: Math.floor(Math.random() * colorsRef.current.length),
            excluded,
          });
        }
      }
    }

    function draw() {
      if (!ctx || cols === 0 || rows === 0) return;

      ctx.clearRect(0, 0, W, H);
      ctx.font = `${CH - 2}px 'JetBrains Mono','Courier New',monospace`;
      ctx.textBaseline = "top";

      const ecx = W / 2;
      const ecy = H * eyeCenterYFrac;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const cell = cells[idx];
          if (cell.excluded) continue;

          const px = c * CW;
          const py = r * CH;
          const cx = px + CW / 2;
          const cy = py + CH / 2;

          let alpha = 0.85;

          // Outer vignette
          if (outerVignette) {
            const edgeDist = Math.min(
              cx / W,
              (W - cx) / W,
              cy / H,
              (H - cy) / H
            );
            alpha *= Math.min(1, edgeDist * 7);
          }

          // Center vignette
          if (centerVignette) {
            // Fade below 55% height
            if (cy / H > 0.55) {
              alpha *= Math.max(0, 1 - ((cy / H - 0.55) / 0.45) * 1.4);
            }
            // Radial fade near text center
            const d = Math.sqrt(
              ((cx - W / 2) / (W * 0.42)) ** 2 +
                ((cy - H * 0.78) / (H * 0.28)) ** 2
            );
            if (d < 1.2) {
              alpha *= Math.max(0, Math.min(1, (d - 0.0) / 0.6));
            }
          }

          // Eye fade (smooth transition into exclusion)
          if (eyeRadiusX > 0) {
            const eyeSDF =
              ((cx - ecx) / eyeRadiusX) ** 2 +
              ((cy - ecy) / eyeRadiusY) ** 2;
            if (eyeSDF < 1.4) {
              alpha *= Math.max(0, Math.min(1, (eyeSDF - 0.92) * 10));
            }
          }

          if (alpha < 0.02) continue;

          ctx.globalAlpha = alpha;
          ctx.fillStyle = colorsRef.current[cell.colorIdx];
          ctx.fillText(cell.char, px, py);
        }
      }
      ctx.globalAlpha = 1;
    }

    function frame(ts: number) {
      if (ts - lastUpdate >= glitchSpeed) {
        lastUpdate = ts;

        // Update random non-excluded cells
        const nonExcluded: number[] = [];
        for (let i = 0; i < cells.length; i++) {
          if (!cells[i].excluded) nonExcluded.push(i);
        }
        const count = Math.min(speed, nonExcluded.length);
        for (let n = 0; n < count; n++) {
          const ri = nonExcluded[Math.floor(Math.random() * nonExcluded.length)];
          cells[ri].char = pickChar();
          if (Math.random() < 0.2) {
            cells[ri].colorIdx = Math.floor(
              Math.random() * colorsRef.current.length
            );
          }
        }
      }

      draw();
      rafId = requestAnimationFrame(frame);
    }

    init();
    rafId = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      init();
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [
    glitchSpeed,
    speed,
    centerVignette,
    outerVignette,
    eyeCenterYFrac,
    eyeRadiusX,
    eyeRadiusY,
    tearCount,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      <div ref={wrapRef} style={{ position: "absolute", inset: 0 }}>
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0, display: "block" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
