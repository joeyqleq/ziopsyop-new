'use client'

import { mulberry32 } from '@/lib/boot/wordmark'
import { useEffect, useRef } from 'react'

/**
 * Persistent atmosphere layer that sits under every scene so the frame is
 * never an empty black rectangle. All of it is ASCII / hairline geometry at
 * very low alpha, so it reads as instrumentation rather than decoration:
 *
 *  — a slow perspective character grid (the "floor")
 *  — drifting vertical glyph columns (data rain, very dim)
 *  — two concentric radar rings that sweep
 *  — a drifting constellation of hex address blocks
 *  — a horizon hairline with tick marks
 */

const RAIN_CHARS = '01·:+=*#%@/\\|<>[]{}oO'
const HEX = '0123456789ABCDEF'

interface RainCol {
  x: number
  y: number
  speed: number
  len: number
  glyphs: string[]
  alpha: number
  flip: number
}

interface HexBlock {
  x: number
  y: number
  vx: number
  vy: number
  text: string
  alpha: number
}

export function AmbientBackdrop({
  intensity = 1,
  className,
  tone = 'mint',
}: {
  intensity?: number
  className?: string
  tone?: 'mint' | 'amber' | 'red' | 'violet'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const toneRef = useRef(tone)
  toneRef.current = tone

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rng = mulberry32(20260727)
    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let cols: RainCol[] = []
    let blocks: HexBlock[] = []
    let gridStep = 34

    const TONES: Record<string, string> = {
      mint: '62,230,193',
      amber: '255,199,92',
      red: '255,96,112',
      violet: '150,122,255',
    }

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      gridStep = w < 640 ? 26 : 34

      const colCount = Math.max(6, Math.floor((w / 120) * intensity))
      cols = Array.from({ length: colCount }, () => {
        const len = 6 + Math.floor(rng() * 16)
        return {
          x: rng() * w,
          y: rng() * h,
          speed: 14 + rng() * 46,
          len,
          glyphs: Array.from({ length: len }, () => RAIN_CHARS[Math.floor(rng() * RAIN_CHARS.length)]),
          alpha: 0.05 + rng() * 0.11,
          flip: rng(),
        }
      })

      const blockCount = Math.max(4, Math.floor(10 * intensity))
      blocks = Array.from({ length: blockCount }, () => ({
        x: rng() * w,
        y: rng() * h,
        vx: (rng() - 0.5) * 7,
        vy: (rng() - 0.5) * 7,
        text: `0x${Array.from({ length: 4 }, () => HEX[Math.floor(rng() * 16)]).join('')}`,
        alpha: 0.05 + rng() * 0.08,
      }))
    }

    let prev = performance.now()
    const tick = (now: number) => {
      if (!running) return
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      const t = now / 1000
      const rgb = TONES[toneRef.current] ?? TONES.mint

      ctx.clearRect(0, 0, w, h)

      // ---- perspective character floor -----------------------------------
      ctx.font = `10px var(--font-jetbrains), monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const drift = (t * 9) % gridStep
      for (let y = h * 0.52; y < h + gridStep; y += gridStep) {
        const depth = (y - h * 0.52) / (h * 0.48)
        const spacing = gridStep * (0.42 + depth * 1.5)
        const rowAlpha = 0.035 + depth * 0.055
        for (let x = ((t * 5) % spacing) - spacing; x < w + spacing; x += spacing) {
          ctx.globalAlpha = rowAlpha * intensity
          ctx.fillStyle = `rgba(${rgb},1)`
          ctx.fillText('·', x, y + drift * 0.15)
        }
      }

      // ---- horizon hairline + ticks ---------------------------------------
      const hy = h * 0.52
      ctx.globalAlpha = 0.1 * intensity
      ctx.strokeStyle = `rgba(${rgb},1)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, hy)
      ctx.lineTo(w, hy)
      ctx.stroke()
      for (let x = ((t * 12) % 90) - 90; x < w + 90; x += 90) {
        ctx.globalAlpha = 0.14 * intensity
        ctx.beginPath()
        ctx.moveTo(x, hy - 4)
        ctx.lineTo(x, hy + 4)
        ctx.stroke()
      }

      // ---- radar rings -----------------------------------------------------
      const cx = w / 2
      const cy = h / 2
      for (let i = 0; i < 3; i++) {
        const base = Math.min(w, h) * (0.24 + i * 0.16)
        const pulse = base + Math.sin(t * 0.5 + i * 1.7) * 8
        ctx.globalAlpha = (0.055 - i * 0.012) * intensity
        ctx.strokeStyle = `rgba(${rgb},1)`
        ctx.beginPath()
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2)
        ctx.stroke()
      }
      // sweeping radius
      const sweep = (t * 0.42) % (Math.PI * 2)
      const rMax = Math.min(w, h) * 0.56
      ctx.globalAlpha = 0.07 * intensity
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(sweep) * rMax, cy + Math.sin(sweep) * rMax)
      ctx.stroke()

      // ---- data rain -------------------------------------------------------
      for (const c of cols) {
        c.y += c.speed * dt
        if (c.y - c.len * 13 > h) {
          c.y = -10
          c.x = rng() * w
        }
        c.flip -= dt
        if (c.flip <= 0) {
          c.glyphs[Math.floor(rng() * c.glyphs.length)] =
            RAIN_CHARS[Math.floor(rng() * RAIN_CHARS.length)]
          c.flip = 0.06 + rng() * 0.22
        }
        ctx.font = `11px var(--font-jetbrains), monospace`
        for (let i = 0; i < c.glyphs.length; i++) {
          const y = c.y - i * 13
          if (y < -14 || y > h + 14) continue
          const fade = 1 - i / c.glyphs.length
          ctx.globalAlpha = c.alpha * fade * intensity
          ctx.fillStyle = i === 0 ? `rgba(230,255,246,1)` : `rgba(${rgb},1)`
          ctx.fillText(c.glyphs[i], c.x, y)
        }
      }

      // ---- floating hex address blocks ------------------------------------
      ctx.font = `9px var(--font-jetbrains), monospace`
      for (const b of blocks) {
        b.x += b.vx * dt
        b.y += b.vy * dt
        if (b.x < -40) b.x = w + 40
        if (b.x > w + 40) b.x = -40
        if (b.y < -20) b.y = h + 20
        if (b.y > h + 20) b.y = -20
        ctx.globalAlpha = b.alpha * intensity
        ctx.fillStyle = `rgba(${rgb},1)`
        ctx.fillText(b.text, b.x, b.y)
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
  }, [intensity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ''}`}
    />
  )
}
