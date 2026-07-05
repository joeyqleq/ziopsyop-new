# ZIOPSYOP — Design System

> **Signal From Noise.** A classified-terminal dossier aesthetic for a forensic,
> evidence-first investigation. The whole site reads like a declassified
> intelligence file: dark, monospaced, framed with corner brackets and
> scanlines, with a single phosphor-mint "signal" cutting through the noise.

The site is built on **one thesis, two co-equal pillars**:

- **Part I — THE MANUFACTURED FRIEND** (the subreddit operation → manufactures *consent*). Accent: **phosphor mint**.
- **Part II — THE MOST MORAL ARMY** (the battlefield ledger → manufactures *moral license*). Accent: **archive amber / yellow**.

The home page is a neutral **gateway** that forks into the two pillars with equal visual weight.

---

## 1. Brand & Voice

| Aspect | Direction |
| --- | --- |
| Personality | Forensic, sober, unflinching. Reads like evidence, not opinion. |
| Tone | Declarative and cold. "The conversation was never organic." |
| Metaphor | A classified dossier / terminal readout. Every chart is an *exhibit*. |
| Wordmark | `ZI0PSY0P` — the two **O**s are rendered as glitching **0**s (see §7). |
| Never | No emojis, no gradients as primary elements, no decorative blobs. |

---

## 2. Color System

Dark-first. Five core roles + neutrals + two logo-derived accents. Colors are
defined as CSS variables in `src/app/globals.css` under `:root`, then mapped to
Tailwind via `@theme inline`.

### Core palette

| Token | Hex | Role |
| --- | --- | --- |
| `--background` | `#060608` | Near-black page base |
| `--surface` | `#0a0a0e` | Card / panel base |
| `--surface-2` | `#101016` | Raised surface, scrollbar thumb |
| `--foreground` | `#e8eae9` | Primary text (off-white) |
| `--muted` | `#8a8f98` | Secondary text |
| `--muted-2` | `#565b64` | Tertiary text / metadata |
| `--border` | `rgba(232,234,233,0.08)` | Hairline borders |
| `--border-strong` | `rgba(232,234,233,0.16)` | Emphasized borders |

### Signal colors (semantic — use sparingly)

| Token | Hex | Meaning |
| --- | --- | --- |
| `--primary` | `#3ee6c1` | **Phosphor mint** — the signal / truth / Part I |
| `--threat` | `#ff4d5e` | **Threat red** — the operation / danger / active |
| `--archive` | `#e8b44c` | **Archive amber** — evidence / Part II |

Each has a `-dim` variant at `0.14` alpha for fills and active-state backgrounds
(`--primary-dim`, `--threat-dim`, `--archive-dim`).

### Chart & accent extensions

| Token | Hex | Usage |
| --- | --- | --- |
| `--viz-blue` | `#5b9bff` | Data-viz series only |
| `--viz-violet` | `#a78bfa` | Data-viz series only |
| `--accent-blue` | `#4ea8ff` | Logo-derived accent (glitch blue channel, light touches) |
| `--accent-yellow` | `#ffd23f` | Logo-derived accent (glitch yellow channel, Part II CTAs) |

> **Rule:** treat mint / red / amber as meaning, not decoration. Blue and yellow
> are *light touches* pulled from the eye logo — accents and the glitch wordmark,
> never body surfaces.

### Tailwind class names

Colors are exposed as `bg-*` / `text-*` / `border-*` utilities:
`background`, `surface`, `surface-2`, `foreground`, `muted`, `muted-2`,
`borderc` (note: **not** `border`), `primary`, `threat`, `archive`,
`viz-blue`, `viz-violet`, `accent-blue`, `accent-yellow`.

Always pair a background override with a matching text override for contrast.
Never use raw `bg-white` / `bg-black` / `text-white` — go through tokens.

---

## 3. Typography

Two families only, both loaded via `next/font/google` in `src/app/layout.tsx`.

| Family | Variable | Tailwind | Usage |
| --- | --- | --- | --- |
| **Space Grotesk** | `--font-grotesk` | `font-sans` | Headings, wordmark, body |
| **JetBrains Mono** | `--font-jet` | `font-mono` | Labels, codes, data, stamps, chart text |

### Conventions

- **Monospace is the "system voice."** Section codes, timestamps, stat labels,
  classified stamps, ticker, nav items, and all chart axis text use `font-mono`.
- Uppercase + wide tracking for labels: `tracking-[0.2em]` … `tracking-[0.4em]`.
- Big display headings use `font-mono` at `clamp()` sizes with tight leading,
  e.g. hero: `text-[clamp(3rem,11vw,7.5rem)] leading-none tracking-[0.06em]`.
- Body copy: `text-sm`/`text-base`, `leading-relaxed`, `text-balance` /
  `text-pretty` on titles and important lines.
- Small mono labels typically `text-[9px]`–`text-[11px]`.

---

## 4. Layout & Spacing

- **Mobile-first**, enhanced with `md:` / `lg:` prefixes.
- **Flexbox first**, CSS grid only for true 2-D exhibit galleries.
- Spacing uses the Tailwind scale (`p-4`, `gap-6`, `py-24`) — avoid arbitrary px.
- Use `gap-*` for spacing between flex/grid children; never mix margin + gap on
  the same element, never use `space-*`.
- Content max-width container with generous vertical rhythm between sections
  (`py-20`–`py-28`). Each exhibit is a framed card in a responsive grid.

---

