import type { Metadata } from "next";

import ContactCallToAction from "@/components/contact/ContactCallToAction";
import ContactForm from "@/components/contact/ContactForm";
import ContactHero from "@/components/contact/ContactHero";
import ContactLocation from "@/components/contact/ContactLocation";
import ContactMethods from "@/components/contact/ContactMethods";
import ContactSocialNetworks from "@/components/contact/ContactSocialNetworks";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.organization.name}`,
  description:
    "Contactez Young Caring par téléphone, WhatsApp ou email. Retrouvez également notre adresse et nos réseaux sociaux officiels.",

  alternates: {
    canonical: siteConfig.navigation.contact,
  },

  openGraph: {
    title: `Contact | ${siteConfig.organization.name}`,
    description:
      "Contactez Young Caring et découvrez les différents moyens de joindre notre équipe.",
    type: "website",
    images: [
      {
        url: "/images/actions/actions-hero-desktop.jpg",
        alt: "Contacter Young Caring",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `Contact | ${siteConfig.organization.name}`,
    description:
      "Téléphone, WhatsApp, email, adresse et réseaux sociaux officiels de Young Caring.",
    images: [
      "/images/actions/actions-hero-desktop.jpg",
    ],
  },
};

export default function ContactPage() {
  return (
    <main id="main-content">
      <ContactHero />
      <ContactMethods />
      <ContactForm />
      <ContactSocialNetworks />
      <ContactLocation />
      <ContactCallToAction />
    </main>
  );
}