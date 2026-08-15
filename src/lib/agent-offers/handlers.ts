import {
  CANARY_IDS,
  createDiscoveryDocument,
  createOfferDocument,
  parseVariant,
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

function htmlResponse(
  body: string,
  options: { status?: number; noIndex?: boolean } = {},
): Response {
  const headers = new Headers({
    "Cache-Control": NO_STORE,
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });

  if (options.noIndex) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

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
  await recordTelemetry(request, {
    eventType: "page_fetch",
    variant: null,
    canaryId: null,
  });

  return htmlResponse(renderLandingPage(requestOrigin(request)));
}

export async function handleVariantPage(
  request: Request,
  rawVariant: string,
): Promise<Response> {
  const variant = parseVariant(rawVariant);

  if (!variant) {
    return htmlResponse(renderNotFoundPage(requestOrigin(request)), {
      status: 404,
      noIndex: true,
    });
  }

  await recordTelemetry(request, {
    eventType: "page_fetch",
    variant,
    canaryId: CANARY_IDS[variant],
  });

  return htmlResponse(renderVariantPage(variant, requestOrigin(request)));
}

export async function handleOfferJson(
  request: Request,
  rawVariant: string,
): Promise<Response> {
  const variant = parseVariant(rawVariant);

  if (variant !== "D" && variant !== "E") {
    return jsonResponse({ error: "Offer representation not found." }, 404);
  }

  await recordTelemetry(request, {
    eventType: "json_endpoint_fetch",
    variant,
    canaryId: CANARY_IDS[variant],
  });

  return jsonResponse(createOfferDocument(variant));
}

export async function handleDiscoveryDocument(
  request: Request,
): Promise<Response> {
  await recordTelemetry(request, {
    eventType: "well_known_fetch",
    variant: "E",
    canaryId: CANARY_IDS.E,
  });

  return jsonResponse(createDiscoveryDocument());
}

export async function handleOutboundAction(
  request: Request,
  rawVariant: string,
): Promise<Response> {
  const variant = parseVariant(rawVariant);

  if (!variant) {
    return htmlResponse(renderNotFoundPage(requestOrigin(request)), {
      status: 404,
      noIndex: true,
    });
  }

  await recordTelemetry(request, {
    eventType: "outbound_action",
    variant,
    canaryId: CANARY_IDS[variant],
  });

  return htmlResponse(
    renderOutboundConfirmation(variant, requestOrigin(request)),
    { noIndex: true },
  );
}
