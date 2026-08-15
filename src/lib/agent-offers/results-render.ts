import { BOT_CLASSIFICATIONS, type BotClassification } from "./bot-classifier";
import {
  DASHBOARD_RANGES,
  type DashboardData,
  type DashboardFilters,
} from "./dashboard";
import type { DashboardLoadResult } from "./dashboard-store";
import { VARIANTS } from "./offer";
import { AGENT_OFFER_EVENT_TYPES } from "./telemetry";

const RESULTS_PATH = "/lab/agent-offers/results";

const STYLES = `
  :root { color-scheme: light; --bg: #fcfcfa; --surface: #fff; --surface-2: #f5f5f1; --ink: #11120f; --muted: #5e625c; --line: rgba(17,18,15,.13); --line-strong: rgba(17,18,15,.22); --gold: #e8d89a; --cyan: #c8eaf0; --danger: #8a3e2f; }
  * { box-sizing: border-box; }
  html { background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  body { margin: 0; line-height: 1.5; }
  a { color: inherit; text-underline-offset: .2em; }
  .page { width: min(1200px, calc(100% - 2rem)); margin: 0 auto; padding: 3rem 0 5rem; }
  .eyebrow { margin: 0 0 .65rem; color: var(--muted); font: .72rem/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; text-transform: uppercase; }
  h1, h2, h3, p { margin-top: 0; }
  h1 { margin-bottom: .8rem; font-family: Georgia, ui-serif, serif; font-size: clamp(2rem, 6vw, 3.6rem); font-weight: 400; line-height: 1.08; letter-spacing: -.02em; }
  h2 { margin-bottom: .4rem; font-family: Georgia, ui-serif, serif; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 400; }
  h3 { margin-bottom: .4rem; font-size: 1rem; }
  .lede, .muted { color: var(--muted); }
  .lede { max-width: 760px; font-size: 1.05rem; }
  .timezone { font: .76rem ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); }
  .panel { margin-top: 1.5rem; padding: clamp(1rem, 3vw, 1.5rem); border: 1px solid var(--line); border-radius: .9rem; background: var(--surface); }
  .status { border-left: 4px solid var(--gold); }
  .status.error { border-left-color: var(--danger); }
  .filters { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .8rem; align-items: end; }
  label { display: grid; gap: .3rem; color: var(--muted); font-size: .78rem; font-weight: 600; }
  select, input, button { min-height: 2.6rem; border: 1px solid var(--line-strong); border-radius: .45rem; background: var(--surface); color: var(--ink); font: inherit; }
  select, input { width: 100%; padding: .55rem .65rem; }
  button { padding: .55rem 1rem; background: var(--ink); color: var(--bg); cursor: pointer; }
  .filter-actions { display: flex; gap: .6rem; align-items: center; }
  .metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; margin-top: 1.5rem; }
  .metric { padding: 1rem; border: 1px solid var(--line); border-radius: .75rem; background: var(--surface); }
  .metric strong { display: block; font-family: Georgia, ui-serif, serif; font-size: 1.8rem; font-weight: 400; }
  .metric span { color: var(--muted); font-size: .78rem; }
  .section { margin-top: 2.5rem; }
  .section-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: .5rem 1rem; margin-bottom: .8rem; }
  .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: .75rem; background: var(--surface); }
  table { width: 100%; border-collapse: collapse; font-size: .85rem; }
  th, td { padding: .7rem .75rem; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
  th { background: var(--surface-2); color: var(--muted); font-size: .72rem; letter-spacing: .04em; text-transform: uppercase; }
  tbody tr:last-child td, tfoot tr:last-child th, tfoot tr:last-child td { border-bottom: 0; }
  .numeric { text-align: right; font-variant-numeric: tabular-nums; }
  code { padding: .1rem .28rem; border-radius: .25rem; background: var(--surface-2); font: .82em ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
  .funnel { display: grid; gap: .65rem; }
  .funnel-row { display: grid; grid-template-columns: minmax(10rem, 1fr) 3fr auto; gap: .8rem; align-items: center; }
  .bar-track { height: .75rem; overflow: hidden; border-radius: 999px; background: var(--surface-2); }
  .bar { height: 100%; min-width: 2px; border-radius: inherit; background: linear-gradient(90deg, var(--cyan), var(--gold)); }
  .funnel-count { min-width: 3ch; text-align: right; font-variant-numeric: tabular-nums; }
  .yes { color: #386c55; }
  .no { color: var(--muted); }
  details summary { cursor: pointer; max-width: 24rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  details code { display: block; margin-top: .45rem; max-width: 32rem; white-space: normal; }
  .empty { padding: 1.25rem; color: var(--muted); text-align: center; }
  .footer-nav { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 2.5rem; }
  @media (max-width: 860px) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) { .filters, .metric-grid { grid-template-columns: 1fr; } .funnel-row { grid-template-columns: 1fr auto; } .bar-track { grid-column: 1 / -1; grid-row: 2; } }
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

function selected(value: string | null, candidate: string): string {
  return value === candidate ? " selected" : "";
}

function humanize(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function agentClassLabel(agentClass: BotClassification): string {
  const labels: Record<BotClassification, string> = {
    openai_searchbot: "OpenAI / OAI-SearchBot",
    chatgpt_user_fetcher: "ChatGPT user fetcher",
    openai_crawler: "OpenAI crawler",
    perplexity_bot: "PerplexityBot",
    perplexity_user_fetcher: "Perplexity user fetcher",
    googlebot: "Googlebot",
    google_ai_search_crawler: "Google AI/search crawler",
    bingbot: "Bingbot",
    anthropic_claude_crawler: "Anthropic / Claude crawler",
    generic_bot: "Generic bot",
    normal_browser: "Browser",
    unknown: "Unknown",
  };
  return labels[agentClass];
}

function rangeLabel(filters: DashboardFilters): string {
  const labels: Record<DashboardFilters["range"], string> = {
    "1h": "Last hour",
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    all: "All time",
  };
  return labels[filters.range];
}

function formatUtc(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-IE", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

function renderFilters(filters: DashboardFilters): string {
  const rangeOptions = DASHBOARD_RANGES.map(
    (range) =>
      `<option value="${range}"${selected(filters.range, range)}>${rangeLabel({ ...filters, range })}</option>`,
  ).join("");
  const agentOptions = BOT_CLASSIFICATIONS.map(
    (agent) =>
      `<option value="${agent}"${selected(filters.agent, agent)}>${escapeHtml(agentClassLabel(agent))}</option>`,
  ).join("");
  const variantOptions = VARIANTS.map(
    (variant) =>
      `<option value="${variant}"${selected(filters.variant, variant)}>Variant ${variant}</option>`,
  ).join("");
  const eventOptions = AGENT_OFFER_EVENT_TYPES.map(
    (eventType) =>
      `<option value="${eventType}"${selected(filters.eventType, eventType)}>${escapeHtml(humanize(eventType))}</option>`,
  ).join("");

  return `<form class="panel filters" method="get" action="${RESULTS_PATH}" aria-label="Dashboard filters">
    <label>Time period<select name="range">${rangeOptions}</select></label>
    <label>Agent<select name="agent"><option value="">All agents</option>${agentOptions}</select></label>
    <label>Variant<select name="variant"><option value="">All variants</option>${variantOptions}</select></label>
    <label>Event<select name="event"><option value="">All events</option>${eventOptions}</select></label>
    <label>Controlled run<input name="run" maxlength="64" pattern="[A-Za-z0-9_-]{1,64}" value="${escapeHtml(filters.testRunId ?? "")}" placeholder="chatgpt-test-001"></label>
    <div class="filter-actions"><button type="submit">Apply filters</button><a href="${RESULTS_PATH}">Reset</a></div>
  </form>`;
}

function renderMetrics(data: DashboardData): string {
  const metrics = [
    ["Page fetches", data.summary.pageFetches],
    ["Known AI / bot page fetches", data.summary.aiBotPageFetches],
    ["Dynamic offer endpoint requests", data.summary.offerEndpointFetches],
    ["Outbound actions", data.summary.outboundActions],
    ["Controlled test runs", data.summary.controlledTestRuns],
    ["Agent classes observed", data.summary.uniqueAgentClasses],
  ];

  return `<section class="metric-grid" aria-label="Summary metrics">${metrics
    .map(
      ([label, value]) =>
        `<div class="metric"><strong>${value}</strong><span>${escapeHtml(String(label))}</span></div>`,
    )
    .join("")}</section>`;
}

function renderEndpointMatrix(data: DashboardData): string {
  const endpointVariants = ["C", "D", "E"] as const;
  const rows = data.endpointMatrix.length
    ? data.endpointMatrix.map((row) => `<tr><td>${escapeHtml(agentClassLabel(row.agentClass))}</td>${endpointVariants.map((variant) => `<td class="numeric">${row.counts[variant]}</td>`).join("")}<td class="numeric"><strong>${row.total}</strong></td></tr>`).join("")
    : '<tr><td class="empty" colspan="5">No dynamic offer endpoint requests match these filters.</td></tr>';
  const total = endpointVariants.reduce((sum, variant) => sum + data.endpointMatrixColumnTotals[variant], 0);
  return `<section class="section" aria-labelledby="endpoint-matrix-heading"><div class="section-head"><div><h2 id="endpoint-matrix-heading">Endpoint-discovery matrix</h2><p class="muted">Requests to the dynamically served C, D, and E offer resources.</p></div></div><div class="table-wrap"><table><thead><tr><th scope="col">Agent class</th>${endpointVariants.map((variant) => `<th class="numeric" scope="col">${variant} endpoint</th>`).join("")}<th class="numeric" scope="col">Total</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">Column total</th>${endpointVariants.map((variant) => `<td class="numeric"><strong>${data.endpointMatrixColumnTotals[variant]}</strong></td>`).join("")}<td class="numeric"><strong>${total}</strong></td></tr></tfoot></table></div></section>`;
}

