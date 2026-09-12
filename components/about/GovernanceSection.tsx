"use client";

import {
  BadgeCheck,
  UsersRound,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getLocalizedGovernance } from "@/data/about";

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");
}

export default function GovernanceSection() {
  const { language } = useLanguage();
  const members =
    getLocalizedGovernance(language);

  const texts =
    language === "fr"
      ? {
          label: "Gouvernance",
          titleStart: "Le conseil",
          titleHighlight: "d’administration",
          description:
            "Les représentants ci-dessous sont ceux mentionnés dans le récépissé officiel de déclaration de l’organisation.",
          officialMember:
            "Membre du conseil d’administration",
        }
      : {
          label: "Governance",
          titleStart: "The board",
          titleHighlight: "of directors",
          description:
            "The representatives below are those listed in the organisation’s official declaration receipt.",
          officialMember:
            "Member of the board of directors",
        };

  return (
    <section
      aria-labelledby="governance-title"
      className="site-section bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eaf8f9] text-[#007d88]">
            <UsersRound
              aria-hidden="true"
              size={27}
            />
          </span>

          <p className="section-label mt-5">
            {texts.label}
          </p>

          <h2
            id="governance-title"
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

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {members.map((member, index) => (
            <article
              key={member.id}
              className="rounded-[28px] border border-[#e1e9ea] bg-white p-6 text-center shadow-[0_14px_36px_rgba(7,31,33,0.06)]"
            >
              <span
                className={[
                  "mx-auto grid h-20 w-20",
                  "place-items-center rounded-full",
                  "text-xl font-black text-white",
                  index === 0
                    ? "bg-[#f36c16]"
                    : "bg-[#0097a7]",
                ].join(" ")}
              >
                {getInitials(member.fullName)}
              </span>

              <p className="mt-5 text-sm font-black uppercase tracking-[0.08em] text-[#007d88]">
                {member.roleLabel}
              </p>

              <h3 className="mt-2 text-lg font-black leading-tight text-[#101719]">
                {member.fullName}
              </h3>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#718083]">
                <BadgeCheck
                  aria-hidden="true"
                  size={15}
                  className="text-[#f36c16]"
                />

                {texts.officialMember}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}