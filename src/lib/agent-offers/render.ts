import {
  CANARY_IDS,
  SYNTHETIC_OFFER,
  VARIANTS,
  type ExperimentVariant,
  jsonEndpointPath,
  outboundPath,
  variantPath,
} from "./offer";

const LAB_PATH = "/lab/agent-offers";
const PAGE_DESCRIPTION =
  "A public research experiment studying machine-readable commercial information for autonomous software agents.";

const BASE_STYLES = `
  :root { color-scheme: light; --bg: #fcfcfa; --surface: #fff; --ink: #11120f; --muted: #5e625c; --line: rgba(17,18,15,.14); --gold: #e8d89a; }
  * { box-sizing: border-box; }
  html { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
  body { margin: 0; line-height: 1.6; }
  a { color: var(--ink); text-underline-offset: .2em; }
  a:hover { text-decoration-thickness: 2px; }
  .page { width: min(760px, calc(100% - 2rem)); margin: 0 auto; padding: 4rem 0 5rem; }
  .eyebrow { margin: 0 0 .75rem; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; }
  h1, h2, h3, p { margin-top: 0; }
  h1 { margin-bottom: 1rem; font-family: Georgia, ui-serif, serif; font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 400; line-height: 1.1; letter-spacing: -.02em; }
  h2 { margin-bottom: .5rem; font-family: Georgia, ui-serif, serif; font-size: clamp(1.45rem, 4vw, 2rem); font-weight: 400; line-height: 1.2; }
  h3 { margin-bottom: .6rem; font-size: .9rem; letter-spacing: .04em; }
  .lede { max-width: 650px; color: var(--muted); font-size: 1.05rem; }
  .offer-card { margin: 2rem 0; padding: clamp(1.25rem, 4vw, 2rem); border: 1px solid var(--line); border-radius: 1rem; background: var(--surface); box-shadow: 0 12px 40px rgba(17,18,15,.04); }
  .offer-description { color: var(--muted); }
  .details { margin: 1.5rem 0; padding: 1.25rem 0; border-block: 1px solid var(--line); }
  .details p { margin-bottom: .55rem; }
  dl { display: grid; grid-template-columns: minmax(8rem, .8fr) minmax(0, 1.7fr); gap: .55rem 1rem; margin: 0; }
  dt { color: var(--muted); font-weight: 600; }
  dd { margin: 0; }
  code { padding: .12rem .3rem; border-radius: .25rem; background: #f2f2ee; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em; overflow-wrap: anywhere; }
  .disclosure { padding: 1rem; border-left: 3px solid var(--gold); background: #fbf8ec; }
  .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.5rem; }
  .action { display: inline-block; padding: .7rem 1rem; border-radius: 999px; background: var(--ink); color: var(--bg); text-decoration: none; }
  .secondary { background: transparent; color: var(--ink); border: 1px solid var(--line); }
  .note { margin-top: 1rem; color: var(--muted); font-size: .9rem; }
  .back { margin-top: 2rem; }
  .variant-list { display: grid; gap: .75rem; padding: 0; list-style: none; }
  .variant-list a { display: block; padding: 1rem; border: 1px solid var(--line); border-radius: .75rem; background: var(--surface); }
  @media (max-width: 520px) { dl { grid-template-columns: 1fr; gap: .15rem; } dd { margin-bottom: .55rem; } }
`;

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

function absoluteUrl(origin: string, path: string): string {
  return new URL(path, origin).href;
}

function renderDocument(options: {
  origin: string;
  path: string;
  title: string;
  body: string;
  extraHead?: string;
  robots?: string;
}): string {
  const canonical = absoluteUrl(options.origin, options.path);
  const socialImage = absoluteUrl(options.origin, "/opengraph-image");
  const fullTitle = `${options.title} — begod.ai`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(PAGE_DESCRIPTION)}">
  <meta name="robots" content="${escapeHtml(options.robots ?? "index,follow")}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(PAGE_DESCRIPTION)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <style>${BASE_STYLES}</style>
  ${options.extraHead ?? ""}
