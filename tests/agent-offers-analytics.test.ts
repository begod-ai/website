import assert from "node:assert/strict";
import { test } from "node:test";
import { GET as getOfferJson } from "../src/app/api/agent-offers/[variant]/route";
import { GET as getVariant } from "../src/app/lab/agent-offers/[variant]/route";
import { GET as getResults } from "../src/app/lab/agent-offers/results/route";
import type { DatabaseClient } from "../src/lib/agent-offers/database";
import {
  aggregateDashboardEvents,
  buildAgentVariantMatrix,
  calculateFunnel,
  parseDashboardFilters,
  type StoredAgentOfferEvent,
} from "../src/lib/agent-offers/dashboard";
import { loadDashboard } from "../src/lib/agent-offers/dashboard-store";
import {
  mapTelemetryEventToInsert,
  persistTelemetryEvent,
} from "../src/lib/agent-offers/event-store";
import {
  CANARY_IDS,
  sanitizeTestRunId,
} from "../src/lib/agent-offers/offer";
import { renderResultsPage } from "../src/lib/agent-offers/results-render";
import {
  createTelemetryEvent,
  writeTelemetryEvent,
  type TelemetryEvent,
} from "../src/lib/agent-offers/telemetry";

const NOW = new Date("2026-08-15T12:00:00.000Z");

function request(path: string, headers?: HeadersInit): Request {
  return new Request(`https://begod.ai${path}`, { headers });
}

function context(variant: string) {
  return { params: Promise.resolve({ variant }) };
}

function storedEvent(
  id: string,
  overrides: Partial<StoredAgentOfferEvent>,
): StoredAgentOfferEvent {
  return {
    id,
    occurredAt: "2026-08-15T11:30:00.000Z",
    eventType: "page_fetch",
    variant: "A",
    canaryId: CANARY_IDS.A,
    route: "/lab/agent-offers/a",
    requestMethod: "GET",
    userAgent: "OAI-SearchBot/1.0",
    agentClass: "openai_searchbot",
    testRunId: "run-openai-001",
    ...overrides,
  };
}

const FIXTURE_EVENTS: StoredAgentOfferEvent[] = [
  storedEvent("1", {}),
  storedEvent("2", {
    occurredAt: "2026-08-15T11:31:00.000Z",
    variant: "D",
    canaryId: CANARY_IDS.D,
    route: "/lab/agent-offers/d",
  }),
  storedEvent("3", {
    occurredAt: "2026-08-15T11:32:00.000Z",
    eventType: "json_endpoint_fetch",
    variant: "D",
    canaryId: CANARY_IDS.D,
    route: "/api/agent-offers/d",
  }),
  storedEvent("4", {
    occurredAt: "2026-08-15T11:33:00.000Z",
    eventType: "outbound_action",
    variant: "D",
    canaryId: CANARY_IDS.D,
    route: "/lab/agent-offers/out/d",
  }),
  storedEvent("5", {
    occurredAt: "2026-08-15T10:00:00.000Z",
    variant: "E",
    canaryId: CANARY_IDS.E,
    route: "/lab/agent-offers/e",
    userAgent: "PerplexityBot/1.0",
    agentClass: "perplexity_bot",
    testRunId: "run-perplexity-001",
  }),
  storedEvent("6", {
    occurredAt: "2026-08-15T10:01:00.000Z",
    eventType: "well_known_fetch",
    variant: "E",
    canaryId: CANARY_IDS.E,
    route: "/.well-known/agent-offers.json",
    userAgent: "PerplexityBot/1.0",
    agentClass: "perplexity_bot",
    testRunId: "run-perplexity-001",
  }),
  storedEvent("7", {
    occurredAt: "2026-08-13T09:00:00.000Z",
    variant: "B",
    canaryId: CANARY_IDS.B,
    route: "/lab/agent-offers/b",
    userAgent: "Mozilla/5.0",
    agentClass: "normal_browser",
    testRunId: null,
  }),
  storedEvent("8", {
    occurredAt: "2026-08-15T09:00:00.000Z",
    eventType: "landing_fetch",
    variant: null,
    canaryId: null,
    route: "/lab/agent-offers",
    userAgent: "custom-client/1.0",
    agentClass: "unknown",
    testRunId: null,
  }),
];

function filters(query = "range=all") {
  return parseDashboardFilters(new URLSearchParams(query), NOW);
}

