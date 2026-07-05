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
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setForm({ name: "", email: "", message: "" });
      setStatus("idle");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

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
                  className="text-[14px] leading-relaxed mb-6"
                  style={{ color: "var(--muted)" }}
                >
                  Contribute data, report errors, or collaborate. Independent
                  freelancer — no party, no NGO, no state actor.
                </p>

                {status === "sent" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <p className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
                      Message sent.
                    </p>
                    <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                      I&apos;ll respond via the email you provided.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgba(62,230,193,0.4)] transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgba(62,230,193,0.4)] transition-colors"
                    />
                    <textarea
                      placeholder="Message *"
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgba(62,230,193,0.4)] transition-colors resize-none"
                    />

                    {status === "error" && (
                      <p className="text-xs text-rose-400">
                        Failed to send. Try emailing info@ziopsyop.me directly.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="w-full py-2.5 rounded-lg font-mono text-xs tracking-[0.1em] uppercase transition-all disabled:opacity-50"
                      style={{
                        background: "rgba(62,230,193,0.12)",
                        border: "1px solid rgba(62,230,193,0.3)",
                        color: "var(--primary)",
                      }}
                    >
                      {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
                    </button>
                  </form>
                )}

                {/* Disclaimer note */}
                <p
                  className="font-mono text-[10px] leading-relaxed tracking-[0.04em] mt-6"
                  style={{ color: "var(--muted-2)" }}
                >
                  info@ziopsyop.me — Independent research. All correspondence private.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
