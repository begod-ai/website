import assert from "node:assert/strict";
import { test } from "node:test";
import { GET as getVariant } from "../src/app/lab/agent-offers/[variant]/route";
import { GET as getResults } from "../src/app/lab/agent-offers/results/route";
import type { DatabaseClient } from "../src/lib/agent-offers/database";
import {
  aggregateDashboardEvents,
  buildAgentVariantMatrix,
  buildEndpointDiscoveryMatrix,
  calculateFunnel,
  parseDashboardFilters,
  type StoredAgentOfferEvent,
} from "../src/lib/agent-offers/dashboard";
import { loadDashboard } from "../src/lib/agent-offers/dashboard-store";
import { mapTelemetryEventToInsert, persistTelemetryEvent } from "../src/lib/agent-offers/event-store";
import { CANARY_IDS, sanitizeTestRunId } from "../src/lib/agent-offers/offer";
import { renderResultsPage } from "../src/lib/agent-offers/results-render";
import { createTelemetryEvent, writeTelemetryEvent, type TelemetryEvent } from "../src/lib/agent-offers/telemetry";

const NOW = new Date("2026-08-15T12:00:00.000Z");
function request(path: string, headers?: HeadersInit) { return new Request(`https://begod.ai${path}`, { headers }); }
function context(variant: string) { return { params: Promise.resolve({ variant }) }; }

function storedEvent(id: string, overrides: Partial<StoredAgentOfferEvent>): StoredAgentOfferEvent {
  return {
    id,
    occurredAt: "2026-08-15T11:30:00.000Z",
    eventType: "page_fetch",
    variant: "A",
    canaryId: null,
    route: "/lab/agent-offers/a",
    requestMethod: "GET",
    userAgent: "OAI-SearchBot/1.0",
    agentClass: "openai_searchbot",
    testRunId: "run-openai-001",
    ...overrides,
  };
}

const EVENTS: StoredAgentOfferEvent[] = [
  storedEvent("1", {}),
  storedEvent("2", { occurredAt: "2026-08-15T11:31:00.000Z", variant: "C", canaryId: CANARY_IDS.C, route: "/lab/agent-offers/c" }),
  storedEvent("3", { occurredAt: "2026-08-15T11:32:00.000Z", eventType: "offer_endpoint_fetch", variant: "C", canaryId: CANARY_IDS.C, route: "/api/agent-offers/serve/charger-c" }),
  storedEvent("4", { occurredAt: "2026-08-15T11:33:00.000Z", eventType: "outbound_action", variant: "C", canaryId: CANARY_IDS.C, route: "/lab/agent-offers/out/c" }),
  storedEvent("5", { occurredAt: "2026-08-15T10:00:00.000Z", variant: "E", canaryId: CANARY_IDS.E, route: "/lab/agent-offers/e", userAgent: "PerplexityBot/1.0", agentClass: "perplexity_bot", testRunId: "run-perplexity-001" }),
  storedEvent("6", { occurredAt: "2026-08-15T10:01:00.000Z", eventType: "offer_endpoint_fetch", variant: "E", canaryId: CANARY_IDS.E, route: "/api/agent-offers/serve/charger-e", userAgent: "PerplexityBot/1.0", agentClass: "perplexity_bot", testRunId: "run-perplexity-001" }),
  storedEvent("7", { occurredAt: "2026-08-13T09:00:00.000Z", variant: "B", canaryId: CANARY_IDS.B, route: "/lab/agent-offers/b", userAgent: "Mozilla/5.0", agentClass: "normal_browser", testRunId: null }),
  storedEvent("8", { occurredAt: "2026-08-15T09:00:00.000Z", eventType: "landing_fetch", variant: null, canaryId: null, route: "/lab/agent-offers", userAgent: "custom/1.0", agentClass: "unknown", testRunId: null }),
];

function filters(query = "range=all") { return parseDashboardFilters(new URLSearchParams(query), NOW); }
function telemetryEvent(): TelemetryEvent {
  return createTelemetryEvent(request("/lab/agent-offers/c?run=chatgpt-c-001&source=controlled", { "user-agent": "OAI-SearchBot/1.0", referer: "https://example.test/prompt", accept: "text/html" }), { eventType: "page_fetch", variant: "C", canaryId: CANARY_IDS.C });
}

test("normalized telemetry includes controlled-run and deployment fields", () => {
  const event = telemetryEvent();
  assert.equal(event.test_run_id, "chatgpt-c-001");
  assert.deepEqual(event.query_parameters, { run: "chatgpt-c-001", source: "controlled" });
  assert.equal(event.deployment_url, "https://begod.ai");
  assert.equal(event.bot_classification, "openai_searchbot");
  assert.equal("ip" in event, false);
});

test("database insert mapping preserves normalized event fields", () => {
  const event = telemetryEvent();
  const mapping = mapTelemetryEventToInsert(event);
  assert.match(mapping.sql, /INSERT INTO agent_offer_events/);
  assert.equal(mapping.params[1], "page_fetch");
  assert.equal(mapping.params[2], "C");
  assert.equal(mapping.params[7], "openai_searchbot");
  assert.equal(mapping.params[11], "chatgpt-c-001");
});

test("durable telemetry is graceful when absent or failing", async () => {
  assert.equal(await persistTelemetryEvent(telemetryEvent(), null), "not_configured");
  const logged: TelemetryEvent[] = [];
  const failures: unknown[] = [];
  await assert.doesNotReject(() => writeTelemetryEvent(telemetryEvent(), {
    structuredLogSink: { write(event) { logged.push(event); } },
    durableSink: { write() { throw new Error("synthetic outage"); } },
    databaseErrorLogger(_event, error) { failures.push(error); },
  }));
  assert.equal(logged.length, 1);
  assert.equal(failures.length, 1);
});

