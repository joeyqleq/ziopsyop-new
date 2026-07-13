"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#@$%&";

interface DecryptTextProps {
  text: string;
  className?: string;
  /** ms between frame updates — higher = smoother/cheaper */
  speed?: number;
  /** scramble passes per character before it locks */
  scrambleCycles?: number;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  startOnView?: boolean;
  /** If true, only trigger animation once (default true) */
  triggerOnce?: boolean;
}

export function DecryptText({
  text,
  className,
  speed = 45,
  scrambleCycles = 2,
  delay = 0,
  as: Tag = "span",
  startOnView = true,
  triggerOnce = true,
}: DecryptTextProps) {
  // Speed floor: prevent runaway slowness
  const effectiveSpeed = speed < 20 ? 20 : speed;
  // Only one bit of React state: are we done? Everything else is DOM mutation.
  const [done, setDone] = useState(false);
  const innerRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLElement>(null);
  const started = useRef(false);
  const frameRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const run = () => {
      if (started.current) return;
      started.current = true;

      // Deterministic cycle offsets — no Math.random() on init prevents hydration mismatch
      const chars = text.split("");
      const cycles = chars.map((_, i) =>
        scrambleCycles + Math.floor(((i * 9301 + 49297) % 233280) / 233280 * 3)
      );
      let tick = 0;
      let lastTime = 0;

      const step = (timestamp: number) => {
        if (timestamp - lastTime < effectiveSpeed) {
          frameRef.current = requestAnimationFrame(step);
          return;
        }
        lastTime = timestamp;
        tick++;

        let next = "";
        let resolved = true;
        for (let i = 0; i < chars.length; i++) {
          const ch = chars[i];
          if (ch === " " || ch === "\n") { next += ch; continue; }
          if (tick >= i * 2 + cycles[i]) {
            next += ch;
          } else {
            resolved = false;
            next += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
        }

        // Direct DOM write — no React reconciler involved
        if (innerRef.current) innerRef.current.textContent = next;

        if (resolved) {
          setDone(true);
          return;
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
    } else if (wrapRef.current) {
      const io = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) { run(); if (triggerOnce) io.disconnect(); } },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(wrapRef.current);
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
  }, [text, effectiveSpeed, scrambleCycles, delay, startOnView, triggerOnce]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={wrapRef as any}
      className={cn(className)}
      data-decrypted={done}
      aria-label={text}
    >
      <span aria-hidden="true" ref={innerRef}>{text}</span>
    </Tag>
  );
}