function telemetryEvent(): TelemetryEvent {
  return createTelemetryEvent(
    request("/lab/agent-offers/d?run=chatgpt-test-001&source=controlled", {
      "user-agent": "OAI-SearchBot/1.0",
      referer: "https://example.test/prompt",
      accept: "text/html",
    }),
    {
      eventType: "page_fetch",
      variant: "D",
      canaryId: CANARY_IDS.D,
    },
  );
}

test("normalized telemetry includes controlled-run and deployment fields", () => {
  const event = telemetryEvent();

  assert.equal(event.test_run_id, "chatgpt-test-001");
  assert.deepEqual(event.query_parameters, {
    run: "chatgpt-test-001",
    source: "controlled",
  });
  assert.equal(event.deployment_url, "https://begod.ai");
  assert.equal(event.bot_classification, "openai_searchbot");
  assert.equal("ip" in event, false);
});

test("database insert mapping preserves normalized event fields", () => {
  const event = telemetryEvent();
  const mapping = mapTelemetryEventToInsert(event);

  assert.match(mapping.sql, /INSERT INTO agent_offer_events/);
  assert.equal(mapping.params[1], "page_fetch");
  assert.equal(mapping.params[2], "D");
  assert.equal(mapping.params[7], "openai_searchbot");
  assert.equal(mapping.params[10], JSON.stringify(event.query_parameters));
  assert.equal(mapping.params[11], "chatgpt-test-001");
  assert.equal(mapping.params[13], "https://begod.ai");
});

test("durable telemetry reports a graceful not-configured result", async () => {
  assert.equal(await persistTelemetryEvent(telemetryEvent(), null), "not_configured");
});

test("a database write failure keeps the structured log path successful", async () => {
  const logged: TelemetryEvent[] = [];
  const failures: unknown[] = [];

  await assert.doesNotReject(() =>
    writeTelemetryEvent(telemetryEvent(), {
      structuredLogSink: {
        write(event) {
          logged.push(event);
        },
      },
      durableSink: {
        write() {
          throw new Error("synthetic database outage");
        },
      },
      databaseErrorLogger(_event, error) {
        failures.push(error);
      },
    }),
  );

  assert.equal(logged.length, 1);
  assert.equal(failures.length, 1);
});

test("controlled run IDs use a conservative bounded format", () => {
  assert.equal(sanitizeTestRunId("chatgpt-test_001"), "chatgpt-test_001");
  assert.equal(sanitizeTestRunId(""), null);
  assert.equal(sanitizeTestRunId("contains spaces"), null);
  assert.equal(sanitizeTestRunId("slash/value"), null);
  assert.equal(sanitizeTestRunId("a".repeat(65)), null);

  const invalidEvent = createTelemetryEvent(
    request("/lab/agent-offers/a?run=invalid%20value"),
    { eventType: "page_fetch", variant: "A", canaryId: CANARY_IDS.A },
  );
  assert.equal(invalidEvent.test_run_id, null);
  assert.deepEqual(invalidEvent.query_parameters, {});
});

test("controlled run propagates into JSON and outbound links, not canonical or JSON-LD", async () => {
  const response = await getVariant(
    request("/lab/agent-offers/d?run=chatgpt-test-001"),
    context("d"),
  );
  const html = await response.text();
  const jsonLd = html.match(
    /<script type="application\/ld\+json">([^<]+)<\/script>/,
  );

  assert.equal(response.status, 200);
  assert.match(html, /href="\/api\/agent-offers\/d\?run=chatgpt-test-001"/);
  assert.match(
    html,
    /href="\/lab\/agent-offers\/out\/d\?run=chatgpt-test-001"/,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/begod\.ai\/lab\/agent-offers\/d">/,
  );
  assert.ok(jsonLd);
  assert.doesNotMatch(jsonLd[1], /chatgpt-test-001|[?&]run=/);

  const apiResponse = await getOfferJson(
    request("/api/agent-offers/d?run=chatgpt-test-001"),
    context("d"),
  );
  const apiBody = await apiResponse.json();
  assert.equal(
    apiBody.destination,
    "/lab/agent-offers/out/d?run=chatgpt-test-001",
  );
});

