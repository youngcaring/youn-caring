import type { Metadata } from "next";

import AboutCallToAction from "@/components/about/AboutCallToAction";
import AboutHero from "@/components/about/AboutHero";
import AboutIntroduction from "@/components/about/AboutIntroduction";
import BeneficiariesSection from "@/components/about/BeneficiariesSection";
import GovernanceSection from "@/components/about/GovernanceSection";
import LegalIdentitySection from "@/components/about/LegalIdentitySection";
import MissionVisionSection from "@/components/about/MissionVisionSection";
import ObjectivesSection from "@/components/about/ObjectivesSection";
import ValuesSection from "@/components/about/ValuesSection";
import { siteConfig } from "@/config/site";
import {
  aboutImages,
  aboutLegalIdentity,
} from "@/data/about";

export const metadata: Metadata = {
  title: `À propos | ${siteConfig.organization.name}`,

  description:
    "Découvrez Young Caring / Jeune Bienveillant, sa mission, ses objectifs, ses valeurs, ses bénéficiaires et sa gouvernance.",

  alternates: {
    canonical: siteConfig.navigation.about,
  },

  openGraph: {
    title: `À propos | ${siteConfig.organization.name}`,
    description:
      "Young Caring agit en faveur des enfants, des veuves vulnérables, des familles et des communautés au Bénin.",
    type: "website",
    images: [
      {
        url: aboutImages.heroDesktop,
        alt: "Présentation de Young Caring",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `À propos | ${siteConfig.organization.name}`,
    description:
      "Découvrez la mission, les objectifs et les valeurs de Young Caring / Jeune Bienveillant.",
    images: [aboutImages.heroDesktop],
  },
};

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: siteConfig.organization.name,
    alternateName: `${aboutLegalIdentity.frenchName} (${aboutLegalIdentity.abbreviation})`,
    description:
      "Organisation béninoise engagée auprès des enfants, des veuves vulnérables, des familles et des communautés.",
    logo: siteConfig.organization.logo,
    email: siteConfig.contact.email.display,
    telephone:
      siteConfig.contact.phone.international,
    address: {
      "@type": "PostalAddress",
      addressLocality:
        aboutLegalIdentity.municipality,
      addressRegion: "Littoral",
      addressCountry: "BJ",
    },
    sameAs: siteConfig.socialLinks
      .filter(
        (
          socialLink
        ): socialLink is typeof socialLink & {
          url: string;
        } =>
          socialLink.enabled &&
          typeof socialLink.url === "string" &&
          socialLink.url.startsWith("https://")
      )
      .map((socialLink) => socialLink.url),
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      <AboutHero />
      <AboutIntroduction />
      <MissionVisionSection />
      <BeneficiariesSection />
      <ObjectivesSection />
      <ValuesSection />
      <GovernanceSection />
      <LegalIdentitySection />
      <AboutCallToAction />
    </main>
  );
}