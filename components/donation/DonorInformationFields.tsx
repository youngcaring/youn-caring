"use client";

import {
  useId,
} from "react";
import {
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type {
  DonationDonor,
  DonationFieldErrors,
} from "@/types/donation";

type DonorInformationFieldsProps =
  Readonly<{
    value: DonationDonor;
    errors: DonationFieldErrors;
    onChange: <
      Key extends keyof DonationDonor
    >(
      field: Key,
      value: DonationDonor[Key]
    ) => void;
    disabled?: boolean;
  }>;

type TextFieldProps = Readonly<{
  id: string;
  label: string;
  name: string;
  type: "text" | "email" | "tel";
  value: string;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  maxLength: number;
  error?: string;
  icon: typeof User;
  onChange: (value: string) => void;
}>;

function TextField({
  id,
  label,
  name,
  type,
  value,
  placeholder,
  autoComplete,
  required = false,
  maxLength,
  error,
  icon: Icon,
  onChange,
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-extrabold text-[#334144]"
      >
        {label}

        {required && (
          <span
            aria-hidden="true"
            className="ml-1 text-[#d85210]"
          >
            *
          </span>
        )}
      </label>

      <div className="relative mt-2">
        <Icon
          aria-hidden="true"
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647275]"
        />

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={
            error ? true : undefined
          }
          aria-describedby={
            error ? errorId : undefined
          }
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={[
            "h-13 w-full rounded-[18px]",
            "border bg-white pl-11 pr-4",
            "text-sm outline-none transition",
            "focus:ring-4",
            error
              ? "border-red-500 focus:ring-red-500/10"
              : "border-[#dfe7e8] focus:border-[#0097a7] focus:ring-[#0097a7]/10",
          ].join(" ")}
        />
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm font-bold text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function DonorInformationFields({
  value,
  errors,
  onChange,
  disabled = false,
}: DonorInformationFieldsProps) {
  const { language } = useLanguage();
  const baseId = useId();
  const isFrench = language === "fr";

  return (
    <fieldset
      disabled={disabled}
      className="min-w-0"
    >
      <legend className="text-base font-black text-[#101719]">
        {isFrench
          ? "Vos informations"
          : "Your information"}
      </legend>

      <p className="mt-1 text-xs leading-5 text-[#647275]">
        {isFrench
          ? "Nous demandons uniquement les informations nécessaires à la confirmation du don."
          : "We only request the information necessary to confirm your donation."}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <TextField
          id={`${baseId}-first-name`}
          name="firstName"
          type="text"
          label={
            isFrench
              ? "Prénom"
              : "First name"
          }
          value={value.firstName}
          placeholder={
            isFrench
              ? "Votre prénom"
              : "Your first name"
          }
          autoComplete="given-name"
          required
          maxLength={60}
          error={errors.firstName}
          icon={User}
          onChange={(nextValue) =>
            onChange(
              "firstName",
              nextValue
            )
          }
        />

        <TextField
          id={`${baseId}-last-name`}
          name="lastName"
          type="text"
          label={
            isFrench ? "Nom" : "Last name"
          }
          value={value.lastName}
          placeholder={
            isFrench
              ? "Votre nom"
              : "Your last name"
          }
          autoComplete="family-name"
          required
          maxLength={60}
          error={errors.lastName}
          icon={User}
          onChange={(nextValue) =>
            onChange(
              "lastName",
              nextValue
            )
          }
        />

        <TextField
          id={`${baseId}-email`}
          name="email"
          type="email"
          label={
            isFrench
              ? "Adresse email"
              : "Email address"
          }
          value={value.email}
          placeholder="exemple@email.com"
          autoComplete="email"
          required
          maxLength={254}
          error={errors.email}
          icon={Mail}
          onChange={(nextValue) =>
            onChange("email", nextValue)
          }
        />

        <TextField
          id={`${baseId}-phone`}
          name="phone"
          type="tel"
          label={
            isFrench
              ? "Téléphone — facultatif"
              : "Telephone — optional"
          }
          value={value.phone}
          placeholder="+229 01 00 00 00 00"
          autoComplete="tel"
          maxLength={30}
          error={errors.phone}
          icon={Phone}
          onChange={(nextValue) =>
            onChange("phone", nextValue)
          }
        />

        <div className="sm:col-span-2">
          <TextField
            id={`${baseId}-country`}
            name="country"
            type="text"
            label={
              isFrench
                ? "Pays — facultatif"
                : "Country — optional"
            }
            value={value.country}
            placeholder={
              isFrench
                ? "Votre pays"
                : "Your country"
            }
            autoComplete="country-name"
            maxLength={80}
            error={errors.country}
            icon={MapPin}
            onChange={(nextValue) =>
              onChange(
                "country",
                nextValue
              )
            }
          />
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.anonymous}
          onChange={(event) =>
            onChange(
              "anonymous",
              event.target.checked
            )
          }
          className="mt-1 h-4 w-4 rounded border-[#b9c8ca] accent-[#0097a7]"
        />

        <span className="text-sm leading-6 text-[#4f5e61]">
          {isFrench
            ? "Afficher mon don comme anonyme dans les éventuels remerciements publics."
            : "Display my donation as anonymous in any public acknowledgements."}
        </span>
      </label>

      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          required
          checked={value.consent}
          onChange={(event) =>
            onChange(
              "consent",
              event.target.checked
            )
          }
          aria-invalid={
            errors.consent
              ? true
              : undefined
          }
          className="mt-1 h-4 w-4 rounded border-[#b9c8ca] accent-[#0097a7]"
        />

        <span className="text-sm leading-6 text-[#4f5e61]">
          {isFrench
            ? "J’accepte que mes informations soient utilisées uniquement pour traiter et confirmer ma demande de don."
            : "I agree that my information may be used solely to process and confirm my donation request."}
        </span>
      </label>

      {errors.consent && (
        <p
          role="alert"
          className="mt-2 text-sm font-bold text-red-700"
        >
          {errors.consent}
        </p>
      )}
    </fieldset>
  );
}