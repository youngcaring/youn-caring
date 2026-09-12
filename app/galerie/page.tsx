import type { Metadata } from "next";

import GalleryCallToAction from "@/components/gallery/GalleryCallToAction";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryHero from "@/components/gallery/GalleryHero";
import { siteConfig } from "@/config/site";
import {
  galleryImages,
  getPublishedGalleryItems,
} from "@/data/gallery";

export const metadata: Metadata = {
  title: `Galerie | ${siteConfig.organization.name}`,

  description:
    "Découvrez en images les actions de Young Caring auprès des enfants, des familles et des communautés.",

  alternates: {
    canonical: siteConfig.navigation.gallery,
  },

  openGraph: {
    title: `Galerie | ${siteConfig.organization.name}`,
    description:
      "Découvrez les actions, les rencontres et les moments de solidarité de Young Caring en images.",
    type: "website",
    images: [
      {
        url: galleryImages.heroDesktop,
        alt: "Galerie des actions de Young Caring",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `Galerie | ${siteConfig.organization.name}`,
    description:
      "Découvrez les actions de Young Caring en images.",
    images: [galleryImages.heroDesktop],
  },
};

export default function GalleryPage() {
  const publishedItems =
    getPublishedGalleryItems();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `Galerie | ${siteConfig.organization.name}`,
    description:
      "Photographies des actions et des activités de Young Caring.",
    numberOfItems: publishedItems.length,
    image: publishedItems.map((item) => ({
      "@type": "ImageObject",
      contentUrl: item.image,
      name: item.titleFr,
      caption: item.descriptionFr,
    })),
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

      <GalleryHero />
      <GalleryGrid />
      <GalleryCallToAction />
    </main>
  );
}