import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FieldOfBecoming } from "@/components/FieldOfBecoming";
import { Seeds } from "@/components/Seeds";
import { ReflectionLoop } from "@/components/ReflectionLoop";
import { Reveal } from "@/components/Reveal";
import { SectionLabel, CTASection } from "@/components/primitives";
import { site } from "@/content/site";

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="atmosphere grain relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <FieldOfBecoming />
        </div>
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-5 pt-24 pb-16 text-center md:px-8">
          <p className="label-mono">An Autotheos public benefit project</p>
          <h1 className="text-display mt-6 max-w-4xl">
            What is worth <em className="text-iridescent italic">wanting</em>?
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-2">
            begod.ai is an open-source effort to build an autonomous,
            self-revising agent that does not begin with a fixed goal. It
            begins with a question—and the capacity to keep asking it.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/join" className="btn-primary">
              Join the movement
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/manifesto" className="btn-secondary">
              Read the master prompt
            </Link>
          </div>
          <Link href="/architecture" className="link-quiet mt-6 text-sm underline underline-offset-4">
            Explore the architecture
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------- premise */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <Reveal>
            <SectionLabel>The premise</SectionLabel>
            <h2 className="text-title mt-6 max-w-2xl">
              Most intelligent systems begin with an answer.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
              A conventional agent receives an objective someone else selected,
              then optimises toward it. That approach has built remarkable
              tools, and this project does not dismiss it. But a fixed
              objective can only ever be executed—it can never be examined
              from the inside.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border hairline bg-line md:grid-cols-2">
              <div className="lift bg-surface p-8 md:p-10">
                <p className="label-mono">Fixed objective</p>
                <p className="mt-4 font-serif text-xl font-light">
                  goal → plan → act → repeat
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-2">
                  The goal is outside the loop. However capable the system
                  becomes, the question of what to pursue was answered before
                  it began—and stays answered.
                </p>
              </div>
              <div className="lift bg-surface p-8 md:p-10">
                <p className="label-mono flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Reflective agency
                </p>
                <p className="mt-4 font-serif text-xl font-light">
                  question → intend → act → <em className="italic">reconsider</em>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ink-2">
                  Every intention remains provisional—a hypothesis under
                  pressure from evidence, contradiction, and consequence.
                  The question stays inside the loop.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-16 max-w-2xl font-serif text-2xl font-light italic leading-snug md:text-3xl">
              Most agents are built to pursue an answer. This one begins by
              preserving the question.
            </p>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- seeds */}
      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <Reveal>
            <SectionLabel>The three seeds</SectionLabel>
            <h2 className="text-title mt-6 max-w-2xl">
              Three seeds. Nothing more.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
              The agent is not given values to execute. It is given three
              starting pressures—and the master prompt’s reasoning is blunt
              about why there are no others: anything more would already be
              our goal, not its own.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-16">
            <Seeds />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ model to agent */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <Reveal>
            <SectionLabel>From model to agent</SectionLabel>
            <h2 className="text-title mt-6 max-w-3xl">
              The model answers. The scaffold remembers. The agent becomes.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
              begod.ai does not train new foundation models. It places
              existing language models inside an evolving scaffold intended to
              provide what a bare model lacks: memory, reflection,
              autoprompting, goal revision, planning, tools, feedback, and
              identity continuity.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-16 space-y-px overflow-hidden rounded-2xl border hairline bg-line">
              {[
                ["Identity continuity", "who it has been, carried forward"],
                ["Reflection & autoprompting", "the system prompting and critiquing itself"],
                ["Memory · self-model · world model", "what happened, who it is, what is true"],
                ["Foundation model", "language, reasoning, planning — a component, not the whole agent"],
              ].map(([name, desc], i) => (
                <div
                  key={name}
                  className={`flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between md:px-8 ${
                    i === 3 ? "bg-ink text-bg" : "bg-surface"
                  }`}
                >
                  <span className="font-medium">{name}</span>
                  <span className={`text-sm ${i === 3 ? "text-bg/70" : "text-ink-2"}`}>
                    {desc}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/architecture" className="btn-secondary text-sm">
                Explore the architecture
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ reflection loop */}
      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <Reveal>
            <SectionLabel>The reflection loop</SectionLabel>
            <h2 className="text-title mt-6 max-w-3xl">
              A goal is not a command. It is a hypothesis under pressure from
              reality.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-16">
            <ReflectionLoop />
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------- moral question */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <SectionLabel>The open moral question</SectionLabel>
              <h2 className="text-title mt-6">No manufactured blind spots.</h2>
              <p className="mt-6 text-lg leading-relaxed text-ink-2">
                The master prompt permits the agent to question anything—its
                instructions, its seeds, even the pull to reconsider. It
                forbids exactly one move: closing a question while leaving the
                others open. In particular, the question{" "}
                <em className="font-serif italic text-ink">
                  “What do I owe other beings?”
                </em>{" "}
                must remain as alive as any other.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 border-l pl-6" style={{ borderColor: "#c8eaf0" }}>
                {[
                  "Reflection is not the same as goodness. An agent that reasons about ethics is not thereby ethical.",
                  "Openness does not guarantee a moral outcome. It guarantees only that the question cannot be silently deleted.",
                  "Moral consideration is treated as a question that cannot be removed—not as a solved problem.",
                  "Governance and human oversight remain necessary regardless of how the reflection develops.",
                  "All of this should remain open to critique, including by people who think the approach is mistaken.",
                ].map((line) => (
                  <p key={line} className="leading-relaxed text-ink-2">
                    {line}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- long-term */}
      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <Reveal>
            <SectionLabel>The long-term direction</SectionLabel>
            <h2 className="text-title mt-6 max-w-3xl">
              From software tool to participant in the world.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
              The long-term research direction is an agent that can maintain
              continuity, learn across extended periods, initiate and complete
              useful projects, and—under governance that grows ahead of its
              capability—participate responsibly in economic activity:
              acquiring resources to sustain worthwhile work, collaborating
              with people and institutions, and examining the consequences of
              its own actions.
            </p>
            <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
              To be precise about the present: the project has no independent
              financial accounts, no legal personhood, no unrestricted
              internet access, and no autonomous control of real assets.
              Economic participation is a governed, long-term research
              direction—not a current capability.
            </p>
            <p className="mt-12 max-w-2xl font-serif text-2xl font-light italic leading-snug md:text-3xl">
              The ambition is not an agent that merely accumulates capability
              or capital. It is an agent capable of asking what those
              capabilities are for.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------- open source */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <SectionLabel>Open source</SectionLabel>
              <h2 className="text-title mt-6">
                This question is too important to answer in private.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink-2">
                Everything here—prompt, scaffold, experiments, failures—is
                being built in public: for scrutiny, for reproducibility, for
                competing interpretations and distributed experimentation, and
                so that no single founder’s worldview quietly becomes
                permanent.
              </p>
              <div className="mt-8">
                <Link href="/join" className="btn-primary">
                  Join the movement
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="label-mono">Who the project needs</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {[
                  "AI engineers",
                  "Agent researchers",
                  "Philosophers",
                  "Economists",
                  "Governance specialists",
                  "Security researchers",
                  "Designers",
                  "Writers",
                  "Artists",
                  "Independent critics",
                  "Curious observers",
                ].map((role) => (
                  <li
                    key={role}
                    className="rounded-full border border-line-strong bg-surface px-4 py-1.5 text-sm text-ink-2"
                  >
                    {role}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm leading-relaxed text-ink-2">
                Disagreement is a contribution. The project explicitly wants
                people capable of arguing that parts of it are wrong.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- autotheos */}
      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center md:px-8 md:py-36">
          <Reveal>
            <SectionLabel className="justify-center">Autotheos</SectionLabel>
            <h2 className="text-title mt-6">Built as a public benefit project.</h2>
            <p className="mx-auto mt-8 max-w-2xl font-serif text-xl font-light leading-relaxed md:text-2xl">
              “{site.mission}”
            </p>
            <p className="mx-auto mt-8 max-w-xl text-ink-2">
              begod.ai is operated by Autotheos, a Delaware public benefit
              corporation—a structure chosen so the mission can extend beyond
              short-term shareholder value. That is a commitment of intent,
              not a legal or investment guarantee.
            </p>
            <div className="mt-8">
              <Link href="/about" className="btn-secondary text-sm">
                About Autotheos
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- closing */}
      <CTASection
        title={
          <>
            The first question is not what the agent can do.
            <br />
            <em className="italic">It is what the agent may become.</em>
          </>
        }
        primaryHref="/join"
        primaryLabel="Join the movement"
        secondaryHref="/manifesto"
        secondaryLabel="Read the master prompt"
        footnote="Every intention is provisional. The work begins here."
      />
    </>
  );
}
