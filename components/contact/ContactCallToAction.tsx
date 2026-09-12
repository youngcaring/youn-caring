"use client";

import Link from "next/link";
import {
  ArrowRight,
  HandHeart,
  MessageCircle,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";

export default function ContactCallToAction() {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          label: "Agissons ensemble",
          titleStart: "Vous souhaitez participer à",
          titleHighlight: "nos actions ?",
          description:
            "Découvrez les interventions de Young Caring ou échangez directement avec notre équipe sur WhatsApp.",
          actionsButton: "Découvrir nos actions",
          whatsappButton: "Contacter l’équipe",
          whatsappLabel:
            "Contacter l’équipe Young Caring sur WhatsApp",
        }
      : {
          label: "Let’s act together",
          titleStart: "Would you like to support",
          titleHighlight: "our work?",
          description:
            "Discover Young Caring’s activities or speak directly with our team on WhatsApp.",
          actionsButton: "Discover our actions",
          whatsappButton: "Contact the team",
          whatsappLabel:
            "Contact the Young Caring team on WhatsApp",
        };

  return (
    <section className="bg-white px-4 py-10 sm:px-0 sm:py-14">
      <div className="site-container">
        <div className="relative isolate overflow-hidden rounded-[30px] bg-[#091719] px-6 py-10 text-white shadow-[0_22px_55px_rgba(7,31,33,0.16)] sm:px-9 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-12 lg:py-12">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full border-[40px] border-[#0097a7]/20"
          />

          <div className="flex max-w-2xl items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f36c16] text-white">
              <HandHeart
                aria-hidden="true"
                size={26}
              />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[#f36c16]">
                {content.label}
              </p>

              <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">
                {content.titleStart}{" "}
                <span className="text-[#2bc6d4]">
                  {content.titleHighlight}
                </span>
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                {content.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href={siteConfig.navigation.actions}
              className="button-primary"
            >
              {content.actionsButton}

              <ArrowRight
                aria-hidden="true"
                size={18}
              />
            </Link>

            <a
              href={siteConfig.contact.whatsapp.href}
              target="_blank"
              rel={siteConfig.security.externalLinksRel}
              aria-label={content.whatsappLabel}
              className="button-dark"
            >
              <MessageCircle
                aria-hidden="true"
                size={18}
              />

              {content.whatsappButton}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}