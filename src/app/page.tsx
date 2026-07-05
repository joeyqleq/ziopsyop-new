"use client";

import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/Hero";
import { PartDoors } from "@/components/gateway/PartDoors";

/**
 * Gateway — a neutral landing that belongs to neither part. It states the
 * unified thesis (one machine, two operations) and forks into two co-equal
 * doors. Part I and Part II live on their own routes so neither is
 * subordinate to the other.
 */
export default function Home() {
  return (
    <PageShell backdrop="warp">
      <Hero />
      <PartDoors />
    </PageShell>
  );
}
