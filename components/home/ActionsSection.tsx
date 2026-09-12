"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HandHeart,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  homeContent,
  type HomeActionId,
} from "@/data/home";

type ActionPresentation = Readonly<{
  title: string;
  description: string;
  imageAlt: string;
  icon: LucideIcon;
  accent: "turquoise" | "orange";
}>;

export default function ActionsSection() {
  const { language, t } = useLanguage();

  /*
   * Les traductions déjà disponibles dans messages/fr.json
   * et messages/en.json sont utilisées pour l’éducation.
   *
   * Les deux autres traductions restent temporairement ici
   * pour éviter une erreur si leurs clés ne sont pas encore
   * présentes dans les fichiers JSON.
   */

  const localTranslations =
    language === "fr"
      ? {
          community: {
            title: "Action communautaire",
            description:
              "Mobilisation et soutien direct auprès des communautés et des familles.",
            imageAlt:
              "Équipe de Young Caring mobilisée pendant une action communautaire",
          },
          children: {
            title: "Enfance & solidarité",
            description:
              "Présence, écoute et accompagnement des enfants en situation de vulnérabilité.",
            imageAlt:
              "Membres de Young Caring accompagnant des enfants pendant une action",
          },
        }
      : {
          community: {
            title: "Community action",
            description:
              "Mobilisation and direct support alongside communities and families.",
            imageAlt:
              "Young Caring team mobilised during a community action",
          },
          children: {
            title: "Children & solidarity",
            description:
              "Presence, care and support for children in vulnerable situations.",
            imageAlt:
              "Young Caring members supporting children during an action",
          },
        };

  /*
   * Le type Record garantit que chaque identifiant présent
   * dans data/home.ts possède obligatoirement une présentation.
   */

  const actionPresentations: Record<
    HomeActionId,
    ActionPresentation
  > = {
    education: {
      title: t("Actions.education.title"),
      description: t("Actions.education.description"),
      imageAlt: t("Actions.education.imageAlt"),
      icon: BookOpen,
      accent: "turquoise",
    },

    community: {
      title: localTranslations.community.title,
      description: localTranslations.community.description,
      imageAlt: localTranslations.community.imageAlt,
      icon: HandHeart,
      accent: "orange",
    },

    children: {
      title: localTranslations.children.title,
      description: localTranslations.children.description,
      imageAlt: localTranslations.children.imageAlt,
      icon: Users,
      accent: "turquoise",
    },
  };

  return (
    <section
      id="nos-actions"
      aria-labelledby="actions-section-title"
      className="site-section relative overflow-hidden bg-[#f7f9f9]"
    >
      {/* Décoration légère */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#eaf8f9] blur-3xl"
      />

      <div className="site-container relative z-10">
        {/* En-tête de section */}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-4xl">
            <p className="section-label">
              {t("Actions.label")}
            </p>

            <h2
              id="actions-section-title"
              className="section-title"
            >
              {t("Actions.titleStart")}{" "}

              <span className="text-[#0097a7]">
                {t("Actions.titleHighlight")}
              </span>
            </h2>
          </div>

          <Link
            href={homeContent.links.actions}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start font-extrabold text-[#007d88] transition-colors hover:text-[#f36c16] md:self-auto"
          >
            <span>{t("Actions.viewAll")}</span>

            <ArrowRight
              aria-hidden="true"
              size={18}
              strokeWidth={2.2}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Cartes */}

        <div
          className={[
            "mt-10 flex snap-x snap-mandatory gap-5",
            "overflow-x-auto pb-5",
            "md:grid md:grid-cols-3 md:overflow-visible md:pb-0",
          ].join(" ")}
        >
          {homeContent.actionCards.map((item) => {
            const presentation =
              actionPresentations[item.id];

            const Icon = presentation.icon;

            const iconColor =
              presentation.accent === "orange"
                ? "bg-[#f36c16]"
                : "bg-[#0097a7]";

            return (
              <article
                key={item.id}
                className={[
                  "content-card group",
                  "w-[84%] shrink-0 snap-start",
                  "sm:w-[48%]",
                  "md:w-auto md:shrink",
                ].join(" ")}
              >
                {/* Image */}

                <div className="relative aspect-[4/3] overflow-hidden bg-[#eef4f4]">
                  <Image
                    src={item.image}
                    alt={presentation.imageAlt}
                    fill
                    sizes="(max-width: 639px) 84vw, (max-width: 767px) 48vw, 33vw"
                    quality={86}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
                  />

                  <span
                    aria-hidden="true"
                    className={[
                      "absolute bottom-4 left-4",
                      "grid h-12 w-12 place-items-center",
                      "rounded-full text-white",
                      "shadow-[0_10px_25px_rgba(7,31,33,0.18)]",
                      iconColor,
                    ].join(" ")}
                  >
                    <Icon
                      size={22}
                      strokeWidth={2.2}
                    />
                  </span>
                </div>

                {/* Contenu */}

                <div className="flex min-h-[230px] flex-col p-6">
                  <h3 className="text-xl font-black leading-tight tracking-[-0.02em] text-[#101719]">
                    {presentation.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-[#5f6d70]">
                    {presentation.description}
                  </p>

                  <Link
                    href={item.href}
                    aria-label={`${t("Actions.learnMore")} — ${
                      presentation.title
                    }`}
                    className="mt-6 inline-flex min-h-10 items-center gap-2 self-start text-sm font-extrabold text-[#007d88] transition-colors hover:text-[#f36c16]"
                  >
                    <span>{t("Actions.learnMore")}</span>

                    <ArrowRight
                      aria-hidden="true"
                      size={16}
                      strokeWidth={2.3}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Indication mobile */}

        <p className="mt-1 text-center text-xs font-semibold text-[#5f6d70] md:hidden">
          {language === "fr"
            ? "Faites défiler pour découvrir nos actions"
            : "Swipe to discover our actions"}
        </p>
      </div>
    </section>
  );
}