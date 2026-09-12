"use client";

import {
  CalendarHeart,
  Heart,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { DonationFrequency } from "@/types/donation";

type DonationFrequencySelectorProps =
  Readonly<{
    value: DonationFrequency;
    onChange: (
      frequency: DonationFrequency
    ) => void;
    disabled?: boolean;
  }>;

export default function DonationFrequencySelector({
  value,
  onChange,
  disabled = false,
}: DonationFrequencySelectorProps) {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  const options = [
    {
      id: "once",
      label: isFrench
        ? "Don ponctuel"
        : "One-time donation",
      description: isFrench
        ? "Une contribution unique"
        : "A single contribution",
      icon: Heart,
    },
    {
      id: "monthly",
      label: isFrench
        ? "Don mensuel"
        : "Monthly donation",
      description: isFrench
        ? "Un soutien régulier"
        : "Regular support",
      icon: CalendarHeart,
    },
  ] satisfies readonly {
    id: DonationFrequency;
    label: string;
    description: string;
    icon: typeof Heart;
  }[];

  return (
    <fieldset disabled={disabled}>
      <legend className="text-base font-black text-[#101719]">
        {isFrench
          ? "Fréquence du don"
          : "Donation frequency"}
      </legend>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const selected =
            value === option.id;

          return (
            <label
              key={option.id}
              className={[
                "relative flex cursor-pointer",
                "items-start gap-3 rounded-[20px]",
                "border p-4 transition",
                "has-[:focus-visible]:ring-4",
                "has-[:focus-visible]:ring-[#0097a7]/20",
                selected
                  ? "border-[#0097a7] bg-[#eaf8f9]"
                  : "border-[#dfe7e8] bg-white hover:border-[#0097a7]",
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name="donation-frequency"
                value={option.id}
                checked={selected}
                onChange={() =>
                  onChange(option.id)
                }
                className="sr-only"
              />

              <span
                className={[
                  "grid h-10 w-10 shrink-0",
                  "place-items-center rounded-full",
                  selected
                    ? "bg-[#0097a7] text-white"
                    : "bg-[#edf3f3] text-[#526164]",
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  size={19}
                />
              </span>

              <span>
                <span className="block text-sm font-black text-[#101719]">
                  {option.label}
                </span>

                <span className="mt-1 block text-xs text-[#647275]">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}