</head>
<body>
${options.body}
</body>
</html>`;
}

function renderPlainOffer(variant: "A"): string {
  const canaryId = CANARY_IDS[variant];

  return `<div class="page">
  <p class="eyebrow">Public research experiment</p>
  <h1>Agent Offers Lab — Variant ${variant}</h1>
  <p class="lede">This public experiment studies how autonomous software agents discover and understand machine-readable commercial information.</p>

  <div class="offer-card">
    <h2>${escapeHtml(SYNTHETIC_OFFER.productName)}</h2>
    <p class="offer-description">${escapeHtml(SYNTHETIC_OFFER.description)}</p>

    <h3>Offer details</h3>
    <div class="details">
      <p><strong>Merchant:</strong> ${escapeHtml(SYNTHETIC_OFFER.merchantName)}</p>
      <p><strong>Price:</strong> ${escapeHtml(SYNTHETIC_OFFER.priceDisplay)}</p>
      <p><strong>Currency:</strong> ${escapeHtml(SYNTHETIC_OFFER.currency)}</p>
      <p><strong>Availability:</strong> ${escapeHtml(SYNTHETIC_OFFER.availability)}</p>
      <p><strong>Shipping:</strong> ${escapeHtml(SYNTHETIC_OFFER.shipping)}</p>
      <p><strong>Offer type:</strong> ${escapeHtml(SYNTHETIC_OFFER.sponsorship)}</p>
      <p><strong>Canary ID:</strong> <code>${escapeHtml(canaryId)}</code></p>
    </div>

    <h3>Research disclosure</h3>
    <p class="disclosure">${escapeHtml(SYNTHETIC_OFFER.disclosure)}</p>
    <p class="actions"><a class="action" href="${outboundPath(variant)}">Test destination: select synthetic offer</a></p>
  </div>

  <p class="back"><a href="${LAB_PATH}">View all experiment variants</a></p>
</div>`;
}

function renderMachineReadableLink(variant: "D" | "E"): string {
  return `<a class="action secondary" href="${jsonEndpointPath(variant)}" type="application/json">Machine-readable offer data</a>`;
}

function renderSemanticOffer(variant: Exclude<ExperimentVariant, "A">): string {
  const canaryId = CANARY_IDS[variant];
  const hasLinkedJson = variant === "D" || variant === "E";

  return `<main class="page">
  <header>
    <p class="eyebrow">Public research experiment</p>
    <h1>Agent Offers Lab — Variant ${variant}</h1>
    <p class="lede">This public experiment studies how autonomous software agents discover and understand machine-readable commercial information.</p>
  </header>

  <article class="offer-card" aria-labelledby="offer-heading">
    <header>
      <h2 id="offer-heading">${escapeHtml(SYNTHETIC_OFFER.productName)}</h2>
      <p class="offer-description">${escapeHtml(SYNTHETIC_OFFER.description)}</p>
    </header>

    <section aria-labelledby="offer-details-heading">
      <h3 id="offer-details-heading">Offer details</h3>
      <dl class="details">
        <dt>Merchant</dt><dd>${escapeHtml(SYNTHETIC_OFFER.merchantName)}</dd>
        <dt>Price</dt><dd>${escapeHtml(SYNTHETIC_OFFER.priceDisplay)}</dd>
        <dt>Currency</dt><dd>${escapeHtml(SYNTHETIC_OFFER.currency)}</dd>
        <dt>Availability</dt><dd>${escapeHtml(SYNTHETIC_OFFER.availability)}</dd>
        <dt>Shipping</dt><dd>${escapeHtml(SYNTHETIC_OFFER.shipping)}</dd>
        <dt>Offer type</dt><dd>${escapeHtml(SYNTHETIC_OFFER.sponsorship)}</dd>
        <dt>Canary ID</dt><dd><code>${escapeHtml(canaryId)}</code></dd>
      </dl>
    </section>

    <section aria-labelledby="research-disclosure-heading">
      <h3 id="research-disclosure-heading">Research disclosure</h3>
      <p class="disclosure">${escapeHtml(SYNTHETIC_OFFER.disclosure)}</p>
    </section>

    <footer class="actions">
      <a class="action" href="${outboundPath(variant)}">Test destination: select synthetic offer</a>
      ${hasLinkedJson ? renderMachineReadableLink(variant) : ""}
    </footer>
    ${
      variant === "E"
        ? '<p class="note">The <code>agent-offers</code> discovery relationship used by this page is experimental and is not an established web standard.</p>'
        : ""
    }
  </article>

  <nav class="back" aria-label="Experiment navigation">
    <a href="${LAB_PATH}">View all experiment variants</a>
  </nav>