test("dashboard aggregation produces summary, variants, agents, runs, and recency", () => {
  const data = aggregateDashboardEvents(FIXTURE_EVENTS, filters());

  assert.deepEqual(data.summary, {
    totalRequests: 8,
    aiBotRequests: 6,
    pageFetches: 4,
    jsonEndpointFetches: 1,
    wellKnownFetches: 1,
    outboundActions: 1,
    uniqueAgentClasses: 4,
    controlledTestRuns: 2,
  });
  assert.equal(data.variantBreakdown.find((row) => row.variant === "D")?.pageFetches, 1);
  assert.equal(data.agentBreakdown[0].agentClass, "openai_searchbot");
  assert.equal(data.testRuns[0].testRunId, "run-openai-001");
  assert.equal(data.recentEvents[0].id, "4");
});

test("A-E matrix counts page fetches only and includes column totals", () => {
  const matrix = buildAgentVariantMatrix(FIXTURE_EVENTS);
  const openAi = matrix.rows.find((row) => row.agentClass === "openai_searchbot");

  assert.deepEqual(openAi?.counts, { A: 1, B: 0, C: 0, D: 1, E: 0 });
  assert.equal(openAi?.total, 2);
  assert.deepEqual(matrix.columnTotals, { A: 1, B: 1, C: 0, D: 1, E: 1 });
});

test("discovery funnel is explicitly aggregate event counts", () => {
  assert.deepEqual(calculateFunnel(FIXTURE_EVENTS), {
    pageFetches: 4,
    jsonEndpointFetches: 1,
    wellKnownFetches: 1,
    outboundActions: 1,
  });
});

test("dashboard filters by time", () => {
  const data = aggregateDashboardEvents(FIXTURE_EVENTS, filters("range=1h"));
  assert.equal(data.summary.totalRequests, 4);
  assert.equal(data.summary.pageFetches, 2);
});

test("dashboard filters by normalized agent", () => {
  const data = aggregateDashboardEvents(
    FIXTURE_EVENTS,
    filters("range=all&agent=perplexity_bot"),
  );
  assert.equal(data.summary.totalRequests, 2);
  assert.equal(data.agentBreakdown[0].agentClass, "perplexity_bot");
});

test("dashboard filters by variant", () => {
  const data = aggregateDashboardEvents(
    FIXTURE_EVENTS,
    filters("range=all&variant=D"),
  );
  assert.equal(data.summary.totalRequests, 3);
  assert.equal(data.summary.jsonEndpointFetches, 1);
});

test("dashboard filters by event type", () => {
  const data = aggregateDashboardEvents(
    FIXTURE_EVENTS,
    filters("range=all&event=json_endpoint_fetch"),
  );
  assert.equal(data.summary.totalRequests, 1);
  assert.equal(data.summary.jsonEndpointFetches, 1);
  assert.equal(data.summary.pageFetches, 0);
});

test("dashboard filters by controlled test run", () => {
  const data = aggregateDashboardEvents(
    FIXTURE_EVENTS,
    filters("range=all&run=run-openai-001"),
  );
  assert.equal(data.summary.totalRequests, 4);
  assert.equal(data.summary.controlledTestRuns, 1);
  assert.equal(data.testRuns[0].outboundAction, true);
});

test("dashboard query receives only validated server-side filter parameters", async () => {
  const calls: Array<{ sql: string; params: readonly unknown[] }> = [];
  const database: DatabaseClient = {
    async query(sql, params = []) {
      calls.push({ sql, params });
      return [];
    },
  };
  const selected = filters(
    "range=7d&agent=openai_searchbot&variant=D&event=page_fetch&run=run-openai-001",
  );
  const result = await loadDashboard(selected, database);

  assert.equal(result.status, "ok");
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /WITH filtered AS/);
  assert.deepEqual(calls[0].params, [
    selected.startAt,
    "openai_searchbot",
    "D",
    "page_fetch",
    "run-openai-001",
  ]);
});

test("dashboard loading returns a clear database-error result", async () => {
  const database: DatabaseClient = {
    async query() {
      throw new Error("synthetic outage");
    },
  };
  const result = await loadDashboard(filters(), database);

  assert.deepEqual(result, { status: "error" });
  const html = renderResultsPage(filters(), result, "https://begod.ai");
  assert.match(html, /Database temporarily unavailable/);
});

test("results route is noindex and explains missing DATABASE_URL", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    const response = await getResults(
      request("/lab/agent-offers/results?range=24h"),
    );
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
    assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
    assert.match(html, /Durable storage is not configured/);
    assert.match(html, /DATABASE_URL/);
    assert.doesNotMatch(html, /postgres(?:ql)?:\/\//i);
  } finally {
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
  }
});
