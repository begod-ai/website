import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview image generated from the project's own visual system:
 * warm white field, the incomplete orbit, three seed points, the question.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,234,240,0.35), transparent 60%), #fcfcfa",
          color: "#11120f",
          fontFamily: "serif",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none">
          <path
            d="M 18.7 4.9 A 9.5 9.5 0 1 0 21.5 12"
            stroke="#11120f"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="21.5" cy="7.6" r="1.4" fill="#11120f" />
          <circle cx="12" cy="5.5" r="0.9" fill="#d8c26a" />
          <circle cx="6.5" cy="15.5" r="0.9" fill="#7bbecf" />
          <circle cx="17.5" cy="15.5" r="0.9" fill="#9aa4a8" />
        </svg>
        <div
          style={{
            fontSize: 76,
            fontWeight: 400,
            letterSpacing: "-2px",
            marginTop: 36,
          }}
        >
          What is worth wanting?
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 40,
            fontSize: 26,
            fontFamily: "monospace",
            color: "#5e625c",
          }}
        >
          <div>begod.ai</div>
          <div style={{ width: 5, height: 5, borderRadius: 3, background: "#5e625c" }} />
          <div>an Autotheos public benefit project</div>
        </div>
      </div>
    ),
    size,
  );
}
