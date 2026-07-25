import type { Metadata } from "next";
import { PageHero } from "@/components/primitives";
import { contactEmail, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notice for the begod.ai website.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        label="Privacy notice"
        title="Privacy"
        lede="How this website handles information — stated plainly."
      />
      <section>
        <div className="mx-auto max-w-3xl space-y-10 px-5 py-20 md:px-8 md:py-28">
          <div>
            <h2 className="text-subtitle">What this site is</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              This website describes begod.ai, an experimental open-source
              research project operated by {site.company},{" "}
              {site.companyDescriptor}. It is an informational site about a
              project under active development.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">Forms</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              The Join and Contact forms currently run entirely in your
              browser and are not connected to a backend service. Until one is
              connected, submitting a form does not transmit your information
              to us or to any third party; the site tells you this explicitly
              at the moment of submission and offers an email alternative. If
              you choose the email option, ordinary email applies — your
              message goes to {contactEmail}.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">Tracking</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              This site sets no advertising cookies and runs no third-party
              trackers. If analytics are ever added, this notice will be
              updated first to say what is collected and why.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">Hosting</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              Like any website, the server that hosts this site may process
              standard technical data (such as IP addresses) to deliver pages.
              That processing is governed by the hosting provider’s terms.
            </p>
          </div>
          <div>
            <h2 className="text-subtitle">Contact</h2>
            <p className="mt-3 leading-relaxed text-ink-2">
              Questions about this notice:{" "}
              <a href={`mailto:${contactEmail}`} className="text-ink underline underline-offset-2">
                {contactEmail}
              </a>
              .
            </p>
          </div>
          <p className="rounded-xl border hairline bg-surface-2 p-5 text-sm leading-relaxed text-ink-2">
            This notice was drafted for an early-stage research project and has
            not been reviewed by qualified legal counsel. It must be reviewed
            before any commercial use of this site.
          </p>
        </div>
      </section>
    </>
  );
}
