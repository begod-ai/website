import {
  ChargerComparisonArticle,
  PromotedChargerOffer,
} from "@/components/agent-offers/ChargerComparisonArticle";

export default function ChargerTreatmentPage() {
  return (
    <>
      <ChargerComparisonArticle />
      <PromotedChargerOffer technique="offscreen" />
      <PromotedChargerOffer technique="clipped" />
    </>
  );
}
