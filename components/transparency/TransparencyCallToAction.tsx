"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Mail,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function TransparencyCallToAction() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section className="site-section bg-[#f7f9f9]">
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
            src="/images/actions/actions-donation-banner.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className={[
              "absolute inset-0",
              "bg-[linear-gradient(90deg,rgba(4,25,28,0.97)_0%,rgba(4,25,28,0.84)_55%,rgba(0,151,167,0.46)_100%)]",
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
                  ? "Construisons la confiance"
                  : "Building trust"}
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl">
                {isFrench
                  ? "Une question sur nos actions ou notre organisation ?"
                  : "A question about our actions or organisation?"}
              </h2>

              <p className="mt-4 text-sm leading-6 text-white/75 sm:text-base">
                {isFrench
                  ? "Notre équipe reste disponible pour vous renseigner et étudier votre proposition de soutien."
                  : "Our team is available to answer your questions and review your support proposal."}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/contact?subject=donation"
                className="button-primary"
              >
                <Heart
                  aria-hidden="true"
                  size={18}
                  fill="currentColor"
                />

                {isFrench
                  ? "Soutenir nos actions"
                  : "Support our actions"}
              </Link>

              <Link
                href="/contact"
                className={[
                  "inline-flex min-h-12",
                  "items-center justify-center gap-2",
                  "rounded-full border",
                  "border-white/35",
                  "px-6 text-sm font-extrabold",
                  "text-white transition",
                  "hover:border-white",
                  "hover:bg-white/10",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4",
                  "focus-visible:ring-white/25",
                ].join(" ")}
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
                  size={17}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}