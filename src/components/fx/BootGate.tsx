"use client";
import { useState, useEffect, useCallback } from "react";
import { BootSequence } from "@/components/fx/BootSequence";
import { BootContext } from "@/components/fx/BootContext";

const SESSION_KEY = "ziopsyop_booted";

export function BootGate({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(true); // start true to avoid flash

  useEffect(() => {
    const already = sessionStorage.getItem(SESSION_KEY);
    if (!already) {
      setBooted(false);
    }
  }, []);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setBooted(true);
  }, []);

  useEffect(() => {
    if (booted) return;
    const onKey = () => handleComplete();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, handleComplete]);

  return (
    <BootContext.Provider value={booted}>
      {!booted && <BootSequence onComplete={handleComplete} />}
      {children}
    </BootContext.Provider>
  );
}
