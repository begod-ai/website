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
| `/lab/agent-offers/results` | Durable server-rendered research dashboard | — |

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

## Controlled runs

An optional `run` query parameter groups requests from a deliberate experiment:

```text
/lab/agent-offers/d?run=chatgpt-001
```

Run IDs accept only ASCII letters, digits, hyphens, and underscores and are at
most 64 characters. Invalid values are discarded. A valid ID is propagated to
the linked JSON endpoint and synthetic outbound action, for example:

```text
/api/agent-offers/d?run=chatgpt-001
/lab/agent-offers/out/d?run=chatgpt-001
```

The run ID is not added to visible offer copy, canonical URLs, or Product/Offer
JSON-LD. Without `run`, the experiment output remains unchanged.

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
  "query_parameters": {},
  "test_run_id": null,
  "environment": "production",
  "deployment_url": "https://begod.ai"
}
```

Event types are `landing_fetch`, `page_fetch`, `json_endpoint_fetch`,
`well_known_fetch`, and `outbound_action`.

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

## Durable telemetry

The production telemetry sequence is:

```text
normalize request event
  → write the existing structured Vercel log
  → attempt a parameterized Postgres insert
  → return the experiment response
```

Postgres access uses the lightweight Neon serverless driver over HTTP. Database
queries have a bounded timeout. A missing `DATABASE_URL`, timeout, or database
error never causes an experiment route to fail. The structured request log is
written first; database failures emit a separate redacted
`telemetry_database_error` log without exposing the connection string.

The application never creates tables during a request. Schema changes are
explicit migrations under `docs/agent-offers-lab/migrations`.

### Database schema

`agent_offer_events` stores one row for each HTTP request. Important columns
are the UTC occurrence time, validated event type, variant, canary, route,
request method, raw user agent, normalized agent class, referrer, Accept header,
sanitized JSON query parameters, controlled run ID, Vercel environment, and
deployment URL. It deliberately has no IP, cookie, fingerprint, or visitor ID.

Indexes cover `occurred_at`, `event_type`, `variant`, `agent_class`, and
non-null `test_run_id`.

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | For durable telemetry and results | PostgreSQL connection string, preferably a pooled Neon URL for Vercel |
| `NEXT_PUBLIC_SITE_URL` | Existing optional setting | Main-site canonical URL |

If `DATABASE_URL` is absent, experiment pages continue writing structured
Vercel logs and `/lab/agent-offers/results` names the missing variable without
showing any secret value.

## Migration

The idempotent migration is
`docs/agent-offers-lab/migrations/001_events.sql`. Apply it once to each database
or database branch before relying on durable events.

With `DATABASE_URL` available in the current shell:

```bash
npm run agent-lab:migrate
```

Alternatively, paste the complete SQL file into the connected Neon/Vercel SQL
query editor and run it. Re-running the migration is safe because table and
index creation use `IF NOT EXISTS`.

### Development seed data

Synthetic seed data is opt-in and refuses to run when either `NODE_ENV` or
`VERCEL_ENV` is `production`:

```bash
AGENT_LAB_ALLOW_SEED=true npm run agent-lab:seed
```

This inserts a small set of clearly synthetic OpenAI, Perplexity, Google,
Claude, and browser request events into the configured development database.
There is no public seed endpoint and production is never seeded automatically.

## Dashboard

`/lab/agent-offers/results` is a server-rendered, `noindex,nofollow` research
dashboard. It provides:

- total, AI/bot, page, JSON, well-known, and outbound request counts;
- normalized agent-class and controlled-run counts;
- a dynamic agent × A–E page-fetch matrix with column totals;
- an aggregate discovery funnel;
- variant and agent breakdowns;
- the newest 100 matching events;
- recent controlled runs with one-click run filtering.

Filters are server-side URL parameters and therefore bookmarkable:

```text
/lab/agent-offers/results?range=24h&agent=openai_searchbot&variant=D
/lab/agent-offers/results?range=all&run=chatgpt-001
```

Supported ranges are `1h`, `24h`, `7d`, `30d`, and `all`. Agent, variant,
event, and run filters are validated against application enums or the strict run
format before they reach parameterized SQL. All displayed timestamps are UTC.

Dashboard aggregation is performed in Postgres with one query; it does not load
the complete event table into application memory.

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

Vercel logs remain the debugging fallback. Postgres is the durable research
record once configured and migrated.

## Event semantics and interpretation warning

- `landing_fetch`: the experiment overview was requested.
- `page_fetch`: one A–E variant page was requested.
- `json_endpoint_fetch`: the D or E offer JSON endpoint was requested.
- `well_known_fetch`: the experimental discovery document was requested.
- `outbound_action`: an instrumented synthetic destination was requested.

Events are requests, not unique agents or unique users. Repeated requests are
not deduplicated because each fetch is experimental evidence.

A crawler page fetch does not prove the offer appeared in an AI answer. An API
fetch does not prove the offer influenced ranking. An outbound action is
stronger evidence of destination preservation but may still be machine-
generated. A shared `test_run_id` is required for stronger causal
interpretation, and even then it does not create a user identity.

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
npm run agent-lab:test
npm run lint
npx tsc --noEmit
npm run build
```

