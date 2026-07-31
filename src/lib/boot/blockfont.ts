/**
 * 5x7 bitmap font used to build large ASCII lettering out of live characters.
 * Covers everything the boot sequence renders as ASCII type, plus the three
 * digit twins (0 / 1 / 3) so O, I and E can alternate in place.
 */

export const BLOCK_ROWS = 7
export const BLOCK_COLS = 5

export const BLOCK_FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '10100', '00100', '00100', '00100', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
}

export interface BlockCell {
  /** grid column / row within the whole rendered line */
  gx: number
  gy: number
  /** index of the source word this cell belongs to (for per-word emphasis) */
  word: number
  /** the plain letter this cell is part of */
  letter: string
  /** 0..1 position across the line, used for wave/gradient timing */
  u: number
}

/**
 * Lay a string of words out on a block grid and return every lit cell.
 * `letterGap` is measured in grid columns.
 */
export function layoutBlockText(words: string[], letterGap = 1, wordGap = 4): {
  cells: BlockCell[]
  cols: number
  rows: number
} {
  const cells: BlockCell[] = []
  let cursor = 0

  words.forEach((word, wordIdx) => {
    for (const rawCh of word) {
      const ch = rawCh.toUpperCase()
      const glyph = BLOCK_FONT[ch] ?? BLOCK_FONT[' ']
      for (let r = 0; r < BLOCK_ROWS; r++) {
        for (let c = 0; c < BLOCK_COLS; c++) {
          if (glyph[r][c] !== '1') continue
          cells.push({ gx: cursor + c, gy: r, word: wordIdx, letter: ch, u: 0 })
        }
      }
      cursor += BLOCK_COLS + letterGap
    }
    if (wordIdx < words.length - 1) cursor += wordGap - letterGap
  })

  const cols = Math.max(1, cursor - letterGap)
  for (const cell of cells) cell.u = cell.gx / cols
  return { cells, cols, rows: BLOCK_ROWS }
}