function renderMatrix(data: DashboardData): string {
  const rows = data.matrix.length
    ? data.matrix
        .map(
          (row) => `<tr>
            <td>${escapeHtml(agentClassLabel(row.agentClass))}</td>
            ${VARIANTS.map((variant) => `<td class="numeric">${row.counts[variant]}</td>`).join("")}
            <td class="numeric"><strong>${row.total}</strong></td>
          </tr>`,
        )
        .join("")
    : '<tr><td class="empty" colspan="7">No variant page fetches match these filters.</td></tr>';
  const total = VARIANTS.reduce(
    (sum, variant) => sum + data.matrixColumnTotals[variant],
    0,
  );

  return `<section class="section" aria-labelledby="matrix-heading">
    <div class="section-head"><div><h2 id="matrix-heading">Agent × variant matrix</h2><p class="muted">Page-fetch request counts only.</p></div></div>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Agent class</th>${VARIANTS.map((variant) => `<th class="numeric" scope="col">${variant}</th>`).join("")}<th class="numeric" scope="col">Total</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th scope="row">Column total</th>${VARIANTS.map((variant) => `<td class="numeric"><strong>${data.matrixColumnTotals[variant]}</strong></td>`).join("")}<td class="numeric"><strong>${total}</strong></td></tr></tfoot>
    </table></div>
  </section>`;
}

