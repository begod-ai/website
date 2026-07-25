# begod.ai — website

The public website of **begod.ai**, an open-source research project exploring
reflective machine agency, operated by **Autotheos**, a Delaware public
benefit corporation.

Brand in one line: *most agents are built to pursue an answer; this one begins
by preserving the question.* The visual direction is **quiet utopianism** — a
luminous white field with rare moments of pale gold, cyan, and silver.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS v4 (design tokens live in `src/app/globals.css` under `@theme`)
- [motion](https://motion.dev) for scroll reveals
- [lucide-react](https://lucide.dev) for icons
- No CMS, no database — all content is typed TypeScript data

## Getting started

```bash
npm install
npm run dev        # local development at http://localhost:3000
npm run lint       # ESLint
npx tsc --noEmit   # type checking
npm run build      # production build
npm start          # serve the production build
```

## Deploying to Vercel

Import the repository in Vercel; the defaults work. Set one environment
variable in production:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL (defaults to `https://begod.ai`)

## Routes

| Route | Purpose |
|---|---|
| `/` | Home — hero, premise, seeds, reflection loop, vision |
| `/manifesto` | The master prompt (verbatim) + commentary |
| `/architecture` | Agent scaffold, diagram, honest status table |
| `/research` | Research questions, entries, progress log |
| `/join` | Contribution paths + join form |
| `/about` | Autotheos, mission, principles |
| `/contact` | Contact form |
| `/privacy`, `/terms` | Legal pages (see note below) |
| anything else | Designed 404 |

## Where to edit things

| What | Where |
|---|---|
| Brand copy, mission, canonical URL | `src/content/site.ts` |
| **GitHub / community / docs / social URLs** | `externalLinks` in `src/content/site.ts` — empty string hides the link everywhere |
| **Contact email** | `contactEmail` in `src/content/site.ts` |
| Navigation & footer links | `navItems` / `footerNav` in `src/content/site.ts` |
| **The master prompt** | `src/content/master-prompt.ts` (stanzas + margin notes; copy/download text derives automatically) |
| **Research entries, statuses & progress log** | `src/content/research.ts` |
| Architecture layers & component status table | `src/content/architecture.ts` |
| Design tokens (colors, fonts) | `@theme` block in `src/app/globals.css` |
| Metadata / titles / descriptions | `src/app/layout.tsx` + each page's `metadata` export |
| Social preview image | `src/app/opengraph-image.tsx` |

## Component map

- `src/components/FieldOfBecoming.tsx` — the signature hero canvas: an
  incomplete orbit, three luminous seeds, fine paths that grow and
  reconsider their direction, a central identity point with a memory trail,
  and surfacing word fragments. It pauses offscreen and when the tab is
  hidden, simplifies on coarse-pointer (mobile) devices, and renders a
  composed **still frame** under `prefers-reduced-motion`.
- `Seeds.tsx` — interactive three-seed system (accessible tablist)
- `ReflectionLoop.tsx` — the eight-step loop; auto-advances, pauses on
  interaction and under reduced motion; every step is a keyboard-reachable button
- `ArchitectureDiagram.tsx` — spatial SVG diagram on desktop, vertical
  recomposition on mobile
- `PromptReader.tsx` — manifesto reading experience with progress line,
  margin annotations, copy and local plain-text download
- `forms.tsx` — Join + Contact forms (validation, loading, success states)
- `Header.tsx` / `Footer.tsx` / `Logo.tsx` / `primitives.tsx` / `Reveal.tsx`

## Reduced motion

All animation respects `prefers-reduced-motion`: CSS keyframes are disabled
globally in `globals.css`, `Reveal` renders statically, the reflection loop
stops auto-advancing, and the Field of Becoming draws a single still frame.

## Connecting the forms to a real service

The forms intentionally do **not** fake a send. On submit they validate, show
a success state that says nothing was transmitted, preserve the visitor's
text, and offer a prefilled `mailto:` fallback. To connect a backend, replace
`simulateSubmit()` in `src/components/forms.tsx` with a `fetch` to your
endpoint (Formspree, Resend, your API route, …) and update the success copy
in `SuccessNote` to reflect real transmission. Update `/privacy` at the same
time.

## Honesty notes

- **Legal content** (`/privacy`, `/terms`) was drafted for an early-stage
  research project and must be reviewed by qualified counsel before
  commercial use.
- **Capability claims**: the architecture status table
  (`src/content/architecture.ts`) and research statuses
  (`src/content/research.ts`) must only be advanced when supported by actual
  project evidence. Nothing on the site should describe a capability as
  operational unless it truly is.
