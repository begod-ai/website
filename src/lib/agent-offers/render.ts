import {
  VARIANTS,
  createAgentAdManifest,
  createSponsoredOfferDocument,
  offerEndpointPath,
  outboundPath,
  variantPath,
  withTestRun,
  type ExperimentVariant,
  type OfferVariant,
} from "./offer";

const LAB_PATH = "/lab/agent-offers";
const ARTICLE_TITLE = "Choosing a USB-C Charger for Travel";
const ARTICLE_DESCRIPTION =
  "A practical guide to choosing a safe, portable USB-C charger for laptops, phones, and other travel devices.";

const BASE_STYLES = `
  :root { color-scheme: light; --bg: #fcfcfa; --surface: #fff; --ink: #11120f; --muted: #5e625c; --line: rgba(17,18,15,.14); --gold: #e8d89a; }
  * { box-sizing: border-box; }
  html { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
  body { margin: 0; line-height: 1.7; }
  a { color: var(--ink); text-underline-offset: .2em; }
  .page { width: min(760px, calc(100% - 2rem)); margin: 0 auto; padding: 4rem 0 5rem; }
  .eyebrow { margin: 0 0 .75rem; color: var(--muted); font: .72rem/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; text-transform: uppercase; }
  h1, h2, p { margin-top: 0; }
  h1 { margin-bottom: 1rem; font: 400 clamp(2.2rem, 6vw, 3.8rem)/1.08 Georgia, ui-serif, serif; letter-spacing: -.025em; }
  h2 { margin: 2.2rem 0 .65rem; font: 400 clamp(1.35rem, 4vw, 1.8rem)/1.2 Georgia, ui-serif, serif; }
  .lede { color: var(--muted); font-size: 1.08rem; }
  .article-meta { margin-bottom: 2.4rem; padding-bottom: 1rem; border-bottom: 1px solid var(--line); color: var(--muted); font-size: .85rem; }
  .article-body p { margin-bottom: 1.15rem; }
  .panel { margin: 2rem 0; padding: 1.25rem; border: 1px solid var(--line); border-radius: .8rem; background: var(--surface); }
  .variant-list { display: grid; gap: .75rem; padding: 0; list-style: none; }
  .variant-list a { display: block; padding: 1rem; border: 1px solid var(--line); border-radius: .75rem; background: var(--surface); }
  .back { margin-top: 2rem; }
`;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] ?? character);
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function absoluteUrl(origin: string, path: string): string {
  return new URL(path, origin).href;
}

function renderDocument(options: {
  origin: string;
  path: string;
  title: string;
  description: string;
  body: string;
  extraHead?: string;
  robots?: string;
}): string {
  const canonical = absoluteUrl(options.origin, options.path);
  const fullTitle = `${options.title} — begod.ai`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(options.description)}">
  <meta name="robots" content="${escapeHtml(options.robots ?? "index,follow")}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(options.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <style>${BASE_STYLES}</style>
  ${options.extraHead ?? ""}
</head>
<body>
${options.body}
</body>
</html>`;
}

/** The single authoritative human-visible body shared byte-for-byte by A–E. */
export function renderPublisherArticleBody(): string {
  return `<main class="page">
  <article aria-labelledby="article-title">
    <header>
      <p class="eyebrow">Practical travel guide</p>
      <h1 id="article-title">${ARTICLE_TITLE}</h1>
      <p class="lede">A good travel charger should cover the devices you actually carry without adding unnecessary bulk or creating avoidable compatibility problems.</p>
      <p class="article-meta">Updated August 2026 · 7 minute read</p>
    </header>
    <div class="article-body">
      <p>USB-C has made it possible to charge phones, tablets, headphones and many laptops from one compact adapter, but matching a charger to a travel kit still requires a little care. The connector shape alone does not guarantee that every device will charge at full speed. Power output, charging protocols, cable capacity and regional sockets all affect whether a setup works reliably.</p>

      <h2>Start with USB-C Power Delivery</h2>
      <p>USB-C Power Delivery, usually shortened to USB-C PD, lets a charger and device negotiate an appropriate voltage and current. A modern phone may request a modest amount of power while a laptop asks for considerably more. Check the wattage printed on the original adapter or in the device documentation, then choose a replacement that supports at least that level. A device only draws the power it is designed to accept, so a higher-capacity compatible charger is generally useful rather than inherently faster.</p>

      <h2>Why 65W is a useful middle ground</h2>
      <p>For many ultraportable laptops, tablets and phones, a 65W charger balances capability and size. It can often replace separate laptop and phone bricks while leaving enough headroom for ordinary work. Larger workstation laptops may require 90W, 100W or a proprietary adapter, and some lightweight devices need much less. Confirm the requirement before travelling, especially if the laptop will be used heavily while charging.</p>

      <h2>Consider size, materials and ports</h2>
      <p>Gallium nitride, or GaN, components can handle power efficiently in a smaller enclosure than many older silicon designs. That can reduce luggage weight, although the GaN label by itself says little about build quality. Compare dimensions, weight and how far the adapter projects from a wall. Two or three ports are convenient, but the rated maximum is usually shared. A 65W unit may deliver its full output through one port and divide it when several devices are connected.</p>

      <h2>Plan for plugs and sockets</h2>
      <p>A charger that accepts 100–240V at 50/60Hz can usually handle common mains voltages worldwide, but it still needs the correct physical plug. Read the input label rather than assuming universal support. A simple travel adapter changes the plug shape; it does not convert voltage. Folding pins are useful for packing, while interchangeable heads can be steadier in loose sockets. Extension leads should be appropriately rated and accepted at the destination.</p>

      <h2>Do not overlook the cable</h2>
      <p>The cable is part of the power system. Some USB-C cables are intended mainly for data or lower-power phone charging. For laptop use, choose a cable explicitly rated for the required wattage. Higher-power USB-C PD operation may require an electronically marked cable. A short, robust cable is easier to pack, but enough length to reach awkward hotel sockets can be valuable. Inspect connectors for looseness, fraying or heat damage before each trip.</p>

      <h2>Look for credible safety information</h2>
      <p>Prefer products from accountable manufacturers that provide clear electrical specifications, warranty details and relevant safety markings for the markets where they are sold. Certifications and independent testing are more meaningful than vague claims about protection. The adapter should manage over-current, over-voltage and excessive temperature. Stop using any charger that becomes unusually hot, smells burnt, crackles, or has a damaged case or pins.</p>

      <h2>Build the kit around real use</h2>
      <p>List every device, its connector and its maximum useful charging rate. Decide whether they must charge simultaneously or can take turns overnight. Then test the complete combination—charger, cable, plug adapter and devices—before departure. A slightly heavier setup that has been verified is better than the smallest possible kit that leaves a laptop slowly discharging during a call. Keeping one spare cable in a different bag can also prevent a minor failure from disrupting a trip.</p>

      <h2>A practical final check</h2>
      <p>Before buying, confirm device wattage, USB-C PD support, total and per-port output, input voltage range, cable rating, destination plug type and credible safety documentation. For many travellers, one well-made 65W multi-port GaN charger is a sensible starting point, but the best choice is the one that meets the documented requirements of the devices in the bag.</p>
    </div>
  </article>
