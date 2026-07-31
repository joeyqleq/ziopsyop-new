'use client'

import { eyeFrame, quantizeAperture, type Seg } from '@/lib/boot/eye'
import { useMemo } from 'react'
import { AsciiPre } from './ascii-pre'

const frameCache = new Map<string, Seg[][]>()

function getFrame(aperture: number, cols: number, rows: number): Seg[][] {
  const q = quantizeAperture(aperture)
  const key = `${q}:${cols}:${rows}`
  let f = frameCache.get(key)
  if (!f) {
    f = eyeFrame(q, { cols, rows })
    frameCache.set(key, f)
  }
  return f
}

/** The ziopsyop.me ASCII eye at a given aperture (0 closed → 1 open). */
export function AsciiEye({
  aperture,
  cols = 64,
  rows = 21,
  fontSize,
  className,
}: {
  aperture: number
  cols?: number
  rows?: number
  fontSize?: string
  className?: string
}) {
  const frame = useMemo(() => getFrame(aperture, cols, rows), [aperture, cols, rows])
  return <AsciiPre rows={frame} className={className} fontSize={fontSize} />
}
