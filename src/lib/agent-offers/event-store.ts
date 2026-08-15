import type { DatabaseClient } from "./database";
import { getDatabaseClient } from "./database";
import type { TelemetryEvent } from "./telemetry";

export const INSERT_EVENT_SQL = `
  INSERT INTO agent_offer_events (
    occurred_at,
    event_type,
    variant,
    canary_id,
    route,
    request_method,
    user_agent,
    agent_class,
    referrer,
    accept_header,
    query_params,
    test_run_id,
    environment,
    deployment_url
  ) VALUES (
    $1::timestamptz,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11::jsonb,
    $12,
    $13,
    $14
  )
`;

export interface EventInsertMapping {
  sql: string;
  params: readonly unknown[];
}

export function mapTelemetryEventToInsert(
  event: TelemetryEvent,
): EventInsertMapping {
  return {
    sql: INSERT_EVENT_SQL,
    params: [
      event.timestamp,
      event.event_type,
      event.experiment_variant,
      event.canary_id,
      event.route,
      event.request_method,
      event.user_agent,
      event.bot_classification,
      event.referrer,
      event.accept,
      JSON.stringify(event.query_parameters),
      event.test_run_id,
      event.environment,
      event.deployment_url,
    ],
  };
}

export type PersistTelemetryResult = "inserted" | "not_configured";

export async function persistTelemetryEvent(
  event: TelemetryEvent,
  database: DatabaseClient | null = getDatabaseClient(),
): Promise<PersistTelemetryResult> {
  if (!database) {
    return "not_configured";
  }

  const mapping = mapTelemetryEventToInsert(event);
  await database.query(mapping.sql, mapping.params);
  return "inserted";
}
