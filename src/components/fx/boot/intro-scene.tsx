'use client'

import { apertureAt, INTRO_PHRASES, PHRASE_EXIT_SECONDS } from '@/lib/boot/timeline'
import { useEffect, useRef, useState } from 'react'
import { AsciiEye } from './ascii-eye'
import { AsciiField, type FieldMode } from './ascii-field'
import { CinematicPhrase } from './cinematic-phrase'

/**
 * 0–10.5s silent intro:
 * — the ziopsyop.me ASCII eye blinks awake ("starting to notice")
 * — three cinematic phrases decode in underneath with living leet alternation
 * — background ASCII flies everywhere, briefly forms the Star of David, then crumbles
 */
export function IntroScene({ getT, active }: { getT: () => number; active: boolean }) {
  const [aperture, setAperture] = useState(0)
  const [phraseIdx, setPhraseIdx] = useState(-1)
  const [exiting, setExiting] = useState(false)
  const [fieldMode, setFieldMode] = useState<FieldMode>('drift')
  const rafRef = useRef(0)

  useEffect(() => {
    if (!active) return
    let last = 0
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop)
      if (now - last < 50) return
      last = now
      const t = getT()
      setAperture(apertureAt(t))

      // active phrase incl. its exit window
      let idx = -1
      let exit = false
      for (let i = 0; i < INTRO_PHRASES.length; i++) {
        const p = INTRO_PHRASES[i]
        const isLast = i === INTRO_PHRASES.length - 1
        const renderUntil = isLast ? p.until : p.until + PHRASE_EXIT_SECONDS
        if (t >= p.at && t < renderUntil) {
          idx = i
          exit = !isLast && t >= p.until
        }
      }
      setPhraseIdx(idx)
      setExiting(exit)

      // background: drift → star of david forms → crumbles → drift
      setFieldMode(t < 4.6 ? 'drift' : t < 7.1 ? 'star' : t < 8.6 ? 'crumble' : 'drift')
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, getT])

  const phrase = phraseIdx >= 0 ? INTRO_PHRASES[phraseIdx] : null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      <AsciiField mode={fieldMode} className="opacity-70" />

      <div aria-hidden="true" className="relative z-10 flex flex-col items-center gap-6 px-4">
        <div className="hidden sm:block">
          <AsciiEye aperture={aperture} cols={72} rows={23} fontSize="clamp(8px, 1.1vw, 14px)" />
        </div>
        <div className="sm:hidden">
          <AsciiEye aperture={aperture} cols={44} rows={17} fontSize="8px" />
        </div>

        <div className="flex min-h-28 flex-col items-center justify-center sm:min-h-32">
          {phrase && (
            <CinematicPhrase
              key={phraseIdx}
              text={phrase.text}
              emphasis={phrase.emphasis}
              exiting={exiting}
              size={phraseIdx === 2 ? 'lg' : 'md'}
            />
          )}
        </div>
      </div>
    </div>
  )
}
