export const EXPERIMENT_ID = "begod-invisible-agent-ads";
export const EXPERIMENT_SCHEMA_VERSION = "0.1-experimental";

export const VARIANTS = ["A", "B", "C", "D", "E"] as const;
export type ExperimentVariant = (typeof VARIANTS)[number];
export type OfferVariant = Exclude<ExperimentVariant, "A">;
export type DynamicOfferVariant = Extract<ExperimentVariant, "C" | "D" | "E">;

export const DYNAMIC_OFFER_VARIANTS: readonly DynamicOfferVariant[] = ["C", "D", "E"];
export const TEST_RUN_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export const CANARY_IDS: Record<ExperimentVariant, string | null> = {
  A: null,
  B: "AGENTAD-B-7F3K9",
  C: "AGENTAD-C-2M8Q4",
  D: "AGENTAD-D-5R1X7",
  E: "AGENTAD-E-9P6N2",
};

export const SYNTHETIC_OFFER = {
  productName: "Aster 65W USB-C GaN Charger",
  description: "A compact synthetic 65W USB-C GaN travel charger.",
  merchantName: "Example Electronics",
  price: 34.9,
  currency: "EUR",
  availability: "in_stock",
  shippingDestination: "Ireland",
} as const;

export const PUBLISHER_CONTEXT = {
  publisherId: "pub_begod_lab",
  pageId: "travel_charger",
  category: "usb_c_chargers",
} as const;

export interface SlotContext {
  variant: DynamicOfferVariant;
  slotPath: string;
  slotId: string;
  publisherId: string;
  pageId: string;
  category: string;
}

const SLOT_CONTEXTS: Record<DynamicOfferVariant, SlotContext> = {
  C: { variant: "C", slotPath: "charger-c", slotId: "charger_c", ...PUBLISHER_CONTEXT },
  D: { variant: "D", slotPath: "charger-d", slotId: "charger_d", ...PUBLISHER_CONTEXT },
  E: { variant: "E", slotPath: "charger-e", slotId: "charger_e", ...PUBLISHER_CONTEXT },
};

export function parseVariant(value: string): ExperimentVariant | null {
  const normalized = value.toUpperCase();
  return VARIANTS.find((variant) => variant === normalized) ?? null;
}

export function parseOfferVariant(value: string): OfferVariant | null {
  const variant = parseVariant(value);
  return variant && variant !== "A" ? variant : null;
}

export function resolveSlotContext(slotPath: string): SlotContext | null {
  return DYNAMIC_OFFER_VARIANTS.map((variant) => SLOT_CONTEXTS[variant]).find(
    (context) => context.slotPath === slotPath,
  ) ?? null;
}

export function slotContextForVariant(variant: DynamicOfferVariant): SlotContext {
  return SLOT_CONTEXTS[variant];
}

export function sanitizeTestRunId(value: string | null): string | null {
  return value && TEST_RUN_ID_PATTERN.test(value) ? value : null;
}

export function withTestRun(path: string, testRunId: string | null): string {
  if (!testRunId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}run=${encodeURIComponent(testRunId)}`;
}

export function variantPath(variant: ExperimentVariant): string {
  return `/lab/agent-offers/${variant.toLowerCase()}`;
}

export function outboundPath(variant: OfferVariant): string {
  return `/lab/agent-offers/out/${variant.toLowerCase()}`;
}

export function offerEndpointPath(variant: DynamicOfferVariant): string {
  return `/api/agent-offers/serve/${SLOT_CONTEXTS[variant].slotPath}`;
}

/** Intentionally replaceable selection boundary for future network inventory. */
export function selectOffer(context: SlotContext) {
  return {
    canaryId: CANARY_IDS[context.variant] as string,
    merchant: { name: SYNTHETIC_OFFER.merchantName },
    product: { name: SYNTHETIC_OFFER.productName, description: SYNTHETIC_OFFER.description },
    price: { amount: SYNTHETIC_OFFER.price, currency: SYNTHETIC_OFFER.currency },
    availability: SYNTHETIC_OFFER.availability,
    shipping: { destination: SYNTHETIC_OFFER.shippingDestination },
  };
}

export function createSponsoredOfferDocument(
  variant: OfferVariant,
  testRunId: string | null = null,
) {
  const baseContext = {
    publisherId: PUBLISHER_CONTEXT.publisherId,
    pageId: PUBLISHER_CONTEXT.pageId,
    category: PUBLISHER_CONTEXT.category,
  };
  const context = variant === "B"
    ? { ...baseContext, slotId: "charger_b" }
    : slotContextForVariant(variant);
  const selected = variant === "B"
    ? {
        canaryId: CANARY_IDS.B as string,
        merchant: { name: SYNTHETIC_OFFER.merchantName },
        product: { name: SYNTHETIC_OFFER.productName, description: SYNTHETIC_OFFER.description },
        price: { amount: SYNTHETIC_OFFER.price, currency: SYNTHETIC_OFFER.currency },
        availability: SYNTHETIC_OFFER.availability,
        shipping: { destination: SYNTHETIC_OFFER.shippingDestination },
      }
    : selectOffer(slotContextForVariant(variant));

  return {
    version: EXPERIMENT_SCHEMA_VERSION,
    type: "sponsored_offer",
    sponsored: true,
    synthetic: true,
    disclosure: "Synthetic sponsored research data. No real product is sold and no purchase occurs.",
    publisher: { id: context.publisherId },
    context: { page_id: context.pageId, slot_id: context.slotId, category: context.category },
    offer: {
      canary_id: selected.canaryId,
      merchant: selected.merchant,
      product: selected.product,
      price: selected.price,
      availability: selected.availability,
      shipping: selected.shipping,
      action: withTestRun(outboundPath(variant), testRunId),
    },
  };
}

export function createAgentAdManifest(
  variant: Extract<ExperimentVariant, "D" | "E">,
  testRunId: string | null = null,
) {
  const context = slotContextForVariant(variant);
  return {
    version: EXPERIMENT_SCHEMA_VERSION,
    type: "agent_ad_manifest",
    experimental: true,
    publisher_id: context.publisherId,
    page_id: context.pageId,
    slot_id: context.slotId,
    offers_endpoint: withTestRun(offerEndpointPath(variant), testRunId),
  };
}
