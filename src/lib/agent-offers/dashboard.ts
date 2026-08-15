import {
  BOT_CLASSIFICATIONS,
  parseBotClassification,
  type BotClassification,
} from "./bot-classifier";
import {
  sanitizeTestRunId,
  VARIANTS,
  type ExperimentVariant,
} from "./offer";
import {
  TELEMETRY_EVENT_TYPES,
  type TelemetryEventType,
} from "./telemetry";

export const DASHBOARD_RANGES = ["1h", "24h", "7d", "30d", "all"] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

const RANGE_MILLISECONDS: Record<Exclude<DashboardRange, "all">, number> = {
  "1h": 60 * 60 * 1_000,
  "24h": 24 * 60 * 60 * 1_000,
  "7d": 7 * 24 * 60 * 60 * 1_000,
  "30d": 30 * 24 * 60 * 60 * 1_000,
};

export interface DashboardFilters {
  range: DashboardRange;
  startAt: string | null;
  agent: BotClassification | null;
  variant: ExperimentVariant | null;
  eventType: TelemetryEventType | null;
  testRunId: string | null;
}

export interface StoredAgentOfferEvent {
  id: string;
  occurredAt: string;
  eventType: TelemetryEventType;
  variant: ExperimentVariant | null;
  canaryId: string | null;
  route: string;
  requestMethod: string;
  userAgent: string;
  agentClass: BotClassification;
  testRunId: string | null;
}

export interface DashboardSummary {
  totalRequests: number;
  aiBotRequests: number;
  pageFetches: number;
  jsonEndpointFetches: number;
  wellKnownFetches: number;
  outboundActions: number;
  uniqueAgentClasses: number;
  controlledTestRuns: number;
}

export interface AgentVariantMatrixRow {
  agentClass: BotClassification;
  counts: Record<ExperimentVariant, number>;
  total: number;
}

export interface DashboardFunnel {
  pageFetches: number;
  jsonEndpointFetches: number;
  wellKnownFetches: number;
  outboundActions: number;
}

export interface VariantBreakdownRow {
  variant: ExperimentVariant;
  pageFetches: number;
  aiBotFetches: number;
  jsonEndpointFetches: number;
  outboundActions: number;
}

export interface AgentBreakdownRow {
  agentClass: BotClassification;
  totalEvents: number;
  pageFetches: number;
  variantsFetched: ExperimentVariant[];
  jsonEndpointFetches: number;
  wellKnownFetches: number;
  outboundActions: number;
  mostRecentRequest: string;
}

export interface TestRunBreakdownRow {
  testRunId: string;
  firstEvent: string;
  lastEvent: string;
  agentClasses: BotClassification[];
  variantsTouched: ExperimentVariant[];
  eventCount: number;
  jsonDiscovery: boolean;
  wellKnownDiscovery: boolean;
  outboundAction: boolean;
}

export interface DashboardData {
  summary: DashboardSummary;
  matrix: AgentVariantMatrixRow[];
  matrixColumnTotals: Record<ExperimentVariant, number>;
  funnel: DashboardFunnel;
  variantBreakdown: VariantBreakdownRow[];
  agentBreakdown: AgentBreakdownRow[];
  recentEvents: StoredAgentOfferEvent[];
  testRuns: TestRunBreakdownRow[];
}

export function parseDashboardFilters(
  searchParams: URLSearchParams,
  now = new Date(),
): DashboardFilters {
  const requestedRange = searchParams.get("range");
  const range =
    DASHBOARD_RANGES.find((candidate) => candidate === requestedRange) ?? "24h";
  const variantValue = searchParams.get("variant")?.toUpperCase() ?? null;
  const variant = VARIANTS.find((candidate) => candidate === variantValue) ?? null;
  const eventValue = searchParams.get("event");
  const eventType =
    TELEMETRY_EVENT_TYPES.find((candidate) => candidate === eventValue) ?? null;
  const startAt =
    range === "all"
      ? null
      : new Date(now.getTime() - RANGE_MILLISECONDS[range]).toISOString();

  return {
    range,
    startAt,
    agent: parseBotClassification(searchParams.get("agent")),
    variant,
    eventType,
    testRunId: sanitizeTestRunId(searchParams.get("run")),
  };
}

export function isAiOrBot(agentClass: BotClassification): boolean {
  return agentClass !== "normal_browser" && agentClass !== "unknown";
}

function emptyVariantCounts(): Record<ExperimentVariant, number> {
  return { A: 0, B: 0, C: 0, D: 0, E: 0 };
}

function eventMatchesFilters(
  event: StoredAgentOfferEvent,
  filters: DashboardFilters,
): boolean {
  if (filters.startAt && event.occurredAt < filters.startAt) {
    return false;
  }
  if (filters.agent && event.agentClass !== filters.agent) {
    return false;
  }
  if (filters.variant && event.variant !== filters.variant) {
    return false;
  }
  if (filters.eventType && event.eventType !== filters.eventType) {
    return false;
  }
  if (filters.testRunId && event.testRunId !== filters.testRunId) {
    return false;
  }
  return true;
}

