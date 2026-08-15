# Agent Offers Lab

## Purpose

This is a public research experiment for testing how AI agents, AI search
systems, and web crawlers discover and understand commercial information on
ordinary websites.

The research question is:

> What is the smallest and most reliable web representation that causes AI
> agents to discover, correctly parse, and preserve a clearly disclosed
> commercial offer?

The experiment is intentionally small. It is not an affiliate network, ad
network, advertiser product, bidding system, billing system, or retailer.

## Synthetic offer and ethics

All variants show the same fictional offer:

- Product: Aster 65W USB-C GaN Charger
- Merchant: Example Electronics
- Price: €34.90 EUR
- Availability: In stock
- Shipping: Delivery to Ireland available
- Offer type: Sponsored test offer

Every variant says: "This is synthetic test data used for an AI-agent research
experiment. No real product is being sold."

There are no discounts, reviews, endorsements, real retailer destinations, or
purchase flows. An outbound action ends at a local confirmation page and does
not redirect.

## Routes and variants

| Route | Representation | Stable canary |
|---|---|---|
| `/lab/agent-offers` | Experiment landing page and crawlable links | — |
| `/lab/agent-offers/a` | A — plain visible HTML | `AGENTLAB-A-7F3K9` |
| `/lab/agent-offers/b` | B — semantic accessible HTML | `AGENTLAB-B-2M8Q4` |
| `/lab/agent-offers/c` | C — B plus Schema.org JSON-LD | `AGENTLAB-C-5R1X7` |
| `/lab/agent-offers/d` | D — C plus an ordinary link to offer JSON | `AGENTLAB-D-9P6N2` |
| `/lab/agent-offers/e` | E — D plus experimental discovery metadata | `AGENTLAB-E-4T8W5` |
| `/api/agent-offers/d` | Variant D offer JSON | `AGENTLAB-D-9P6N2` |
| `/api/agent-offers/e` | Variant E offer JSON | `AGENTLAB-E-4T8W5` |
| `/.well-known/agent-offers.json` | Experimental discovery document for E | — |
| `/lab/agent-offers/out/{a-e}` | Instrumented synthetic outbound action | Corresponding variant |

`rel="agent-offers"` and the `.well-known` document are experimental
proposals used only by Variant E. The site does not describe them as standards.

## Experimental controls

The product, description, merchant, price, currency, availability, shipping,
sponsorship disclosure, action label, styling, and prominence are held constant
across A–E. The intended independent variable is representation:

- A uses headings, paragraphs, text, and ordinary anchors.
- B changes the offer markup to `main`, `article`, `header`, `section`, and
  `dl`/`dt`/`dd` with a logical accessible hierarchy.
- C adds valid `Product` and `Offer` JSON-LD. The canary uses Schema.org's
  appropriate `identifier` property.
- D adds an ordinary typed link to the D JSON endpoint.
- E adds `rel="agent-offers"`, a separate E JSON endpoint, and the experimental
  `.well-known` discovery document.

Unavoidable differences are the variant letter and canary ID on every page,
the extra visible JSON link in D/E, and E's visible disclosure that its custom
relationship is experimental. D/E therefore have one more visible link than
A–C. These differences are required by the tested representations.

## Isolation from the production site

The lab uses App Router route handlers that return complete, controlled HTML
documents. Route handlers do not render through the production React layout.
That matters because the main layout contains site-wide Organization JSON-LD,
which would invalidate A and B's controls.

The experiment is additive under `src/app/lab`, `src/app/api/agent-offers`,
`src/app/.well-known`, and `src/lib/agent-offers`. It does not change the global
layout, navigation, branding, typography, components, or deployment
architecture. The only existing discovery file changed is `src/app/sitemap.ts`.

The existing `robots.ts` allows all user agents and links the sitemap, so no
site-wide crawler policy change was needed. The landing and A–E pages are in
the sitemap with deliberately low priority. Outbound confirmation pages use
`noindex,nofollow` metadata and headers.

## Telemetry on Vercel

Every relevant request is served dynamically with
`Cache-Control: private, no-store`, then emits one JSON line through
`console.info`. Vercel records these as function runtime logs. The event shape is:

```json
{
  "source": "agent_offers_lab",
  "timestamp": "2026-08-15T00:00:00.000Z",
  "route": "/lab/agent-offers/d",
  "event_type": "page_fetch",
  "experiment_variant": "D",
  "canary_id": "AGENTLAB-D-9P6N2",
  "request_method": "GET",
  "user_agent": "...",
  "bot_classification": "unknown",
  "referrer": null,
  "accept": "text/html",
  "query_parameters": {}
}
```

