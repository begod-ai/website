import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import {
  PageHero,
  SectionLabel,
  StatusBadge,
  CTASection,
} from "@/components/primitives";
import { researchEntries, progressLog } from "@/content/research";

export const metadata: Metadata = {
  title: "Research",
  description:
    "The open questions behind begod.ai: goal formation, revision, identity, contradiction, moral reflection, autoprompting, economic agency, evaluation, and governance.",
};

export default function ResearchPage() {
  return (
    <>
      <PageHero
        label="Research"
        title={
          <>
            The unanswered questions <em className="italic">are</em> the work.
          </>
        }
        lede="begod.ai is organised around questions rather than deliverables. Each entry below states a question, the current hypothesis, and how the project intends to put it under pressure. Entries marked conceptual or proposed are exactly that — no findings are claimed."
      />

      {/* Research entries */}
      <section>
        <div className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28">
          <div className="space-y-8">
            {researchEntries.map((entry, i) => (
              <Reveal key={entry.id}>
                <details
                  className="group rounded-2xl border hairline bg-surface open:shadow-[0_8px_40px_rgba(17,18,15,0.05)]"
                  open={i === 0}
                >
                  <summary className="flex cursor-pointer list-none flex-col gap-3 p-7 sm:flex-row sm:items-start sm:justify-between md:p-8 [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="label-mono">{entry.area}</span>
                      <span className="mt-2 block font-serif text-xl leading-snug font-light md:text-2xl">
                        {entry.question}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={entry.status} />
                      <span
                        aria-hidden="true"
                        className="font-mono text-ink-2 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <div className="grid gap-x-10 gap-y-6 border-t hairline p-7 md:grid-cols-2 md:p-8">
                    <div>
                      <p className="label-mono">Current hypothesis</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-2">{entry.hypothesis}</p>
                    </div>
                    <div>
                      <p className="label-mono">Intended experiment</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-2">{entry.experiment}</p>
                    </div>
                    <div>
                      <p className="label-mono">Evidence</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-2">{entry.evidence}</p>
                    </div>
                    <div>
                      <p className="label-mono">Known failure modes</p>
                      <ul className="mt-2 space-y-1.5">
                        {entry.failureModes.map((f) => (
                          <li key={f} className="flex gap-2.5 text-sm text-ink-2">
                            <span aria-hidden="true" className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="label-mono">Open issues</p>
                      <ul className="mt-2 space-y-1.5">
                        {entry.openIssues.map((o) => (
                          <li key={o} className="flex gap-2.5 text-sm text-ink-2">
                            <span aria-hidden="true" className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="label-mono">Related components · last updated</p>
                      <p className="mt-2 font-mono text-xs leading-relaxed text-ink-2">
                        {entry.relatedComponents.join(" · ")}
                        <br />
                        {entry.lastUpdated}
                      </p>
                    </div>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Progress log */}
      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionLabel>Progress log</SectionLabel>
            <h2 className="text-title mt-6">Where the project actually is.</h2>
            <p className="mt-5 max-w-2xl text-ink-2">
              Phases are used instead of dates until a public timeline exists.
              Newest first.
            </p>
          </Reveal>
          <ol className="mt-14 space-y-0 border-l hairline">
            {progressLog.map((entry) => (
              <Reveal key={entry.phase}>
                <li className="relative pb-10 pl-8">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full border-2 border-bg bg-ink"
                  />
                  <p className="label-mono">{entry.phase}</p>
                  <h3 className="mt-1.5 font-medium">{entry.title}</h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-2">
                    {entry.detail}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CTASection
        title="Bring a harder question."
        subtitle="If you can see a failure mode this page is missing, the project needs you."
        primaryHref="/join"
        primaryLabel="Join the movement"
        secondaryHref="/architecture"
        secondaryLabel="Explore the architecture"
      />
    </>
  );
}