The automated suite invokes the actual route exports and checks A–E controls,
stable canaries, JSON-LD parsing, linked JSON, experimental discovery, response
content types, no-store behavior, outbound telemetry, input bounding, bot
classification, database mapping and failures, run propagation, dashboard
aggregation, every dashboard filter, and missing-database rendering.

## Vercel + Neon Postgres setup

Vercel now connects new Postgres databases through Marketplace providers. Neon
is the smallest fit for this project and can automatically inject
`DATABASE_URL` into the selected Vercel environments.

1. Open the existing begod.ai project in Vercel.
2. Open **Storage** or **Marketplace**, find **Neon**, and choose **Install**.
   Select **Create New Neon Account** if there is no Neon account yet, then
   choose the free/smallest suitable Postgres plan and connect the resource to
   the begod.ai project. If an existing Neon account is linked, select the
   existing database instead.
3. During connection, enable at least **Production** and **Preview**. Enable
   **Development** too if local `vercel env pull` is desired.
4. Open **Project Settings → Environment Variables** and verify that the exact
   key `DATABASE_URL` exists for Production and Preview. If the integration
   created a prefixed name, add `DATABASE_URL` with the same connection value.
   Never commit or paste that value into documentation.
5. Open the connected Neon resource's **Query** view in Vercel (or Neon's SQL
   Editor), paste all of
   `docs/agent-offers-lab/migrations/001_events.sql`, review it, and run it.
   If Preview uses a separate Neon database branch, run the same migration on
   that branch as well.
6. Redeploy the analytics branch so the deployment receives the new environment
   variable.
7. Visit `/lab/agent-offers/results`. It should show an empty dashboard rather
   than the missing-configuration message.
8. Visit `/lab/agent-offers/d?run=setup-check-001`, then follow its JSON link.
9. Refresh `/lab/agent-offers/results?range=1h&run=setup-check-001` and confirm
   the page and JSON requests persisted.

Official references: [Postgres on Vercel](https://vercel.com/docs/postgres),
[Neon for Vercel](https://vercel.com/marketplace/neon), and
[Neon's serverless driver](https://neon.com/docs/serverless/serverless-driver).

## Vercel preview deployment

1. Push the analytics branch to GitHub:

   ```bash
   git push -u origin experiment/agent-offers-analytics
   ```

2. In the existing Vercel project, confirm Git integration is connected to
   `begod-ai/website` and Preview deployments are enabled for non-production
   branches.
3. Vercel will build a Preview deployment for the branch. No framework or
   build-command override is needed, but the connected Preview database must
   already have the migration applied.
4. Open the Preview URL at `/lab/agent-offers` and run the smoke checks below.
5. Open `/lab/agent-offers/results` and confirm the connected Preview database
   is configured and migrated.
6. In Vercel logs, filter for `agent_offers_lab` and confirm a `page_fetch`
   event appears alongside the durable dashboard record.

Suggested preview smoke checks:

```bash
curl -i https://PREVIEW_HOST/lab/agent-offers/a
curl -i https://PREVIEW_HOST/lab/agent-offers/e
curl -i https://PREVIEW_HOST/api/agent-offers/d
curl -i https://PREVIEW_HOST/api/agent-offers/e
curl -i https://PREVIEW_HOST/.well-known/agent-offers.json
curl -i https://PREVIEW_HOST/lab/agent-offers/out/e
curl -i https://PREVIEW_HOST/lab/agent-offers/results
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
