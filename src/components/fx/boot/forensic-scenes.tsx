'use client'

import type { Seg } from '@/lib/boot/eye'
import type { BootDataProps } from '@/lib/boot/timeline'
import { mulberry32 } from '@/lib/boot/wordmark'
import { useEffect, useRef, useState } from 'react'
import { AsciiPre } from './ascii-pre'

/* ---------- shared chrome ---------- */

function SceneChrome({
  numeral,
  title,
  sub,
  question,
  accentClass,
  data,
  children,
}: {
  numeral: string
  title: string
  sub: string
  question: string
  accentClass: string
  data: string[]
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 flex min-h-0 flex-col items-center justify-start gap-3 overflow-hidden px-3 pb-[max(4.75rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,env(safe-area-inset-top))] sm:justify-center sm:gap-6 sm:px-4 sm:py-16">
      <div className="zio-fade-up flex shrink-0 flex-col items-center gap-1 text-center">
        <h2
          className={`max-w-[92vw] text-balance font-mono text-sm font-bold uppercase tracking-[0.14em] sm:text-2xl sm:tracking-[0.22em] ${accentClass}`}
        >
          {numeral} {'//'} {title}
        </h2>
        <p className="max-w-[88vw] text-balance font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs sm:tracking-[0.4em]">
          {sub}
        </p>
      </div>

      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden sm:max-h-[46vh] sm:flex-none">
        {children}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1.5 text-center sm:gap-2">
        <p
          className="zio-fade-up max-w-[94vw] text-pretty font-sans text-[11px] leading-snug text-foreground sm:text-base"
          style={{ animationDelay: '0.5s', textWrap: 'balance' }}
        >
          {question}
        </p>
        <div
          className="zio-fade-up flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
          style={{ animationDelay: '1s' }}
        >
          {data.map((d) => (
            <span
              key={d}
              className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--zio-tertiary)] sm:text-[10px] sm:tracking-[0.18em]"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   PART I — THE MANUFACTURED FRIEND (the subreddit operation)
   Beat 1: a Reddit-style thread feed of "friendship" posts scrolls in
   Beat 2: an activation timeline — 7 accounts light up simultaneously
   Beat 3: the account network resolves — 22 subjects, 261 edges
   ================================================================ */

const REDDIT_POSTS: Array<{ up: string; user: string; body: string; flag: boolean }> = [
  { up: '▲ 847', user: 'u/ce**r_lb', body: 'we love our israeli neighbors, politics aside', flag: false },
  { up: '▲ 612', user: 'u/tlv**dove', body: 'lebanese food is the best!! much love from tel aviv', flag: false },
  { up: '▲ 1.2k', user: 'u/be**ut4peace', body: 'ordinary people just want peace. both sides.', flag: true },
  { up: '▲ 954', user: 'u/ga**il_h', body: 'my grandmother was from beirut. we are cousins really', flag: true },
  { up: '▲ 733', user: 'u/no**h_border', body: 'this sub proves coexistence is possible', flag: true },
]

function ThreadFeed({ visible }: { visible: boolean }) {
  return (
    <div
      className="flex w-[min(88vw,480px)] flex-col gap-1.5 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="flex items-baseline justify-between border-b border-[var(--zio-line)] pb-1 font-mono text-[10px] uppercase tracking-[0.25em]">
        <span className="zio-mint">r/█████████████</span>
        <span className="text-muted-foreground">SORT: HOT</span>
      </div>
      {REDDIT_POSTS.map((p, i) => (
        <div
          key={p.user}
          className="zio-fade-up flex items-start gap-2 font-mono text-[10px] leading-relaxed sm:text-[11px]"
          style={{ animationDelay: `${i * 0.18}s` }}
        >
          <span className="shrink-0 text-[var(--zio-amber)]">{p.up}</span>
          <span className={`shrink-0 ${p.flag ? 'zio-red' : 'text-muted-foreground'}`}>{p.user}</span>
          <span className="truncate text-[var(--zio-tertiary)]">{p.body}</span>
          {p.flag && <span className="zio-red shrink-0 text-[8px] tracking-widest">[FLAGGED]</span>}
        </div>
      ))}
      <div className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="zio-red inline-block h-1.5 w-1.5 rounded-full bg-[var(--zio-red)]" />
        BEHAVIORAL FINGERPRINT ANALYSIS RUNNING…
      </div>
    </div>
  )
}

/* activation timeline: 7 account rows, one shared spike column */
const ACT_ROWS = 7
const ACT_COLS = 34
const SPIKE_AT = 22

function ActivationTimeline({ visible }: { visible: boolean }) {
  const [col, setCol] = useState(0)
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => setCol((c) => Math.min(c + 1, ACT_COLS)), 70)
    return () => clearInterval(id)
  }, [visible])
  const rng = mulberry32(99)
  const rows: Seg[][] = []
  for (let r = 0; r < ACT_ROWS; r++) {
    let quiet = ''
    for (let c = 0; c < Math.min(col, ACT_COLS); c++) {
      if (c === SPIKE_AT) quiet += '█'
      else if (Math.abs(c - SPIKE_AT) === 1 && col > SPIKE_AT) quiet += '▓'
      else quiet += rng() < 0.12 ? '▪' : '·'
    }
    rows.push([
      { t: `ACCT_${String(r + 1).padStart(2, '0')} `, c: 'zio-tertiary-c' },
      { t: quiet.slice(0, SPIKE_AT - 1), c: 'zio-eye-dim' },
      { t: quiet.slice(SPIKE_AT - 1), c: col > SPIKE_AT ? 'zio-red' : 'zio-eye-dim' },
    ])
  }
  return (
    <div className="transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
      <AsciiPre rows={rows} fontSize="clamp(8px, 1.3vw, 13px)" />
      {col > SPIKE_AT && (
        <p className="zio-fade-up mt-2 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--zio-red)]">
          7-USER SIMULTANEOUS ACTIVATION EVENT
        </p>
      )}
    </div>
  )
}

