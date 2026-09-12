"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import FooterPaymentMethods from "@/components/layout/FooterPaymentMethods";
import { useLanguage } from "@/components/providers/LanguageProvider";
import SocialLinks from "@/components/ui/SocialLinks";

const quickLinks = [
  {
    href: "/",
    translationKey: "Footer.home",
  },
  {
    href: "/a-propos",
    translationKey: "Footer.about",
  },
  {
    href: "/actions",
    translationKey: "Footer.actions",
  },
  {
    href: "/transparence",
    translationKey: "Footer.transparency",
  },
  {
    href: "/galerie",
    translationKey: "Footer.gallery",
  },
  {
    href: "/actualites",
    translationKey: "Footer.news",
  },
  {
    href: "/contact",
    translationKey: "Footer.contact",
  },
] as const;

/*
 * Ces liens dirigent vers la page existante
 * des actions avec une catégorie dans l’URL.
 *
 * Ils ne dirigent donc plus vers des routes
 * dynamiques inexistantes susceptibles de produire
 * une page 404.
 */
const actionLinks = [
  {
    href:
      "/actions?category=education#actions-list",
    translationKey:
      "Footer.education",
  },
  {
    href:
      "/actions?category=foodSupport#actions-list",
    translationKey:
      "Footer.foodAid",
  },
  {
    href:
      "/actions?category=health#actions-list",
    translationKey:
      "Footer.health",
  },
  {
    href:
      "/actions?category=clothing#actions-list",
    translationKey:
      "Footer.clothingAndKits",
  },
  {
    href:
      "/actions?category=womenFamilies#actions-list",
    translationKey:
      "Footer.socialSupport",
  },
] as const;

