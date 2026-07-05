"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Noise background — auto-cycling random character stream, always visible,
// revealed via a slow radial gradient pulse to stay subtle.
// ---------------------------------------------------------------------------

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>/\\|[]{}";

function generateRandomString(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

function ModalNoiseBg() {
  const [noise, setNoise] = useState("");
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setNoise(generateRandomString(2400));
    raf.current = setInterval(() => {
      setNoise(generateRandomString(2400));
    }, 80);
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
      {/* base dark fill */}
      <div className="absolute inset-0 bg-[#060608]" />

      {/* noise character layer — very dim, forms organic texture */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <p
          className="absolute inset-0 text-[10px] leading-[14px] break-all whitespace-pre-wrap font-mono font-bold"
          style={{ color: "rgba(62,230,193,0.06)" }}
        >
          {noise}
        </p>
      </div>

      {/* slow-pulsing radial reveal mask — brightens a soft center region */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(55% 45% at 50% 50%, rgba(62,230,193,0.07) 0%, transparent 70%)",
            "radial-gradient(65% 55% at 52% 48%, rgba(62,230,193,0.11) 0%, transparent 70%)",
            "radial-gradient(55% 45% at 48% 52%, rgba(62,230,193,0.07) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* top-left accent smear */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(62,230,193,0.08) 0%, transparent 70%)",
        }}
      />

      {/* bottom-right accent smear */}
      <div
        className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(78,168,255,0.07) 0%, transparent 70%)",
        }}
      />

      {/* vignette to keep edges dark and center readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(6,6,8,0.82) 100%)",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContactModal
// ---------------------------------------------------------------------------

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="contact-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Contact"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[201] flex items-center justify-center px-4"
            onClick={handleBackdropClick}
          >
            <div
              className="relative w-full max-w-[500px] rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow:
                  "0 0 0 1px rgba(62,230,193,0.18), 0 24px 80px rgba(0,0,0,0.7)",
              }}
            >
              {/* Animated noise background */}
              <ModalNoiseBg />

              {/* Glass content layer */}
              <div
                className="relative z-10 px-8 py-10 sm:px-10"
                style={{
                  background: "rgba(6,6,8,0.55)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {/* Close button */}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/[0.06] transition-colors"
                  aria-label="Close contact modal"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 1L13 13M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>

                {/* Header */}
                <div className="mb-7">
                  <p
                    className="font-mono text-[10px] tracking-[0.3em] mb-3 uppercase"
                    style={{ color: "var(--primary)" }}
                  >
                    // contact
                  </p>
                  <h2
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    Get in Touch
                  </h2>
                </div>

                {/* Thin rule */}
                <div
                  className="w-12 h-px mb-7"
                  style={{ background: "var(--primary)", opacity: 0.4 }}
                />

                {/* Body */}
                <p
                  className="text-[15px] leading-relaxed mb-5"
                  style={{ color: "var(--muted)" }}
                >
                  I don&apos;t represent any organization, government, or group.
                  This is my personal resistance — an independent, self-funded
                  forensic investigation conducted by one person.
                </p>

                <p
                  className="text-[14px] leading-relaxed mb-7"
                  style={{ color: "var(--muted)" }}
                >
                  If you want to reach me, contribute data, or collaborate:
                </p>

                {/* Email display */}
                <motion.a
                  href="mailto:info@ziopsyop.me"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg mb-7 group cursor-pointer"
                  style={{
                    background: "rgba(62,230,193,0.06)",
                    border: "1px solid rgba(62,230,193,0.18)",
                  }}
                >
                  {/* envelope icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    style={{ color: "var(--primary)", flexShrink: 0 }}
                  >
                    <rect
                      x="1"
                      y="3"
                      width="14"
                      height="10"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M1 4.5L8 9.5L15 4.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className="font-mono text-[13px] tracking-[0.06em] group-hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    info@ziopsyop.me
                  </span>
                </motion.a>

                {/* Disclaimer note */}
                <p
                  className="font-mono text-[10px] leading-relaxed tracking-[0.04em]"
                  style={{ color: "var(--muted-2)" }}
                >
                  This project is the work of an independent freelancer. No
                  political party, no NGO, no state actor.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
