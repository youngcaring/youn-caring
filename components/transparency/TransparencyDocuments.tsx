"use client";

import {
  Download,
  FileCheck2,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function TransparencyDocuments() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      id="documents"
      aria-labelledby="documents-title"
      className="site-section scroll-mt-32 bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {isFrench
              ? "Documents officiels"
              : "Official documents"}
          </p>

          <h2
            id="documents-title"
            className="section-title"
          >
            {isFrench
              ? "Consultez les documents "
              : "View the available "}

            <span className="text-[#0097a7]">
              {isFrench
                ? "disponibles"
                : "documents"}
            </span>
          </h2>

          <p className="section-description">
            {isFrench
              ? "Cette section rassemble uniquement les documents officiels réellement mis à disposition par Young Caring."
              : "This section contains only official documents genuinely made available by Young Caring."}
          </p>
        </div>

        <article
          className={[
            "mt-10 flex flex-col gap-6",
            "rounded-[28px] border",
            "border-[#dce6e7]",
            "bg-white p-6",
            "shadow-[0_16px_45px_rgba(7,31,33,0.07)]",
            "md:flex-row md:items-center",
            "md:justify-between md:p-8",
          ].join(" ")}
        >
          <div className="flex items-start gap-4">
            <span
              className={[
                "grid h-14 w-14 shrink-0",
                "place-items-center rounded-2xl",
                "bg-[#e8f7f8]",
                "text-[#007d88]",
              ].join(" ")}
            >
              <FileCheck2
                aria-hidden="true"
                size={26}
              />
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-[#101719]">
                  {isFrench
                    ? "Récépissé officiel"
                    : "Official registration receipt"}
                </h3>

                <span
                  className={[
                    "inline-flex items-center gap-1",
                    "rounded-full bg-[#e7f8ee]",
                    "px-2.5 py-1",
                    "text-[0.68rem] font-extrabold",
                    "text-[#167340]",
                  ].join(" ")}
                >
                  <ShieldCheck
                    aria-hidden="true"
                    size={13}
                  />

                  {isFrench
                    ? "Document officiel"
                    : "Official document"}
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#5f6d70]">
                {isFrench
                  ? "Document administratif confirmant l’existence légale de l’organisation Young Caring."
                  : "Administrative document confirming the legal existence of Young Caring."}
              </p>

              <p className="mt-2 text-xs font-bold text-[#647275]">
                PDF
              </p>
            </div>
          </div>

          <a
            href="/documents/recepisse-young-caring.pdf"
            download
            className={[
              "inline-flex min-h-12 shrink-0",
              "items-center justify-center gap-2",
              "rounded-full bg-[#0097a7]",
              "px-5 text-sm font-extrabold",
              "text-white transition",
              "hover:bg-[#007d88]",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#0097a7]/20",
            ].join(" ")}
          >
            <Download
              aria-hidden="true"
              size={18}
            />

            {isFrench
              ? "Télécharger"
              : "Download"}
          </a>
        </article>

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#eaf8f9] p-4 text-sm leading-6 text-[#315d62]">
          <FileText
            aria-hidden="true"
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p>
            {isFrench
              ? "D’autres documents seront ajoutés uniquement après leur validation officielle."
              : "Other documents will only be added after official validation."}
          </p>
        </div>
      </div>
    </section>
  );
}