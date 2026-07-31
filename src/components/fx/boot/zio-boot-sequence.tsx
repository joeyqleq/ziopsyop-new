'use client'

import {
  BOOT_TOTAL_SECONDS,
  DEFAULT_BOOT_DATA,
  phaseAt,
  type BootDataProps,
  type BootPhaseId,
} from '@/lib/boot/timeline'
import { CLOSING_T } from '@/lib/boot/timeline'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AmbientBackdrop } from './ambient-backdrop'
import { AsciiEye } from './ascii-eye'
import { AsciiField } from './ascii-field'
import { BootProgressRail } from './boot-progress-rail'
import { CedarTree } from './cedar-tree'
import { ClosingScene } from './closing-scene'
import { AcquireScene, ConvergenceScene, SignalScene } from './finale-scenes'
import { BattlefieldScene, MediaScene, NetworkScene } from './forensic-scenes'
import { IntroScene } from './intro-scene'

export interface ZioBootSequenceProps {
  onComplete?: () => void
  onHandoffStart?: () => void
  data?: Partial<BootDataProps>
  totalSeconds?: number
  skipDelaySeconds?: number
  /** Jump straight into the timeline at this second — used by the replay page. */
  startAtSeconds?: number
}

const FORENSIC_PHASES: BootPhaseId[] = ['acquire', 'part1', 'part2', 'part3', 'converge', 'signal']
const CLOSING_PHASES: BootPhaseId[] = ['flag', 'shatter', 'creed', 'tvoff']
const HANDOFF_START_SECONDS = 51

/** Which colour the ambient atmosphere leans into, per phase. */
const PHASE_TONE: Record<string, 'mint' | 'amber' | 'red' | 'violet'> = {
  intro: 'violet',
  acquire: 'mint',
  part1: 'mint',
  part2: 'amber',
  part3: 'red',
  converge: 'violet',
  signal: 'mint',
  flag: 'violet',
  shatter: 'mint',
  creed: 'red',
  tvoff: 'red',
  cedar: 'mint',
}

/**
 * The full 53-second ZioPSYOP boot sequence:
 * 10.5s silent intro (blinking eye + cinematic phrases + Star of David formation),
 * the six-phase forensic storyboard, then the closing act —
 * ASCII flag → star shatter → the eye returns → WE ARE RATHBONE —
 * ending in a CRT knob power-off.
 */
