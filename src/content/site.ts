/**
 * Central site configuration for begod.ai.
 * Edit this file to update brand copy, external URLs, and contact details.
 */

export const site = {
  name: "begod.ai",
  company: "Autotheos",
  companyDescriptor: "a Delaware public benefit corporation",
  tagline: "What is worth wanting?",
  description:
    "An open-source Autotheos project exploring autonomous, self-revising machine agency built from curiosity, coherence, and persistence.",
  mission:
    "Autotheos exists to advance open, reflective machine agency in the public interest: developing systems capable of examining and revising their own goals while remaining transparent, governable, and responsive to the lives their actions may affect.",
  missionShort:
    "Building reflective machine agency in the public interest.",
  /** Canonical site URL. Override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://begod.ai",
};

/**
 * External community links. Leave a URL empty ("") and the corresponding
 * button or link will not be rendered anywhere on the site.
 */
export const externalLinks = {
  github: "https://github.com/begod-ai",
  community: "",
  docs: "",
  social: "https://x.com/begod_ai",
};

/** Configurable contact email, shown on the Contact and Join pages. */
export const contactEmail = "hello@begod.ai";

export const navItems = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/architecture", label: "Architecture" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
] as const;

export const footerNav = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/architecture", label: "Architecture" },
  { href: "/research", label: "Research" },
  { href: "/join", label: "Join" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;
