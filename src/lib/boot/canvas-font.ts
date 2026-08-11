export function resolveCanvasMonoFont() {
  if (typeof window === 'undefined') return '"JetBrains Mono", ui-monospace, monospace'
  const loaded = getComputedStyle(document.documentElement).getPropertyValue('--font-jet').trim()
  return loaded
    ? `${loaded}, "JetBrains Mono", ui-monospace, monospace`
    : '"JetBrains Mono", ui-monospace, monospace'
}
