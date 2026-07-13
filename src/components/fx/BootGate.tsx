"use client";
import { useState, useEffect, useCallback } from "react";
import { BootSequence } from "@/components/fx/BootSequence";
import { BootContext } from "@/components/fx/BootContext";

const SESSION_KEY = "ziopsyop_booted";

export function BootGate({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState<boolean | null>(null);

  useEffect(() => {
    const already = sessionStorage.getItem(SESSION_KEY);
    if (already) {
      setBooted(true);
    } else {
      setBooted(false);
    }
  }, []);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setBooted(true);
  }, []);

  useEffect(() => {
    if (booted !== false) return;
    const onKey = () => handleComplete();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, handleComplete]);

  // Render nothing until we determine boot state (prevents hero flash)
  if (booted === null) return null;

  return (
    <BootContext.Provider value={booted === true}>
      {booted === false && <BootSequence onComplete={handleComplete} />}
      {children}
    </BootContext.Provider>
  );
}
