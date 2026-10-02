"use client";

import Image from "next/image";

import {
  BadgeCheck,
  Building2,
  MapPin,
  UsersRound,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type Office = "france" | "benin";
type Language = "fr" | "en";

type GovernanceMember = {
  id: string;
  fullName: string;
  office: Office;
  image: string;
  role: {
    fr: string;
    en: string;
  };
  imagePosition?: string;
};

const GOVERNANCE_MEMBERS: GovernanceMember[] = [
  // =========================================================
  // BUREAU RELAIS FRANCE
  // =========================================================

  {
    id: "sabatut-marine-rose",
    fullName: "SABATUT Marine Rose",
    office: "france",
    image:
      "/images/governance/france/sabatut-marine-rose.png",
    role: {
      fr: "Présidente",
      en: "President",
    },
    imagePosition: "50% 20%",
  },

  {
    id: "houndeton-tiphaine-ursula-oluwa-femi-sedozan",
    fullName:
      "HOUNDETON Tiphaine Ursula Oluwa Femi SEDOZAN",
    office: "france",
    image:
      "/images/governance/france/houndeton-tiphaine-ursula-oluwa-femi-sedozan.png",
    role: {
      fr: "Trésorière",
      en: "Treasurer",
    },
    imagePosition: "50% 30%",
  },

  {
    id: "adekounle-adewale-jaures-carel",
    fullName: "ADEKOUNLE ADEWALE JAURES CAREL",
    office: "france",
    image:
      "/images/governance/france/adekounle-adewale-jaures-carel.png",
    role: {
      fr: "Secrétaire",
      en: "Secretary",
    },
    imagePosition: "50% 12%",
  },

  // =========================================================
  // BUREAU YC/JB — BÉNIN
  // =========================================================

  {
    id: "agbonon-aubin-saturnin",
    fullName: "AGBONON Aubin Saturnin",
    office: "benin",
    image:
      "/images/governance/benin/agbonon-aubin-saturnin.png",
    role: {
      fr: "Président",
      en: "President",
    },
    imagePosition: "50% 18%",
  },

  {
    id: "ramos-menendez-marina",
    fullName: "RAMOS MENENDEZ Marina",
    office: "benin",
    image:
      "/images/governance/benin/ramos-menendez-marina.png",
    role: {
      fr: "Chargée de communication et relations extérieures",
      en: "Communications and External Relations Officer",
    },
    imagePosition: "50% 20%",
  },

  {
    id: "hounsougan-m-drewes",
    fullName: "HOUNSOUGAN M. Drewes",
    office: "benin",
    image:
      "/images/governance/benin/hounsougan-m-drewes.png",
    role: {
      fr: "Secrétaire Général",
      en: "Secretary General",
    },
    imagePosition: "50% 18%",
  },

  {
    id: "tchikpe-agbetchekpo-borice",
    fullName: "TCHIKPE Agbètchèkpo Borice",
    office: "benin",
    image:
      "/images/governance/benin/tchikpe-agbetchekpo-borice.png",
    role: {
      fr: "Trésorier Général",
      en: "General Treasurer",
    },
    imagePosition: "50% 18%",
  },
];

export default function GovernanceSection() {
  const { language } = useLanguage();

  const currentLanguage: Language =
    language === "fr" ? "fr" : "en";

  const franceMembers = GOVERNANCE_MEMBERS.filter(
    (member) => member.office === "france",
  );

  const beninMembers = GOVERNANCE_MEMBERS.filter(
    (member) => member.office === "benin",
  );

  const texts =
    currentLanguage === "fr"
      ? {
          label: "Gouvernance",

          titleStart: "Nos",
          titleHighlight: "représentants",

          description:
            "Young Caring s’appuie sur une gouvernance structurée entre son bureau YC/JB au Bénin et son bureau relais en France. Ces responsables participent à la coordination, à la représentation et au développement des activités de l’organisation.",

          franceTitle: "Bureau relais France",
          franceDescription:
            "Équipe représentative et relais de Young Caring en France.",
          franceLocation: "France",

          beninTitle: "Bureau YC/JB — Bénin",
          beninDescription:
            "Bureau de gouvernance et de coordination de Young Caring au Bénin.",
          beninLocation: "Bénin",

          officialMember:
            "Membre de la gouvernance Young Caring",
        }
      : {
          label: "Governance",

          titleStart: "Our",
          titleHighlight: "representatives",

          description:
            "Young Caring is supported by a structured governance system between its YC/JB office in Benin and its representative office in France. These representatives contribute to the coordination, representation and development of the organisation.",

          franceTitle: "France Representative Office",
          franceDescription:
            "Young Caring's representative and liaison team in France.",
          franceLocation: "France",

          beninTitle: "YC/JB Office — Benin",
          beninDescription:
            "Young Caring's governance and coordination office in Benin.",
          beninLocation: "Benin",

          officialMember:
            "Young Caring governance member",
        };

  return (
    <section
      aria-labelledby="governance-title"
      className="site-section overflow-hidden bg-[#f7f9f9]"
    >
      <div className="site-container">
        {/* =====================================================
            INTRODUCTION
        ===================================================== */}

        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eaf8f9] text-[#007d88] ring-1 ring-[#d8f0f2]">
            <UsersRound
              aria-hidden="true"
              size={27}
              strokeWidth={2}
            />
          </div>

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

          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-7 text-[#5f6d70] sm:text-base lg:text-[17px]">
            {texts.description}
          </p>
        </div>

        {/* =====================================================
            BUREAU RELAIS FRANCE
        ===================================================== */}

        <div className="mx-auto mt-14 max-w-[1180px]">
          <OfficeHeader
            title={texts.franceTitle}
            description={texts.franceDescription}
            location={texts.franceLocation}
          />

          <div className="mx-auto mt-8 grid max-w-[1050px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {franceMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                language={currentLanguage}
                officialMember={texts.officialMember}
              />
            ))}
          </div>
        </div>

        {/* =====================================================
            SÉPARATEUR
        ===================================================== */}

        <div className="mx-auto my-14 max-w-[1180px]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d8e3e4] to-transparent" />
        </div>

        {/* =====================================================
            BUREAU YC/JB — BÉNIN
        ===================================================== */}

        <div className="mx-auto max-w-[1380px]">
          <OfficeHeader
            title={texts.beninTitle}
            description={texts.beninDescription}
            location={texts.beninLocation}
          />

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {beninMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                language={currentLanguage}
                officialMember={texts.officialMember}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ENTÊTE DE BUREAU
========================================================= */

type OfficeHeaderProps = {
  title: string;
  description: string;
  location: string;
};

function OfficeHeader({
  title,
  description,
  location,
}: OfficeHeaderProps) {
  return (
    <div className="flex flex-col gap-5 rounded-[26px] border border-[#dfe8e9] bg-white px-5 py-5 shadow-[0_14px_38px_rgba(7,31,33,0.045)] sm:px-6 md:flex-row md:items-center md:justify-between md:px-8">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf8f9] text-[#007d88] ring-1 ring-[#d9f0f2]">
          <Building2
            aria-hidden="true"
            size={22}
            strokeWidth={2}
          />
        </div>

        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-[#101719] sm:text-2xl">
            {title}
          </h3>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#68777a]">
            {description}
          </p>
        </div>
      </div>

      <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#edf1f2] bg-[#f8faf9] px-4 py-2 text-sm font-bold text-[#536265]">
        <MapPin
          aria-hidden="true"
          size={16}
          strokeWidth={2.2}
          className="text-[#f36c16]"
        />

        <span>{location}</span>
      </div>
    </div>
  );
}

/* =========================================================
   CARTE D’UN MEMBRE
========================================================= */

type MemberCardProps = {
  member: GovernanceMember;
  language: Language;
  officialMember: string;
};

function MemberCard({
  member,
  language,
  officialMember,
}: MemberCardProps) {
  return (
    <article className="group flex h-full min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-[#e1e9ea] bg-white shadow-[0_14px_38px_rgba(7,31,33,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d3e1e2] hover:shadow-[0_22px_55px_rgba(7,31,33,0.10)]">
      {/* PHOTO */}

      <div className="relative h-[355px] w-full overflow-hidden bg-[#eef3f3] sm:h-[375px]">
        <Image
          src={member.image}
          alt={`${member.fullName} - ${member.role[language]}`}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            25vw
          "
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          style={{
            objectPosition:
              member.imagePosition ?? "50% 20%",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 via-black/[0.03] to-transparent"
        />
      </div>

      {/* INFORMATIONS */}

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 text-center sm:px-6">
        <div className="flex min-h-[52px] items-start justify-center">
          <p className="max-w-[280px] text-[12px] font-black uppercase leading-[1.45] tracking-[0.075em] text-[#007d88]">
            {member.role[language]}
          </p>
        </div>

        <div className="mt-2 flex min-h-[62px] items-start justify-center">
          <h4 className="max-w-[310px] text-[17px] font-black leading-[1.28] tracking-[-0.02em] text-[#101719]">
            {member.fullName}
          </h4>
        </div>

        <div className="mt-auto pt-5">
          <div className="h-px w-full bg-[#edf1f2]" />

          <div className="mt-4 flex min-h-[38px] items-center justify-center gap-2 text-center text-[12px] leading-5 text-[#718083]">
            <BadgeCheck
              aria-hidden="true"
              size={16}
              strokeWidth={2}
              className="shrink-0 text-[#f36c16]"
            />

            <span>{officialMember}</span>
          </div>
        </div>
      </div>
    </article>
  );
}