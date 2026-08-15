import { classifyUserAgent, type BotClassification } from "./bot-classifier";
import type { ExperimentVariant } from "./offer";

export type TelemetryEventType =
  | "page_fetch"
  | "json_endpoint_fetch"
  | "well_known_fetch"
  | "outbound_action";

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

const defaultSink = new StructuredLogTelemetrySink();
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