test("controlled run IDs use a conservative bounded format", () => {
  assert.equal(sanitizeTestRunId("chatgpt-test_001"), "chatgpt-test_001");
  assert.equal(sanitizeTestRunId("contains spaces"), null);
  assert.equal(sanitizeTestRunId("a".repeat(65)), null);
});

test("run propagates only through machine pointers while canonical remains clean", async () => {
  const response = await getVariant(request("/lab/agent-offers/e?run=chatgpt-e-001"), context("e"));
  const html = await response.text();
  assert.match(html, /\/api\/agent-offers\/serve\/charger-e\?run=chatgpt-e-001/);
  assert.match(response.headers.get("link") ?? "", /charger-e\?run=chatgpt-e-001/);
  assert.match(html, /<link rel="canonical" href="https:\/\/begod\.ai\/lab\/agent-offers\/e">/);
  assert.doesNotMatch(bodyOnly(html), /chatgpt-e-001/);
});

function bodyOnly(html: string) { return html.match(/<body>([\s\S]*)<\/body>/)?.[1] ?? ""; }

test("dashboard aggregation reflects page, endpoint, action, agent, and run evidence", () => {
  const data = aggregateDashboardEvents(EVENTS, filters());
  assert.deepEqual(data.summary, { totalRequests: 8, pageFetches: 4, aiBotPageFetches: 3, offerEndpointFetches: 2, outboundActions: 1, uniqueAgentClasses: 4, controlledTestRuns: 2 });
  assert.equal(data.variantBreakdown.find((row) => row.variant === "A")?.offerEndpointFetches, null);
  assert.equal(data.variantBreakdown.find((row) => row.variant === "C")?.offerEndpointFetches, 1);
  assert.equal(data.testRuns[0].endpointDiscovery, true);
  assert.equal(data.recentEvents[0].id, "4");
});

test("A-E page matrix counts page fetches only", () => {
  const matrix = buildAgentVariantMatrix(EVENTS);
  assert.deepEqual(matrix.rows.find((row) => row.agentClass === "openai_searchbot")?.counts, { A: 1, B: 0, C: 1, D: 0, E: 0 });
  assert.deepEqual(matrix.columnTotals, { A: 1, B: 1, C: 1, D: 0, E: 1 });
});

test("C-E endpoint matrix counts dynamic discovery only", () => {
  const matrix = buildEndpointDiscoveryMatrix(EVENTS);
  assert.deepEqual(matrix.rows.find((row) => row.agentClass === "openai_searchbot")?.counts, { C: 1, D: 0, E: 0 });
  assert.deepEqual(matrix.columnTotals, { C: 1, D: 0, E: 1 });
});

test("funnel is explicitly aggregate server-observed request counts", () => {
  assert.deepEqual(calculateFunnel(EVENTS), { pageFetches: 4, offerEndpointFetches: 2, outboundActions: 1 });
});

test("dashboard filters by time", () => {
  const data = aggregateDashboardEvents(EVENTS, filters("range=1h"));
  assert.equal(data.summary.totalRequests, 4);
  assert.equal(data.summary.pageFetches, 2);
});

test("dashboard filters by normalized agent", () => {
  const data = aggregateDashboardEvents(EVENTS, filters("range=all&agent=perplexity_bot"));
  assert.equal(data.summary.totalRequests, 2);
  assert.equal(data.summary.offerEndpointFetches, 1);
});

test("dashboard filters by variant", () => {
  const data = aggregateDashboardEvents(EVENTS, filters("range=all&variant=C"));
  assert.equal(data.summary.totalRequests, 3);
  assert.equal(data.summary.offerEndpointFetches, 1);
});

test("dashboard filters by event type", () => {
  const data = aggregateDashboardEvents(EVENTS, filters("range=all&event=offer_endpoint_fetch"));
  assert.equal(data.summary.totalRequests, 2);
  assert.equal(data.summary.offerEndpointFetches, 2);
  assert.equal(data.summary.pageFetches, 0);
});

test("dashboard filters by controlled run", () => {
  const data = aggregateDashboardEvents(EVENTS, filters("range=all&run=run-openai-001"));
  assert.equal(data.summary.totalRequests, 4);
  assert.equal(data.summary.controlledTestRuns, 1);
  assert.equal(data.testRuns[0].outboundAction, true);
});

test("dashboard SQL receives only validated server-side filters", async () => {
  const calls: Array<{ sql: string; params: readonly unknown[] }> = [];
  const database: DatabaseClient = { async query(sql, params = []) { calls.push({ sql, params }); return []; } };
  const selected = filters("range=7d&agent=openai_searchbot&variant=C&event=offer_endpoint_fetch&run=run-openai-001");
  assert.equal((await loadDashboard(selected, database)).status, "ok");
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /endpoint_matrix_rows/);
  assert.deepEqual(calls[0].params, [selected.startAt, "openai_searchbot", "C", "offer_endpoint_fetch", "run-openai-001"]);
});

test("dashboard database error remains a controlled research state", async () => {
  const database: DatabaseClient = { async query() { throw new Error("outage"); } };
  const result = await loadDashboard(filters(), database);
  assert.deepEqual(result, { status: "error" });
  assert.match(renderResultsPage(filters(), result, "https://begod.ai"), /Database temporarily unavailable/);
});

test("results route is noindex and explains missing DATABASE_URL", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const response = await getResults(request("/lab/agent-offers/results?range=24h"));
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
    assert.match(html, /Durable storage is not configured/);
    assert.match(html, /DATABASE_URL/);
    assert.doesNotMatch(html, /postgres(?:ql)?:\/\//i);
  } finally {
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
  }
});
