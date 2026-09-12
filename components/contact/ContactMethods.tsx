"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import type {
  ContactMethod,
  ContactMethodId,
} from "@/types/contact";

const methodIcons: Record<
  ContactMethodId,
  LucideIcon
> = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  address: MapPin,
};

export default function ContactMethods() {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          label: "Nous joindre",
          titleStart: "Choisissez le moyen de contact",
          titleHighlight: "qui vous convient",
          description:
            "Téléphone, WhatsApp, email ou visite : utilisez le moyen le plus adapté à votre demande.",
          phone: "Téléphone",
          whatsapp: "WhatsApp",
          email: "Adresse email",
          address: "Notre adresse",
          callAction: "Appeler",
          whatsappAction: "Envoyer un message",
          emailAction: "Envoyer un email",
          mapAction: "Voir sur Google Maps",
        }
      : {
          label: "Reach us",
          titleStart: "Choose the contact method",
          titleHighlight: "that suits you",
          description:
            "Phone, WhatsApp, email or visit: use the most suitable method for your request.",
          phone: "Telephone",
          whatsapp: "WhatsApp",
          email: "Email address",
          address: "Our address",
          callAction: "Call us",
          whatsappAction: "Send a message",
          emailAction: "Send an email",
          mapAction: "View on Google Maps",
        };

  const methods: readonly ContactMethod[] = [
    {
      id: "phone",
      label: content.phone,
      value: siteConfig.contact.phone.display,
      href: siteConfig.contact.phone.href,
      external: false,
    },
    {
      id: "whatsapp",
      label: content.whatsapp,
      value: content.whatsappAction,
      href: siteConfig.contact.whatsapp.href,
      external: true,
    },
    {
      id: "email",
      label: content.email,
      value: siteConfig.contact.email.display,
      href: siteConfig.contact.email.href,
      external: false,
    },
    {
      id: "address",
      label: content.address,
      value: siteConfig.contact.address.display,
      href: siteConfig.contact.address.mapUrl,
      external: true,
    },
  ];

  const actionLabels: Record<
    ContactMethodId,
    string
  > = {
    phone: content.callAction,
    whatsapp: content.whatsappAction,
    email: content.emailAction,
    address: content.mapAction,
  };

  return (
    <section
      aria-labelledby="contact-methods-title"
      className="site-section bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {content.label}
          </p>

          <h2
            id="contact-methods-title"
            className="section-title"
          >
            {content.titleStart}{" "}
            <span className="text-[#0097a7]">
              {content.titleHighlight}
            </span>
          </h2>

          <p className="section-description">
            {content.description}
          </p>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {methods.map((method, index) => {
            const Icon = methodIcons[method.id];

            return (
              <article
                key={method.id}
                className="group flex min-h-[250px] flex-col rounded-[26px] border border-[#e2e9ea] bg-white p-6 shadow-[0_14px_35px_rgba(7,31,33,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(7,31,33,0.11)]"
              >
                <span
                  className={[
                    "grid h-14 w-14 place-items-center",
                    "rounded-2xl text-white",
                    index % 2 === 0
                      ? "bg-[#0097a7]"
                      : "bg-[#f36c16]",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    size={25}
                  />
                </span>

                <h3 className="mt-6 text-lg font-black text-[#101719]">
                  {method.label}
                </h3>

                <p className="mt-2 break-words text-sm leading-6 text-[#5f6d70]">
                  {method.value}
                </p>

                <a
                  href={method.href}
                  target={
                    method.external
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    method.external
                      ? siteConfig.security
                          .externalLinksRel
                      : undefined
                  }
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-extrabold text-[#007d88] transition hover:text-[#f36c16] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0097a7]/20"
                >
                  {actionLabels[method.id]}

                  <ArrowUpRight
                    aria-hidden="true"
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}