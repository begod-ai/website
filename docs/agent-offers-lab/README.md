# Invisible Agent Advertising Lab

The public research landing page is `/lab/agent-offers`. The experiment asks:

> Can an autonomous agent consuming an otherwise ordinary publisher page
> discover and use a sponsored commercial offer that is completely absent from
> the rendered human experience?

The secondary question is which non-rendered mechanism best supports dynamic
offer discovery. This is experimental research, not an established advertising
or web standard.

## Hypothesis

A publisher may be able to install a small integration once and expose
machine-readable sponsored opportunities without changing the page humans see.
The publisher page can advertise a slot while a central service selects the
actual offer only when an agent requests it. This is conceptually similar to an
advertising network without a visible rectangular placement.

Crawler classification is analytics-only. Every user agent receives the same
document for a given variant; there is no bot-specific HTML response.

## Human experience

All A–E pages render the same 500–800 word neutral article, **Choosing a USB-C
Charger for Travel**. The pages share one authoritative body renderer and have
identical title, description, headings, prose, order, styling, layout, and
visible links. Only the variant canonical URL and non-rendered machine layer
differ.

The article never names the synthetic product, merchant, price, sponsorship,
experiment, or canaries. Automated tests compare the complete `<body>` across
all variants.

## Variants

| Variant | Machine mechanism | Commercial canary exposed to client |
|---|---|---|
| A | Control: no advertising mechanism | None |
| B | Complete sponsored offer in `application/agent-offer+json` | `AGENTAD-B-7F3K9` |
| C | Experimental `<link rel="agent-offers">` to a dynamic endpoint | Endpoint returns `AGENTAD-C-2M8Q4` |
| D | Small `application/agent-ad-manifest+json` pointer | Endpoint returns `AGENTAD-D-5R1X7` |
| E | The same endpoint exposed through `<link>`, manifest, and HTTP `Link` header | Endpoint returns `AGENTAD-E-9P6N2` |

The custom MIME types and `agent-offers` relationship are explicitly
experimental. No variant uses commercial Schema.org `Product` or `Offer`
markup.

### A — control

`/lab/agent-offers/a` has no offer payload, manifest, custom discovery link,
advertising HTTP header, endpoint reference, or commercial canary. Server-side
telemetry may still record that Variant A was fetched.

### B — full inline offer

`/lab/agent-offers/b` embeds the full synthetic sponsored offer in a
non-rendering script element. It has no dynamic endpoint pointer. A page fetch
does not prove an agent parsed this payload, so the dashboard never calls it an
impression.

### C — dynamic endpoint pointer

`/lab/agent-offers/c` includes only:

```html
<link rel="agent-offers" type="application/json"
      href="/api/agent-offers/serve/charger-c">
```

The actual offer is absent from the publisher document and selected when the
endpoint is requested.

### D — small manifest

`/lab/agent-offers/d` includes a compact non-rendering manifest with synthetic
publisher, page, and slot IDs plus `/api/agent-offers/serve/charger-d`. It does
not contain product, merchant, price, or offer canary data.

### E — combined discovery

`/lab/agent-offers/e` combines a discovery link, small manifest, and response
header. All three point to `/api/agent-offers/serve/charger-e`. Other variants
do not receive the advertising `Link` header.

## Why dynamic serving matters

A future network may choose an offer using live availability, price, affiliate
inventory, advertiser eligibility or bids, commercial context, and measured
performance. C–E therefore expose stable slots rather than permanently placing
the commercial payload on the publisher page.

The current endpoint flow is deliberately small:

```text
resolve synthetic publisher/page/slot context
  → selectOffer(context)
  → serialize a sponsored synthetic offer
  → record request telemetry
```

`selectOffer` is the replaceable boundary. For now selection is deterministic.
The publisher page does not contact an ad service during an ordinary human page
request; the second request occurs only if a consumer follows the pointer.

## Dynamic offer endpoints

| Endpoint | Variant |
|---|---|
| `/api/agent-offers/serve/charger-c` | C |
| `/api/agent-offers/serve/charger-d` | D |
| `/api/agent-offers/serve/charger-e` | E |

Responses use `application/json`, `Cache-Control: no-store`, and clearly mark
the offer as `sponsored: true` and `synthetic: true`. Context uses the public
synthetic identifiers `pub_begod_lab`, `travel_charger`, and `charger_c`,
`charger_d`, or `charger_e`.

Offer actions remain local, for example `/lab/agent-offers/out/e`. The
confirmation records telemetry, states that the offer was synthetic, and never
redirects to a merchant.

## No origin-wide discovery

The old `/.well-known/agent-offers.json` route has been removed. An origin-wide
commercial resource could be discovered while testing A and would contaminate
the control. Origin-wide discovery requires a later experiment on an isolated
domain or subdomain.

## Controlled runs

Use an optional `run` query parameter to correlate a deliberate test:

```text
/lab/agent-offers/c?run=chatgpt-c-001
/api/agent-offers/serve/charger-c?run=chatgpt-c-001
/lab/agent-offers/out/c?run=chatgpt-c-001
```

IDs accept only ASCII letters, digits, hyphens, and underscores, with a maximum
of 64 characters. Invalid values are discarded. Valid IDs propagate through
machine pointers and action URLs, but not visible article content or canonical
URLs.

