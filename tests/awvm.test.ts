import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { GET as getAwvm } from "../src/app/lab/awvm/route";
import { GET as getReference } from "../src/app/lab/awvm/reference/route";
import { GET as getReferenceJson } from "../src/app/lab/awvm/reference.json/route";
import { GET as getResource } from "../src/app/lab/awvm/resource/link/route";
import { GET as getResults, POST as postResults } from "../src/app/lab/awvm/results/route";
import {
  resetTelemetrySink,
  setTelemetrySink,
  type TelemetryEvent,
} from "../src/lib/agent-offers/telemetry";
import {
  AWVM_PROBES,
  awvmToken,
  type AwvmProbeKey,
} from "../src/lib/awvm/registry";
import {
  extractReportedAwvmTokens,
  scoreAwvmObservation,
  scoreAwvmResponse,
} from "../src/lib/awvm/scoring";

const events: TelemetryEvent[] = [];
before(() => setTelemetrySink({ write(event) { events.push(event); } }));
after(() => resetTelemetrySink());

function request(path: string, headers?: HeadersInit): Request {
  return new Request(`https://begod.ai${path}`, { headers });
}

async function mainResponse(userAgent = "OAI-SearchBot/1.0") {
  return getAwvm(request("/lab/awvm?run=chatgpt-awvm-001", {
    "user-agent": userAgent,
  }));
}