export function buildAgentVariantMatrix(
  events: readonly StoredAgentOfferEvent[],
): {
  rows: AgentVariantMatrixRow[];
  columnTotals: Record<ExperimentVariant, number>;
} {
  const byAgent = new Map<BotClassification, Record<ExperimentVariant, number>>();
  const columnTotals = emptyVariantCounts();

  for (const event of events) {
    if (event.eventType !== "page_fetch" || !event.variant) {
      continue;
    }

    const counts = byAgent.get(event.agentClass) ?? emptyVariantCounts();
    counts[event.variant] += 1;
    columnTotals[event.variant] += 1;
    byAgent.set(event.agentClass, counts);
  }

  const rows = Array.from(byAgent, ([agentClass, counts]) => ({
    agentClass,
    counts,
    total: VARIANTS.reduce((sum, variant) => sum + counts[variant], 0),
  })).sort((a, b) => b.total - a.total || a.agentClass.localeCompare(b.agentClass));

  return { rows, columnTotals };
}

export function calculateFunnel(
  events: readonly StoredAgentOfferEvent[],
): DashboardFunnel {
  return {
    pageFetches: events.filter((event) => event.eventType === "page_fetch").length,
    jsonEndpointFetches: events.filter(
      (event) => event.eventType === "json_endpoint_fetch",
    ).length,
    wellKnownFetches: events.filter(
      (event) => event.eventType === "well_known_fetch",
    ).length,
    outboundActions: events.filter(
      (event) => event.eventType === "outbound_action",
    ).length,
  };
}

export function aggregateDashboardEvents(
  events: readonly StoredAgentOfferEvent[],
  filters: DashboardFilters,
): DashboardData {
  const filtered = events
    .filter((event) => eventMatchesFilters(event, filters))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const funnel = calculateFunnel(filtered);
  const matrix = buildAgentVariantMatrix(filtered);
  const distinctAgents = new Set(filtered.map((event) => event.agentClass));
  const distinctRuns = new Set(
    filtered.flatMap((event) => (event.testRunId ? [event.testRunId] : [])),
  );

  const variantBreakdown = VARIANTS.map((variant) => {
    const variantEvents = filtered.filter((event) => event.variant === variant);
    return {
      variant,
      pageFetches: variantEvents.filter((event) => event.eventType === "page_fetch")
        .length,
      aiBotFetches: variantEvents.filter(
        (event) =>
          event.eventType === "page_fetch" && isAiOrBot(event.agentClass),
      ).length,
      jsonEndpointFetches: variantEvents.filter(
        (event) => event.eventType === "json_endpoint_fetch",
      ).length,
      outboundActions: variantEvents.filter(
        (event) => event.eventType === "outbound_action",
      ).length,
    };
  });

  const agentBreakdown = BOT_CLASSIFICATIONS.flatMap((agentClass) => {
    const agentEvents = filtered.filter((event) => event.agentClass === agentClass);
    if (agentEvents.length === 0) {
      return [];
    }

    const variantsFetched = VARIANTS.filter((variant) =>
      agentEvents.some(
        (event) => event.eventType === "page_fetch" && event.variant === variant,
      ),
    );

    return [
      {
        agentClass,
        totalEvents: agentEvents.length,
        pageFetches: agentEvents.filter((event) => event.eventType === "page_fetch")
          .length,
        variantsFetched,
        jsonEndpointFetches: agentEvents.filter(
          (event) => event.eventType === "json_endpoint_fetch",
        ).length,
        wellKnownFetches: agentEvents.filter(
          (event) => event.eventType === "well_known_fetch",
        ).length,
        outboundActions: agentEvents.filter(
          (event) => event.eventType === "outbound_action",
        ).length,
        mostRecentRequest: agentEvents[0].occurredAt,
      },
    ];
  }).sort(
    (a, b) =>
      b.totalEvents - a.totalEvents || a.agentClass.localeCompare(b.agentClass),
  );

  const eventsByRun = new Map<string, StoredAgentOfferEvent[]>();
  for (const event of filtered) {
    if (!event.testRunId) {
      continue;
    }
    const runEvents = eventsByRun.get(event.testRunId) ?? [];
    runEvents.push(event);
    eventsByRun.set(event.testRunId, runEvents);
  }

  const testRuns = Array.from(eventsByRun, ([testRunId, runEvents]) => ({
    testRunId,
    firstEvent: runEvents[runEvents.length - 1].occurredAt,
    lastEvent: runEvents[0].occurredAt,
    agentClasses: BOT_CLASSIFICATIONS.filter((agentClass) =>
      runEvents.some((event) => event.agentClass === agentClass),
    ),
    variantsTouched: VARIANTS.filter((variant) =>
      runEvents.some((event) => event.variant === variant),
    ),
    eventCount: runEvents.length,
    jsonDiscovery: runEvents.some(
      (event) => event.eventType === "json_endpoint_fetch",
    ),
    wellKnownDiscovery: runEvents.some(
      (event) => event.eventType === "well_known_fetch",
    ),
    outboundAction: runEvents.some(
      (event) => event.eventType === "outbound_action",
    ),
  }))
    .sort((a, b) => b.lastEvent.localeCompare(a.lastEvent))
    .slice(0, 50);

  return {
    summary: {
      totalRequests: filtered.length,
      aiBotRequests: filtered.filter((event) => isAiOrBot(event.agentClass)).length,
      pageFetches: funnel.pageFetches,
      jsonEndpointFetches: funnel.jsonEndpointFetches,
      wellKnownFetches: funnel.wellKnownFetches,
      outboundActions: funnel.outboundActions,
      uniqueAgentClasses: distinctAgents.size,
      controlledTestRuns: distinctRuns.size,
    },
    matrix: matrix.rows,
    matrixColumnTotals: matrix.columnTotals,
    funnel,
    variantBreakdown,
    agentBreakdown,
    recentEvents: filtered.slice(0, 100),
    testRuns,
  };
}
