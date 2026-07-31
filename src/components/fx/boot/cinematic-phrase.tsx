'use client'

import { LEET_MAP, SCRAMBLE_CHARS } from '@/lib/boot/leet'
import { mulberry32 } from '@/lib/boot/wordmark'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RathboneSvg } from './rathbone-svg'

/**
 * Cinematic phrase engine.
 * — Entrance: per-character scramble decode, center-out cascade, 3D rise + blur.
 * — Hold: only O/I/E alternate letter↔digit (0/1/3), two-way forever,
 *   flashing mint on each flip; a shimmer sweep passes over the lockup.
 * — Exit: per-character glitch dissolve, center-out.
 * — Emphasis word (RATHBONE): rendered as a layered SVG wordmark —
 *   draw-on outline, grain-displaced gradient body, chromatic ghosts,
 *   specular sweep, scanline texture, targeting furniture — slammed in
 *   after the base line resolves, with one screen shake on lock.
 */

interface CharSpec {
  ch: string
  leet?: string
  globalIdx: number
}

interface WordSpec {
  chars: CharSpec[]
}

export interface CinematicPhraseProps {
  text: string
  emphasis?: string
  exiting?: boolean
  size?: 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES: Record<NonNullable<CinematicPhraseProps['size']>, string> = {
  md: 'clamp(1.05rem, 4vw, 2.4rem)',
  lg: 'clamp(1.3rem, 5vw, 3.1rem)',
  xl: 'clamp(1.7rem, 6.6vw, 4.4rem)',
}

const FLIP_TICK_MS = 90
const FLIP_PROB = 0.06
const FLASH_MS = 190

function hashPhrase(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function CinematicPhrase({ text, emphasis, exiting = false, size = 'md', className }: CinematicPhraseProps) {
  const { words, total } = useMemo(() => {
    let idx = 0
    const words: WordSpec[] = text
      .split(' ')
      .filter(Boolean)
      .map((w) => ({
        chars: w.split('').map((ch) => ({
          ch,
          leet: LEET_MAP[ch.toUpperCase()],
          globalIdx: idx++,
        })),
      }))
    return { words, total: idx }
  }, [text])

  // per-char timing (ms): center-out cascade
  const timing = useMemo(() => {
    const rng = mulberry32(hashPhrase(`${text}:${total}`))
    const mid = (total - 1) / 2
    const resolveAt: number[] = []
    const exitDelay: number[] = []
    for (const w of words) {
      for (const c of w.chars) {
        resolveAt[c.globalIdx] = 240 + Math.abs(c.globalIdx - mid) * 42 + rng() * 70
        exitDelay[c.globalIdx] = Math.abs(c.globalIdx - total / 2) * 20
      }
    }
    const baseDoneAt = 240 + mid * 42 + 260
    return { resolveAt, exitDelay, baseDoneAt }
  }, [text, words, total])

  // emphasis SVG enters after the base line resolves; shake once its draw-on lands
  const emphInAt = timing.baseDoneAt + 180
  const emphDoneAt = emphInAt + 1250

  const [disp, setDisp] = useState<Array<{ c: string; settled: boolean; flash: boolean }>>(() =>
    words.flatMap((w) => w.chars.map((c) => ({ c: c.ch, settled: false, flash: false }))),
  )
  const [emphIn, setEmphIn] = useState(false)
  const [emphDone, setEmphDone] = useState(false)
  const leetOnRef = useRef<boolean[]>([])
  const flashUntilRef = useRef<number[]>([])

  useEffect(() => {
    const flat = words.flatMap((w) => w.chars)
    leetOnRef.current = flat.map((c) => Boolean(c.leet) && Math.random() < 0.5)
    flashUntilRef.current = flat.map(() => 0)
    const start = performance.now()
    let stopped = false

    const id = setInterval(() => {
      if (stopped) return
      const now = performance.now()
      const t = now - start
      setDisp(
        flat.map((c, i) => {
          const settled = t >= timing.resolveAt[i]
          if (!settled) {
            return {
              c: SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
              settled: false,
              flash: false,
            }
          }
          // living leet alternation — O/I/E only, flips both ways forever
          if (c.leet && !exiting && Math.random() < FLIP_PROB) {
            leetOnRef.current[i] = !leetOnRef.current[i]
            flashUntilRef.current[i] = now + FLASH_MS
          }
          const useLeet = c.leet ? leetOnRef.current[i] : false
          return {
            c: useLeet && c.leet ? c.leet : c.ch,
            settled: true,
            flash: now < flashUntilRef.current[i],
          }
        }),
      )
      if (emphasis) {
        if (t >= emphInAt) setEmphIn(true)
        if (t >= emphDoneAt) setEmphDone(true)
      }
    }, FLIP_TICK_MS)

    return () => {
      stopped = true
      clearInterval(id)
    }
  }, [words, timing, exiting, emphasis, emphInAt, emphDoneAt])

  const hasEmph = Boolean(emphasis)

  return (
    <div
      aria-hidden="true"
      className={`relative flex flex-col items-center ${emphDone && !exiting ? 'zio-shake' : ''} ${className ?? ''}`}
      style={{ perspective: '600px' }}
    >
      <p
        className="flex flex-wrap items-baseline justify-center gap-x-[0.6em] gap-y-2 text-center font-mono font-bold uppercase text-foreground"
        style={{ fontSize: SIZES[size], letterSpacing: '0.12em', lineHeight: 1.15 }}
      >
        {words.map((w, wi) => (
          <span key={wi} className="relative inline-block whitespace-nowrap">
            {w.chars.map((c) => {
              const d = disp[c.globalIdx]
              const settled = d?.settled ?? false
              const shown = d?.c ?? c.ch
              const flash = d?.flash ?? false
              return (
                <span
                  key={c.globalIdx}
                  className={exiting ? 'zio-char-out' : 'zio-char-in'}
                  style={{
                    animationDelay: exiting
                      ? `${timing.exitDelay[c.globalIdx]}ms`
                      : `${Math.max(0, timing.resolveAt[c.globalIdx] - 260)}ms`,
                    color: flash ? 'var(--zio-mint)' : settled ? undefined : 'var(--zio-tertiary)',
                    textShadow: flash ? '0 0 12px rgba(62,230,193,0.7)' : undefined,
                    transition: 'color 120ms linear',
                  }}
                >
                  {shown}
                </span>
              )
            })}
          </span>
        ))}
      </p>

      {/* emphasis: SVG RATHBONE lockup on its own line */}
      {hasEmph && (
        <div
          className={`mt-[0.35em] w-full ${exiting ? 'zio-char-out' : emphIn ? 'zio-slam' : 'opacity-0'}`}
          style={{
            maxWidth: `min(88vw, ${size === 'xl' ? '640px' : size === 'lg' ? '540px' : '460px'})`,
            animationDelay: exiting ? '80ms' : undefined,
          }}
        >
          {emphIn && <RathboneSvg />}
        </div>
      )}

      {/* shimmer sweep across the settled lockup */}
      {!exiting && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <span
            className="zio-shimmer absolute inset-y-0 w-1/4"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(232,234,233,0.07), transparent)',
              animationDelay: hasEmph ? '1.6s' : '1.1s',
            }}
          />
        </span>
      )}
    </div>
  )
}
