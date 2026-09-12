"use client";

import type { LucideIcon } from "lucide-react";
import {
  Handshake,
  Heart,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getLocalizedValues } from "@/data/about";
import type { AboutValueId } from "@/types/about";

const valueIcons: Record<
  AboutValueId,
  LucideIcon
> = {
  kindness: Heart,
  solidarity: Handshake,
  dignity: Scale,
  sharing: Users,
  inclusion: Sparkles,
  responsibility: ShieldCheck,
};

export default function ValuesSection() {
  const { language } = useLanguage();
  const values = getLocalizedValues(language);

  const texts =
    language === "fr"
      ? {
          label: "Nos valeurs",
          titleStart: "Les principes qui guident",
          titleHighlight: "chacune de nos actions",
          description:
            "Notre manière d’agir repose sur le respect des personnes, la solidarité et la responsabilité.",
        }
      : {
          label: "Our values",
          titleStart: "The principles guiding",
          titleHighlight: "everything we do",
          description:
            "Our work is based on respect for people, solidarity and responsibility.",
        };

  return (
    <section
      aria-labelledby="values-title"
      className="site-section bg-white"
    >
      <div className="site-container">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <p className="section-label">
              {texts.label}
            </p>

            <h2
              id="values-title"
              className="section-title"
            >
              {texts.titleStart}{" "}
              <span className="text-[#0097a7]">
                {texts.titleHighlight}
              </span>
            </h2>

            <p className="section-description">
              {texts.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((value, index) => {
              const Icon = valueIcons[value.id];

              return (
                <article
                  key={value.id}
                  className={[
                    "rounded-[24px] border p-6",
                    "transition duration-300",
                    index % 2 === 0
                      ? "border-[#cfecee] bg-[#f2fbfb]"
                      : "border-[#fde0ce] bg-[#fff7f2]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-12 w-12 place-items-center",
                      "rounded-full",
                      index % 2 === 0
                        ? "bg-[#0097a7] text-white"
                        : "bg-[#f36c16] text-white",
                    ].join(" ")}
                  >
                    <Icon
                      aria-hidden="true"
                      size={22}
                    />
                  </span>

                  <h3 className="mt-5 text-lg font-black text-[#101719]">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#5f6d70]">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}