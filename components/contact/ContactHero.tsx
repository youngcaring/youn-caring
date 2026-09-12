"use client";

import Image from "next/image";
import {
  ArrowDown,
  MessageCircle,
  Phone,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";

export default function ContactHero() {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          label: "Contact",
          titleStart: "Restons",
          titleHighlight: "en contact",
          description:
            "Une question, une demande d’aide ou l’envie de soutenir Young Caring ? Contactez-nous directement. Notre équipe vous répondra avec attention.",
          contactButton: "Nous contacter",
          whatsappButton: "Écrire sur WhatsApp",
          phoneLabel: "Appeler Young Caring",
          whatsappLabel:
            "Contacter Young Caring sur WhatsApp",
          imageAlt:
            "Une action de terrain menée par Young Caring",
        }
      : {
          label: "Contact",
          titleStart: "Let’s stay",
          titleHighlight: "connected",
          description:
            "Have a question, need assistance or want to support Young Caring? Contact us directly. Our team will respond with care.",
          contactButton: "Contact us",
          whatsappButton: "Message us on WhatsApp",
          phoneLabel: "Call Young Caring",
          whatsappLabel:
            "Contact Young Caring on WhatsApp",
          imageAlt:
            "A field action carried out by Young Caring",
        };

  return (
    <section
      aria-labelledby="contact-hero-title"
      className="relative isolate min-h-[500px] overflow-hidden bg-[#091719] text-white md:min-h-[540px]"
    >
      <Image
        src="/images/actions/actions-hero-desktop.jpg"
        alt={content.imageAlt}
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center md:block"
      />

      <Image
        src="/images/actions/actions-hero-mobile.jpg"
        alt={content.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:hidden"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-0 bg-[linear-gradient(90deg,rgba(4,19,21,0.95)_0%,rgba(4,19,21,0.76)_55%,rgba(4,19,21,0.32)_100%)]"
      />

      <div className="site-container relative z-10 flex min-h-[500px] items-end pb-14 pt-28 md:min-h-[540px] md:items-center md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.1em] text-[#f36c16]">
            {content.label}
          </p>

          <h1
            id="contact-hero-title"
            className="mt-4 text-[clamp(2.8rem,7vw,5.4rem)] font-black leading-[0.95] tracking-[-0.05em]"
          >
            {content.titleStart}{" "}
            <span className="text-[#f36c16]">
              {content.titleHighlight}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/80 md:text-lg md:leading-8">
            {content.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact-form"
              className="button-primary"
            >
              {content.contactButton}

              <ArrowDown
                aria-hidden="true"
                size={18}
              />
            </a>

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

          <a
            href={siteConfig.contact.phone.href}
            aria-label={content.phoneLabel}
            className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/15"
          >
            <Phone
              aria-hidden="true"
              size={17}
              className="text-[#f36c16]"
            />

            {siteConfig.contact.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}