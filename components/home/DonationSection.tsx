"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import {
  homeContent,
  homeImageMetadata,
} from "@/data/home";

export default function DonationSection() {
  const { language, t } = useLanguage();

  const locale = language === "fr" ? "fr-FR" : "en-US";

  const hasActivePaymentMethod =
    siteConfig.paymentMethods.some(
      (paymentMethod) => paymentMethod.enabled
    );

  const formatAmount = (amount: number): string => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return `0 ${siteConfig.donation.currencyLabel}`;
    }

    const formattedAmount = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(amount);

    return `${formattedAmount} ${siteConfig.donation.currencyLabel}`;
  };

  const getDonationLink = (amount?: number): string => {
    const donationPage = homeContent.links.donation;

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return donationPage;
    }

    return `${donationPage}?montant=${encodeURIComponent(
      String(Math.trunc(amount))
    )}`;
  };

  return (
    <section
      id="soutenir-young-caring"
      aria-labelledby="donation-section-title"
      className="site-section bg-white"
    >
      <div className="site-container">
        <div
          className={[
            "relative isolate overflow-hidden",
            "rounded-[28px] bg-[#091719] text-white",
            "shadow-[0_24px_65px_rgba(7,31,33,0.16)]",
            "sm:rounded-[34px]",
          ].join(" ")}
        >
          {/* Image réelle */}

          <Image
            src={homeImageMetadata.donation.src}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            aria-hidden="true"
            className="-z-30 object-cover object-center"
          />

          {/* Superposition pour la lisibilité */}

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[#091719]/82"
          />

          <div
            aria-hidden="true"
            className={[
              "absolute inset-0 -z-10",
              "bg-[linear-gradient(90deg,rgba(9,23,25,0.97)_0%,rgba(9,23,25,0.88)_48%,rgba(9,23,25,0.72)_100%)]",
            ].join(" ")}
          />

          {/* Contenu */}

          <div className="grid gap-10 px-6 py-10 sm:px-8 md:px-10 md:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 xl:px-14">
            {/* Présentation */}

            <div>
              <div className="inline-flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f36c16] text-white">
                  <Heart
                    aria-hidden="true"
                    size={17}
                    fill="currentColor"
                  />
                </span>

                <p className="text-xs font-black uppercase tracking-[0.1em] text-[#ff873f]">
                  {t("Donation.label")}
                </p>
              </div>

              <h2
                id="donation-section-title"
                className="mt-4 max-w-xl text-3xl font-black leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[2.8rem]"
              >
                {t("Donation.titleStart")}{" "}

                <span className="text-[#f36c16]">
                  {t("Donation.titleHighlight")}
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-white/75">
                {t("Donation.description")}
              </p>

              <div className="mt-6 flex items-center gap-3 text-sm text-white/72">
                <ShieldCheck
                  aria-hidden="true"
                  size={20}
                  className="shrink-0 text-[#50d0d8]"
                />

                <span>
                  {language === "fr"
                    ? "Choisissez librement le montant de votre soutien."
                    : "Choose the amount of your support freely."}
                </span>
              </div>
            </div>

            {/* Montants */}

            <div>
              <div
                role="list"
                aria-label={
                  language === "fr"
                    ? "Montants de don proposés"
                    : "Suggested donation amounts"
                }
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              >
                {homeContent.donationAmounts.map((amount) => (
                  <Link
                    key={amount}
                    role="listitem"
                    href={getDonationLink(amount)}
                    aria-label={`${t("Common.donate")} — ${formatAmount(
                      amount
                    )}`}
                    className={[
                      "inline-flex min-h-13 items-center justify-center",
                      "rounded-xl border border-white/45",
                      "bg-black/15 px-3 py-3",
                      "text-center text-sm font-extrabold text-white",
                      "backdrop-blur-sm transition-all duration-200",
                      "hover:-translate-y-0.5",
                      "hover:border-[#f36c16] hover:bg-[#f36c16]",
                      "focus-visible:border-[#f36c16]",
                    ].join(" ")}
                  >
                    {formatAmount(amount)}
                  </Link>
                ))}

                <Link
                  role="listitem"
                  href={getDonationLink()}
                  aria-label={t("Donation.customAmount")}
                  className={[
                    "inline-flex min-h-13 items-center justify-center",
                    "rounded-xl border border-white/45",
                    "bg-black/15 px-3 py-3",
                    "text-center text-sm font-extrabold text-white",
                    "backdrop-blur-sm transition-all duration-200",
                    "hover:-translate-y-0.5",
                    "hover:border-[#0097a7] hover:bg-[#0097a7]",
                  ].join(" ")}
                >
                  {t("Donation.customAmount")}
                </Link>
              </div>

              <Link
                href={getDonationLink()}
                className="button-primary group mt-4 w-full"
              >
                <Heart
                  aria-hidden="true"
                  size={18}
                  fill="currentColor"
                />

                <span>{t("Donation.donateNow")}</span>

                <ArrowRight
                  aria-hidden="true"
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              {hasActivePaymentMethod && (
                <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-white/65">
                  <LockKeyhole
                    aria-hidden="true"
                    size={14}
                    className="text-[#50d0d8]"
                  />

                  <span>{t("Donation.securePayment")}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}