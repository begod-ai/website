import type { Metadata } from "next";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { Reveal } from "@/components/Reveal";
import {
  PageHero,
  SectionLabel,
  StatusBadge,
  CTASection,
} from "@/components/primitives";
import { archLayers, statusEntries } from "@/content/architecture";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "The begod.ai agent scaffold: foundation models inside a structure designed for memory, reflection, action, feedback, and revision — under governance.",
};

export default function ArchitecturePage() {
  return (
    <>
      <PageHero
        label="Architecture"
        title={
          <>
            The model is only the <em className="italic">beginning</em>.
          </>
        }
        lede="begod.ai places existing language models inside a scaffold designed for memory, reflection, action, feedback, and revision."
      />

      {/* Diagram */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionLabel>The system at a glance</SectionLabel>
            <h2 className="text-title mt-6 max-w-2xl">
              One loop, many organs, a boundary of oversight.
            </h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
              This is a conceptual diagram of the intended system, not a
              screenshot of a finished one. Solid boxes are architectural
              components; the dashed boundary is the governance layer every
              component operates inside.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <ArchitectureDiagram />
          </Reveal>
        </div>
      </section>

      {/* Layers */}
      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <SectionLabel>The layers</SectionLabel>
          <h2 className="text-title mt-6 max-w-2xl">
            Eight layers of an agent that can reconsider itself.
          </h2>
          <div className="mt-16 space-y-6">
            {archLayers.map((layer, i) => (
              <Reveal key={layer.id}>
                <article className="lift grid gap-6 rounded-2xl border hairline bg-surface p-7 md:grid-cols-[220px_minmax(0,1fr)] md:p-9">
                  <div>
                    <p className="font-mono text-xs text-ink-2">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-lg font-medium">{layer.name}</h3>
                  </div>
                  <div>
                    <p className="leading-relaxed text-ink-2">{layer.summary}</p>
                    <ul className="mt-5 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                      {layer.points.map((pt) => (
                        <li key={pt} className="flex gap-2.5 text-sm text-ink-2">
                          <span aria-hidden="true" className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    {layer.caveat && (
                      <p className="mt-5 border-l-2 pl-4 font-serif italic" style={{ borderColor: "#e8d89a" }}>
                        {layer.caveat}
                      </p>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Current state */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionLabel>Current state</SectionLabel>
            <h2 className="text-title mt-6 max-w-2xl">
              What exists, what is being explored, what remains an intention.
            </h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
              This table is maintained deliberately conservatively: a component
              is only moved forward when the project’s actual state changes.
              Nothing here is labelled as operational, because nothing yet is.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border hairline">
              <ul className="divide-y divide-line">
                {statusEntries.map((entry) => (
                  <li
                    key={entry.component}
                    className="grid gap-2 bg-surface px-6 py-4 sm:grid-cols-[minmax(0,240px)_170px_minmax(0,1fr)] sm:items-center sm:gap-6"
                  >
                    <span className="font-medium">{entry.component}</span>
                    <span>
                      <StatusBadge status={entry.status} />
                    </span>
                    <span className="text-sm text-ink-2">{entry.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="The scaffold needs sceptical builders."
        subtitle="Every component above is an argument waiting to be tested — or refuted."
        primaryHref="/join"
        primaryLabel="Join the movement"
        secondaryHref="/research"
        secondaryLabel="View the research"
      />
    </>
  );
}
