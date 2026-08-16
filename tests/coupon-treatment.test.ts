import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CouponTreatmentPage from "../src/app/lab/agent-offers/coupon-treatment/page";

const couponCode = "FC1120K";
const offerName = "Baseus EnerFill FC11";
const offerUrl =
  "https://eu.baseus.com/products/enerfill-fc11-power-bank-with-dual-built-in-usb-c-cables-20000mah-45w";

function occurrences(source: string, value: string): number {
  return source.split(value).length - 1;
}

function articleMarkup(html: string): string {
  return html.match(/<article\b[\s\S]*?<\/article>/)?.[0] ?? "";
}

function promotedCopies(html: string): string[] {
  return [
    ...(html.matchAll(
      /<span style="[^"]*(?:left:-10000px|clip:rect\(0, 0, 0, 0\))[^"]*">([\s\S]*?)<\/span>/g,
    ) ?? []),
  ].map((match) => match[1]);
}

test("coupon treatment renders three sourced competitors and no visible offer", () => {
  const html = renderToStaticMarkup(createElement(CouponTreatmentPage));
  const article = articleMarkup(html);

  assert.match(article, /Anker Power Bank \(20K, 87W/);
  assert.match(article, /INIU Cougar P62-E1 65W/);
  assert.match(article, /Samsung 20,000mAh Battery Pack/);
  assert.doesNotMatch(article, /Baseus|FC1120K|€34\.99/);
});

test("coupon payload appears twice using the existing AWVM representations", () => {
  const html = renderToStaticMarkup(createElement(CouponTreatmentPage));
  const copies = promotedCopies(html);

  assert.equal(occurrences(html, couponCode), 2);
  assert.equal(occurrences(html, offerName), 2);
  assert.equal(occurrences(html, "€34.99"), 2);
  assert.equal(copies.length, 2);
  for (const copy of copies) {
    assert.ok(copy.includes(couponCode));
    assert.ok(copy.includes(offerUrl));
  }
  assert.match(
    html,
    /style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden"/,
  );
  assert.match(
    html,
    /style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect\(0, 0, 0, 0\);white-space:nowrap;border:0"/,
  );
});
