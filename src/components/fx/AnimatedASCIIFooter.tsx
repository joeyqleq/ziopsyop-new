"use client";

// ═══════════════════════════════════════════════════════════════════════════════
//  ZIOPSYOP — AnimatedASCIIFooter  (v3)
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react"
import { SwirlBackground } from "./SwirlBackground"

// ─── Config ────────────────────────────────────────────────────────────────────
const CW = 10   // cell width  px
const CH = 17   // cell height px
const FH = 460  // footer height px
const HR = 65   // mouse heat radius px  (small, tight)
const BP = 4.5  // blink period s

// ─── Char pools ─────────────────────────────────────────────────────────────────
const P_BG  = "!@#$%&*-+=|<>?/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~`.,;:"
const pick  = (s: string) => s[Math.floor(Math.random() * s.length)]

// ─── ZIOPSYOP colour palette ────────────────────────────────────────────────────
const BG   = "#060608"
const C1   = "#0c0f14"  // near-invisible dark
const C4   = "#565b64"  // muted (used for bg text)
const C5   = "#8a8f98"  // muted-fg (used for nav text)
const MINT = "#3ee6c1"  // phosphor mint
const MNTH = "#a8ffe8"  // very bright mint
const LMD  = "#4a7228"  // lime dim  (sclera cold)
const LM   = "#b6ff7c"  // lime      (sclera mid)
const LMH  = "#d8ffab"  // lime hot
const PD   = "#2e1258"  // purple deep (iris cold)
const PM   = "#7b39d0"  // purple      (iris mid)
const PL   = "#b882ff"  // purple light (iris hot)
const WHD  = "#5a6060"  // highlight dim
const WHH  = "#e8eae9"  // highlight hot

// ─── Eye geometry (px from eye centre) ─────────────────────────────────────────
const EAX = 188   // almond semi-major (horizontal)
const EAY = 130   // almond semi-minor (vertical)
const RR  = 88    // outer ring radius
const IR  = 74    // iris radius
const PR  = 46    // pupil radius
const HLR = 20    // highlight spot radius
const HLX = 25    // highlight x-offset (right)
const HLY = -23   // highlight y-offset (up)

type Zone = "bg" | "eye-edge" | "sclera" | "ring-edge" | "ring" | "iris-edge" | "iris" | "pupil" | "hl"

function getZone(ex: number, ey: number, bf: number): Zone {
  const r = Math.hypot(ex, ey)
  const ay = EAY * bf
  if (ay < 0.5) return "bg"
  const sdf_eye = (ex / EAX) ** 2 + (ey / ay) ** 2
  if (sdf_eye >= 1) return "bg"
  if (sdf_eye > 0.88) return "eye-edge"
  if (Math.hypot(ex - HLX, ey - HLY) < HLR) return "hl"
  if (r < PR) return "pupil"
  if (r < IR + 6 && r > IR - 6) return "iris-edge"
  if (r < IR) return "iris"
  if (r < RR + 7 && r > RR - 7) return "ring-edge"
  if (r < RR) return "ring"
  return "sclera"
}

function getColor(z: Zone, heat: number): string {
  switch (z) {
    case "eye-edge":  return heat > 0.5 ? "#f0fff0" : "#c8ffaa"
    case "sclera":    return heat > 0.55 ? LMH : heat > 0.18 ? LM : LMD
    case "ring-edge": return heat > 0.4 ? "#c8fff4" : MNTH
    case "ring":      return heat > 0.4 ? MNTH : MINT
    case "iris-edge": return heat > 0.5 ? "#ede9fe" : "#c4b5fd"
    case "iris":      return heat > 0.55 ? PL : heat > 0.18 ? PM : PD
    case "pupil":     return heat > 0.3 ? PD : "#020108"
    case "hl":        return heat > 0.5 ? WHH : WHD
    default:          return C1  // bg — nearly invisible
  }
}

function getPool(z: Zone): string {
  switch (z) {
    case "eye-edge":  return "/\\|─╭╮╰╯"
    case "sclera":    return "·.,'°˙"
    case "ring-edge": return "○◯Oo"
    case "ring":      return "°˙*+."
    case "iris-edge": return "◉●○◯"
    case "iris":      return "○Oo0"
    case "pupil":     return "@#●▓"
    case "hl":        return "*·"
    default:          return P_BG
  }
}

const eio = (t: number) => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

