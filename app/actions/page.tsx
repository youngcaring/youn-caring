import type { Metadata } from "next";

import ActionsDonationBanner from "@/components/actions/ActionsDonationBanner";
import ActionsGrid from "@/components/actions/ActionsGrid";
import ActionsHero from "@/components/actions/ActionsHero";
import ActionsStatistics from "@/components/actions/ActionsStatistics";
import { actionsPageContent } from "@/data/actions";

export const metadata: Metadata = {
  title: "Nos actions | Young Caring",
  description:
    "Découvrez les actions officiellement publiées par Young Caring auprès des enfants, des familles et des communautés.",
  alternates: {
    canonical: "/actions",
  },
  openGraph: {
    title: "Nos actions | Young Caring",
    description:
      "Découvrez les actions officiellement publiées par Young Caring.",
    type: "website",
    images: [
      {
        url: actionsPageContent.images.heroDesktop,
        width: 1920,
        height: 720,
        alt: "Bénéficiaires et bénévoles réunis pendant une action de Young Caring",
      },
    ],
  },
};

export default function ActionsPage() {
  const { sections } = actionsPageContent;

  return (
    <>
      {sections.hero.enabled && <ActionsHero />}

      {sections.statistics.enabled && (
        <ActionsStatistics />
      )}

      {sections.categories.enabled &&
        sections.actionsGrid.enabled && (
          <ActionsGrid />
        )}

      {sections.donationBanner.enabled && (
        <ActionsDonationBanner />
      )}
    </>
  );
}