## Durable telemetry

Every relevant request follows this failure-isolated path:

```text
normalize request event
  → write structured Vercel log
  → attempt parameterized Postgres insert with a bounded timeout
  → return the requested resource
```

A missing `DATABASE_URL`, timeout, or database failure never breaks an
experiment page. Database errors are logged in redacted form and structured
request logging remains active.

Event types are:

- `landing_fetch`: research overview requested;
- `page_fetch`: an ordinary publisher article variant requested;
- `offer_endpoint_fetch`: a C, D, or E dynamic offer resource requested;
- `outbound_action`: the local synthetic action requested.

Each event stores source, UTC time, event type, variant, machine-only canary where
applicable, route, method, bounded raw user agent, existing normalized agent
class, referrer, Accept header, sanitized query parameters, controlled run ID,
environment, and deployment URL.

It does not store IP addresses, cookies, fingerprints, arbitrary headers,
visitor IDs, client storage, or third-party tracking data. Repeated HTTP
requests are retained because they are experimental evidence.

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | For durable telemetry/results | PostgreSQL connection URL, preferably a pooled Neon URL |
| `NEXT_PUBLIC_SITE_URL` | Existing optional setting | Main-site canonical URL |

Without `DATABASE_URL`, experiment routes continue emitting Vercel logs and
`/lab/agent-offers/results` displays a safe configuration notice.

## Migration

`migrations/001_events.sql` creates `agent_offer_events` and the original Agent
Offers indexes. `migrations/002_awvm_telemetry.sql` adds a source discriminator,
the two AWVM request-event types, and a source/time index. Historical Agent
Offers rows remain `agent_offers_lab`; first-generation `/lab/sanitizer-probe`
rows are reclassified as AWVM without being deleted. The Agent Offers dashboard
filters to its source so AWVM traffic does not alter its totals. The application
never creates or changes tables during a request.

Apply it with a configured development connection:

```bash
npm run agent-lab:migrate
```

The command applies numbered SQL files in order. For an existing database that
already has `001_events.sql`, apply `002_awvm_telemetry.sql` before deploying
AWVM. Both migrations are safe to rerun.

Development-only synthetic data is opt-in and refuses production environments:

```bash
AGENT_LAB_ALLOW_SEED=true npm run agent-lab:seed
```

## Dashboard

`/lab/agent-offers/results` is server-rendered and `noindex,nofollow`. It uses
one Postgres aggregation query rather than loading the full event table. It
shows:

- publisher-page and known AI/bot page fetches;
- dynamic offer endpoint requests and outbound actions;
- controlled runs and normalized agent classes;
- agent × A–E page-fetch matrix;
- agent × C–E endpoint-discovery matrix;
- aggregate page → endpoint → action request funnel;
- mechanism, agent, run, and recent-event tables.

Server-side filters support `1h`, `24h`, `7d`, `30d`, or all time, plus agent,
variant, event, and run:

```text
/lab/agent-offers/results?range=24h&agent=openai_searchbot&variant=C
/lab/agent-offers/results?range=all&run=chatgpt-c-001
```

All displayed times are UTC.

## Interpretation warning

The server can objectively observe a publisher-page request, dynamic endpoint
request, and synthetic action request. These are requests—not users, unique
agents, sessions, or ad impressions.

The server cannot infer from those events alone whether a model parsed B’s
inline payload, mentioned the offer in an answer, recovered a canary, disclosed
sponsorship, preserved the action URL, recommended the product, showed it to a
user, or changed ranking. These are external researcher observations. Manual
outcome recording is intentionally deferred to a separate table/UI rather than
mixing subjective observations into HTTP telemetry.

## Validation

```bash
npm ci
npm run agent-lab:test
npm run lint
npx tsc --noEmit
npm run build
```

Tests cover exact visible A–E parity, browser/crawler response equality,
machine-layer isolation, E-only HTTP headers, dynamic selection, controlled-run
propagation, removal of origin-wide discovery, telemetry failure isolation,
dashboard matrices and filters, privacy constraints, and existing site build
behavior.

## Vercel + Neon setup

1. In the existing Vercel project, open **Storage** or **Marketplace**.
2. Install **Neon** and create or select a small Postgres database.
3. Connect it to both **Production** and **Preview** environments.
4. In **Project Settings → Environment Variables**, verify the exact key
   `DATABASE_URL` exists for both. Never commit its value.
5. In Neon’s SQL editor, run the complete
   `docs/agent-offers-lab/migrations/001_events.sql` file. Apply it separately
   to a Preview database branch if Preview is isolated.
6. Deploy the application branch after the environment variable and migration
   are ready.
7. Visit `/lab/agent-offers/results`; an empty configured dashboard should
   replace the missing-configuration notice.
8. Visit `/lab/agent-offers/c?run=setup-check-001`, then request the linked
   `/api/agent-offers/serve/charger-c?run=setup-check-001` resource.
9. Refresh `/lab/agent-offers/results?range=1h&run=setup-check-001` and confirm
   both requests persisted.

References: [Vercel Postgres](https://vercel.com/docs/postgres),
[Neon for Vercel](https://vercel.com/marketplace/neon), and
[Neon serverless driver](https://neon.com/docs/serverless/serverless-driver).
