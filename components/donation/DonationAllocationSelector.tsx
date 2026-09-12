"use client";

import {
  AlertTriangle,
  Apple,
  BookOpen,
  Droplets,
  HeartPulse,
  PackageOpen,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { donationAllocations } from "@/data/donation";
import type {
  DonationAllocationId,
} from "@/types/donation";

type DonationAllocationSelectorProps =
  Readonly<{
    value: DonationAllocationId;
    onChange: (
      allocation: DonationAllocationId
    ) => void;
    disabled?: boolean;
  }>;

const allocationIcons: Record<
  DonationAllocationId,
  LucideIcon
> = {
  priority: Sparkles,
  education: BookOpen,
  foodSupport: Apple,
  health: HeartPulse,
  children: Users,
  womenFamilies: Users,
  waterHygiene: Droplets,
  emergency: AlertTriangle,
  clothing: PackageOpen,
};

export default function DonationAllocationSelector({
  value,
  onChange,
  disabled = false,
}: DonationAllocationSelectorProps) {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <fieldset disabled={disabled}>
      <legend className="text-base font-black text-[#101719]">
        {isFrench
          ? "Domaine que vous souhaitez soutenir"
          : "Area you would like to support"}
      </legend>

      <p className="mt-1 text-xs leading-5 text-[#647275]">
        {isFrench
          ? "Votre choix nous indique votre préférence. L’action prioritaire permet d’agir selon les besoins les plus urgents."
          : "Your choice indicates your preference. Priority action allows support according to the most urgent needs."}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {donationAllocations.map(
          (allocation) => {
            const Icon =
              allocationIcons[
                allocation.id
              ];

            const selected =
              allocation.id === value;

            const label =
              isFrench
                ? allocation.labelFr
                : allocation.labelEn;

            return (
              <label
                key={allocation.id}
                className={[
                  "flex cursor-pointer",
                  "items-center gap-3",
                  "rounded-[18px] border",
                  "p-4 transition",
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
                  name="donation-allocation"
                  value={allocation.id}
                  checked={selected}
                  onChange={() =>
                    onChange(
                      allocation.id
                    )
                  }
                  className="sr-only"
                />

                <Icon
                  aria-hidden="true"
                  size={19}
                  className={
                    selected
                      ? "text-[#007d88]"
                      : "text-[#647275]"
                  }
                />

                <span className="text-sm font-extrabold text-[#263336]">
                  {label}
                </span>
              </label>
            );
          }
        )}
      </div>
    </fieldset>
  );
}