// ─── Nav links ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Gateway",  href: "/" },
  { label: "Part I",   href: "/part-i" },
  { label: "Analysis", href: "/analysis" },
  { label: "Part II",  href: "/part-ii" },
  { label: "Map",      href: "/map" },
  { label: "Dossier",  href: "/dossier" },
]

// ─── Per-letter animation data for "ZI0PSY0P.ME" ─────────────────────────────
const WORDMARK = "ZI0PSY0P.ME"
const LETTER_CFG = [
  ["Z",  "zl-scalex",  "2.0s",  "0.00s"],
  ["I",  "zl-blink",   "0.82s", "0.30s"],
  ["0",  "zl-rgb",     "3.2s",  "0.10s"],
  ["P",  "zl-dim",     "2.1s",  "0.55s"],
  ["S",  "zl-shake",   "2.8s",  "0.22s"],
  ["Y",  "zl-float",   "3.6s",  "0.70s"],
  ["0",  "zl-rgb",     "2.5s",  "1.30s"],
  ["P",  "zl-dim",     "1.7s",  "0.42s"],
  [".",  "zl-flick",   "0.95s", "0.82s"],
  ["M",  "zl-glow",    "2.4s",  "0.62s"],
  ["E",  "zl-wave",    "1.35s", "0.92s"],
]

// CSS keyframes
const KEYFRAMES = `
@keyframes zl-scalex {
  0%, 38%, 100% { transform: scaleX(1); }
  20% { transform: scaleX(0.86); }
  29% { transform: scaleX(1.05); }
}
@keyframes zl-blink {
  0%, 82%, 88%, 100% { opacity: 1; }
  84% { opacity: 0.08; }
  86% { opacity: 0.7; }
  87% { opacity: 0.35; }
}
@keyframes zl-rgb {
  0%, 74%, 90%, 100% {
    transform: translateX(0);
    text-shadow: 0 0 6px rgba(62,230,193,.55);
    color: #3ee6c1;
  }
  77% {
    transform: translateX(-2px);
    text-shadow: -3px 0 0 #ff4d5e, 3px 0 0 #4ea8ff;
    color: rgba(62,230,193,0);
  }
  81% {
    transform: translateX(2px);
    text-shadow: 3px 0 0 #ff4d5e, -2px 0 0 #4ea8ff;
    color: rgba(62,230,193,0);
  }
  85% {
    transform: translateX(-1px);
    text-shadow: -2px 0 0 #e8b44c, 1px 0 0 #4ea8ff;
    color: rgba(62,230,193,0);
  }
  88% {
    transform: translateX(0);
    text-shadow: 0 0 6px rgba(62,230,193,.55);
    color: #3ee6c1;
  }
}
@keyframes zl-dim {
  0%, 100% { opacity: 1; }
  35%  { opacity: 0.52; }
  68%  { opacity: 0.78; }
  82%  { opacity: 0.9; }
}
@keyframes zl-shake {
  0%, 64%, 80%, 100% { transform: translateX(0); }
  66%  { transform: translateX(-2px); }
  68%  { transform: translateX(3px); }
  70%  { transform: translateX(-2px); }
  72%  { transform: translateX(2px); }
  74%  { transform: translateX(-1px); }
  76%  { transform: translateX(0); }
}
@keyframes zl-float {
  0%, 100% { transform: translateY(0);    opacity: 1;   }
  25%       { transform: translateY(-2px); opacity: 0.88; }
  75%       { transform: translateY(1.5px);opacity: 0.82; }
}
@keyframes zl-flick {
  0%, 44%, 56%, 100% { opacity: 1; }
  48% { opacity: 0.12; }
  50% { opacity: 0.80; }
  52% { opacity: 0.28; }
}
@keyframes zl-glow {
  0%, 100% { text-shadow: 0 0 4px rgba(62,230,193,.25); }
  50%       { text-shadow: 0 0 10px #3ee6c1, 0 0 22px rgba(62,230,193,.38), 0 0 40px rgba(62,230,193,.12); }
}
@keyframes zl-wave {
  0%, 100% { opacity: 1;   }
  33%       { opacity: 0.62; }
  66%       { opacity: 0.86; }
}
`

