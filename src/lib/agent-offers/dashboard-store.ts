import { parseBotClassification } from "./bot-classifier";
import type { DatabaseClient } from "./database";
import { getDatabaseClient } from "./database";
import {
  aggregateDashboardEvents,
  type AgentBreakdownRow,
  type AgentVariantMatrixRow,
  type DashboardData,
  type DashboardFilters,
  type DashboardFunnel,
  type DashboardSummary,
  type StoredAgentOfferEvent,
  type TestRunBreakdownRow,
  type VariantBreakdownRow,
} from "./dashboard";
import {
  parseVariant,
  sanitizeTestRunId,
  VARIANTS,
  type ExperimentVariant,
} from "./offer";
import {
  TELEMETRY_EVENT_TYPES,
  type TelemetryEventType,
} from "./telemetry";

export const DASHBOARD_QUERY_SQL = `
  WITH filtered AS (
    SELECT
      id,
      occurred_at,
      event_type,
      variant,
      canary_id,
      route,
      request_method,
      user_agent,
      agent_class,
      test_run_id
    FROM agent_offer_events
    WHERE ($1::timestamptz IS NULL OR occurred_at >= $1::timestamptz)
      AND ($2::text IS NULL OR agent_class = $2::text)
      AND ($3::text IS NULL OR variant = $3::text)
      AND ($4::text IS NULL OR event_type = $4::text)
      AND ($5::text IS NULL OR test_run_id = $5::text)
  ),
  summary_row AS (
    SELECT
      COUNT(*)::int AS total_requests,
      COUNT(*) FILTER (
        WHERE agent_class NOT IN ('normal_browser', 'unknown')
      )::int AS ai_bot_requests,
      COUNT(*) FILTER (WHERE event_type = 'page_fetch')::int AS page_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'json_endpoint_fetch'
      )::int AS json_endpoint_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'well_known_fetch'
      )::int AS well_known_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'outbound_action'
      )::int AS outbound_actions,
      COUNT(DISTINCT agent_class)::int AS unique_agent_classes,
      COUNT(DISTINCT test_run_id)::int AS controlled_test_runs
    FROM filtered
  ),
  matrix_rows AS (
    SELECT agent_class, variant, COUNT(*)::int AS event_count
    FROM filtered
    WHERE event_type = 'page_fetch' AND variant IS NOT NULL
    GROUP BY agent_class, variant
  ),
  variant_rows AS (
    SELECT
      variant,
      COUNT(*) FILTER (WHERE event_type = 'page_fetch')::int AS page_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'page_fetch'
          AND agent_class NOT IN ('normal_browser', 'unknown')
      )::int AS ai_bot_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'json_endpoint_fetch'
      )::int AS json_endpoint_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'outbound_action'
      )::int AS outbound_actions
    FROM filtered
    WHERE variant IS NOT NULL
    GROUP BY variant
  ),
  agent_rows AS (
    SELECT
      agent_class,
      COUNT(*)::int AS total_events,
      COUNT(*) FILTER (WHERE event_type = 'page_fetch')::int AS page_fetches,
      COALESCE(
        ARRAY_AGG(DISTINCT variant ORDER BY variant)
          FILTER (WHERE event_type = 'page_fetch' AND variant IS NOT NULL),
        ARRAY[]::text[]
      ) AS variants_fetched,
      COUNT(*) FILTER (
        WHERE event_type = 'json_endpoint_fetch'
      )::int AS json_endpoint_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'well_known_fetch'
      )::int AS well_known_fetches,
      COUNT(*) FILTER (
        WHERE event_type = 'outbound_action'
      )::int AS outbound_actions,
      MAX(occurred_at) AS most_recent_request
    FROM filtered
    GROUP BY agent_class
  ),
  recent_rows AS (
    SELECT *
    FROM filtered
    ORDER BY occurred_at DESC, id DESC
    LIMIT 100
  ),
  run_rows AS (
    SELECT
      test_run_id,
      MIN(occurred_at) AS first_event,
      MAX(occurred_at) AS last_event,
      ARRAY_AGG(DISTINCT agent_class ORDER BY agent_class) AS agent_classes,
      COALESCE(
        ARRAY_AGG(DISTINCT variant ORDER BY variant)
          FILTER (WHERE variant IS NOT NULL),
        ARRAY[]::text[]
      ) AS variants_touched,
      COUNT(*)::int AS event_count,
      BOOL_OR(event_type = 'json_endpoint_fetch') AS json_discovery,
      BOOL_OR(event_type = 'well_known_fetch') AS well_known_discovery,
      BOOL_OR(event_type = 'outbound_action') AS outbound_action
    FROM filtered
    WHERE test_run_id IS NOT NULL
    GROUP BY test_run_id
    ORDER BY MAX(occurred_at) DESC
    LIMIT 50
  )
  SELECT
    (
      SELECT jsonb_build_object(
        'totalRequests', total_requests,
        'aiBotRequests', ai_bot_requests,
        'pageFetches', page_fetches,
        'jsonEndpointFetches', json_endpoint_fetches,
        'wellKnownFetches', well_known_fetches,
        'outboundActions', outbound_actions,
        'uniqueAgentClasses', unique_agent_classes,
        'controlledTestRuns', controlled_test_runs
      )
      FROM summary_row
    ) AS summary,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'agentClass', agent_class,
          'variant', variant,
          'count', event_count
        ) ORDER BY agent_class, variant
      )
      FROM matrix_rows
    ), '[]'::jsonb) AS matrix,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'variant', variant,
          'pageFetches', page_fetches,
          'aiBotFetches', ai_bot_fetches,
          'jsonEndpointFetches', json_endpoint_fetches,
          'outboundActions', outbound_actions
        ) ORDER BY variant
      )
      FROM variant_rows
    ), '[]'::jsonb) AS variant_breakdown,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'agentClass', agent_class,
          'totalEvents', total_events,
          'pageFetches', page_fetches,
          'variantsFetched', variants_fetched,
          'jsonEndpointFetches', json_endpoint_fetches,
          'wellKnownFetches', well_known_fetches,
          'outboundActions', outbound_actions,
          'mostRecentRequest', most_recent_request
        ) ORDER BY total_events DESC, agent_class
      )
      FROM agent_rows
    ), '[]'::jsonb) AS agent_breakdown,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id::text,
          'occurredAt', occurred_at,
          'eventType', event_type,
          'variant', variant,
          'canaryId', canary_id,
          'route', route,
          'requestMethod', request_method,
          'userAgent', user_agent,
          'agentClass', agent_class,
          'testRunId', test_run_id
        ) ORDER BY occurred_at DESC, id DESC
      )
      FROM recent_rows
    ), '[]'::jsonb) AS recent_events,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'testRunId', test_run_id,
          'firstEvent', first_event,
          'lastEvent', last_event,
          'agentClasses', agent_classes,
          'variantsTouched', variants_touched,
          'eventCount', event_count,
          'jsonDiscovery', json_discovery,
          'wellKnownDiscovery', well_known_discovery,
          'outboundAction', outbound_action
        ) ORDER BY last_event DESC
      )
      FROM run_rows
    ), '[]'::jsonb) AS test_runs
`;