export default function Footer() {
  const { t } = useLanguage();

  const currentYear =
    new Date().getFullYear();

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer
      className={[
        "relative overflow-hidden",
        "bg-[#091719] text-white",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "h-1 w-full",
          "bg-[linear-gradient(90deg,#0097a7_0%,#0097a7_70%,#f36c16_70%,#f36c16_100%)]",
        ].join(" ")}
      />

      <div className="site-container">
        <div
          className={[
            "grid gap-12 py-14",
            "md:grid-cols-2",
            "xl:grid-cols-[1.3fr_0.8fr_0.9fr_1.2fr]",
            "xl:gap-10 xl:py-16",
          ].join(" ")}
        >
          {/* Présentation */}

          <div>
            <Link
              href="/"
              aria-label={`${t(
                "Accessibility.logoAlt"
              )} — ${t("Common.home")}`}
              className={[
                "inline-flex rounded-2xl",
                "bg-white p-3",
                "transition-transform",
                "duration-200",
                "hover:-translate-y-0.5",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#0097a7]/30",
                "motion-reduce:transform-none",
              ].join(" ")}
            >
              <Image
                src="/logo/logo.png"
                alt={t(
                  "Accessibility.logoAlt"
                )}
                width={158}
                height={82}
                className={[
                  "h-auto w-[138px]",
                  "object-contain",
                ].join(" ")}
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              {t("Footer.description")}
            </p>

            <SocialLinks className="mt-6" />

            <Link
              href="/don"
              className={[
                "mt-6 inline-flex",
                "min-h-12 items-center",
                "justify-center gap-2",
                "rounded-full",
                "bg-[#f36c16] px-5",
                "text-sm font-extrabold",
                "text-white",
                "shadow-[0_10px_24px_rgba(243,108,22,0.22)]",
                "transition-all duration-200",
                "hover:-translate-y-0.5",
                "hover:bg-[#d95709]",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#f36c16]/30",
                "motion-reduce:transform-none",
              ].join(" ")}
            >
              <Heart
                aria-hidden="true"
                size={17}
                fill="currentColor"
              />

              {t("Common.donate")}
            </Link>
          </div>

          {/* Liens rapides */}

          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-[0.08em]">
              {t(
                "Footer.quickLinksTitle"
              )}
            </h2>

            <div className="mt-3 h-0.5 w-10 rounded-full bg-[#f36c16]" />

            <ul
              className={[
                "mt-5 grid grid-cols-2",
                "gap-x-4 gap-y-3",
                "text-sm",
                "md:grid-cols-1",
              ].join(" ")}
            >
              {quickLinks.map(
                (item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "inline-flex",
                        "text-white/70",
                        "transition-colors",
                        "hover:text-[#5ad3dc]",
                        "focus-visible:rounded",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-[#0097a7]",
                      ].join(" ")}
                    >
                      {t(
                        item.translationKey
                      )}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Nos actions */}

          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-[0.08em]">
              {t(
                "Footer.actionsTitle"
              )}
            </h2>

            <div className="mt-3 h-0.5 w-10 rounded-full bg-[#0097a7]" />

            <ul className="mt-5 space-y-3 text-sm">
              {actionLinks.map(
                (item) => (
                  <li
                    key={
                      item.translationKey
                    }
                  >
                    <Link
                      href={item.href}
                      className={[
                        "inline-flex",
                        "text-white/70",
                        "transition-colors",
                        "hover:text-[#5ad3dc]",
                        "focus-visible:rounded",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-[#0097a7]",
                      ].join(" ")}
                    >
                      {t(
                        item.translationKey
                      )}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}

          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-[0.08em]">
              {t(
                "Footer.contactTitle"
              )}
            </h2>

            <div className="mt-3 h-0.5 w-10 rounded-full bg-[#f36c16]" />

            <address className="mt-5 space-y-4 text-sm not-italic">
              <a
                href="tel:+2290157774673"
                className={[
                  "group flex",
                  "items-start gap-3",
                  "text-white/70",
                  "transition-colors",
                  "hover:text-white",
                  "focus-visible:rounded-xl",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[#0097a7]",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 inline-flex",
                    "h-9 w-9 shrink-0",
                    "items-center justify-center",
                    "rounded-full",
                    "bg-[#0097a7]/15",
                    "text-[#54d0d9]",
                    "transition-colors",
                    "group-hover:bg-[#0097a7]",
                    "group-hover:text-white",
                  ].join(" ")}
                >
                  <Phone
                    aria-hidden="true"
                    size={17}
                  />
                </span>

                <span>
                  <span className="block text-xs text-white/45">
                    {t(
                      "Footer.phoneLabel"
                    )}
                  </span>

                  <span className="mt-0.5 block font-semibold">
                    +229 01 57 77 46 73
                  </span>
                </span>
              </a>

              <a
                href="https://wa.me/2290157774673"
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "group flex",
                  "items-start gap-3",
                  "text-white/70",
                  "transition-colors",
                  "hover:text-white",
                  "focus-visible:rounded-xl",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[#0097a7]",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 inline-flex",
                    "h-9 w-9 shrink-0",
                    "items-center justify-center",
                    "rounded-full",
                    "bg-[#0097a7]/15",
                    "text-[#54d0d9]",
                    "transition-colors",
                    "group-hover:bg-[#0097a7]",
                    "group-hover:text-white",
                  ].join(" ")}
                >
                  <MessageCircle
                    aria-hidden="true"
                    size={17}
                  />
                </span>

                <span>
                  <span className="block text-xs text-white/45">
                    {t(
                      "Footer.whatsappLabel"
                    )}
                  </span>

                  <span className="mt-0.5 block font-semibold">
                    +229 01 57 77 46 73
                  </span>
                </span>
              </a>

              <a
                href="mailto:contact@young-caring.org"
                className={[
                  "group flex",
                  "items-start gap-3",
                  "text-white/70",
                  "transition-colors",
                  "hover:text-white",
                  "focus-visible:rounded-xl",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[#0097a7]",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 inline-flex",
                    "h-9 w-9 shrink-0",
                    "items-center justify-center",
                    "rounded-full",
                    "bg-[#0097a7]/15",
                    "text-[#54d0d9]",
                    "transition-colors",
                    "group-hover:bg-[#0097a7]",
                    "group-hover:text-white",
                  ].join(" ")}
                >
                  <Mail
                    aria-hidden="true"
                    size={17}
                  />
                </span>

                <span className="min-w-0">
                  <span className="block text-xs text-white/45">
                    {t(
                      "Footer.emailLabel"
                    )}
                  </span>

                  <span className="mt-0.5 block break-all font-semibold">
                    contact@young-caring.org
                  </span>
                </span>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Abomey-Calavi%2C%20B%C3%A9nin"
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "group flex",
                  "items-start gap-3",
                  "text-white/70",
                  "transition-colors",
                  "hover:text-white",
                  "focus-visible:rounded-xl",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[#0097a7]",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 inline-flex",
                    "h-9 w-9 shrink-0",
                    "items-center justify-center",
                    "rounded-full",
                    "bg-[#0097a7]/15",
                    "text-[#54d0d9]",
                    "transition-colors",
                    "group-hover:bg-[#0097a7]",
                    "group-hover:text-white",
                  ].join(" ")}
                >
                  <MapPin
                    aria-hidden="true"
                    size={17}
                  />
                </span>

                <span>
                  <span className="block text-xs text-white/45">
                    {t(
                      "Footer.addressLabel"
                    )}
                  </span>

                  <span className="mt-0.5 block font-semibold">
                    Abomey-Calavi, Bénin
                  </span>
                </span>
              </a>
            </address>
          </div>
        </div>

        {/* Moyens de paiement */}

        <div
          className={[
            "flex flex-col gap-5",
            "border-t border-white/10",
            "py-5",
            "lg:flex-row",
            "lg:items-center",
            "lg:justify-between",
          ].join(" ")}
        >
          <FooterPaymentMethods
            className={[
              "w-full",
              "lg:max-w-[760px]",
            ].join(" ")}
          />

          <button
            type="button"
            onClick={scrollToTop}
            aria-label={t(
              "Accessibility.scrollToTop"
            )}
            className={[
              "inline-flex h-11 w-11",
              "shrink-0 items-center",
              "justify-center self-end",
              "rounded-full",
              "border border-white/15",
              "text-white",
              "transition-all duration-200",
              "hover:-translate-y-0.5",
              "hover:border-[#0097a7]",
              "hover:bg-[#0097a7]",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#0097a7]/30",
              "motion-reduce:transform-none",
              "lg:self-auto",
            ].join(" ")}
          >
            <ArrowUp
              aria-hidden="true"
              size={19}
            />
          </button>
        </div>

        {/* Partie légale */}

        <div
          className={[
            "flex flex-col gap-4",
            "border-t border-white/10",
            "py-6 text-xs",
            "text-white/45",
            "lg:flex-row",
            "lg:items-center",
            "lg:justify-between",
          ].join(" ")}
        >
          <p>
            {t(
              "Footer.copyright",
              {
                year: currentYear,
              }
            )}
          </p>

          <nav
            aria-label={t(
              "Footer.quickLinksTitle"
            )}
          >
            <ul className="flex flex-wrap gap-x-5 gap-y-3">
              <li>
                <Link
                  href="/mentions-legales"
                  className={[
                    "transition-colors",
                    "hover:text-white",
                    "focus-visible:rounded",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-[#0097a7]",
                  ].join(" ")}
                >
                  {t(
                    "Footer.legalNotice"
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/politique-de-confidentialite"
                  className={[
                    "transition-colors",
                    "hover:text-white",
                    "focus-visible:rounded",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-[#0097a7]",
                  ].join(" ")}
                >
                  {t(
                    "Footer.privacyPolicy"
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/conditions-de-don"
                  className={[
                    "transition-colors",
                    "hover:text-white",
                    "focus-visible:rounded",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-[#0097a7]",
                  ].join(" ")}
                >
                  {t(
                    "Footer.donationTerms"
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}