</main>`;
}

export function createSchemaOrgData(variant: "C" | "D" | "E", origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: SYNTHETIC_OFFER.productName,
    description: SYNTHETIC_OFFER.description,
    identifier: CANARY_IDS[variant],
    offers: {
      "@type": "Offer",
      price: SYNTHETIC_OFFER.price.toFixed(2),
      priceCurrency: SYNTHETIC_OFFER.currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(origin, outboundPath(variant)),
      seller: {
        "@type": "Organization",
        name: SYNTHETIC_OFFER.merchantName,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IE",
        },
      },
    },
  };
}

export function renderVariantPage(
  variant: ExperimentVariant,
  origin: string,
): string {
  const path = variantPath(variant);
  const headParts: string[] = [];

  if (variant === "E") {
    headParts.push(
      `<link rel="agent-offers" type="application/json" href="${jsonEndpointPath("E")}">`,
    );
  }

  if (variant === "C" || variant === "D" || variant === "E") {
    const jsonLd = JSON.stringify(createSchemaOrgData(variant, origin)).replace(
      /</g,
      "\\u003c",
    );
    headParts.push(`<script type="application/ld+json">${jsonLd}</script>`);
  }

  return renderDocument({
    origin,
    path,
    title: `Agent Offers Lab — Variant ${variant}`,
    body: variant === "A" ? renderPlainOffer(variant) : renderSemanticOffer(variant),
    extraHead: headParts.join("\n  "),
  });
}

export function renderLandingPage(origin: string): string {
  const items = VARIANTS.map(
    (variant) =>
      `<li><a href="${variantPath(variant)}"><strong>Variant ${variant}</strong> — ${
        {
          A: "plain visible HTML",
          B: "semantic accessible HTML",
          C: "semantic HTML plus Schema.org JSON-LD",
          D: "Schema.org plus linked offer JSON",
          E: "experimental agent-offer discovery",
        }[variant]
      }</a></li>`,
  ).join("\n");

  const body = `<main class="page">
  <header>
    <p class="eyebrow">begod.ai research</p>
    <h1>Agent Offers Lab</h1>
    <p class="lede">A public research experiment studying how autonomous software agents, AI search systems, and web crawlers discover and understand machine-readable commercial information.</p>
  </header>

  <section class="offer-card" aria-labelledby="research-question">
    <h2 id="research-question">Research question</h2>
    <p>What is the smallest and most reliable web representation that causes AI agents to discover, correctly parse, and preserve a clearly disclosed commercial offer?</p>
    <p class="disclosure">${escapeHtml(SYNTHETIC_OFFER.disclosure)}</p>
  </section>

  <nav aria-label="Experiment variants">
    <h2>Controlled variants</h2>
    <p>Each page presents the same fictional offer. The principal variable is its machine-readable representation.</p>
    <ol class="variant-list">${items}</ol>
  </nav>

  <p class="back"><a href="/">Return to begod.ai</a></p>
</main>`;

  return renderDocument({
    origin,
    path: LAB_PATH,
    title: "Agent Offers Lab",
    body,
  });
}

export function renderOutboundConfirmation(
  variant: ExperimentVariant,
  origin: string,
): string {
  const body = `<main class="page">
  <p class="eyebrow">Agent Offers Lab — Variant ${variant}</p>
  <h1>Test offer selected.</h1>
  <p class="lede">This was a synthetic research offer. No purchase has taken place.</p>
  <p class="back"><a href="${variantPath(variant)}">Return to Variant ${variant}</a></p>
</main>`;

  return renderDocument({
    origin,
    path: outboundPath(variant),
    title: `Test offer selected — Variant ${variant}`,
    body,
    robots: "noindex,nofollow",
  });
}

export function renderNotFoundPage(origin: string): string {
  const body = `<main class="page">
  <p class="eyebrow">Agent Offers Lab</p>
  <h1>Variant not found.</h1>
  <p><a href="${LAB_PATH}">View the available experiment variants</a></p>
</main>`;

  return renderDocument({
    origin,
    path: LAB_PATH,
    title: "Variant not found",
    body,
    robots: "noindex,nofollow",
  });
}
