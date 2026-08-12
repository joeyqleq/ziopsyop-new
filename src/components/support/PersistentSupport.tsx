"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Radio } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { BrandedText } from "@/components/BrandedText";

export function PersistentSupport() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (pathname === "/support") return null;

  return (
    <>
      <motion.div
        className="fixed right-0 top-[58%] z-40 hidden -translate-y-1/2 sm:block"
        initial={{ x: 18, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <Link
          href="/support"
          onClick={() => trackEvent("support_affordance_click", { placement: "edge" })}
          className="group flex items-center gap-2 rounded-l-md border border-r-0 border-archive/35 bg-background/90 px-2.5 py-4 font-mono text-[9px] tracking-[0.2em] text-archive shadow-[0_12px_38px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors hover:border-archive/70 hover:bg-archive/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-archive"
          style={{ writingMode: "vertical-rl" }}
          aria-label="Support the work — keep the signal live"
        >
          <motion.span
            animate={reducedMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Radio size={12} />
          </motion.span>
          <BrandedText text="KEEP THE SIGNAL LIVE" />
        </Link>
      </motion.div>

      <motion.div
        className="fixed bottom-4 right-4 z-40 sm:hidden"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <Link
          href="/support"
          onClick={() => trackEvent("support_affordance_click", { placement: "mobile" })}
          className="flex min-h-11 items-center gap-2 rounded-md border border-archive/40 bg-background/92 px-3 font-mono text-[9px] tracking-[0.16em] text-archive shadow-[0_10px_30px_rgba(0,0,0,0.55)] backdrop-blur-md"
          aria-label="Support the work"
        >
          <Radio size={13} />
          <BrandedText text="SUPPORT" />
        </Link>
      </motion.div>
    </>
  );
}
