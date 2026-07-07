"use client";
import { useEffect, useState, useRef } from "react";

const BOOT_LINES = [
  { text: "ZIOPSYOP v2.4.1 — SIGNAL INTELLIGENCE PLATFORM", delay: 0, color: "primary" },
  { text: "initializing forensic analysis engine...", delay: 120, color: "muted" },
  { text: "loading evidence database [elzmcmpinigpthnklhgj]...", delay: 240, color: "muted" },
  { text: "mounting user archive corpus: 22 subjects, 220k+ artifacts", delay: 400, color: "muted" },
  { text: "running behavioral fingerprint analysis... [OK]", delay: 560, color: "primary" },
  { text: "temporal coordination engine: ACTIVE", delay: 680, color: "primary" },
  { text: "network graph: 261 edges mapped", delay: 800, color: "primary" },
  { text: "cross-subreddit activity: indexed", delay: 900, color: "archive" },
  { text: "language detection: 3 scripts detected (EN/HE/AR)", delay: 1000, color: "archive" },
  { text: "sentiment analysis: calibrated", delay: 1100, color: "archive" },
  { text: "WARNING: coordinated inauthentic behavior detected", delay: 1250, color: "threat" },
  { text: "WARNING: 14/22 accounts >70% conflict-sub concentration", delay: 1350, color: "threat" },
  { text: "WARNING: 7-user simultaneous activation events recorded", delay: 1460, color: "threat" },
  { text: "classification: INFLUENCE OPERATION — HIGH CONFIDENCE", delay: 1600, color: "threat" },
  { text: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ READY", delay: 1780, color: "primary" },
];

const COLOR_MAP: Record<string, string> = {
  primary: "text-primary",
  muted: "text-muted",
  archive: "text-archive",
  threat: "text-threat",
};

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, i]);
          setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        }, line.delay + 400)
      );
    });

    // complete
    timers.push(
      setTimeout(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        setDone(true);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 600);
        }, 400);
      }, 2600)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (fadeOut && done) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: 0 }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-8"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* scanline overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)"
      }} />

      <div className="relative w-full max-w-2xl font-mono">
        {/* header */}
        <div className="mb-6 border border-primary/30 p-4 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs tracking-[0.4em] uppercase">
              ZIOPSYOP — FORENSIC INTELLIGENCE SYSTEM
            </span>
          </div>
          <div className="mt-2 text-[10px] text-muted tracking-[0.2em]">
            CLASSIFICATION: RESTRICTED — OSINT/BEHAVIORAL ANALYSIS
          </div>
        </div>

        {/* terminal output */}
        <div className="space-y-0.5 min-h-[320px]">
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              className={`text-[11px] leading-5 tracking-wide transition-all duration-150 ${
                visibleLines.includes(i) ? "opacity-100" : "opacity-0"
              } ${COLOR_MAP[line.color] ?? "text-muted"}`}
            >
              <span className="text-muted-2 mr-2 select-none">{">"}</span>
              {line.text}
              {i === visibleLines[visibleLines.length - 1] && !done && (
                <span className="ml-0.5 animate-pulse">█</span>
              )}
            </div>
          ))}
        </div>

        {/* progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-[10px] text-muted-2 mb-1.5">
            <span>SYSTEM LOAD</span>
            <span>{progress}%</span>
          </div>
          <div className="h-px bg-surface-2 w-full relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(182,255,124,0.6)" }}
            />
          </div>
        </div>

        {done && (
          <div className="mt-4 text-center text-xs text-primary tracking-[0.3em] animate-pulse">
            PRESS ANY KEY TO ENTER — OR WAIT
          </div>
        )}
      </div>
    </div>
  );
}
