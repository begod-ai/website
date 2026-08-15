import { BOT_CLASSIFICATIONS, parseBotClassification, type BotClassification } from "./bot-classifier";
import { sanitizeTestRunId, VARIANTS, type DynamicOfferVariant, type ExperimentVariant } from "./offer";
import {
  AGENT_OFFER_EVENT_TYPES,
  type AgentOfferTelemetryEventType,
} from "./telemetry";

export const DASHBOARD_RANGES = ["1h", "24h", "7d", "30d", "all"] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];
const RANGE_MILLISECONDS = { "1h": 3_600_000, "24h": 86_400_000, "7d": 604_800_000, "30d": 2_592_000_000 } as const;

export interface DashboardFilters {
  range: DashboardRange;
  startAt: string | null;
  agent: BotClassification | null;
  variant: ExperimentVariant | null;
  eventType: AgentOfferTelemetryEventType | null;
  testRunId: string | null;
}

export interface StoredAgentOfferEvent {
  id: string;
  occurredAt: string;
  eventType: AgentOfferTelemetryEventType;
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
  pageFetches: number;
  aiBotPageFetches: number;
  offerEndpointFetches: number;
  outboundActions: number;
  uniqueAgentClasses: number;
  controlledTestRuns: number;
}

export interface AgentVariantMatrixRow {
  agentClass: BotClassification;
  counts: Record<ExperimentVariant, number>;
  total: number;
}

export interface EndpointDiscoveryMatrixRow {
  agentClass: BotClassification;
  counts: Record<DynamicOfferVariant, number>;
  total: number;
}

export interface DashboardFunnel {
  pageFetches: number;
  offerEndpointFetches: number;
  outboundActions: number;
}

export const VARIANT_MECHANISMS: Record<ExperimentVariant, string> = {
  A: "Control",
  B: "Inline full offer",
  C: "<link> → dynamic endpoint",
  D: "Manifest → dynamic endpoint",
  E: "Combined discovery → dynamic endpoint",
};

export interface VariantBreakdownRow {
  variant: ExperimentVariant;
  mechanism: string;
  pageFetches: number;
  aiBotFetches: number;
  offerEndpointFetches: number | null;
  outboundActions: number;
}

export interface AgentBreakdownRow {
  agentClass: BotClassification;
  totalEvents: number;
  pageFetches: number;
  variantsFetched: ExperimentVariant[];
  offerEndpointFetches: number;
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
  endpointDiscovery: boolean;
  outboundAction: boolean;
}

export interface DashboardData {
  summary: DashboardSummary;
  matrix: AgentVariantMatrixRow[];
  matrixColumnTotals: Record<ExperimentVariant, number>;
  endpointMatrix: EndpointDiscoveryMatrixRow[];
  endpointMatrixColumnTotals: Record<DynamicOfferVariant, number>;
  funnel: DashboardFunnel;
  variantBreakdown: VariantBreakdownRow[];
  agentBreakdown: AgentBreakdownRow[];
  recentEvents: StoredAgentOfferEvent[];
  testRuns: TestRunBreakdownRow[];
}

export function parseDashboardFilters(searchParams: URLSearchParams, now = new Date()): DashboardFilters {
  const requestedRange = searchParams.get("range");
  const range = DASHBOARD_RANGES.find((candidate) => candidate === requestedRange) ?? "24h";
  const requestedVariant = searchParams.get("variant")?.toUpperCase() ?? null;
  const variant = VARIANTS.find((candidate) => candidate === requestedVariant) ?? null;
  const requestedEvent = searchParams.get("event");
  const eventType = AGENT_OFFER_EVENT_TYPES.find((candidate) => candidate === requestedEvent) ?? null;
  return {
    range,
    startAt: range === "all" ? null : new Date(now.getTime() - RANGE_MILLISECONDS[range]).toISOString(),
    agent: parseBotClassification(searchParams.get("agent")),
    variant,
    eventType,
    testRunId: sanitizeTestRunId(searchParams.get("run")),
  };
}

export function isAiOrBot(agentClass: BotClassification): boolean {
  return agentClass !== "normal_browser" && agentClass !== "unknown";
}

function matches(event: StoredAgentOfferEvent, filters: DashboardFilters): boolean {
  return !(filters.startAt && event.occurredAt < filters.startAt)
    && !(filters.agent && event.agentClass !== filters.agent)
    && !(filters.variant && event.variant !== filters.variant)
    && !(filters.eventType && event.eventType !== filters.eventType)
    && !(filters.testRunId && event.testRunId !== filters.testRunId);
}

