"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#@$%&";

interface DecryptTextProps {
  text: string;
  className?: string;
  speed?: number;
  scrambleCycles?: number;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  startOnView?: boolean;
}

export function DecryptText({
  text,
  className,
  speed = 28,
  scrambleCycles = 3,
  delay = 0,
  as: Tag = "span",
  startOnView = false,
}: DecryptTextProps) {
  const [output, setOutput] = useState<string>(text);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);
  const frameRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const run = () => {
      if (started.current) return;
      started.current = true;

      const cycles = text
        .split("")
        .map(() => scrambleCycles + Math.floor(Math.random() * 5));
      let tick = 0;
      let lastTime = 0;

      const step = (timestamp: number) => {
        if (timestamp - lastTime >= speed) {
          lastTime = timestamp;
          tick++;
          let resolved = true;
          const next = text
            .split("")
            .map((ch, i) => {
              if (ch === " " || ch === "\n") return ch;
              if (tick >= i * 2 + cycles[i]) return ch;
              resolved = false;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join("");
          setOutput(next);
          if (resolved) {
            setDone(true);
            return;
          }
        }
        frameRef.current = requestAnimationFrame(step);
      };

      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          frameRef.current = requestAnimationFrame(step);
        }, delay);
      } else {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    if (!startOnView) {
      run();
    } else if (ref.current) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            run();
            io.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      io.observe(ref.current);
      return () => {
        io.disconnect();
        cancelAnimationFrame(frameRef.current);
        clearTimeout(timeoutRef.current);
      };
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(className)}
      data-decrypted={done}
      aria-label={text}
    >
      <span aria-hidden="true">{output}</span>
    </Tag>
  );
}
