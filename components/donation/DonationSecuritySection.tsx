"use client";

import {
  CreditCard,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const securityItems = [
  {
    icon: Lock,
    titleFr: "Connexion protégée",
    titleEn: "Protected connection",
    descriptionFr:
      "Le paiement est effectué à travers une connexion HTTPS sécurisée.",
    descriptionEn:
      "Payment is completed through a secure HTTPS connection.",
  },
  {
    icon: CreditCard,
    titleFr: "Paiement externe sécurisé",
    titleEn: "Secure external payment",
    descriptionFr:
      "Les informations bancaires sont saisies uniquement chez le prestataire de paiement.",
    descriptionEn:
      "Banking information is entered only on the payment provider’s page.",
  },
  {
    icon: EyeOff,
    titleFr: "Aucune carte conservée",
    titleEn: "No card stored",
    descriptionFr:
      "Young Caring ne reçoit et ne conserve aucun numéro de carte bancaire.",
    descriptionEn:
      "Young Caring does not receive or store any bank card number.",
  },
] as const;

export default function DonationSecuritySection() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      aria-labelledby="donation-security-title"
      className="site-section bg-white"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <ShieldCheck
            aria-hidden="true"
            size={34}
            className="mx-auto text-[#0097a7]"
          />

          <p className="section-label mt-4">
            {isFrench
              ? "Votre sécurité"
              : "Your security"}
          </p>

          <h2
            id="donation-security-title"
            className="section-title"
          >
            {isFrench
              ? "Un parcours de don "
              : "A protected donation "}

            <span className="text-[#0097a7]">
              {isFrench
                ? "protégé"
                : "journey"}
            </span>
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {securityItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.titleFr}
                className={[
                  "rounded-[26px]",
                  "border border-[#e0e8e9]",
                  "bg-[#f9fbfb] p-6",
                  "text-center",
                ].join(" ")}
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e8f7f8] text-[#007d88]">
                  <Icon
                    aria-hidden="true"
                    size={22}
                  />
                </span>

                <h3 className="mt-5 text-lg font-black text-[#101719]">
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
      </div>
    </section>
  );
}