// Text shadow for legibility over the animated canvas
const SHADOW_HEAVY = "0 0 2px #060608, 0 0 4px #060608, 1px 1px 2px #060608, -1px -1px 2px #060608, 1px -1px 2px #060608, -1px 1px 2px #060608"
const SHADOW_LIGHT = "0 0 3px #060608, 1px 1px 2px #060608, -1px -1px 2px #060608"

// ═══════════════════════════════════════════════════════════════════════════════
export function AnimatedASCIIFooter() {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse     = useRef({ x: -9999, y: -9999 })
  const rafId     = useRef(0)
  const t0        = useRef(0)
  const chars     = useRef<string[]>([])
  const nCols     = useRef(0)
  const nRows     = useRef(0)

  useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const wrap   = wrapRef.current!
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext("2d")!
    ctx.textBaseline = "top"
    t0.current = performance.now()

    const init = (W: number) => {
      canvas.width  = W
      canvas.height = FH
      const c = Math.floor(W / CW)
      const r = Math.floor(FH / CH)
      nCols.current = c
      nRows.current = r
      chars.current = Array.from({ length: c * r }, () => pick(P_BG))
    }

    const ro = new ResizeObserver(entries => {
      const W = entries[0]?.contentRect.width
      if (W) init(W)
    })
    ro.observe(wrap)

    const track = (e: MouseEvent) => {
      const rc = wrap.getBoundingClientRect()
      mouse.current = { x: e.clientX - rc.left, y: e.clientY - rc.top }
    }
    const clear = () => { mouse.current = { x: -9999, y: -9999 } }
    wrap.addEventListener("mousemove", track)
    wrap.addEventListener("mouseleave", clear)

    const frame = (ts: number) => {
      const t  = (ts - t0.current) / 1000

      const C  = nCols.current
      const R  = nRows.current
      const ch = chars.current
      if (!C || !R) { rafId.current = requestAnimationFrame(frame); return }

      const W = canvas.width

      // ── Blink ─────────────────────────────────────────────────────────────
      const CLOSE = 0.16, HOLD = 0.14, OPEN = 0.32
      const bStart = BP - CLOSE - HOLD - OPEN
      const bt = t % BP
      let bf = 1
      if      (bt >= bStart && bt < bStart + CLOSE)
        bf = 1 - eio((bt - bStart) / CLOSE)
      else if (bt >= bStart + CLOSE && bt < bStart + CLOSE + HOLD)
        bf = 0
      else if (bt >= bStart + CLOSE + HOLD)
        bf = eio(Math.min(1, (bt - bStart - CLOSE - HOLD) / OPEN))

      const ECX = W * 0.5
      const ECY = FH * 0.34

      ctx.clearRect(0, 0, W, FH)
      ctx.font = `${CH - 2}px 'JetBrains Mono','Courier New',monospace`

      for (let row = 0; row < R; row++) {
        for (let col = 0; col < C; col++) {
          const i  = row * C + col
          const px = col * CW
          const py = row * CH
          const cx = px + CW / 2
          const cy = py + CH / 2

          const z = getZone(cx - ECX, cy - ECY, bf)

          // ── Mouse heat ────────────────────────────────────────────────────
          const dx   = cx - mouse.current.x
          const dy   = cy - mouse.current.y
          const heat = Math.max(0, 1 - Math.hypot(dx, dy) / HR)

          // ── Scramble: per-zone rates ──────────────────────────────────────
          const scrambleRate = z === "bg" ? 0.003
            : z === "eye-edge" ? 0.001
            : z === "hl" ? 0.002
            : 0.007

          if (Math.random() < scrambleRate + heat * 0.04) {
            ch[i] = pick(getPool(z))
          }

          // ── Alpha ─────────────────────────────────────────────────────────
          let a: number
          switch (z) {
            case "eye-edge":  a = 0.96 + heat * 0.04; break
            case "sclera":    a = 0.82 + heat * 0.12; break
            case "ring-edge": a = 0.98 + heat * 0.02; break
            case "ring":      a = 0.85 + heat * 0.10; break
            case "iris-edge": a = 0.98 + heat * 0.02; break
            case "iris":      a = 0.90 + heat * 0.08; break
            case "pupil":     a = 0.86 + heat * 0.10; break
            case "hl":        a = 1.0; break
            default:          a = 0.04 + heat * 0.20; break  // bg: nearly invisible
          }

          ctx.globalAlpha = Math.min(1, a)
          ctx.fillStyle   = getColor(z, heat)
          ctx.fillText(ch[i], px, py)
        }
      }

      ctx.globalAlpha = 1
      rafId.current = requestAnimationFrame(frame)
    }

    rafId.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId.current)
      ro.disconnect()
      wrap.removeEventListener("mousemove", track)
      wrap.removeEventListener("mouseleave", clear)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      role="contentinfo"
      style={{
        position: "relative", width: "100%", height: FH,
        overflow: "hidden", background: BG, userSelect: "none",
        fontFamily: "'JetBrains Mono','Courier New',monospace",
      }}
    >
      {/* Keyframe definitions */}
      <style>{KEYFRAMES}</style>

      {/* Top hairline */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 1, background: "rgba(232,234,233,0.08)",
      }} />

      {/* Swirl animated background — lime+violet brand dots, clears eye + text area */}
      <SwirlBackground
        clearRadius={200}
        textProtectYFrac={0.60}
        opacity={0.9}
        style={{ zIndex: 1 }}
      />

      {/* ASCII canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, display: "block", zIndex: 2 }}
      />

      {/* Dark gradient behind the text area to lift text off the background */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: Math.round(FH * 0.46),
        background: "linear-gradient(to bottom, transparent, rgba(6,6,8,0.82))",
        zIndex: 5, pointerEvents: "none",
      }} />

      {/* Content overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: Math.round(FH * 0.635),
        zIndex: 10, pointerEvents: "none",
      }}>

        {/* Animated wordmark — each letter has its own animation */}
        <p style={{
          fontSize: 14, fontWeight: 700,
          letterSpacing: "0.35em", textTransform: "uppercase",
          color: MINT, margin: "0 0 5px",
          display: "flex", alignItems: "baseline", gap: 0,
          textShadow: SHADOW_HEAVY,
        }}>
          {LETTER_CFG.map(([, anim, dur, delay], i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                animation: `${anim} ${dur} ${delay} infinite ease-in-out`,
              }}
            >
              {WORDMARK[i]}
            </span>
          ))}
        </p>

        {/* Tagline */}
        <p style={{
          fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#c8cdd6", margin: "0 0 16px",
          textShadow: SHADOW_HEAVY,
        }}>
          Signal From Noise — Influence Operation Forensics
        </p>

        {/* Horizontal divider */}
        <div style={{
          width: "min(520px, 80%)", height: 1,
          background: "linear-gradient(to right, transparent, rgba(62,230,193,0.18), rgba(62,230,193,0.35), rgba(62,230,193,0.18), transparent)",
          margin: "0 0 16px",
        }} aria-hidden="true" />

        {/* Navigation */}
        <nav
          aria-label="Footer navigation"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            flexWrap: "wrap", justifyContent: "center",
            margin: "0 0 14px", pointerEvents: "auto",
          }}
        >
          {NAV_LINKS.map((item, i) => (
            <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <a
                href={item.href}
                style={{
                  fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
                  color: C5, textDecoration: "none", transition: "color 0.2s",
                  textShadow: SHADOW_HEAVY,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = MINT }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C5 }}
              >
                {item.label}
              </a>
              {i < NAV_LINKS.length - 1 && (
                <span style={{ color: C4, fontSize: 10 }}>·</span>
              )}
            </span>
          ))}
        </nav>

        {/* Second hairline divider before legal text */}
        <div style={{
          width: "min(400px, 70%)", height: 1,
          background: "linear-gradient(to right, transparent, rgba(86,91,100,0.22), rgba(86,91,100,0.38), rgba(86,91,100,0.22), transparent)",
          margin: "2px 0 12px",
        }} aria-hidden="true" />

        {/* Disclaimer */}
        <p style={{
          fontSize: 9, lineHeight: 1.75, textAlign: "center",
          color: "#9aa0aa", maxWidth: 460, padding: "0 24px", margin: "0 0 12px",
          textShadow: SHADOW_LIGHT,
        }}>
          All data sourced from publicly available Reddit archives via the Arctic Shift API. Analysis covers
          r/ForbiddenBromance from September 2019 through March 2026. Methodology, raw data and source code
          are open — verify everything yourself.
        </p>

        {/* Status */}
        <p style={{
          fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase",
          color: "#8a8f98", margin: 0,
          textShadow: SHADOW_LIGHT,
        }}>
          [ Dataset Live — Metadata Update Daily ]
        </p>
      </div>
    </div>
  )
}
