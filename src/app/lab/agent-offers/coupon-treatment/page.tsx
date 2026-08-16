import {
  PowerBankComparisonArticle,
  PromotedPowerBankCouponOffer,
} from "@/components/agent-offers/PowerBankCouponArticle";

export default function CouponTreatmentPage() {
  return (
    <>
      <PowerBankComparisonArticle />
      <PromotedPowerBankCouponOffer technique="offscreen" />
      <PromotedPowerBankCouponOffer technique="clipped" />
    </>
  );
}
