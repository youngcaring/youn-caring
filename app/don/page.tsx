import type { Metadata } from "next";

import DonationCallToAction from "@/components/donation/DonationCallToAction";
import DonationFaq from "@/components/donation/DonationFaq";
import DonationForm from "@/components/donation/DonationForm";
import DonationHero from "@/components/donation/DonationHero";
import DonationSecuritySection from "@/components/donation/DonationSecuritySection";

export const metadata: Metadata = {
  title: "Faire un don",

  description:
    "Soutenez les actions de Young Caring auprès des enfants, des familles et des communautés à travers un parcours de don sécurisé.",

  alternates: {
    canonical: "/don",
  },

  openGraph: {
    type: "website",
    url: "/don",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    siteName: "Young Caring",

    title:
      "Faire un don | Young Caring",

    description:
      "Votre contribution aide Young Caring à préparer et poursuivre des actions concrètes.",

    images: [
      {
        url: "/images/home/donation-background.jpg",
        alt: "Soutenir les actions de Young Caring",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Faire un don | Young Caring",

    description:
      "Soutenez les actions de Young Caring auprès des enfants, des familles et des communautés.",

    images: [
      {
        url: "/images/home/donation-background.jpg",
        alt: "Soutenir les actions de Young Caring",
      },
    ],
  },
};

export default function DonationPage() {
  return (
    <>
      <DonationHero />

      <DonationForm />

      <DonationSecuritySection />

      <DonationFaq />

      <DonationCallToAction />
    </>
  );
}