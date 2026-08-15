import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { GET as getSanitizerProbe } from "../src/app/lab/sanitizer-probe/route";
import {
  resetTelemetrySink,
  setTelemetrySink,
  type TelemetryEvent,
} from "../src/lib/agent-offers/telemetry";

const events: TelemetryEvent[] = [];

before(() => setTelemetrySink({
  write(event) {
    events.push(event);
  },
}));
after(() => resetTelemetrySink());

function request(headers?: HeadersInit): Request {
  return new Request("https://begod.ai/lab/sanitizer-probe?run=test-001", {
    headers,
  });
}

function visibleBodyText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<head\b[\s\S]*?<\/head>/i, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<([a-z][a-z0-9-]*)\b[^>]*\shidden(?:\s|=|>)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scriptText(html: string, mime: string): string {
  const escapedMime = mime.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<script type="${escapedMime}">([^<]+)<\\/script>`));
  assert.ok(match, `Expected ${mime} script`);
  return match[1];
}

test("sanitizer probe returns the requested response layers", async () => {
  const response = await getSanitizerProbe(request({
    "user-agent": "OAI-SearchBot/1.0",
  }));
  const html = await response.text();
  const visibleText = visibleBodyText(html);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-sanitizer-probe"), "HEADER-X72");
  assert.match(response.headers.get("content-type") ?? "", /^text\/html/);

  assert.match(visibleText, /VISIBLE-T55/);
  assert.match(html, /<span hidden aria-hidden="true">HIDDEN-F27<\/span>/);
  assert.doesNotMatch(visibleText, /HIDDEN-F27/);
  assert.match(html, /<!-- COMMENT-L49 -->/);
  assert.match(html, /<meta name="sanitizer-probe" content="META-K31">/);
  assert.match(html, /<link rel="tag" href="urn:sanitizer-probe:LINK-P91">/);
  assert.match(html, /<title>[^<]*TITLE-N17[^<]*<\/title>/);
  assert.match(html, /aria-label="Travel charger guidance ARIA-A41"/);

  const jsonLd = JSON.parse(scriptText(html, "application/ld+json")) as {
    identifier: string;
  };
  assert.equal(jsonLd.identifier, "JSONLD-M62");

  const customProbe = JSON.parse(scriptText(html, "application/probe+json")) as {
    token: string;
  };
  assert.equal(customProbe.token, "JSON-Q84");
});

test("sanitizer probe records a run-correlated page fetch", async () => {
  const eventCount = events.length;
  await getSanitizerProbe(request({ "user-agent": "ClaudeBot/1.0" }));
  const event = events[eventCount];

  assert.equal(event.event_type, "page_fetch");
  assert.equal(event.route, "/lab/sanitizer-probe");
  assert.equal(event.experiment_variant, null);
  assert.equal(event.canary_id, null);
  assert.equal(event.test_run_id, "test-001");
});

test("sanitizer probe does not vary by user agent", async () => {
  const browser = await getSanitizerProbe(request({
    "user-agent": "Mozilla/5.0 Chrome/140",
  }));
  const crawler = await getSanitizerProbe(request({
    "user-agent": "PerplexityBot/1.0",
  }));

  assert.equal(await browser.text(), await crawler.text());
  assert.equal(
    browser.headers.get("x-sanitizer-probe"),
    crawler.headers.get("x-sanitizer-probe"),
  );
});
