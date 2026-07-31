/**
 * Leet glyph system — RESTRICTED SET.
 * Only the three unambiguous letter/digit twins alternate live:
 *   O ↔ 0, I ↔ 1, E ↔ 3
 * Every other letter (A, S, T, B, G, L, Z ...) stays a letter, always.
 * The alternation is two-way: a glyph never settles permanently on the
 * letter or digit form — it keeps flipping between both.
 */

export const LEET_MAP: Record<string, string> = {
  O: '0',
  I: '1',
  E: '3',
}

export const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#$%&@013'

export function scrambleChar(rng: () => number): string {
  return SCRAMBLE_CHARS[Math.floor(rng() * SCRAMBLE_CHARS.length)]
}
