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
    id: "ramos-menendez-marina",
    fullName: "RAMOS MENENDEZ Marina",
    office: "france",
    image:
      "/images/governance/france/ramos-menendez-marina.png",
    role: {
      fr: "Chargée de communication et relations extérieures",
      en: "Communications and External Relations Officer",
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

  const isFrench = language === "fr";

  const franceMembers = GOVERNANCE_MEMBERS.filter(
    (member) => member.office === "france",
  );

  const beninMembers = GOVERNANCE_MEMBERS.filter(
    (member) => member.office === "benin",
  );

  const texts = isFrench
    ? {
        label: "Gouvernance",
        titleStart: "Nos",
        titleHighlight: "représentants",
        description:
          "Young Caring s’appuie sur une gouvernance structurée entre son bureau YC/JB au Bénin et son bureau relais en France. Découvrez les responsables qui participent à la gestion, à la coordination et au développement de l’organisation.",

        franceTitle: "Bureau relais France",
        franceDescription:
          "Équipe représentative et relais de Young Caring en France.",
        franceLocation: "France",

        beninTitle: "Bureau YC/JB — Bénin",
        beninDescription:
          "Bureau de gouvernance et de coordination de Young Caring au Bénin.",
        beninLocation: "Bénin",

        officialMember: "Membre de la gouvernance Young Caring",
      }
    : {
        label: "Governance",
        titleStart: "Our",
        titleHighlight: "representatives",
        description:
          "Young Caring is supported by a structured governance system between its YC/JB office in Benin and its representative office in France. Meet the people contributing to the management, coordination and development of the organisation.",

        franceTitle: "France Representative Office",
        franceDescription:
          "Young Caring's representative and liaison team in France.",
        franceLocation: "France",

        beninTitle: "YC/JB Office — Benin",
        beninDescription:
          "Young Caring's governance and coordination office in Benin.",
        beninLocation: "Benin",

        officialMember: "Young Caring governance member",
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
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eaf8f9] text-[#007d88]">
            <UsersRound
              aria-hidden="true"
              size={27}
              strokeWidth={2}
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

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[#5f6d70] sm:text-[17px]">
            {texts.description}
          </p>
        </div>

        {/* =====================================================
            BUREAU RELAIS FRANCE
        ===================================================== */}
        <div className="mx-auto mt-14 max-w-7xl">
          <OfficeHeader
            title={texts.franceTitle}
            description={texts.franceDescription}
            location={texts.franceLocation}
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {franceMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                language={isFrench ? "fr" : "en"}
                officialMember={texts.officialMember}
              />
            ))}
          </div>
        </div>

        {/* =====================================================
            SÉPARATEUR
        ===================================================== */}
        <div className="mx-auto my-14 max-w-7xl">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d9e4e5] to-transparent" />
        </div>

        {/* =====================================================
            BUREAU BÉNIN
        ===================================================== */}
        <div className="mx-auto max-w-7xl">
          <OfficeHeader
            title={texts.beninTitle}
            description={texts.beninDescription}
            location={texts.beninLocation}
          />

          <div className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {beninMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                language={isFrench ? "fr" : "en"}
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
   ENTÊTE D’UN BUREAU
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
    <div className="flex flex-col items-center justify-between gap-5 rounded-[28px] border border-[#dfe9ea] bg-white px-6 py-6 text-center shadow-[0_12px_35px_rgba(7,31,33,0.045)] md:flex-row md:px-8 md:text-left">
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf8f9] text-[#007d88]">
          <Building2
            aria-hidden="true"
            size={23}
          />
        </span>

        <div>
          <h3 className="text-xl font-black tracking-[-0.02em] text-[#101719] sm:text-2xl">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#68777a]">
            {description}
          </p>
        </div>
      </div>

      <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7f9f9] px-4 py-2 text-sm font-bold text-[#536265]">
        <MapPin
          aria-hidden="true"
          size={16}
          className="text-[#f36c16]"
        />

        {location}
      </div>
    </div>
  );
}

/* =========================================================
   CARTE D’UN MEMBRE
========================================================= */

type MemberCardProps = {
  member: GovernanceMember;
  language: "fr" | "en";
  officialMember: string;
};

function MemberCard({
  member,
  language,
  officialMember,
}: MemberCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#e1e9ea] bg-white shadow-[0_14px_38px_rgba(7,31,33,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(7,31,33,0.10)]">
      {/* PHOTO */}
      <div className="relative aspect-[4/4.8] w-full overflow-hidden bg-[#eef3f3]">
        <Image
          src={member.image}
          alt={member.fullName}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            25vw
          "
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
        />

        {/* léger dégradé pour finition visuelle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent"
        />
      </div>

      {/* INFORMATIONS */}
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5 text-center">
        <p className="text-xs font-black uppercase leading-5 tracking-[0.08em] text-[#007d88]">
          {member.role[language]}
        </p>

        <h4 className="mt-2 text-[17px] font-black leading-snug text-[#101719]">
          {member.fullName}
        </h4>

        <div className="mt-auto pt-5">
          <div className="mx-auto h-px w-full bg-[#edf1f2]" />

          <p className="mt-4 flex items-center justify-center gap-2 text-xs leading-5 text-[#718083]">
            <BadgeCheck
              aria-hidden="true"
              size={16}
              className="shrink-0 text-[#f36c16]"
            />

            <span>{officialMember}</span>
          </p>
        </div>
      </div>
    </article>
  );
}