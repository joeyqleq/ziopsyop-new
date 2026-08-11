'use client'

import { layoutBlockText, type BlockCell } from '@/lib/boot/blockfont'
import { mulberry32 } from '@/lib/boot/wordmark'
import { resolveCanvasMonoFont } from '@/lib/boot/canvas-font'
import { useEffect, useMemo, useRef } from 'react'

/**
 * Large lettering built entirely from live ASCII characters on canvas.
 * Every cell independently churns its glyph and cycles through a travelling
 * multi-colour wave, so the wordmark is never static for a single frame.
 *
 * `emphasisWord` gets a hotter palette, a larger glyph weight, a chromatic
 * ghost and a slow shimmer sweep.
 */

const CHURN = '01345789+*#%@=&$?/\\|<>oOxXAV'
const CHURN_EMPH = 'RATHBONE013#%@*'

/** Cool → hot travelling palette (mint, cyan, lime, amber, coral, violet). */
const PALETTE: Array<[number, number, number]> = [
  [62, 230, 193],
  [92, 214, 255],
  [163, 230, 76],
  [255, 199, 92],
  [255, 96, 112],
  [150, 122, 255],
]

const PALETTE_EMPH: Array<[number, number, number]> = [
  [255, 232, 150],
  [255, 168, 92],
  [255, 92, 108],
  [255, 60, 80],
  [255, 140, 96],
  [255, 214, 120],
]

function lerpColor(ramp: Array<[number, number, number]>, t: number) {
  const n = ramp.length
  const p = ((t % 1) + 1) % 1
  const i = Math.floor(p * n)
  const f = p * n - i
  const a = ramp[i % n]
  const b = ramp[(i + 1) % n]
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ] as const
}

interface CellState extends BlockCell {
  ch: string
  nextFlip: number
  seed: number
  appearAt: number
  isEmph: boolean
}

export function AsciiWordmark({
  words,
  emphasisWord = -1,
  getT,
  startAt,
  className,
  maxCell = 15,
}: {
  words: string[]
  emphasisWord?: number
  getT: () => number
  /** absolute boot-clock time at which the wordmark starts materialising */
  startAt: number
  className?: string
  maxCell?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layout = useMemo(() => layoutBlockText(words, 1, 4), [words])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const monoFont = resolveCanvasMonoFont()

    const rng = mulberry32(90210)
    const cells: CellState[] = layout.cells.map((c) => ({
      ...c,
      ch: CHURN[Math.floor(rng() * CHURN.length)],
      nextFlip: rng() * 0.2,
      seed: rng(),
      // materialise centre-out per column, with a little jitter
      appearAt: Math.abs(c.u - 0.5) * 0.85 + rng() * 0.16 + c.gy * 0.012,
      isEmph: c.word === emphasisWord,
    }))

    let raf = 0
    let running = true
    let cell = 10
    let w = 0
    let h = 0
    let originX = 0
    let originY = 0

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = Math.max(3, Math.min(maxCell, Math.floor((w * 0.94) / layout.cols), Math.floor(h / (layout.rows + 1))))
      originX = (w - layout.cols * cell) / 2
      originY = (h - layout.rows * cell) / 2
    }

    let prev = performance.now()
    const tick = (now: number) => {
      if (!running) return
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now

      const local = getT() - startAt
      ctx.clearRect(0, 0, w, h)
      if (local < -0.05) return

      const fontPx = Math.round(cell * 1.02)
      ctx.font = `700 ${fontPx}px ${monoFont}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (const c of cells) {
        const age = local - c.appearAt
        if (age < 0) continue

        // glyph churn — faster while materialising, then a steady simmer
        c.nextFlip -= dt
        if (c.nextFlip <= 0) {
          const pool = c.isEmph ? CHURN_EMPH : CHURN
          c.ch = pool[Math.floor(rng() * pool.length)]
          c.nextFlip = age < 0.5 ? 0.03 + rng() * 0.05 : 0.1 + rng() * 0.5
        }

        const x = originX + c.gx * cell + cell / 2
        const yBase = originY + c.gy * cell + cell / 2

        // entrance: rise + settle
        const settle = Math.min(1, age / 0.42)
        const ease = 1 - Math.pow(1 - settle, 3)
        const y = yBase + (1 - ease) * cell * 1.6

        // travelling colour wave: position + time + per-cell jitter
        const ramp = c.isEmph ? PALETTE_EMPH : PALETTE
        const wave = c.u * 1.35 - local * 0.42 + c.gy * 0.045 + c.seed * 0.06
        const [r, g, b] = lerpColor(ramp, wave)

        // vertical shimmer band sweeping across the lockup
        const band = Math.exp(-Math.pow((c.u - (((local * 0.5) % 1.6) - 0.3)) * 5.5, 2))
        const boost = 0.55 + 0.45 * ease + band * 0.7
        const alpha = Math.min(1, boost) * (c.isEmph ? 1 : 0.92)

        if (c.isEmph) {
          // chromatic ghosts on the emphasis word
          const gh = Math.sin(local * 7 + c.seed * 9) * 1.4
          ctx.globalAlpha = alpha * 0.32
          ctx.fillStyle = 'rgba(92,214,255,1)'
          ctx.fillText(c.ch, x - gh, y)
          ctx.fillStyle = 'rgba(255,70,90,1)'
          ctx.fillText(c.ch, x + gh, y)
          ctx.shadowColor = 'rgba(255,90,110,0.85)'
          ctx.shadowBlur = 12 + band * 14
        } else {
          ctx.shadowColor = `rgba(${r},${g},${b},0.55)`
          ctx.shadowBlur = 6 + band * 10
        }

        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillText(c.ch, x, y)
        ctx.shadowBlur = 0
      }
      ctx.globalAlpha = 1
    }

    measure()
    window.addEventListener('resize', measure)
    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [layout, emphasisWord, getT, startAt, maxCell])

  return <canvas ref={canvasRef} aria-hidden="true" className={`h-full w-full ${className ?? ''}`} />
}