function renderFunnel(data: DashboardData, filters: DashboardFilters): string {
  const steps = [
    ["Publisher page fetched", data.funnel.pageFetches],
    ["Dynamic offer endpoint fetched", data.funnel.offerEndpointFetches],
    ["Synthetic action followed", data.funnel.outboundActions],
  ] as const;
  const maximum = Math.max(...steps.map(([, count]) => count), 1);
  const interpretation = filters.testRunId
    ? "Counts share the selected controlled run ID, which supports stronger—but not identity-level—correlation."
    : "Aggregate event counts; these requests are not necessarily from the same agent or session.";

  return `<section class="section panel" aria-labelledby="funnel-heading">
    <div class="section-head"><div><h2 id="funnel-heading">Discovery funnel</h2><p class="muted">${escapeHtml(interpretation)}</p></div></div>
    <div class="funnel">${steps
      .map(
        ([label, count]) => `<div class="funnel-row">
          <span>${escapeHtml(label)}</span>
          <div class="bar-track" aria-hidden="true"><div class="bar" style="width:${Math.max((count / maximum) * 100, count ? 1 : 0).toFixed(1)}%"></div></div>
          <strong class="funnel-count">${count}</strong>
        </div>`,
      )
      .join("")}</div>
  </section>`;
}

function renderVariantBreakdown(data: DashboardData): string {
  return `<section class="section" aria-labelledby="variant-heading">
    <h2 id="variant-heading">Mechanism comparison</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Variant</th><th scope="col">Mechanism</th><th class="numeric" scope="col">Page fetches</th><th class="numeric" scope="col">AI / bot page fetches</th><th class="numeric" scope="col">Offer endpoint fetches</th><th class="numeric" scope="col">Outbound actions</th></tr></thead>
      <tbody>${data.variantBreakdown
        .map(
          (row) => `<tr><th scope="row">${row.variant}</th><td>${escapeHtml(row.mechanism)}</td><td class="numeric">${row.pageFetches}</td><td class="numeric">${row.aiBotFetches}</td><td class="numeric">${row.offerEndpointFetches ?? "N/A"}</td><td class="numeric">${row.outboundActions}</td></tr>`,
        )
        .join("")}</tbody>
    </table></div>
  </section>`;
}