/* network graph — same as before but denser labels */
function gridToSegs(chars: string[][], cls: string[][]): Seg[][] {
  return chars.map((row, r) => {
    const segs: Seg[] = []
    let cur = cls[r][0]
    let buf = row[0]
    for (let i = 1; i < row.length; i++) {
      if (cls[r][i] === cur) buf += row[i]
      else {
        segs.push({ t: buf, c: cur })
        cur = cls[r][i]
        buf = row[i]
      }
    }
    segs.push({ t: buf, c: cur })
    return segs
  })
}

function emptyGrid(cols: number, rows: number): { ch: string[][]; cl: string[][] } {
  return {
    ch: Array.from({ length: rows }, () => Array(cols).fill(' ')),
    cl: Array.from({ length: rows }, () => Array(cols).fill('')),
  }
}

function buildNetwork(cols = 56, rows = 13): Seg[][] {
  const rng = mulberry32(42)
  const { ch, cl } = emptyGrid(cols, rows)
  const nodes: Array<[number, number]> = []
  while (nodes.length < 9) {
    const x = 3 + Math.floor(rng() * (cols - 8))
    const y = 1 + Math.floor(rng() * (rows - 3))
    if (nodes.every(([nx, ny]) => Math.abs(nx - x) > 7 || Math.abs(ny - y) > 2)) nodes.push([x, y])
  }
  const put = (x: number, y: number, c: string, k: string) => {
    if (y >= 0 && y < rows && x >= 0 && x < cols && ch[y][x] === ' ') {
      ch[y][x] = c
      cl[y][x] = k
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    const [x0, y0] = nodes[i]
    const [x1, y1] = nodes[(i + 3) % nodes.length]
    for (let x = Math.min(x0, x1) + 1; x < Math.max(x0, x1); x++) put(x, y0, '─', 'zio-mint-dim')
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) put(x1, y, '│', 'zio-mint-dim')
  }
  for (const [x, y] of nodes) {
    if (x > 0) {
      ch[y][x - 1] = '('
      cl[y][x - 1] = 'zio-mint-dim'
    }
    ch[y][x] = '@'
    cl[y][x] = 'zio-mint'
    if (x < cols - 1) {
      ch[y][x + 1] = ')'
      cl[y][x + 1] = 'zio-mint-dim'
    }
  }
  return gridToSegs(ch, cl)
}

const NETWORK = buildNetwork()

