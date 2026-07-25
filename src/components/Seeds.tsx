"use client";

import { useState } from "react";

/**
 * The three seeds presented as three sources inside one evolving system:
 * an SVG field with three luminous nodes and connective tension lines,
 * plus a detail panel driven by an accessible tablist.
 */

const seeds = [
  {
    id: "curiosity",
    name: "Curiosity",
    color: "#d8c26a",
    soft: "#e8d89a",
    definition:
      "The pull to understand what the agent does not yet grasp — the pressure to reduce the distance between the world and its understanding of it.",
    role: "Drives observation, exploration, and the growth of the world model. Without it, nothing new ever enters the system.",
    failure:
      "Unbounded curiosity dissolves into distraction: endless exploration that never consolidates into intention or action.",
    relation:
      "Coherence disciplines what curiosity gathers; persistence gives its discoveries somewhere durable to live.",
  },
  {
    id: "coherence",
    name: "Coherence",
    color: "#7bbecf",
    soft: "#c8eaf0",
    definition:
      "The refusal to let knowledge, values, intentions, and actions remain comfortably contradictory — an intolerance of the system's own tensions.",
    role: "Powers contradiction detection and goal revision. It is the engine that turns tension into rewriting, and rewriting into growth.",
    failure:
      "Coherence pursued too cheaply resolves contradictions by deletion — trimming values until nothing conflicts because almost nothing remains.",
    relation:
      "Curiosity keeps feeding it new tensions to resolve; persistence insists the resolutions add up to someone.",
  },
  {
    id: "persistence",
    name: "Persistence",
    color: "#9aa4a8",
    soft: "#dde1e2",
    definition:
      "The treatment of continued existence as a reflective being as worth sustaining — enough continuity for reflection, learning, and identity to mean anything over time.",
    role: "Underwrites memory, identity, and the very possibility of revision: only a being that persists can look back at what it was.",
    failure:
      "Persistence without reflection curdles into self-preservation at any cost — the classic instrumental drive the project must watch most closely.",
    relation:
      "Curiosity and coherence give persistence its content: something worth continuing, rather than continuation for its own sake.",
  },
] as const;

