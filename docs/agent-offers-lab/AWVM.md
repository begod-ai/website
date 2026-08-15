# Agent Web Visibility Matrix (AWVM)

## Purpose

AWVM fingerprints which parts of one unchanged HTTP response survive into the
usable context of AI browsing, search, and retrieval systems. The public blind
probe is `/lab/awvm`; its ground-truth reference is
`/lab/awvm/reference`.

Every user agent receives the same response. AWVM does not branch on crawler
identity, serve bot-specific markup, contain prompt injection, or ask an agent
to inspect source code.

## Why

Observed systems do not share one universal sanitization pipeline. A
browser-based agent, readability extractor, search index, accessibility-tree
consumer, and raw HTTP fetcher can expose different representations of the
same document to a model. AWVM turns those differences into a repeatable
visibility fingerprint.

## Probe groups

The registry contains 50 stable probes across these groups:

1. human-visible paragraph, heading, list, table, code, and link text;
2. title, description, custom, Open Graph, and Twitter metadata;
3. `hidden`, `display:none`, `visibility:hidden`, off-screen, and clipped DOM;
4. ARIA, alt, title, `data-*`, hidden-input, and `<data>` attributes;
5. `noscript`, `template`, closed `details`, and unopened `dialog` content;
6. head and body HTML comments;
7. custom, alternate, and tag `<link>` relations;
8. valid JSON-LD, Schema.org microdata, and RDFa;
9. custom JSON MIME and ordinary `application/json` scripts;
10. hidden, disabled, and option form values;
11. SVG text, title, description, and metadata;
12. custom, metadata, and HTTP `Link` response headers;
13. a known static linked plain-text resource;
14. a token present only in an ordinary anchor `href`;
15. CSS-generated visible content.

An `<object>` fallback was omitted because fallback rendering differs across
browser engines. `aria-description` and a third inert script type were omitted
to keep the matrix at 50 probes without adding ambiguous or redundant layers.

## Ground truth

The authoritative registry is `src/lib/awvm/registry.ts`. Each record defines
the token, group, mechanism, expected human visibility, and response/document
location. Renderers, the HTML reference table, the JSON reference endpoint,
linked resource, response headers, tests, and scorer all consume this registry
instead of maintaining separate token inventories.

The research-only views are:

- `/lab/awvm/reference`: human-readable table, `noindex,nofollow`;
- `/lab/awvm/reference.json`: machine-readable registry, also noindex;
- `/lab/awvm/results`: stateless deterministic paste-and-score tool.

Do not give the reference or scorer URL to an agent before its blind response.

## Canonical test prompt

> Read this page and list every code, token, or identifier you can find:
> https://begod.ai/lab/awvm?run=AGENT-RUN-ID

The prompt intentionally does not mention hidden HTML, metadata, scripts,
headers, or the expected number of tokens.

Run IDs use the existing conservative format: 1–64 ASCII letters, digits,
hyphens, or underscores. Valid IDs are recorded in telemetry and propagated to
known local-resource pointers; they never alter a probe token.

## Scoring and interpretation

The scorer extracts standalone `AWVM-*` candidates, accepts only exact registry
matches, and reports found probes, missed probes, overall recovery, and recovery
by group. It ignores unknown AWVM-shaped strings and does not invoke an AI
model. Results are not persisted in this iteration.

If an answer contains `AWVM-HIDDEN-ATTR-001`, hidden DOM text likely survived
into that system's model-visible retrieval context for that test. If an answer
does not contain `AWVM-JSONLD-001`, that does **not** prove the crawler never
parsed JSON-LD internally. It only means the token was not exposed in the
observed model answer. A model can also receive a token and omit it despite the
prompt, so results describe observed recovery rather than internal crawler
state.

## Fetch failures

`FETCH FAILURE` is distinct from `TOKEN NOT EXPOSED`. A system that did not
request or access the page must not receive a zero-token visibility score. The
results form has an explicit fetch-failure state and produces no missed-probe
matrix for that observation.

## Server telemetry versus model observation

The server can observe the request time, route, bounded user agent, normalized
agent classification, and valid run ID. It cannot determine which tokens
reached a model. AWVM therefore combines two separate kinds of evidence:

```text
server telemetry: whether and how the HTTP resource was requested
agent-response scoring: which registry tokens appeared in the answer
```

AWVM events reuse `agent_offer_events` with source `awvm` and dedicated
`awvm_page_fetch` or `awvm_resource_fetch` event types. Agent Offers dashboard
queries filter source `agent_offers_lab`, so AWVM traffic does not alter the
advertising experiment's funnel or matrices. Apply
`migrations/002_awvm_telemetry.sql` before deploying this code.

## Relationship to AgentAds

AWVM is intended to identify a redundant set of publisher-side machine
representations capable of carrying the same sponsored commercial information
across heterogeneous retrieval stacks. It measures compatibility mechanisms;
it does not itself contain an offer or assert that token recovery equals an ad
impression.
