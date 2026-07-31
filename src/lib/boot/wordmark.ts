/** 5x7 block glyphs for the ZI0PSY0P wordmark. Both O letters are zeroes. */

const GLYPHS: Record<string, string[]> = {
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
}

/**
 * Render a word into a character grid.
 * Zero glyphs are drawn with '0', all other letters with '█'.
 */
export function renderWordmark(word: string, gap = 1): string[] {
  const rows: string[] = []
  for (let r = 0; r < 7; r++) {
    let line = ''
    for (const ch of word) {
      const g = GLYPHS[ch]
      if (!g) {
        line += ' '.repeat(5 + gap)
        continue
      }
      const fill = ch === '0' ? '0' : '█'
      for (const bit of g[r]) line += bit === '1' ? fill : ' '
      line += ' '.repeat(gap)
    }
    rows.push(line.trimEnd().padEnd(word.length * (5 + gap)))
  }
  return rows
}

export const WORDMARK_ROWS = renderWordmark('ZI0PSY0P')

/** Tiny deterministic RNG (mulberry32) so generated ASCII scenes are stable. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const NOISE_CHARS = '.:+/\\|[]{}01#%@=*-·'
