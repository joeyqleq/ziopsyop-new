"use client";

import { useEffect, useRef, useState } from "react";

const EYE_FRAMES = [
  String.raw`
          .:--========--:.
      .-=+:    .-==-.    :+=-.
   .-=:      -=:    :=-      :=-.
  =+.       =:  .##.  :=        .+=
 (:    .    =:  '##'  :=    .     :)
  =+.       .=:      :=.        .+=
   '-=:       '-====-'       :=-'
      '-=+:.     ..      .:+=-'
          ':--==========--:'
`,
  String.raw`
          .:--========--:.
      .-=+:    .-==-.    :+=-.
   .-=:                      :=-.
  =+.      .-==========-.      .+=
 (:    .   '------------'   .    :)
  =+.                           .+=
   '-=:       .-====-.       :=-'
      '-=+:.     ..      .:+=-'
          ':--==========--:'
`,
];

/**
 * ASCII-art rendition of the eye mark. Blinks every few seconds.
 * Used as the footer sigil — the investigation never stops watching.
 */
export function AsciiEye({ className = "" }: { className?: string }) {
  const [frame, setFrame] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    const blink = () => {
      if (!alive) return;
      setFrame(1);
      timeout.current = setTimeout(() => {
        if (!alive) return;
        setFrame(0);
        timeout.current = setTimeout(blink, 2800 + Math.random() * 3200);
      }, 140);
    };
    timeout.current = setTimeout(blink, 3000);
    return () => {
      alive = false;
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return (
    <pre
      className={`font-mono text-[8px] sm:text-[9px] leading-[1.15] text-primary/50 select-none ${className}`}
      aria-hidden="true"
    >
      {EYE_FRAMES[frame]}
    </pre>
  );
}