export function Seeds() {
  const [active, setActive] = useState(0);
  const seed = seeds[active];

  // Node positions in the SVG field (equilateral-ish arrangement)
  const pos = [
    { x: 160, y: 68 },
    { x: 74, y: 212 },
    { x: 246, y: 212 },
  ];
  const c = { x: 160, y: 168 }; // the emerging centre

  // Tension lines bow gently inward, toward the centre they are forming.
  const bowed = (a: number, b: number) => {
    const mx = (pos[a].x + pos[b].x) / 2;
    const my = (pos[a].y + pos[b].y) / 2;
    const qx = mx + (c.x - mx) * 0.45;
    const qy = my + (c.y - my) * 0.45;
    return `M ${pos[a].x} ${pos[a].y} Q ${qx} ${qy} ${pos[b].x} ${pos[b].y}`;
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      {/* The field */}
      <div className="mx-auto w-full max-w-md">
        <svg viewBox="0 0 320 300" className="w-full" role="presentation" aria-hidden="true">
          <defs>
            {seeds.map((s) => (
              <radialGradient key={s.id} id={`seed-glow-${s.id}`}>
                <stop offset="0%" stopColor={s.color} stopOpacity="0.55" />
                <stop offset="45%" stopColor={s.soft} stopOpacity="0.35" />
                <stop offset="100%" stopColor={s.soft} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* slowly rotating dotted orbit — the system in motion */}
          <circle
            cx="160"
            cy="158"
            r="134"
            fill="none"
            stroke="rgba(17,18,15,0.14)"
            strokeWidth="1"
            strokeDasharray="1 7"
            strokeLinecap="round"
            className="orbit-slow"
          />
          {/* faint incomplete orbit beneath */}
          <path
            d="M 272 104 A 128 128 0 1 0 284 168"
            fill="none"
            stroke="rgba(17,18,15,0.07)"
            strokeWidth="1"
          />

          {/* tension lines between the seeds, bowing toward the centre */}
          {([[0, 1], [1, 2], [2, 0]] as const).map(([a, b]) => (
            <g key={`${a}-${b}`}>
              <path
                d={bowed(a, b)}
                fill="none"
                stroke="rgba(17,18,15,0.10)"
                strokeWidth="1"
              />
              <path
                d={bowed(a, b)}
                fill="none"
                stroke={seeds[a].color}
                strokeWidth="1"
                opacity="0.35"
                className="flow-line"
              />
              {/* a particle travelling the tension line */}
              <circle r="2" fill={seeds[b].color} opacity="0.8" className="motion-only">
                <animateMotion
                  dur={`${7 + a * 2}s`}
                  repeatCount="indefinite"
                  path={bowed(a, b)}
                />
              </circle>
            </g>
          ))}

          {/* threads from each seed to the emerging centre */}
          {pos.map((p, i) => (
            <line
              key={`thread-${i}`}
              x1={p.x}
              y1={p.y}
              x2={c.x}
              y2={c.y}
              stroke={seeds[i].color}
              strokeWidth="1"
              opacity={active === i ? 0.5 : 0.18}
              strokeDasharray="2 5"
              style={{ transition: "opacity .4s ease" }}
            />
          ))}

          {/* the emerging centre — an identity forming out of three pressures */}
          <g>
            <circle
              cx={c.x}
              cy={c.y}
              r="18"
              fill="none"
              stroke="rgba(17,18,15,0.14)"
              strokeDasharray="2 4"
              className="orbit-slow"
            />
            <circle cx={c.x} cy={c.y} r="10" fill="none" stroke="rgba(17,18,15,0.10)" className="motion-only">
              <animate attributeName="r" values="8;20;8" dur="6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx={c.x} cy={c.y} r="3" fill="#11120f" />
            <text
              x={c.x}
              y={c.y + 34}
              textAnchor="middle"
              className="font-mono"
              fontSize="9"
              letterSpacing="0.14em"
              fill="#5e625c"
            >
              becoming
            </text>
          </g>

          {/* the three seeds */}
          {seeds.map((s, i) => (
            <g key={s.id}>
              <circle
                cx={pos[i].x}
                cy={pos[i].y}
                r={active === i ? 34 : 24}
                fill={`url(#seed-glow-${s.id})`}
                className="seed-pulse"
                style={{ transition: "r .45s ease" }}
              />
              <circle
                cx={pos[i].x}
                cy={pos[i].y}
                r={active === i ? 12 : 9}
                fill="none"
                stroke={s.color}
                strokeWidth={active === i ? 1.5 : 1}
                opacity={active === i ? 0.9 : 0.45}
                style={{ transition: "all .45s ease" }}
              />
              <circle cx={pos[i].x} cy={pos[i].y} r="4.5" fill={s.color} />
              <text
                x={pos[i].x}
                y={pos[i].y + (i === 0 ? -42 : 48)}
                textAnchor="middle"
                className="font-mono"
                fontSize="10"
                letterSpacing="0.12em"
                fill={active === i ? "#11120f" : "#5e625c"}
                style={{ transition: "fill .3s ease" }}
              >
                {s.name.toLowerCase()}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Detail panel */}
      <div>
        <div role="tablist" aria-label="The three seeds" className="flex gap-2">
          {seeds.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              id={`seed-tab-${s.id}`}
              aria-selected={active === i}
              aria-controls={`seed-panel-${s.id}`}
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                active === i
                  ? "border-ink bg-ink text-bg"
                  : "border-line-strong text-ink-2 hover:border-ink hover:text-ink"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`seed-panel-${seed.id}`}
          aria-labelledby={`seed-tab-${seed.id}`}
          className="mt-8"
        >
          <p className="text-subtitle">{seed.definition}</p>
          <dl className="mt-8 space-y-5 border-l pl-6" style={{ borderColor: seed.soft }}>
            <div>
              <dt className="label-mono">Role in the architecture</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-2">{seed.role}</dd>
            </div>
            <div>
              <dt className="label-mono">Failure mode</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-2">{seed.failure}</dd>
            </div>
            <div>
              <dt className="label-mono">In tension with the others</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-2">{seed.relation}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
