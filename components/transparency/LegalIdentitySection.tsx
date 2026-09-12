"use client";

import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  Scale,
  UserRound,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const legalInformation = [
  {
    labelFr: "Nom officiel",
    labelEn: "Official name",
    value:
      "Young Caring / Jeune Bienveillant",
    icon: BadgeCheck,
  },
  {
    labelFr: "Sigle",
    labelEn: "Abbreviation",
    value: "YC/JB",
    icon: Scale,
  },
  {
    labelFr: "Numéro d’enregistrement",
    labelEn: "Registration number",
    value:
      "2026/4173/DEP-LIT/SG/SAG-ASSOC",
    icon: FileNumberIcon,
  },
  {
    labelFr: "Siège légal",
    labelEn: "Legal headquarters",
    value:
      "Agla, 13e arrondissement, Cotonou, Littoral, Bénin",
    icon: MapPin,
  },
  {
    labelFr: "Assemblée constitutive",
    labelEn: "Constitutive assembly",
    value: "16 octobre 2025",
    valueEn: "16 October 2025",
    icon: CalendarDays,
  },
  {
    labelFr: "Date du récépissé",
    labelEn: "Receipt date",
    value: "28 janvier 2026",
    valueEn: "28 January 2026",
    icon: CalendarDays,
  },
] as const;

function FileNumberIcon({
  size = 20,
  className,
}: Readonly<{
  size?: number;
  className?: string;
}>) {
  return (
    <Scale
      aria-hidden="true"
      size={size}
      className={className}
    />
  );
}

const governance = [
  {
    roleFr: "Président",
    roleEn: "President",
    name: "AGBONON Aubin Saturnin",
  },
  {
    roleFr: "Secrétaire général",
    roleEn: "General Secretary",
    name: "HOUNSOUGAN Messanh Drewes",
  },
  {
    roleFr: "Trésorier général",
    roleEn: "General Treasurer",
    name: "TCHIKPE Agbètchèkpo Borice",
  },
] as const;

export default function LegalIdentitySection() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      id="identite-legale"
      aria-labelledby="legal-identity-title"
      className="site-section scroll-mt-32 bg-white"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {isFrench
              ? "Identité légale"
              : "Legal identity"}
          </p>

          <h2
            id="legal-identity-title"
            className="section-title"
          >
            {isFrench
              ? "Une organisation "
              : "An officially "}

            <span className="text-[#0097a7]">
              {isFrench
                ? "officiellement enregistrée"
                : "registered organisation"}
            </span>
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {legalInformation.map((item) => {
              const Icon = item.icon;
              const localizedValue =
                !isFrench &&
                "valueEn" in item
                  ? item.valueEn
                  : item.value;

              return (
                <article
                  key={item.labelFr}
                  className={[
                    "rounded-[24px]",
                    "border border-[#e0e8e9]",
                    "bg-[#f9fbfb] p-5",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    size={21}
                    className="text-[#0097a7]"
                  />

                  <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-[#647275]">
                    {isFrench
                      ? item.labelFr
                      : item.labelEn}
                  </p>

                  <p className="mt-2 break-words text-sm font-extrabold leading-6 text-[#101719]">
                    {localizedValue}
                  </p>
                </article>
              );
            })}
          </div>

          <aside
            aria-labelledby="governance-title"
            className={[
              "rounded-[28px]",
              "bg-[#092124] p-7 text-white",
              "md:p-8",
            ].join(" ")}
          >
            <UserRound
              aria-hidden="true"
              size={28}
              className="text-[#42d1dc]"
            />

            <h3
              id="governance-title"
              className="mt-5 text-2xl font-black"
            >
              {isFrench
                ? "Responsables officiels"
                : "Official representatives"}
            </h3>

            <div className="mt-6 divide-y divide-white/15">
              {governance.map((member) => (
                <div
                  key={member.name}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/55">
                    {isFrench
                      ? member.roleFr
                      : member.roleEn}
                  </p>

                  <p className="mt-1 font-extrabold">
                    {member.name}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}