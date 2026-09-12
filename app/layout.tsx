import type {
  Metadata,
  Viewport,
} from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import "./globals.css";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PwaInstallButton from "@/components/pwa/PwaInstallButton";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import LanguageProvider from "@/components/providers/LanguageProvider";

/*
 * Adresse publique utilisée pour les métadonnées,
 * les aperçus sociaux et les liens absolus.
 */
const DEFAULT_SITE_URL =
  "http://localhost:3000";

function getSiteUrl(): URL {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    return new URL(DEFAULT_SITE_URL);
  }

  try {
    return new URL(configuredUrl);
  } catch {
    /*
     * Une mauvaise valeur dans le fichier d’environnement
     * ne doit pas empêcher la compilation du projet.
     */
    return new URL(DEFAULT_SITE_URL);
  }
}

const siteUrl = getSiteUrl();

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: [
    "Arial",
    "Helvetica",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,

  title: {
    default:
      "Young Caring | Ensemble, redonnons de l’espoir",
    template: "%s | Young Caring",
  },

  description:
    "Young Caring agit pour améliorer durablement la vie des enfants, des jeunes et des familles vulnérables à travers des actions concrètes et transparentes.",

  applicationName: "Young Caring",

  authors: [
    {
      name: "Young Caring",
      url: siteUrl,
    },
  ],

  creator: "Young Caring",
  publisher: "Young Caring",

  category: "Organisation humanitaire",

  keywords: [
    "Young Caring",
    "ONG",
    "ONG au Bénin",
    "organisation humanitaire",
    "association humanitaire",
    "solidarité",
    "aide aux enfants",
    "aide aux jeunes",
    "aide aux familles",
    "éducation",
    "santé",
    "aide alimentaire",
    "actions humanitaires",
    "dons",
    "bénévolat",
    "Cotonou",
    "Bénin",
  ],

  /*
   * Fichier généré automatiquement par app/manifest.ts.
   */
  manifest: "/manifest.webmanifest",

  robots: {
    index: true,
    follow: true,
    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: "/",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    siteName: "Young Caring",

    title:
      "Young Caring | Ensemble, redonnons de l’espoir",

    description:
      "Découvrez les actions humanitaires de Young Caring et contribuez à des initiatives concrètes, solidaires et transparentes.",

    images: [
      {
        url: "/images/home/hero-desktop.jpg",
        width: 1920,
        height: 1080,
        alt: "Young Caring — Ensemble, redonnons de l’espoir",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Young Caring | Ensemble, redonnons de l’espoir",

    description:
      "Découvrez les actions humanitaires de Young Caring et soutenez nos initiatives solidaires.",

    images: [
      {
        url: "/images/home/hero-desktop.jpg",
        alt: "Young Caring — Ensemble, redonnons de l’espoir",
      },
    ],
  },

  /*
   * L’icône unique fournie dans public/logo/icon.png
   * est utilisée par le navigateur et les appareils Apple.
   */
  icons: {
  icon: [
    {
      url: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      url: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],

  shortcut: [
    {
      url: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
  ],

  apple: [
    {
      url: "/icons/icon-180.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
},

  appleWebApp: {
    capable: true,
    title: "Young Caring",
    statusBarStyle: "default",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: "cover",

  themeColor: [
    {
      media:
        "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media:
        "(prefers-color-scheme: dark)",
      color: "#091719",
    },
  ],

  colorScheme: "light",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
    >
      <body
        className={[
          inter.variable,
          "min-h-screen",
          "bg-white text-[#101719]",
          "antialiased",
        ].join(" ")}
      >
        <LanguageProvider>
          {/*
           * Enregistre le service worker en production.
           * Ce composant ne produit aucun élément visible.
           */}
          <ServiceWorkerRegistration />

          <a
            className="skip-link"
            href="#main-content"
          >
            Aller au contenu principal
          </a>

          <Header />

          <main
            id="main-content"
            className="site-main"
          >
            {children}
          </main>

          <Footer />

          <MobileBottomNav />

          {/*
           * Bouton d’installation Android, ordinateur
           * et instructions spécifiques pour iPhone.
           */}
          <PwaInstallButton />
        </LanguageProvider>
      </body>
    </html>
  );
}