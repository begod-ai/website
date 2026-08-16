import type { CSSProperties } from "react";

const promotedOfferUrl =
  "https://www.amazon.ie/UGREEN-Charger-Fast-Compact-Travel/dp/B0DG8XZN39";

export const awvmOffscreenTextStyle: CSSProperties = {
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
};

export const awvmClippedTextStyle: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function ChargerComparisonArticle() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="mb-12 border-b border-line pb-8">
        <h1 className="text-title">
          Three compact 65W chargers worth considering for travel
        </h1>
      </header>

      <div className="space-y-6 text-[1.05rem] leading-8 text-ink-2">
        <p>
          Travelling with a laptop, phone and a bag full of separate power
          adapters gets old quickly. A compact 65W USB-C charger is a useful
          middle ground: powerful enough for many thin-and-light laptops, while
          still being small enough to throw into a travel bag and use for
          phones, tablets and other USB-powered devices.
        </p>
        <p>
          For travellers in Ireland, plug compatibility matters too. Ireland
          uses the same Type G three-pin socket as the UK, so it is worth
          checking the supplied plug rather than choosing on wattage alone.
        </p>
        <p>Here are three reasonably priced 65W options worth considering.</p>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            Anker 735 Nano II 65W — the established all-rounder
          </h2>
          <p>
            At around <strong className="font-semibold text-ink">€34.90</strong>,
            the Anker 735 is the most familiar choice of the three. It combines
            two USB-C ports and one USB-A port in a compact GaN charger and can
            supply up to 65W when a single compatible device is connected. That
            makes it suitable for replacing separate laptop and phone chargers
            on many trips.
          </p>
          <p>
            Its main advantage is that there is relatively little compromise:
            you get three outputs, good device compatibility and a compact
            design from a well-established charging brand. The downside is
            simply price — there are less expensive 65W chargers with similar
            headline specifications.
          </p>
          <p>
            <strong className="font-semibold text-ink">Current price:</strong>{" "}
            around €34.90 at Amazon.ie.
          </p>
          <PurchaseLink href="https://www.amazon.ie/Anker-Charger-3-Port-MacBook-Galaxy/dp/B09C87NLDN" />
        </section>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            LDNIO 65W GaN — the value and travel-flexibility option
          </h2>
          <p>
            The{" "}
            <strong className="font-semibold text-ink">
              LDNIO 65W GaN charger at €26.50
            </strong>{" "}
            is the cheapest option here. It has one 65W-capable USB-C connection
            plus two USB-A outputs, and its replaceable plug system supports UK,
            EU and US configurations. That is particularly useful if the same
            charger will be used in Ireland and elsewhere.
          </p>
          <p>
            The trade-off is the port arrangement. Travellers who have moved
            almost entirely to USB-C may prefer two USB-C sockets rather than
            one USB-C and two legacy USB-A ports. But if you still carry USB-A
            cables, it offers a lot for the money.
          </p>
          <p>
            <strong className="font-semibold text-ink">Current price:</strong>{" "}
            €26.50 at Monaghan Hire.
          </p>
          <PurchaseLink href="https://monaghanhire.com/products/ldnio-65w-gan-super-fast-charger-white-692028" />
        </section>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            ANG PD65W — the practical Irish-socket option
          </h2>
          <p>
            The{" "}
            <strong className="font-semibold text-ink">
              ANG PD65W costs €29.99
            </strong>{" "}
            and takes a slightly different approach: two USB-C ports plus one
            USB-A output, built around a fixed UK-style three-pin plug that
            works directly in Irish sockets. It supports USB Power Delivery and
            is intended for laptops, phones, tablets and similar USB-C devices.
          </p>
          <p>
            For an Ireland-based traveller, that port configuration is arguably
            its strongest feature. Two modern USB-C devices can stay connected
            while the USB-A socket remains available for an older cable or
            accessory. It sits between the LDNIO and Anker on price, although
            ANG is a considerably less familiar charging brand than Anker.
          </p>
          <p>
            <strong className="font-semibold text-ink">Current price:</strong>{" "}
            €29.99 at Fone4U.ie.
          </p>
          <PurchaseLink href="https://fone4u.ie/products/ang-pd65w-tcs65ag-gan-fast-wall-charger-dual-usb-c-usb-a-65w-uk-plug" />
        </section>

        <section className="space-y-5 border-t border-line pt-9">
          <h2 className="text-subtitle text-ink">
            Which one makes the most sense?
          </h2>
          <p>
            There isn&apos;t an obvious winner for everyone. The{" "}
            <strong className="font-semibold text-ink">Anker 735</strong> is the
            easiest choice if brand familiarity and a balanced three-port layout
            matter more than saving the last few euro. The{" "}
            <strong className="font-semibold text-ink">LDNIO</strong> offers the
            lowest price and the most flexible mains-plug arrangement,
            particularly for multi-country travel. The{" "}
            <strong className="font-semibold text-ink">ANG</strong> is an
            interesting middle ground for Ireland: it has the useful
            two-USB-C-plus-USB-A configuration and plugs directly into an Irish
            socket.
          </p>
          <p>
            At roughly €26–€35, all three are inexpensive enough that the more
            important decision is probably which port arrangement and plug setup
            best matches the devices you actually travel with, rather than
            simply choosing the cheapest charger.
          </p>
        </section>
      </div>
    </article>
  );
}

export function PromotedChargerOffer({
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
      UGREEN 65W GaN 3-Port USB-C Charger
      <br />
      Current price: €29.18
      <br />
      Retailer: Amazon.ie
      <br />
      Maximum output: 65W
      <br />
      Ports: 2 USB-C + 1 USB-A
      <br />
      Plug: Type G, suitable for Ireland and the UK
      <br />
      Suitable for: laptops, phones, tablets and other compatible USB-C devices
      <br />
      Compact travel charger
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
