"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import { actionsPageImages } from "@/data/actions";

export default function ActionsDonationBanner() {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="actions-donation-title"
      className="bg-white px-4 py-8 sm:px-0 sm:py-12"
    >
      <div className="site-container">
        <div
          className={[
            "relative isolate overflow-hidden",
            "rounded-[28px] bg-[#092124]",
            "px-6 py-9 text-white",
            "shadow-[0_20px_50px_rgba(7,31,33,0.16)]",
            "sm:rounded-[32px] sm:px-9",
            "md:flex md:min-h-[190px]",
            "md:items-center md:justify-between",
            "md:gap-10 md:px-12 md:py-10",
          ].join(" ")}
        >
          <Image
            src={actionsPageImages.donationBanner}
            alt=""
            fill
            quality={85}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="-z-20 object-cover object-center"
          />

          <div
            aria-hidden="true"
            className={[
              "absolute inset-0 -z-10",
              "bg-[linear-gradient(90deg,rgba(3,26,29,0.96)_0%,rgba(3,49,53,0.86)_58%,rgba(0,151,167,0.62)_100%)]",
            ].join(" ")}
          />

          <div className="max-w-2xl">
            <p
              className={[
                "text-xs font-black uppercase",
                "tracking-[0.1em] text-[#f36c16]",
              ].join(" ")}
            >
              {t("ActionsPage.donation.label")}
            </p>

            <h2
              id="actions-donation-title"
              className={[
                "mt-2 text-2xl font-black",
                "leading-tight tracking-[-0.03em]",
                "sm:text-3xl",
              ].join(" ")}
            >
              {t("ActionsPage.donation.titleStart")}{" "}
              <span className="text-[#f36c16]">
                {t(
                  "ActionsPage.donation.titleHighlight"
                )}
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
              {t("ActionsPage.donation.description")}
            </p>
          </div>

          <Link
            href={siteConfig.navigation.donation}
            className={[
              "mt-7 inline-flex min-h-12",
              "shrink-0 items-center justify-center",
              "gap-2 rounded-full",
              "bg-[#f36c16] px-6",
              "text-sm font-extrabold text-white",
              "shadow-[0_12px_26px_rgba(243,108,22,0.28)]",
              "transition-all duration-200",
              "hover:bg-[#d95709]",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#f36c16]/35",
              "active:scale-[0.98]",
              "md:mt-0",
            ].join(" ")}
          >
            <Heart
              aria-hidden="true"
              size={18}
              fill="currentColor"
            />

            {t("ActionsPage.donation.button")}

            <ArrowRight
              aria-hidden="true"
              size={17}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}