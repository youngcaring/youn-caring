"use client";

import {
  Eye,
  HeartHandshake,
  Target,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getLocalizedMissionVision } from "@/data/about";

export default function MissionVisionSection() {
  const { language } = useLanguage();
  const content =
    getLocalizedMissionVision(language);

  const texts =
    language === "fr"
      ? {
          label: "Notre raison d’être",
          titleStart: "Une mission claire,",
          titleHighlight: "une vision solidaire",
          description:
            "Notre engagement est guidé par la protection, l’accompagnement et l’autonomie des personnes vulnérables.",
        }
      : {
          label: "Our purpose",
          titleStart: "A clear mission,",
          titleHighlight: "a supportive vision",
          description:
            "Our commitment is guided by the protection, support and empowerment of vulnerable people.",
        };

  const cards = [
    {
      id: "mission",
      title: content.mission.title,
      description: content.mission.description,
      Icon: Target,
      color: "bg-[#0097a7]",
    },
    {
      id: "vision",
      title: content.vision.title,
      description: content.vision.description,
      Icon: Eye,
      color: "bg-[#f36c16]",
    },
  ] as const;

  return (
    <section
      id="notre-mission"
      aria-labelledby="mission-vision-title"
      className="site-section scroll-mt-28 bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eaf8f9] text-[#007d88]">
            <HeartHandshake
              aria-hidden="true"
              size={27}
            />
          </span>

          <p className="section-label mt-5">
            {texts.label}
          </p>

          <h2
            id="mission-vision-title"
            className="section-title"
          >
            {texts.titleStart}{" "}
            <span className="text-[#0097a7]">
              {texts.titleHighlight}
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5f6d70]">
            {texts.description}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {cards.map(
            ({ id, title, description, Icon, color }) => (
              <article
                key={id}
                className="rounded-[30px] border border-[#e1e9ea] bg-white p-7 shadow-[0_16px_40px_rgba(7,31,33,0.07)] sm:p-9"
              >
                <span
                  className={`grid h-16 w-16 place-items-center rounded-2xl text-white ${color}`}
                >
                  <Icon
                    aria-hidden="true"
                    size={30}
                  />
                </span>

                <h3 className="mt-6 text-2xl font-black tracking-[-0.03em] text-[#101719] sm:text-3xl">
                  {title}
                </h3>

                <p className="mt-4 text-base leading-8 text-[#5f6d70]">
                  {description}
                </p>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}