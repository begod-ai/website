"use client";

import { useEffect, useRef } from "react";

/**
 * The Field of Becoming — the hero's signature visual.
 *
 * An abstract, generative field: fine luminous strands in gold, cyan, and
 * silver drift through an invisible flow field like ink in water, weaving
 * and dissolving. Every few seconds a quiet "birth" ripple expands from a
 * point and releases a burst of new strands — creation, endless possibility,
 * nothing settled. Wordless and non-diagrammatic by design (the three-seed
 * diagram lives further down the page).
 *
 * Pauses offscreen and when the tab is hidden; simplifies on coarse-pointer
 * devices; renders a composed still frame under prefers-reduced-motion.
 */

const STRAND_COLORS = [
  "rgba(201, 174, 84, A)", // gold
  "rgba(123, 190, 207, A)", // cyan
  "rgba(154, 164, 168, A)", // silver
  "rgba(17, 18, 15, A)", // rare graphite
];

interface Strand {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  color: number;
  speed: number;
  drift: number;
}

interface Ripple {
  x: number;
  y: number;
  age: number;
}

export function FieldOfBecoming({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let visible = true;
    let t = 0;
    const mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const strandCount = isCoarse ? 110 : 220;
    const strands: Strand[] = [];
    const ripples: Ripple[] = [];
    let nextBirth = 200;

    function pickColor() {
      // graphite stays rare
      const r = Math.random();
      return r < 0.34 ? 0 : r < 0.68 ? 1 : r < 0.97 ? 2 : 3;
    }

    function spawn(x?: number, y?: number): Strand {
      return {
        x: x ?? Math.random() * w,
        y: y ?? Math.random() * h,
        age: 0,
        maxAge: 240 + Math.random() * 360,
        color: pickColor(),
        speed: 0.45 + Math.random() * 0.75,
        drift: (Math.random() - 0.5) * 0.6,
      };
    }

    /**
     * The invisible flow field: layered sines produce slow, organic currents
     * that themselves evolve over time — no fixed pattern, no repetition.
     */
    function flowAngle(x: number, y: number, time: number) {
      const s = 0.0016;
      return (
        Math.sin(x * s + time * 0.00012) * 1.6 +
        Math.cos(y * s * 1.3 - time * 0.00009) * 1.4 +
        Math.sin((x + y) * s * 0.6 + time * 0.00005) * 1.1
      );
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // repaint the base so a resize never flashes a hard-edged clear
      ctx!.fillStyle = "rgba(252, 252, 250, 1)";
      ctx!.fillRect(0, 0, w, h);
    }

    function step(time: number) {
      t++;

      // the field forgets slowly — trails linger, then dissolve into light
      ctx!.fillStyle = "rgba(252, 252, 250, 0.055)";
      ctx!.fillRect(0, 0, w, h);

      // birth events: a quiet ripple, and new strands released from it
      if (t > nextBirth) {
        const bx = w * (0.25 + Math.random() * 0.5);
        const by = h * (0.25 + Math.random() * 0.5);
        ripples.push({ x: bx, y: by, age: 0 });
        for (let i = 0; i < 16; i++) {
          const s = spawn(bx, by);
          s.maxAge = 300 + Math.random() * 300;
          strands.push(s);
        }
        nextBirth = t + 300 + Math.random() * 320;
      }

      // ripples: barely-there expanding rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age++;
        const radius = r.age * 0.9;
        const fade = Math.max(0, 1 - r.age / 160);
        if (fade <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(17, 18, 15, ${0.05 * fade})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // strands: advected by the flow, gently bent by the visitor's presence
      for (let i = 0; i < strands.length; i++) {
        const p = strands[i];
        let a = flowAngle(p.x, p.y, time) + p.drift;

        if (!isCoarse) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 32000) {
            // possibilities gather softly toward attention
            a = a * 0.9 + Math.atan2(dy, dx) * 0.1;
          }
        }

        const nx = p.x + Math.cos(a) * p.speed;
        const ny = p.y + Math.sin(a) * p.speed;
        p.age++;

        const fade =
          Math.min(1, p.age / 50) * Math.min(1, (p.maxAge - p.age) / 60);
        const alpha = (p.color === 3 ? 0.1 : 0.16) * fade;
        ctx!.strokeStyle = STRAND_COLORS[p.color].replace("A", alpha.toFixed(3));
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(nx, ny);
        ctx!.stroke();

        p.x = nx;
        p.y = ny;

        const out = p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20;
        if (out || p.age > p.maxAge) strands[i] = spawn();
      }
      // trim burst surplus back toward the baseline population
      if (strands.length > strandCount) {
        strands.splice(0, strands.length - strandCount);
      }
    }

    function loop(time: number) {
      if (!running || !visible) return;
      step(time);
      raf = requestAnimationFrame(loop);
    }

    function drawStill() {
      // compose a finished-looking frame by running the field silently
      ctx!.fillStyle = "rgba(252, 252, 250, 1)";
      ctx!.fillRect(0, 0, w, h);
      for (let i = 0; i < 400; i++) step(i * 16);
    }

    resize();
    for (let i = 0; i < strandCount; i++) {
      const s = spawn();
      s.age = Math.floor(Math.random() * s.maxAge * 0.6);
      strands.push(s);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) drawStill();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && running && !reduced) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running && visible && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    if (!isCoarse && !reduced) {
      window.addEventListener("mousemove", onMouse, { passive: true });
    }

    if (reduced) {
      drawStill();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
    />
  );
}