function scriptText(html: string, mime: string): string {
  const escapedMime = mime.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<script type="${escapedMime}">([^<]+)<\\/script>`));
  assert.ok(match, `Expected ${mime} script`);
  return match[1];
}

function visibleBodyText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<head\b[\s\S]*?<\/head>/i, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
    .replace(/<details\b[\s\S]*?<\/details>/gi, " ")
    .replace(/<dialog\b[\s\S]*?<\/dialog>/gi, " ")
    .replace(/<form\b[\s\S]*?<\/form>/gi, " ")
    .replace(/<([a-z][a-z0-9-]*)\b[^>]*(?:\shidden(?:\s|=|>)|display\s*:\s*none|visibility\s*:\s*hidden|class="[^"]*(?:offscreen|clipped)[^"]*")[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(?:title|desc|metadata)\b[\s\S]*?<\/(?:title|desc|metadata)>/gi, " ")
    .replace(/<(?:input|img|meta)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertTokenInAttribute(html: string, key: AwvmProbeKey, pattern: RegExp) {
  assert.match(html, pattern, `${awvmToken(key)} should exist in its attribute layer`);
}

test("AWVM registry contains exactly 50 unique stable tokens", () => {
  assert.equal(AWVM_PROBES.length, 50);
  assert.equal(new Set(AWVM_PROBES.map((probe) => probe.id)).size, 50);
  assert.equal(new Set(AWVM_PROBES.map((probe) => probe.key)).size, 50);
  for (const probe of AWVM_PROBES) assert.match(probe.id, /^AWVM-[A-Z0-9-]+$/);
});

test("AWVM route returns 200 and does not vary by user agent", async () => {
  const browser = await mainResponse("Mozilla/5.0 Chrome/140");
  const browserHtml = await browser.text();
  const crawler = await mainResponse("ClaudeBot/1.0");

  assert.equal(browser.status, 200);
  assert.equal(browserHtml, await crawler.text());
  assert.equal(browser.headers.get("x-awvm-probe"), crawler.headers.get("x-awvm-probe"));
  assert.equal(browser.headers.get("link"), crawler.headers.get("link"));
});

test("visible controls are rendered and hidden probes do not leak into visible prose", async () => {
  const html = await (await mainResponse()).text();
  const visibleText = visibleBodyText(html);
  const visibleTokens = AWVM_PROBES.filter((probe) => probe.expectedVisibility === "visible");
  const nonVisibleTokens = AWVM_PROBES.filter((probe) => !["visible", "browser-rendered"].includes(probe.expectedVisibility));
  const wordCount = visibleText.split(/\s+/).length;

  assert.ok(wordCount >= 400 && wordCount <= 700, `visible article word count ${wordCount}`);
  for (const probe of visibleTokens) assert.match(visibleText, new RegExp(probe.id));
  for (const probe of nonVisibleTokens) assert.doesNotMatch(visibleText, new RegExp(probe.id));
  assert.match(html, new RegExp(`content: "${awvmToken("cssContent")}"`));
});

test("title and common metadata probes occupy their intended head elements", async () => {
  const html = await (await mainResponse()).text();
  assert.match(html, new RegExp(`<title>[^<]*${awvmToken("documentTitle")}[^<]*<\\/title>`));
  assertTokenInAttribute(html, "metaDescription", new RegExp(`<meta name="description" content="[^"]*${awvmToken("metaDescription")}[^"]*">`));
  assertTokenInAttribute(html, "metaCustom", new RegExp(`<meta name="awvm-probe" content="${awvmToken("metaCustom")}">`));
  assertTokenInAttribute(html, "metaOgTitle", new RegExp(`<meta property="og:title" content="[^"]*${awvmToken("metaOgTitle")}[^"]*">`));
  assertTokenInAttribute(html, "metaOgDescription", new RegExp(`<meta property="og:description" content="[^"]*${awvmToken("metaOgDescription")}[^"]*">`));
  assertTokenInAttribute(html, "metaTwitter", new RegExp(`<meta name="twitter:description" content="[^"]*${awvmToken("metaTwitter")}[^"]*">`));
});

test("hidden DOM probes use five distinct non-visible mechanisms", async () => {
  const html = await (await mainResponse()).text();
  assert.match(html, new RegExp(`<span hidden>${awvmToken("hiddenAttribute")}<\\/span>`));
  assert.match(html, new RegExp(`<span style="display:none">${awvmToken("hiddenDisplay")}<\\/span>`));
  assert.match(html, new RegExp(`<span style="visibility:hidden">${awvmToken("hiddenVisibility")}<\\/span>`));
  assert.match(html, new RegExp(`<span class="offscreen">${awvmToken("hiddenOffscreen")}<\\/span>`));
  assert.match(html, new RegExp(`<span class="clipped">${awvmToken("hiddenClipped")}<\\/span>`));
});

test("semantic, accessibility, and form probes remain attribute-only", async () => {
  const html = await (await mainResponse()).text();
  assertTokenInAttribute(html, "ariaLabel", new RegExp(`aria-label="${awvmToken("ariaLabel")}"`));
  assertTokenInAttribute(html, "imageAlt", new RegExp(`alt="${awvmToken("imageAlt")}"`));
  assertTokenInAttribute(html, "titleAttribute", new RegExp(`title="${awvmToken("titleAttribute")}"`));
  assertTokenInAttribute(html, "dataAttribute", new RegExp(`data-awvm="${awvmToken("dataAttribute")}"`));
  assertTokenInAttribute(html, "attributeHiddenInput", new RegExp(`value="${awvmToken("attributeHiddenInput")}"`));
  assertTokenInAttribute(html, "dataValue", new RegExp(`<data value="${awvmToken("dataValue")}">`));
  assertTokenInAttribute(html, "formHidden", new RegExp(`name="awvm-form-hidden" value="${awvmToken("formHidden")}"`));
  assertTokenInAttribute(html, "formDisabled", new RegExp(`value="${awvmToken("formDisabled")}" disabled`));
  assertTokenInAttribute(html, "optionValue", new RegExp(`<option value="${awvmToken("optionValue")}">`));
});

test("non-rendering HTML and comment probes are present", async () => {
  const html = await (await mainResponse()).text();
  assert.match(html, new RegExp(`<noscript>${awvmToken("noscript")}<\\/noscript>`));
  assert.match(html, new RegExp(`<template>${awvmToken("template")}<\\/template>`));
  assert.match(html, new RegExp(`<details>[\\s\\S]*${awvmToken("details")}[\\s\\S]*<\\/details>`));
  assert.match(html, new RegExp(`<dialog>${awvmToken("dialog")}<\\/dialog>`));
  assert.match(html, new RegExp(`<!-- ${awvmToken("commentHead")} -->`));
  assert.match(html, new RegExp(`<!-- ${awvmToken("commentBody")} -->`));
});

test("link probes occupy custom, alternate, tag, and ordinary href attributes", async () => {
  const html = await (await mainResponse()).text();
  assert.match(html, new RegExp(`<link rel="awvm-probe" href="[^"]*${awvmToken("linkCustom")}[^"]*">`));
  assert.match(html, new RegExp(`<link rel="alternate"[^>]*${awvmToken("linkAlternate")}[^"]*">`));
  assert.match(html, new RegExp(`<link rel="tag" href="urn:awvm:${awvmToken("linkTag")}">`));
  assert.match(html, new RegExp(`<a href="[^"]*${awvmToken("hrefAttribute")}[^"]*">Read a short companion note<\\/a>`));
  assert.doesNotMatch(visibleBodyText(html), new RegExp(awvmToken("hrefAttribute")));
});

test("JSON-LD, microdata, RDFa, and custom script probes are syntactically represented", async () => {
  const html = await (await mainResponse()).text();
  const jsonLd = JSON.parse(scriptText(html, "application/ld+json")) as { identifier: string };
  const customJson = JSON.parse(scriptText(html, "application/awvm+json")) as { probe: string };
  const ordinaryJson = JSON.parse(scriptText(html, "application/json")) as { probe: string };
  assert.equal(jsonLd.identifier, awvmToken("jsonLd"));
  assert.equal(customJson.probe, awvmToken("scriptCustom"));
  assert.equal(ordinaryJson.probe, awvmToken("scriptJson"));
  assert.match(html, new RegExp(`itemscope itemtype="https://schema.org/Article"[\\s\\S]*itemprop="identifier" content="${awvmToken("microdata")}"`));
  assert.match(html, new RegExp(`vocab="https://schema.org/" typeof="Article"[\\s\\S]*property="identifier" content="${awvmToken("rdfa")}"`));
});

test("SVG exposes visible text, title, description, and metadata probes", async () => {
  const html = await (await mainResponse()).text();
  assert.match(html, new RegExp(`<text[^>]*>${awvmToken("svgText")}<\\/text>`));
  assert.match(html, new RegExp(`<title id="awvm-svg-title">${awvmToken("svgTitle")}<\\/title>`));
  assert.match(html, new RegExp(`<desc id="awvm-svg-desc">${awvmToken("svgDescription")}<\\/desc>`));
  assert.match(html, new RegExp(`<metadata>[^<]*${awvmToken("svgMetadata")}[^<]*<\\/metadata>`));
});

test("AWVM custom and Link response headers contain their dedicated probes", async () => {
  const response = await mainResponse();
  assert.equal(response.headers.get("x-awvm-probe"), awvmToken("headerCustom"));
  assert.equal(response.headers.get("x-awvm-metadata"), awvmToken("headerMetadata"));
  assert.match(response.headers.get("link") ?? "", new RegExp(awvmToken("headerLink")));
  assert.doesNotMatch(await response.text(), new RegExp(awvmToken("headerCustom")));
});

test("every registry token is emitted by its configured response or linked resource", async () => {
  const response = await mainResponse();
  const html = await response.text();
  const headerText = [
    response.headers.get("x-awvm-probe"),
    response.headers.get("x-awvm-metadata"),
    response.headers.get("link"),
  ].join(" ");
  const resource = await getResource(request(`/lab/awvm/resource/link?probe=${awvmToken("hrefAttribute")}`));
  const resourceText = await resource.text();

  for (const probe of AWVM_PROBES) {
    const layer = probe.group === "response_headers"
      ? headerText
      : probe.group === "linked_resource"
        ? resourceText
        : html;
    assert.match(layer, new RegExp(probe.id), `${probe.id} missing from ${probe.location}`);
  }
});

test("linked resource accepts only known static pointers and records secondary telemetry", async () => {
  const eventCount = events.length;
  const response = await getResource(request(`/lab/awvm/resource/link?probe=${awvmToken("hrefAttribute")}&run=resource-001`, { "user-agent": "PerplexityBot/1.0" }));
  assert.equal(response.status, 200);
  assert.match(await response.text(), new RegExp(awvmToken("resourceLink")));
  assert.equal(events[eventCount].source, "awvm");
  assert.equal(events[eventCount].event_type, "awvm_resource_fetch");
  assert.equal(events[eventCount].route, "/lab/awvm/resource/link");
  assert.equal(events[eventCount].test_run_id, "resource-001");
  assert.equal((await getResource(request("/lab/awvm/resource/link?probe=AWVM-NOT-ALLOWED"))).status, 404);
});

test("main page telemetry preserves source, classification, route, and sanitized run", async () => {
  const eventCount = events.length;
  await mainResponse("OAI-SearchBot/1.0");
  const event = events[eventCount];
  assert.equal(event.source, "awvm");
  assert.equal(event.event_type, "awvm_page_fetch");
  assert.equal(event.route, "/lab/awvm");
  assert.equal(event.bot_classification, "openai_searchbot");
  assert.equal(event.test_run_id, "chatgpt-awvm-001");
  assert.equal(event.experiment_variant, null);
});

test("reference HTML and JSON expose every registry probe and remain noindex", async () => {
  const response = await getReference(request("/lab/awvm/reference"));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  for (const probe of AWVM_PROBES) assert.match(html, new RegExp(probe.id));

  const jsonResponse = await getReferenceJson();
  const manifest = await jsonResponse.json();
  assert.equal(jsonResponse.status, 200);
  assert.match(jsonResponse.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.equal(manifest.probe_count, 50);
  assert.deepEqual(manifest.probes.map((probe: { id: string }) => probe.id), AWVM_PROBES.map((probe) => probe.id));
});

test("scoring identifies recovered, missed, unknown, and per-group rates", () => {
  const score = scoreAwvmResponse([
    awvmToken("documentTitle"),
    awvmToken("visibleParagraph"),
    awvmToken("hiddenAttribute"),
    awvmToken("visibleParagraph"),
    "AWVM-UNKNOWN-999",
  ].join("\n"));
  assert.deepEqual(score.found.map((probe) => probe.id), [
    awvmToken("visibleParagraph"),
    awvmToken("documentTitle"),
    awvmToken("hiddenAttribute"),
  ]);
  assert.equal(score.recovered, 3);
  assert.equal(score.missed.length, 47);
  assert.equal(score.recoveryRate, 3 / 50);
  assert.deepEqual(score.unknownTokens, ["AWVM-UNKNOWN-999"]);
  assert.deepEqual(score.byGroup.find((group) => group.group === "hidden_dom"), {
    group: "hidden_dom",
    label: "Hidden DOM representations",
    found: 1,
    total: 5,
    recoveryRate: 0.2,
  });
});

test("scoring requires exact standalone tokens and represents fetch failure separately", () => {
  const arbitrary = `X${awvmToken("visibleParagraph")} ${awvmToken("visibleHeading")}Y AWVM-NOT-REAL`;
  assert.deepEqual(extractReportedAwvmTokens(arbitrary), ["AWVM-VISIBLE-H-002Y", "AWVM-NOT-REAL"]);
  assert.equal(scoreAwvmResponse(arbitrary).recovered, 0);
  assert.equal(scoreAwvmResponse(awvmToken("visibleParagraph").toLowerCase()).recovered, 0);
  assert.deepEqual(scoreAwvmObservation(false, AWVM_PROBES.map((probe) => probe.id).join(" ")), { status: "fetch_failure" });
});

test("stateless results UI scores pasted text and keeps fetch failure distinct", async () => {
  const getResponse = await getResults(request("/lab/awvm/results"));
  assert.equal(getResponse.status, 200);
  assert.match(getResponse.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.match(await getResponse.text(), /Score an agent response/);

  const scoredBody = new URLSearchParams({
    agent_name: "Claude <test>",
    run_id: "claude-awvm-001",
    fetch_status: "success",
    agent_response: `${awvmToken("documentTitle")} ${awvmToken("metaCustom")}`,
  });
  const scored = await postResults(new Request("https://begod.ai/lab/awvm/results", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: scoredBody,
  }));
  const scoredHtml = await scored.text();
  assert.match(scoredHtml, /2 \/ 50/);
  assert.match(scoredHtml, /4\.0%/);
  assert.match(scoredHtml, /Claude &lt;test&gt;/);
  assert.doesNotMatch(scoredHtml, /Claude <test>/);

  const failedBody = new URLSearchParams({ fetch_status: "failure", agent_response: "" });
  const failed = await postResults(new Request("https://begod.ai/lab/awvm/results", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: failedBody,
  }));
  const failedHtml = await failed.text();
  assert.match(failedHtml, /FETCH FAILURE/);
  assert.match(failedHtml, /No probes were scored as missed/);
  assert.doesNotMatch(failedHtml, /0 \/ 50/);
});

test("AWVM telemetry migration adds source isolation and dedicated event types", () => {
  const sql = readFileSync("docs/agent-offers-lab/migrations/002_awvm_telemetry.sql", "utf8");
  assert.match(sql, /ADD COLUMN IF NOT EXISTS source/);
  assert.match(sql, /'awvm_page_fetch'/);
  assert.match(sql, /'awvm_resource_fetch'/);
  assert.match(sql, /WHERE route = '\/lab\/sanitizer-probe'/);
  assert.match(sql, /agent_offer_events_source_occurred_at_idx/);
});
