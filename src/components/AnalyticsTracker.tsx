"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

/**
 * Matomo is loaded once in the root layout and tracks the initial pageview.
 * Next.js performs client-side navigation, so we push a pageview to Matomo
 * on every subsequent route change.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return; // initial pageview already tracked by the loader snippet
    }
    if (typeof window !== "undefined" && window._paq) {
      window._paq.push(["setCustomUrl", pathname]);
      window._paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
      window._paq.push(["trackPageView"]);
    }
  }, [pathname]);

  return null;
}
