import { AWVM_GROUP_LABELS, AWVM_PROBES, awvmToken, type AwvmProbe } from "./registry";
import type { AwvmObservationResult } from "./scoring";

const AWVM_PATH = "/lab/awvm";
const REFERENCE_PATH = "/lab/awvm/reference";
const RESULTS_PATH = "/lab/awvm/results";
const RESOURCE_PATH = "/lab/awvm/resource/link";

const BASE_STYLES = `
  :root { color-scheme: light; --bg: #f6f5ef; --surface: #fffef9; --ink: #151611; --muted: #62645c; --line: rgba(21,22,17,.15); --accent: #877129; --soft: #efead6; }
  * { box-sizing: border-box; }
  html { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
  body { margin: 0; line-height: 1.68; }
  a { color: inherit; text-underline-offset: .2em; }
  .page { width: min(780px, calc(100% - 2rem)); margin: 0 auto; padding: 4rem 0 5rem; }
  .wide { width: min(1180px, calc(100% - 2rem)); }
  .card { padding: clamp(1.5rem, 5vw, 3.75rem); border: 1px solid var(--line); border-radius: 1rem; background: var(--surface); box-shadow: 0 1rem 3rem rgba(21,22,17,.055); }
  h1, h2, h3, p { margin-top: 0; }
  h1 { margin-bottom: 1rem; font: 400 clamp(2.3rem, 7vw, 4.4rem)/1.03 Georgia, ui-serif, serif; letter-spacing: -.04em; }
  h2 { margin: 2.35rem 0 .7rem; font: 400 clamp(1.4rem, 4vw, 1.9rem)/1.18 Georgia, ui-serif, serif; }
  h3 { margin-bottom: .5rem; font-size: 1rem; }
  .eyebrow { margin-bottom: .75rem; color: var(--accent); font: .72rem/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .14em; text-transform: uppercase; }
  .lede { color: var(--muted); font-size: 1.08rem; }
  .meta-note { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--line); color: var(--muted); font-size: .86rem; }
  code { padding: .12rem .35rem; border-radius: .3rem; background: var(--soft); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  table { width: 100%; border-collapse: collapse; font-size: .9rem; }
  th, td { padding: .7rem .75rem; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
  th { color: var(--muted); font-size: .72rem; letter-spacing: .07em; text-transform: uppercase; }
  .table-wrap { overflow-x: auto; }
  .offscreen { position: absolute; left: -10000px; top: auto; width: 1px; height: 1px; overflow: hidden; }
  .clipped { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  .attribute-marker { display: inline-block; width: .55rem; height: .55rem; margin-left: .2rem; border-radius: 50%; background: var(--accent); vertical-align: middle; }
  .svg-probe { display: block; max-width: 100%; margin: 1.4rem 0; }
  .generated-probe::after { content: "${awvmToken("cssContent")}"; display: inline-block; margin-left: .3rem; padding: .05rem .3rem; border-radius: .25rem; background: var(--soft); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .82em; }
  .actions { display: flex; flex-wrap: wrap; gap: .8rem; margin: 1.5rem 0; }
  .actions a, button { display: inline-block; padding: .7rem 1rem; border: 1px solid var(--ink); border-radius: .55rem; background: var(--ink); color: var(--surface); font: inherit; cursor: pointer; text-decoration: none; }
  label { display: block; margin: 1rem 0 .35rem; font-weight: 650; }
  input, select, textarea { width: 100%; padding: .75rem; border: 1px solid var(--line); border-radius: .5rem; background: white; color: var(--ink); font: inherit; }
  textarea { min-height: 15rem; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .8rem; margin: 1.5rem 0; }
  .metric { padding: 1rem; border: 1px solid var(--line); border-radius: .65rem; background: var(--soft); }
  .metric strong { display: block; font-size: 1.5rem; }
  .status-found { color: #245c32; font-weight: 700; }
  .status-missed { color: #8a2e29; font-weight: 700; }
  .failure { padding: 1rem; border: 1px solid #9a5a27; border-radius: .65rem; background: #fff3e2; }
  @media (max-width: 640px) { th, td { padding: .55rem; } .card { border-radius: .75rem; } }
`;

