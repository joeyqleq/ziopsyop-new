"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

// ─── public interface ─────────────────────────────────────────────────────────
export interface DeadReckoningData {
  officialKIA: number;    // 844
  bereavedFamilies: number; // 5942
  hiddenRatio: number;    // 7.05
  source: string;
}

// ─── colour tokens ────────────────────────────────────────────────────────────
const THREAT = "#ff4d5e";
const AMBER  = "#eab308";
const MINT   = "#3ee6c1";

// ─── constants ────────────────────────────────────────────────────────────────
const CANVAS_H  = 320;   // logical height in px
const REVEAL_MS = 2000;  // ms over which admitted particles light up
const R         = 1.5;   // particle radius (logical px)
const PADDING   = 6;     // canvas edge padding
const MAX_SPD   = 0.4;   // max velocity component
const BROWNIAN  = 0.03;  // random velocity nudge per frame

// ─── animated counter ─────────────────────────────────────────────────────────
function AnimCounter({
  to,
  duration = 1.8,
  delay = 0,
  className = "",
  style,
}: {
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(mv, to, { duration, delay, ease: "easeOut" });
    return ctrl.stop;
  }, [inView, to, duration, delay, mv]);

  return (
    <span ref={ref} className={className} style={style}>
      <motion.span>{display}</motion.span>
    </span>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export function DeadReckoning({ data }: { data: DeadReckoningData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);

  // Mutable simulation state in a single ref — avoids stale-closure issues
  const sim = useRef({
    phase:       "idle" as "idle" | "running",
    revealStart: 0,
    revealCount: 0,
    logW:        0,
  });

  // Typed arrays for particle data — allocated once on first reveal
  const px   = useRef<Float32Array | null>(null);
  const py   = useRef<Float32Array | null>(null);
  const pvx  = useRef<Float32Array | null>(null);
  const pvy  = useRef<Float32Array | null>(null);
  const plit = useRef<Uint8Array  | null>(null);

  const N   = data.bereavedFamilies; // 5942
  const ADM = data.officialKIA;      // 844

  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // ── size canvas at logical + physical resolution ────────────────────────
    function sizeCanvas(logW: number) {
      const dpr = window.devicePixelRatio || 1;
      sim.current.logW = logW;
      canvas!.width        = Math.round(logW     * dpr);
      canvas!.height       = Math.round(CANVAS_H * dpr);
      canvas!.style.width  = `${logW}px`;
      canvas!.style.height = `${CANVAS_H}px`;
    }

    // ── scatter N particles uniformly inside canvas ─────────────────────────
    function initParticles() {
      const W = sim.current.logW || wrap!.getBoundingClientRect().width;
      const H = CANVAS_H;
      px.current   = new Float32Array(N);
      py.current   = new Float32Array(N);
      pvx.current  = new Float32Array(N);
      pvy.current  = new Float32Array(N);
      plit.current = new Uint8Array(N);   // all 0 = ghost
      for (let i = 0; i < N; i++) {
        px.current[i]  = PADDING + Math.random() * (W - PADDING * 2);
        py.current[i]  = PADDING + Math.random() * (H - PADDING * 2);
        const ang      = Math.random() * Math.PI * 2;
        const spd      = 0.06 + Math.random() * 0.14;
        pvx.current[i] = Math.cos(ang) * spd;
        pvy.current[i] = Math.sin(ang) * spd;
      }
    }

    // ── per-frame update + render ───────────────────────────────────────────
    function draw(ts: number) {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const W   = sim.current.logW;
      const H   = CANVAS_H;
      const xs  = px.current!;
      const ys  = py.current!;
      const vxs = pvx.current!;
      const vys = pvy.current!;
      const ls  = plit.current!;
      const s   = sim.current;

      // ── advance reveal animation ────────────────────────────────────────
      if (s.phase === "running") {
        const elapsed = ts - s.revealStart;
        const target  = Math.min(ADM, Math.floor((elapsed / REVEAL_MS) * ADM));
        while (s.revealCount < target) {
          ls[s.revealCount++] = 1;
        }
      }

      // ── Brownian motion + bounds ────────────────────────────────────────
      for (let i = 0; i < N; i++) {
        vxs[i] += (Math.random() - 0.5) * BROWNIAN;
        vys[i] += (Math.random() - 0.5) * BROWNIAN;

        // clamp speed
        const spd = Math.hypot(vxs[i], vys[i]);
        if (spd > MAX_SPD) {
          const inv = MAX_SPD / spd;
          vxs[i] *= inv;
          vys[i] *= inv;
        }

        xs[i] += vxs[i];
        ys[i] += vys[i];

        // soft bounce
        if (xs[i] < PADDING)       { xs[i] = PADDING;       vxs[i] =  Math.abs(vxs[i]) * 0.85; }
        else if (xs[i] > W - PADDING) { xs[i] = W - PADDING; vxs[i] = -Math.abs(vxs[i]) * 0.85; }
        if (ys[i] < PADDING)       { ys[i] = PADDING;       vys[i] =  Math.abs(vys[i]) * 0.85; }
        else if (ys[i] > H - PADDING) { ys[i] = H - PADDING; vys[i] = -Math.abs(vys[i]) * 0.85; }
      }

      // ── render ──────────────────────────────────────────────────────────
      // setTransform is idempotent — safe to call every frame even after resize
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // ghost particles (one batched path → single fillStyle call)
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        if (!ls[i]) {
          ctx.moveTo(xs[i] + R, ys[i]);
          ctx.arc(xs[i], ys[i], R, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      ctx.restore();

      // admitted particles — bright red with glow
      ctx.save();
      ctx.fillStyle   = THREAT;
      ctx.shadowColor = THREAT;
      ctx.shadowBlur  = 7;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        if (ls[i]) {
          ctx.moveTo(xs[i] + R, ys[i]);
          ctx.arc(xs[i], ys[i], R, 0, Math.PI * 2);
        }
      }
      ctx.fill();
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    // ── ResizeObserver — keep canvas sized to container ─────────────────────
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        sizeCanvas(e.contentRect.width);
      }
    });
    ro.observe(wrap);

    // ── IntersectionObserver — trigger animation on scroll into view ─────────
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && sim.current.phase === "idle") {
          sim.current.phase       = "running";
          sim.current.revealStart = performance.now();
          sim.current.revealCount = 0;
          initParticles();
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(wrap);

    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [N, ADM]);

  const pct = ((ADM / data.bereavedFamilies) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* ── header row: counter + ratio ───────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-muted-2 uppercase">
            Each dot = one bereaved family
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <AnimCounter
              to={ADM}
              duration={2.2}
              delay={0.35}
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: THREAT, textShadow: `0 0 14px ${THREAT}55` }}
            />
            <span className="font-mono text-xl text-muted-2">/</span>
            <AnimCounter
              to={data.bereavedFamilies}
              duration={2.2}
              delay={0.35}
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: AMBER }}
            />
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono text-[9px] tracking-[0.25em] text-muted-2 uppercase">
            Admitted
          </p>
          <p
            className="font-mono text-2xl font-bold tabular-nums"
            style={{ color: THREAT, textShadow: `0 0 10px ${THREAT}44` }}
          >
            {pct}%
          </p>
        </div>
      </div>

      {/* ── particle canvas ───────────────────────────────────────────────── */}
      <div
        ref={wrapRef}
        className="relative w-full rounded-md overflow-hidden border border-borderc bg-black/40"
      >
        <canvas ref={canvasRef} className="block" />
        {/* corner overlay */}
        <div className="absolute top-2 right-3 font-mono text-[8px] tracking-[0.16em] text-muted-2 pointer-events-none select-none">
          {data.bereavedFamilies.toLocaleString()} FAMILIES&nbsp;·&nbsp;
          {ADM.toLocaleString()} ACKNOWLEDGED
        </div>
      </div>

      {/* ── stat boxes ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-md border border-borderc bg-black/30 p-4 text-center"
          style={{ borderLeftColor: THREAT, borderLeftWidth: 2 }}
        >
          <p className="font-mono text-[8px] tracking-[0.22em] text-muted-2 uppercase mb-1">
            Official
          </p>
          <p
            className="font-mono text-2xl font-bold tabular-nums"
            style={{ color: THREAT }}
          >
            {ADM.toLocaleString()}
          </p>
          <p className="font-mono text-[8px] text-muted mt-0.5">IDF-acknowledged KIA</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="rounded-md border border-borderc bg-black/30 p-4 text-center"
          style={{ borderLeftColor: AMBER, borderLeftWidth: 2 }}
        >
          <p className="font-mono text-[8px] tracking-[0.22em] text-muted-2 uppercase mb-1">
            Registered Bereaved
          </p>
          <p
            className="font-mono text-2xl font-bold tabular-nums"
            style={{ color: AMBER }}
          >
            {data.bereavedFamilies.toLocaleString()}
          </p>
          <p className="font-mono text-[8px] text-muted mt-0.5">Defence ministry registry</p>
        </motion.div>
      </div>

      {/* ── attribution quote ─────────────────────────────────────────────── */}
      <blockquote
        className="font-mono text-[10px] leading-relaxed tracking-[0.07em] text-muted-2 border-l-2 pl-3 italic"
        style={{ borderColor: MINT }}
      >
        "Israeli army chief Zamir admitted discrepancy between official figures and bereaved
        families registry"
      </blockquote>

      <p className="font-mono text-[9px] tracking-[0.14em] text-muted-2">
        SOURCE: {data.source}
      </p>
    </div>
  );
}