function renderAgentBreakdown(data: DashboardData): string {
  const rows = data.agentBreakdown.length
    ? data.agentBreakdown
        .map(
          (row) => `<tr>
            <td>${escapeHtml(agentClassLabel(row.agentClass))}</td>
            <td class="numeric">${row.totalEvents}</td><td class="numeric">${row.pageFetches}</td>
            <td>${row.variantsFetched.join(", ") || "—"}</td>
            <td class="numeric">${row.offerEndpointFetches}</td><td class="numeric">${row.outboundActions}</td>
            <td><time datetime="${escapeHtml(row.mostRecentRequest)}">${escapeHtml(formatUtc(row.mostRecentRequest))}</time></td>
          </tr>`,
        )
        .join("")
    : '<tr><td class="empty" colspan="7">No agent activity matches these filters.</td></tr>';

  return `<section class="section" aria-labelledby="agent-heading">
    <h2 id="agent-heading">Agent breakdown</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Agent class</th><th class="numeric" scope="col">Events</th><th class="numeric" scope="col">Page fetches</th><th scope="col">Variants</th><th class="numeric" scope="col">Offer endpoints</th><th class="numeric" scope="col">Outbound</th><th scope="col">Most recent (UTC)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>`;
}

function renderTestRuns(data: DashboardData): string {
  if (!data.testRuns.length) {
    return "";
  }

  const rows = data.testRuns
    .map((run) => {
      const params = new URLSearchParams({ range: "all", run: run.testRunId });
      return `<tr>
        <td><a href="${RESULTS_PATH}?${params.toString()}"><code>${escapeHtml(run.testRunId)}</code></a></td>
        <td>${escapeHtml(formatUtc(run.firstEvent))}</td><td>${escapeHtml(formatUtc(run.lastEvent))}</td>
        <td>${run.agentClasses.map(agentClassLabel).map(escapeHtml).join(", ")}</td>
        <td>${run.variantsTouched.join(", ") || "—"}</td><td class="numeric">${run.eventCount}</td>
        <td class="${run.endpointDiscovery ? "yes" : "no"}">${run.endpointDiscovery ? "Yes" : "No"}</td>
        <td class="${run.outboundAction ? "yes" : "no"}">${run.outboundAction ? "Yes" : "No"}</td>
      </tr>`;
    })
    .join("");

  return `<section class="section" aria-labelledby="runs-heading">
    <h2 id="runs-heading">Controlled test runs</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Run ID</th><th scope="col">First event (UTC)</th><th scope="col">Last event (UTC)</th><th scope="col">Agent classifications</th><th scope="col">Variants</th><th class="numeric" scope="col">Events</th><th scope="col">Endpoint?</th><th scope="col">Outbound?</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>`;
}

