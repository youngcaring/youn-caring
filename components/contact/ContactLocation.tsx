"use client";

import {
  ArrowUpRight,
  Building2,
  MapPin,
  Navigation,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";

export default function ContactLocation() {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          label: "Notre localisation",
          titleStart: "Young Caring est présent à",
          titleHighlight: "Abomey-Calavi",
          description:
            "Notre organisation intervient auprès des enfants, des familles et des communautés. Pour organiser une rencontre, contactez-nous avant votre déplacement.",
          country: "Pays",
          city: "Ville",
          organization: "Organisation",
          mapButton: "Ouvrir dans Google Maps",
          mapLabel:
            "Afficher l’adresse de Young Caring dans Google Maps",
        }
      : {
          label: "Our location",
          titleStart: "Young Caring is based in",
          titleHighlight: "Abomey-Calavi",
          description:
            "Our organisation works alongside children, families and communities. Please contact us before travelling if you would like to arrange a meeting.",
          country: "Country",
          city: "City",
          organization: "Organisation",
          mapButton: "Open in Google Maps",
          mapLabel:
            "View Young Caring’s address in Google Maps",
        };

  return (
    <section
      aria-labelledby="contact-location-title"
      className="site-section bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="grid overflow-hidden rounded-[30px] border border-[#dfe7e8] bg-white shadow-[0_20px_50px_rgba(7,31,33,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="section-label">
              {content.label}
            </p>

            <h2
              id="contact-location-title"
              className="section-title"
            >
              {content.titleStart}{" "}
              <span className="text-[#0097a7]">
                {content.titleHighlight}
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5f6d70]">
              {content.description}
            </p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f3f7f7] p-4">
                <dt className="text-xs font-black uppercase tracking-[0.08em] text-[#718083]">
                  {content.organization}
                </dt>

                <dd className="mt-2 font-black text-[#101719]">
                  {siteConfig.organization.name}
                </dd>
              </div>

              <div className="rounded-2xl bg-[#f3f7f7] p-4">
                <dt className="text-xs font-black uppercase tracking-[0.08em] text-[#718083]">
                  {content.city}
                </dt>

                <dd className="mt-2 font-black text-[#101719]">
                  {siteConfig.contact.address.city}
                </dd>
              </div>

              <div className="rounded-2xl bg-[#f3f7f7] p-4">
                <dt className="text-xs font-black uppercase tracking-[0.08em] text-[#718083]">
                  {content.country}
                </dt>

                <dd className="mt-2 font-black text-[#101719]">
                  {siteConfig.contact.address.country}
                </dd>
              </div>
            </dl>

            <a
              href={siteConfig.contact.address.mapUrl}
              target="_blank"
              rel={siteConfig.security.externalLinksRel}
              aria-label={content.mapLabel}
              className="button-secondary mt-8"
            >
              <Navigation
                aria-hidden="true"
                size={18}
              />

              {content.mapButton}

              <ArrowUpRight
                aria-hidden="true"
                size={17}
              />
            </a>
          </div>

          <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-[#0097a7] p-8 text-white lg:min-h-full">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[32px] border-white/10"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#007d88]"
            />

            <div className="relative z-10 text-center">
              <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-[#0097a7] shadow-[0_18px_40px_rgba(7,31,33,0.2)]">
                <MapPin
                  aria-hidden="true"
                  size={43}
                  strokeWidth={2}
                />
              </span>

              <Building2
                aria-hidden="true"
                size={25}
                className="mx-auto mt-8 text-[#ffd0b2]"
              />

              <strong className="mt-3 block text-2xl font-black">
                {siteConfig.contact.address.display}
              </strong>

              <span className="mt-2 block text-sm text-white/75">
                {siteConfig.organization.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}