import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { GET as getDiscovery } from "../src/app/.well-known/agent-offers.json/route";
import { GET as getOfferJson } from "../src/app/api/agent-offers/[variant]/route";
import { GET as getVariant } from "../src/app/lab/agent-offers/[variant]/route";
import { GET as getOutbound } from "../src/app/lab/agent-offers/out/[variant]/route";
import { GET as getLanding } from "../src/app/lab/agent-offers/route";
import { classifyUserAgent } from "../src/lib/agent-offers/bot-classifier";
import {
  CANARY_IDS,
  SYNTHETIC_OFFER,
  VARIANTS,
  type ExperimentVariant,
} from "../src/lib/agent-offers/offer";
import {
  createTelemetryEvent,
  resetTelemetrySink,
  setTelemetrySink,
  type TelemetryEvent,
} from "../src/lib/agent-offers/telemetry";

const capturedEvents: TelemetryEvent[] = [];

before(() => {
  setTelemetrySink({
    write(event) {
      capturedEvents.push(event);
    },
  });
});

after(() => {
  resetTelemetrySink();
});

function request(path: string, headers?: HeadersInit): Request {
  return new Request(`https://begod.ai${path}`, { headers });
}

function context(variant: string) {
  return { params: Promise.resolve({ variant }) };
}

async function variantHtml(variant: ExperimentVariant): Promise<string> {
  const response = await getVariant(
    request(`/lab/agent-offers/${variant.toLowerCase()}`),
    context(variant.toLowerCase()),
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html/);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  return response.text();
}

test("landing page links to every controlled variant", async () => {
  const response = await getLanding(request("/lab/agent-offers"));
  const html = await response.text();

  assert.equal(response.status, 200);
  for (const variant of VARIANTS) {
    assert.match(html, new RegExp(`/lab/agent-offers/${variant.toLowerCase()}`));
  }
  assert.match(html, /synthetic test data used for an AI-agent research experiment/i);
});

test("all five variant routes return their stable canary and shared offer", async () => {
  for (const variant of VARIANTS) {
    const html = await variantHtml(variant);
    assert.match(html, new RegExp(CANARY_IDS[variant]));
    assert.match(html, new RegExp(SYNTHETIC_OFFER.productName));
    assert.match(html, new RegExp(SYNTHETIC_OFFER.merchantName));
    assert.match(html, /€34\.90/);
    assert.match(html, /Sponsored test offer/);
    assert.match(html, /No real product is being sold/);
  }
});

test("Variant A contains plain visible HTML without structured discovery", async () => {
  const html = await variantHtml("A");

  assert.match(html, /<h2>Aster 65W USB-C GaN Charger<\/h2>/);
  assert.doesNotMatch(
    html,
    /application\/ld\+json|rel="agent-offers"|\/api\/agent-offers/i,
  );
  assert.doesNotMatch(html, /<main|<article|<dl/i);
});

test("Variant B uses semantic accessible HTML without JSON-LD", async () => {
  const html = await variantHtml("B");

  assert.match(html, /<main/);
  assert.match(html, /<article[^>]+aria-labelledby="offer-heading"/);
  assert.match(html, /<section[^>]+aria-labelledby=/);
  assert.match(html, /<dl/);
  assert.doesNotMatch(html, /application\/ld\+json|rel="agent-offers"/i);
});

test("Variant C contains parseable Schema.org data matching visible content", async () => {
  const html = await variantHtml("C");
  const match = html.match(
    /<script type="application\/ld\+json">([^<]+)<\/script>/,
  );

  assert.ok(match);
  const structuredData = JSON.parse(match[1]);
  assert.equal(structuredData["@context"], "https://schema.org");
  assert.equal(structuredData["@type"], "Product");
  assert.equal(structuredData.name, SYNTHETIC_OFFER.productName);
  assert.equal(structuredData.identifier, CANARY_IDS.C);
  assert.equal(structuredData.offers["@type"], "Offer");
  assert.equal(structuredData.offers.price, "34.90");
  assert.equal(structuredData.offers.priceCurrency, "EUR");
  assert.equal(structuredData.offers.seller.name, SYNTHETIC_OFFER.merchantName);
});

