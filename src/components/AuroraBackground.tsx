"use client";

import { useEffect, useRef } from "react";

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return;

    const vertSrc = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `;

    const fragSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      vec3 palette(float t) {
        vec3 a = vec3(0.02, 0.01, 0.08);
        vec3 b = vec3(0.4, 0.2, 0.6);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.0, 0.33, 0.67);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.15;

        float n = 0.0;
        vec2 p = uv * 3.0;
        for (float i = 1.0; i < 8.0; i++) {
          p.x += 0.7 / i * sin(i * 3.0 * p.y + t + 0.3 * i) + 0.8;
          p.y += 0.7 / i * cos(i * 3.0 * p.x + t + 0.3 * i) + 0.8;
        }
        n = sin(p.x + p.y);

        vec3 color = palette(n * 0.5 + 0.5 + t * 0.1);
        color *= 0.35;
        color += vec3(0.01, 0.005, 0.03);

        float vignette = 1.0 - length((uv - 0.5) * 1.3);
        color *= smoothstep(0.0, 0.7, vignette);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type)!;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");

    let animId: number;
    const start = Date.now();

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    function render() {
      const elapsed = (Date.now() - start) / 1000;
      gl!.uniform1f(uTime, elapsed);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ pointerEvents: "none" }}
    />
  );
}
