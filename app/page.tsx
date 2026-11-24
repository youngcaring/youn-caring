import type { Metadata } from "next";

import AboutSection from "@/components/home/AboutSection";
import ActionsSection from "@/components/home/ActionsSection";
import DonationSection from "@/components/home/DonationSection";
import HeroSection from "@/components/home/HeroSection";
import ImpactSection from "@/components/home/ImpactSection";
import NewsFeedSection from "@/components/home/NewsFeedSection";
import PaymentMethodsSection from "@/components/home/PaymentMethodsSection";
import { db } from "@/lib/db";
import NewsletterSection from "@/components/home/NewsletterSection";
import TransparencySection from "@/components/home/TransparencySection";

import { homeContent } from "@/data/home";

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  const [methods, news] = await Promise.all([
    db.paymentMethod.findMany({ where: { isActive: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }], select: { id: true, name: true, accountNumber: true, accountHolder: true, logoUrl: true, descriptionFr: true, descriptionEn: true, displayOrder: true } }),
    db.newsPost.findMany({ where: { isPublished: true }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], select: { id: true, titleFr: true, titleEn: true, descriptionFr: true, descriptionEn: true, images: true, publishedAt: true, createdAt: true } }),
  ]);
  const posts = news.map((post) => ({ ...post, publishedAt: post.publishedAt?.toISOString() ?? null, createdAt: post.createdAt.toISOString() }));
  const { sections } = homeContent;

  return (
    <div className="home-page">
      {sections.hero.enabled && <HeroSection />}

      {sections.impact.enabled && <ImpactSection />}

      {sections.about.enabled && <AboutSection />}

      {sections.latestNews.enabled && (
        <NewsFeedSection posts={posts} />
      )}

      <PaymentMethodsSection methods={methods} />

      {sections.actions.enabled && <ActionsSection />}

      {sections.donation.enabled && <DonationSection />}

      {sections.transparency.enabled && (
        <TransparencySection />
      )}

      {sections.newsletter.enabled && (
        <NewsletterSection />
      )}
    </div>
  );
}
