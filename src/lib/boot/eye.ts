/**
 * Procedural ASCII eye — matches the ziopsyop.me logo:
 * lime-green corner lashes, violet dashed sclera texture,
 * violet iris ring with a dark pupil and a "C" highlight gap.
 */

export interface Seg {
  t: string
  c: string // css class
}

const IRIS_CHARS = ['0', 'O', 'o']

export interface EyeFrameOptions {
  cols?: number
  rows?: number
}

/** Build one eye frame at a given aperture (0 closed → 1 open). Returns rows of colored runs. */
export function eyeFrame(aperture: number, opts: EyeFrameOptions = {}): Seg[][] {
  const cols = opts.cols ?? 64
  const rows = opts.rows ?? 21
  const cx = (cols - 1) / 2
  const cy = (rows - 1) / 2
  const a = Math.max(aperture, 0)
  const eyeW = cols * 0.31
  const eyeH = rows * 0.46
  const irisR = Math.min(cols, rows * 2.1) * 0.128
  const pupilR = irisR * 0.55
  const out: Seg[][] = []

  for (let r = 0; r < rows; r++) {
    const rowChars: string[] = []
    const rowCls: string[] = []
    for (let c = 0; c < cols; c++) {
      const dx = c - cx
      const dy = (r - cy) * 2.05
      const d = Math.sqrt(dx * dx + dy * dy)
      let ch = ' '
      let cls = ''

      const openH = Math.max(eyeH * a, 0.001)
      const v = (dx / eyeW) ** 2 + (dy / openH) ** 2

      // Lashes: green clusters past the eye corners
      const lx = Math.abs(dx) - eyeW * 0.82
      if (lx > 0 && lx < eyeW * 0.55) {
        const lashH = (eyeW * 0.55 - lx) * 0.62 * Math.max(a, 0.28)
        if (Math.abs(dy) <= lashH) {
          const inner = lx < eyeW * 0.18
          ch = inner ? '0' : (c + r) % 3 === 0 ? '%' : '0'
          cls = Math.abs(dy) > lashH * 0.66 ? 'zio-eye-lash-dim' : 'zio-eye-lash'
          rowChars.push(ch)
          rowCls.push(cls)
          continue
        }
      }

      if (a < 0.06) {
        // Closed eye: a single lid line
        if (Math.abs(r - cy) < 0.6 && Math.abs(dx) <= eyeW * 1.02) {
          ch = '─'
          cls = 'zio-eye-lid'
        }
        rowChars.push(ch)
        rowCls.push(cls)
        continue
      }

      if (v <= 1) {
        if (d <= pupilR * a + (1 - a) * 0) {
          // pupil: dark, with small crescent highlight upper-left
          const ang = Math.atan2(dy, dx)
          if (d > pupilR * 0.62 && ang > -2.6 && ang < -1.2) {
            ch = '·'
            cls = 'zio-eye-iris-hi'
          } else {
            ch = ' '
          }
        } else if (d <= irisR) {
          // iris ring, with a "C" gap opening toward lower-right
          const ang = Math.atan2(dy, dx)
          const inGap = ang > -0.5 && ang < 0.6 && d > pupilR * 1.05 && d < irisR * 0.92
          if (inGap) {
            ch = ' '
          } else {
            const ring = Math.floor(((d - pupilR) / (irisR - pupilR)) * IRIS_CHARS.length)
            ch = IRIS_CHARS[Math.min(IRIS_CHARS.length - 1, Math.max(0, ring))]
            const topHi = dy < 0 && d > irisR * 0.7
            cls = topHi ? 'zio-eye-iris-hi' : 'zio-eye-iris'
          }
        } else {
          // sclera: dashed texture like the logo
          if (r % 2 === 0 && c % 3 !== 2) {
            ch = '-'
            cls = 'zio-eye-dim'
          }
        }
      } else if (v <= 1.4) {
        // eyelid outline
        ch = r < cy ? '¨' : '˷'
        ch = (c + r) % 2 === 0 ? '-' : ':'
        cls = 'zio-eye-lid'
      }

      rowChars.push(ch)
      rowCls.push(cls)
    }

    // compress into runs of same class
    const segs: Seg[] = []
    let curCls = rowCls[0]
    let buf = rowChars[0]
    for (let i = 1; i < cols; i++) {
      if (rowCls[i] === curCls) {
        buf += rowChars[i]
      } else {
        segs.push({ t: buf, c: curCls })
        curCls = rowCls[i]
        buf = rowChars[i]
      }
    }
    segs.push({ t: buf, c: curCls })
    out.push(segs)
  }
  return out
}

/** Quantized aperture levels so frames can be memoized. */
export const EYE_APERTURES = [0, 0.15, 0.35, 0.55, 0.8, 1]

export function quantizeAperture(a: number): number {
  let best = EYE_APERTURES[0]
  let bd = Infinity
  for (const lvl of EYE_APERTURES) {
    const d = Math.abs(lvl - a)
    if (d < bd) {
      bd = d
      best = lvl
    }
  }
  return best
}
