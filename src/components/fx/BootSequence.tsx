"use client";
import { useEffect, useState, useRef } from "react";
import { AsciiEye } from "@/components/fx/AsciiEye";

const BOOT_LINES = [
  { text: "ZIOPSYOP v2.4.1 — SIGNAL INTELLIGENCE PLATFORM", delay: 0, color: "primary" },
  { text: "initializing forensic analysis engine...", delay: 250, color: "muted" },
  { text: "loading evidence database [elzmcmpinigpthnklhgj]...", delay: 500, color: "muted" },
  { text: "mounting user archive corpus: 22 subjects, 102,610 artifacts", delay: 850, color: "muted" },
  { text: "running behavioral fingerprint analysis... [OK]", delay: 1200, color: "primary" },
  { text: "temporal coordination engine: ACTIVE", delay: 1500, color: "primary" },
  { text: "network graph: 261 edges mapped", delay: 1800, color: "primary" },
  { text: "cross-subreddit activity: indexed", delay: 2050, color: "archive" },
  { text: "language detection: 3 scripts (EN/HE/AR)", delay: 2300, color: "archive" },
  { text: "sentiment analysis: calibrated", delay: 2550, color: "archive" },
  { text: "WARNING: coordinated inauthentic behavior detected", delay: 2900, color: "threat" },
  { text: "WARNING: 14/22 accounts >70% conflict-sub concentration", delay: 3200, color: "threat" },
  { text: "WARNING: 7-user simultaneous activation events recorded", delay: 3500, color: "threat" },
  { text: "classification: INFLUENCE OPERATION — HIGH CONFIDENCE", delay: 3850, color: "threat" },
  { text: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ READY", delay: 4200, color: "primary" },
];

const COLOR_MAP: Record<string, string> = {
  primary: "text-primary",
  muted: "text-muted",
  archive: "text-archive",
  threat: "text-threat",
};

const HEX = "0123456789ABCDEF";
function randHex(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += HEX[(Math.random() * 16) | 0];
  return s;
}

function HexRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cols = Math.floor(canvas.width / 14);
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * -40);

    const draw = () => {
      ctx.fillStyle = "rgba(6,6,8,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "11px 'JetBrains Mono', monospace";
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * 14;
        const alpha = Math.random() > 0.5 ? 0.5 : 0.15;
        ctx.fillStyle = `rgba(182,255,124,${alpha})`;
        ctx.fillText(HEX[(Math.random() * 16) | 0], i * 14, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.4;
      }
    };

    let raf = 0;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
      aria-hidden="true"
    />
  );
}


interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [hexAddr, setHexAddr] = useState("0x00000000");
  const completedRef = useRef(false);

  // rolling hex address counter
  useEffect(() => {
    const iv = setInterval(() => {
      setHexAddr("0x" + randHex(8));
    }, 80);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, i]);
          setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        }, line.delay + 300)
      );
    });

    timers.push(
      setTimeout(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        setDone(true);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 600);
        }, 1500);
      }, 5000)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (fadeOut && done) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background"
        style={{ opacity: 0, transition: "opacity 0.5s ease" }} />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease" }}
    >
      {/* hex rain background */}
      <HexRain />

      {/* scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)"
      }} />

      {/* corner brackets */}
      {[
        "top-4 left-4 border-t border-l",
        "top-4 right-4 border-t border-r",
        "bottom-4 left-4 border-b border-l",
        "bottom-4 right-4 border-b border-r",
      ].map((cls) => (
        <div key={cls} className={`absolute w-8 h-8 border-primary/40 ${cls}`} aria-hidden="true" />
      ))}

      <div className="relative w-full max-w-3xl">
        {/* header bar */}
        <div className="mb-4 border border-primary/30 px-4 py-2.5 bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-[10px] tracking-[0.4em] uppercase">
              ZIOPSYOP — FORENSIC INTELLIGENCE SYSTEM
            </span>
          </div>
          <span className="text-muted-2 text-[9px] font-mono">{hexAddr}</span>
        </div>

        {/* two-column: terminal + radar */}
        <div className="flex gap-6 items-start">
          {/* terminal output */}
          <div className="flex-1 min-w-0 space-y-0.5 min-h-[280px]">
            {BOOT_LINES.map((line, i) => (
              <div
                key={i}
                className={`text-[11px] leading-5 tracking-wide transition-all duration-100 ${
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

          {/* eye sigil */}
          <div className="hidden md:flex md:flex-col md:items-center shrink-0">
            <div style={{ transform: "scale(1.8)", transformOrigin: "center center" }}>
              <AsciiEye />
            </div>
            <div className="mt-6 text-center font-mono text-[8px] text-muted-2 tracking-[0.3em]">
              WATCHING
            </div>
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-[10px] text-muted-2 mb-1">
            <span>SYSTEM LOAD</span>
            <span>{progress}%</span>
          </div>
          <div className="h-px bg-surface-2 w-full relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-150"
              style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(182,255,124,0.6)" }}
            />
          </div>
        </div>

        {done && (
          <div className="mt-3 text-center text-[11px] text-primary tracking-[0.3em] animate-pulse">
            PRESS ANY KEY TO ENTER — OR WAIT
          </div>
        )}
      </div>
    </div>
  );
}
