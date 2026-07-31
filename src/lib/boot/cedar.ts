/**
 * Procedural Lebanese cedar (Cedrus libani) — the flag of Lebanon mark,
 * expressed as a density field so it can be sampled into a live ASCII grid.
 *
 * Built from the vector reference: a broad triangular crown made of stacked,
 * drooping bough layers with serrated frond silhouettes, over a short trunk
 * that flares into a root base.
 *
 * `cedarDensity(u, v)` takes normalised coords in the cedar's bounding box
 * (u: 0 = left, 1 = right; v: 0 = crown tip, 1 = root base) and returns:
 *   0            outside the tree
 *   0.01 – 0.45  frond fringe / sparse outer needles
 *   0.45 – 1.0   solid bough or trunk mass
 */

const CROWN_TOP = 0.015
const CROWN_BOTTOM = 0.775
const TRUNK_TOP = 0.7

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * The bough tiers, traced off the flag artwork. Each tier is a pair of boughs
 * sweeping out from the spine. `v` is the height of the tier's attachment to
 * the trunk, `reach` its half-span, `rise` how much the tip lifts above the
 * attachment (cedar boughs sweep *up* at the ends), and `thick` its vertical
 * mass at the spine.
 */
const TIERS: Array<{ v: number; reach: number; rise: number; thick: number; skew: number }> = [
  { v: 0.075, reach: 0.085, rise: 0.012, thick: 0.045, skew: 0.0 },
  { v: 0.14, reach: 0.145, rise: 0.018, thick: 0.05, skew: 0.06 },
  { v: 0.225, reach: 0.215, rise: 0.024, thick: 0.055, skew: -0.05 },
  { v: 0.315, reach: 0.275, rise: 0.03, thick: 0.058, skew: 0.04 },
  { v: 0.415, reach: 0.335, rise: 0.034, thick: 0.06, skew: -0.03 },
  { v: 0.515, reach: 0.385, rise: 0.038, thick: 0.062, skew: 0.05 },
  { v: 0.615, reach: 0.435, rise: 0.042, thick: 0.064, skew: -0.04 },
  { v: 0.71, reach: 0.475, rise: 0.046, thick: 0.062, skew: 0.02 },
]

/** Overall silhouette clamp: the classic wide-shouldered cedar triangle. */
function crownHalfWidth(vv: number) {
  const k = Math.pow(Math.max(0, vv), 0.82)
  return 0.05 + 0.46 * k
}

export function cedarDensity(u: number, v: number): number {
  const x = u - 0.5

  // ---- trunk + root flare -------------------------------------------------
  let trunk = 0
  if (v > TRUNK_TOP) {
    const tv = (v - TRUNK_TOP) / (1 - TRUNK_TOP) // 0 at top of trunk, 1 at base
    // a straight bole that flares hard into the root plate
    const flare = 0.05 + 0.145 * Math.pow(tv, 3.4)
    const d = Math.abs(x)
    if (d < flare) {
      trunk = 0.66 + 0.34 * (1 - d / flare)
      // vertical bark grain
      const grain = Math.sin(x * 190) * 0.5 + 0.5
      trunk *= 0.76 + 0.24 * grain
      // root notches at the very bottom so the base reads as roots, not a slab
      if (tv > 0.74) {
        const notch = Math.sin((x + 0.5) * 47) * 0.5 + 0.5
        if (notch < 0.42) trunk *= 0.18
      }
    }
  }

  // ---- crown: overlapping upswept boughs ----------------------------------
  let crown = 0
  if (v >= CROWN_TOP && v <= CROWN_BOTTOM + 0.03) {
    const vv = Math.max(0, (v - CROWN_TOP) / (CROWN_BOTTOM - CROWN_TOP))
    const silhouette = crownHalfWidth(vv)
    const ax = Math.abs(x)

    for (let i = 0; i < TIERS.length; i++) {
      const t = TIERS[i]
      // mirrored boughs, each side skewed slightly for an organic, hand-drawn feel
      const side = x >= 0 ? 1 : -1
      const reach = t.reach * (1 + side * t.skew * 0.5)
      if (ax > reach * 1.06) continue

      const rel = ax / reach // 0 at spine, 1 at frond tip
      // the bough's centre-line: dips slightly then sweeps up toward the tip
      const centre =
        t.v + Math.sin(rel * Math.PI) * 0.012 - Math.pow(rel, 2.1) * t.rise * (1 + rel * 0.6)

      // serrated frond edge, phase-shifted per tier and per side
      const phase = i * 2.399 + (side > 0 ? 0 : 1.17)
      const serrate =
        Math.sin(rel * 34 + phase) * 0.0055 + Math.sin(rel * 71 - phase * 1.7) * 0.0028

      // thickness tapers from the spine out to a fine tip
      const halfThick = (t.thick * (1 - Math.pow(rel, 1.35) * 0.82)) / 2 + serrate
      if (halfThick <= 0) continue

      const dv = Math.abs(v - centre)
      if (dv > halfThick * 1.25) continue

      const vertical = 1 - smoothstep(halfThick * 0.55, halfThick * 1.25, dv)
      const radial = 1 - smoothstep(0.72, 1.06, rel)
      let d = vertical * (0.4 + 0.6 * radial)

      // needle texture along the bough so it never looks like a filled wedge
      const needle = Math.sin(rel * 88 + i * 1.31 + (side > 0 ? 0 : 0.9)) * 0.5 + 0.5
      d *= 0.74 + 0.26 * needle

      // hard clamp: nothing survives outside the cedar outline
      if (ax > silhouette * 1.02) continue
      crown = Math.max(crown, Math.max(0, Math.min(1, d)))
    }

    // sparse needle haze filling the gaps between tiers, kept inside the outline
    if (crown < 0.16 && ax < silhouette * 0.98 && vv > 0.06) {
      const haze =
        Math.sin((x + 0.5) * 121 + v * 190) * 0.5 +
        0.5 +
        (Math.sin((x + 0.5) * 57 - v * 96) * 0.5 + 0.5)
      if (haze > 1.42) crown = Math.max(crown, 0.1 + (haze - 1.42) * 0.22)
    }

    // central spine of the crown, tying the tiers together
    if (ax < 0.02 && v > 0.055) crown = Math.max(crown, 0.72)
  }

  return Math.max(crown, trunk)
}

/** True where the cedar mass belongs to the trunk/roots (rendered in bark tones). */
export function isCedarTrunk(v: number, u: number): boolean {
  if (v <= TRUNK_TOP + 0.02) return false
  return Math.abs(u - 0.5) < 0.2
}

/** Glyph ramp used for the cedar: sparse fringe → dense mass. */
export const CEDAR_RAMP = ['.', ':', 'o', 'c', 'e', 'd', 'a', 'r', '0', 'O', '@']

/** Characters that cycle inside the cedar body so the tree is never static. */
export const CEDAR_CHURN = 'oO0.:cedarCEDAR#%@*+='