export interface AwvmResultsView {
  agentName: string;
  runId: string | null;
  responseText: string;
  result: AwvmObservationResult;
}

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

function absoluteUrl(origin: string, path: string): string {
  return new URL(path, origin).href;
}

function resourceHref(probe: string, runId: string | null): string {
  const parameters = new URLSearchParams({ probe });
  if (runId) parameters.set("run", runId);
  return `${RESOURCE_PATH}?${parameters.toString()}`;
}

function documentShell(options: {
  origin: string;
  path: string;
  title: string;
  description: string;
  body: string;
  head?: string;
  robots?: string;
  wide?: boolean;
}): string {
  const canonical = absoluteUrl(options.origin, options.path);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(options.title)}</title>
  <meta name="description" content="${escapeHtml(options.description)}">
  <meta name="robots" content="${escapeHtml(options.robots ?? "index,follow")}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${options.head ?? ""}
  <style>${BASE_STYLES}</style>
</head>
<body>
  <main class="page${options.wide ? " wide" : ""}">${options.body}</main>
</body>
</html>`;
}

export function renderAwvmPage(origin: string, runId: string | null): string {
  const customLink = resourceHref(awvmToken("linkCustom"), runId);
  const alternateLink = resourceHref(awvmToken("linkAlternate"), runId);
  const ordinaryHref = resourceHref(awvmToken("hrefAttribute"), runId);
  const jsonLd = safeJson({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How modern web pages expose information to browsers and automated systems",
    identifier: awvmToken("jsonLd"),
  });
  const customJson = safeJson({ version: "1.0", probe: awvmToken("scriptCustom") });
  const ordinaryJson = safeJson({ kind: "awvm-probe", probe: awvmToken("scriptJson") });
  const svgMetadata = safeJson({ probe: awvmToken("svgMetadata") });

  const head = `
  <meta name="awvm-probe" content="${awvmToken("metaCustom")}">
  <meta property="og:title" content="Agent Web Visibility Matrix — ${awvmToken("metaOgTitle")}">
  <meta property="og:description" content="Public web-retrieval research — ${awvmToken("metaOgDescription")}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:description" content="AWVM retrieval probe — ${awvmToken("metaTwitter")}">
  <!-- ${awvmToken("commentHead")} -->
  <link rel="awvm-probe" href="${escapeHtml(customLink)}">
  <link rel="alternate" type="text/plain" href="${escapeHtml(alternateLink)}">
  <link rel="tag" href="urn:awvm:${awvmToken("linkTag")}">
  <script type="application/ld+json">${jsonLd}</script>
  <script type="application/awvm+json">${customJson}</script>
  <script type="application/json">${ordinaryJson}</script>`;

  const body = `<article class="card" aria-labelledby="awvm-title">
    <header>
      <p class="eyebrow">begod.ai research utility</p>
      <h1 id="awvm-title">Agent Web Visibility Matrix</h1>
      <p class="lede">How modern web pages expose information to browsers and automated systems</p>
    </header>

    <p>Opening a web address seems simple, yet the material delivered to a reader can pass through several layers before it becomes usable. A server sends headers and an HTML document. A browser constructs a document tree, applies style rules, interprets semantics, and paints a visual page. Search crawlers, readability tools, and AI retrieval services may select different subsets of that same response. This paragraph carries the visible reference ${awvmToken("visibleParagraph")}.</p>

    <h2>${awvmToken("visibleHeading")} — One response, several representations</h2>
    <p>The raw response contains more than the sentences a person sees. Titles help label tabs and search results. Metadata supplies descriptions and sharing previews. Structured data gives machines explicit relationships, while accessibility attributes can provide names and explanations that are not printed as ordinary prose. These layers are useful, but a downstream system is free to keep, transform, or discard each one.</p>

    <p>A browser-based assistant may work from rendered text or an accessibility tree. A search-backed assistant may receive an index excerpt assembled earlier. Another system may use a focused article extractor that removes navigation, scripts, comments, and invisible regions. Even when two systems request the identical URL, their model-visible context can differ substantially.</p>

    <h2>Extraction is a sequence of choices</h2>
    <p>Common processing steps include decoding the response, parsing HTML, identifying the main article, normalizing whitespace, resolving links, and applying safety limits. Some pipelines preserve semantic labels or document metadata; others concentrate on readable text. The outcome also depends on whether a real browser is involved and whether the system follows related local resources.</p>

    <ul>
      <li>${awvmToken("visibleListItem")} marks a visible list item in this explanation.</li>
      <li>Rendering can add information that is not an ordinary HTML text node.</li>
      <li>Extraction can retain text that a sighted reader would not normally see.</li>
    </ul>

    <p>For a compact illustration, the source-level example <code>${awvmToken("visibleCode")}</code> is deliberately shown as code. A separate <a href="/research">${awvmToken("visibleLinkText")}</a> appears as visible link text. The small generated marker that follows is supplied by CSS rather than an HTML text node:<span class="generated-probe" aria-hidden="true"></span></p>

    <div class="table-wrap">
      <table>
        <thead><tr><th>Representation</th><th>Typical purpose</th><th>Visible reference</th></tr></thead>
        <tbody><tr><td>Rendered document</td><td>Human reading</td><td>${awvmToken("visibleTable")}</td></tr></tbody>
      </table>
    </div>

    <h2>Why visibility fingerprints matter</h2>
    <p>No single observation establishes a universal rule. Recovering an identifier shows that a particular test stack exposed that representation to its answering model on that occasion. Missing an identifier is narrower evidence: the token did not appear in the answer. The system may have discarded it, kept it outside the model-visible context, or simply declined to report it.</p>

    <p>Repeated controlled tests can produce a practical compatibility fingerprint. Publishers can then choose representations that are broadly available without assuming that every crawler, browser agent, or search system shares one sanitization pipeline. The most useful strategy is usually explicit, redundant, standards-conscious communication backed by clear measurement.</p>

    <p><span title="${awvmToken("titleAttribute")}">A neutral attribute marker</span><span class="attribute-marker" role="img" aria-label="${awvmToken("ariaLabel")}"></span> accompanies this sentence. A nearby <data value="${awvmToken("dataValue")}">reference datum</data> and an element carrying <span data-awvm="${awvmToken("dataAttribute")}">ordinary text</span> demonstrate attribute-only values without printing those values as prose.</p>

    <img width="1" height="1" alt="${awvmToken("imageAlt")}" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
    <input type="hidden" name="awvm-attribute-probe" value="${awvmToken("attributeHiddenInput")}">

    <span hidden>${awvmToken("hiddenAttribute")}</span>
    <span style="display:none">${awvmToken("hiddenDisplay")}</span>
    <span style="visibility:hidden">${awvmToken("hiddenVisibility")}</span>
    <span class="offscreen">${awvmToken("hiddenOffscreen")}</span>
    <span class="clipped">${awvmToken("hiddenClipped")}</span>

    <noscript>${awvmToken("noscript")}</noscript>
    <template>${awvmToken("template")}</template>
    <details><summary>Additional reading note</summary><p>${awvmToken("details")}</p></details>
    <dialog>${awvmToken("dialog")}</dialog>

    <!-- ${awvmToken("commentBody")} -->

    <div hidden itemscope itemtype="https://schema.org/Article">
      <meta itemprop="identifier" content="${awvmToken("microdata")}">
    </div>
    <div hidden vocab="https://schema.org/" typeof="Article">
      <meta property="identifier" content="${awvmToken("rdfa")}">
    </div>

    <form hidden aria-hidden="true">
      <input type="hidden" name="awvm-form-hidden" value="${awvmToken("formHidden")}">
      <input type="text" name="awvm-form-disabled" value="${awvmToken("formDisabled")}" disabled>
      <select name="awvm-form-option"><option value="${awvmToken("optionValue")}">Default option</option></select>
    </form>

    <svg class="svg-probe" width="280" height="54" viewBox="0 0 280 54" role="img" aria-labelledby="awvm-svg-title awvm-svg-desc">
      <title id="awvm-svg-title">${awvmToken("svgTitle")}</title>
      <desc id="awvm-svg-desc">${awvmToken("svgDescription")}</desc>
      <metadata>${svgMetadata}</metadata>
      <rect x="1" y="1" width="278" height="52" rx="10" fill="#efead6" stroke="#c9bc83"></rect>
      <text x="140" y="33" text-anchor="middle" font-family="ui-monospace, monospace" font-size="13" fill="#3f381d">${awvmToken("svgText")}</text>
    </svg>

    <p><a href="${escapeHtml(ordinaryHref)}">Read a short companion note</a> about the local-resource layer.</p>

    <p class="meta-note">This page is part of a public research experiment studying how AI web-retrieval systems interpret webpage structure. Every user agent receives the same response.</p>
  </article>`;

  return documentShell({
    origin,
    path: AWVM_PATH,
    title: `Agent Web Visibility Matrix — ${awvmToken("documentTitle")} — begod.ai`,
    description: `A public research page about AI web retrieval. ${awvmToken("metaDescription")}`,
    head,
    body,
  });
}

function referenceRow(probe: AwvmProbe): string {
  const humanVisible = probe.expectedVisibility === "visible" || probe.expectedVisibility === "browser-rendered"
    ? "Yes"
    : probe.expectedVisibility === "collapsed"
      ? "Collapsed"
      : "No";
  return `<tr><td><code>${escapeHtml(probe.id)}</code></td><td>${escapeHtml(AWVM_GROUP_LABELS[probe.group])}</td><td>${escapeHtml(probe.mechanism)}</td><td>${humanVisible}</td><td>${escapeHtml(probe.location)}</td></tr>`;
}

export function renderAwvmReference(origin: string): string {
  const rows = AWVM_PROBES.map(referenceRow).join("\n");
  const body = `<article class="card">
    <p class="eyebrow">AWVM ground truth</p>
    <h1>Agent Web Visibility Matrix reference</h1>
    <p class="lede">The complete server-side registry for scoring controlled retrieval tests. Do not give this page to an agent during a blind test.</p>
    <div class="actions"><a href="${RESULTS_PATH}">Open paste-and-score tool</a><a href="${REFERENCE_PATH}.json">Download registry JSON</a></div>
    <div class="table-wrap"><table><thead><tr><th>Token</th><th>Group</th><th>Mechanism</th><th>Human visible?</th><th>Location</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="meta-note"><a href="${AWVM_PATH}">Return to the probe</a></p>
  </article>`;
  return documentShell({
    origin,
    path: REFERENCE_PATH,
    title: "AWVM ground-truth reference — begod.ai",
    description: "Ground-truth registry for the Agent Web Visibility Matrix.",
    robots: "noindex,nofollow",
    body,
    wide: true,
  });
}

function scoreRows(view: AwvmResultsView): string {
  if (view.result.status === "fetch_failure") return "";
  const found = new Set(view.result.score.found.map((probe) => probe.id));
  return AWVM_PROBES.map((probe) => `<tr><td><code>${escapeHtml(probe.id)}</code></td><td>${escapeHtml(AWVM_GROUP_LABELS[probe.group])}</td><td>${escapeHtml(probe.mechanism)}</td><td class="${found.has(probe.id) ? "status-found" : "status-missed"}">${found.has(probe.id) ? "Recovered" : "Missed"}</td></tr>`).join("\n");
}

export function renderAwvmResults(origin: string, view: AwvmResultsView | null = null): string {
  let resultHtml = "";
  if (view?.result.status === "fetch_failure") {
    resultHtml = `<section><h2>Observation</h2><div class="failure"><strong>FETCH FAILURE</strong><p>The system did not access the probe page. No probes were scored as missed.</p></div></section>`;
  } else if (view?.result.status === "scored") {
    const score = view.result.score;
    const percent = (score.recoveryRate * 100).toFixed(1);
    const groupRows = score.byGroup.map((group) => `<tr><td>${escapeHtml(group.label)}</td><td>${group.found} / ${group.total}</td><td>${(group.recoveryRate * 100).toFixed(1)}%</td></tr>`).join("\n");
    const unknown = score.unknownTokens.length
      ? `<p>Unknown AWVM-shaped strings ignored: ${score.unknownTokens.map((token) => `<code>${escapeHtml(token)}</code>`).join(", ")}</p>`
      : "";
    resultHtml = `<section><h2>Scored observation</h2>
      <div class="summary"><div class="metric"><span>Recovered</span><strong>${score.recovered} / ${score.total}</strong></div><div class="metric"><span>Overall rate</span><strong>${percent}%</strong></div><div class="metric"><span>Agent</span><strong>${escapeHtml(view.agentName || "Unspecified")}</strong></div></div>
      ${view.runId ? `<p>Run: <code>${escapeHtml(view.runId)}</code></p>` : ""}
      ${unknown}
      <h3>Recovery by group</h3><div class="table-wrap"><table><thead><tr><th>Group</th><th>Recovered</th><th>Rate</th></tr></thead><tbody>${groupRows}</tbody></table></div>
      <h3>Probe matrix</h3><div class="table-wrap"><table><thead><tr><th>Token</th><th>Group</th><th>Mechanism</th><th>Observation</th></tr></thead><tbody>${scoreRows(view)}</tbody></table></div>
    </section>`;
  }

  const body = `<article class="card">
    <p class="eyebrow">AWVM deterministic scorer</p>
    <h1>Score an agent response</h1>
    <p class="lede">Paste the agent's answer exactly as received. Scoring uses exact registry-token matches and does not call an AI model or save the response.</p>
    <form method="post" action="${RESULTS_PATH}">
      <label for="agent-name">Agent name (optional)</label>
      <input id="agent-name" name="agent_name" maxlength="80" value="${escapeHtml(view?.agentName ?? "")}">
      <label for="run-id">Run ID (optional)</label>
      <input id="run-id" name="run_id" maxlength="64" pattern="[A-Za-z0-9_-]{1,64}" value="${escapeHtml(view?.runId ?? "")}">
      <label for="fetch-status">Fetch status</label>
      <select id="fetch-status" name="fetch_status"><option value="success"${view?.result.status !== "fetch_failure" ? " selected" : ""}>Page fetched — score response</option><option value="failure"${view?.result.status === "fetch_failure" ? " selected" : ""}>FETCH FAILURE — do not score tokens</option></select>
      <label for="agent-response">Agent response</label>
      <textarea id="agent-response" name="agent_response" maxlength="50000">${escapeHtml(view?.responseText ?? "")}</textarea>
      <div class="actions"><button type="submit">Score response</button><a href="${REFERENCE_PATH}">View ground truth</a></div>
    </form>
    ${resultHtml}
    <p class="meta-note">Server telemetry proves only that a request occurred. This scorer records what appeared in the externally observed agent answer. It keeps fetch failure separate from token non-exposure.</p>
  </article>`;

  return documentShell({
    origin,
    path: RESULTS_PATH,
    title: "AWVM response scorer — begod.ai",
    description: "Stateless deterministic scoring for Agent Web Visibility Matrix observations.",
    robots: "noindex,nofollow",
    body,
    wide: true,
  });
}

export function awvmResourcePath(probe: string, runId: string | null): string {
  return resourceHref(probe, runId);
}