interface DashboardQueryRow extends Record<string, unknown> {
  summary: DashboardSummary;
  matrix: Array<{
    agentClass: string;
    variant: string;
    count: number;
  }>;
  variant_breakdown: VariantBreakdownRow[];
  agent_breakdown: AgentBreakdownRow[];
  recent_events: StoredAgentOfferEvent[];
  test_runs: TestRunBreakdownRow[];
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeEventType(value: unknown): TelemetryEventType | null {
  return TELEMETRY_EVENT_TYPES.find((candidate) => candidate === value) ?? null;
}

function normalizeSummary(value: unknown): DashboardSummary {
  const summary = (value ?? {}) as Partial<DashboardSummary>;
  return {
    totalRequests: numberValue(summary.totalRequests),
    aiBotRequests: numberValue(summary.aiBotRequests),
    pageFetches: numberValue(summary.pageFetches),
    jsonEndpointFetches: numberValue(summary.jsonEndpointFetches),
    wellKnownFetches: numberValue(summary.wellKnownFetches),
    outboundActions: numberValue(summary.outboundActions),
    uniqueAgentClasses: numberValue(summary.uniqueAgentClasses),
    controlledTestRuns: numberValue(summary.controlledTestRuns),
  };
}

function normalizeDashboardRow(row: DashboardQueryRow): DashboardData {
  const matrixByAgent = new Map<string, AgentVariantMatrixRow>();
  const matrixColumnTotals: Record<ExperimentVariant, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };

  for (const matrixItem of row.matrix ?? []) {
    const agentClass = parseBotClassification(matrixItem.agentClass);
    const variant = parseVariant(matrixItem.variant);
    if (!agentClass || !variant) {
      continue;
    }

    const existing = matrixByAgent.get(agentClass) ?? {
      agentClass,
      counts: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      total: 0,
    };
    const count = numberValue(matrixItem.count);
    existing.counts[variant] += count;
    existing.total += count;
    matrixColumnTotals[variant] += count;
    matrixByAgent.set(agentClass, existing);
  }

