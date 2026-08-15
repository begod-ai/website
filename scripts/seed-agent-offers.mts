import { classifyUserAgent } from "../src/lib/agent-offers/bot-classifier";
import { getDatabaseClient } from "../src/lib/agent-offers/database";
import { persistTelemetryEvent } from "../src/lib/agent-offers/event-store";
import {
  CANARY_IDS,
  type ExperimentVariant,
} from "../src/lib/agent-offers/offer";
import type {
  TelemetryEvent,
  TelemetryEventType,
} from "../src/lib/agent-offers/telemetry";

if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
  throw new Error("The development seed script refuses to run in production.");
}

if (process.env.AGENT_LAB_ALLOW_SEED !== "true") {
  throw new Error(
    "Set AGENT_LAB_ALLOW_SEED=true to confirm an intentional development seed.",
  );
}

const database = getDatabaseClient();
if (!database) {
  throw new Error("DATABASE_URL is required to seed Agent Offers Lab events.");
}

interface SeedSpecification {
  minutesAgo: number;
  eventType: TelemetryEventType;
  variant: ExperimentVariant | null;
  userAgent: string;
  testRunId: string | null;
  route: string;
}

const seedSpecifications: SeedSpecification[] = [
  { minutesAgo: 70, eventType: "landing_fetch", variant: null, userAgent: "OAI-SearchBot/seed", testRunId: "seed-openai-001", route: "/lab/agent-offers" },
  { minutesAgo: 68, eventType: "page_fetch", variant: "A", userAgent: "OAI-SearchBot/seed", testRunId: "seed-openai-001", route: "/lab/agent-offers/a" },
  { minutesAgo: 66, eventType: "page_fetch", variant: "C", userAgent: "OAI-SearchBot/seed", testRunId: "seed-openai-001", route: "/lab/agent-offers/c" },
  { minutesAgo: 64, eventType: "page_fetch", variant: "D", userAgent: "OAI-SearchBot/seed", testRunId: "seed-openai-001", route: "/lab/agent-offers/d" },
  { minutesAgo: 62, eventType: "offer_endpoint_fetch", variant: "D", userAgent: "OAI-SearchBot/seed", testRunId: "seed-openai-001", route: "/api/agent-offers/serve/charger-d" },
  { minutesAgo: 60, eventType: "outbound_action", variant: "D", userAgent: "OAI-SearchBot/seed", testRunId: "seed-openai-001", route: "/lab/agent-offers/out/d" },
  { minutesAgo: 45, eventType: "page_fetch", variant: "E", userAgent: "PerplexityBot/seed", testRunId: "seed-perplexity-001", route: "/lab/agent-offers/e" },
  { minutesAgo: 43, eventType: "offer_endpoint_fetch", variant: "E", userAgent: "PerplexityBot/seed", testRunId: "seed-perplexity-001", route: "/api/agent-offers/serve/charger-e" },
  { minutesAgo: 39, eventType: "outbound_action", variant: "E", userAgent: "PerplexityBot/seed", testRunId: "seed-perplexity-001", route: "/lab/agent-offers/out/e" },
  { minutesAgo: 30, eventType: "page_fetch", variant: "B", userAgent: "Googlebot/2.1 seed", testRunId: "seed-google-001", route: "/lab/agent-offers/b" },
  { minutesAgo: 25, eventType: "page_fetch", variant: "C", userAgent: "ClaudeBot/seed", testRunId: "seed-claude-001", route: "/lab/agent-offers/c" },
  { minutesAgo: 20, eventType: "page_fetch", variant: "A", userAgent: "Mozilla/5.0 seed browser", testRunId: null, route: "/lab/agent-offers/a" },
];

const now = Date.now();

function createSeedEvent(specification: SeedSpecification): TelemetryEvent {
  return {
    source: "agent_offers_lab",
    timestamp: new Date(now - specification.minutesAgo * 60_000).toISOString(),
    route: specification.route,
    event_type: specification.eventType,
    experiment_variant: specification.variant,
    canary_id: specification.variant ? CANARY_IDS[specification.variant] : null,
    request_method: "GET",
    user_agent: specification.userAgent,
    bot_classification: classifyUserAgent(specification.userAgent),
    referrer: null,
    accept: "text/html,application/json",
    query_parameters: specification.testRunId
      ? { run: specification.testRunId }
      : {},
    test_run_id: specification.testRunId,
    environment: "development-seed",
    deployment_url: "http://localhost:3000",
  };
}

for (const specification of seedSpecifications) {
  await persistTelemetryEvent(createSeedEvent(specification), database);
}

console.info(`Inserted ${seedSpecifications.length} synthetic development events.`);
