import type { Metadata } from "next";

import DonationMethodsSection from "@/components/transparency/DonationMethodsSection";
import DonationUseSection from "@/components/transparency/DonationUseSection";
import LegalIdentitySection from "@/components/transparency/LegalIdentitySection";
import TransparencyCallToAction from "@/components/transparency/TransparencyCallToAction";
import TransparencyCommitments from "@/components/transparency/TransparencyCommitments";
import TransparencyFaq from "@/components/transparency/TransparencyFaq";
import TransparencyHero from "@/components/transparency/TransparencyHero";
import TransparencyQuickLinks from "@/components/transparency/TransparencyQuickLinks";

export const metadata: Metadata = {
  title: "Dons & transparence",

  description:
    "Découvrez les engagements de Young Caring, ses domaines d’intervention et les différentes manières de soutenir ses actions.",

  alternates: {
    canonical: "/transparence",
  },

  openGraph: {
    type: "website",
    url: "/transparence",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    siteName: "Young Caring",

    title:
      "Dons & transparence | Young Caring",

    description:
      "Young Caring présente ses engagements, ses domaines d’intervention et les différentes manières de soutenir ses actions.",

    images: [
      {
        url: "/images/home/donation-background.jpg",
        alt: "Young Caring — Dons et transparence",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Dons & transparence | Young Caring",

    description:
      "Découvrez les engagements de Young Caring et les différentes manières de soutenir ses actions.",

    images: [
      {
        url: "/images/home/donation-background.jpg",
        alt: "Young Caring — Dons et transparence",
      },
    ],
  },
};

export default function TransparencyPage() {
  return (
    <>
      {/*
       * Présentation générale et accès
       * à la section de soutien.
       */}
      <TransparencyHero />

      {/*
       * Navigation interne vers les sections
       * réellement présentes sur cette page.
       */}
      <TransparencyQuickLinks />

      {/*
       * Présentation des domaines dans lesquels
       * Young Caring intervient.
       */}
      <DonationUseSection />

      {/*
       * Engagements publics concernant
       * la communication et la transparence.
       */}
      <TransparencyCommitments />

      {/*
       * Présentation générale de l’organisation.
       *
       * Ce composant ne doit afficher aucun document,
       * numéro administratif, signature, cachet,
       * information bancaire ou donnée personnelle.
       */}
      <LegalIdentitySection />

      {/*
       * Dons, bénévolat, partenariats
       * et moyens de contact.
       */}
      <DonationMethodsSection />

      {/*
       * Réponses aux principales questions.
       */}
      <TransparencyFaq />

      {/*
       * Appel à l’action final.
       */}
      <TransparencyCallToAction />
    </>
  );
}