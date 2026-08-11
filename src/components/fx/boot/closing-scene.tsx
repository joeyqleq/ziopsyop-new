'use client'

import { CLOSING_T } from '@/lib/boot/timeline'
import { mulberry32 } from '@/lib/boot/wordmark'
import { resolveCanvasMonoFont } from '@/lib/boot/canvas-font'
import { useEffect, useRef, useState } from 'react'
import { AsciiEye } from './ascii-eye'
import { AsciiWordmark } from './ascii-wordmark'
import { CedarTree } from './cedar-tree'

/**
 * Closing act (37.5s → 47.5s):
 * — full-screen animated ASCII Israeli flag (waving char grid) for ~2.5s
 * — the Star of David at its centre shatters into flying chars while the
 *   flag dissolves, and the Lebanese cedar starts growing in its place
 * — the blinking ASCII eye rises above it
 * — the creed: WE ARE RATHBONE in live multicoloured ASCII lettering,
 *   with "EXPOSING ZIONIST PROPAGANDA BY NOTICING" beneath it
 */

const FLAG_BLUE = '#4ea8ff'
const FLAG_BLUE_DIM = 'rgba(78,168,255,0.82)'
const FLAG_WHITE = 'rgba(225,230,238,0.6)'
const STAR_CHARS = ['#', '%', '#', '@']
const STRIPE_CHARS = ['=', '#', '=', '\u2261']
const FIELD_CHARS = ['\u00b7', '-', '+', '\u02d1']

interface FlagCell {
  col: number
  row: number
  ch: string
  kind: 'star' | 'stripe' | 'field'
  dissolveAt: number
  px: number
  py: number
  vx: number
  vy: number
  spin: number
  flip: number
}

function segDist(px: number, py: number, x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0
  const dy = y1 - y0
  const l2 = dx * dx + dy * dy
  let t = l2 === 0 ? 0 : ((px - x0) * dx + (py - y0) * dy) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy))
}

