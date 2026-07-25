"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { navItems } from "@/content/site";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  // Prevent background scroll while the mobile menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? "border-b hairline bg-[rgba(252,252,250,0.85)] backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="rounded-sm"
          aria-label="begod.ai — home"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition-colors ${
                  active ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="mx-auto mt-0.5 block h-px w-4 bg-ink"
                  />
                )}
              </Link>
            );
          })}
          <Link href="/join" className="btn-primary !py-2.5 !px-5 text-sm">
            Join the movement
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden ${open ? "block" : "hidden"}`}
      >
        <nav
          aria-label="Mobile"
          className="flex h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto bg-bg px-5 pt-6 pb-10"
        >
          {navItems.map((item, i) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                className={`border-b hairline py-4 font-serif text-2xl font-light tracking-tight ${
                  active ? "text-ink" : "text-ink-2"
                }`}
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/contact" onClick={closeMenu} className="border-b hairline py-4 font-serif text-2xl font-light tracking-tight text-ink-2">
            Contact
          </Link>
          <Link href="/join" onClick={closeMenu} className="btn-primary mt-8 justify-center">
            Join the movement
          </Link>
          <p className="label-mono mt-8">
            An Autotheos public benefit project
          </p>
        </nav>
      </div>
    </header>
  );
}
