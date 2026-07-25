import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/** Small uppercase mono label that opens most sections. */
export function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`label-mono flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
      {children}
    </p>
  );
}

/** Standard interior-page hero. */
export function PageHero({
  label,
  title,
  lede,
  children,
}: {
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="atmosphere-soft relative border-b hairline">
      <div className="mx-auto max-w-6xl px-5 pt-36 pb-16 md:px-8 md:pt-44 md:pb-24">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="text-display mt-6 max-w-3xl">{title}</h1>
        {lede && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
            {lede}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

/** Status badge for architecture / research state. */
export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "initial scaffold" || status === "active" || status === "in preparation"
      ? "bg-cyan/50 border-cyan"
      : status === "under exploration"
        ? "bg-gold/40 border-gold"
        : "bg-surface-2 border-line-strong";
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-wider uppercase text-ink ${tone}`}
    >
      {status}
    </span>
  );
}

/** Closing call-to-action band used across pages. */
export function CTASection({
  title,
  subtitle,
  primaryHref = "/join",
  primaryLabel = "Join the movement",
  secondaryHref,
  secondaryLabel,
  footnote,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  footnote?: string;
}) {
  return (
    <section className="atmosphere relative overflow-hidden border-t hairline">
      <div className="mx-auto max-w-4xl px-5 py-28 text-center md:px-8 md:py-40">
        <h2 className="text-title">{title}</h2>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">{subtitle}</p>
        )}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={primaryHref} className="btn-primary">
            {primaryLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="btn-secondary">
              {secondaryLabel}
            </Link>
          )}
        </div>
        {footnote && (
          <p className="label-mono mt-12 justify-center">{footnote}</p>
        )}
      </div>
    </section>
  );
}
