"use client";

import { ArrowUpRight } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import type { SocialNetwork } from "@/config/site";

type SocialIconProps = Readonly<{
  network: SocialNetwork;
}>;

function SocialIcon({
  network,
}: SocialIconProps) {
  if (network === "facebook") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
      >
        <path d="M13.5 22v-9h3l.45-3.5H13.5V7.27c0-1.01.28-1.7 1.73-1.7H17V2.44A23.5 23.5 0 0 0 14.42 2C11.86 2 10.1 3.56 10.1 6.43V9.5H7v3.5h3.1v9h3.4Z" />
      </svg>
    );
  }

  if (network === "instagram") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
        />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  if (network === "tiktok") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
      >
        <path d="M15.6 2c.24 2.04 1.38 3.25 3.4 3.38v3.05a8.2 8.2 0 0 1-3.36-.78v6.2a6.15 6.15 0 1 1-5.3-6.1c.42-.06.84-.08 1.26-.04v3.12a3.06 3.06 0 1 0 1.02 5.97c.68-.32 1.08-.98 1.08-1.98V2h1.9Z" />
      </svg>
    );
  }

  if (network === "youtube") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
      >
        <path d="M21.6 7.2a2.8 2.8 0 0 0-1.97-1.98C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.63.47A2.8 2.8 0 0 0 2.4 7.2 29 29 0 0 0 1.93 12a29 29 0 0 0 .47 4.8 2.8 2.8 0 0 0 1.97 1.98c1.73.47 7.63.47 7.63.47s5.9 0 7.63-.47a2.8 2.8 0 0 0 1.97-1.98 29 29 0 0 0 .47-4.8 29 29 0 0 0-.47-4.8ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-current"
    >
      <path d="M5.2 3.5A2.2 2.2 0 1 1 5.2 8a2.2 2.2 0 0 1 0-4.5ZM3.3 9.5h3.8V21H3.3V9.5Zm6.1 0H13v1.57h.05c.5-.94 1.72-1.94 3.55-1.94 3.8 0 4.5 2.5 4.5 5.75V21h-3.8v-5.43c0-1.3-.02-2.96-1.8-2.96-1.81 0-2.09 1.41-2.09 2.87V21H9.4V9.5Z" />
    </svg>
  );
}

export default function ContactSocialNetworks() {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          label: "Réseaux sociaux",
          titleStart: "Suivez les actions de",
          titleHighlight: "Young Caring",
          description:
            "Retrouvez nos activités, nos mobilisations et les moments partagés avec les communautés sur nos réseaux officiels.",
          follow: "Suivre",
          external:
            "Ce lien s’ouvre dans un nouvel onglet",
          unavailable:
            "Aucun réseau social officiel n’est disponible actuellement.",
        }
      : {
          label: "Social networks",
          titleStart: "Follow the work of",
          titleHighlight: "Young Caring",
          description:
            "Follow our activities, community work and shared moments through our official social media accounts.",
          follow: "Follow",
          external:
            "This link opens in a new tab",
          unavailable:
            "No official social media account is currently available.",
        };

  const enabledSocialLinks =
    siteConfig.socialLinks.filter(
      (
        socialLink
      ): socialLink is typeof socialLink & {
        url: string;
      } =>
        socialLink.enabled &&
        typeof socialLink.url === "string" &&
        socialLink.url.startsWith("https://")
    );

  return (
    <section
      aria-labelledby="contact-social-title"
      className="site-section bg-[#092124] text-white"
    >
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.1em] text-[#f36c16]">
              {content.label}
            </p>

            <h2
              id="contact-social-title"
              className="mt-3 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl"
            >
              {content.titleStart}{" "}
              <span className="text-[#2bc6d4]">
                {content.titleHighlight}
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              {content.description}
            </p>
          </div>

          {enabledSocialLinks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {enabledSocialLinks.map(
                (socialLink) => (
                  <a
                    key={socialLink.name}
                    href={socialLink.url}
                    target="_blank"
                    rel={
                      siteConfig.security
                        .externalLinksRel
                    }
                    aria-label={`${content.follow} ${socialLink.label}. ${content.external}`}
                    className="group flex min-h-[112px] items-center gap-4 rounded-[24px] border border-white/12 bg-white/[0.07] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#2bc6d4]/50 hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2bc6d4]/25"
                  >
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-[#092124]">
                      <SocialIcon
                        network={socialLink.name}
                      />
                    </span>

                    <span className="min-w-0">
                      <strong className="block text-lg font-black">
                        {socialLink.label}
                      </strong>

                      {socialLink.username && (
                        <span className="mt-1 block truncate text-sm text-white/65">
                          {socialLink.username}
                        </span>
                      )}
                    </span>

                    <ArrowUpRight
                      aria-hidden="true"
                      size={20}
                      className="ml-auto shrink-0 text-[#f36c16] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                )
              )}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 text-white/70">
              {content.unavailable}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}