"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Apple,
  ArrowRight,
  BookOpen,
  Droplets,
  HeartPulse,
  PackageOpen,
  Users,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const donationUses = [
  {
    titleFr: "Éducation",
    titleEn: "Education",
    descriptionFr:
      "Soutien aux activités éducatives et aux besoins scolaires des enfants.",
    descriptionEn:
      "Support for educational activities and children’s school needs.",
    icon: BookOpen,
  },
  {
    titleFr: "Aide alimentaire",
    titleEn: "Food support",
    descriptionFr:
      "Préparation et distribution de vivres aux personnes accompagnées.",
    descriptionEn:
      "Preparation and distribution of food to supported people.",
    icon: Apple,
  },
  {
    titleFr: "Santé",
    titleEn: "Health",
    descriptionFr:
      "Soutien aux initiatives liées à la santé et au bien-être.",
    descriptionEn:
      "Support for health and well-being initiatives.",
    icon: HeartPulse,
  },
  {
    titleFr: "Enfance",
    titleEn: "Children",
    descriptionFr:
      "Accompagnement, écoute et activités destinées aux enfants.",
    descriptionEn:
      "Support, listening and activities intended for children.",
    icon: Users,
  },
  {
    titleFr: "Vêtements et kits",
    titleEn: "Clothing and kits",
    descriptionFr:
      "Collecte et remise de vêtements, kits et produits essentiels.",
    descriptionEn:
      "Collection and distribution of clothing, kits and essential supplies.",
    icon: PackageOpen,
  },
  {
    titleFr: "Eau et hygiène",
    titleEn: "Water and hygiene",
    descriptionFr:
      "Actions favorisant l’accès à l’eau et aux produits d’hygiène.",
    descriptionEn:
      "Initiatives supporting access to water and hygiene products.",
    icon: Droplets,
  },
  {
    titleFr: "Urgences",
    titleEn: "Emergencies",
    descriptionFr:
      "Mobilisation selon les besoins urgents identifiés sur le terrain.",
    descriptionEn:
      "Mobilisation according to urgent needs identified in the field.",
    icon: AlertTriangle,
  },
] as const;

export default function DonationUseSection() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      id="utilisation-des-dons"
      aria-labelledby="donation-use-title"
      className="site-section scroll-mt-32 bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {isFrench
              ? "Une contribution utile"
              : "A useful contribution"}
          </p>

          <h2
            id="donation-use-title"
            className="section-title"
          >
            {isFrench
              ? "Les domaines soutenus par "
              : "Areas supported by "}

            <span className="text-[#0097a7]">
              {isFrench
                ? "votre générosité"
                : "your generosity"}
            </span>
          </h2>

          <p className="section-description">
            {isFrench
              ? "Les contributions permettent à Young Caring de préparer et d’accompagner des actions concrètes selon les besoins observés."
              : "Contributions help Young Caring prepare and support concrete actions according to identified needs."}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {donationUses.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.titleFr}
                className={[
                  "rounded-[26px] border",
                  "border-[#e0e8e9]",
                  "bg-white p-6",
                  "shadow-[0_12px_35px_rgba(7,31,33,0.06)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-12 w-12",
                    "place-items-center rounded-2xl",
                    "bg-[#e8f7f8]",
                    "text-[#007d88]",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    size={23}
                  />
                </span>

                <h3 className="mt-5 text-xl font-black text-[#101719]">
                  {isFrench
                    ? item.titleFr
                    : item.titleEn}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#5f6d70]">
                  {isFrench
                    ? item.descriptionFr
                    : item.descriptionEn}
                </p>
              </article>
            );
          })}
        </div>

        <Link
          href="/actions"
          className="button-secondary mt-9"
        >
          {isFrench
            ? "Découvrir nos actions"
            : "Discover our actions"}

          <ArrowRight
            aria-hidden="true"
            size={18}
          />
        </Link>
      </div>
    </section>
  );
}