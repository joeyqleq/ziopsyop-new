"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const RAMP = " .:-=+*#%@";
const EYE_COLORS = ["#b6ff7c", "#70d6ff", "#a98cff", "#ff8b7d", "#d8e7d3"];

interface EyeSpec {
  id: number;
  left: number;
  top: number;
  cols: number;
  rows: number;
  cell: number;
  color: string;
  cycle: number;
  phase: number;
  drift: number;
  maxOpacity: number;
}

function hash(seed: number, x: number, y: number, tick: number) {
  let value = seed * 374761393 + x * 668265263 + y * 2147483647 + tick * 1274126177;
  value = (value ^ (value >>> 13)) * 1274126177;
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function makeEye(spec: EyeSpec, tick: number, openness: number) {
  const lines: string[] = [];
  const irisX = Math.sin((tick + spec.phase) * 0.07) * 0.12;
  const irisY = Math.cos((tick + spec.phase) * 0.043) * 0.05;

  for (let y = 0; y < spec.rows; y++) {
    let line = "";
    const ny = ((y + 0.5) / spec.rows - 0.5) * 2;
    for (let x = 0; x < spec.cols; x++) {
      const nx = ((x + 0.5) / spec.cols - 0.5) * 2;
      const lid = Math.pow(Math.max(0, 1 - nx * nx), 0.62) * openness;
      const edgeDistance = Math.abs(Math.abs(ny) - lid);
      const random = hash(spec.id, x, y, Math.floor(tick / 2));
      let glyph = " ";

      if (openness < 0.13) {
        if (Math.abs(ny) < 0.13 && Math.abs(nx) < 0.93) {
          const density = Math.max(0, 1 - Math.abs(nx));
          glyph = RAMP[Math.min(RAMP.length - 1, Math.floor((density * 0.7 + random * 0.3) * RAMP.length))];
        }
      } else if (Math.abs(ny) <= lid) {
        const irisDistance = Math.sqrt(
          Math.pow((nx - irisX) * 1.22, 2) + Math.pow((ny - irisY) / Math.max(openness, 0.28), 2),
        );
        const pupilDistance = Math.sqrt(
          Math.pow((nx - irisX) * 1.8, 2) + Math.pow((ny - irisY) / Math.max(openness, 0.3), 2),
        );

        if (edgeDistance < 0.16) {
          glyph = RAMP[5 + Math.floor(random * 5)];
        } else if (pupilDistance < 0.24) {
          glyph = random > 0.18 ? "@" : "#";
        } else if (irisDistance < 0.5) {
          glyph = RAMP[4 + Math.floor(random * 5)];
        } else if (random > 0.82) {
          glyph = RAMP[1 + Math.floor(random * 4)];
        }
      } else if (edgeDistance < 0.11 && Math.abs(nx) < 0.96) {
        glyph = RAMP[3 + Math.floor(random * 4)];
      }
      line += glyph;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

function createSpecs(seed: number): EyeSpec[] {
  const anchors = [
    [3, 4], [72, 10], [10, 21], [78, 29], [1, 39], [66, 46],
    [14, 57], [80, 64], [4, 72], [69, 80], [18, 89], [76, 96],
  ];

  return anchors.map(([left, top], index) => {
    const noise = hash(seed, index, index * 3, 0);
    return {
      id: seed * 31 + index,
      left: left + (noise - 0.5) * 8,
      top,
      cols: 22 + Math.floor(hash(seed, index, 1, 0) * 18),
      rows: 7 + Math.floor(hash(seed, index, 2, 0) * 5),
      cell: 4.2 + hash(seed, index, 3, 0) * 2.6,
      color: EYE_COLORS[(index + seed) % EYE_COLORS.length],
      cycle: 68 + Math.floor(hash(seed, index, 4, 0) * 58),
      phase: Math.floor(hash(seed, index, 5, 0) * 90),
      drift: (hash(seed, index, 6, 0) - 0.5) * 18,
      maxOpacity: 0.09 + hash(seed, index, 7, 0) * 0.12,
    };
  });
}

export function AsciiEyeField({
  seed = 7,
  className,
}: {
  seed?: number;
  className?: string;
}) {
  const specs = useMemo(() => createSpecs(seed), [seed]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 150);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_4%,black_96%,transparent)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(182,255,124,.025),transparent_23%),radial-gradient(circle_at_82%_65%,rgba(112,214,255,.025),transparent_22%)]" />
      {specs.map((spec) => {
        const local = (tick + spec.phase) % spec.cycle;
        const blinkDistance = Math.min(
          Math.abs(local - Math.floor(spec.cycle * 0.42)),
          Math.abs(local - Math.floor(spec.cycle * 0.82)),
        );
        const openness = blinkDistance === 0 ? 0.05 : blinkDistance === 1 ? 0.28 : blinkDistance === 2 ? 0.68 : 1;
        const appear = (Math.sin(((local / spec.cycle) * Math.PI * 2) - Math.PI / 2) + 1) / 2;
        const opacity = spec.maxOpacity * (0.28 + appear * 0.72);
        const xDrift = Math.sin((tick + spec.phase) * 0.018) * spec.drift;

        return (
          <pre
            key={spec.id}
            className="absolute m-0 select-none whitespace-pre font-mono leading-[0.78] transition-opacity duration-300"
            style={{
              left: `${spec.left}%`,
              top: `${spec.top}%`,
              color: spec.color,
              fontSize: `${spec.cell}px`,
              opacity,
              transform: `translate3d(${xDrift}px,0,0)`,
              textShadow: `0 0 14px ${spec.color}44`,
            }}
          >
            {makeEye(spec, tick, openness)}
          </pre>
        );
      })}
    </div>
  );
}
