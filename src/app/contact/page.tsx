import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";
import { PageHero, SectionLabel } from "@/components/primitives";
import { contactEmail } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Autotheos about research, contribution, institutional, media, or governance enquiries regarding begod.ai.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title={
          <>
            Every serious question is <em className="italic">welcome</em>.
          </>
        }
        lede="Research, contribution, institutional, media, and governance enquiries — including critical ones."
      />

      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div>
              <SectionLabel>Direct</SectionLabel>
              <h2 className="text-subtitle mt-6">Prefer plain email?</h2>
              <p className="mt-4 leading-relaxed text-ink-2">
                Write to{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-ink underline underline-offset-2"
                >
                  {contactEmail}
                </a>
                . Everything is read; replies to substantive questions take
                priority.
              </p>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
