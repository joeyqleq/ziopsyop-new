"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#@$%&";

interface DecryptTextProps {
  text: string;
  className?: string;
  /** ms between resolve steps */
  speed?: number;
  /** how many scramble frames each letter cycles before locking */
  scrambleCycles?: number;
  /** delay before the animation starts (ms) */
  delay?: number;
  /** re-run when text changes */
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  /** start only when scrolled into view */
  startOnView?: boolean;
}

/**
 * Cinematic per-letter decryption. Each letter resolves independently:
 * letters lock left-to-right but each cycles through random glyphs a
 * slightly different number of times, so no two letters behave identically.
 */
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

  useEffect(() => {
    let frame: ReturnType<typeof setInterval>;
    let timeout: ReturnType<typeof setTimeout>;

    const run = () => {
      if (started.current) return;
      started.current = true;

      // per-letter randomized cycle counts → cinematic non-uniform resolve
      const cycles = text
        .split("")
        .map(() => scrambleCycles + Math.floor(Math.random() * 5));
      let tick = 0;

      timeout = setTimeout(() => {
        frame = setInterval(() => {
          tick++;
          let resolved = true;
          const next = text
            .split("")
            .map((ch, i) => {
              if (ch === " " || ch === "\n") return ch;
              const lockAt = i * 2 + cycles[i];
              if (tick >= lockAt) return ch;
              resolved = false;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join("");
          setOutput(next);
          if (resolved) {
            clearInterval(frame);
            setDone(true);
          }
        }, speed);
      }, delay);
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
        clearInterval(frame);
        clearTimeout(timeout);
      };
    }

    return () => {
      clearInterval(frame);
      clearTimeout(timeout);
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