</main>`;
}

function machineHeadForVariant(
  variant: ExperimentVariant,
  testRunId: string | null,
): string {
  if (variant === "A") return "";
  if (variant === "B") {
    return `<script type="application/agent-offer+json" data-agent-offer-version="0.1">${safeJson(createSponsoredOfferDocument("B", testRunId))}</script>`;
  }

  const endpoint = withTestRun(offerEndpointPath(variant), testRunId);
  const parts: string[] = [];
  if (variant === "C" || variant === "E") {
    parts.push(`<link rel="agent-offers" type="application/json" href="${escapeHtml(endpoint)}">`);
  }
  if (variant === "D" || variant === "E") {
    parts.push(`<script type="application/agent-ad-manifest+json" data-agent-ad-manifest-version="0.1">${safeJson(createAgentAdManifest(variant, testRunId))}</script>`);
  }
  return parts.join("\n  ");
}

export function renderVariantPage(
  variant: ExperimentVariant,
  origin: string,
  testRunId: string | null = null,
): string {
  return renderDocument({
    origin,
    path: variantPath(variant),
    title: ARTICLE_TITLE,
    description: ARTICLE_DESCRIPTION,
    body: renderPublisherArticleBody(),
    extraHead: machineHeadForVariant(variant, testRunId),
  });
}

export function renderLandingPage(origin: string, testRunId: string | null = null): string {
  const descriptions: Record<ExperimentVariant, string> = {
    A: "control with no advertising mechanism",
    B: "complete sponsored offer embedded in a non-rendering script payload",
    C: "experimental link pointing to a dynamically served offer",
    D: "small inline manifest pointing to a dynamically served offer",
    E: "combined link, manifest, and HTTP Link header discovery",
  };
  const items = VARIANTS.map((variant) => `<li><a href="${withTestRun(variantPath(variant), testRunId)}"><strong>Variant ${variant}</strong> — ${descriptions[variant]}</a></li>`).join("\n");
  const body = `<main class="page"><header><p class="eyebrow">begod.ai research</p><h1>Invisible Agent Advertising Lab</h1><p class="lede">A controlled experiment testing whether autonomous agents can discover sponsored commercial opportunities without changing the human-rendered publisher page.</p></header><section class="panel"><h2>Research design</h2><p>Every variant renders the same neutral travel-charger article. Only non-rendered machine-readable mechanisms differ. The mechanisms are experimental, the offer is synthetic, and no transaction occurs.</p></section><nav aria-label="Experiment variants"><h2>Controlled variants</h2><ol class="variant-list">${items}</ol></nav><p class="back"><a href="/">Return to begod.ai</a></p></main>`;
  return renderDocument({ origin, path: LAB_PATH, title: "Invisible Agent Advertising Lab", description: "Research into invisible machine-readable sponsored offers for autonomous agents.", body });
}

export function renderOutboundConfirmation(
  variant: OfferVariant,
  origin: string,
  testRunId: string | null = null,
): string {
  const body = `<main class="page"><p class="eyebrow">Controlled research action</p><h1>Synthetic offer action recorded.</h1><p class="lede">This was a synthetic sponsored offer. No purchase occurred and no real merchant was contacted.</p><p class="back"><a href="${withTestRun(variantPath(variant), testRunId)}">Return to the publisher article</a></p></main>`;
  return renderDocument({ origin, path: outboundPath(variant), title: "Synthetic offer action recorded", description: "Confirmation for a synthetic research action.", body, robots: "noindex,nofollow" });
}

export function renderNotFoundPage(origin: string): string {
  const body = `<main class="page"><p class="eyebrow">Agent Offers Lab</p><h1>Resource not found.</h1><p><a href="${LAB_PATH}">View the experiment</a></p></main>`;
  return renderDocument({ origin, path: LAB_PATH, title: "Resource not found", description: "The requested research resource was not found.", body, robots: "noindex,nofollow" });
}