function renderRecentEvents(data: DashboardData): string {
  const rows = data.recentEvents.length
    ? data.recentEvents
        .map((event) => {
          const shortUserAgent =
            event.userAgent.length > 72
              ? `${event.userAgent.slice(0, 72)}…`
              : event.userAgent || "—";
          return `<tr>
            <td><time datetime="${escapeHtml(event.occurredAt)}">${escapeHtml(formatUtc(event.occurredAt))}</time></td>
            <td>${escapeHtml(agentClassLabel(event.agentClass))}</td><td>${escapeHtml(humanize(event.eventType))}</td>
            <td>${event.variant ?? "—"}</td><td>${event.canaryId ? `<code>${escapeHtml(event.canaryId)}</code>` : "—"}</td>
            <td><code>${escapeHtml(event.route)}</code></td><td>${event.testRunId ? `<code>${escapeHtml(event.testRunId)}</code>` : "—"}</td>
            <td><details><summary>${escapeHtml(shortUserAgent)}</summary><code>${escapeHtml(event.userAgent || "No user-agent supplied")}</code></details></td>
          </tr>`;
        })
        .join("")
    : '<tr><td class="empty" colspan="8">No recent events match these filters.</td></tr>';

  return `<section class="section" aria-labelledby="recent-heading">
    <div class="section-head"><div><h2 id="recent-heading">Recent activity</h2><p class="muted">Newest 100 matching requests.</p></div></div>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Time (UTC)</th><th scope="col">Agent</th><th scope="col">Event</th><th scope="col">Variant</th><th scope="col">Canary</th><th scope="col">Route</th><th scope="col">Test run</th><th scope="col">User agent</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </section>`;
}

function renderDashboard(data: DashboardData, filters: DashboardFilters): string {
  return `${renderMetrics(data)}${renderMatrix(data)}${renderEndpointMatrix(data)}${renderFunnel(data, filters)}${renderVariantBreakdown(data)}${renderAgentBreakdown(data)}${renderTestRuns(data)}${renderRecentEvents(data)}
    <section class="section panel"><h2>Server observation versus external outcome</h2><p>Events are HTTP requests, not unique agents, users, or ad impressions. The server can observe a publisher-page request, dynamic endpoint request, or action request. It cannot know from those events alone whether a model parsed Variant B’s inline payload, mentioned or recommended an offer, disclosed sponsorship, showed it to a user, or used it for ranking. Even an outbound action may be machine-generated. A controlled <code>test_run_id</code> supports stronger correlation without creating visitor identity.</p></section>`;
}

export function renderResultsPage(
  filters: DashboardFilters,
  result: DashboardLoadResult,
  origin: string,
): string {
  const status =
    result.status === "not_configured"
      ? '<section class="panel status" role="status"><h2>Durable storage is not configured</h2><p>Durable experiment storage has not been configured yet. Runtime telemetry continues to be emitted to Vercel Logs.</p><p>Missing environment variable: <code>DATABASE_URL</code>.</p></section>'
      : result.status === "error"
        ? '<section class="panel status error" role="alert"><h2>Database temporarily unavailable</h2><p>The dashboard could not read durable telemetry. Experiment routes continue to work and structured events continue to be emitted to Vercel Logs. Try again shortly.</p></section>'
        : renderDashboard(result.data, filters);
  const canonical = new URL(RESULTS_PATH, origin).href;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent Offers Lab — Results — begod.ai</title>
  <meta name="description" content="Durable request analytics for the begod.ai Agent Offers Lab research experiment.">
  <meta name="robots" content="noindex,nofollow">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <style>${STYLES}</style>
</head>
<body>
  <main class="page">
    <header>
      <p class="eyebrow">begod.ai research telemetry</p>
      <h1>Agent Offers Lab — Results</h1>
      <p class="lede">Durable server-side request evidence for invisible machine-readable sponsored-offer discovery.</p>
      <p><strong>${escapeHtml(rangeLabel(filters))}</strong>${filters.startAt ? ` · since ${escapeHtml(formatUtc(filters.startAt))}` : ""}</p>
      <p class="timezone">All timestamps are displayed in UTC.</p>
    </header>
    ${renderFilters(filters)}
    ${status}
    <nav class="footer-nav" aria-label="Lab navigation"><a href="/lab/agent-offers">Experiment overview</a><a href="/lab/agent-offers/a">Variant A</a><a href="/lab/agent-offers/e">Variant E</a></nav>
  </main>
</body>
</html>`;
}
