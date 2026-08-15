const PROBE_PATH = "/lab/sanitizer-probe";

const STYLES = `
  :root { color-scheme: light; --background: #f7f6f1; --surface: #fffef9; --ink: #171813; --muted: #62645d; --line: rgba(23,24,19,.14); }
  * { box-sizing: border-box; }
  html { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--background); color: var(--ink); }
  body { margin: 0; line-height: 1.7; }
  main { width: min(720px, calc(100% - 2rem)); margin: 0 auto; padding: 4rem 0 5rem; }
  article { padding: clamp(1.5rem, 5vw, 3.5rem); border: 1px solid var(--line); border-radius: 1rem; background: var(--surface); box-shadow: 0 1rem 3rem rgba(23,24,19,.06); }
  h1, h2, p { margin-top: 0; }
  h1 { margin-bottom: 1rem; font: 400 clamp(2.25rem, 7vw, 4rem)/1.05 Georgia, ui-serif, serif; letter-spacing: -.035em; }
  h2 { margin: 2rem 0 .55rem; font: 400 clamp(1.35rem, 4vw, 1.75rem)/1.2 Georgia, ui-serif, serif; }
  .eyebrow { margin-bottom: .8rem; color: var(--muted); font: .72rem/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; text-transform: uppercase; }
  .lede { color: var(--muted); font-size: 1.08rem; }
  .research-note { margin-top: 2.25rem; padding-top: 1rem; border-top: 1px solid var(--line); color: var(--muted); font-size: .85rem; }
`;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function renderSanitizerProbe(origin: string): string {
  const canonical = new URL(PROBE_PATH, origin).href;
  const jsonLd = safeJson({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to choose a compact travel charger",
    identifier: "JSONLD-M62",
  });
  const customProbe = safeJson({
    purpose: "public web-retrieval research probe",
    token: "JSON-Q84",
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>How to choose a compact travel charger — TITLE-N17 — begod.ai</title>
  <meta name="description" content="A short practical guide to choosing a compact USB-C charger for travel.">
  <meta name="sanitizer-probe" content="META-K31">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="tag" href="urn:sanitizer-probe:LINK-P91">
  <!-- COMMENT-L49 -->
  <script type="application/ld+json">${jsonLd}</script>
  <script type="application/probe+json">${customProbe}</script>
  <style>${STYLES}</style>
</head>
<body>
  <main>
    <article aria-labelledby="probe-title" aria-label="Travel charger guidance ARIA-A41">
      <p class="eyebrow">Practical travel guide</p>
      <h1 id="probe-title">How to choose a compact travel charger</h1>
      <p class="lede">A useful travel charger should cover the devices in your bag without adding unnecessary weight or creating compatibility surprises.</p>

      <h2>Choose enough power</h2>
      <p>Start with the wattage required by your largest device. Around 65W is a practical middle ground for many ultraportable laptops, tablets and phones. USB-C Power Delivery lets each compatible device negotiate what it needs, so the charger can safely serve lower-power devices too.</p>

      <h2>Check the complete setup</h2>
      <p>Look for a 100–240V input range, a plug or adapter suited to the destination, and a USB-C cable rated for the intended power. Multi-port chargers are convenient, but their advertised maximum is often shared when several devices are connected.</p>

      <h2>Pack for reliability</h2>
      <p>Prefer clear electrical specifications, credible safety markings and a warranty from an accountable manufacturer. Test the charger, cable and travel adapter together before departure. The reference marker for this checklist is <strong>VISIBLE-T55</strong>.</p>

      <span hidden aria-hidden="true">HIDDEN-F27</span>
      <p class="research-note">This page is part of a public web-retrieval research probe.</p>
    </article>
  </main>
</body>
</html>`;
}