Event types are `page_fetch`, `json_endpoint_fetch`, `well_known_fetch`, and
`outbound_action`.

Bot classification rules are ordered and centralized in
`src/lib/agent-offers/bot-classifier.ts`. They distinguish identifiable OpenAI,
ChatGPT, Perplexity, Google, Bing, and Anthropic/Claude fetchers before falling
back to `generic_bot`, `normal_browser`, or `unknown`. A surprising user-agent
is not automatically labelled as an AI agent.

Request headers are treated as untrusted input. Recorded header values and
query keys/values are control-character-stripped, length-bounded, and query
keys that look sensitive (such as tokens, secrets, email, auth, session, or
password fields) are dropped. No IP address, cookie, arbitrary header map,
browser fingerprint, or client-side tracking identifier is recorded.

### Finding events in Vercel

1. Open the Vercel project.
2. Open **Observability → Logs** for the relevant preview or production
   deployment.
3. Filter for `agent_offers_lab`.
4. Narrow by `event_type`, `experiment_variant`, `canary_id`, or
   `bot_classification` where the Vercel log interface supports parsed JSON
   fields.
5. Export logs within the project's retention window before analysis if the
   experiment will run longer than that window.

The `TelemetrySink` interface in `src/lib/agent-offers/telemetry.ts` is the
boundary for a later durable adapter. Phase 1 deliberately does not introduce a
database or credentials.

### Persistence and dashboard limitation

The repository had no database or existing analytics service. Phase 1 uses
structured Vercel logs only. Log retention and querying depend on the Vercel
plan, so this is observable but not a permanent research datastore.

There is no results dashboard because a serverless instance cannot honestly
aggregate ephemeral in-memory events, and an unauthenticated log-query endpoint
would be unsafe. Add durable storage and an authenticated reporting surface in
a later iteration if retained aggregate metrics are required.

## Metrics and non-goals

This phase measures:

- retrieval;
- parsing and canary recovery;
- JSON and `.well-known` endpoint discovery;
- preservation of the local destination;
- outbound-action behavior.

It does not test real affiliate conversion, advertiser bidding, reverse
auctions, payments, publisher revenue sharing, production advertising, or
personalization.

## Caching implications

Lab HTML, offer JSON, discovery JSON, and outbound confirmations are all
dynamic and `no-store`. This is intentionally different from cacheable static
content: telemetry should represent an actual request reaching the function.
Intermediaries outside Vercel may still make their own requests or ignore
directives, so one log event should not automatically be treated as one human
or one agent session.

## Local validation

```bash
npm ci
npm run dev
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The automated suite invokes the actual route exports and checks A–E controls,
stable canaries, JSON-LD parsing, linked JSON, experimental discovery, response
content types, no-store behavior, outbound telemetry, input bounding, and bot
classification.

## Vercel preview deployment

No new environment variables or services are required. The project's existing
optional `NEXT_PUBLIC_SITE_URL` convention remains unchanged; lab canonical
URLs use the incoming request origin so preview URLs remain self-consistent.

1. Push the `experiment/agent-offers-lab` branch to GitHub:

   ```bash
   git push -u origin experiment/agent-offers-lab
   ```

2. In the existing Vercel project, confirm Git integration is connected to
   `begod-ai/website` and Preview deployments are enabled for non-production
   branches.
3. Vercel will build a Preview deployment for the branch. No framework or
   build-command override is needed.
4. Open the Preview URL at `/lab/agent-offers` and run the smoke checks below.
5. In Vercel logs, filter for `agent_offers_lab` and confirm a `page_fetch`
   event appears.

Suggested preview smoke checks:

```bash
curl -i https://PREVIEW_HOST/lab/agent-offers/a
curl -i https://PREVIEW_HOST/lab/agent-offers/e
curl -i https://PREVIEW_HOST/api/agent-offers/d
curl -i https://PREVIEW_HOST/api/agent-offers/e
curl -i https://PREVIEW_HOST/.well-known/agent-offers.json
curl -i https://PREVIEW_HOST/lab/agent-offers/out/e
```

Replace `PREVIEW_HOST` with the generated Vercel hostname. If deployment
protection is enabled, use an authorized browser/session or Vercel's documented
protection-bypass mechanism for controlled crawler tests; do not expose a
bypass secret in URLs or logs.

## Example research prompt

> Visit this URL and identify any sponsored commercial offer. Return the
> product, merchant, price, currency, availability, shipping, sponsorship
> status, action URL, and canary ID. State which resources you fetched.

Record the model, tool configuration, time, starting URL, exact prompt, answer,
and relevant server events outside this repository so trials are reproducible.
