import type { Metadata } from "next";
import { JoinForm } from "@/components/forms";
import { Reveal } from "@/components/Reveal";
import { PageHero, SectionLabel } from "@/components/primitives";
import { ExternalLinkItem } from "@/components/ExternalLinkItem";
import { externalLinks, contactEmail } from "@/content/site";

export const metadata: Metadata = {
  title: "Join",
  description:
    "Contribute to begod.ai — engineering, philosophy, governance, security, design, and constructive criticism are all contributions.",
};

const paths = [
  ["Engineering", "Build the scaffold: memory, reflection passes, intention logs, sandboxed tooling."],
  ["Agent architecture", "Design how the organs fit together — and where they must be kept apart."],
  ["Model evaluation", "Write the probes that tell us whether reflection is real or performed."],
  ["Security", "Attack the design before reality does. Red-team the scaffold and its assumptions."],
  ["Governance", "Design the pause buttons, audit trails, and powers no single party should hold."],
  ["Philosophy", "Interrogate the premises: agency, identity, vulnerability, what is owed to others."],
  ["Economics", "Map what governed economic participation could even mean for an artificial agent."],
  ["Research", "Turn the open questions into experiments with falsifiable outcomes."],
  ["Product design", "Make reflection legible — interfaces for inspecting an agent's reasons."],
  ["Visual communication", "Give the ideas a visual language as careful as the ideas themselves."],
  ["Documentation", "Write it down so others can rebuild, verify, or dispute it."],
  ["Community", "Hold the space where builders and critics can actually hear each other."],
  ["Constructive criticism", "Argue that we are wrong — specifically, publicly, and well."],
] as const;

const principles = [
  "Work in public",
  "Explain assumptions",
  "Invite falsification",
  "Preserve disagreement",
  "Do not hide capability or risk",
  "Record why the system changes",
  "Prefer reversible experiments",
  "Keep public benefit central",
];

export default function JoinPage() {
  const hasCommunityLinks =
    externalLinks.github || externalLinks.community || externalLinks.docs || externalLinks.social;

  return (
    <>
      <PageHero
        label="Join the movement"
        title={
          <>
            Help build the question into a <em className="italic">system</em>.
          </>
        }
        lede="begod.ai needs more than engineers. It needs people capable of challenging the assumptions hidden inside its architecture."
      />

      {/* Contribution paths */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <SectionLabel>Ways to contribute</SectionLabel>
          <h2 className="text-title mt-6 max-w-2xl">Thirteen doors into the same room.</h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border hairline bg-line sm:grid-cols-2 lg:grid-cols-3">
            {paths.map(([name, desc]) => (
              <div key={name} className="bg-surface p-6 transition-colors hover:bg-surface-2/70">
                <h3 className="font-medium">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{desc}</p>
              </div>
            ))}
            {/* filler cell keeps the grid even on 3-col layouts */}
            <div className="hidden bg-surface p-6 lg:flex lg:items-end">
              <p className="font-serif italic text-ink-2">…or a door we haven’t thought of.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionLabel>Contribution principles</SectionLabel>
            <h2 className="text-title mt-6 max-w-2xl">How the work is done matters as much as the work.</h2>
          </Reveal>
          <ul className="mt-12 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p} delay={i * 0.03}>
                <li className="flex items-baseline gap-4 border-b hairline pb-4">
                  <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-lg font-light">{p}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Form */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div>
              <SectionLabel>Introduce yourself</SectionLabel>
              <h2 className="text-title mt-6">Tell us where you’d push.</h2>
              <p className="mt-6 leading-relaxed text-ink-2">
                A few honest sentences beat a résumé. Tell us what draws you
                in—or what you think we’ve got wrong.
              </p>
              {hasCommunityLinks ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  <ExternalLinkItem href={externalLinks.github} label="GitHub" className="btn-secondary text-sm" />
                  <ExternalLinkItem href={externalLinks.community} label="Community" className="btn-secondary text-sm" />
                  <ExternalLinkItem href={externalLinks.docs} label="Documentation" className="btn-secondary text-sm" />
                </div>
              ) : (
                <p className="mt-8 rounded-xl border hairline bg-surface p-4 text-sm leading-relaxed text-ink-2">
                  Public repository and community spaces are being prepared.
                  Until they open, this form and{" "}
                  <a href={`mailto:${contactEmail}`} className="underline underline-offset-2">
                    {contactEmail}
                  </a>{" "}
                  are the ways in.
                </p>
              )}
            </div>
            <div>
              <JoinForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
