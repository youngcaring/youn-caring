"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { donationPageImages } from "@/data/donation";

export default function DonationCallToAction() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section className="site-section bg-white">
      <div className="site-container">
        <div
          className={[
            "relative isolate overflow-hidden",
            "rounded-[30px]",
            "bg-[#092124] text-white",
            "shadow-[0_20px_55px_rgba(7,31,33,0.15)]",
          ].join(" ")}
        >
          <Image
            src={
              donationPageImages.callToAction
            }
            alt=""
            fill
            sizes="100vw"
            className="-z-20 object-cover"
          />

          <div
            aria-hidden="true"
            className={[
              "absolute inset-0 -z-10",
              "bg-[linear-gradient(90deg,rgba(4,25,28,0.97)_0%,rgba(4,25,28,0.84)_60%,rgba(0,151,167,0.48)_100%)]",
            ].join(" ")}
          />

          <div
            className={[
              "relative z-10",
              "flex flex-col gap-7",
              "px-6 py-10",
              "sm:px-9 sm:py-12",
              "lg:flex-row lg:items-center",
              "lg:justify-between lg:px-12",
            ].join(" ")}
          >
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[#f36c16]">
                {isFrench
                  ? "Besoin d’aide ?"
                  : "Need help?"}
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl">
                {isFrench
                  ? "Une question avant de contribuer ?"
                  : "A question before contributing?"}
              </h2>

              <p className="mt-4 text-sm leading-6 text-white/75 sm:text-base">
                {isFrench
                  ? "L’équipe Young Caring reste disponible pour répondre à vos questions et vous orienter."
                  : "The Young Caring team is available to answer your questions and guide you."}
              </p>
            </div>

            <Link
              href="/contact?subject=donation"
              className="button-primary shrink-0"
            >
              <Mail
                aria-hidden="true"
                size={18}
              />

              {isFrench
                ? "Nous contacter"
                : "Contact us"}

              <ArrowRight
                aria-hidden="true"
                size={18}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}