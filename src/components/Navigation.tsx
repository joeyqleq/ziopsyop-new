"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlitchWordmark } from "@/components/fx/GlitchWordmark";
import { ContactModal } from "@/components/ContactModal";
import { AnimatedEye } from "@/components/fx/AnimatedEye";
import { trackEvent } from "@/lib/analytics";

const NAV_GROUPS = [
  {
    label: "INVESTIGATION",
    code: "I",
    items: [
      { href: "/part-i", label: "OVERVIEW", code: "I" },
      { href: "/analysis", label: "ANALYSIS", code: "·" },
      { href: "/forensics", label: "DOSSIER", code: "⊛" },
    ],
  },
  {
    label: "BATTLEFIELD",
    code: "II",
    items: [
      { href: "/battlefield", label: "EVIDENCE", code: "II" },
      { href: "/map", label: "MAP", code: "·" },
    ],
  },
  {
    label: "MEDIA",
    code: "III",
    items: [
      { href: "/media-war", label: "MEDIA WAR", code: "⊗" },
      { href: "/synthesis", label: "SYNTHESIS", code: "∴" },
      { href: "/evidence", label: "VIDEO", code: "▶" },
      { href: "/sources", label: "SOURCES", code: "※" },
      { href: "/counter-arguments", label: "COUNTERPOINTS", code: "⇋" },
      { href: "/control", label: "CONTROL", code: "⊞" },
    ],
  },
  {
    label: "INFO",
    code: "—",
    items: [
      { href: "/about", label: "ABOUT", code: "—" },
      { href: "#contact", label: "CONTACT", code: "@" },
    ],
  },
] as const;

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
        "font-mono text-[10px] md:text-[9px] tracking-[0.06em] transition-colors duration-300",
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
    const initial = window.setTimeout(() => setTime(fmt()), 0);
    const t = setInterval(() => setTime(fmt()), 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
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
  const [contactOpen, setContactOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // traced border on the dock itself
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  return (
    <><header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        ref={barRef}
        onMouseMove={onMouseMove}
        initial={false}
        animate={{
          marginTop: scrolled ? 12 : 0,
          width: scrolled ? "min(960px, calc(100% - 24px))" : "100%",
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
            <AnimatedEye size={26} />
          </motion.span>
          <GlitchWordmark className="font-mono text-[13px] font-bold tracking-[0.3em] text-foreground" />        
        </Link>

        {/* desktop links */}
        <nav
          className="hidden md:flex items-center"
          onMouseLeave={() => setHovered(null)}
          aria-label="Main navigation"
        >
          {NAV_GROUPS.map((group) => {
            const active = group.items.some((item) => pathname === item.href);
            return (
              <div key={group.label} className="group/menu relative flex items-center">
                <button
                  type="button"
                  className="relative px-3 py-4"
                  aria-haspopup="menu"
                >
                  <ScrambleLabel text={group.label} active={active} />
                  {active && <span className="absolute left-3 right-3 bottom-1.5 h-px bg-primary" />}
                </button>
                <div className="invisible absolute left-0 top-[calc(100%-4px)] min-w-52 translate-y-1 rounded-md border border-borderc bg-background/98 p-1 opacity-0 shadow-[0_16px_42px_rgba(0,0,0,0.7)] backdrop-blur-xl transition duration-150 group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:translate-y-0 group-focus-within/menu:opacity-100">
                  {group.items.map((item) => {
                    const itemActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href === "#contact" ? "#" : item.href}
                        onClick={item.href === "#contact" ? (e) => { e.preventDefault(); setContactOpen(true); trackEvent("nav_contact_open"); } : () => trackEvent("nav_click", { destination: item.href, label: item.label })}
                        onMouseEnter={() => setHovered(item.href)}
                        className={cn(
                          "flex items-center gap-3 rounded px-3 py-2 font-mono text-[10px] tracking-[0.12em] transition-colors",
                          itemActive || hovered === item.href ? "bg-white/[0.05] text-primary" : "text-muted hover:text-foreground"
                        )}
                        role="menuitem"
                      >
                        <span className="w-4 text-muted-2">/{item.code}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <Link
            href="/support"
            onClick={() => trackEvent("nav_click", { destination: "/support", label: "SUPPORT" })}
            className={cn(
              "group/support relative ml-1 flex items-center gap-1.5 border-l border-archive/20 px-3 py-4 font-mono text-[9px] tracking-[0.12em] transition-colors",
              pathname === "/support" ? "text-archive" : "text-archive/80 hover:text-archive"
            )}
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-archive opacity-35 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-archive" />
            </span>
            SUPPORT
            {pathname === "/support" && <span className="absolute inset-x-3 bottom-1.5 h-px bg-archive" />}
          </Link>
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
            <div className="max-h-[78vh] overflow-y-auto py-4">
              {NAV_GROUPS.map((group, groupIndex) => (
                <motion.section
                  key={group.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + groupIndex * 0.06 }}
                  className="mb-5"
                >
                  <p className="mb-1 font-mono text-[9px] tracking-[0.3em] text-primary/60">
                    /{group.code} {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-px border border-borderc bg-borderc">
                    {group.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href === "#contact" ? "#" : item.href}
                          onClick={item.href === "#contact" ? (e) => { e.preventDefault(); setContactOpen(true); setMenuOpen(false); trackEvent("nav_contact_open", { source: "mobile" }); } : () => { setMenuOpen(false); trackEvent("nav_click", { destination: item.href, label: item.label, source: "mobile" }); }}
                          className={cn(
                            "bg-background px-3 py-3 font-mono text-xs tracking-[0.12em]",
                            active ? "text-primary" : "text-foreground"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.31 }}
                className="border-t border-archive/25 pt-4"
              >
                <Link
                  href="/support"
                  onClick={() => {
                    setMenuOpen(false);
                    trackEvent("nav_click", { destination: "/support", label: "SUPPORT THE WORK", source: "mobile" });
                  }}
                  className="flex min-h-12 items-center justify-between border border-archive/35 bg-archive/[0.06] px-4 font-mono text-xs tracking-[0.15em] text-archive"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-archive" aria-hidden="true" />
                    SUPPORT THE WORK
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </div>
            <p className="mt-10 font-mono text-[10px] tracking-[0.25em] text-muted-2">
              SIGNAL FROM NOISE — ZIOPSYOP.ME
            </p>
          </motion.nav>
        )}
      </AnimatePresence>

    </header>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
