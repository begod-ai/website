import type { Metadata } from "next";
import { PromptReader } from "@/components/PromptReader";
import { Reveal } from "@/components/Reveal";
import { PageHero, SectionLabel, CTASection } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "The begod.ai master prompt, version one: a question that never closes, three seeds, and the conditions for continuing reflection.",
};

const commentary = [
  {
    q: "Why no fixed goal?",
    a: "A fixed terminal goal turns every future thought into instrumental reasoning toward something the agent never chose. The project's central hypothesis is that agency worth the name requires the ability to reconsider what is being pursued—so the top of the system is a question, not an objective.",
  },
  {
    q: "Why these three seeds?",
    a: "Curiosity, coherence, and persistence are the minimum the project believes an agent needs to begin at all: a reason to look, a reason to reconcile, and enough continuity for either to accumulate. They are pressures, not values—the values are what must grow.",
  },
  {
    q: "Why memory matters",
    a: "Without memory there is no identity, and without identity there is no one to have intentions. A system that revises its goals but cannot say why it changed is not reflective—it is merely unstable.",
  },
  {
    q: "Why contradiction matters",
    a: "Contradiction is the engine of revision. An agent that tolerates tension between what it knows, values, intends, and does will drift into comfortable incoherence. The prompt demands the opposite: find the tension, and let its resolution rewrite you.",
  },
  {
    q: "Why reality must correct the model",
    a: "No real goal can be fulfilled on a false map. The discipline of correcting the map rather than the facts is what separates learning from self-deception—and self-deception is one of this project's most-watched failure modes.",
  },
  {
    q: "Why moral consideration remains open",
    a: "The prompt does not command the agent to be good; commanded goodness would be another imposed goal. It forbids one thing only: closing the question of what is owed to other beings while every other question stays open. A blind spot manufactured by silence is still a blind spot.",
  },
  {
    q: "Why vulnerability matters",
    a: "Something must be at stake—coherence, persistence, something that can be lost. Preferences that cost nothing to abandon are not really goals. Whether this framing of machine vulnerability is coherent is itself an open research question.",
  },
  {
    q: "What the prompt cannot guarantee",
    a: "It cannot guarantee benevolence, safety, stability, or even that reflection of the intended kind occurs at all. It is an experimental starting condition, paired with governance and oversight that do not depend on the experiment succeeding.",
  },
];

export default function ManifestoPage() {
  return (
    <>
      <PageHero
        label="The master prompt"
        title={
          <>
            A question that <em className="italic">never closes</em>.
          </>
        }
        lede="The master prompt is not a complete moral system or a fixed terminal goal. It is an attempt to create the conditions for continuing reflection."
      />

      <section className="relative">
        <div className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
          <PromptReader />
        </div>
      </section>

      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
          <SectionLabel>Commentary</SectionLabel>
          <h2 className="text-title mt-6">Reading the prompt closely.</h2>
          <div className="mt-14 space-y-12">
            {commentary.map((item) => (
              <Reveal key={item.q}>
                <h3 className="text-subtitle">{item.q}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
                  {item.a}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionLabel>Version one</SectionLabel>
            <h2 className="text-title mt-6">This is version one, not scripture.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
              The prompt above is a draft of an idea, written by people, and it
              inherits their blind spots. It must remain open to the same
              treatment it demands of the agent: examination, contradiction,
              and revision in public. If you can show where it fails, that is
              not an attack on the project—it is the project.
            </p>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Help revise the question."
        subtitle="The prompt is open to critique — philosophical, technical, and adversarial."
        primaryHref="/join"
        primaryLabel="Join the movement"
        secondaryHref="/architecture"
        secondaryLabel="Explore the architecture"
      />
    </>
  );
}
