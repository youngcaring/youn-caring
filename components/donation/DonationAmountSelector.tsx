"use client";

import {
  useId,
  useMemo,
} from "react";
import {
  Banknote,
  Check,
  Sparkles,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  formatDonationAmount,
  getDonationAmounts,
  getDonationCurrencySymbol,
  getDonationLimits,
} from "@/data/donation";
import type {
  DonationCurrency,
} from "@/types/donation";

type DonationAmountSelectorProps =
  Readonly<{
    currency?: DonationCurrency;
    selectedAmount: number | null;
    customAmount: string;
    onSelectAmount: (
      amount: number
    ) => void;
    onCustomAmountChange: (
      value: string
    ) => void;
    error?: string;
    disabled?: boolean;
  }>;

export default function DonationAmountSelector({
  currency = "XOF",
  selectedAmount,
  customAmount,
  onSelectAmount,
  onCustomAmountChange,
  error,
  disabled = false,
}: DonationAmountSelectorProps) {
  const { language } = useLanguage();

  const customAmountId = useId();
  const helpId = useId();
  const errorId = useId();

  const isFrench = language === "fr";

  const amounts = useMemo(
    () => getDonationAmounts(currency),
    [currency]
  );

  const limits = useMemo(
    () => getDonationLimits(currency),
    [currency]
  );

  const currencySymbol =
    getDonationCurrencySymbol(currency);

  const formattedMinimum =
    formatDonationAmount(
      limits.minimum,
      language,
      currency
    );

  const describedBy = error
    ? `${helpId} ${errorId}`
    : helpId;

  return (
    <fieldset
      disabled={disabled}
      aria-describedby={describedBy}
      className="min-w-0 border-0 p-0"
    >
      <div
        className={[
          "relative overflow-hidden",
          "rounded-[24px]",
          "border border-[#dce7e8]",
          "bg-[linear-gradient(145deg,#ffffff_0%,#f5fbfb_100%)]",
          "p-4 sm:p-5",
          "shadow-[0_10px_30px_rgba(7,31,33,0.05)]",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none",
            "absolute -right-10 -top-10",
            "h-32 w-32 rounded-full",
            "bg-[#0097a7]/[0.06]",
            "blur-2xl",
          ].join(" ")}
        />

        <div
          aria-hidden="true"
          className={[
            "pointer-events-none",
            "absolute -bottom-12 -left-10",
            "h-28 w-28 rounded-full",
            "bg-[#f36c16]/[0.06]",
            "blur-2xl",
          ].join(" ")}
        />

        <div className="relative">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={[
                "grid h-11 w-11 shrink-0",
                "place-items-center rounded-full",
                "bg-[#e7f8f9]",
                "text-[#007d88]",
              ].join(" ")}
            >
              <Sparkles
                size={20}
                strokeWidth={2.2}
              />
            </span>

            <div className="min-w-0">
              <legend className="text-lg font-black text-[#101719]">
                {isFrench
                  ? "Choisissez un montant"
                  : "Choose an amount"}
              </legend>

              <p
                id={helpId}
                className="mt-1 text-xs leading-5 text-[#647275]"
              >
                {isFrench
                  ? `Montant minimum : ${formattedMinimum}`
                  : `Minimum amount: ${formattedMinimum}`}
              </p>
            </div>
          </div>

          <div
            aria-label={
              isFrench
                ? "Montants suggérés"
                : "Suggested amounts"
            }
            className={[
              "mt-5 grid grid-cols-2",
              "gap-3 sm:grid-cols-3",
            ].join(" ")}
          >
            {amounts.map((amount) => {
              const selected =
                selectedAmount === amount &&
                customAmount.length === 0;

              return (
                <button
                  key={`${currency}-${amount}`}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      onSelectAmount(amount);
                    }
                  }}
                  className={[
                    "group relative isolate",
                    "min-h-[64px] min-w-0",
                    "overflow-hidden",
                    "rounded-[18px] border",
                    "px-3 py-2",
                    "text-sm font-black",
                    "transition-all duration-300",
                    "ease-out",
                    "motion-reduce:transition-none",
                    "focus-visible:outline-none",
                    "focus-visible:ring-4",
                    "focus-visible:ring-[#0097a7]/20",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                    selected
                      ? [
                          "-translate-y-0.5",
                          "border-[#0097a7]",
                          "bg-[#0097a7]",
                          "text-white",
                          "shadow-[0_10px_24px_rgba(0,151,167,0.26)]",
                        ].join(" ")
                      : [
                          "border-[#dce6e7]",
                          "bg-white",
                          "text-[#263538]",
                          "shadow-[0_3px_12px_rgba(7,31,33,0.04)]",
                          "hover:-translate-y-0.5",
                          "hover:border-[#0097a7]",
                          "hover:text-[#007d88]",
                          "hover:shadow-[0_10px_22px_rgba(7,31,33,0.10)]",
                        ].join(" "),
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "absolute inset-0 -z-10",
                      "origin-bottom scale-y-0",
                      "bg-[linear-gradient(145deg,#0097a7,#007d88)]",
                      "transition-transform duration-300",
                      "motion-reduce:transition-none",
                      selected
                        ? "scale-y-100"
                        : "group-hover:scale-y-[0.04]",
                    ].join(" ")}
                  />

                  {selected && (
                    <span
                      aria-hidden="true"
                      className={[
                        "absolute right-1.5 top-1.5",
                        "grid h-5 w-5",
                        "place-items-center",
                        "rounded-full bg-white",
                        "text-[#007d88]",
                        "shadow-sm",
                      ].join(" ")}
                    >
                      <Check
                        size={12}
                        strokeWidth={3}
                      />
                    </span>
                  )}

                  <span className="block truncate">
                    {formatDonationAmount(
                      amount,
                      language,
                      currency
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <label
              htmlFor={customAmountId}
              className="block text-sm font-extrabold text-[#263538]"
            >
              {isFrench
                ? "Autre montant"
                : "Other amount"}
            </label>

            <p className="mt-1 text-xs leading-5 text-[#718083]">
              {isFrench
                ? "Vous pouvez également saisir librement le montant de votre choix."
                : "You can also enter an amount of your choice."}
            </p>

            <div className="relative mt-3">
              <Banknote
                aria-hidden="true"
                size={20}
                className={[
                  "pointer-events-none",
                  "absolute left-4 top-1/2",
                  "-translate-y-1/2",
                  error
                    ? "text-red-600"
                    : "text-[#647275]",
                ].join(" ")}
              />

              <input
                id={customAmountId}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={customAmount}
                maxLength={10}
                disabled={disabled}
                placeholder={
                  isFrench
                    ? "Saisissez le montant"
                    : "Enter the amount"
                }
                aria-invalid={
                  error ? true : undefined
                }
                aria-describedby={
                  describedBy
                }
                onChange={(event) => {
                  const digits =
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                  onCustomAmountChange(
                    digits
                  );
                }}
                className={[
                  "h-[54px] w-full",
                  "rounded-[18px] border-2",
                  "bg-white pl-12 pr-24",
                  "text-base font-extrabold",
                  "text-[#172326]",
                  "outline-none",
                  "transition-all duration-200",
                  "placeholder:font-medium",
                  "placeholder:text-[#879396]",
                  "focus:ring-4",
                  "disabled:cursor-not-allowed",
                  "disabled:bg-[#f1f4f4]",
                  "disabled:opacity-60",
                  error
                    ? [
                        "border-red-500",
                        "focus:border-red-500",
                        "focus:ring-red-500/10",
                      ].join(" ")
                    : [
                        "border-[#dce6e7]",
                        "hover:border-[#0097a7]/60",
                        "focus:border-[#0097a7]",
                        "focus:ring-[#0097a7]/10",
                      ].join(" "),
                ].join(" ")}
              />

              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none",
                  "absolute right-3 top-1/2",
                  "-translate-y-1/2",
                  "rounded-full",
                  "bg-[#eaf8f9]",
                  "px-3 py-1.5",
                  "text-xs font-black",
                  "text-[#007d88]",
                ].join(" ")}
              >
                {currencySymbol}
              </span>
            </div>
          </div>

          {error && (
            <div
              id={errorId}
              role="alert"
              className={[
                "mt-3 rounded-[14px]",
                "border border-red-200",
                "bg-red-50 px-4 py-3",
                "text-sm font-bold",
                "leading-5 text-red-700",
              ].join(" ")}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
}