export function NetworkScene({ data }: { data: BootDataProps }) {
  const [beat, setBeat] = useState<0 | 1 | 2>(0)
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 1900)
    const t2 = setTimeout(() => setBeat(2), 3600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])
  return (
    <SceneChrome
      numeral="I"
      title="The Manufactured Friend"
      sub="The Subreddit Operation — Narrative Forensics"
      question="A GRASSROOTS FRIENDSHIP — OR AN ENGINEERED ONE? // MANUFACTURES CONSENT"
      accentClass="zio-mint"
      data={[
        `${data.artifactCount} ARTIFACTS ANALYZED`,
        '22 SUBJECTS · 261 EDGES MAPPED',
        '3:1 ISRAELI–LEBANESE FLAIR RATIO',
      ]}
    >
      <div aria-hidden="true" className="relative flex items-center justify-center">
        <div className={beat === 0 ? '' : 'absolute inset-0'}>
          <ThreadFeed visible={beat === 0} />
        </div>
        <div className={beat === 1 ? '' : 'absolute inset-0 flex items-center justify-center'}>
          <ActivationTimeline visible={beat === 1} />
        </div>
        <div
          className={`transition-opacity duration-500 ${beat === 2 ? '' : 'absolute inset-0 flex items-center justify-center'}`}
          style={{ opacity: beat === 2 ? 1 : 0 }}
        >
          <div className="relative">
            <AsciiPre rows={NETWORK} fontSize="clamp(7px, 1.15vw, 13px)" />
            {[
              [18, 22],
              [58, 48],
              [40, 70],
            ].map(([top, left], i) => (
              <span
                key={i}
                className="zio-pulse-ring absolute block h-8 w-8 rounded-full border border-[var(--zio-mint)]"
                style={{ top: `${top}%`, left: `${left}%`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--zio-mint)]">
              COORDINATED INAUTHENTIC BEHAVIOR — HIGH CONFIDENCE
            </p>
          </div>
        </div>
      </div>
    </SceneChrome>
  )
}

/* ================================================================
   PART II — THE MOST MORAL ARMY (the battlefield ledger)
   FPV drone HUD: live telemetry, drifting terrain, crosshair jitter,
   target-lock brackets, REC dot — then the ledger stamps over it.
   ================================================================ */

const FPV_ROWS = 13
const FPV_COLS = 60

function buildTerrainFrame(offset: number): Seg[][] {
  const rows: Seg[][] = []
  const horizon = 4
  const targetX = 34 + Math.round(Math.sin(offset * 0.09) * 5)
  for (let r = 0; r < FPV_ROWS; r++) {
    const rng = mulberry32(r * 131 + 7)
    let line = ''
    for (let c = 0; c < FPV_COLS; c++) {
      // sample a horizontally scrolling noise field
      const s = mulberry32((r * 977 + ((c + offset) % 4096)) * 31)()
      if (r === horizon) {
        line += c % 9 === (offset % 9) ? '╱' : '─'
        continue
      }
      if (r === 8 && Math.abs(c - targetX) <= 2) {
        line += c === targetX ? '▲' : '▓'
        continue
      }
      if (r === 9 && Math.abs(c - targetX) <= 4) {
        line += c === targetX ? '█' : '▒'
        continue
      }
      const depth = Math.max(0, (r - horizon) / (FPV_ROWS - horizon - 1))
      const occupancy = r < horizon ? 0.1 : 0.31 + depth * 0.18
      if (s < occupancy * 0.3) line += '▓'
      else if (s < occupancy * 0.58) line += '▒'
      else if (s < occupancy * 0.78) line += '░'
      else if (s < occupancy * 0.91) line += rng() > 0.5 ? '/' : '\\'
      else if (s < occupancy) line += '·'
      else line += ' '
    }
    rows.push([{ t: line, c: 'zio-eye-dim' }])
  }
  return rows
}

const FPV_TELEMETRY_L = ['ALT 214M', 'SPD 138KM/H', 'HDG 173°', 'BAT ▓▓▓░ 71%']
const FPV_TELEMETRY_R = ['LINK -67dBm', 'GPS 33.27N 35.20E', 'CAM IR/EO', 'ARM HOT']

function FpvHud({ data }: { data: BootDataProps }) {
  const [offset, setOffset] = useState(0)
  const [locked, setLocked] = useState(false)
  const jitter = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const id = setInterval(() => {
      setOffset((o) => o + 1)
      jitter.current = { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 4 }
    }, 90)
    const lockT = setTimeout(() => setLocked(true), 2400)
    return () => {
      clearInterval(id)
      clearTimeout(lockT)
    }
  }, [])
  return (
    <div aria-hidden="true" className="relative">
      <AsciiPre rows={buildTerrainFrame(offset)} fontSize="clamp(7px, 1.1vw, 13px)" />

      {/* HUD frame */}
      <div className="pointer-events-none absolute inset-0 font-mono">
        {/* REC */}
        <div className="absolute left-1 top-0 flex items-center gap-1.5 text-[9px] tracking-[0.25em] text-[var(--zio-red)]">
          <span className="zio-flicker inline-block h-1.5 w-1.5 rounded-full bg-[var(--zio-red)]" />
          REC
        </div>
        <div className="absolute right-1 top-0 text-[9px] tracking-[0.2em] text-[var(--zio-amber)]">
          FPV-07 ▸ SOUTHERN SECTOR
        </div>

        {/* telemetry columns */}
        <div className="absolute left-1 top-1/2 flex -translate-y-1/2 flex-col gap-1 text-[8px] leading-none tracking-wider text-[var(--zio-amber)] opacity-95 sm:text-[9px]">
          {FPV_TELEMETRY_L.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col items-end gap-1 text-[8px] leading-none tracking-wider text-[var(--zio-amber)] opacity-95 sm:text-[9px]">
          {FPV_TELEMETRY_R.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* crosshair with jitter */}
        <div
          className="absolute left-1/2 top-1/2 text-[var(--zio-amber)]"
          style={{
            transform: `translate(calc(-50% + ${jitter.current.x}px), calc(-50% + ${jitter.current.y}px))`,
          }}
        >
          <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
            <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
            <span className="absolute right-0 top-1/2 h-px w-4 bg-current" />
            <span className="absolute left-1/2 top-0 h-4 w-px bg-current" />
            <span className="absolute bottom-0 left-1/2 h-4 w-px bg-current" />
            <span className="text-[10px]">+</span>
            {locked && (
              <>
                <span className="zio-bracket-in absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-[var(--zio-red)]" />
                <span className="zio-bracket-in absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-[var(--zio-red)]" />
                <span className="zio-bracket-in absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-[var(--zio-red)]" />
                <span className="zio-bracket-in absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-[var(--zio-red)]" />
              </>
            )}
          </div>
          {locked && (
            <p className="mt-1 text-center text-[8px] tracking-[0.3em] text-[var(--zio-red)]">LOCK</p>
          )}
        </div>

        {/* bottom ledger stamps */}
        {locked && (
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-[8px] uppercase tracking-[0.18em] text-[var(--zio-amber)] sm:text-[9px]">
            <span className="zio-fade-up" style={{ animationDelay: '0.1s' }}>
              {data.documentedEventCount} STRIKES CATALOGUED
            </span>
            <span className="zio-fade-up" style={{ animationDelay: '0.4s' }}>
              COST ASYMMETRY 15,000:1
            </span>
            <span className="zio-fade-up" style={{ animationDelay: '0.7s' }}>
              19 IRON DOME UNITS DESTROYED
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function BattlefieldScene({ data }: { data: BootDataProps }) {
  return (
    <SceneChrome
      numeral="II"
      title="The Most Moral Army"
      sub="The Battlefield Ledger — Battlefield Forensics"
      question="THE CLAIM, MEASURED AGAINST THE DOCUMENTED RECORD // MANUFACTURES MORAL LICENSE"
      accentClass="zio-amber"
      data={[
        `${data.documentedEventCount} DOCUMENTED STRIKES`,
        'IHL COMPLIANCE: ONE SIDE IN VIOLATION',
        `SOURCE STREAMS: ${data.sourceStreamCount}`,
      ]}
    >
      <FpvHud data={data} />
    </SceneChrome>
  )
}

/* ================================================================
   PART III — THE MANUFACTURED REALITY (the media battlefield)
   Split-screen: CH 14 (narrative feed) vs AL-MANAR (field record),
   the same event marker enters both panes; a contradiction ticker
   runs lie-by-lie underneath.
   ================================================================ */

function buildPane(seed: number, cols = 24, rows = 9): Seg[][] {
  const rng = mulberry32(seed)
  const lines: Seg[][] = []
  for (let r = 0; r < rows; r++) {
    let body = ''
    let cls = 'zio-tertiary-c'
    if (r === 3 && seed % 2 === 0) {
      body = '░'.repeat(Math.floor(cols * (0.3 + rng() * 0.5))) // omission block
      cls = 'zio-eye-dim'
    } else {
      const len = Math.floor(cols * (0.35 + rng() * 0.6))
      body = (rng() > 0.5 ? '=' : '≈').repeat(len)
    }
    lines.push([{ t: body.padEnd(cols).slice(0, cols), c: cls }])
  }
  return lines
}

const PANE_A = buildPane(11)
const PANE_B = buildPane(24)

const CONTRADICTIONS = [
  'CH14: "TOTAL VICTORY IN THE NORTH" — RECORD: 19 IRON DOME UNITS LOST',
  'CH14: "PRECISION STRIKE, NO CIVILIANS" — FIELD: RESIDENTIAL BLOCK LEVELED',
  'CH14: "DETERRENCE RESTORED" — RECORD: 665 STRIKES ANSWERED IN KIND',
  'CH14: "THE ENEMY IS BROKEN" — FIELD: LAUNCH SITES ACTIVE AT DAWN',
]

function BroadcastPane({
  label,
  sub,
  rows,
  accent,
  delay,
  className,
}: {
  label: string
  sub: string
  rows: Seg[][]
  accent: string
  delay: string
  className?: string
}) {
  return (
    <div
      className={`zio-fade-up relative border border-[var(--zio-line)] p-2 ${className ?? ''}`}
      style={{ animationDelay: delay }}
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${accent}`}>{label}</span>
        <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground">{sub}</span>
      </div>
      <div className="relative overflow-hidden">
        <AsciiPre rows={rows} fontSize="clamp(7px, 1.05vw, 12px)" />
        <span className="zio-red absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xs">▲</span>
        <span className="zio-scan-bar absolute left-0 h-px w-full bg-[var(--zio-red)] opacity-50" />
      </div>
    </div>
  )
}

export function MediaScene({ data }: { data: BootDataProps }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((l) => (l + 1) % CONTRADICTIONS.length), 1400)
    return () => clearInterval(id)
  }, [])
  return (
    <SceneChrome
      numeral="III"
      title="The Manufactured Reality"
      sub="The Media Battlefield — Narrative Forensics"
      question="ONE TELLS ISRAEL WHAT TO BELIEVE. ONE DOCUMENTS WHAT HAPPENED. // MANUFACTURES PERMISSION"
      accentClass="zio-red"
      data={[
        `${data.mediaStreamCount} MEDIA ARMS ANALYZED`,
        `PERIOD COVERED: ${data.mediaWindow}`,
        'COMPARED LIE BY LIE · DAY BY DAY',
      ]}
    >
      <div aria-hidden="true" className="flex flex-col items-center gap-3">
        <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-muted-foreground sm:hidden">
          {tick % 2 === 0 ? 'FEED A // DOMESTIC CLAIM' : 'FEED B // FIELD RECORD'}
        </p>
        <div className="flex min-h-0 flex-wrap items-stretch justify-center gap-3 sm:gap-6">
          <BroadcastPane
            label="CHANNEL 14"
            sub="DOMESTIC NARRATIVE"
            rows={PANE_A}
            accent="zio-red"
            delay="0.1s"
            className={tick % 2 === 0 ? 'block sm:block' : 'hidden sm:block'}
          />
          <div className="zio-fade-up hidden flex-col items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:flex" style={{ animationDelay: '0.4s' }}>
            <span>VS</span>
            <span className="mt-1 h-8 w-px bg-[var(--zio-line)]" />
          </div>
          <BroadcastPane
            label="AL-MANAR"
            sub="FIELD RECORD"
            rows={PANE_B}
            accent="zio-amber"
            delay="0.25s"
            className={tick % 2 === 1 ? 'block sm:block' : 'hidden sm:block'}
          />
        </div>
        <p
          key={tick}
          className="zio-fade-up max-w-[min(88vw,560px)] text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-[var(--zio-red)] sm:text-[10px]"
        >
          {'>> '}
          {CONTRADICTIONS[tick]}
        </p>
      </div>
    </SceneChrome>
  )
}
