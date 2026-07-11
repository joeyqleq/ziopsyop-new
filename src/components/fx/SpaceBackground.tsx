"use client";

import { useEffect, useRef } from "react";

interface Particle {
  radius: number;
  x: number;
  y: number;
  ring: number;
  move: number;
  random: number;
  hue: 0 | 1 | 2; // 0 = mint, 1 = dim white, 2 = amber spark
}

interface SpaceBackgroundProps {
  particleCount?: number;
  className?: string;
}

/**
 * Orbiting-particle starfield (adapted from designali-in/space-background).
 * Scoped to its parent section via absolute positioning — particles orbit
 * a central ring, which is exactly where the eye logo sits.
 * Mouse position subtly warps the orbit center.
 */
export function SpaceBackground({
  particleCount = 600,
  className = "",
}: SpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = [
      "rgba(182, 255, 124, 0.75)", // lime — #b6ff7c
      "rgba(123, 57, 208, 0.55)",  // purple — #7b39d0
      "rgba(155, 95, 224, 0.85)",  // bright purple spark — #9b5fe0
    ];

    const state = { particles: [] as Particle[], r: 130, counter: 0 };
    let ratio = 1;

    const setupCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ratio = rect.height < 480 ? 0.62 : 1;
      state.r = Math.min(rect.width, rect.height) * 0.35;
      ctx.setTransform(ratio, 0, 0, -ratio, canvas.width / 2, canvas.height / 2);
    };
    setupCanvas();

    const createParticle = () => {
      const roll = Math.random();
      state.particles.push({
        radius: Math.random() * 4.2,
        x: Math.cos(Math.random() * 7 + Math.PI) * state.r,
        y: Math.sin(Math.random() * 7 + Math.PI) * state.r,
        ring: Math.random() * state.r * 2.2,
        move: (Math.random() * 4 + 1) / 600,
        random: Math.random() * 7,
        hue: roll > 0.93 ? 2 : roll > 0.48 ? 1 : 0,
      });
    };
    for (let i = 0; i < particleCount; i++) createParticle();

    const onMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    parent.addEventListener("mousemove", onMouseMove);

    const loop = () => {
      ctx.clearRect(
        -canvas.width,
        -canvas.height,
        canvas.width * 2,
        canvas.height * 2
      );
      if (state.counter < state.particles.length) state.counter += 4;
      const ox = mouse.current.x * 35;
      const oy = -mouse.current.y * 35;
      const n = Math.min(state.counter, state.particles.length);
      for (let i = 0; i < n; i++) {
        const p = state.particles[i];
        if (p.radius < 0.8) {
          p.ring = Math.random() * state.r * 3;
          p.radius = Math.random() * 4.2;
        }
        p.radius *= 0.9955;
        p.ring = Math.max(p.ring - 1, state.r);
        p.random += p.move;
        p.x = Math.cos(p.random + Math.PI) * p.ring + ox;
        p.y = Math.sin(p.random + Math.PI) * p.ring + oy;
        ctx.beginPath();
        ctx.fillStyle = COLORS[p.hue];
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    const ro = new ResizeObserver(setupCanvas);
    ro.observe(parent);

    return () => {
      ro.disconnect();
      parent.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
