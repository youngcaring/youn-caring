"use client";

import { useId } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getDonationCurrencySymbol, getDonationLimits } from "@/data/donation";
import type { DonationCurrency } from "@/types/donation";

type Props = Readonly<{
  currency?: DonationCurrency;
  selectedAmount: number | null;
  customAmount: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}>;

export default function DonationAmountSelector({ currency = "XOF", customAmount, onCustomAmountChange, error, disabled = false }: Props) {
  const { language } = useLanguage();
  const id = useId();
  const errorId = useId();
  const limits = getDonationLimits(currency);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-extrabold text-[#263538]">
        {language === "fr" ? "Montant du don" : "Donation amount"} ({getDonationCurrencySymbol(currency)})
      </label>
      <input id={id} type="text" inputMode="numeric" autoComplete="off" required
        value={customAmount} maxLength={10} disabled={disabled}
        placeholder={language === "fr" ? "Saisissez votre montant" : "Enter your amount"}
        aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}
        onChange={(event) => onCustomAmountChange(event.target.value.replace(/\D/g, "").slice(0, 10))}
        className="mt-2 h-14 w-full rounded-xl border border-[#cbdadb] bg-white px-4 text-base font-bold outline-none focus:border-[#0097a7] focus:ring-4 focus:ring-[#0097a7]/10 disabled:opacity-60" />
      {error && <p id={errorId} role="alert" className="mt-2 text-sm font-bold text-red-700">{error}</p>}
      <p className="mt-2 text-xs text-[#647275]">{language === "fr" ? "Minimum" : "Minimum"} : {limits.minimum.toLocaleString(language === "fr" ? "fr-FR" : "en-US")} {currency}</p>
    </div>
  );
}
