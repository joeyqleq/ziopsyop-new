"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TracedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** color the border trace + corner brackets light up with */
  traceColor?: string;
  /** render the dossier corner brackets */
  brackets?: boolean;
  children: React.ReactNode;
}

/**
 * Card whose 1px border ignites around the cursor and whose corner
 * brackets extend on hover — the border literally follows the mouse
 * along the edges via a masked radial gradient tracking --mx/--my.
 */
export function TracedCard({
  traceColor,
  brackets = true,
  className,
  children,
  ...rest
}: TracedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn("traced-card bracket-corners", className)}
      style={
        traceColor
          ? ({ "--trace-color": traceColor } as React.CSSProperties)
          : undefined
      }
      {...rest}
    >
      {brackets && (
        <>
          <span className="bc bc-tl" />
          <span className="bc bc-tr" />
          <span className="bc bc-bl" />
          <span className="bc bc-br" />
        </>
      )}
      {children}
    </div>
  );
}
