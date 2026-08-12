"use client";

import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/Hero";
import { PartDoors } from "@/components/gateway/PartDoors";

/**
 * Gateway — a neutral landing that belongs to neither part. It states the
 * unified thesis (one machine, three fronts) and forks into three co-equal
 * doors. Parts I, II, and III live on their own routes so no evidentiary
 * domain is treated as an appendix to another.
 */
export default function Home() {
  return (
    <PageShell backdrop="warp">
      <Hero />
      <PartDoors />
    </PageShell>
  );
}
