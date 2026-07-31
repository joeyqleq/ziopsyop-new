"use client";
import { useState, useEffect, useCallback } from "react";
import { ZioBootSequence } from "@/components/fx/boot/zio-boot-sequence";
import { BootContext } from "@/components/fx/BootContext";

export function BootGate({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState<boolean | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    // Only an initial load at `/` can trigger the sequence. Entering the
    // homepage later via client-side navigation does not arm it. A real page
    // load at `/` always replays the sequence.
    setBooted(window.location.pathname !== "/");
  }, []);

  const handleComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const handleHandoffStart = useCallback(() => {
    setRevealing(true);
  }, []);

  if (booted === null) {
    return <div className="fixed inset-0 bg-background" aria-hidden="true" />;
  }

  const heroVisible = booted || revealing;

  return (
    <BootContext.Provider value={heroVisible}>
      <div
        aria-hidden={!heroVisible}
        inert={!heroVisible}
        className={heroVisible ? undefined : "pointer-events-none select-none"}
      >
        {children}
      </div>
      {!booted ? (
        <ZioBootSequence
          onHandoffStart={handleHandoffStart}
          onComplete={handleComplete}
        />
      ) : null}
    </BootContext.Provider>
  );
}
