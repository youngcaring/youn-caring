"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Heart,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { donationPageImages } from "@/data/donation";

export default function DonationHero() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      aria-labelledby="donation-hero-title"
      className="relative isolate overflow-hidden bg-[#091719] text-white"
    >
      <Image
        src={donationPageImages.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-10",
          "bg-[linear-gradient(90deg,rgba(4,19,21,0.97)_0%,rgba(4,19,21,0.82)_52%,rgba(4,19,21,0.36)_100%)]",
        ].join(" ")}
      />

      <div
        className={[
          "site-container",
          "flex min-h-[540px] items-end",
          "pb-14 pt-28",
          "md:min-h-[620px]",
          "md:items-center md:py-24",
        ].join(" ")}
      >
        <div className="max-w-3xl">
          <p className="section-label !text-[#f36c16]">
            {isFrench
              ? "Soutenez nos actions"
              : "Support our actions"}
          </p>

          <h1
            id="donation-hero-title"
            className={[
              "mt-4 text-[clamp(2.8rem,7vw,5.5rem)]",
              "font-black leading-[0.96]",
              "tracking-[-0.05em]",
            ].join(" ")}
          >
            {isFrench
              ? "Votre générosité nous permet d’agir"
              : "Your generosity helps us take action"}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            {isFrench
              ? "Chaque contribution aide Young Caring à préparer et poursuivre des actions concrètes auprès des enfants, des familles et des communautés."
              : "Every contribution helps Young Caring prepare and continue concrete actions alongside children, families and communities."}
          </p>

          <Link
            href="#formulaire-don"
            className="button-primary mt-8"
          >
            <Heart
              aria-hidden="true"
              size={18}
              fill="currentColor"
            />

            {isFrench
              ? "Faire un don"
              : "Make a donation"}

            <ArrowDown
              aria-hidden="true"
              size={18}
            />
          </Link>

          <div className="mt-8 flex max-w-xl items-start gap-3 text-sm leading-6 text-white/75">
            <ShieldCheck
              aria-hidden="true"
              size={TapeSize}
              className="mt-0.5 shrink-0 text-[#42d1dc]"
            />

            <p>
              {isFrench
                ? "Vous serez redirigé vers une page de paiement sécurisée. Young Caring ne conserve aucune donnée bancaire."
                : "You will be redirected to a secure payment page. Young Caring does not store banking information."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const TapeSize = 20;