/**
 * ZioPSYOP boot sequence master timeline.
 * Total runtime: 53 seconds.
 *   0.0 – 10.5  Silent intro: blinking ASCII eye + three cinematic phrases + Star of David formation
 *  10.5 – 13.0  01/06 ACQUIRE
 *  13.0 – 18.0  02/06 PART I   — THE MANUFACTURED FRIEND
 *  18.0 – 23.5  03/06 PART II  — THE MOST MORAL ARMY
 *  23.5 – 29.0  04/06 PART III — THE MANUFACTURED REALITY
 *  29.0 – 34.0  05/06 CONVERGENCE
 *  34.0 – 37.5  06/06 SIGNAL FROM NOISE
 *  37.5 – 40.0  CLOSING I   — ASCII flag fills the screen
 *  40.0 – 42.5  CLOSING II  — the star shatters; the eye returns; the cedar begins to grow
 *  42.5 – 47.5  CLOSING III — WE ARE RATHBONE, in live multicoloured ASCII
 *  47.5 – 48.9  OUTRO       — CRT knob power-off
 *  48.9 – 53.0  CEDAR       — the cedar materialises alone on black, then hands off
 */

export const BOOT_TOTAL_SECONDS = 53

export type BootPhaseId =
  | 'intro'
  | 'acquire'
  | 'part1'
  | 'part2'
  | 'part3'
  | 'converge'
  | 'signal'
  | 'flag'
  | 'shatter'
  | 'creed'
  | 'tvoff'
  | 'cedar'

export interface BootPhase {
  id: BootPhaseId
  start: number
  end: number
  railIndex: number // 0 = intro (unlabeled), 1..6 = labeled phases
  railLabel: string
}

export const BOOT_PHASES: BootPhase[] = [
  { id: 'intro', start: 0, end: 10.5, railIndex: 0, railLabel: '00 — NOTICE' },
  { id: 'acquire', start: 10.5, end: 13, railIndex: 1, railLabel: '01 / 06 — ACQUIRE' },
  { id: 'part1', start: 13, end: 18, railIndex: 2, railLabel: '02 / 06 — MAP THE NARRATIVE' },
  { id: 'part2', start: 18, end: 23.5, railIndex: 3, railLabel: '03 / 06 — RECONCILE THE BATTLEFIELD' },
  { id: 'part3', start: 23.5, end: 29, railIndex: 4, railLabel: '04 / 06 — COMPARE THE FRAMES' },
  { id: 'converge', start: 29, end: 34, railIndex: 5, railLabel: '05 / 06 — CORRELATE THE SYSTEM' },
  { id: 'signal', start: 34, end: 37.5, railIndex: 6, railLabel: '06 / 06 — DECLASSIFY' },
  { id: 'flag', start: 37.5, end: 40, railIndex: 6, railLabel: 'THE APPARATUS' },
  { id: 'shatter', start: 40, end: 42.5, railIndex: 6, railLabel: 'THE NOTICING' },
  { id: 'creed', start: 42.5, end: 47.5, railIndex: 6, railLabel: 'WE ARE RATHBONE' },
  { id: 'tvoff', start: 47.5, end: 48.9, railIndex: 6, railLabel: 'SIGNING OFF' },
  { id: 'cedar', start: 48.9, end: 53, railIndex: 6, railLabel: 'LEBANON' },
]

/** Closing act absolute times (used by the closing scene canvas). */
export const CLOSING_T = {
  flag: 37.5,
  shatter: 40,
  /** the cedar starts growing out of the shattered star */
  cedarSeed: 40.9,
  creed: 42.5,
  /** the multicoloured ASCII creed lockup starts materialising */
  creedType: 42.9,
  subtitle: 44.6,
  tvoff: 47.5,
  /** the cedar re-materialises alone on black after the CRT dies */
  cedarSolo: 49.15,
  end: 53,
} as const

export const RAIL_PHASES = [
  '01 ACQUIRE',
  '02 NARRATIVE',
  '03 BATTLEFIELD',
  '04 FRAMES',
  '05 CORRELATE',
  '06 DECLASSIFY',
]

export function phaseAt(elapsed: number): BootPhase {
  for (const p of BOOT_PHASES) {
    if (elapsed < p.end) return p
  }
  return BOOT_PHASES[BOOT_PHASES.length - 1]
}

/**
 * Intro phrases — stored as plain English; the cinematic phrase engine
 * live-alternates every substitutable letter with its digit twin.
 */
export interface IntroPhrase {
  text: string
  emphasis?: string
  at: number
  until: number
}

export const INTRO_PHRASES: IntroPhrase[] = [
  { text: 'ZIONIST KRYPTONITE IS THE NOTICING', at: 3.2, until: 6.2 },
  { text: 'WE ARE KRYPTONITE', at: 6.2, until: 8.2 },
  { text: 'WE ARE RE', emphasis: 'RATHBONE', at: 8.2, until: 10.5 },
]

/** How long a phrase keeps rendering after `until` so its exit animation can play. */
export const PHRASE_EXIT_SECONDS = 0.42

/** Intro blink schedule: [time, aperture pairs]. Eye starts to "notice". */
export const BLINK_KEYFRAMES: Array<[number, number]> = [
  [0.0, 0.0],
  [0.5, 0.0],
  [1.0, 0.55],
  [1.25, 0.15],
  [1.5, 0.8],
  [1.75, 1.0],
  [2.6, 1.0],
  [2.75, 0.1],
  [2.9, 1.0],
  [4.4, 1.0],
  [4.55, 0.15],
  [4.7, 1.0],
  [6.3, 1.0],
  [6.42, 0.1],
  [6.55, 1.0],
  [8.3, 1.0],
  [8.42, 0.2],
  [8.55, 1.0],
  [10.5, 1.0],
]

export function apertureAt(t: number): number {
  const kf = BLINK_KEYFRAMES
  if (t <= kf[0][0]) return kf[0][1]
  for (let i = 0; i < kf.length - 1; i++) {
    const [t0, a0] = kf[i]
    const [t1, a1] = kf[i + 1]
    if (t >= t0 && t <= t1) {
      const f = t1 === t0 ? 0 : (t - t0) / (t1 - t0)
      return a0 + (a1 - a0) * f
    }
  }
  return kf[kf.length - 1][1]
}

export interface BootDataProps {
  artifactCount: string
  observationWindow: string
  documentedEventCount: string
  sourceStreamCount: string
  mediaStreamCount: string
  mediaWindow: string
  lastUpdated: string
}

export const DEFAULT_BOOT_DATA: BootDataProps = {
  artifactCount: '102,610',
  observationWindow: '2019 — 2026',
  documentedEventCount: '665',
  sourceStreamCount: '5',
  mediaStreamCount: '3',
  mediaWindow: '2023 — 2026',
  lastUpdated: 'CASE STATUS: ACTIVE',
}
