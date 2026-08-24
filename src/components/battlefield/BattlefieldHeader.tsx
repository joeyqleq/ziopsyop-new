"use client";

import { PageIntro } from "@/components/PageIntro";

export function BattlefieldHeader() {
  return (
    <>
      <PageIntro
        marker="PART II // THE MOST MORAL ARMY"
        title="THE SCORECARD"
        systemLine="THE BATTLEFIELD LEDGER · IDF—HEZBOLLAH · 2024—2026"
        accent="var(--accent-yellow)"
        description={<>
        The second operation manufactures{" "}
        <span className="text-foreground">moral license</span>: the claim that
        Hezbollah are the terrorists and the IDF the most moral army on earth.
        We put that claim on the evidence table — targeting, cost, hardware,
        international-law compliance and battlefield outcome, every figure pulled
        live from the case database.
        </>}
      />
      <div className="mt-6 mx-auto max-w-3xl rounded-md border border-accent-yellow/25 bg-accent-yellow/[0.04] px-5 py-4 text-left">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent-yellow">
          WHAT THIS RECORD TESTS
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
    </>
  );
}