  const summary = normalizeSummary(row.summary);
  const rawVariants = new Map(
    (row.variant_breakdown ?? []).flatMap((item) => {
      const variant = parseVariant(String(item.variant));
      return variant ? [[variant, item] as const] : [];
    }),
  );
  const variantBreakdown = VARIANTS.map((variant) => {
    const item = rawVariants.get(variant);
    return {
      variant,
      pageFetches: numberValue(item?.pageFetches),
      aiBotFetches: numberValue(item?.aiBotFetches),
      jsonEndpointFetches: numberValue(item?.jsonEndpointFetches),
      outboundActions: numberValue(item?.outboundActions),
    };
  });

  const agentBreakdown = (row.agent_breakdown ?? []).flatMap((item) => {
    const agentClass = parseBotClassification(String(item.agentClass));
    if (!agentClass) {
      return [];
    }
    return [
      {
        agentClass,
        totalEvents: numberValue(item.totalEvents),
        pageFetches: numberValue(item.pageFetches),
        variantsFetched: (item.variantsFetched ?? []).flatMap((value) => {
          const variant = parseVariant(String(value));
          return variant ? [variant] : [];
        }),
        jsonEndpointFetches: numberValue(item.jsonEndpointFetches),
        wellKnownFetches: numberValue(item.wellKnownFetches),
        outboundActions: numberValue(item.outboundActions),
        mostRecentRequest: String(item.mostRecentRequest),
      },
    ];
  });

  const recentEvents = (row.recent_events ?? []).flatMap((item) => {
    const eventType = normalizeEventType(item.eventType);
    const agentClass = parseBotClassification(String(item.agentClass));
    const variant = item.variant ? parseVariant(String(item.variant)) : null;
    if (!eventType || !agentClass) {
      return [];
    }
    return [
      {
        id: String(item.id),
        occurredAt: String(item.occurredAt),
        eventType,
        variant,
        canaryId: item.canaryId ? String(item.canaryId) : null,
        route: String(item.route),
        requestMethod: String(item.requestMethod),
        userAgent: String(item.userAgent),
        agentClass,
        testRunId: item.testRunId
          ? sanitizeTestRunId(String(item.testRunId))
          : null,
      },
    ];
  });

  const testRuns = (row.test_runs ?? []).flatMap((item) => {
    const testRunId = sanitizeTestRunId(String(item.testRunId));
    if (!testRunId) {
      return [];
    }
    return [
      {
        testRunId,
        firstEvent: String(item.firstEvent),
        lastEvent: String(item.lastEvent),
        agentClasses: (item.agentClasses ?? []).flatMap((value) => {
          const agentClass = parseBotClassification(String(value));
          return agentClass ? [agentClass] : [];
        }),
        variantsTouched: (item.variantsTouched ?? []).flatMap((value) => {
          const variant = parseVariant(String(value));
          return variant ? [variant] : [];
        }),
        eventCount: numberValue(item.eventCount),
        jsonDiscovery: Boolean(item.jsonDiscovery),
        wellKnownDiscovery: Boolean(item.wellKnownDiscovery),
        outboundAction: Boolean(item.outboundAction),
      },
    ];
  });

  const funnel: DashboardFunnel = {
    pageFetches: summary.pageFetches,
    jsonEndpointFetches: summary.jsonEndpointFetches,
    wellKnownFetches: summary.wellKnownFetches,
    outboundActions: summary.outboundActions,
  };

  return {
    summary,
    matrix: Array.from(matrixByAgent.values()).sort(
      (a, b) => b.total - a.total || a.agentClass.localeCompare(b.agentClass),
    ),
    matrixColumnTotals,
    funnel,
    variantBreakdown,
    agentBreakdown,
    recentEvents,
    testRuns,
  };
}

export type DashboardLoadResult =
  | { status: "ok"; data: DashboardData }
  | { status: "not_configured" }
  | { status: "error" };

export async function loadDashboard(
  filters: DashboardFilters,
  database: DatabaseClient | null = getDatabaseClient(),
): Promise<DashboardLoadResult> {
  if (!database) {
    return { status: "not_configured" };
  }

  try {
    const rows = await database.query<DashboardQueryRow>(DASHBOARD_QUERY_SQL, [
      filters.startAt,
      filters.agent,
      filters.variant,
      filters.eventType,
      filters.testRunId,
    ]);
    const row = rows[0];
    return {
      status: "ok",
      data: row
        ? normalizeDashboardRow(row)
        : aggregateDashboardEvents([], filters),
    };
  } catch {
    return { status: "error" };
  }
}
