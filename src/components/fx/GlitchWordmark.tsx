import { cn } from "@/lib/utils";

/**
 * ZIOPSYOP wordmark where every "O" is rendered as a live-glitching "0":
 * RGB channel split in the eye-logo blue + yellow, scanline flicker, and an
 * intermittent slice-tear. Pure CSS (see globals.css .gw-*), so it is safe in
 * Server Components and costs no JS. The accessible name stays "ZIOPSYOP".
 */
export function GlitchWordmark({
  text = "ZIOPSYOP",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span className={cn("gw font-mono font-bold", className)} aria-label={text} role="img">
      {text.split("").map((ch, i) =>
        ch === "O" ? (
          <span key={i} className="gw-char" aria-hidden="true">
            <span className="gw-zero" data-z="0">
              0<span className="gw-slice" aria-hidden="true">0</span>
            </span>
          </span>
        ) : (
          <span key={i} className="gw-char" aria-hidden="true">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
