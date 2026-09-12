import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",

    name: "Young Caring",

    short_name: "Young Caring",

    description:
      "Young Caring agit pour améliorer durablement la vie des enfants, des jeunes et des familles vulnérables.",

    start_url: "/",

    scope: "/",

    display: "standalone",

    orientation: "portrait-primary",

    background_color: "#ffffff",

    theme_color: "#0097a7",

    lang: "fr",

    dir: "ltr",

    categories: [
      "social",
      "education",
      "lifestyle",
    ],

    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    shortcuts: [
      {
        name: "Nos actions",
        short_name: "Actions",
        url: "/actions",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Actualités",
        short_name: "Actualités",
        url: "/actualites",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Contact",
        short_name: "Contact",
        url: "/contact",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}