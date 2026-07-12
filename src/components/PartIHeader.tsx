"use client";

import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { DecryptText } from "@/components/fx/DecryptText";

export function PartIHeader() {
  return (
    <header className="text-center pb-6 pt-2">
      <p className="font-mono text-[10px] tracking-[0.5em] text-primary mb-3">
        <DecryptText text="//  PART I — THE MANUFACTURED FRIEND" speed={38} />
      </p>
      <CinematicTitle
        as="h1"
        text="THE MANUFACTURED FRIEND"
        animateOnMount
        delay={0.05}
        className="font-mono font-bold text-[clamp(1.7rem,5.5vw,3.2rem)] leading-[1.05] tracking-[0.06em] text-foreground"
      />
      <p className="mt-3 font-mono text-[11px] tracking-[0.28em] text-muted-2">
        THE SUBREDDIT OPERATION · r/ForbiddenBromance · 2019—2026
      </p>
      <p className="mt-4 max-w-2xl mx-auto text-sm text-muted leading-relaxed text-balance">
        The first operation manufactures{" "}
        <span className="text-foreground">consent</span>: a fake grassroots
        friendship engineered to soften Lebanese sentiment while a war is waged.
        102,610 artifacts, tested against five falsifiable claims —
        the conversation was never organic. This is how the megaphone was built.
      </p>
    </header>
  );
}
