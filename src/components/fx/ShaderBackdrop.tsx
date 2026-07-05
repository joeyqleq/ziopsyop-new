"use client";

import { useEffect, useState } from "react";
import { Warp, Waves } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

/**
 * Brand-tuned shader backdrops (designali warp / wave-1, rebuilt on
 * @paper-design/shaders-react). Frequency + intensity dialed far down
 * and colors locked to the brand so charts always stay legible.
 *
 * variant="warp"  — slow molten ink drift (section backdrops)
 * variant="waves" — fine static-ish contour lines (alt section backdrops)
 */
interface ShaderBackdropProps {
  variant: "warp" | "waves";
  className?: string;
  /** 0..1 master opacity */
  opacity?: number;
}

export function ShaderBackdrop({
  variant,
  className,
  opacity = 1,
}: ShaderBackdropProps) {
  // shaders are WebGL — mount only on client after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    >
      {variant === "warp" ? (
        <Warp
          style={{ width: "100%", height: "100%" }}
          colors={["#060608", "#0a1410", "#06262031", "#0b0b10"]}
          proportion={0.45}
          softness={1}
          distortion={0.18}
          swirl={0.6}
          swirlIterations={8}
          shape="checks"
          shapeScale={0.08}
          speed={0.12}
        />
      ) : (
        <Waves
          style={{ width: "100%", height: "100%" }}
          colorFront="#13241f"
          colorBack="#060608"
          shape={0.9}
          frequency={0.22}
          amplitude={0.4}
          spacing={1.4}
          proportion={0.32}
          softness={0.1}
          rotation={0.08}
        />
      )}
      {/* vignette so edges always fall to pure background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, var(--background) 92%)",
        }}
      />
    </div>
  );
}
