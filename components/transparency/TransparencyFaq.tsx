"use client";

import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const questions = [
  {
    questionFr:
      "Comment les contributions sont-elles utilisées ?",
    questionEn:
      "How are contributions used?",
    answerFr:
      "Les contributions servent à préparer et soutenir les actions de Young Caring selon les besoins identifiés et les moyens disponibles.",
    answerEn:
      "Contributions help prepare and support Young Caring’s actions according to identified needs and available resources.",
  },
  {
    questionFr:
      "Puis-je soutenir une action particulière ?",
    questionEn:
      "Can I support a particular action?",
    answerFr:
      "Vous pouvez contacter Young Caring afin de préciser l’action ou le domaine que vous souhaitez soutenir.",
    answerEn:
      "You can contact Young Caring to specify the action or area you would like to support.",
  },
  {
    questionFr:
      "Comment vérifier l’identité de l’organisation ?",
    questionEn:
      "How can I verify the organisation’s identity?",
    answerFr:
      "L’identité légale et le récépissé officiel sont présentés sur cette page.",
    answerEn:
      "The legal identity and official registration receipt are presented on this page.",
  },
  {
    questionFr:
      "Comment devenir bénévole ?",
    questionEn:
      "How can I become a volunteer?",
    answerFr:
      "Utilisez la page Contact et sélectionnez le sujet lié au bénévolat afin de présenter votre disponibilité.",
    answerEn:
      "Use the Contact page and select the volunteering subject to present your availability.",
  },
  {
    questionFr:
      "Comment proposer un partenariat ?",
    questionEn:
      "How can I propose a partnership?",
    answerFr:
      "Présentez votre organisation, votre proposition et vos coordonnées à travers la page Contact.",
    answerEn:
      "Present your organisation, proposal and contact details through the Contact page.",
  },
] as const;

export default function TransparencyFaq() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      id="questions"
      aria-labelledby="transparency-faq-title"
      className="site-section scroll-mt-32 bg-white"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <HelpCircle
              aria-hidden="true"
              size={30}
              className="mx-auto text-[#0097a7]"
            />

            <p className="section-label mt-4">
              {isFrench
                ? "Questions fréquentes"
                : "Frequently asked questions"}
            </p>

            <h2
              id="transparency-faq-title"
              className="section-title"
            >
              {isFrench
                ? "Vos questions sur "
                : "Your questions about "}

              <span className="text-[#0097a7]">
                {isFrench
                  ? "la transparence"
                  : "transparency"}
              </span>
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {questions.map((item) => (
              <details
                key={item.questionFr}
                className={[
                  "group rounded-[22px]",
                  "border border-[#e0e8e9]",
                  "bg-[#f9fbfb] px-5",
                  "open:bg-white",
                  "open:shadow-[0_12px_35px_rgba(7,31,33,0.07)]",
                ].join(" ")}
              >
                <summary
                  className={[
                    "flex min-h-16 cursor-pointer",
                    "list-none items-center",
                    "justify-between gap-4",
                    "font-extrabold text-[#101719]",
                    "focus-visible:outline-none",
                    "[&::-webkit-details-marker]:hidden",
                  ].join(" ")}
                >
                  <span>
                    {isFrench
                      ? item.questionFr
                      : item.questionEn}
                  </span>

                  <ChevronDown
                    aria-hidden="true"
                    size={20}
                    className={[
                      "shrink-0 text-[#0097a7]",
                      "transition-transform",
                      "group-open:rotate-180",
                    ].join(" ")}
                  />
                </summary>

                <p className="border-t border-[#e5ebec] py-5 text-sm leading-7 text-[#5f6d70]">
                  {isFrench
                    ? item.answerFr
                    : item.answerEn}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}