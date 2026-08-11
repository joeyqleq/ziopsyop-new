'use client'

import { NOISE_CHARS, mulberry32 } from '@/lib/boot/wordmark'
import { resolveCanvasMonoFont } from '@/lib/boot/canvas-font'
import { useEffect, useRef } from 'react'

export type FieldMode = 'drift' | 'star' | 'crumble' | 'sparse'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  ch: string
  color: string
  size: number
  alpha: number
  tx: number
  ty: number
  hasTarget: boolean
}

const COLORS = ['#3EE6C1', '#7C5CFF', '#A3E64C', '#565B64', '#4A3F86']

/** Points along the outline of a hexagram (Star of David): two overlapping triangles. */
function starOfDavidTargets(cx: number, cy: number, radius: number, count: number): Array<[number, number]> {
  const pts: Array<[number, number]> = []
  const tri = (offsetDeg: number) => {
    const v: Array<[number, number]> = []
    for (let i = 0; i < 3; i++) {
      const a = ((offsetDeg + i * 120) * Math.PI) / 180
      v.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)])
    }
    return v
  }
  const triangles = [tri(-90), tri(90)]
  const perEdge = Math.max(2, Math.floor(count / 6))
  for (const v of triangles) {
    for (let e = 0; e < 3; e++) {
      const [x0, y0] = v[e]
      const [x1, y1] = v[(e + 1) % 3]
      for (let i = 0; i < perEdge; i++) {
        const f = i / perEdge
        pts.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f])
      }
    }
  }
  return pts
}

/**
 * One lightweight canvas of drifting ASCII characters.
 * Modes: drift (ambient), star (particles form the Star of David), crumble (formation collapses), sparse (dim ambient).
 */
export function AsciiField({
  mode,
  className,
  intensity = 1,
}: {
  mode: FieldMode
  className?: string
  intensity?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef<FieldMode>(mode)
  modeRef.current = mode
  const pointerRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const monoFont = resolveCanvasMonoFont()

    const rng = mulberry32(1337)
    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let dpr = 1
    let particles: Particle[] = []
    let lastMode: FieldMode | null = null
    let crumbleStart = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const isMobile = w < 640
      const count = Math.floor((isMobile ? 70 : 170) * intensity)
      particles = Array.from({ length: count }, () => ({
        x: rng() * w,
        y: rng() * h,
        vx: (rng() - 0.5) * 22,
        vy: (rng() - 0.5) * 22,
        ch: NOISE_CHARS[Math.floor(rng() * NOISE_CHARS.length)],
        color: COLORS[Math.floor(rng() * COLORS.length)],
        size: 9 + rng() * 6,
        alpha: 0.16 + rng() * 0.4,
        tx: 0,
        ty: 0,
        hasTarget: false,
      }))
      lastMode = null
    }

    const assignStarTargets = () => {
      const r = Math.min(w, h) * 0.3
      const targets = starOfDavidTargets(w / 2, h / 2, r, particles.length)
      particles.forEach((p, i) => {
        const t = targets[i % targets.length]
        p.tx = t[0] + (rng() - 0.5) * 4
        p.ty = t[1] + (rng() - 0.5) * 4
        p.hasTarget = true
      })
    }

    let prev = performance.now()
    const tick = (now: number) => {
      if (!running) return
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      const m = modeRef.current

      if (m !== lastMode) {
        if (m === 'star') assignStarTargets()
        if (m === 'crumble') {
          crumbleStart = now
          for (const p of particles) {
            p.vx = (rng() - 0.5) * 160
            p.vy = -30 - rng() * 60
            p.hasTarget = false
          }
        }
        if (m === 'drift' || m === 'sparse') {
          for (const p of particles) {
            p.hasTarget = false
            if (Math.abs(p.vx) > 30 || Math.abs(p.vy) > 30) {
              p.vx = (rng() - 0.5) * 22
              p.vy = (rng() - 0.5) * 22
            }
          }
        }
        lastMode = m
      }

      ctx.clearRect(0, 0, w, h)
      const globalAlpha = m === 'sparse' ? 0.4 : 1
      const ptr = pointerRef.current

      for (const p of particles) {
        if (m === 'star' && p.hasTarget) {
          p.x += (p.tx - p.x) * Math.min(1, dt * 3.2)
          p.y += (p.ty - p.y) * Math.min(1, dt * 3.2)
        } else if (m === 'crumble') {
          p.vy += 220 * dt // gravity
          p.x += p.vx * dt
          p.y += p.vy * dt
        } else {
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (ptr) {
            const dx = p.x - ptr.x
            const dy = p.y - ptr.y
            const d2 = dx * dx + dy * dy
            if (d2 < 90 * 90 && d2 > 1) {
              const f = (90 * 90 - d2) / (90 * 90)
              const d = Math.sqrt(d2)
              p.x += (dx / d) * f * 40 * dt
              p.y += (dy / d) * f * 40 * dt
            }
          }
          if (p.x < -20) p.x = w + 20
          if (p.x > w + 20) p.x = -20
          if (p.y < -20) p.y = h + 20
          if (p.y > h + 20) p.y = -20
        }

        let a = p.alpha * globalAlpha
        if (m === 'crumble') {
          const t = (now - crumbleStart) / 1400
          a *= Math.max(0, 1 - t * 0.75)
          if (p.y > h + 30) continue
        }
        if (m === 'star' && p.hasTarget) a = Math.min(0.95, p.alpha + 0.35)

        ctx.globalAlpha = a
        ctx.fillStyle = p.color
        ctx.font = `${p.size}px ${monoFont}`
        ctx.fillText(p.ch, p.x, p.y)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else {
        running = true
        prev = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (window.matchMedia('(pointer: fine)').matches) {
        const rect = canvas.getBoundingClientRect()
        pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      }
    }
    const onPointerLeave = () => {
      pointerRef.current = null
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onPointer)
    window.addEventListener('pointerleave', onPointerLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [intensity])

  return <canvas ref={canvasRef} aria-hidden="true" className={`absolute inset-0 h-full w-full ${className ?? ''}`} />
}
