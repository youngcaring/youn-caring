import type { Metadata } from "next";

import AboutSection from "@/components/home/AboutSection";
import ActionsSection from "@/components/home/ActionsSection";
import DonationSection from "@/components/home/DonationSection";
import HeroSection from "@/components/home/HeroSection";
import ImpactSection from "@/components/home/ImpactSection";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import TransparencySection from "@/components/home/TransparencySection";

import { homeContent } from "@/data/home";

/*
 * La page utilise uniquement des données locales publiques.
 * Elle peut donc être générée statiquement pour améliorer :
 *
 * - la rapidité ;
 * - le référencement ;
 * - la stabilité ;
 * - la sécurité.
 */

export const dynamic = "force-static";

/*
 * Métadonnées propres à la page d’accueil.
 * Les métadonnées générales restent dans app/layout.tsx.
 */

export const metadata: Metadata = {
  title: "Young Caring | Ensemble, redonnons de l’espoir",

  description:
    "Découvrez les actions humanitaires de Young Caring en faveur des enfants, des jeunes, des familles et des communautés vulnérables.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    siteName: "Young Caring",
    title: "Young Caring | Ensemble, redonnons de l’espoir",
    description:
      "Découvrez les actions humanitaires de Young Caring et soutenez des initiatives concrètes et transparentes.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Young Caring | Ensemble, redonnons de l’espoir",
    description:
      "Découvrez les actions humanitaires de Young Caring et soutenez nos initiatives.",
  },
};

export default function HomePage() {
  const { sections } = homeContent;

  return (
    <>
      {sections.hero.enabled && <HeroSection />}

      {sections.impact.enabled && <ImpactSection />}

      {sections.about.enabled && <AboutSection />}

      {sections.actions.enabled && <ActionsSection />}

      {sections.donation.enabled && <DonationSection />}

      {sections.latestNews.enabled && (
        <LatestNewsSection />
      )}

      {sections.transparency.enabled && (
        <TransparencySection />
      )}

      {sections.newsletter.enabled && (
        <NewsletterSection />
      )}
    </>
  );
}