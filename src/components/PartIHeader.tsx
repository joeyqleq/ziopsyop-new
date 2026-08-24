"use client";

import { PageIntro } from "@/components/PageIntro";

export function PartIHeader() {
  return (
    <PageIntro
      marker="PART I // THE OPERATION"
      title="THE OPERATION"
      systemLine="THE SUBREDDIT OPERATION · r/ForbiddenBromance · 2019—2026"
      description={<>
        The first operation manufactures{" "}
        <span className="text-foreground">consent</span>: a fake grassroots
        friendship engineered to soften Lebanese sentiment while a war is waged.
        102,610 artifacts, tested against five falsifiable claims —
        the conversation was never organic. This is how the megaphone was built.
      </>}
    />
  );
}
