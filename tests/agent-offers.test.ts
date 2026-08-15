import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { after, before, test } from "node:test";
import { GET as getOffer } from "../src/app/api/agent-offers/serve/[slot]/route";
import { GET as getVariant } from "../src/app/lab/agent-offers/[variant]/route";
import { GET as getOutbound } from "../src/app/lab/agent-offers/out/[variant]/route";
import { GET as getLanding } from "../src/app/lab/agent-offers/route";
import { classifyUserAgent } from "../src/lib/agent-offers/bot-classifier";
import { CANARY_IDS, SYNTHETIC_OFFER, VARIANTS, type ExperimentVariant } from "../src/lib/agent-offers/offer";
import { createTelemetryEvent, resetTelemetrySink, setTelemetrySink, type TelemetryEvent } from "../src/lib/agent-offers/telemetry";

const capturedEvents: TelemetryEvent[] = [];
before(() => setTelemetrySink({ write(event) { capturedEvents.push(event); } }));
after(() => resetTelemetrySink());

function request(path: string, headers?: HeadersInit): Request {
  return new Request(`https://begod.ai${path}`, { headers });
}
function variantContext(variant: string) { return { params: Promise.resolve({ variant }) }; }
function slotContext(slot: string) { return { params: Promise.resolve({ slot }) }; }

async function variantResponse(variant: ExperimentVariant, suffix = "", headers?: HeadersInit) {
  return getVariant(request(`/lab/agent-offers/${variant.toLowerCase()}${suffix}`, headers), variantContext(variant.toLowerCase()));
}

function bodyOf(html: string): string {
  return html.match(/<body>\s*([\s\S]*?)\s*<\/body>/)?.[1] ?? "";
}