## 5. Signature Components & Motifs

These are what make the site feel like ZIOPSYOP. Reuse them; don't reinvent.

### Traced card (`.traced-card` / `<TracedCard>`)
Frosted-glass panel (`backdrop-blur`, `surface` @ 78%) with a **1px border that
lights up around the cursor** via a masked radial gradient tracking `--mx`/`--my`
(set by JS on mousemove). A faint interior spotlight follows the cursor too.
Trace color is set per-card via `--trace-color` (defaults to mint; use threat /
amber to signal context).

### Corner brackets (`.bracket-corners` + `.bc`)
Four L-shaped corner ticks that frame a card like a targeting reticle. They grow
from 10px → 18px and adopt `--trace-color` on hover. Core dossier framing motif.

### Chart frame (`<ChartFrame>`)
The standard exhibit wrapper: an eyebrow/exhibit code, title, accent color,
and a **commentary line** explaining what the chart *means*. Every data
visualization is presented as a numbered exhibit with a plain-language takeaway
("what this proves"), never a bare chart.

### Glitch wordmark (`<GlitchWordmark>`) — see §7.

### Part doors (`<PartDoors>`)
Two mirror-image gateway cards (Part I mint / Part II amber-yellow) with giant
roman-numeral watermarks, a signature stat, and an ENTER affordance. Equal
footprint = equal importance.

### Classified stamp (`.stamp`)
Tiny bordered uppercase mono tag (e.g. `CASE STATUS: ACTIVE`, exhibit codes).

### Terminal caret (`.caret`) & DecryptText
Blinking `▌` caret and scramble-in text reveals reinforce the terminal feel.

### CRT overlay (`.crt-overlay`)
Fixed full-screen scanline layer (`z-70`, `mix-blend-overlay`) applied globally
in the root layout for a subtle film-grain / CRT texture.

---

## 6. Motion

Powered by `framer-motion` + CSS keyframes. Motion is purposeful, never bouncy.

| Effect | Where |
| --- | --- |
| `ticker` (42s linear marquee, pause on hover) | Hero status ticker |
| `caret-blink` (1.1s steps) | Terminal caret |
| `pulse-ring` / `.pulse-marker` | Live map markers (threat red) |
| `pulse-soft` | Ambient "live" indicators |
| `nav-ink` | Active nav-link underline scale-in |
| Entrance transitions | `opacity`/`y`/`blur` with `ease:[0.22,1,0.36,1]` |

**Accessibility:** a global `prefers-reduced-motion` block collapses all
animation/transition durations to ~0. Honor it — don't hard-code infinite
animations that ignore it.

---

## 7. The Glitch Wordmark (`ZI0PSY0P`)

The identity centerpiece. The **O**s become **0**s that glitch continuously:

- **RGB channel split** using the logo accents — a **blue** (`--accent-blue`)
  layer drifting up-left, sliced from the top; a **yellow** (`--accent-yellow`)
  layer drifting down-right, sliced from the bottom (`mix-blend-mode: screen`).
- **Scanline flicker** (`gw-flicker`, 4.2s) — brief opacity dropouts.
- **Slice tear** (`gw-tear`, 5.5s) — intermittent horizontal displacement bands.
- Blue glow via layered `text-shadow`.

Used at three scales via the `<GlitchWordmark>` component: hero (huge),
nav brand (13px), and footer (11px). The plain string `ZIOPSYOP` is kept in an
`sr-only` `<h1>` for accessibility while the glitch layer is decorative.

---

## 8. Iconography & Imagery

- Icons: **lucide-react**, consistent sizing (16 / 20 / 24px). No emojis as icons.
- The eye logo (green/purple) is the mascot; its blue+yellow are echoed only as
  the glitch/accent touches — the logo itself is not recolored.
- Maps use **Leaflet** with a custom dark theme (`.leaflet-container` etc.),
  never hand-drawn SVG geography.
- Charts use **Recharts**; all chart text is mono via `.recharts-text`, tooltips
  use `.chart-tooltip` (near-black, strong border, mono).
- Placeholders: `/placeholder.svg?height={h}&width={w}`.

---

## 9. Controls & States

- **Segmented toggle** (`.seg-toggle`): mono uppercase pills for switching chart
  views. Active state uses the accent's `-dim` background + glow text-shadow;
  a `.seg-threat` variant switches the active color to threat red.
- **Scrollbar**: 8px, `surface-2` thumb, mint on hover.
- **Selection**: mint background, dark green text.
- **Links / hover**: shift to `foreground`, subtle mint glow (`.glow-primary`)
  or threat glow (`.glow-threat`) for emphasis.

---

## 10. Quick Reference — Do / Don't

**Do**
- Keep the palette to the defined tokens; let mint/red/amber carry meaning.
- Frame data as numbered exhibits with a plain-language "what this proves" line.
- Use mono for all system/label/data text; Space Grotesk for prose and display.
- Keep Part I and Part II visually equal.
- Respect `prefers-reduced-motion`.

**Don't**
- Introduce new hues, gradients-as-primary, or purple/violet outside charts.
- Use `bg-white`/`text-black` or arbitrary px spacing.
- Let blue/yellow spread beyond the wordmark and accent touches.
- Ship a chart without context / a takeaway.
- Use emojis anywhere in the UI.

---

*Source of truth: `src/app/globals.css` (tokens, motifs, keyframes) and
`src/app/layout.tsx` (fonts, metadata). Update this file when those change.*
