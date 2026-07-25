import type { Metadata } from "next";
import { PageHero } from "@/components/primitives";
import { contactEmail, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the begod.ai website.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        label="Terms of use"
        title="Terms"
        lede="The terms under which this website is offered — stated plainly."
      />
      <section>
        <div className="mx-auto max-w-3xl space-y-10 px-5 py-20 md:px-8 md:py-28">
          <div>
            <h2 className="text-subtitle">An experimental project</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              This website describes begod.ai, an experimental open-source
              research project operated by {site.company},{" "}
              {site.companyDescriptor}. The project — and this site — remain
              under active development and may change substantially.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">No guarantees</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              The technical and philosophical content on this site describes
              research directions, hypotheses, and architectural intentions.
              None of it constitutes a guarantee of capability, outcome,
              safety, or timeline. Statements about future functionality are
              aspirations under investigation, not commitments.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">No professional advice</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              Nothing on this site is legal, financial, or investment advice.
              The description of Autotheos’s public benefit structure explains
              intent; it creates no rights or assurances for readers.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">Forms</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              Website forms may not transmit data until a backend service is
              connected; the interface states this at the point of use.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">Content</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              The master prompt and project texts are published for study,
              critique, and open-source participation. Licensing details for
              code and content will be published alongside the public
              repository.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">Contact</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              Questions about these terms:{" "}
              <a href={`mailto:${contactEmail}`} className="text-ink underline underline-offset-2">
                {contactEmail}
              </a>
              .
            </p>
          </div>
          <p className="rounded-xl border hairline bg-surface-2 p-5 text-sm leading-relaxed text-ink-2">
            These terms were drafted for an early-stage research project and
            have not been reviewed by qualified legal counsel. They must be
            reviewed before any commercial use of this site.
          </p>
        </div>
      </section>
    </>
  );
}
