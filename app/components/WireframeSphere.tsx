"use client";

import { useEffect, useRef } from "react";

export default function WireframeSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function rotateY(x: number, y: number, z: number, a: number) {
      return {
        x: x * Math.cos(a) + z * Math.sin(a),
        y,
        z: -x * Math.sin(a) + z * Math.cos(a),
      };
    }

    function rotateX(x: number, y: number, z: number, a: number) {
      return {
        x,
        y: y * Math.cos(a) - z * Math.sin(a),
        z: y * Math.sin(a) + z * Math.cos(a),
      };
    }

    function project(x: number, y: number, z: number, W: number, H: number) {
      const FL = 500;
      const scale = FL / (FL + z);
      return { sx: W / 2 + x * scale, sy: H / 2 + y * scale, scale };
    }

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const R = Math.min(W, H) * 0.38;
      const tiltX = 0.3;

      const LAT = 9;
      const LON = 14;
      const SEG = 64;

      // latitude rings
      for (let i = 1; i < LAT; i++) {
        const phi = (Math.PI / LAT) * i - Math.PI / 2;
        const r = R * Math.cos(phi);
        const y0 = R * Math.sin(phi);
        ctx.beginPath();
        for (let j = 0; j <= SEG; j++) {
          const theta = (2 * Math.PI * j) / SEG;
          let p = { x: r * Math.cos(theta), y: y0, z: r * Math.sin(theta) };
          p = rotateX(p.x, p.y, p.z, tiltX);
          p = rotateY(p.x, p.y, p.z, angle);
          const { sx, sy } = project(p.x, p.y, p.z, W, H);
          const depth = (p.z + R) / (2 * R);
          const alpha = depth * 0.55 + 0.08;
          if (j === 0) {
            ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // longitude lines
      for (let i = 0; i < LON; i++) {
        const theta = (2 * Math.PI * i) / LON;
        ctx.beginPath();
        for (let j = 0; j <= SEG; j++) {
          const phi = (Math.PI * j) / SEG - Math.PI / 2;
          let p = {
            x: R * Math.cos(phi) * Math.cos(theta),
            y: R * Math.sin(phi),
            z: R * Math.cos(phi) * Math.sin(theta),
          };
          p = rotateX(p.x, p.y, p.z, tiltX);
          p = rotateY(p.x, p.y, p.z, angle);
          const { sx, sy } = project(p.x, p.y, p.z, W, H);
          const depth = (p.z + R) / (2 * R);
          const alpha = depth * 0.5 + 0.08;
          if (j === 0) {
            ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // subtle glow at center
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 0.5);
      grad.addColorStop(0, "rgba(59,130,246,0.06)");
      grad.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      angle += 0.0028;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
