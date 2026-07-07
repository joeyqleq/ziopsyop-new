"use client";
import React, { useEffect, useRef, useMemo, useCallback } from "react";

interface CanvasRevealEffectProps {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
}

function DotMatrix({
  colors = [[0, 255, 255]],
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  totalSize = 4,
  dotSize = 2,
  shader = "",
}: {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
}) {
  const uniforms = useMemo(
    () => ({
      u_colors: {
        value: colors.map((color) => [color[0] / 255, color[1] / 255, color[2] / 255]),
        type: "uniform3fv",
      },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
    }),
    [colors, opacities, totalSize, dotSize]
  );

  return (
    <ShaderCanvas
      source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;

        float random(vec2 xy) {
          return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }

        float map(float value, float min1, float max1, float min2, float max2) {
          return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
          vec2 st = fragCoord.xy;
          float opacity = step(0.0, st.x) * step(0.0, st.y);

          vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

          float frequency = 5.0;
          float show_offset = random(st2);
          float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency) + 1.0);
          opacity *= u_opacities[int(rand * 10.0)];
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

          vec3 color = u_colors[int(show_offset * 6.0)];

          ${shader}

          fragColor = vec4(color, opacity);
          fragColor.rgb *= fragColor.a;
        }
      `}
      uniforms={uniforms}
      maxFps={60}
    />
  );
}

type Uniform = {
  value: number | number[] | number[][];
  type: string;
};

function ShaderCanvas({
  source,
  uniforms = {},
  maxFps = 60,
}: {
  source: string;
  uniforms?: Record<string, Uniform>;
  maxFps?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const programRef = useRef<WebGLProgram | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);

  const buildProgram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;
    glRef.current = gl;

    const vert = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vert, `#version 300 es\nin vec4 aPosition;\nvoid main(){gl_Position=aPosition;}`);
    gl.compileShader(vert);

    const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(frag, `#version 300 es\n${source}`);
    gl.compileShader(frag);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    programRef.current = prog;
    gl.useProgram(prog);

    // quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }, [source]);

  useEffect(() => {
    buildProgram();
    const gl = glRef.current;
    const prog = programRef.current;
    if (!gl || !prog) return;

    let last = 0;
    const interval = 1000 / maxFps;

    function render(ts: number) {
      if (!gl || !prog) return;
      animFrameRef.current = requestAnimationFrame(render);
      if (ts - last < interval) return;
      last = ts;

      const canvas = canvasRef.current!;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      const timeLoc = gl.getUniformLocation(prog, "u_time");
      gl.uniform1f(timeLoc, ts * 0.001);

      const resLoc = gl.getUniformLocation(prog, "u_resolution");
      gl.uniform2f(resLoc, canvas.width, canvas.height);

      for (const [key, uniform] of Object.entries(uniforms)) {
        const l = gl.getUniformLocation(prog, key);
        if (!l) continue;
        if (uniform.type === "uniform1f") gl.uniform1f(l, uniform.value as number);
        else if (uniform.type === "uniform1fv") gl.uniform1fv(l, uniform.value as number[]);
        else if (uniform.type === "uniform3fv") {
          gl.uniform3fv(l, (uniform.value as number[][]).flat());
        }
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [buildProgram, maxFps, uniforms]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export function CanvasRevealEffect({
  animationSpeed = 0.4,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[182, 255, 124]],
  containerClassName,
  dotSize = 3,
  showGradient = true,
}: CanvasRevealEffectProps) {
  return (
    <div className={`h-full relative bg-black/90 ${containerClassName ?? ""}`}>
      <div className="h-full w-full absolute inset-0">
        <DotMatrix
          colors={colors}
          dotSize={dotSize}
          opacities={opacities}
          shader={`
            float intro_offset = distance(u_resolution / 2.0 / u_total_size, st2) * 0.01 + (random(st2) * 0.15);
            opacity *= step(intro_offset, u_time * ${animationSpeed.toFixed(2)});
            opacity *= clamp((1.0 - step(intro_offset + 0.1, u_time * ${animationSpeed.toFixed(2)})) * 1.25, 1.0, 1.25);
          `}
          totalSize={4}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      )}
    </div>
  );
}
