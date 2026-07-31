'use client'

import type { Seg } from '@/lib/boot/eye'
import { memo } from 'react'

/** Renders rows of colored character runs inside a <pre>. Purely decorative. */
export const AsciiPre = memo(function AsciiPre({
  rows,
  className,
  fontSize,
}: {
  rows: Seg[][]
  className?: string
  fontSize?: string
}) {
  return (
    <pre
      aria-hidden="true"
      className={`font-mono leading-[1.05] select-none ${className ?? ''}`}
      style={fontSize ? { fontSize } : undefined}
    >
      {rows.map((segs, i) => (
        <div key={i} className="whitespace-pre">
          {segs.map((s, j) =>
            s.c ? (
              <span key={j} className={s.c}>
                {s.t}
              </span>
            ) : (
              <span key={j}>{s.t}</span>
            ),
          )}
        </div>
      ))}
    </pre>
  )
})
