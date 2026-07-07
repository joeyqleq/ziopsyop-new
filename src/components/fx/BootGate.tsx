"use client";
import { useState, useEffect, useCallback } from "react";
import { BootSequence } from "@/components/fx/BootSequence";

// Only show once per browser session
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

  // also let keypress skip
  useEffect(() => {
    if (booted) return;
    const onKey = () => handleComplete();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, handleComplete]);

  return (
    <>
      {!booted && <BootSequence onComplete={handleComplete} />}
      {children}
    </>
  );
}
