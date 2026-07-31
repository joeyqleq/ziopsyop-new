'use client'

import { useId } from 'react'

/**
 * RATHBONE — high-polish SVG wordmark.
 * Layer stack (back to front):
 *   1. Halo      — heavy gaussian red glow, slow breathing pulse
 *   2. Ghost R/B — chromatic aberration layers (red/cyan) drifting in opposition
 *   3. Body      — crimson vertical gradient fill, grain-displaced via feTurbulence
 *   4. Outline   — stroke draw-on (dashoffset animation), then fades to a hairline
 *   5. Shimmer   — masked specular sweep passing across the glyphs
 *   6. Scanlines — CRT texture clipped to the glyph shapes
 *   7. Furniture — corner targeting brackets + underline sweep + side ticks
 * Entirely self-contained: all animation lives inside the SVG.
 */

const WORD = 'RATHBONE'
const VB_W = 760
const VB_H = 150
const TEXT_Y = 112
const TEXT_LEN = 700

const textCommon = {
  x: VB_W / 2,
  y: TEXT_Y,
  textAnchor: 'middle' as const,
  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
  fontSize: 104,
  fontWeight: 700,
  letterSpacing: 10,
  textLength: TEXT_LEN,
  lengthAdjust: 'spacingAndGlyphs' as const,
}

export function RathboneSvg({ className }: { className?: string }) {
  const instanceId = useId().replace(/:/g, '')
  const fillId = `rb-fill-${instanceId}`
  const sheenId = `rb-sheen-${instanceId}`
  const grainId = `rb-grain-${instanceId}`
  const haloId = `rb-halo-${instanceId}`
  const scanId = `rb-scan-${instanceId}`
  const textMaskId = `rb-text-mask-${instanceId}`

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={className}
      role="img"
      aria-label="RATHBONE"
      style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b78" />
          <stop offset="46%" stopColor="#ff4d5e" />
          <stop offset="54%" stopColor="#e03246" />
          <stop offset="100%" stopColor="#8f1d2c" />
        </linearGradient>

        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* grain texture: turbulence displaces the glyph body slightly */}
        <filter id={grainId} x="-8%" y="-20%" width="116%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.7" numOctaves="2" seed="7" result="noise">
            <animate attributeName="seed" values="7;8;9;10;7" dur="0.9s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <filter id={haloId} x="-40%" y="-120%" width="180%" height="340%">
          <feGaussianBlur stdDeviation="14" />
        </filter>

        <pattern id={scanId} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="#000" fillOpacity="0.28" />
        </pattern>

        <mask id={textMaskId}>
          <text {...textCommon} fill="#fff">
            {WORD}
          </text>
        </mask>
      </defs>

      <style>{`
        @keyframes rb-draw { from { stroke-dashoffset: 1400; } to { stroke-dashoffset: 0; } }
        @keyframes rb-fill-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rb-outline-settle { from { opacity: 1; } to { opacity: 0.35; } }
        @keyframes rb-halo-pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 0.95; } }
        @keyframes rb-ghost-r { 0%,88%,100% { transform: translate(0,0); opacity:.0; } 90% { transform: translate(-5px,1px); opacity:.75; } 93% { transform: translate(3px,-2px); opacity:.55; } 96% { transform: translate(-2px,0); opacity:.65; } }
        @keyframes rb-ghost-c { 0%,88%,100% { transform: translate(0,0); opacity:.0; } 90% { transform: translate(5px,-1px); opacity:.7; } 93% { transform: translate(-3px,2px); opacity:.5; } 96% { transform: translate(2px,0); opacity:.6; } }
        @keyframes rb-sweep { 0% { transform: translateX(-780px); } 60%,100% { transform: translateX(780px); } }
        @keyframes rb-underline { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes rb-tick { 0%,100% { opacity: .35; } 50% { opacity: .9; } }
        .rb-draw { stroke-dasharray: 1400; animation: rb-draw 1.05s cubic-bezier(.3,0,.2,1) both, rb-outline-settle .5s ease 1.5s both; }
        .rb-body { animation: rb-fill-in .6s ease .55s both; }
        .rb-halo { animation: rb-fill-in .8s ease .7s both, rb-halo-pulse 2.4s ease-in-out 1.5s infinite; }
        .rb-gr { animation: rb-ghost-r 3.8s linear 1.6s infinite; }
        .rb-gc { animation: rb-ghost-c 3.8s linear 1.6s infinite; }
        .rb-sweep { animation: rb-sweep 3.2s cubic-bezier(.4,0,.2,1) 1.4s infinite; }
        .rb-ul { transform-origin: 30px 100%; animation: rb-underline .55s cubic-bezier(.2,.8,.2,1) 1.25s both; }
        .rb-fur { animation: rb-fill-in .4s ease 1.15s both; }
        .rb-tick { animation: rb-tick 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rb-draw, .rb-body, .rb-halo, .rb-gr, .rb-gc, .rb-sweep, .rb-ul, .rb-fur, .rb-tick { animation: none !important; opacity: 1; stroke-dashoffset: 0; }
        }
      `}</style>

      {/* 1 — halo */}
      <text {...textCommon} className="rb-halo" fill="#ff4d5e" filter={`url(#${haloId})`}>
        {WORD}
      </text>

      {/* 2 — chromatic ghosts */}
      <text {...textCommon} className="rb-gr" fill="#ff2440" opacity="0">
        {WORD}
      </text>
      <text {...textCommon} className="rb-gc" fill="#37e6ff" opacity="0">
        {WORD}
      </text>

      {/* 3 — grain-displaced gradient body */}
      <g filter={`url(#${grainId})`}>
        <text {...textCommon} className="rb-body" fill={`url(#${fillId})`}>
          {WORD}
        </text>
      </g>

      {/* 4 — draw-on outline */}
      <text {...textCommon} className="rb-draw" fill="none" stroke="#ffb3bb" strokeWidth="1.4">
        {WORD}
      </text>

      {/* 5 — specular sweep, clipped to glyphs */}
      <g mask={`url(#${textMaskId})`}>
        <rect className="rb-sweep" x="0" y="0" width="120" height={VB_H} fill={`url(#${sheenId})`} />
      </g>

      {/* 6 — scanline texture clipped to glyphs */}
      <g mask={`url(#${textMaskId})`}>
        <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#${scanId})`} />
      </g>

      {/* 7 — furniture */}
      <g className="rb-fur" stroke="#ff4d5e" strokeWidth="2.5" fill="none">
        <path d="M6 34 L6 10 L30 10" />
        <path d={`M${VB_W - 30} 10 L${VB_W - 6} 10 L${VB_W - 6} 34`} />
        <path d={`M6 ${VB_H - 34} L6 ${VB_H - 10} L30 ${VB_H - 10}`} />
        <path d={`M${VB_W - 30} ${VB_H - 10} L${VB_W - 6} ${VB_H - 10} L${VB_W - 6} ${VB_H - 34}`} />
      </g>
      <g className="rb-fur">
        <rect className="rb-tick" x="-16" y={VB_H / 2 - 1} width="10" height="2" fill="#ff4d5e" />
        <rect className="rb-tick" x={VB_W + 6} y={VB_H / 2 - 1} width="10" height="2" fill="#ff4d5e" style={{ animationDelay: '0.9s' }} />
      </g>
      <rect className="rb-ul" x="30" y={TEXT_Y + 16} width={VB_W - 60} height="4" fill="#ff4d5e" />
    </svg>
  )
}
