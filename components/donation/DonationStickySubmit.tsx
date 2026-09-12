"use client";

import {
  ArrowRight,
  Heart,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  formatDonationAmount,
} from "@/data/donation";
import type {
  DonationCurrency,
} from "@/types/donation";

type DonationStickySubmitProps =
  Readonly<{
    amount: number;
    currency: DonationCurrency;
    submitting: boolean;
    disabled?: boolean;
    formId?: string;
  }>;

export default function DonationStickySubmit({
  amount,
  currency,
  submitting,
  disabled = false,
  formId = "donation-form",
}: DonationStickySubmitProps) {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  const amountIsValid =
    Number.isSafeInteger(amount) &&
    amount > 0;

  const buttonIsDisabled =
    disabled ||
    submitting ||
    !amountIsValid;

  const formattedAmount =
    amountIsValid
      ? formatDonationAmount(
          amount,
          language,
          currency
        )
      : isFrench
        ? "Montant requis"
        : "Amount required";

  return (
    <div
      className={[
        "pointer-events-none fixed",
        "left-3 right-3 z-40",
        "bottom-[calc(5.75rem+env(safe-area-inset-bottom))]",
        "sm:left-auto sm:right-5",
        "sm:w-[430px]",
        "lg:bottom-5",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-auto",
          "relative overflow-hidden",
          "rounded-[24px]",
          "border border-white/20",
          "bg-[#092124]/95",
          "p-3 text-white",
          "shadow-[0_20px_55px_rgba(7,31,33,0.35)]",
          "backdrop-blur-xl",
          "sm:p-4",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none",
            "absolute -right-8 -top-8",
            "h-24 w-24 rounded-full",
            "bg-[#0097a7]/25 blur-2xl",
          ].join(" ")}
        />

        <div
          aria-hidden="true"
          className={[
            "pointer-events-none",
            "absolute -bottom-8 left-1/3",
            "h-20 w-20 rounded-full",
            "bg-[#f36c16]/20 blur-2xl",
          ].join(" ")}
        />

        <div
          className={[
            "relative flex",
            "items-center gap-3",
          ].join(" ")}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-white/55">
              {isFrench
                ? "Votre contribution"
                : "Your contribution"}
            </p>

            <p
              aria-live="polite"
              className={[
                "mt-0.5 truncate",
                "text-lg font-black",
                "tracking-[-0.025em]",
                amountIsValid
                  ? "text-[#42d1dc]"
                  : "text-white/70",
              ].join(" ")}
            >
              {formattedAmount}
            </p>

            <p className="mt-0.5 hidden items-center gap-1.5 text-[0.68rem] font-bold text-white/50 sm:flex">
              <ShieldCheck
                aria-hidden="true"
                size={13}
                className="text-[#42d1dc]"
              />

              {isFrench
                ? "Paiement sur une page sécurisée"
                : "Payment on a secure page"}
            </p>
          </div>

          <button
            type="submit"
            form={formId}
            disabled={buttonIsDisabled}
            aria-busy={submitting}
            className={[
              "group relative isolate",
              "inline-flex min-h-[52px]",
              "shrink-0 items-center",
              "justify-center gap-2",
              "overflow-hidden rounded-full",
              "!bg-[#f36c16]",
              "px-5 text-sm",
              "font-black text-white",
              "shadow-[0_10px_26px_rgba(243,108,22,0.38)]",
              "transition-all duration-200",
              "hover:-translate-y-0.5",
              "hover:!bg-[#dd5b0c]",
              "hover:shadow-[0_14px_32px_rgba(243,108,22,0.48)]",
              "active:translate-y-0",
              "disabled:cursor-not-allowed",
              "disabled:translate-y-0",
              "disabled:!bg-[#8c9799]",
              "disabled:opacity-70",
              "disabled:shadow-none",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#f36c16]/35",
              "motion-reduce:transform-none",
              "motion-reduce:transition-none",
              "sm:min-w-[210px]",
              "sm:px-6",
            ].join(" ")}
          >
            {!buttonIsDisabled && (
              <span
                aria-hidden="true"
                className={[
                  "absolute inset-0",
                  "-z-10 rounded-full",
                  "bg-[#f36c16]",
                  "opacity-40",
                  "animate-pulse",
                  "motion-reduce:animate-none",
                ].join(" ")}
              />
            )}

            {submitting ? (
              <LoaderCircle
                aria-hidden="true"
                size={18}
                className={[
                  "shrink-0 animate-spin",
                  "motion-reduce:animate-none",
                ].join(" ")}
              />
            ) : (
              <Heart
                aria-hidden="true"
                size={17}
                fill="currentColor"
                className="shrink-0"
              />
            )}

            <span className="whitespace-nowrap">
              {submitting
                ? isFrench
                  ? "Préparation…"
                  : "Preparing…"
                : isFrench
                  ? "Continuer"
                  : "Continue"}
            </span>

            {!submitting && (
              <ArrowRight
                aria-hidden="true"
                size={17}
                className={[
                  "hidden shrink-0",
                  "transition-transform",
                  "duration-200",
                  "group-hover:translate-x-1",
                  "sm:block",
                ].join(" ")}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}