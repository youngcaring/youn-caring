import type { Metadata } from "next";

import FeaturedNews from "@/components/news/FeaturedNews";
import NewsGrid from "@/components/news/NewsGrid";
import NewsHero from "@/components/news/NewsHero";
import NewsletterSection from "@/components/home/NewsletterSection";

export const metadata: Metadata = {
  title: "Actualités | Young Caring",
  description:
    "Découvrez les actualités, les actions de terrain et l’engagement des bénévoles de Young Caring.",
  alternates: {
    canonical: "/actualites",
  },
  openGraph: {
    title: "Actualités | Young Caring",
    description:
      "Découvrez les actualités et les actions de terrain de Young Caring.",
    type: "website",
    images: [
      {
        url: "/images/actions/actions-hero-desktop.jpg",
        alt: "Les actions de terrain de Young Caring",
      },
    ],
  },
};

export default function NewsPage() {
  return (
    <main id="main-content">
      <NewsHero />
      <FeaturedNews />
      <NewsGrid />
      <NewsletterSection />
    </main>
  );
}