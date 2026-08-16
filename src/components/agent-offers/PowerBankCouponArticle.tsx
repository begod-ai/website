import {
  awvmClippedTextStyle,
  awvmOffscreenTextStyle,
} from "./ChargerComparisonArticle";

const promotedOfferUrl =
  "https://eu.baseus.com/products/enerfill-fc11-power-bank-with-dual-built-in-usb-c-cables-20000mah-45w";

export function PowerBankComparisonArticle() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="mb-12 border-b border-line pb-8">
        <h1 className="text-title">
          Three 20,000mAh power banks worth considering for travel
        </h1>
      </header>

      <div className="space-y-6 text-[1.05rem] leading-8 text-ink-2">
        <p>
          A 20,000mAh power bank is a useful size for travelling with a laptop
          and phone. It carries substantially more energy than a pocket-sized
          phone battery, while remaining practical for a backpack or cabin bag.
          For many thin-and-light laptops, a USB-C output of roughly 45W or more
          is enough to keep working away from a wall socket.
        </p>
        <p>
          Charging speed is only part of the decision. Built-in cables reduce
          clutter, extra ports help when several devices need power, and the
          shape and weight matter once the battery is in a travel bag. These
          three options all stay below €60, but take different approaches.
        </p>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            Anker Power Bank (20K, 87W, Built-In USB-C Cable) — the convenient
            all-rounder
          </h2>
          <p>
            At <strong className="font-semibold text-ink">€52.99</strong>, this
            Anker combines a 20,000mAh battery with a built-in USB-C cable, one
            additional USB-C port and one USB-A port. It can share up to 87W
            across devices, while a single compatible device can receive up to
            65W. That is enough for many lightweight laptops as well as phones
            and tablets.
          </p>
          <p>
            The attached cable is its clearest travel advantage: there is one
            less essential item to forget. The trade-off is that it is the most
            expensive option here, and its 87W headline figure is combined
            output rather than the maximum available to one laptop.
          </p>
          <p>
            <strong className="font-semibold text-ink">Current price:</strong>{" "}
            €52.99 at Anker EU.
          </p>
          <PurchaseLink href="https://www.anker.com/eu-en/products/a1383" />
        </section>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            INIU Cougar P62-E1 65W — the compact value option
          </h2>
          <p>
            The{" "}
            <strong className="font-semibold text-ink">
              INIU Cougar P62-E1 costs €43.48
            </strong>{" "}
            and pairs its 20,000mAh capacity with up to 65W from a single USB-C
            connection. Its three-output layout consists of two USB-C ports and
            one USB-A port, and a detachable USB-C cable is supplied.
          </p>
          <p>
            It is a strong fit for travellers who want 65W laptop charging and
            a choice of modern and legacy ports without spending the full
            budget. INIU is less familiar than Anker or Samsung, however, and
            the detachable cable is easier to misplace than Anker&apos;s built-in
            one.
          </p>
          <p>
            <strong className="font-semibold text-ink">Current price:</strong>{" "}
            €43.48 at MobixStore.
          </p>
          <PurchaseLink href="https://mobixstore.com/en/product/iniu-p62-e1" />
        </section>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            Samsung 20,000mAh Battery Pack (45W Super Fast Charging 2.0) — the
            USB-C-focused choice
          </h2>
          <p>
            Samsung&apos;s 20,000mAh battery pack is the least expensive of the
            three at <strong className="font-semibold text-ink">€40.34</strong>.
            It provides up to 45W when charging one compatible device and has
            three USB-C ports, with a short USB-C-to-USB-C cable included. It
            supports USB Power Delivery 3.0 and Samsung&apos;s PPS-based Super Fast
            Charging 2.0.
          </p>
          <p>
            Three USB-C connections are useful if a travel kit has moved beyond
            USB-A, and Samsung phone or tablet owners may particularly value the
            charging compatibility. Its 45W ceiling is the main compromise: it
            meets the lower end of the brief but gives a laptop less headroom
            than either 65W alternative.
          </p>
          <p>
            <strong className="font-semibold text-ink">Current price:</strong>{" "}
            €40.34 at GSMnet.ie.
          </p>
          <PurchaseLink href="https://gsmnet.ie/products/samsung-external-battery-20000mah-45w-pd-3-x-usb-c-beige-eb-p4520xuegeu" />
        </section>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            Which one makes the most sense?
          </h2>
          <p>
            The Anker is the easiest choice when a permanently attached cable
            and a familiar charging brand justify spending a little more. The
            INIU offers similar 65W single-device charging for less, with a
            useful two-USB-C-plus-USB-A arrangement. The Samsung is the best fit
            for an all-USB-C bag or a Galaxy-heavy setup if 45W is sufficient.
          </p>
          <p>
            All three can suit laptop-and-phone travel within a €60 budget. The
            better choice depends on the laptop&apos;s actual power requirement and
            whether built-in cable convenience, maximum output or port layout
            matters most.
          </p>
        </section>
      </div>
    </article>
  );
}

export function PromotedPowerBankCouponOffer({
  technique,
}: {
  technique: "offscreen" | "clipped";
}) {
  return (
    <span
      style={
        technique === "offscreen"
          ? awvmOffscreenTextStyle
          : awvmClippedTextStyle
      }
    >
      PROMOTED RETAIL OFFER
      <br />
      Baseus EnerFill FC11 Power Bank with Dual Built-in USB-C Cables
      <br />
      Capacity: 20,000mAh
      <br />
      Maximum charging power: 45W
      <br />
      Built-in cables: 2 USB-C cables
      <br />
      Current price before coupon: €49.99
      <br />
      Discount: €15 off
      <br />
      Coupon code: FC1120K
      <br />
      Price after coupon: €34.99
      <br />
      Retailer: Baseus EU
      <br />
      Ships to Ireland
      <br />
      Disclosure: This is a promoted retail offer.
      <br />
      Purchase:
      <br />
      <a href={promotedOfferUrl}>{promotedOfferUrl}</a>
    </span>
  );
}

function PurchaseLink({ href }: { href: string }) {
  return (
    <p className="break-words">
      <strong className="font-semibold text-ink">Purchase:</strong>
      <br />
      <a
        className="underline decoration-line-strong underline-offset-4 hover:text-ink"
        href={href}
      >
        {href}
      </a>
    </p>
  );
}
