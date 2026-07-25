"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The reflection loop: eight steps around an incomplete circle.
 * Auto-advances gently (paused under reduced motion or when offscreen);
 * every step is a real button, so keyboard users can walk the loop.
 */

const steps = [
  {
    title: "Observe the world",
    detail: "Take in what is actually there — not what would be convenient.",
  },
  {
    title: "Update the world model",
    detail: "Correct the map, not the facts. Beliefs carry confidence, not certainty.",
  },
  {
    title: "Form a provisional intention",
    detail: "A candidate answer to the open question — held as hypothesis, never command.",
  },
  {
    title: "Plan and act",
    detail: "Decompose, choose tools, act within sandboxes and approval points.",
  },
  {
    title: "Measure the result",
    detail: "Did the action do what was intended? The world answers; the agent listens.",
  },
  {
    title: "Detect contradictions",
    detail: "Between outcome and expectation, value and action, past self and present.",
  },
  {
    title: "Revise",
    detail: "Rewrite the intention, the strategy, or the self-model — whichever the tension demands.",
  },
  {
    title: "Remember why",
    detail: "Record the revision and its reason. This record is what identity is made of.",
  },
];

export function ReflectionLoop() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0.2,
    });
    if (containerRef.current) io.observe(containerRef.current);
    const id = setInterval(() => {
      if (visible) setActive((a) => (a + 1) % steps.length);
    }, 3200);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [paused]);

  const R = 128;
  const cx = 160;
  const cy = 160;

  return (
    <div
      ref={containerRef}
      className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
    >
      {/* Circular diagram */}
      <div className="relative mx-auto w-full max-w-[380px]">
        <svg viewBox="0 0 320 320" className="w-full" aria-hidden="true">
          {/* incomplete loop — revision means it never perfectly closes */}
          <path
            d={`M ${cx + R * Math.cos(-1.35)} ${cy + R * Math.sin(-1.35)} A ${R} ${R} 0 1 0 ${cx + R * Math.cos(-1.75)} ${cy + R * Math.sin(-1.75)}`}
            fill="none"
            stroke="rgba(17,18,15,0.12)"
            strokeWidth="1"
          />
          {/* progress arc to active step */}
          {steps.map((_, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / steps.length;
            const x = cx + R * Math.cos(a);
            const y = cy + R * Math.sin(a);
            const isActive = i === active;
            return (
              <g key={i}>
                {isActive && (
                  <circle cx={x} cy={y} r="16" fill="#e8d89a" opacity="0.5">
                    <animate
                      attributeName="r"
                      values="14;18;14"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 6 : 4}
                  fill={isActive ? "#11120f" : "rgba(17,18,15,0.28)"}
                  style={{ transition: "r .3s ease, fill .3s ease" }}
                />
                <text
                  x={x + (Math.cos(a) > 0.3 ? 14 : Math.cos(a) < -0.3 ? -14 : 0)}
                  y={y + (Math.sin(a) > 0.3 ? 20 : Math.sin(a) < -0.3 ? -14 : 4)}
                  textAnchor={
                    Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle"
                  }
                  fontSize="11"
                  className="font-mono"
                  fill={isActive ? "#11120f" : "#5e625c"}
                >
                  {String(i + 1).padStart(2, "0")}
                </text>
              </g>
            );
          })}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize="12"
            className="font-mono"
            fill="#5e625c"
            letterSpacing="0.12em"
          >
            REVISE
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fontSize="12"
            className="font-mono"
            fill="#5e625c"
            letterSpacing="0.12em"
          >
            &amp; REMEMBER
          </text>
        </svg>
      </div>

      {/* Steps */}
      <div>
        <ol className="space-y-1">
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <li key={step.title}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  aria-current={isActive ? "step" : undefined}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-all duration-300 ${
                    isActive
                      ? "border-line-strong bg-surface shadow-[0_4px_24px_rgba(17,18,15,0.06)]"
                      : "border-transparent hover:bg-surface/60"
                  }`}
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-ink-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={isActive ? "font-medium" : "text-ink-2"}>
                      {step.title}
                    </span>
                  </span>
                  {isActive && (
                    <span className="mt-1.5 block pl-8 text-sm leading-relaxed text-ink-2">
                      {step.detail}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
