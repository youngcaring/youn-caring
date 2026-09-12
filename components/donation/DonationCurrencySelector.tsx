"use client";

import {
  BadgeDollarSign,
  Banknote,
  Check,
  CircleDollarSign,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

export type DonationCurrency =
  | "XOF"
  | "EUR"
  | "USD";

type DonationCurrencySelectorProps =
  Readonly<{
    value: DonationCurrency;
    onChange: (
      currency: DonationCurrency
    ) => void;
    disabled?: boolean;
  }>;

type CurrencyOption = Readonly<{
  id: DonationCurrency;
  symbol: string;
  labelFr: string;
  labelEn: string;
  descriptionFr: string;
  descriptionEn: string;
  icon: typeof Banknote;
}>;

const currencyOptions:
  readonly CurrencyOption[] = [
  {
    id: "XOF",
    symbol: "FCFA",
    labelFr: "Franc CFA",
    labelEn: "CFA franc",
    descriptionFr:
      "Pour les dons en Afrique de l’Ouest",
    descriptionEn:
      "For donations in West Africa",
    icon: Banknote,
  },
  {
    id: "EUR",
    symbol: "€",
    labelFr: "Euro",
    labelEn: "Euro",
    descriptionFr:
      "Pour les dons depuis l’Europe",
    descriptionEn:
      "For donations from Europe",
    icon: CircleDollarSign,
  },
  {
    id: "USD",
    symbol: "$",
    labelFr: "Dollar américain",
    labelEn: "US dollar",
    descriptionFr:
      "Pour les dons internationaux",
    descriptionEn:
      "For international donations",
    icon: BadgeDollarSign,
  },
];

export default function DonationCurrencySelector({
  value,
  onChange,
  disabled = false,
}: DonationCurrencySelectorProps) {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <fieldset
      disabled={disabled}
      className="min-w-0 border-0 p-0"
    >
      <legend className="text-lg font-black text-[#101719]">
        {isFrench
          ? "Choisissez votre devise"
          : "Choose your currency"}
      </legend>

      <p
        id="donation-currency-description"
        className="mt-1 text-sm leading-6 text-[#647275]"
      >
        {isFrench
          ? "Sélectionnez la devise dans laquelle vous souhaitez effectuer votre don."
          : "Select the currency you would like to use for your donation."}
      </p>

      <div
        role="radiogroup"
        aria-describedby="donation-currency-description"
        className={[
          "mt-5 grid grid-cols-3 gap-2",
          "rounded-[22px]",
          "border border-[#dfe7e8]",
          "bg-[#f5f8f8] p-2",
          "sm:gap-3 sm:p-3",
        ].join(" ")}
      >
        {currencyOptions.map(
          (currency) => {
            const Icon = currency.icon;
            const selected =
              value === currency.id;

            return (
              <button
                key={currency.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={
                  isFrench
                    ? `${currency.labelFr}, ${currency.symbol}`
                    : `${currency.labelEn}, ${currency.symbol}`
                }
                disabled={disabled}
                onClick={() => {
                  if (
                    !disabled &&
                    !selected
                  ) {
                    onChange(currency.id);
                  }
                }}
                className={[
                  "group relative isolate",
                  "min-h-[92px] min-w-0",
                  "overflow-hidden rounded-[17px]",
                  "border px-2 py-3",
                  "text-center",
                  "transition-all duration-300",
                  "ease-out",
                  "motion-reduce:transition-none",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4",
                  "focus-visible:ring-[#0097a7]/25",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-55",
                  selected
                    ? [
                        "border-[#0097a7]",
                        "bg-[#0097a7]",
                        "text-white",
                        "shadow-[0_10px_25px_rgba(0,151,167,0.28)]",
                        "-translate-y-0.5",
                      ].join(" ")
                    : [
                        "border-transparent",
                        "bg-white text-[#263538]",
                        "shadow-[0_3px_12px_rgba(7,31,33,0.05)]",
                        "hover:-translate-y-0.5",
                        "hover:border-[#0097a7]/45",
                        "hover:shadow-[0_10px_24px_rgba(7,31,33,0.10)]",
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
                      : "group-hover:scale-y-[0.05]",
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
                      "animate-in zoom-in",
                      "duration-200",
                      "motion-reduce:animate-none",
                      "sm:right-2 sm:top-2",
                    ].join(" ")}
                  >
                    <Check
                      size={13}
                      strokeWidth={3}
                    />
                  </span>
                )}

                <span
                  className={[
                    "mx-auto grid h-9 w-9",
                    "place-items-center",
                    "rounded-full",
                    "transition-all duration-300",
                    "motion-reduce:transition-none",
                    selected
                      ? "bg-white/18 text-white"
                      : [
                          "bg-[#eaf8f9]",
                          "text-[#007d88]",
                          "group-hover:scale-110",
                        ].join(" "),
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    size={19}
                    strokeWidth={2.2}
                  />
                </span>

                <span className="mt-2 block truncate text-sm font-black sm:text-base">
                  {currency.symbol}
                </span>

                <span
                  className={[
                    "mt-0.5 hidden truncate",
                    "text-[0.67rem] font-bold",
                    "sm:block",
                    selected
                      ? "text-white/75"
                      : "text-[#718083]",
                  ].join(" ")}
                >
                  {isFrench
                    ? currency.labelFr
                    : currency.labelEn}
                </span>
              </button>
            );
          }
        )}
      </div>

      <div
        aria-live="polite"
        className={[
          "mt-4 flex items-center gap-3",
          "rounded-[16px]",
          "border border-[#cde8eb]",
          "bg-[#edf9fa] px-4 py-3",
          "text-sm text-[#405154]",
          "transition-all duration-300",
          "motion-reduce:transition-none",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "grid h-9 w-9 shrink-0",
            "place-items-center",
            "rounded-full bg-[#0097a7]",
            "font-black text-white",
            "shadow-[0_5px_14px_rgba(0,151,167,0.22)]",
          ].join(" ")}
        >
          {
            currencyOptions.find(
              (currency) =>
                currency.id === value
            )?.symbol
          }
        </span>

        <p className="min-w-0 leading-5">
          <span className="font-extrabold text-[#172326]">
            {isFrench
              ? currencyOptions.find(
                  (currency) =>
                    currency.id === value
                )?.labelFr
              : currencyOptions.find(
                  (currency) =>
                    currency.id === value
                )?.labelEn}
          </span>

          <span className="block text-xs text-[#647275]">
            {isFrench
              ? currencyOptions.find(
                  (currency) =>
                    currency.id === value
                )?.descriptionFr
              : currencyOptions.find(
                  (currency) =>
                    currency.id === value
                )?.descriptionEn}
          </span>
        </p>
      </div>
    </fieldset>
  );
}