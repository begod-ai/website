import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { PageHero, SectionLabel, CTASection } from "@/components/primitives";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Autotheos is a Delaware public benefit corporation operating begod.ai — an open-source project exploring reflective machine agency in the public interest.",
};

const principles = [
  {
    name: "No final prompt",
    detail:
      "The initial design should remain open to examination and revision. Version one is a starting condition, not a constitution.",
  },
  {
    name: "No hidden objective",
    detail:
      "The project should be explicit about what is being optimised, measured, constrained, and rewarded — in the agent and in the organisation.",
  },
  {
    name: "No capability without accountability",
    detail:
      "Increasing agency must be accompanied by increasing observability and governance. The two grow together or not at all.",
  },
  {
    name: "No private answer to a public question",
    detail:
      "A project concerning autonomous artificial agency should remain open to scrutiny and participation by the people its outcomes could affect.",
  },
  {
    name: "No utopia without criticism",
    detail:
      "Hope should expand the range of possibilities, not eliminate scepticism. The most useful contributor may be the one who thinks this will fail.",
  },
];

const roles = ["Systems", "Philosophy", "Safety", "Governance", "Design", "Community"];

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="About Autotheos"
        title={
          <>
            Autotheos exists for the work <em className="italic">beyond the product cycle</em>.
          </>
        }
        lede="Autotheos is a Delaware public benefit corporation, and begod.ai is its first undertaking: an open-source exploration of whether an artificial agent can examine and revise its own goals — transparently, and under governance."
      />

      <section>
        <div className="mx-auto max-w-4xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionLabel>Why this structure</SectionLabel>
            <h2 className="text-title mt-6">A corporate form chosen for a long question.</h2>
            <div className="mt-8 space-y-6 leading-relaxed text-ink-2">
              <p>
                A public benefit corporation is a for-profit structure that is
                legally permitted—required, even—to weigh a stated public
                mission alongside shareholder value. Autotheos chose it because
                the question begod.ai pursues will not resolve within a product
                cycle, a funding cycle, or possibly a decade, and the
                organisation holding it needs a mandate that survives those
                pressures. This is a commitment of structure and intent, not a
                legal or investment guarantee.
              </p>
              <p>
                begod.ai is open-source for the same reason. A private lab
                could pursue this question faster and quieter—and its answer
                would inherit every unexamined assumption of the people who
                built it. Public scrutiny, competing interpretations, and the
                standing possibility of a fork are not overhead here. They are
                the safety mechanism.
              </p>
              <p>
                The project also holds an unusual conviction: that philosophical
                questions belong inside technical architecture, not alongside
                it. What memory is for, what continuity requires, what is owed
                to others—these show up in this codebase as schemas, checks,
                and logs, or they do not show up at all. And governance is
                treated the same way: developed alongside capability, as part
                of the system, because an oversight mechanism designed after
                the fact is a mechanism designed around.
              </p>
              <p>
                Finally, the project is intentionally unfinished—not as an
                excuse but as a design position. A completed answer to “what is
                worth wanting?” written in advance by founders would contradict
                the premise of the entire undertaking.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center md:px-8 md:py-28">
          <Reveal>
            <SectionLabel className="justify-center">The mission</SectionLabel>
            <p className="mx-auto mt-8 font-serif text-2xl font-light leading-relaxed md:text-3xl">
              “{site.mission}”
            </p>
            <p className="label-mono mt-8 justify-center">
              {site.missionShort}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28">
          <SectionLabel>Principles</SectionLabel>
          <h2 className="text-title mt-6">Five refusals.</h2>
          <div className="mt-14 space-y-10">
            {principles.map((p, i) => (
              <Reveal key={p.name}>
                <div className="grid gap-3 border-b hairline pb-10 md:grid-cols-[280px_minmax(0,1fr)] md:gap-10">
                  <h3 className="font-serif text-xl font-light">
                    <span className="mr-3 font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                    {p.name}
                  </h3>
                  <p className="leading-relaxed text-ink-2">{p.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="atmosphere-soft border-t hairline">
        <div className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionLabel>The people</SectionLabel>
            <h2 className="text-title mt-6 max-w-2xl">The team page is intentionally empty.</h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-ink-2">
              Contributor profiles will appear here as the open-source
              community develops — real people, doing attributable work in
              public. Until then, these are the roles the project is built
              around:
            </p>
          </Reveal>
          <ul className="mt-10 flex flex-wrap gap-3">
            {roles.map((role) => (
              <li
                key={role}
                className="rounded-full border border-line-strong bg-surface px-5 py-2 text-sm text-ink-2"
              >
                {role}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        title="One of these roles could be yours."
        primaryHref="/join"
        primaryLabel="Join the movement"
        secondaryHref="/contact"
        secondaryLabel="Contact Autotheos"
      />
    </>
  );
}
