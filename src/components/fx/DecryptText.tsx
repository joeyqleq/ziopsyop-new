"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandedText } from "@/components/BrandedText";

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
  /** Apply the ZIOPSYOP display treatment after decryption. */
  brandUppercaseO?: boolean;
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
  brandUppercaseO = false,
}: DecryptTextProps) {
  // Speed floor: prevent runaway slowness
  const effectiveSpeed = speed < 20 ? 20 : speed;
  const isDisplayHeading = Tag === "h1" || Tag === "h2" || Tag === "h3";
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

      // Resolve in a fixed number of frames so long titles do not take seconds.
      const chars = text.split("");
      const maxTicks = Math.max(6, Math.min(14, scrambleCycles * 4 + 6));
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
        const progress = Math.min(1, tick / maxTicks);
        const resolvedCount = Math.ceil(progress * chars.length);
        for (let i = 0; i < chars.length; i++) {
          const ch = chars[i];
          if (ch === " " || ch === "\n") { next += ch; continue; }
          if (i < resolvedCount || progress === 1) {
            next += ch;
          } else {
            next += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
        }

        // Direct DOM write — no React reconciler involved
        if (innerRef.current) innerRef.current.textContent = next;

        if (progress === 1) {
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
        { threshold: 0.01, rootMargin: "120px 0px" }
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
      {done && (isDisplayHeading || brandUppercaseO) ? (
        <BrandedText text={text} />
      ) : (
        <span aria-hidden="true" ref={innerRef}>{text}</span>
      )}
    </Tag>
  );
}
