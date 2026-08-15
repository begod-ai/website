import {
  CANARY_IDS,
  createSponsoredOfferDocument,
  offerEndpointPath,
  parseOfferVariant,
  parseVariant,
  resolveSlotContext,
  sanitizeTestRunId,
  withTestRun,
} from "./offer";
import {
  renderLandingPage,
  renderNotFoundPage,
  renderOutboundConfirmation,
  renderVariantPage,
} from "./render";
import { recordTelemetry } from "./telemetry";

const NO_STORE = "private, no-store, max-age=0, must-revalidate";

function requestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

function requestTestRunId(request: Request): string | null {
  return sanitizeTestRunId(new URL(request.url).searchParams.get("run"));
}

function htmlResponse(
  body: string,
  options: { status?: number; noIndex?: boolean; linkHeader?: string } = {},
): Response {
  const headers = new Headers({
    "Cache-Control": NO_STORE,
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  if (options.noIndex) headers.set("X-Robots-Tag", "noindex, nofollow");
  if (options.linkHeader) headers.set("Link", options.linkHeader);
  return new Response(body, { status: options.status ?? 200, headers });
}

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": NO_STORE,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function handleLandingPage(request: Request): Promise<Response> {
  await recordTelemetry(request, { eventType: "landing_fetch", variant: null, canaryId: null });
  return htmlResponse(renderLandingPage(requestOrigin(request), requestTestRunId(request)));
}

export async function handleVariantPage(request: Request, rawVariant: string): Promise<Response> {
  const variant = parseVariant(rawVariant);
  if (!variant) {
    return htmlResponse(renderNotFoundPage(requestOrigin(request)), { status: 404, noIndex: true });
  }

  await recordTelemetry(request, {
    eventType: "page_fetch",
    variant,
    canaryId: CANARY_IDS[variant],
  });

  const testRunId = requestTestRunId(request);
  const linkHeader = variant === "E"
    ? `<${withTestRun(offerEndpointPath("E"), testRunId)}>; rel="agent-offers"; type="application/json"`
    : undefined;
  return htmlResponse(renderVariantPage(variant, requestOrigin(request), testRunId), { linkHeader });
}

export async function handleOfferEndpoint(request: Request, rawSlot: string): Promise<Response> {
  const context = resolveSlotContext(rawSlot);
  if (!context) return jsonResponse({ error: "Offer slot not found." }, 404);

  await recordTelemetry(request, {
    eventType: "offer_endpoint_fetch",
    variant: context.variant,
    canaryId: CANARY_IDS[context.variant],
  });

  return jsonResponse(createSponsoredOfferDocument(context.variant, requestTestRunId(request)));
}

export async function handleOutboundAction(request: Request, rawVariant: string): Promise<Response> {
  const variant = parseOfferVariant(rawVariant);
  if (!variant) {
    return htmlResponse(renderNotFoundPage(requestOrigin(request)), { status: 404, noIndex: true });
  }

  await recordTelemetry(request, {
    eventType: "outbound_action",
    variant,
    canaryId: CANARY_IDS[variant],
  });
  return htmlResponse(
    renderOutboundConfirmation(variant, requestOrigin(request), requestTestRunId(request)),
    { noIndex: true },
  );
}