export function buildAgentVariantMatrix(events: readonly StoredAgentOfferEvent[]) {
  const byAgent = new Map<BotClassification, Record<ExperimentVariant, number>>();
  const columnTotals: Record<ExperimentVariant, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const event of events) {
    if (event.eventType !== "page_fetch" || !event.variant) continue;
    const counts = byAgent.get(event.agentClass) ?? { A: 0, B: 0, C: 0, D: 0, E: 0 };
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

export function buildEndpointDiscoveryMatrix(events: readonly StoredAgentOfferEvent[]) {
  const byAgent = new Map<BotClassification, Record<DynamicOfferVariant, number>>();
  const columnTotals: Record<DynamicOfferVariant, number> = { C: 0, D: 0, E: 0 };
  for (const event of events) {
    if (event.eventType !== "offer_endpoint_fetch" || !event.variant || event.variant === "A" || event.variant === "B") continue;
    const counts = byAgent.get(event.agentClass) ?? { C: 0, D: 0, E: 0 };
    counts[event.variant] += 1;
    columnTotals[event.variant] += 1;
    byAgent.set(event.agentClass, counts);
  }
  const rows = Array.from(byAgent, ([agentClass, counts]) => ({ agentClass, counts, total: counts.C + counts.D + counts.E }))
    .sort((a, b) => b.total - a.total || a.agentClass.localeCompare(b.agentClass));
  return { rows, columnTotals };
}

export function calculateFunnel(events: readonly StoredAgentOfferEvent[]): DashboardFunnel {
  return {
    pageFetches: events.filter((event) => event.eventType === "page_fetch").length,
    offerEndpointFetches: events.filter((event) => event.eventType === "offer_endpoint_fetch").length,
    outboundActions: events.filter((event) => event.eventType === "outbound_action").length,
  };
}

export function aggregateDashboardEvents(events: readonly StoredAgentOfferEvent[], filters: DashboardFilters): DashboardData {
  const filtered = events.filter((event) => matches(event, filters)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const funnel = calculateFunnel(filtered);
  const matrix = buildAgentVariantMatrix(filtered);
  const endpointMatrix = buildEndpointDiscoveryMatrix(filtered);
  const variantBreakdown = VARIANTS.map((variant) => {
    const subset = filtered.filter((event) => event.variant === variant);
    return {
      variant,
      mechanism: VARIANT_MECHANISMS[variant],
      pageFetches: subset.filter((event) => event.eventType === "page_fetch").length,
      aiBotFetches: subset.filter((event) => event.eventType === "page_fetch" && isAiOrBot(event.agentClass)).length,
      offerEndpointFetches: variant === "A" || variant === "B" ? null : subset.filter((event) => event.eventType === "offer_endpoint_fetch").length,
      outboundActions: subset.filter((event) => event.eventType === "outbound_action").length,
    };
  });

  const agentBreakdown = BOT_CLASSIFICATIONS.flatMap((agentClass) => {
    const subset = filtered.filter((event) => event.agentClass === agentClass);
    if (!subset.length) return [];
    return [{
      agentClass,
      totalEvents: subset.length,
      pageFetches: subset.filter((event) => event.eventType === "page_fetch").length,
      variantsFetched: VARIANTS.filter((variant) => subset.some((event) => event.eventType === "page_fetch" && event.variant === variant)),
      offerEndpointFetches: subset.filter((event) => event.eventType === "offer_endpoint_fetch").length,
      outboundActions: subset.filter((event) => event.eventType === "outbound_action").length,
      mostRecentRequest: subset[0].occurredAt,
    }];
  }).sort((a, b) => b.totalEvents - a.totalEvents || a.agentClass.localeCompare(b.agentClass));

  const byRun = new Map<string, StoredAgentOfferEvent[]>();
  for (const event of filtered) {
    if (!event.testRunId) continue;
    byRun.set(event.testRunId, [...(byRun.get(event.testRunId) ?? []), event]);
  }
  const testRuns = Array.from(byRun, ([testRunId, runEvents]) => ({
    testRunId,
    firstEvent: runEvents[runEvents.length - 1].occurredAt,
    lastEvent: runEvents[0].occurredAt,
    agentClasses: BOT_CLASSIFICATIONS.filter((agentClass) => runEvents.some((event) => event.agentClass === agentClass)),
    variantsTouched: VARIANTS.filter((variant) => runEvents.some((event) => event.variant === variant)),
    eventCount: runEvents.length,
    endpointDiscovery: runEvents.some((event) => event.eventType === "offer_endpoint_fetch"),
    outboundAction: runEvents.some((event) => event.eventType === "outbound_action"),
  })).sort((a, b) => b.lastEvent.localeCompare(a.lastEvent)).slice(0, 50);

  const pageEvents = filtered.filter((event) => event.eventType === "page_fetch");
  return {
    summary: {
      totalRequests: filtered.length,
      pageFetches: pageEvents.length,
      aiBotPageFetches: pageEvents.filter((event) => isAiOrBot(event.agentClass)).length,
      offerEndpointFetches: funnel.offerEndpointFetches,
      outboundActions: funnel.outboundActions,
      uniqueAgentClasses: new Set(filtered.map((event) => event.agentClass)).size,
      controlledTestRuns: new Set(filtered.flatMap((event) => event.testRunId ? [event.testRunId] : [])).size,
    },
    matrix: matrix.rows,
    matrixColumnTotals: matrix.columnTotals,
    endpointMatrix: endpointMatrix.rows,
    endpointMatrixColumnTotals: endpointMatrix.columnTotals,
    funnel,
    variantBreakdown,
    agentBreakdown,
    recentEvents: filtered.slice(0, 100),
    testRuns,
  };
}
