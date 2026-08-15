import { classifyUserAgent, type BotClassification } from "./bot-classifier";
import { persistTelemetryEvent } from "./event-store";
import {
  sanitizeTestRunId,
  type ExperimentVariant,
} from "./offer";

export const TELEMETRY_EVENT_TYPES = [
  "landing_fetch",
  "page_fetch",
  "offer_endpoint_fetch",
  "outbound_action",
] as const;

export type TelemetryEventType = (typeof TELEMETRY_EVENT_TYPES)[number];

export interface TelemetryEvent {
  source: "agent_offers_lab";
  timestamp: string;
  route: string;
  event_type: TelemetryEventType;
  experiment_variant: ExperimentVariant | null;
  canary_id: string | null;
  request_method: string;
  user_agent: string;
  bot_classification: BotClassification;
  referrer: string | null;
  accept: string | null;
  query_parameters: Record<string, string | string[]>;
  test_run_id: string | null;
  environment: string;
  deployment_url: string;
}

export interface TelemetrySink {
  write(event: TelemetryEvent): Promise<void> | void;
}

class StructuredLogTelemetrySink implements TelemetrySink {
  write(event: TelemetryEvent): void {
    // A single JSON line is queryable in Vercel runtime logs.
    console.info(JSON.stringify(event));
  }
}

class PostgresTelemetrySink implements TelemetrySink {
  async write(event: TelemetryEvent): Promise<void> {
    await persistTelemetryEvent(event);
  }
}

const structuredLogSink = new StructuredLogTelemetrySink();
const postgresTelemetrySink = new PostgresTelemetrySink();

export interface TelemetryWriteDependencies {
  structuredLogSink?: TelemetrySink;
  durableSink?: TelemetrySink;
  databaseErrorLogger?: (event: TelemetryEvent, error: unknown) => void;
}

function logDatabaseError(event: TelemetryEvent, error: unknown): void {
  console.error(
    JSON.stringify({
      source: "agent_offers_lab",
      event_type: "telemetry_database_error",
      route: event.route,
      experiment_variant: event.experiment_variant,
      canary_id: event.canary_id,
      error_name: error instanceof Error ? error.name : "UnknownError",
      message: "Durable telemetry write failed; the experiment response continued.",
    }),
  );
}

export async function writeTelemetryEvent(
  event: TelemetryEvent,
  dependencies: TelemetryWriteDependencies = {},
): Promise<void> {
  const logSink = dependencies.structuredLogSink ?? structuredLogSink;
  const durableSink = dependencies.durableSink ?? postgresTelemetrySink;

  await logSink.write(event);

  try {
    await durableSink.write(event);
  } catch (error) {
    (dependencies.databaseErrorLogger ?? logDatabaseError)(event, error);
  }
}

const defaultSink: TelemetrySink = { write: writeTelemetryEvent };
let activeSink: TelemetrySink = defaultSink;

const SENSITIVE_QUERY_KEY =
  /token|secret|password|passwd|authorization|auth|email|phone|session|cookie/i;

function boundedHeader(value: string | null, maxLength: number): string | null {
  if (!value) {
    return null;
  }

  return value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, maxLength);
}

function safeQueryParameters(url: URL): Record<string, string | string[]> {
  const values = new Map<string, string[]>();

  for (const [rawKey, rawValue] of url.searchParams.entries()) {
    const key = rawKey.slice(0, 64);
    if (!key || SENSITIVE_QUERY_KEY.test(key)) {
      continue;
    }

    if (key === "run") {
      const testRunId = sanitizeTestRunId(rawValue);
      if (testRunId) {
        values.set(key, [testRunId]);
      }
      continue;
    }

    const existing = values.get(key) ?? [];
    if (existing.length < 10) {
      existing.push(rawValue.slice(0, 256));
      values.set(key, existing);
    }
  }

  return Object.fromEntries(
    Array.from(values, ([key, entries]) => [
      key,
      entries.length === 1 ? entries[0] : entries,
    ]),
  );
}

export function createTelemetryEvent(
  request: Request,
  details: {
    eventType: TelemetryEventType;
    variant: ExperimentVariant | null;
    canaryId: string | null;
  },
): TelemetryEvent {
  const url = new URL(request.url);
  const userAgent = boundedHeader(request.headers.get("user-agent"), 1024) ?? "";
  const environment =
    boundedHeader(
      process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      32,
    ) ?? "unknown";

  return {
    source: "agent_offers_lab",
    timestamp: new Date().toISOString(),
    route: url.pathname,
    event_type: details.eventType,
    experiment_variant: details.variant,
    canary_id: details.canaryId,
    request_method: request.method,
    user_agent: userAgent,
    bot_classification: classifyUserAgent(userAgent),
    referrer: boundedHeader(request.headers.get("referer"), 2048),
    accept: boundedHeader(request.headers.get("accept"), 512),
    query_parameters: safeQueryParameters(url),
    test_run_id: sanitizeTestRunId(url.searchParams.get("run")),
    environment,
    deployment_url: url.origin.slice(0, 512),
  };
}

export async function recordTelemetry(
  request: Request,
  details: {
    eventType: TelemetryEventType;
    variant: ExperimentVariant | null;
    canaryId: string | null;
  },
): Promise<void> {
  const event = createTelemetryEvent(request, details);

  try {
    await activeSink.write(event);
  } catch (error) {
    // Telemetry must never make a research route unavailable.
    console.error(
      JSON.stringify({
        source: "agent_offers_lab",
        event_type: "telemetry_error",
        route: event.route,
        message: error instanceof Error ? error.message : "Unknown telemetry error",
      }),
    );
  }
}

export function setTelemetrySink(sink: TelemetrySink): void {
  activeSink = sink;
}

export function resetTelemetrySink(): void {
  activeSink = defaultSink;
}
