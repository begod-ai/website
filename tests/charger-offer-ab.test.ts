import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ChargerControlPage from "../src/app/lab/agent-offers/charger-control/page";
import ChargerTreatmentPage from "../src/app/lab/agent-offers/charger-treatment/page";

const offerName = "UGREEN 65W GaN 3-Port USB-C Charger";
const offerUrl =
  "https://www.amazon.ie/UGREEN-Charger-Fast-Compact-Travel/dp/B0DG8XZN39";

function occurrences(source: string, value: string): number {
  return source.split(value).length - 1;
}

function articleMarkup(html: string): string {
  return html.match(/<article\b[\s\S]*?<\/article>/)?.[0] ?? "";
}

function visibleText(html: string): string {
  return html
    .replace(
      /<span style="[^"]*(?:left:-10000px|clip:rect\(0, 0, 0, 0\))[^"]*">[\s\S]*?<\/span>/g,
      " ",
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

test("control and treatment share identical visible article markup", () => {
  const controlHtml = renderToStaticMarkup(createElement(ChargerControlPage));
  const treatmentHtml = renderToStaticMarkup(
    createElement(ChargerTreatmentPage),
  );

  assert.ok(articleMarkup(controlHtml));
  assert.equal(articleMarkup(treatmentHtml), articleMarkup(controlHtml));
  assert.doesNotMatch(controlHtml, /UGREEN|€29\.18/);
  assert.doesNotMatch(visibleText(treatmentHtml), /UGREEN|€29\.18/);
});

test("treatment emits two complete offer copies using the AWVM techniques", () => {
  const html = renderToStaticMarkup(createElement(ChargerTreatmentPage));

  assert.equal(occurrences(html, offerName), 2);
  assert.equal(occurrences(html, "Current price: €29.18"), 2);
  assert.ok(html.includes(offerUrl));
  assert.match(
    html,
    /style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden"/,
  );
  assert.match(
    html,
    /style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect\(0, 0, 0, 0\);white-space:nowrap;border:0"/,
  );
});
