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
            "Young Caring s’appuie sur une gouvernance structurée entre son bureau YC/JB au Bénin et son bureau relais en France. Découvrez les responsables qui participent à la coordination, à la représentation et au développement de l’organisation.",

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
            "Young Caring is supported by structured governance between its YC/JB office in Benin and its representative office in France. Meet the people contributing to the coordination, representation and development of the organisation.",

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
      className="overflow-hidden bg-[#f7f9f9] py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
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

          <p className="section-label mt-4">
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

          <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-7 text-[#5f6d70] sm:text-base lg:text-[17px]">
            {texts.description}
          </p>
        </div>

        {/* =====================================================
            BUREAU RELAIS FRANCE
        ===================================================== */}

        <div className="mt-12 lg:mt-14">
          <OfficeHeader
            title={texts.franceTitle}
            description={texts.franceDescription}
            location={texts.franceLocation}
          />

          <div className="mx-auto mt-6 grid max-w-[1240px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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

        <div className="my-12 lg:my-14">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d8e3e4] to-transparent" />
        </div>

        {/* =====================================================
            BUREAU YC/JB — BÉNIN
        ===================================================== */}

        <div>
          <OfficeHeader
            title={texts.beninTitle}
            description={texts.beninDescription}
            location={texts.beninLocation}
          />

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
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
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#dfe8e9] bg-white px-5 py-5 shadow-[0_12px_32px_rgba(7,31,33,0.045)] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-7">
      <div className="flex items-center gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eaf8f9] text-[#007d88] ring-1 ring-[#d9f0f2]">
          <Building2
            aria-hidden="true"
            size={21}
            strokeWidth={2}
          />
        </div>

        <div>
          <h3 className="text-xl font-black tracking-[-0.03em] text-[#101719] sm:text-[22px]">
            {title}
          </h3>

          <p className="mt-0.5 text-sm leading-6 text-[#68777a]">
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
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#dde7e8] bg-white shadow-[0_12px_34px_rgba(7,31,33,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cadcde] hover:shadow-[0_20px_48px_rgba(7,31,33,0.10)]">
      {/* =====================================================
          PHOTO
          - arrière-plan rempli
          - vraie photo entièrement visible
          - aucun recadrage du portrait principal
      ===================================================== */}

      <div className="relative h-[410px] overflow-hidden bg-[#eef3f3] sm:h-[440px] lg:h-[460px] xl:h-[430px] 2xl:h-[470px]">
        {/* ARRIÈRE-PLAN VISUEL */}
        <Image
          src={member.image}
          alt=""
          fill
          aria-hidden="true"
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1280px) 50vw,
            25vw
          "
          className="scale-110 object-cover opacity-[0.16] blur-xl"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-white/20"
        />

        {/* PHOTO PRINCIPALE COMPLÈTE */}
        <div className="absolute inset-2 sm:inset-3">
          <Image
            src={member.image}
            alt={`${member.fullName} - ${member.role[language]}`}
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1280px) 50vw,
              25vw
            "
            className="object-contain"
          />
        </div>
      </div>

      {/* =====================================================
          INFORMATIONS
      ===================================================== */}

      <div className="flex flex-1 flex-col px-5 py-5 text-center sm:px-6">
        <p className="mx-auto max-w-[320px] text-[12px] font-black uppercase leading-[1.45] tracking-[0.075em] text-[#007d88]">
          {member.role[language]}
        </p>

        <h4 className="mx-auto mt-2 max-w-[340px] text-[17px] font-black leading-[1.3] tracking-[-0.02em] text-[#101719] sm:text-[18px]">
          {member.fullName}
        </h4>

        <div className="mt-auto pt-5">
          <div className="h-px w-full bg-[#edf1f2]" />

          <div className="mt-4 flex items-center justify-center gap-2 text-center text-[12px] leading-5 text-[#718083]">
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