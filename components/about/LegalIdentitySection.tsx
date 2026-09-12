"use client";

import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileCheck2,
  Landmark,
  MapPin,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  aboutLegalIdentity,
  formatOfficialDate,
  getLocalizedAboutText,
} from "@/data/about";

export default function LegalIdentitySection() {
  const { language } = useLanguage();

  const texts =
    language === "fr"
      ? {
          label: "Identité juridique",
          titleStart: "Une organisation",
          titleHighlight: "officiellement déclarée",
          description:
            "Les informations présentées dans cette section proviennent du récépissé de déclaration d’association délivré en République du Bénin.",
          legalName: "Dénomination",
          abbreviation: "Sigle",
          status: "Statut",
          registration: "Numéro d’enregistrement",
          assemblyDate:
            "Assemblée générale constitutive",
          receiptDate: "Date du récépissé",
          registeredOffice: "Siège déclaré",
          verification:
            "Informations issues du document officiel de déclaration.",
        }
      : {
          label: "Legal identity",
          titleStart: "An officially",
          titleHighlight: "declared organisation",
          description:
            "The information in this section comes from the association declaration receipt issued in the Republic of Benin.",
          legalName: "Legal name",
          abbreviation: "Abbreviation",
          status: "Status",
          registration: "Registration number",
          assemblyDate:
            "Constitutive general assembly",
          receiptDate: "Receipt date",
          registeredOffice: "Registered office",
          verification:
            "Information taken from the official declaration document.",
        };

  const legalName = `${aboutLegalIdentity.legalName} / ${aboutLegalIdentity.frenchName}`;

  const details = [
    {
      id: "name",
      label: texts.legalName,
      value: legalName,
      Icon: Building2,
    },
    {
      id: "abbreviation",
      label: texts.abbreviation,
      value: aboutLegalIdentity.abbreviation,
      Icon: BadgeCheck,
    },
    {
      id: "status",
      label: texts.status,
      value: getLocalizedAboutText(
        aboutLegalIdentity.organizationType,
        language
      ),
      Icon: Landmark,
    },
    {
      id: "registration",
      label: texts.registration,
      value:
        aboutLegalIdentity.registrationNumber,
      Icon: FileCheck2,
    },
    {
      id: "assembly-date",
      label: texts.assemblyDate,
      value: formatOfficialDate(
        aboutLegalIdentity.constitutiveAssemblyDate,
        language
      ),
      Icon: CalendarDays,
    },
    {
      id: "receipt-date",
      label: texts.receiptDate,
      value: formatOfficialDate(
        aboutLegalIdentity.declarationReceiptDate,
        language
      ),
      Icon: CalendarDays,
    },
  ] as const;

  return (
    <section
      aria-labelledby="legal-identity-title"
      className="site-section bg-white"
    >
      <div className="site-container">
        <div className="overflow-hidden rounded-[32px] bg-[#092124] text-white shadow-[0_22px_55px_rgba(7,31,33,0.16)]">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.75fr_1.25fr] lg:p-12">
            <div>
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f36c16] text-white">
                <FileCheck2
                  aria-hidden="true"
                  size={31}
                />
              </span>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.1em] text-[#f36c16]">
                {texts.label}
              </p>

              <h2
                id="legal-identity-title"
                className="mt-3 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl"
              >
                {texts.titleStart}{" "}
                <span className="text-[#2bc6d4]">
                  {texts.titleHighlight}
                </span>
              </h2>

              <p className="mt-5 text-base leading-7 text-white/70">
                {texts.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {details.map(
                ({ id, label, value, Icon }) => (
                  <div
                    key={id}
                    className="rounded-[22px] border border-white/10 bg-white/[0.07] p-5"
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        aria-hidden="true"
                        size={20}
                        className="mt-0.5 shrink-0 text-[#2bc6d4]"
                      />

                      <div className="min-w-0">
                        <dt className="text-xs font-black uppercase tracking-[0.08em] text-white/55">
                          {label}
                        </dt>

                        <dd className="mt-2 break-words text-sm font-bold leading-6 text-white">
                          {value}
                        </dd>
                      </div>
                    </div>
                  </div>
                )
              )}

              <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-5 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <MapPin
                    aria-hidden="true"
                    size={20}
                    className="mt-0.5 shrink-0 text-[#f36c16]"
                  />

                  <div>
                    <dt className="text-xs font-black uppercase tracking-[0.08em] text-white/55">
                      {texts.registeredOffice}
                    </dt>

                    <dd className="mt-2 text-sm font-bold leading-6 text-white">
                      {getLocalizedAboutText(
                        aboutLegalIdentity.registeredOffice,
                        language
                      )}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 bg-black/10 px-7 py-4 text-xs text-white/60 sm:px-10 lg:px-12">
            <BadgeCheck
              aria-hidden="true"
              size={17}
              className="shrink-0 text-[#2bc6d4]"
            />

            {texts.verification}
          </div>
        </div>
      </div>
    </section>
  );
}