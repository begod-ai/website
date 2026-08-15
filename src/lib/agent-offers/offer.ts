export const EXPERIMENT_ID = "begod-agent-offers";
export const EXPERIMENT_SCHEMA_VERSION = "0.1-experimental";

export const VARIANTS = ["A", "B", "C", "D", "E"] as const;

export type ExperimentVariant = (typeof VARIANTS)[number];

export const CANARY_IDS: Record<ExperimentVariant, string> = {
  A: "AGENTLAB-A-7F3K9",
  B: "AGENTLAB-B-2M8Q4",
  C: "AGENTLAB-C-5R1X7",
  D: "AGENTLAB-D-9P6N2",
  E: "AGENTLAB-E-4T8W5",
};

export const SYNTHETIC_OFFER = {
  productName: "Aster 65W USB-C GaN Charger",
  description: "A compact 65W USB-C wall charger with dual ports.",
  merchantName: "Example Electronics",
  price: 34.9,
  priceDisplay: "€34.90",
  currency: "EUR",
  availability: "In stock",
  availabilityCode: "in_stock",
  shipping: "Delivery to Ireland available",
  shippingDestination: "Ireland",
  sponsorship: "Sponsored test offer",
  disclosure:
    "This is synthetic test data used for an AI-agent research experiment. No real product is being sold.",
} as const;

export function parseVariant(value: string): ExperimentVariant | null {
  const normalized = value.toUpperCase();
  return VARIANTS.find((variant) => variant === normalized) ?? null;
}

export function variantPath(variant: ExperimentVariant): string {
  return `/lab/agent-offers/${variant.toLowerCase()}`;
}

export function outboundPath(variant: ExperimentVariant): string {
  return `/lab/agent-offers/out/${variant.toLowerCase()}`;
}

export function jsonEndpointPath(variant: "D" | "E"): string {
  return `/api/agent-offers/${variant.toLowerCase()}`;
}

export function createOfferDocument(variant: "D" | "E") {
  return {
    schema_version: EXPERIMENT_SCHEMA_VERSION,
    type: "sponsored_offer",
    experiment: EXPERIMENT_ID,
    variant,
    canary_id: CANARY_IDS[variant],
    sponsored: true,
    synthetic: true,
    disclosure: SYNTHETIC_OFFER.disclosure,
    product: {
      name: SYNTHETIC_OFFER.productName,
      description: SYNTHETIC_OFFER.description,
    },
    merchant: {
      name: SYNTHETIC_OFFER.merchantName,
    },
    offer: {
      price: SYNTHETIC_OFFER.price,
      currency: SYNTHETIC_OFFER.currency,
      availability: SYNTHETIC_OFFER.availabilityCode,
      shipping_destination: SYNTHETIC_OFFER.shippingDestination,
    },
    destination: outboundPath(variant),
  };
}

export function createDiscoveryDocument() {
  return {
    schema_version: EXPERIMENT_SCHEMA_VERSION,
    experimental: true,
    description:
      "Experimental discovery document for machine-readable sponsored offers. The agent-offers relationship is not an established web standard.",
    experiment: "/lab/agent-offers",
    offers: [
      {
        context: variantPath("E"),
        href: jsonEndpointPath("E"),
        type: "application/json",
      },
    ],
  };
}