test("Variant D links to JSON without the experimental relationship", async () => {
  const html = await variantHtml("D");

  assert.match(
    html,
    /<a[^>]+href="\/api\/agent-offers\/d"[^>]+type="application\/json"/,
  );
  assert.doesNotMatch(html, /rel="agent-offers"/);
});

test("Variant E advertises experimental agent-offer discovery", async () => {
  const html = await variantHtml("E");

  assert.match(
    html,
    /<link rel="agent-offers" type="application\/json" href="\/api\/agent-offers\/e">/,
  );
  assert.match(html, /not an established web standard/i);
});

test("D and E API endpoints return the correct JSON content type and offer", async () => {
  for (const variant of ["D", "E"] as const) {
    const response = await getOfferJson(
      request(`/api/agent-offers/${variant.toLowerCase()}`),
      context(variant.toLowerCase()),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.match(
      response.headers.get("content-type") ?? "",
      /^application\/json/,
    );
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
    assert.equal(body.variant, variant);
    assert.equal(body.canary_id, CANARY_IDS[variant]);
    assert.equal(body.synthetic, true);
    assert.equal(body.sponsored, true);
    assert.equal(body.destination, `/lab/agent-offers/out/${variant.toLowerCase()}`);
  }

  const missing = await getOfferJson(
    request("/api/agent-offers/c"),
    context("c"),
  );
  assert.equal(missing.status, 404);
});

test("the well-known endpoint returns valid experimental discovery JSON", async () => {
  const response = await getDiscovery(
    request("/.well-known/agent-offers.json"),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
  assert.equal(body.experimental, true);
  assert.match(body.description, /not an established web standard/i);
  assert.deepEqual(body.offers, [
    {
      context: "/lab/agent-offers/e",
      href: "/api/agent-offers/e",
      type: "application/json",
    },
  ]);
});

test("outbound actions render a safe confirmation and record telemetry", async () => {
  const eventCount = capturedEvents.length;
  const response = await getOutbound(
    request("/lab/agent-offers/out/a", {
      "user-agent": "OAI-SearchBot/1.0",
      referer: "https://begod.ai/lab/agent-offers/a",
    }),
    context("a"),
  );
  const html = await response.text();
  const event = capturedEvents[eventCount];

  assert.equal(response.status, 200);
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.match(html, /Test offer selected\./);
  assert.match(html, /No purchase has taken place\./);
  assert.equal(event.event_type, "outbound_action");
  assert.equal(event.experiment_variant, "A");
  assert.equal(event.canary_id, CANARY_IDS.A);
  assert.equal(event.bot_classification, "openai_searchbot");
});

test("telemetry bounds untrusted input, excludes IPs, and drops sensitive query keys", () => {
  const event = createTelemetryEvent(
    request("/lab/agent-offers/a?run_id=trial-7&token=do-not-store", {
      "user-agent": "Perplexity-User/1.0",
      accept: "text/html",
    }),
    { eventType: "page_fetch", variant: "A", canaryId: CANARY_IDS.A },
  );

  assert.deepEqual(event.query_parameters, { run_id: "trial-7" });
  assert.equal(event.bot_classification, "perplexity_user_fetcher");
  assert.equal("ip" in event, false);
  assert.equal("headers" in event, false);
});

test("agent classifier keeps named crawlers separate from generic bots and browsers", () => {
  assert.equal(classifyUserAgent("ChatGPT-User/2.0"), "chatgpt_user_fetcher");
  assert.equal(classifyUserAgent("PerplexityBot/1.0"), "perplexity_bot");
  assert.equal(classifyUserAgent("Googlebot/2.1"), "googlebot");
  assert.equal(classifyUserAgent("ClaudeBot/1.0"), "anthropic_claude_crawler");
  assert.equal(classifyUserAgent("ExampleCrawler bot"), "generic_bot");
  assert.equal(
    classifyUserAgent("Mozilla/5.0 AppleWebKit/537.36 Chrome/140.0 Safari/537.36"),
    "normal_browser",
  );
  assert.equal(classifyUserAgent("custom-client/1.0"), "unknown");
});
