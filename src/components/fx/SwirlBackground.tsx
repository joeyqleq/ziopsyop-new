"use client";

import { useEffect, useRef } from "react";

/**
 * Swirl — rotating concentric dot-grid shader.
 * Colors locked to ZIOPSYOP brand: lime (#b6ff7c) + violet (#7b39d0).
 * Dots orbit from outer edges inward, clearing a circular void at center.
 * Inspired by designali-in/swirl from 21st.dev.
 */
interface SwirlProps {
  /** px radius of the protected center void around eye */
  clearRadius?: number;
  /** fraction of canvas height below which dots fade out (protects text area) */
  textProtectYFrac?: number;
  /** 0..1 master opacity */
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SwirlBackground({
  clearRadius = 220,
  textProtectYFrac = 0.62,
  opacity = 1,
  className = "",
  style,
}: SwirlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Brand palette
    const LIME   = [182, 255, 124] as const; // #b6ff7c — iris/sclera
    const VIOLET = [123,  57, 208] as const; // #7b39d0 — pupil/iris deep

    let W = 0, H = 0, cx = 0, cy = 0, textY = 0;
    let animAngle = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H * 0.34; // align with eye center in footer
      textY = H * textProtectYFrac;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // Dot grid config
    const SPACING = 22;       // grid cell size px
    const DOT_R   = 2.4;      // base dot radius
    const RINGS   = 9;        // concentric ring count for swirl curve

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, W, H);
      animAngle = ts * 0.00022; // slow rotation

      // How many columns / rows we need to cover the canvas
      const cols = Math.ceil(W / SPACING) + 2;
      const rows = Math.ceil(H / SPACING) + 2;
      const offX = -(cols * SPACING - W) / 2;
      const offY = -(rows * SPACING - H) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offX + c * SPACING;
          const y = offY + r * SPACING;

          // Distance from eye center
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.hypot(dx, dy);

          // Skip the clear radius around the eye
          if (dist < clearRadius) continue;

          // Swirl angle offset based on distance ring
          const ringN = (dist / (Math.min(W, H) * 0.5)) * RINGS;
          const swirl = Math.sin(ringN * 0.8 + animAngle * 3.5) * 0.7
                      + Math.cos(ringN * 0.5 - animAngle * 2.2) * 0.3;

          // Base angle from center + swirl warp
          const theta = Math.atan2(dy, dx) + swirl + animAngle;

          // Color lerp: violet toward center, lime toward edges
          const t = Math.min(1, (dist - clearRadius) / (Math.min(W, H) * 0.4));
          const pulse = 0.55 + 0.45 * Math.sin(theta * 3 + animAngle * 4 + dist * 0.018);

          const rC = Math.round(VIOLET[0] + (LIME[0] - VIOLET[0]) * t);
          const gC = Math.round(VIOLET[1] + (LIME[1] - VIOLET[1]) * t);
          const bC = Math.round(VIOLET[2] + (LIME[2] - VIOLET[2]) * t);

          // Fade dots at canvas edges
          const edgeFade = Math.min(
            Math.min(x / (SPACING * 3), (W - x) / (SPACING * 3)),
            Math.min(y / (SPACING * 3), (H - y) / (SPACING * 3)),
            1
          );

          // Fade soft at inner clear radius edge
          const innerFade = Math.min(1, (dist - clearRadius) / (SPACING * 2.5));

          // Fade out below text protect line (soft gradient)
          const textFade = textY > 0 ? Math.max(0, Math.min(1, (textY - y) / (SPACING * 4))) : 1;

          const alpha = Math.min(1, pulse * edgeFade * innerFade * textFade * 0.72) * opacity;
          if (alpha < 0.02) continue;

          // Dot size pulses slightly with swirl
          const dotR = DOT_R * (0.7 + 0.45 * Math.abs(Math.sin(theta + animAngle * 2)));

          ctx.beginPath();
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rC},${gC},${bC},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [clearRadius, textProtectYFrac, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ ...style, display: "block" }}
    />
  );
}
