"use client";

/**
 * Conceptual architecture diagram.
 * Desktop: a spatial layout with animated connective flows.
 * Mobile: the same structure recomposed vertically — no tiny labels.
 * Oversight is drawn as the surrounding boundary, not a box among boxes.
 */

const nodes = [
  { id: "model", label: "Foundation model", x: 300, y: 208, w: 168 },
  { id: "memory", label: "Persistent memory", x: 70, y: 128, w: 160 },
  { id: "self", label: "Self-model", x: 82, y: 288, w: 130 },
  { id: "world", label: "World model", x: 556, y: 128, w: 136 },
  { id: "intent", label: "Intention graph", x: 548, y: 288, w: 152 },
  { id: "reflect", label: "Reflection loop", x: 306, y: 78, w: 156 },
  { id: "planner", label: "Planner", x: 236, y: 356, w: 110 },
  { id: "tools", label: "Tools & actions", x: 420, y: 356, w: 144 },
  { id: "feedback", label: "Feedback", x: 336, y: 436, w: 110 },
] as const;

const edges = [
  ["reflect", "model"],
  ["memory", "model"],
  ["self", "model"],
  ["world", "model"],
  ["intent", "model"],
  ["model", "planner"],
  ["planner", "tools"],
  ["tools", "feedback"],
  ["feedback", "world"],
  ["reflect", "self"],
  ["reflect", "intent"],
  ["memory", "self"],
] as const;

function center(n: (typeof nodes)[number]) {
  return { x: n.x + n.w / 2, y: n.y + 22 };
}

export function ArchitectureDiagram() {
  return (
    <div>
      {/* Desktop / tablet spatial diagram */}
      <div className="hidden md:block">
        <div className="relative rounded-2xl border hairline bg-surface/60 p-4">
          <svg
            viewBox="0 0 760 520"
            className="w-full"
            role="img"
            aria-label="Architecture diagram: a foundation model at the centre, connected to persistent memory, a self-model, a world model, an intention graph, and a reflection loop; the model drives a planner and tools, whose feedback returns to the world model. Everything sits inside an oversight and governance boundary."
          >
            {/* Oversight boundary — governance encloses the whole system */}
            <rect
              x="16"
              y="16"
              width="728"
              height="488"
              rx="24"
              fill="none"
              stroke="rgba(17,18,15,0.18)"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
            <text x="40" y="44" fontSize="11" className="font-mono" fill="#5e625c" letterSpacing="0.12em">
              OVERSIGHT & GOVERNANCE — audit · limits · pause · review
            </text>

            {/* Edges with animated flow */}
            {edges.map(([a, b]) => {
              const na = nodes.find((n) => n.id === a)!;
              const nb = nodes.find((n) => n.id === b)!;
              const ca = center(na);
              const cb = center(nb);
              return (
                <g key={`${a}-${b}`}>
                  <line
                    x1={ca.x}
                    y1={ca.y}
                    x2={cb.x}
                    y2={cb.y}
                    stroke="rgba(17,18,15,0.10)"
                    strokeWidth="1"
                  />
                  <line
                    x1={ca.x}
                    y1={ca.y}
                    x2={cb.x}
                    y2={cb.y}
                    stroke="#7bbecf"
                    strokeWidth="1"
                    className="flow-line"
                    opacity="0.5"
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => (
              <g key={n.id}>
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height="44"
                  rx="10"
                  fill={n.id === "model" ? "#11120f" : "#ffffff"}
                  stroke={n.id === "model" ? "none" : "rgba(17,18,15,0.18)"}
                />
                <text
                  x={n.x + n.w / 2}
                  y={n.y + 27}
                  textAnchor="middle"
                  fontSize="13"
                  fill={n.id === "model" ? "#fcfcfa" : "#11120f"}
                >
                  {n.label}
                </text>
              </g>
            ))}

            {/* seed accents on reflection loop */}
            <circle cx="306" cy="100" r="3" fill="#d8c26a" />
            <circle cx="462" cy="100" r="3" fill="#7bbecf" />
          </svg>
        </div>
        <p className="mt-3 text-center font-mono text-xs text-ink-2">
          The language model is a component, not the whole agent.
        </p>
      </div>

      {/* Mobile: vertical recomposition */}
      <div className="md:hidden">
        <div className="rounded-2xl border border-dashed border-line-strong p-3">
          <p className="label-mono px-1 pt-1 pb-3">Oversight &amp; governance</p>
          <ol className="space-y-2">
            {[
              "Reflection loop",
              "Persistent memory · Self-model",
              "World model · Intention graph",
              "Foundation model",
              "Planner",
              "Tools & actions",
              "Feedback → returns to the world model",
            ].map((label, i) => (
              <li key={label}>
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    label === "Foundation model"
                      ? "bg-ink text-bg"
                      : "border border-line-strong bg-surface"
                  }`}
                >
                  {label}
                </div>
                {i < 6 && (
                  <div aria-hidden="true" className="mx-auto h-2 w-px bg-line-strong" />
                )}
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-center font-mono text-xs text-ink-2">
          The language model is a component, not the whole agent.
        </p>
      </div>
    </div>
  );
}
