"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlitchWordmark } from "@/components/fx/GlitchWordmark";

const NAV_ITEMS = [
  { href: "/part-i", label: "PART I", code: "I", pillar: "I" },
  { href: "/analysis", label: "ANALYSIS", code: "·", pillar: "I" },
  { href: "/battlefield", label: "PART II", code: "II", pillar: "II" },
  { href: "/map", label: "MAP", code: "·", pillar: "II" },
  { href: "/about", label: "DOSSIER", code: "—", pillar: "" },
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01<>/#";

/** A nav label whose letters scramble-resolve on hover, each letter on its own clock. */
function ScrambleLabel({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = useCallback(() => {
    let tick = 0;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      tick++;
      let done = true;
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return ch;
            if (tick > i + 2) return ch;
            done = false;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );
      if (done && timer.current) clearInterval(timer.current);
    }, 30);
  }, [text]);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <span
      onMouseEnter={scramble}
      className={cn(
        "font-mono text-[11px] tracking-[0.18em] transition-colors duration-300",
        active ? "text-primary" : "text-muted group-hover:text-foreground"
      )}
    >
      {display}
    </span>
  );
}

/** Live UTC clock — makes the bar feel like an operations console. */
function UtcClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      new Date().toISOString().slice(11, 19) + "Z";
    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-muted-2 tabular-nums">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      {time || "--:--:--Z"}
    </span>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // traced border on the dock itself
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        ref={barRef}
        onMouseMove={onMouseMove}
        initial={false}
        animate={{
          marginTop: scrolled ? 12 : 0,
          width: scrolled ? "min(880px, calc(100% - 24px))" : "100%",
          borderRadius: scrolled ? 10 : 0,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "pointer-events-auto traced-card !rounded-none flex items-center justify-between gap-3 px-4 h-13",
          scrolled
            ? "!rounded-[10px] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            : "border-x-0 border-t-0"
        )}
        style={{ height: 52 }}
      >
        {/* brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 shrink-0"
          aria-label="ZIOPSYOP home"
        >
          <motion.span
            whileHover={{ rotate: 8, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="block"
          >
            <Image
              src="/assets/eye_logo_1.svg"
              alt=""
              width={26}
              height={26}
              priority
            />
          </motion.span>
          <GlitchWordmark className="font-mono text-[13px] font-bold tracking-[0.3em] text-foreground" />        
        </Link>

        {/* desktop links */}
        <nav
          className="hidden md:flex items-center"
          onMouseLeave={() => setHovered(null)}
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item, idx) => {
            const active = pathname === item.href;
            const prev = NAV_ITEMS[idx - 1];
            const showDivider = prev && prev.pillar !== item.pillar;
            return (
              <div key={item.href} className="flex items-center">
                {showDivider && (
                  <span
                    className="mx-1.5 h-4 w-px bg-borderc"
                    aria-hidden="true"
                  />
                )}
              <Link
                href={item.href}
                onMouseEnter={() => setHovered(item.href)}
                className="group relative px-3.5 py-2"
              >
                {/* shared sliding hover ink */}
                {hovered === item.href && (
                  <motion.span
                    layoutId="nav-ink"
                    className="absolute inset-0 rounded-md bg-white/[0.05]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "font-mono text-[8px] transition-colors",
                      active ? "text-primary/70" : "text-muted-2"
                    )}
                  >
                    {item.code}
                  </span>
                  <ScrambleLabel text={item.label} active={active} />
                </span>
                {/* pixel-block active underline */}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-3.5 right-3.5 -bottom-px h-[2px] flex gap-[2px]"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <span
                        key={i}
                        className="flex-1 bg-primary"
                        style={{ opacity: 1 - i * 0.13 }}
                      />
                    ))}
                  </motion.span>
                )}
              </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <UtcClock />
          {/* mobile trigger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-end gap-[5px] w-8 h-8"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7, width: 22 } : { rotate: 0, y: 0, width: 22 }}
              className="block h-[1.5px] bg-foreground"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-[1.5px] w-[14px] bg-primary"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7, width: 22 } : { rotate: 0, y: 0, width: 18 }}
              className="block h-[1.5px] bg-foreground"
            />
          </button>
        </div>
      </motion.div>

      {/* mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto fixed inset-0 z-40 bg-background/97 backdrop-blur-xl flex flex-col justify-center px-8 md:hidden"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map((item, i) => {
              const active = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.07 }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-baseline gap-4 py-5 border-b border-borderc"
                  >
                    <span className="font-mono text-[10px] text-muted-2">
                      /{item.code}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-2xl tracking-[0.2em]",
                        active ? "text-primary glow-primary" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
            <p className="mt-10 font-mono text-[10px] tracking-[0.25em] text-muted-2">
              SIGNAL FROM NOISE — ZIOPSYOP.ME
            </p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
