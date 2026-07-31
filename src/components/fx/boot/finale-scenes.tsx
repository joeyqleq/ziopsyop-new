'use client'

import { NOISE_CHARS, WORDMARK_ROWS, mulberry32 } from '@/lib/boot/wordmark'
import { useEffect, useRef, useState } from 'react'
import { AsciiEye } from './ascii-eye'

/* ---------- 05/06 CONVERGENCE: three fronts flow into the ASCII eye ---------- */

const ORBIT_LABELS = ['WHO SPOKE?', 'WHAT HAPPENED?', 'HOW WAS IT FRAMED?']

export function ConvergenceScene() {
  const [locked, setLocked] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLocked(true), 3400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 py-16">
      <style>{`
        @keyframes zio-dash-flow { to { background-position-x: -60px; } }
      `}</style>

      {/* three faint residual scenes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden items-center justify-between px-[6%] opacity-25 md:flex"
      >
        {['I // NARRATIVE', 'II // BATTLEFIELD', 'III // FRAMES'].map((l, i) => (
          <span
            key={l}
            className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
              i === 0 ? 'zio-mint' : i === 1 ? 'zio-amber' : 'zio-red'
            }`}
          >
            {l}
          </span>
        ))}
      </div>

      {/* evidence filaments flowing toward the eye */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[
          { top: '38%', rotate: '8deg', color: 'var(--zio-mint)', left: '4%', width: '30%' },
          { top: '52%', rotate: '-4deg', color: 'var(--zio-amber)', left: '8%', width: '26%' },
          { top: '44%', rotate: '184deg', color: 'var(--zio-red)', left: '66%', width: '30%' },
          { top: '58%', rotate: '176deg', color: 'var(--zio-mint)', left: '64%', width: '28%' },
        ].map((f, i) => (
          <span
            key={i}
            className="absolute hidden h-px sm:block"
            style={{
              top: f.top,
              left: f.left,
              width: f.width,
              transform: `rotate(${f.rotate})`,
              backgroundImage: `repeating-linear-gradient(90deg, ${f.color} 0 8px, transparent 8px 16px)`,
              backgroundSize: '60px 1px',
              animation: 'zio-dash-flow 0.9s linear infinite',
              opacity: 0.55,
            }}
          />
        ))}
      </div>

      {/* the ASCII eye classifying incoming streams */}
      <div aria-hidden="true" className="relative">
        <div className="hidden sm:block">
          <AsciiEye aperture={1} cols={64} rows={21} fontSize="clamp(7px, 1vw, 12px)" />
        </div>
        <div className="sm:hidden">
          <AsciiEye aperture={1} cols={44} rows={17} fontSize="7px" />
        </div>
        {/* orbiting classification labels — one revolution */}
        {!locked && (
          <div className="zio-orbit absolute inset-0">
            {ORBIT_LABELS.map((l, i) => (
              <span
                key={l}
                className="zio-orbit-counter absolute font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground sm:text-[10px]"
                style={{
                  top: `${[0, 78, 40][i]}%`,
                  left: `${[30, 60, -14][i]}%`,
                }}
              >
                {l}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex h-14 flex-col items-center justify-center">
        {locked && (
          <p className="zio-eq-lock text-center font-mono text-sm font-bold uppercase text-foreground sm:text-xl">
            NARRATIVE + FORCE + FRAME = <span className="zio-red">PERMISSION</span>
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------- 06/06 SIGNAL FROM NOISE: static resolves into ZI0PSY0P ---------- */

export function SignalScene() {
  const [grid, setGrid] = useState<string[] | null>(null)
  const [splitting, setSplitting] = useState(false)
  const [settled, setSettled] = useState(false)
  const rafRef = useRef(0)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const rng = mulberry32(99)
    const rows = WORDMARK_ROWS.length
    const cols = WORDMARK_ROWS[0].length
    // per-cell resolve times: noise chars fall away until the wordmark remains
    const resolveAt: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 300 + rng() * 1900),
    )
    const start = performance.now()
    const loop = (now: number) => {
      const t = now - start
      const out: string[] = []
      for (let r = 0; r < rows; r++) {
        let line = ''
        for (let c = 0; c < cols; c++) {
          const target = WORDMARK_ROWS[r][c] ?? ' '
          if (t >= resolveAt[r][c]) line += target
          else line += Math.random() < 0.8 ? NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)] : ' '
        }
        out.push(line)
      }
      setGrid(out)
      if (t < 2300) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        setGrid(WORDMARK_ROWS as string[])
        setSplitting(true)
        settleTimerRef.current = setTimeout(() => {
          setSplitting(false)
          setSettled(true)
        }, 450)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
    }
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
      <p className="zio-fade-up font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground sm:text-xs">
        {'// SIGNAL FROM NOISE'}
      </p>

      <pre
        aria-hidden="true"
        className={`font-mono font-bold leading-[1.05] ${splitting ? 'zio-rgbsplit' : ''}`}
        style={{
          fontSize: 'clamp(5px, 1.7vw, 16px)',
          color: settled ? 'var(--zio-text)' : 'var(--zio-mint)',
          textShadow: settled ? '0 0 24px rgba(62,230,193,0.35)' : undefined,
          transition: 'color 0.4s ease',
        }}
      >
        {(grid ?? WORDMARK_ROWS).join('\n')}
      </pre>

      <div className="flex flex-col items-center gap-1 text-center">
        <p
          className="zio-fade-up font-sans text-sm text-foreground sm:text-base"
          style={{ animationDelay: '2.4s' }}
        >
          THREE FRONTS. ONE EVIDENCE SYSTEM.
        </p>
        <p
          className="zio-fade-up font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--zio-tertiary)] sm:text-[10px]"
          style={{ animationDelay: '2.55s' }}
        >
          OPEN-SOURCE FORENSICS {'//'} SOURCES VISIBLE {'//'} UNCERTAINTY LABELED
        </p>
      </div>
    </div>
  )
}

/* ---------- 01/06 ACQUIRE ---------- */

const ACQUIRE_LINES = ['ZIOPSYOP // OPEN-SOURCE FORENSIC SYSTEM', 'ACQUIRING THREE EVIDENCE STREAMS…']

export function AcquireScene() {
  const [chars, setChars] = useState(0)
  useEffect(() => {
    const total = ACQUIRE_LINES.join('').length
    const id = setInterval(() => setChars((c) => (c >= total ? c : c + 2)), 30)
    return () => clearInterval(id)
  }, [])
  let remaining = chars
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
      {ACQUIRE_LINES.map((line, i) => {
        const take = Math.max(0, Math.min(line.length, remaining))
        remaining -= line.length
        const done = take >= line.length
        return (
          <p
            key={i}
            className={`font-mono uppercase tracking-[0.3em] ${
              i === 0 ? 'text-xs text-foreground sm:text-sm' : 'text-[10px] text-muted-foreground sm:text-xs'
            } ${!done && take > 0 ? 'zio-caret' : ''}`}
          >
            {line.slice(0, take)}
          </p>
        )
      })}
    </div>
  )
}
