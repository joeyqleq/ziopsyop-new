"use client";

import { Navigation } from "@/components/Navigation";
import { ShaderBackdrop } from "@/components/fx/ShaderBackdrop";
import { AnimatedASCIIFooter } from "@/components/fx/AnimatedASCIIFooter";

/**
 * Uniform page chrome: living nav, brand shader backdrop, dossier footer.
 * New pages/sections plug straight in — keeping proportions, padding and
 * sequencing identical site-wide, on every screen size.
 *
 * backdrop: "warp" | "waves" | "none" — alternate between pages so the two
 * shaders are evenly distributed across the site.
 */
export function PageShell({
  children,
  backdrop = "warp",
}: {
  children: React.ReactNode;
  backdrop?: "warp" | "waves" | "none";
}) {
  return (
    <main className="relative min-h-screen">
      {backdrop !== "none" && (
        <ShaderBackdrop variant={backdrop} className="fixed inset-0" opacity={0.55} />
      )}
      <Navigation />
      <div className="relative z-10">{children}</div>
      <SiteFooter />
    </main>
  );
}

export function SiteFooter() {
  return <AnimatedASCIIFooter />;
}
