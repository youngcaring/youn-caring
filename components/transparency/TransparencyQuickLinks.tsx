"use client";

import Link from "next/link";
import {
  HandHeart,
  Heart,
  HelpCircle,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getLocalizedTransparencyQuickLinks } from "@/data/transparency";
import type {
  TransparencyIconId,
} from "@/types/transparency";

/*
 * Association entre les identifiants présents
 * dans data/transparency.ts et les icônes affichées.
 *
 * Partial est utilisé car cette navigation
 * n’emploie pas toutes les icônes disponibles
 * dans TransparencyIconId.
 */
const quickLinkIcons: Partial<
  Record<TransparencyIconId, LucideIcon>
> = {
  handHeart: HandHeart,
  shield: ShieldCheck,
  scale: Scale,
  heart: Heart,
  help: HelpCircle,
};

export default function TransparencyQuickLinks() {
  const { language } = useLanguage();

  const links =
    getLocalizedTransparencyQuickLinks(
      language
    );

  return (
    <nav
      aria-label={
        language === "fr"
          ? "Navigation de la page Dons et transparence"
          : "Donations and transparency page navigation"
      }
      className={[
        "sticky top-0 z-30",
        "border-b border-[#e2e9ea]",
        "bg-white/95 shadow-sm",
        "backdrop-blur-md",
      ].join(" ")}
    >
      <div className="site-container">
        <div
          className={[
            "flex gap-2 overflow-x-auto",
            "py-3",
            "scroll-smooth",
            "[scrollbar-width:none]",
            "[&::-webkit-scrollbar]:hidden",
            "lg:flex-wrap",
            "lg:justify-center",
            "lg:overflow-visible",
          ].join(" ")}
        >
          {links.map((item) => {
            /*
             * ShieldCheck sert de sécurité visuelle
             * si une nouvelle icône non associée
             * est ajoutée plus tard dans les données.
             */
            const Icon =
              quickLinkIcons[item.icon] ??
              ShieldCheck;

            return (
              <Link
                key={item.id}
                href={`#${item.id}`}
                aria-label={item.label}
                className={[
                  "inline-flex min-h-11",
                  "shrink-0 items-center",
                  "justify-center gap-2",
                  "whitespace-nowrap",
                  "rounded-full border",
                  "border-[#dfe7e8]",
                  "bg-white px-4",
                  "text-xs font-extrabold",
                  "text-[#334144]",
                  "transition-all duration-200",
                  "hover:border-[#0097a7]",
                  "hover:bg-[#eaf8f9]",
                  "hover:text-[#007d88]",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4",
                  "focus-visible:ring-[#0097a7]/20",
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  size={16}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}