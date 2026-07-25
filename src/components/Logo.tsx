/**
 * The begod.ai mark: an open circle — an orbit that never closes —
 * with a point of light travelling the gap. Openness and becoming.
 */
export function OrbitMark({
  size = 22,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g className={animated ? "orbit-slow" : undefined}>
        {/* incomplete orbit: a circle with a deliberate gap */}
        <path
          d="M 18.7 4.9 A 9.5 9.5 0 1 0 21.5 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* the point entering the gap */}
        <circle cx="21.5" cy="7.6" r="1.7" fill="currentColor" />
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <OrbitMark size={22} />
      <span className="text-[1.05rem] font-medium tracking-tight lowercase">
        begod<span className="text-ink-2">.ai</span>
      </span>
    </span>
  );
}
