'use client'

import { CEDAR_CHURN, cedarDensity, isCedarTrunk } from '@/lib/boot/cedar'
import { mulberry32 } from '@/lib/boot/wordmark'
import { resolveCanvasMonoFont } from '@/lib/boot/canvas-font'
import { useEffect, useRef } from 'react'

/**
 * The Lebanese cedar, rendered as a living ASCII grid.
 *
 * It materialises from the roots upward: each cell drifts in from a scattered
 * position, locks onto its place in the tree, and then keeps churning its
 * character forever. Foliage breathes in greens, the trunk holds bark tones,
 * and a slow wind pass sways the crown.
 */

interface CedarCell {
  col: number
  row: number
  /** normalised position in the cedar box */
  u: number
  v: number
  density: number
  trunk: boolean
  ch: string
  nextFlip: number
  seed: number
  /** local seconds after `startAt` when this cell locks in */
  lockAt: number
  /** scattered origin the cell flies in from */
  fx: number
  fy: number
}

const FOLIAGE: Array<[number, number, number]> = [
  [34, 150, 96],
  [0, 190, 104],
  [86, 228, 160],
  [176, 244, 150],
]
const BARK: Array<[number, number, number]> = [
  [128, 70, 30],
  [178, 104, 42],
  [214, 146, 78],
]

function pick(ramp: Array<[number, number, number]>, t: number) {
  const p = Math.max(0, Math.min(0.999, t)) * (ramp.length - 1)
  const i = Math.floor(p)
  const f = p - i
  const a = ramp[i]
  const b = ramp[Math.min(ramp.length - 1, i + 1)]
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(
    a[2] + (b[2] - a[2]) * f,
  )})`
}

export function CedarTree({
  getT,
  startAt,
  /** seconds the materialisation takes end to end */
  materializeSeconds = 2.6,
  /** 0..1 overall scale of the tree inside its box */
  scale = 0.86,
  /** nudge the tree vertically, as a fraction of canvas height (negative = up) */
  offsetY = 0,
  className,
}: {
  getT: () => number
  startAt: number
  materializeSeconds?: number
  scale?: number
  offsetY?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rng = mulberry32(17761943)
    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let cell = 9
    let boxW = 0
    let boxH = 0
    let boxX = 0
    let boxY = 0
    let cells: CedarCell[] = []
    const monoFont = resolveCanvasMonoFont()

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cell = w < 640 ? 5 : w < 1100 ? 6 : 7

      // reserve room under the tree for the caption, and never touch the edges
      const availH = h * 0.88 - 46
      const availW = w * 0.9
      boxH = availH * scale
      boxW = boxH * 1.1
      if (boxW > availW) {
        boxW = availW
        boxH = boxW / 1.1
      }
      boxX = (w - boxW) / 2
      boxY = (h - boxH) / 2 - h * 0.045 + offsetY * h

      const cols = Math.floor(boxW / cell)
      const rows = Math.floor(boxH / cell)
      cells = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const u = (c + 0.5) / cols
          const v = (r + 0.5) / rows
          const d = cedarDensity(u, v)
          // drop the faintest cells outright so the silhouette stays crisp
          if (d <= 0.065) continue
          if (d < 0.28 && rng() > 0.72) continue

          const ang = rng() * Math.PI * 2
          const dist = 120 + rng() * 420
          cells.push({
            col: c,
            row: r,
            u,
            v,
            density: d,
            trunk: isCedarTrunk(v, u),
            ch: CEDAR_CHURN[Math.floor(rng() * CEDAR_CHURN.length)],
            nextFlip: rng() * 0.4,
            seed: rng(),
            // roots first, crown last, with jitter
            lockAt: (1 - v) * materializeSeconds * 0.72 + rng() * materializeSeconds * 0.24,
            fx: Math.cos(ang) * dist,
            fy: Math.sin(ang) * dist - 60,
          })
        }
      }
    }

    let prev = performance.now()
    const tick = (now: number) => {
      if (!running) return
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now

      const local = getT() - startAt
      ctx.clearRect(0, 0, w, h)
      if (local < 0) return

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const fontPx = cell + 1

      for (const c of cells) {
        const age = local - c.lockAt
        if (age < -0.5) continue

        c.nextFlip -= dt
        if (c.nextFlip <= 0) {
          c.ch = CEDAR_CHURN[Math.floor(rng() * CEDAR_CHURN.length)]
          c.nextFlip = 0.09 + rng() * 0.62
        }

        // 0 → 1 fly-in / lock-on
        const t = Math.max(0, Math.min(1, (age + 0.5) / 0.85))
        const ease = 1 - Math.pow(1 - t, 4)

        const targetX = boxX + c.col * cell + cell / 2
        const targetY = boxY + c.row * cell + cell / 2

        // wind sway, stronger toward the crown and the frond tips
        const windAmp = (1 - c.v) * 2.6 * (0.35 + Math.abs(c.u - 0.5) * 1.6)
        const wind = Math.sin(local * 1.15 + c.v * 3.4 + c.u * 2.1) * windAmp * ease

        const x = targetX + (1 - ease) * c.fx + wind
        const y = targetY + (1 - ease) * c.fy

        // colour: bark for the trunk, breathing greens for the foliage
        const breathe = 0.5 + 0.5 * Math.sin(local * 0.9 + c.v * 5.2 + c.seed * 6.3)
        const shade = c.trunk
          ? pick(BARK, 0.25 + c.density * 0.5 + breathe * 0.22)
          : pick(FOLIAGE, 0.12 + c.density * 0.62 + breathe * 0.24)

        const alpha = Math.min(1, (0.58 + c.density * 0.5 + (c.trunk ? 0.1 : 0)) * ease)
        ctx.globalAlpha = alpha
        ctx.fillStyle = shade
        ctx.font = `${c.trunk || c.density > 0.48 ? '700 ' : ''}${fontPx}px ${monoFont}`

        // a soft bloom on the densest mass gives the tree depth
        if (c.trunk || c.density > 0.55) {
          ctx.shadowColor = c.trunk ? 'rgba(176,108,52,0.5)' : 'rgba(62,214,150,0.55)'
          ctx.shadowBlur = 7
        }
        ctx.fillText(c.ch, x, y)
        ctx.shadowBlur = 0

        // arrival spark
        if (age > -0.05 && age < 0.16) {
          ctx.globalAlpha = (1 - age / 0.16) * 0.85
          ctx.fillStyle = '#eafff4'
          ctx.fillText(c.ch, x, y)
        }
      }
      ctx.globalAlpha = 1
    }

    build()
    window.addEventListener('resize', build)
    raf = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
    }
  }, [getT, startAt, materializeSeconds, scale, offsetY])

  return <canvas ref={canvasRef} aria-hidden="true" className={`absolute inset-0 h-full w-full ${className ?? ''}`} />
}