function hexagramEdges(cx: number, cy: number, r: number): Array<[number, number, number, number]> {
  const edges: Array<[number, number, number, number]> = []
  for (const offset of [-90, 90]) {
    const v: Array<[number, number]> = []
    for (let i = 0; i < 3; i++) {
      const a = ((offset + i * 120) * Math.PI) / 180
      v.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
    for (let e = 0; e < 3; e++) edges.push([v[e][0], v[e][1], v[(e + 1) % 3][0], v[(e + 1) % 3][1]])
  }
  return edges
}

export function ClosingScene({ getT }: { getT: () => number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stage, setStage] = useState<'flag' | 'shatter' | 'creed'>('flag')
  const [eyeAperture, setEyeAperture] = useState(0)
  const [creedExit, setCreedExit] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)

  // canvas: flag grid + shatter particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rng = mulberry32(4242)
    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let cells: FlagCell[] = []
    let cell = 14
    let fontPx = 12
    const monoFont = resolveCanvasMonoFont()

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = w < 640 ? 9 : 12
      fontPx = cell - 1
      const cols = Math.ceil(w / cell)
      const rows = Math.ceil(h / cell)
      const starR = Math.min(w, h) * 0.21
      const edges = hexagramEdges(w / 2, h / 2, starR)
      const starThick = cell * 1.08

      cells = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cell + cell / 2
          const y = r * cell + cell / 2
          const yf = y / h
          let kind: FlagCell['kind'] | null = null
          let ch = ''
          let starDist = Infinity
          for (const [x0, y0, x1, y1] of edges) {
            const d = segDist(x, y, x0, y0, x1, y1)
            if (d < starDist) starDist = d
          }
          if (starDist < starThick) {
            kind = 'star'
            ch = STAR_CHARS[Math.floor(rng() * STAR_CHARS.length)]
          } else if ((yf > 0.13 && yf < 0.225) || (yf > 0.775 && yf < 0.87)) {
            kind = 'stripe'
            ch = STRIPE_CHARS[Math.floor(rng() * STRIPE_CHARS.length)]
          } else if (rng() < 0.64) {
            kind = 'field'
            ch = FIELD_CHARS[Math.floor(rng() * FIELD_CHARS.length)]
          }
          if (!kind) continue

          const ang = Math.atan2(y - h / 2, x - w / 2)
          const speed = 150 + rng() * 380
          cells.push({
            col: c,
            row: r,
            ch,
            kind,
            dissolveAt: rng() * 0.9,
            px: x,
            py: y,
            vx: Math.cos(ang) * speed + (rng() - 0.5) * 130,
            vy: Math.sin(ang) * speed + (rng() - 0.5) * 130 - 50,
            spin: (rng() - 0.5) * 9,
            flip: rng() * 0.3,
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
      const t = getT()
      const lf = t - CLOSING_T.flag
      const ls = t - CLOSING_T.shatter

      ctx.clearRect(0, 0, w, h)
      ctx.font = `${fontPx}px ${monoFont}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const reveal = Math.min(1, lf / 0.7)
      const shattered = ls >= 0
      // pre-shatter tension: the star tightens and flickers
      const tension = shattered ? 0 : Math.max(0, (lf - 1.5) / 1)

      for (const fc of cells) {
        if (shattered && fc.kind === 'star') {
          fc.vy += 170 * dt
          fc.px += fc.vx * dt
          fc.py += fc.vy * dt
          const life = 1 - ls / 1.9
          if (life <= 0 || fc.py > h + 30) continue
          fc.flip -= dt
          if (fc.flip <= 0) {
            fc.ch = STAR_CHARS[Math.floor(rng() * STAR_CHARS.length)]
            fc.flip = 0.05 + rng() * 0.12
          }
          ctx.save()
          ctx.translate(fc.px, fc.py)
          ctx.rotate(fc.spin * ls)
          ctx.globalAlpha = Math.max(0, life) * 0.95
          ctx.fillStyle = ls % 0.2 < 0.1 ? FLAG_BLUE : '#bcd9ff'
          ctx.shadowColor = 'rgba(120,180,255,0.7)'
          ctx.shadowBlur = 8
          ctx.fillText(fc.ch, 0, 0)
          ctx.restore()
          ctx.shadowBlur = 0
          continue
        }

        const x = fc.col * cell + cell / 2
        const yBase = fc.row * cell + cell / 2
        if (shattered) {
          if (ls > fc.dissolveAt) continue
          ctx.globalAlpha = Math.max(0, 1 - ls / Math.max(fc.dissolveAt, 0.01)) * 0.8
        } else {
          if (yBase / h > reveal + 0.02) continue
          ctx.globalAlpha = 1
        }

        const wave = Math.sin(x * 0.016 + t * 2.8 + fc.row * 0.12) * (cell * 0.34)
        const bright = 0.75 + 0.25 * Math.sin(x * 0.016 + t * 2.8 - 0.6)

        if (fc.kind === 'star') {
          // the star pulls inward and flickers hotter as the shatter approaches
          const pull = tension * 0.09
          ctx.fillStyle = tension > 0.4 && Math.sin(t * 42) > 0 ? '#dbe9ff' : FLAG_BLUE
          ctx.globalAlpha *= Math.min(1, 0.75 + 0.25 * bright)
          ctx.fillText(
            fc.ch,
            x + (w / 2 - x) * pull,
            yBase + wave + (h / 2 - yBase) * pull,
          )
          continue
        }
        if (fc.kind === 'stripe') {
          ctx.fillStyle = FLAG_BLUE_DIM
          ctx.globalAlpha *= 0.88 + bright * 0.12
        } else {
          ctx.fillStyle = FLAG_WHITE
          ctx.globalAlpha *= 0.78 + bright * 0.18
        }
        ctx.fillText(fc.ch, x, yBase + wave)
      }

      // shatter flash + expanding shock ring
      if (shattered && ls < 0.34) {
        ctx.globalAlpha = (1 - ls / 0.34) * 0.5
        ctx.fillStyle = '#dbe9ff'
        ctx.fillRect(0, 0, w, h)
      }
      if (shattered && ls < 1.1) {
        ctx.globalAlpha = (1 - ls / 1.1) * 0.55
        ctx.strokeStyle = '#cfe3ff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, ls * Math.min(w, h) * 0.9, 0, Math.PI * 2)
        ctx.stroke()
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
  }, [getT])

  // stage + eye blink driver
  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const t = getT()
      setStage(t < CLOSING_T.shatter ? 'flag' : t < CLOSING_T.creed ? 'shatter' : 'creed')
      setCreedExit(t >= CLOSING_T.tvoff - 0.35)
      setShowSubtitle(t >= CLOSING_T.subtitle)

      const le = t - (CLOSING_T.shatter + 1.05)
      if (le < 0) {
        setEyeAperture(0)
      } else if (le < 0.9) {
        setEyeAperture(le < 0.35 ? le / 0.35 : le < 0.5 ? 0.25 : Math.min(1, (le - 0.5) / 0.3 + 0.4))
      } else {
        const p = (le - 0.9) % 2.6
        setEyeAperture(p < 0.14 ? 0.15 : 1)
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [getT])

  const isCreed = stage === 'creed'

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      {/* the cedar grows out of the shattered star and stays as the ground of the frame */}
      {stage !== 'flag' && (
        <div
          className="absolute inset-0"
          style={{
            opacity: isCreed ? 0.4 : 1,
            transform: isCreed ? 'scale(0.94)' : 'scale(1)',
            transition: 'opacity 1.1s ease, transform 1.1s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        >
          <CedarTree getT={getT} startAt={CLOSING_T.cedarSeed} materializeSeconds={2.4} scale={0.82} />
        </div>
      )}

      <div
        aria-hidden="true"
        className="relative z-10 flex h-full flex-col items-center justify-center px-4"
      >
        {stage === 'shatter' && (
          <div style={{ opacity: eyeAperture > 0 ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <div className="hidden sm:block">
              <AsciiEye aperture={eyeAperture} cols={58} rows={18} fontSize="clamp(7px, 0.9vw, 11px)" />
            </div>
            <div className="sm:hidden">
              <AsciiEye aperture={eyeAperture} cols={38} rows={14} fontSize="7px" />
            </div>
          </div>
        )}

        {isCreed && (
          <div
            className="flex w-full max-w-6xl flex-col items-center gap-3 sm:gap-5"
            style={{
              opacity: creedExit ? 0 : 1,
              transform: creedExit ? 'scale(1.04)' : 'scale(1)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            {/* WE ARE — live multicoloured ASCII */}
            <div className="h-[7vh] w-full max-w-md sm:h-[9vh]">
              <AsciiWordmark
                words={['WE', 'ARE']}
                getT={getT}
                startAt={CLOSING_T.creedType}
                maxCell={10}
              />
            </div>

            {/* RATHBONE — the emphasis lockup, larger and hotter */}
            <div className="h-[13vh] w-full sm:h-[17vh]">
              <AsciiWordmark
                words={['RATHBONE']}
                emphasisWord={0}
                getT={getT}
                startAt={CLOSING_T.creedType + 0.55}
                maxCell={18}
              />
            </div>

            {showSubtitle && (
              <div className="flex flex-col items-center gap-2">
                <span
                  className="zio-underline-sweep block h-px w-40 bg-[rgba(255,92,108,0.7)] sm:w-64"
                  style={{ animationDelay: '0.05s' }}
                />
                <p className="zio-fade-up text-center font-mono text-[10px] uppercase tracking-[0.34em] text-[var(--zio-secondary)] sm:text-xs">
                  EXPOSING ZIONIST PROPAGANDA BY NOTICING
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
