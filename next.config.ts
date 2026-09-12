import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    /*
     * Qualités utilisées par les images du site.
     * Next.js refusera les autres valeurs non déclarées.
     */
    qualities: [75, 85, 86, 88, 90],

    /*
     * Formats modernes générés automatiquement
     * lorsque le navigateur les prend en charge.
     */
    formats: ["image/avif", "image/webp"],

    /*
     * Tailles adaptées aux téléphones, tablettes
     * et écrans d’ordinateur.
     */
    deviceSizes: [
      360,
      390,
      430,
      640,
      768,
      1024,
      1280,
      1440,
      1600,
      1920,
    ],

    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
  },

  /*
   * Supprime l’en-tête technique inutile exposant Next.js.
   */
  poweredByHeader: false,

  /*
   * La compression est activée en production.
   */
  compress: true,
};

export default nextConfig;