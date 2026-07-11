"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const PixelBlast = dynamic(() => import("@/components/PixelBlast"), { ssr: false });

// Brand color palette to cycle through
const COLOR_SEQUENCE = [
  "#7b39d0", // purple
  "#5a2aa8", // deep purple
  "#b6ff7c", // lime
  "#4d8c3a", // dim lime
  "#9b5fe0", // mid purple
  "#3d1c6a", // darkest purple
  "#6bcc4a", // lime variant
  "#7b39d0", // back to purple
];

type VariantType = "square" | "circle" | "diamond" | "triangle";
const VARIANTS: VariantType[] = ["square", "circle", "diamond", "triangle"];

interface LiveParams {
  color: string;
  variant: VariantType;
  pixelSize: number;
  patternDensity: number;
  patternScale: number;
  speed: number;
  edgeFade: number;
  pixelSizeJitter: number;
}

function interpolateColor(a: string, b: string, t: number): string {
  const parseHex = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl2 = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl2.toString(16).padStart(2, "0")}`;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function useLowEndDevice() {
  const [isLowEnd, setIsLowEnd] = useState(false);
  useEffect(() => {
    // Heuristic: mobile with < 4 logical CPUs or < 4GB RAM is low-end
    const nav = navigator as Navigator & {
      hardwareConcurrency?: number;
      deviceMemory?: number;
    };
    const cores = nav.hardwareConcurrency ?? 4;
    const mem = nav.deviceMemory ?? 8;
    const mobile = /Mobi|Android/i.test(navigator.userAgent);
    setIsLowEnd(mobile && (cores < 4 || mem < 4));
  }, []);
  return isLowEnd;
}

export function PixelBlastBackground() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const isLowEnd = useLowEndDevice();

  const [params, setParams] = useState<LiveParams>({
    color: COLOR_SEQUENCE[0],
    variant: "square",
    pixelSize: 3,
    patternDensity: 0.8,
    patternScale: 2.5,
    speed: 0.4,
    edgeFade: 0.5,
    pixelSizeJitter: 0.3,
  });

  const colorIdxRef = useRef(0);
  const variantIdxRef = useRef(0);
  const phaseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastParamShiftRef = useRef(0);
  const lastColorShiftRef = useRef(0);
  const lastVariantShiftRef = useRef(0);
  const colorTransitionRef = useRef({ from: COLOR_SEQUENCE[0], to: COLOR_SEQUENCE[1], t: 0 });

  // Scroll-based density influence
  const scrollRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const evolve = useCallback((timestamp: number) => {
    const dt = timestamp - lastParamShiftRef.current;
    const colorDt = timestamp - lastColorShiftRef.current;
    const variantDt = timestamp - lastVariantShiftRef.current;

    // Continuous micro-evolution: wiggle speed/density subtly every frame
    phaseRef.current += 0.0004;
    const phase = phaseRef.current;
    const scrollFactor = scrollRef.current;

    // Color transition — smoothly morph every 6-9s
    const COLOR_INTERVAL = 6000 + Math.sin(phase * 0.3) * 3000;
    if (colorDt > COLOR_INTERVAL) {
      lastColorShiftRef.current = timestamp;
      colorIdxRef.current = (colorIdxRef.current + 1) % COLOR_SEQUENCE.length;
      colorTransitionRef.current = {
        from: COLOR_SEQUENCE[(colorIdxRef.current - 1 + COLOR_SEQUENCE.length) % COLOR_SEQUENCE.length],
        to: COLOR_SEQUENCE[colorIdxRef.current],
        t: 0,
      };
    }

    // Smooth color interpolation
    const ct = colorTransitionRef.current;
    if (ct.t < 1) {
      ct.t = Math.min(1, ct.t + 0.008);
    }
    const currentColor = interpolateColor(ct.from, ct.to, ct.t);

    // Variant shift every 12-20s
    const VARIANT_INTERVAL = 12000 + Math.sin(phase * 0.17) * 8000;
    let currentVariant = VARIANTS[variantIdxRef.current];
    if (variantDt > VARIANT_INTERVAL) {
      lastVariantShiftRef.current = timestamp;
      variantIdxRef.current = (variantIdxRef.current + 1) % VARIANTS.length;
      currentVariant = VARIANTS[variantIdxRef.current];
    }

    // Parameter evolution — slow sinusoidal drift, influenced by scroll
    const PARAM_INTERVAL = 3000;
    if (dt > PARAM_INTERVAL) {
      lastParamShiftRef.current = timestamp;

      const densityBase = 0.7 + Math.sin(phase * 1.3) * 0.25 + scrollFactor * 0.15;
      const scaleBase = 2 + Math.sin(phase * 0.7) * 1.2 + scrollFactor * 0.5;
      const speedBase = 0.25 + Math.abs(Math.sin(phase * 0.9)) * 0.35;
      const sizeBase = 2.5 + Math.sin(phase * 1.7) * 1;
      const jitterBase = 0.2 + Math.abs(Math.sin(phase * 2.1)) * 0.5;
      const fadeBase = 0.3 + Math.abs(Math.sin(phase * 0.5)) * 0.4;

      setParams({
        color: currentColor,
        variant: currentVariant,
        pixelSize: Math.max(1.5, Math.min(5, sizeBase)),
        patternDensity: Math.max(0.4, Math.min(1.2, densityBase)),
        patternScale: Math.max(1, Math.min(5, scaleBase)),
        speed: Math.max(0.1, Math.min(0.8, speedBase)),
        edgeFade: Math.max(0.2, Math.min(0.8, fadeBase)),
        pixelSizeJitter: Math.max(0, Math.min(1, jitterBase)),
      });
    } else {
      // Still update color smoothly between param shifts
      setParams((prev) => ({ ...prev, color: currentColor }));
    }

    rafRef.current = requestAnimationFrame(evolve);
  }, []);

  useEffect(() => {
    if (reducedMotion || isLowEnd) return;
    lastParamShiftRef.current = performance.now();
    lastColorShiftRef.current = performance.now();
    lastVariantShiftRef.current = performance.now();
    rafRef.current = requestAnimationFrame(evolve);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [evolve, reducedMotion, isLowEnd]);

  // Don't render on hero page (homepage) — hero has its own SpaceBackground
  // But we do render on all other pages. On homepage, we render below the hero fold.
  const isHomepage = pathname === "/";

  // Reduced-motion fallback: static subtle dots
  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, #7b39d020 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
    );
  }

  // Low-end mobile: skip entirely
  if (isLowEnd) return null;

  return (
    <div
      className="fixed pointer-events-none z-0"
      aria-hidden="true"
      style={
        isHomepage
          ? {
              // On homepage: start below the hero (100svh offset)
              top: "100svh",
              left: 0,
              right: 0,
              bottom: 0,
            }
          : { inset: 0 }
      }
    >
      <PixelBlast
        variant={params.variant}
        pixelSize={params.pixelSize}
        color={params.color}
        patternDensity={params.patternDensity}
        patternScale={params.patternScale}
        speed={params.speed}
        edgeFade={params.edgeFade}
        pixelSizeJitter={params.pixelSizeJitter}
        enableRipples={true}
        rippleIntensityScale={0.6}
        rippleSpeed={0.25}
        rippleThickness={0.08}
        transparent={true}
        antialias={false}
        className="w-full h-full"
      />
    </div>
  );
}
