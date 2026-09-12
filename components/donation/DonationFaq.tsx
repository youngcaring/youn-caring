"use client";

import {
  ChevronDown,
  HelpCircle,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const questions = [
  {
    questionFr:
      "Le paiement est-il sécurisé ?",
    questionEn:
      "Is the payment secure?",
    answerFr:
      "Oui. Le paiement est réalisé sur la page sécurisée du prestataire. Young Caring ne collecte aucune donnée bancaire.",
    answerEn:
      "Yes. Payment is completed on the provider’s secure page. Young Caring does not collect banking information.",
  },
  {
    questionFr:
      "Puis-je faire un don anonyme ?",
    questionEn:
      "Can I donate anonymously?",
    answerFr:
      "Oui. Vous pouvez demander que votre identité ne soit pas affichée dans les éventuels remerciements publics.",
    answerEn:
      "Yes. You can request that your identity not be displayed in any public acknowledgements.",
  },
  {
    questionFr:
      "Puis-je choisir un domaine à soutenir ?",
    questionEn:
      "Can I choose an area to support?",
    answerFr:
      "Oui. Votre choix indique votre préférence. L’option Action prioritaire permet à Young Caring d’agir selon les besoins identifiés.",
    answerEn:
      "Yes. Your choice indicates your preference. The Priority action option allows Young Caring to act according to identified needs.",
  },
  {
    questionFr:
      "Vais-je recevoir une confirmation ?",
    questionEn:
      "Will I receive confirmation?",
    answerFr:
      "Une confirmation sera affichée après la vérification du paiement et pourra également être envoyée à votre adresse email.",
    answerEn:
      "A confirmation will be displayed after payment verification and may also be sent to your email address.",
  },
  {
    questionFr:
      "Que faire en cas de problème ?",
    questionEn:
      "What should I do if there is a problem?",
    answerFr:
      "N’effectuez pas plusieurs paiements successifs. Notez la référence affichée et contactez Young Caring depuis la page Contact.",
    answerEn:
      "Do not make several successive payments. Note the displayed reference and contact Young Caring through the Contact page.",
  },
] as const;

export default function DonationFaq() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      aria-labelledby="donation-faq-title"
      className="site-section bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <HelpCircle
              aria-hidden="true"
              size={32}
              className="mx-auto text-[#0097a7]"
            />

            <p className="section-label mt-4">
              {isFrench
                ? "Questions fréquentes"
                : "Frequently asked questions"}
            </p>

            <h2
              id="donation-faq-title"
              className="section-title"
            >
              {isFrench
                ? "Avant de faire "
                : "Before making "}

              <span className="text-[#0097a7]">
                {isFrench
                  ? "votre don"
                  : "your donation"}
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
                  "bg-white px-5",
                  "open:shadow-[0_12px_35px_rgba(7,31,33,0.07)]",
                ].join(" ")}
              >
                <summary
                  className={[
                    "flex min-h-16",
                    "cursor-pointer list-none",
                    "items-center justify-between",
                    "gap-4 font-extrabold",
                    "text-[#101719]",
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
                    className="shrink-0 text-[#0097a7] transition-transform group-open:rotate-180"
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