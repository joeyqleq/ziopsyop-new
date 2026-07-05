"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PixelRevealProps {
  children: React.ReactNode;
  className?: string;
  /** pixel block size in px */
  blockSize?: number;
  /** total depixelation duration (ms) */
  duration?: number;
  color?: string;
}

/**
 * Depixelation reveal: content is covered by a grid of solid pixel
 * blocks that dissolve in randomized order when scrolled into view —
 * like a censored image being declassified.
 */
export function PixelReveal({
  children,
  className,
  blockSize = 22,
  duration = 900,
  color = "var(--surface-2)",
}: PixelRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<{ cols: number; rows: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const cols = Math.max(1, Math.ceil(rect.width / blockSize));
      const rows = Math.max(1, Math.ceil(rect.height / blockSize));
      const total = cols * rows;
      // shuffled dissolve order
      const o = Array.from({ length: total }, (_, i) => i);
      for (let i = total - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [o[i], o[j]] = [o[j], o[i]];
      }
      setGrid({ cols, rows });
      setOrder(o);
    };
    measure();

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [blockSize]);

  const total = grid ? grid.cols * grid.rows : 0;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
      {grid && !prefersReduced() && (
        <div
          className="absolute inset-0 grid pointer-events-none z-10"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              style={{
                background: color,
                opacity: revealed ? 0 : 1,
                transition: `opacity 120ms steps(2) ${
                  revealed ? (order[i] / total) * duration : 0
                }ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function prefersReduced() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
