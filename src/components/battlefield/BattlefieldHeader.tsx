"use client";

import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { DecryptText } from "@/components/fx/DecryptText";

export function BattlefieldHeader() {
  return (
    <header className="text-center pb-6 pt-2">
      <p className="font-mono text-[10px] tracking-[0.5em] text-accent-yellow mb-3">
        <DecryptText text="//  PART II — THE MOST MORAL ARMY" speed={26} />
      </p>
      <CinematicTitle
        as="h1"
        text="THE MOST MORAL ARMY"
        className="font-mono font-bold text-[clamp(1.7rem,5.5vw,3.2rem)] leading-[1.05] tracking-[0.06em] text-foreground"
      />
      <p className="mt-3 font-mono text-[11px] tracking-[0.28em] text-muted-2">
        THE BATTLEFIELD LEDGER · IDF—HEZBOLLAH · 2024—2026
      </p>
      <p className="mt-4 max-w-2xl mx-auto text-sm text-muted leading-relaxed text-balance">
        The second operation manufactures{" "}
        <span className="text-foreground">moral license</span>: the claim that
        Hezbollah are the terrorists and the IDF the most moral army on earth.
        We put that claim on the evidence table — targeting, cost, hardware,
        international-law compliance and battlefield outcome, every figure pulled
        live from the case database.
      </p>

      {/* what this pillar proves — the real-world stakes, stated plainly */}
      <div className="mt-6 mx-auto max-w-3xl rounded-md border border-accent-yellow/25 bg-accent-yellow/[0.04] px-5 py-4 text-left">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent-yellow">
          WHAT THIS PROVES
        </p>
        <p className="mt-2 text-sm text-muted leading-relaxed text-pretty">
          Part I showed a narrative was manufactured. Part II shows{" "}
          <span className="text-foreground">why</span> it had to be. Each exhibit
          below is not just a chart — it is a piece of evidence answering one
          question: when the propaganda is stripped away, whose conduct actually
          matches the &ldquo;most moral&rdquo; claim, and whose is being hidden?
          Read each visualization as a line in that indictment.
        </p>
      </div>
    </header>
  );
}
