"use client";

import {
  BadgeCheck,
  CreditCard,
  Heart,
  Info,
  LoaderCircle,
  Smartphone,
  WalletCards,
} from "lucide-react";

import {
  useLanguage,
} from "@/components/providers/LanguageProvider";

import {
  formatDonationAmount,
  getDonationAllocationLabel,
  getDonationCurrencyLabel,
  getDonationCurrencySymbol,
  getDonationLimits,
} from "@/data/donation";

import type {
  DonationAllocationId,
  DonationCurrency,
  DonationFrequency,
  DonationPaymentMethod,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * RÉCAPITULATIF DU DON
 * ============================================================================
 *
 * Ce composant :
 *
 * - affiche le montant sélectionné ;
 * - affiche la fréquence du don ;
 * - affiche la devise ;
 * - affiche le domaine soutenu ;
 * - affiche le moyen de paiement choisi ;
 * - empêche l’envoi lorsque les données essentielles sont incomplètes ;
 * - ne collecte aucune donnée bancaire ;
 * - soumet le formulaire principal grâce à son identifiant HTML.
 *
 * La validation affichée ici améliore l’expérience utilisateur.
 * La validation définitive reste toujours effectuée côté serveur.
 * ============================================================================
 */

export type DonationSummaryProps =
  Readonly<{
    frequency:
      DonationFrequency;

    amount:
      number;

    currency:
      DonationCurrency;

    allocation:
      DonationAllocationId;

    paymentMethod:
      DonationPaymentMethod | null;

    submitting:
      boolean;
  }>;

/**
 * Retourne le libellé du moyen de paiement.
 */
function getPaymentMethodLabel(
  paymentMethod:
    DonationPaymentMethod | null,
  isFrench: boolean
): string {
  switch (paymentMethod) {
    case "mobile_money":
      return "Mobile Money";

    case "card":
      return isFrench
        ? "Carte bancaire"
        : "Bank card";

    default:
      return isFrench
        ? "Non sélectionné"
        : "Not selected";
  }
}

export default function DonationSummary({
  frequency,
  amount,
  currency,
  allocation,
  paymentMethod,
  submitting,
}: DonationSummaryProps) {
  const { language } =
    useLanguage();

  const isFrench =
    language === "fr";

  const limits =
    getDonationLimits(
      currency
    );

  const validAmount =
    Number.isSafeInteger(
      amount
    ) &&
    amount >=
      limits.minimum &&
    amount <=
      limits.maximum;

  const paymentMethodIsValid =
    paymentMethod ===
      "mobile_money" ||
    paymentMethod ===
      "card";

  const canSubmit =
    validAmount &&
    paymentMethodIsValid &&
    !submitting;

  const formattedAmount =
    formatDonationAmount(
      amount,
      language,
      currency
    );

  const currencyLabel =
    getDonationCurrencyLabel(
      currency,
      language
    );

  const currencySymbol =
    getDonationCurrencySymbol(
      currency
    );

  const allocationLabel =
    getDonationAllocationLabel(
      allocation,
      language
    );

  const paymentMethodLabel =
    getPaymentMethodLabel(
      paymentMethod,
      isFrench
    );

  const frequencyLabel =
    frequency === "monthly"
      ? isFrench
        ? "Mensuel"
        : "Monthly"
      : isFrench
        ? "Ponctuel"
        : "One-time";

  const validationMessage =
    !validAmount
      ? isFrench
        ? "Sélectionnez un montant valide pour continuer."
        : "Select a valid amount to continue."
      : !paymentMethodIsValid
        ? isFrench
          ? "Sélectionnez un moyen de paiement pour continuer."
          : "Select a payment method to continue."
        : null;

  return (
    <aside
      aria-labelledby="donation-summary-title"
      className={[
        "relative h-fit overflow-hidden",
        "rounded-[28px]",
        "bg-[#092124] p-6",
        "text-white",
        "shadow-[0_20px_55px_rgba(7,31,33,0.18)]",
        "lg:sticky lg:top-28",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none",
          "absolute -right-16 -top-16",
          "h-44 w-44 rounded-full",
          "bg-[#0097a7]/20 blur-3xl",
        ].join(" ")}
      />

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none",
          "absolute -bottom-20 -left-20",
          "h-48 w-48 rounded-full",
          "bg-[#f36c16]/15 blur-3xl",
        ].join(" ")}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className={[
              "grid h-12 w-12 shrink-0",
              "place-items-center rounded-full",
              "bg-[#f36c16]",
              "text-white",
              "shadow-[0_8px_22px_rgba(243,108,22,0.35)]",
            ].join(" ")}
          >
            <Heart
              size={22}
              fill="currentColor"
            />
          </span>

          <span
            className={[
              "inline-flex min-h-9",
              "items-center gap-2",
              "rounded-full",
              "border border-[#42d1dc]/30",
              "bg-[#42d1dc]/10 px-3",
              "text-xs font-extrabold",
              "text-[#7be4ec]",
              "backdrop-blur-sm",
            ].join(" ")}
          >
            <WalletCards
              aria-hidden="true"
              size={15}
            />

            {currencySymbol}
          </span>
        </div>

        <h2
          id="donation-summary-title"
          className="mt-5 text-2xl font-black"
        >
          {isFrench
            ? "Récapitulatif"
            : "Summary"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/65">
          {isFrench
            ? "Vérifiez les informations principales avant de continuer."
            : "Review the main information before continuing."}
        </p>

        <div
          aria-live="polite"
          className={[
            "mt-6 rounded-[22px]",
            "border border-[#42d1dc]/30",
            "bg-[#42d1dc]/10",
            "px-4 py-5 text-center",
            "shadow-inner",
            "transition-all duration-300",
            "motion-reduce:transition-none",
          ].join(" ")}
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/60">
            {isFrench
              ? "Votre don"
              : "Your donation"}
          </p>

          <p
            key={`${currency}-${amount}`}
            className={[
              "mt-2 break-words",
              "text-3xl font-black",
              "tracking-[-0.035em]",
              validAmount
                ? "text-[#42d1dc]"
                : "text-white/55",
              "transition-all duration-300",
              "sm:text-4xl",
              "motion-reduce:transition-none",
            ].join(" ")}
          >
            {formattedAmount}
          </p>

          <p className="mt-2 text-xs font-bold text-white/60">
            {frequency === "monthly"
              ? isFrench
                ? "Contribution renouvelée chaque mois"
                : "Contribution renewed every month"
              : isFrench
                ? "Contribution effectuée une seule fois"
                : "One-time contribution"}
          </p>
        </div>

        <dl className="mt-6 divide-y divide-white/15">
          <div className="flex justify-between gap-4 py-4 first:pt-0">
            <dt className="text-sm text-white/65">
              {isFrench
                ? "Fréquence"
                : "Frequency"}
            </dt>

            <dd className="text-right text-sm font-extrabold">
              {frequencyLabel}
            </dd>
          </div>

          <div className="flex justify-between gap-4 py-4">
            <dt className="text-sm text-white/65">
              {isFrench
                ? "Devise"
                : "Currency"}
            </dt>

            <dd className="max-w-[65%] text-right">
              <span className="block text-sm font-extrabold">
                {currencyLabel}
              </span>

              <span className="mt-0.5 block text-xs font-black text-[#42d1dc]">
                {currency}
              </span>
            </dd>
          </div>

          <div className="flex justify-between gap-4 py-4">
            <dt className="text-sm text-white/65">
              {isFrench
                ? "Domaine soutenu"
                : "Supported area"}
            </dt>

            <dd className="max-w-[65%] text-right text-sm font-extrabold">
              {allocationLabel || "—"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="text-sm text-white/65">
              {isFrench
                ? "Moyen de paiement"
                : "Payment method"}
            </dt>

            <dd
              className={[
                "flex max-w-[65%]",
                "items-center justify-end",
                "gap-2 text-right",
                "text-sm font-extrabold",
                paymentMethodIsValid
                  ? "text-white"
                  : "text-[#ffc59f]",
              ].join(" ")}
            >
              {paymentMethod ===
              "mobile_money" ? (
                <Smartphone
                  aria-hidden="true"
                  size={17}
                  className="shrink-0 text-[#42d1dc]"
                />
              ) : paymentMethod ===
                "card" ? (
                <CreditCard
                  aria-hidden="true"
                  size={17}
                  className="shrink-0 text-[#42d1dc]"
                />
              ) : (
                <WalletCards
                  aria-hidden="true"
                  size={17}
                  className="shrink-0"
                />
              )}

              <span>
                {paymentMethodLabel}
              </span>
            </dd>
          </div>
        </dl>

        <button
          type="submit"
          form="donation-form"
          disabled={!canSubmit}
          aria-busy={submitting}
          aria-describedby={
            validationMessage
              ? "donation-summary-validation"
              : undefined
          }
          className={[
            "group relative isolate",
            "mt-6 inline-flex",
            "min-h-[54px] w-full",
            "items-center justify-center",
            "gap-2 overflow-hidden",
            "rounded-full",
            "!bg-[#f36c16] px-6",
            "text-sm font-black",
            "!text-white",
            "shadow-[0_12px_30px_rgba(243,108,22,0.42)]",
            "transition-all duration-200",
            "hover:-translate-y-0.5",
            "hover:!bg-[#dc5b0d]",
            "hover:shadow-[0_16px_35px_rgba(243,108,22,0.52)]",
            "active:translate-y-0",
            "disabled:cursor-not-allowed",
            "disabled:translate-y-0",
            "disabled:!bg-[#7d8a8c]",
            "disabled:opacity-65",
            "disabled:shadow-none",
            "focus-visible:outline-none",
            "focus-visible:ring-4",
            "focus-visible:ring-[#f36c16]/40",
            "motion-reduce:transform-none",
            "motion-reduce:transition-none",
          ].join(" ")}
        >
          {canSubmit ? (
            <span
              aria-hidden="true"
              className={[
                "absolute inset-0 -z-10",
                "rounded-full",
                "bg-[#ff8a3d]/35",
                "animate-pulse",
                "motion-reduce:animate-none",
              ].join(" ")}
            />
          ) : null}

          {submitting ? (
            <LoaderCircle
              aria-hidden="true"
              size={19}
              className={[
                "shrink-0 animate-spin",
                "motion-reduce:animate-none",
              ].join(" ")}
            />
          ) : (
            <Heart
              aria-hidden="true"
              size={18}
              fill="currentColor"
              className="shrink-0"
            />
          )}

          <span>
            {submitting
              ? isFrench
                ? "Préparation du paiement…"
                : "Preparing payment…"
              : isFrench
                ? "Continuer vers le paiement"
                : "Continue to payment"}
          </span>
        </button>

        {validationMessage ? (
          <p
            id="donation-summary-validation"
            role="status"
            aria-live="polite"
            className="mt-3 text-center text-xs font-bold text-[#ffc59f]"
          >
            {validationMessage}
          </p>
        ) : null}

        <div
          className={[
            "mt-5 flex items-start",
            "gap-3 rounded-[16px]",
            "border border-white/10",
            "bg-white/[0.06]",
            "p-3 text-xs",
            "leading-5 text-white/65",
          ].join(" ")}
        >
          <Info
            aria-hidden="true"
            size={17}
            className="mt-0.5 shrink-0 text-[#42d1dc]"
          />

          <p>
            {isFrench
              ? "Les informations bancaires seront renseignées directement sur la page du prestataire de paiement. Young Caring ne collecte pas ces informations."
              : "Banking information will be entered directly on the payment provider’s page. Young Caring does not collect this information."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-center text-[0.7rem] font-bold text-white/50">
          <BadgeCheck
            aria-hidden="true"
            size={14}
            className="shrink-0 text-[#42d1dc]"
          />

          <span>
            {isFrench
              ? "Montant et devise contrôlés côté serveur"
              : "Amount and currency checked by the server"}
          </span>
        </div>
      </div>
    </aside>
  );
}