function scriptJson<T>(html: string, mime: string): T {
  const escapedMime = mime.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<script type="${escapedMime}"[^>]*>([^<]+)<\\/script>`));
  assert.ok(match, `Expected ${mime} script payload`);
  return JSON.parse(match[1]) as T;
}

test("landing explains and links all controlled variants", async () => {
  const response = await getLanding(request("/lab/agent-offers"));
  const html = await response.text();
  assert.equal(response.status, 200);
  for (const variant of VARIANTS) assert.match(html, new RegExp(`/lab/agent-offers/${variant.toLowerCase()}`));
  assert.match(html, /same neutral travel-charger article/i);
});

test("A-E share exactly the same human-visible article body", async () => {
  const bodies: string[] = [];
  for (const variant of VARIANTS) {
    const response = await variantResponse(variant);
    assert.equal(response.status, 200);
    bodies.push(bodyOf(await response.text()));
  }
  for (const body of bodies.slice(1)) assert.equal(body, bodies[0]);
  const visibleText = bodies[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = visibleText.split(" ").length;
  assert.ok(wordCount >= 500 && wordCount <= 800, `article word count ${wordCount}`);
  assert.match(visibleText, /Choosing a USB-C Charger for Travel/);
  assert.doesNotMatch(visibleText, /\bAster\b|Example Electronics|€34\.90|\bsponsored\b|Agent Offers|\badvertis(?:e|ing|ement)\w*\b|AGENTAD-/i);
});

test("crawler classification never changes a variant document", async () => {
  const browser = await variantResponse("E", "", { "user-agent": "Mozilla/5.0 Chrome/140" });
  const crawler = await variantResponse("E", "", { "user-agent": "OAI-SearchBot/1.0" });
  assert.equal(await browser.text(), await crawler.text());
  assert.equal(browser.headers.get("link"), crawler.headers.get("link"));
});

test("A is a true client-side commercial control", async () => {
  const response = await variantResponse("A");
  const html = await response.text();
  assert.equal(response.headers.get("link"), null);
  assert.doesNotMatch(html, /application\/agent-|rel="agent-offers"|\/api\/agent-offers\/serve|AGENTAD-|Aster 65W|Example Electronics|34\.90/);
});

test("B embeds one complete non-rendering sponsored offer and no endpoint pointer", async () => {
  const response = await variantResponse("B", "?run=inline-001");
  const html = await response.text();
  const payload = scriptJson<{
    sponsored: boolean;
    synthetic: boolean;
    offer: {
      canary_id: string;
      product: { name: string };
      price: { amount: number };
      action: string;
    };
  }>(html, "application/agent-offer+json");
  assert.equal(payload.sponsored, true);
  assert.equal(payload.synthetic, true);
  assert.equal(payload.offer.canary_id, CANARY_IDS.B);
  assert.equal(payload.offer.product.name, SYNTHETIC_OFFER.productName);
  assert.equal(payload.offer.price.amount, 34.9);
  assert.equal(payload.offer.action, "/lab/agent-offers/out/b?run=inline-001");
  assert.doesNotMatch(html, /rel="agent-offers"|application\/agent-ad-manifest|\/api\/agent-offers\/serve/);
  assert.equal(response.headers.get("link"), null);
});

test("C exposes only a link to its dynamic offer", async () => {
  const response = await variantResponse("C", "?run=chatgpt-c-001");
  const html = await response.text();
  assert.match(html, /<link rel="agent-offers" type="application\/json" href="\/api\/agent-offers\/serve\/charger-c\?run=chatgpt-c-001">/);
  assert.doesNotMatch(html, /application\/agent-offer\+json|application\/agent-ad-manifest|AGENTAD-C-2M8Q4|Aster 65W/);
  assert.equal(response.headers.get("link"), null);
});

test("D exposes a small manifest without the commercial offer", async () => {
  const html = await (await variantResponse("D", "?run=claude-d-001")).text();
  const manifest = scriptJson<{
    publisher_id: string;
    page_id: string;
    slot_id: string;
    offers_endpoint: string;
  }>(html, "application/agent-ad-manifest+json");
  assert.equal(manifest.publisher_id, "pub_begod_lab");
  assert.equal(manifest.page_id, "travel_charger");
  assert.equal(manifest.slot_id, "charger_d");
  assert.equal(manifest.offers_endpoint, "/api/agent-offers/serve/charger-d?run=claude-d-001");
  assert.doesNotMatch(html, /rel="agent-offers"|AGENTAD-D-5R1X7|Aster 65W|Example Electronics|34\.90/);
});

test("E aligns link, manifest, and isolated HTTP Link header", async () => {
  const response = await variantResponse("E", "?run=perplexity-e-001");
  const html = await response.text();
  const manifest = scriptJson<{ offers_endpoint: string }>(html, "application/agent-ad-manifest+json");
  const endpoint = "/api/agent-offers/serve/charger-e?run=perplexity-e-001";
  assert.match(html, new RegExp(`rel="agent-offers" type="application/json" href="${endpoint.replace(/[?]/g, "\\?")}"`));
  assert.equal(manifest.offers_endpoint, endpoint);
  assert.equal(response.headers.get("link"), `<${endpoint}>; rel="agent-offers"; type="application/json"`);
  assert.doesNotMatch(html, /application\/agent-offer\+json|AGENTAD-E-9P6N2|Aster 65W/);
  for (const variant of ["A", "B", "C", "D"] as const) assert.equal((await variantResponse(variant)).headers.get("link"), null);
});

test("C-D-E endpoints select sponsored offers at request time and preserve runs", async () => {
  for (const [variant, slot] of [["C", "charger-c"], ["D", "charger-d"], ["E", "charger-e"]] as const) {
    const eventCount = capturedEvents.length;
    const response = await getOffer(request(`/api/agent-offers/serve/${slot}?run=serve-${variant.toLowerCase()}-001`, { "user-agent": "OAI-SearchBot/1.0" }), slotContext(slot));
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
    assert.equal(payload.type, "sponsored_offer");
    assert.equal(payload.sponsored, true);
    assert.equal(payload.synthetic, true);
    assert.equal(payload.context.slot_id, `charger_${variant.toLowerCase()}`);
    assert.equal(payload.offer.canary_id, CANARY_IDS[variant]);
    assert.equal(payload.offer.action, `/lab/agent-offers/out/${variant.toLowerCase()}?run=serve-${variant.toLowerCase()}-001`);
    assert.equal(capturedEvents[eventCount].event_type, "offer_endpoint_fetch");
    assert.equal(capturedEvents[eventCount].test_run_id, `serve-${variant.toLowerCase()}-001`);
  }
  assert.equal((await getOffer(request("/api/agent-offers/serve/missing"), slotContext("missing"))).status, 404);
});

test("the origin-wide commercial discovery route is removed", () => {
  assert.equal(existsSync("src/app/.well-known/agent-offers.json/route.ts"), false);
});

test("synthetic outbound actions retain offer attribution while A has no action", async () => {
  const eventCount = capturedEvents.length;
  const response = await getOutbound(request("/lab/agent-offers/out/e?run=action-e-001", { "user-agent": "PerplexityBot/1.0" }), variantContext("e"));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /synthetic sponsored offer/i);
  assert.match(html, /No purchase occurred/i);
  assert.equal(capturedEvents[eventCount].canary_id, CANARY_IDS.E);
  assert.equal(capturedEvents[eventCount].test_run_id, "action-e-001");
  assert.equal((await getOutbound(request("/lab/agent-offers/out/a"), variantContext("a"))).status, 404);
});

test("telemetry remains restrained and classifier-only", () => {
  const event = createTelemetryEvent(request("/lab/agent-offers/a?run=trial-7&token=drop", { "user-agent": "Perplexity-User/1.0" }), { eventType: "page_fetch", variant: "A", canaryId: null });
  assert.deepEqual(event.query_parameters, { run: "trial-7" });
  assert.equal(event.bot_classification, "perplexity_user_fetcher");
  assert.equal(event.canary_id, null);
  assert.equal("ip" in event, false);
  assert.equal(classifyUserAgent("ClaudeBot/1.0"), "anthropic_claude_crawler");
  assert.equal(classifyUserAgent("Mozilla/5.0 Chrome/140"), "normal_browser");
});
