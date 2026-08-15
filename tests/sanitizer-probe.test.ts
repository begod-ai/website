import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { GET as getLegacyProbe } from "../src/app/lab/sanitizer-probe/route";
import {
  resetTelemetrySink,
  setTelemetrySink,
  type TelemetryEvent,
} from "../src/lib/agent-offers/telemetry";

const events: TelemetryEvent[] = [];
before(() => setTelemetrySink({ write(event) { events.push(event); } }));
after(() => resetTelemetrySink());

test("legacy sanitizer probe redirects to AWVM and preserves a valid run", async () => {
  const response = await getLegacyProbe(new Request(
    "https://begod.ai/lab/sanitizer-probe?run=legacy-001&unsafe=drop",
    { headers: { "user-agent": "OAI-SearchBot/1.0" } },
  ));

  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://begod.ai/lab/awvm?run=legacy-001");
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.equal(events.at(-1)?.source, "awvm");
  assert.equal(events.at(-1)?.event_type, "awvm_page_fetch");
  assert.equal(events.at(-1)?.test_run_id, "legacy-001");
});
