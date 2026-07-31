'use client'

import { RAIL_PHASES } from '@/lib/boot/timeline'

/** Bottom rail: six labeled phases + current phase caption + progress. */
export function BootProgressRail({
  railIndex,
  railLabel,
  progress,
}: {
  railIndex: number
  railLabel: string
  progress: number // 0..1 across the full 40s
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground sm:text-[10px]">
          {railLabel}
        </span>
        <span className="font-mono text-[9px] tabular-nums text-[var(--zio-tertiary)] sm:text-[10px]">
          {String(Math.round(progress * 100)).padStart(3, '0')}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        {RAIL_PHASES.map((p, i) => {
          const idx = i + 1
          const state = idx < railIndex ? 'done' : idx === railIndex ? 'active' : 'todo'
          return (
            <div key={p} className="flex flex-1 flex-col gap-1">
              <div
                className="h-px w-full transition-colors duration-500"
                style={{
                  backgroundColor:
                    state === 'done'
                      ? 'var(--zio-mint)'
                      : state === 'active'
                        ? 'var(--zio-mint)'
                        : 'rgba(232,234,233,0.12)',
                  opacity: state === 'done' ? 0.5 : 1,
                }}
              />
              <span
                className="hidden font-mono text-[8px] uppercase tracking-[0.15em] sm:block"
                style={{
                  color:
                    state === 'active'
                      ? 'var(--zio-mint)'
                      : state === 'done'
                        ? 'var(--zio-muted)'
                        : 'var(--zio-tertiary)',
                }}
              >
                {p}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
