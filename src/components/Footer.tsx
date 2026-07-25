import Link from "next/link";
import { Logo, OrbitMark } from "@/components/Logo";
import { footerNav, site, externalLinks } from "@/content/site";
import { ExternalLinkItem } from "@/components/ExternalLinkItem";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t hairline bg-surface-2/50">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              An open-source project exploring reflective machine agency.
            </p>
            <div className="mt-6 text-silver">
              <OrbitMark size={40} animated className="text-ink/20" />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-3 sm:grid-cols-3">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-quiet text-sm"
              >
                {item.label}
              </Link>
            ))}
            <ExternalLinkItem href={externalLinks.github} label="GitHub" className="link-quiet text-sm" />
            <ExternalLinkItem href={externalLinks.community} label="Community" className="link-quiet text-sm" />
            <ExternalLinkItem href={externalLinks.docs} label="Documentation" className="link-quiet text-sm" />
            <ExternalLinkItem href={externalLinks.social} label="X" className="link-quiet text-sm" />
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t hairline pt-6 text-xs text-ink-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.company}, {site.companyDescriptor}.
          </p>
          <p className="font-mono tracking-wide">
            every intention is provisional
          </p>
        </div>
      </div>
    </footer>
  );
}
