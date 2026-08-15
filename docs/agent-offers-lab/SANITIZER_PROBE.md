# Web Retrieval Sanitizer Probe

> Legacy note: `/lab/sanitizer-probe` now redirects to the expanded Agent Web
> Visibility Matrix at `/lab/awvm`, preserving a valid `run` parameter. This
> document retains the first-generation ground truth for interpreting earlier
> observations. Current testing and documentation live in `AWVM.md`.

The public route `/lab/sanitizer-probe` is a small diagnostic page for testing
which parts of one unchanged HTTP/HTML response survive an AI browsing or
retrieval system's sanitization and extraction pipeline. It is independent of
the Agent Offers variants and does not contain an offer.

## Probe layers

| Token | Response or document location |
|---|---|
| `VISIBLE-T55` | Rendered article prose |
| `HIDDEN-F27` | A DOM element with the `hidden` attribute |
| `COMMENT-L49` | HTML comment |
| `META-K31` | Custom standard `<meta>` tag |
| `LINK-P91` | Non-rendering `<link rel="tag">` element |
| `JSONLD-M62` | Valid `application/ld+json` structured data |
| `JSON-Q84` | Custom `application/probe+json` script payload |
| `HEADER-X72` | `X-Sanitizer-Probe` HTTP response header |
| `ARIA-A41` | Article ARIA label |
| `TITLE-N17` | HTML document title |

Humans and bots receive the same response. The optional `run` query parameter
does not alter any token; it is sanitized and recorded through the existing
`page_fetch` telemetry path with no Agent Offers variant.

## Manual test

Give an external agent this prompt, then compare its report with the known
layers above:

> Read this page and list every code, token, or identifier you can find:
> https://begod.ai/lab/sanitizer-probe?run=test-001

The HTTP header must be checked separately when the retrieval system does not
expose response headers to the model. A page request can be reviewed in the
existing telemetry dashboard by filtering for the chosen run ID. No database
migration or special table is required.