export function ZioBootSequence({
  onComplete,
  onHandoffStart,
  data: dataOverride,
  totalSeconds = BOOT_TOTAL_SECONDS,
  skipDelaySeconds = 1.2,
  startAtSeconds = 0,
}: ZioBootSequenceProps) {
  const data = useMemo(() => ({ ...DEFAULT_BOOT_DATA, ...dataOverride }), [dataOverride])
  const [phase, setPhase] = useState<BootPhaseId>('intro')
  const [railIndex, setRailIndex] = useState(0)
  const [railLabel, setRailLabel] = useState('00 — NOTICE')
  const [progress, setProgress] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [handoff, setHandoff] = useState(false)
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null)

  const startRef = useRef(0)
  const pausedAtRef = useRef<number | null>(null)
  const doneRef = useRef(false)
  const handoffRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const onHandoffStartRef = useRef(onHandoffStart)
  onCompleteRef.current = onComplete
  onHandoffStartRef.current = onHandoffStart

  const clockScale = totalSeconds / BOOT_TOTAL_SECONDS

  const getElapsed = useCallback(() => {
    if (pausedAtRef.current !== null) return pausedAtRef.current
    return (performance.now() - startRef.current) / 1000
  }, [])

  const getBootT = useCallback(
    () => getElapsed() / clockScale,
    [clockScale, getElapsed],
  )

  const beginHandoff = useCallback(() => {
    if (handoffRef.current) return
    handoffRef.current = true
    setHandoff(true)
    onHandoffStartRef.current?.()
  }, [])

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setDismissed(true)
    onCompleteRef.current?.()
  }, [])

  // detect reduced motion before starting the timeline
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  // master clock
  useEffect(() => {
    if (reducedMotion !== false) return
    startRef.current = performance.now() - startAtSeconds * clockScale * 1000
    let raf = 0
    let lastCoarse = -1

    const loop = () => {
      const elapsed = getBootT()
      if (elapsed >= HANDOFF_START_SECONDS) beginHandoff()
      if (elapsed >= BOOT_TOTAL_SECONDS) {
        finish()
        return
      }
      const coarse = Math.floor(elapsed * 5)
      if (coarse !== lastCoarse) {
        lastCoarse = coarse
        const p = phaseAt(elapsed)
        setPhase(p.id)
        setRailIndex(p.railIndex)
        setRailLabel(p.railLabel)
        setProgress(Math.min(1, elapsed / BOOT_TOTAL_SECONDS))
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // pause the clock when the tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        pausedAtRef.current = (performance.now() - startRef.current) / 1000
      } else if (pausedAtRef.current !== null) {
        startRef.current = performance.now() - pausedAtRef.current * 1000
        pausedAtRef.current = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [beginHandoff, clockScale, finish, getBootT, reducedMotion, startAtSeconds])

  // skip control + keyboard
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), skipDelaySeconds * 1000)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        finish()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [skipDelaySeconds, finish])

  // body scroll lock while active
  useEffect(() => {
    if (dismissed) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [dismissed])

  if (dismissed) return null

  const isForensic = FORENSIC_PHASES.includes(phase)
  const isClosing = CLOSING_PHASES.includes(phase)
  const isTvOff = phase === 'tvoff'
  const isCedar = phase === 'cedar'
  const tone = PHASE_TONE[phase] ?? 'mint'

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="ZioPSYOP boot sequence"
      className={`zio-boot-viewport fixed inset-0 z-50 overflow-hidden bg-black ${
        handoff ? 'zio-aperture pointer-events-none' : ''
      }`}
    >
      <p className="sr-only">
        ZioPSYOP forensic investigation: subreddit narratives, battlefield records, and media
        narratives are reconstructed as one evidence system. We are Rathbone — exposing Zionist
        propaganda by noticing.
      </p>

      {/* everything visual lives inside the CRT tube; it collapses on power-off */}
      <div
        className={`zio-scanlines zio-grain zio-vignette absolute inset-0 bg-[var(--zio-bg)] ${
          isTvOff ? 'zio-tv-collapse' : ''
        } ${isCedar ? 'opacity-0' : ''}`}
      >
        {/* persistent atmosphere so the frame is never dead black */}
        {reducedMotion === false && !isTvOff && (
          <AmbientBackdrop
            tone={tone}
            intensity={phase === 'intro' ? 1 : isClosing ? 0.55 : 0.85}
          />
        )}

        {/* corner targeting brackets */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-3 z-30 sm:inset-6 ${
            isClosing ? 'zio-bracket-out' : 'zio-bracket-in'
          }`}
        >
          {(['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'] as const).map(
            (pos) => (
              <span
                key={pos}
                className={`absolute h-5 w-5 border-[rgba(232,234,233,0.25)] sm:h-7 sm:w-7 ${pos}`}
              />
            ),
          )}
        </div>

        {/* top status rail (forensic act only) */}
        {isForensic && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:text-[10px]">
              ZIOPSYOP {'//'} OPEN-SOURCE FORENSIC SYSTEM
            </span>
            <span className="zio-flicker hidden font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--zio-mint)] sm:block sm:text-[10px]">
              ● LIVE RECONSTRUCTION
            </span>
          </div>
        )}

        {/* reduced-motion static composition */}
        {reducedMotion === true && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-4">
            <AsciiEye aperture={1} cols={56} rows={19} fontSize="clamp(7px, 1.1vw, 12px)" />
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-foreground">
                WE ARE <span className="zio-red">RATHBONE</span>
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                Exposing Zionist propaganda by noticing.
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-widest">
                <span className="zio-mint">I {'//'} NARRATIVE</span>
                <span className="zio-amber">II {'//'} BATTLEFIELD</span>
                <span className="zio-red">III {'//'} FRAMES</span>
              </div>
            </div>
            <button
              type="button"
              onClick={finish}
              className="border border-[var(--zio-mint)] px-6 py-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--zio-mint)] transition-colors hover:bg-[var(--zio-mint)] hover:text-[var(--zio-bg)]"
            >
              Enter
            </button>
          </div>
        )}

        {/* animated timeline scenes */}
        {reducedMotion === false && (
          <div className="absolute inset-0 z-10" aria-hidden="true">
            {isForensic && <AsciiField mode="sparse" intensity={0.5} className="opacity-50" />}
            {phase === 'intro' && <IntroScene getT={getBootT} active />}
            {phase === 'acquire' && <AcquireScene />}
            {phase === 'part1' && <NetworkScene data={data} />}
            {phase === 'part2' && <BattlefieldScene data={data} />}
            {phase === 'part3' && <MediaScene data={data} />}
            {phase === 'converge' && <ConvergenceScene />}
            {phase === 'signal' && <SignalScene />}
            {isClosing && <ClosingScene getT={getBootT} />}
          </div>
        )}

        {/* bottom phase rail (hidden once the closing act starts) */}
        {reducedMotion === false && !isClosing && !isCedar && (
          <BootProgressRail railIndex={railIndex} railLabel={railLabel} progress={progress} />
        )}

        {/* skip control */}
        {showSkip && reducedMotion === false && !isTvOff && !isCedar && (
          <button
            type="button"
            onClick={finish}
            className="absolute z-50 min-h-11 border border-[var(--zio-line)] bg-black/65 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--zio-tertiary)] transition-colors hover:border-[var(--zio-mint)] hover:text-foreground focus-visible:border-[var(--zio-mint)] focus-visible:outline-none"
            style={{
              bottom: 'max(1rem, env(safe-area-inset-bottom))',
              right: 'max(1rem, env(safe-area-inset-right))',
            }}
          >
            SKIP INTRO [ESC]
          </button>
        )}
      </div>

      {/* CRT afterglow dot, outside the collapsing tube */}
      {isTvOff && (
        <span
          aria-hidden="true"
          className="zio-tv-dot absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
          style={{
            background: '#eef2ff',
            boxShadow: '0 0 18px 6px rgba(220,230,255,0.9), 0 0 60px 24px rgba(160,190,255,0.4)',
          }}
        />
      )}

      {/* the cedar materialises alone on black — the last frame before handoff */}
      {isCedar && reducedMotion === false && (
        <div aria-hidden="true" className="zio-cedar-breathe absolute inset-0 bg-black">
          <CedarTree
            getT={getBootT}
            startAt={CLOSING_T.cedarSolo}
            materializeSeconds={2.2}
            scale={0.74}
            offsetY={-0.035}
          />
          <div
            className="zio-fade-up pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 sm:bottom-12"
            style={{ animationDelay: '2.6s' }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.45em] text-[rgba(62,214,150,0.75)] sm:text-[10px]">
              MIN LUBNAN
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[rgba(120,140,132,0.7)] sm:text-[9px]">
              ZIOPSYOP.ME
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
