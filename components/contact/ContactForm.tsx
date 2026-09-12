"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useId,
  useState,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageSquareText,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  contactFormLimits,
  contactSubjects,
  isContactSubjectId,
} from "@/data/contact";
import type {
  ContactFieldErrors,
  ContactFormValues,
  ContactSubmissionRequest,
  ContactSubmissionStatus,
} from "@/types/contact";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: ContactFormValues = {
  fullName: "",
  email: "",
  phone: "",
  subject: "general",
  message: "",
};

type ApiSuccessResponse = Readonly<{
  success: true;
  reference: string;
  acknowledgementEmailSent: boolean;
  message?: string;
}>;

type ApiErrorResponse = Readonly<{
  success: false;
  error?: string;
  message?: string;
  fieldErrors?: ContactFieldErrors;
}>;

type ContactApiResponse =
  | ApiSuccessResponse
  | ApiErrorResponse;

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseApiResponse(
  value: unknown
): ContactApiResponse | null {
  if (
    !isRecord(value) ||
    typeof value.success !== "boolean"
  ) {
    return null;
  }

  if (value.success === true) {
    if (
      typeof value.reference !== "string" ||
      typeof value.acknowledgementEmailSent !==
        "boolean"
    ) {
      return null;
    }

    return {
      success: true,
      reference: value.reference,
      acknowledgementEmailSent:
        value.acknowledgementEmailSent,
      message:
        typeof value.message === "string"
          ? value.message
          : undefined,
    };
  }

  const fieldErrors:
    ContactFieldErrors = {};

  if (isRecord(value.fieldErrors)) {
    const allowedFields = [
      "fullName",
      "email",
      "phone",
      "subject",
      "message",
      "website",
      "general",
    ] as const;

    for (const field of allowedFields) {
      const fieldMessage =
        value.fieldErrors[field];

      if (
        typeof fieldMessage === "string"
      ) {
        fieldErrors[field] =
          fieldMessage;
      }
    }
  }

  return {
    success: false,

    error:
      typeof value.error === "string"
        ? value.error
        : undefined,

    message:
      typeof value.message === "string"
        ? value.message
        : undefined,

    fieldErrors:
      Object.keys(fieldErrors).length > 0
        ? fieldErrors
        : undefined,
  };
}

export default function ContactForm() {
  const { language } = useLanguage();

  const generatedId = useId();

  const isFrench =
    language === "fr";

  const [values, setValues] =
    useState<ContactFormValues>(
      INITIAL_VALUES
    );

  /*
   * Champ invisible anti-robot.
   */
  const [website, setWebsite] =
    useState("");

  const [errors, setErrors] =
    useState<ContactFieldErrors>({});

  const [status, setStatus] =
    useState<ContactSubmissionStatus>(
      "idle"
    );

  const [reference, setReference] =
    useState<string | null>(null);

  const [
    acknowledgementEmailSent,
    setAcknowledgementEmailSent,
  ] = useState(false);

  const content = isFrench
    ? {
        label: "Écrivez-nous",
        titleStart: "Envoyez-nous",
        titleHighlight:
          "votre message",

        description:
          "Complétez le formulaire pour envoyer directement votre demande à l’équipe Young Caring.",

        fullName:
          "Nom et prénom",
        fullNamePlaceholder:
          "Votre nom complet",

        email:
          "Adresse email",
        emailPlaceholder:
          "exemple@email.com",

        phone: "Téléphone",
        phoneOptional:
          "facultatif",
        phonePlaceholder:
          "+229…",

        subject:
          "Sujet de votre demande",

        message:
          "Votre message",
        messagePlaceholder:
          "Expliquez-nous clairement votre demande…",

        requiredFields:
          "Les champs marqués d’un astérisque sont obligatoires.",

        privacy:
          "Vos informations sont uniquement utilisées pour traiter votre demande et vous répondre.",

        submit:
          "Envoyer le message",
        submitting:
          "Envoi en cours…",

        nameError:
          "Veuillez saisir votre nom complet.",

        emailError:
          "Veuillez saisir une adresse email valide.",

        phoneError:
          "Veuillez saisir un numéro de téléphone valide.",

        subjectError:
          "Veuillez sélectionner un sujet valide.",

        messageTooShort:
          `Votre message doit contenir au moins ${contactFormLimits.message.minimum} caractères.`,

        messageTooLong:
          `Votre message ne peut pas dépasser ${contactFormLimits.message.maximum} caractères.`,

        generalError:
          "Votre message n’a pas pu être envoyé. Veuillez réessayer plus tard.",

        invalidResponse:
          "Le serveur a retourné une réponse invalide. Veuillez réessayer.",

        successTitle:
          "Votre message est bien reçu",

        successDescription:
          "Merci de nous avoir contactés. Notre équipe va examiner votre demande et vous répondre dans les meilleurs délais.",

        referenceLabel:
          "Référence de votre demande",

        confirmationSent:
          "Un email de confirmation vous a été envoyé.",

        confirmationNotSent:
          "Votre message a bien été reçu, mais l’email de confirmation n’a pas pu être envoyé.",

        newMessage:
          "Envoyer un autre message",
      }
    : {
        label: "Write to us",
        titleStart: "Send us",
        titleHighlight:
          "your message",

        description:
          "Complete the form to send your request directly to the Young Caring team.",

        fullName:
          "Full name",
        fullNamePlaceholder:
          "Your full name",

        email:
          "Email address",
        emailPlaceholder:
          "example@email.com",

        phone: "Telephone",
        phoneOptional:
          "optional",
        phonePlaceholder:
          "+229…",

        subject:
          "Subject of your request",

        message:
          "Your message",
        messagePlaceholder:
          "Please explain your request clearly…",

        requiredFields:
          "Fields marked with an asterisk are required.",

        privacy:
          "Your information is only used to process your request and reply to you.",

        submit:
          "Send message",
        submitting:
          "Sending…",

        nameError:
          "Please enter your full name.",

        emailError:
          "Please enter a valid email address.",

        phoneError:
          "Please enter a valid phone number.",

        subjectError:
          "Please select a valid subject.",

        messageTooShort:
          `Your message must contain at least ${contactFormLimits.message.minimum} characters.`,

        messageTooLong:
          `Your message cannot exceed ${contactFormLimits.message.maximum} characters.`,

        generalError:
          "Your message could not be sent. Please try again later.",

        invalidResponse:
          "The server returned an invalid response. Please try again.",

        successTitle:
          "Your message has been received",

        successDescription:
          "Thank you for contacting us. Our team will review your request and reply as soon as possible.",

        referenceLabel:
          "Your request reference",

        confirmationSent:
          "A confirmation email has been sent to you.",

        confirmationNotSent:
          "Your message was received, but the confirmation email could not be sent.",

        newMessage:
          "Send another message",
      };

  const fieldIds = {
    fullName:
      `contact-name-${generatedId}`,

    email:
      `contact-email-${generatedId}`,

    phone:
      `contact-phone-${generatedId}`,

    subject:
      `contact-subject-${generatedId}`,

    message:
      `contact-message-${generatedId}`,

    website:
      `contact-website-${generatedId}`,

    generalError:
      `contact-general-error-${generatedId}`,
  };

  const submitting =
    status === "submitting";

  function clearFieldError(
    field:
      | keyof ContactFormValues
      | "general"
  ): void {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = {
        ...currentErrors,
      };

      delete nextErrors[field];

      return nextErrors;
    });
  }

  function updateValue<
    Field extends keyof ContactFormValues,
  >(
    field: Field,
    value: ContactFormValues[Field]
  ): void {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    clearFieldError(field);
    clearFieldError("general");

    if (status === "error") {
      setStatus("idle");
    }
  }

  function handleInputChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ): void {
    const { name, value } =
      event.target;

    switch (name) {
      case "fullName":
        updateValue(
          "fullName",
          value
        );
        break;

      case "email":
        updateValue(
          "email",
          value
        );
        break;

      case "phone":
        updateValue(
          "phone",
          value
        );
        break;

      case "message":
        updateValue(
          "message",
          value
        );
        break;

      case "subject":
        if (
          isContactSubjectId(value)
        ) {
          updateValue(
            "subject",
            value
          );
        }
        break;

      default:
        break;
    }
  }

  function validateForm():
    ContactFieldErrors {
    const nextErrors:
      ContactFieldErrors = {};

    const cleanName =
      values.fullName.trim();

    const cleanEmail =
      values.email
        .trim()
        .toLowerCase();

    const cleanPhone =
      values.phone.trim();

    const cleanMessage =
      values.message.trim();

    if (
      cleanName.length <
        contactFormLimits.fullName
          .minimum ||
      cleanName.length >
        contactFormLimits.fullName
          .maximum
    ) {
      nextErrors.fullName =
        content.nameError;
    }

    if (
      cleanEmail.length === 0 ||
      cleanEmail.length >
        contactFormLimits.email
          .maximum ||
      !EMAIL_PATTERN.test(
        cleanEmail
      )
    ) {
      nextErrors.email =
        content.emailError;
    }

    if (
      cleanPhone.length > 0 &&
      (
        cleanPhone.length <
          contactFormLimits.phone
            .minimum ||
        cleanPhone.length >
          contactFormLimits.phone
            .maximum ||
        !/^[0-9+\s()./-]+$/.test(
          cleanPhone
        )
      )
    ) {
      nextErrors.phone =
        content.phoneError;
    }

    if (
      !isContactSubjectId(
        values.subject
      )
    ) {
      nextErrors.subject =
        content.subjectError;
    }

    if (
      cleanMessage.length <
      contactFormLimits.message
        .minimum
    ) {
      nextErrors.message =
        content.messageTooShort;
    } else if (
      cleanMessage.length >
      contactFormLimits.message
        .maximum
    ) {
      nextErrors.message =
        content.messageTooLong;
    }

    return nextErrors;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validationErrors =
      validateForm();

    if (
      Object.keys(
        validationErrors
      ).length > 0
    ) {
      setErrors(
        validationErrors
      );

      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("submitting");
    setReference(null);

    const requestBody:
      ContactSubmissionRequest = {
      fullName:
        values.fullName.trim(),

      email:
        values.email
          .trim()
          .toLowerCase(),

      phone:
        values.phone.trim(),

      subject:
        values.subject,

      message:
        values.message.trim(),

      language:
        isFrench ? "fr" : "en",

      website,
    };

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(
              requestBody
            ),

          cache: "no-store",

          credentials:
            "same-origin",
        }
      );

      let rawResponse: unknown;

      try {
        rawResponse =
          await response.json();
      } catch {
        throw new Error(
          "INVALID_API_RESPONSE"
        );
      }

      const result =
        parseApiResponse(
          rawResponse
        );

      if (!result) {
        throw new Error(
          "INVALID_API_RESPONSE"
        );
      }

      if (
        !response.ok ||
        !result.success
      ) {
        const serverErrors =
          !result.success
            ? result.fieldErrors
            : undefined;

        setErrors({
          ...(serverErrors ?? {}),

          general:
            !result.success &&
            result.message
              ? result.message
              : content.generalError,
        });

        setStatus("error");
        return;
      }

      setReference(
        result.reference
      );

      setAcknowledgementEmailSent(
        result
          .acknowledgementEmailSent
      );

      setValues(INITIAL_VALUES);
      setWebsite("");
      setErrors({});
      setStatus("success");
    } catch (error: unknown) {
      const invalidResponse =
        error instanceof Error &&
        error.message ===
          "INVALID_API_RESPONSE";

      setErrors({
        general:
          invalidResponse
            ? content.invalidResponse
            : content.generalError,
      });

      setStatus("error");
    }
  }

  function resetForm(): void {
    setValues(INITIAL_VALUES);
    setWebsite("");
    setErrors({});
    setReference(null);

    setAcknowledgementEmailSent(
      false
    );

    setStatus("idle");
  }

  const inputClassName = [
    "mt-2 min-h-12 w-full",
    "rounded-2xl border",
    "border-[#dce5e6]",
    "bg-white px-4",
    "text-base text-[#101719]",
    "outline-none transition",
    "placeholder:text-[#839093]",
    "focus:border-[#0097a7]",
    "focus:ring-4",
    "focus:ring-[#0097a7]/10",
    "disabled:cursor-not-allowed",
    "disabled:bg-[#eef2f2]",
    "disabled:opacity-70",
  ].join(" ");

  return (
    <section
      id="contact-form"
      aria-labelledby="contact-form-title"
      className={[
        "site-section scroll-mt-28",
        "bg-white",
      ].join(" ")}
    >
      <div className="site-container">
        <div
          className={[
            "grid gap-10",
            "lg:grid-cols-[0.8fr_1.2fr]",
            "lg:gap-16",
          ].join(" ")}
        >
          <div>
            <p className="section-label">
              {content.label}
            </p>

            <h2
              id="contact-form-title"
              className="section-title"
            >
              {content.titleStart}{" "}

              <span className="text-[#0097a7]">
                {content.titleHighlight}
              </span>
            </h2>

            <p className="section-description">
              {content.description}
            </p>

            <div
              className={[
                "mt-8 rounded-[26px]",
                "bg-[#eaf8f9] p-6",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-12 w-12",
                  "place-items-center",
                  "rounded-full",
                  "bg-[#0097a7]",
                  "text-white",
                ].join(" ")}
              >
                <ShieldCheck
                  aria-hidden="true"
                  size={23}
                />
              </span>

              <p className="mt-4 text-sm leading-6 text-[#425255]">
                {content.privacy}
              </p>
            </div>
          </div>

          {status === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className={[
                "flex min-h-[480px]",
                "flex-col items-center",
                "justify-center",
                "rounded-[30px] border",
                "border-[#bfe5d0]",
                "bg-[#f5fcf8]",
                "p-6 text-center",
                "shadow-[0_18px_45px_rgba(7,31,33,0.07)]",
                "sm:p-10",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-20 w-20",
                  "place-items-center",
                  "rounded-full",
                  "bg-[#e2f7ea]",
                  "text-[#167340]",
                ].join(" ")}
              >
                <CheckCircle2
                  aria-hidden="true"
                  size={40}
                />
              </span>

              <h3 className="mt-6 text-2xl font-black text-[#101719] sm:text-3xl">
                {content.successTitle}
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-7 text-[#5f6d70] sm:text-base">
                {content.successDescription}
              </p>

              {reference && (
                <div
                  className={[
                    "mt-6 w-full max-w-md",
                    "rounded-[20px]",
                    "border border-[#cfe7e0]",
                    "bg-white p-5",
                  ].join(" ")}
                >
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647275]">
                    {content.referenceLabel}
                  </p>

                  <p className="mt-2 break-all text-base font-black text-[#007d88]">
                    {reference}
                  </p>
                </div>
              )}

              <p className="mt-5 text-sm font-bold leading-6 text-[#426267]">
                {acknowledgementEmailSent
                  ? content.confirmationSent
                  : content.confirmationNotSent}
              </p>

              <button
                type="button"
                onClick={resetForm}
                className="button-secondary mt-7"
              >
                <RotateCcw
                  aria-hidden="true"
                  size={18}
                />

                {content.newMessage}
              </button>
            </div>
          ) : (
            <form
              id="contact-message-form"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={submitting}
              aria-describedby={
                errors.general
                  ? fieldIds.generalError
                  : undefined
              }
              className={[
                "rounded-[30px] border",
                "border-[#e1e9ea]",
                "bg-[#f9fbfb] p-5",
                "shadow-[0_18px_45px_rgba(7,31,33,0.07)]",
                "sm:p-8",
              ].join(" ")}
            >
              <p className="mb-6 text-sm text-[#647275]">
                {content.requiredFields}
              </p>

              {errors.general && (
                <div
                  id={fieldIds.generalError}
                  role="alert"
                  aria-live="assertive"
                  className={[
                    "mb-6 flex items-start",
                    "gap-3 rounded-2xl",
                    "border border-red-200",
                    "bg-red-50 px-4 py-3",
                    "text-sm font-bold",
                    "leading-6 text-red-800",
                  ].join(" ")}
                >
                  <AlertCircle
                    aria-hidden="true"
                    size={20}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    {errors.general}
                  </p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={
                      fieldIds.fullName
                    }
                    className="flex items-center gap-2 text-sm font-extrabold text-[#263336]"
                  >
                    <UserRound
                      aria-hidden="true"
                      size={16}
                      className="text-[#0097a7]"
                    />

                    {content.fullName} *
                  </label>

                  <input
                    id={
                      fieldIds.fullName
                    }
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={submitting}
                    minLength={
                      contactFormLimits
                        .fullName.minimum
                    }
                    maxLength={
                      contactFormLimits
                        .fullName.maximum
                    }
                    value={
                      values.fullName
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder={
                      content
                        .fullNamePlaceholder
                    }
                    aria-invalid={
                      errors.fullName
                        ? true
                        : undefined
                    }
                    aria-describedby={
                      errors.fullName
                        ? `${fieldIds.fullName}-error`
                        : undefined
                    }
                    className={
                      inputClassName
                    }
                  />

                  {errors.fullName && (
                    <p
                      id={`${fieldIds.fullName}-error`}
                      role="alert"
                      className="mt-2 text-sm font-bold text-red-700"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={
                      fieldIds.email
                    }
                    className="flex items-center gap-2 text-sm font-extrabold text-[#263336]"
                  >
                    <Mail
                      aria-hidden="true"
                      size={16}
                      className="text-[#0097a7]"
                    />

                    {content.email} *
                  </label>

                  <input
                    id={
                      fieldIds.email
                    }
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    disabled={submitting}
                    maxLength={
                      contactFormLimits
                        .email.maximum
                    }
                    value={values.email}
                    onChange={
                      handleInputChange
                    }
                    placeholder={
                      content
                        .emailPlaceholder
                    }
                    aria-invalid={
                      errors.email
                        ? true
                        : undefined
                    }
                    aria-describedby={
                      errors.email
                        ? `${fieldIds.email}-error`
                        : undefined
                    }
                    className={
                      inputClassName
                    }
                  />

                  {errors.email && (
                    <p
                      id={`${fieldIds.email}-error`}
                      role="alert"
                      className="mt-2 text-sm font-bold text-red-700"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={
                      fieldIds.phone
                    }
                    className="text-sm font-extrabold text-[#263336]"
                  >
                    {content.phone}{" "}

                    <span className="font-normal text-[#718083]">
                      (
                      {
                        content.phoneOptional
                      }
                      )
                    </span>
                  </label>

                  <input
                    id={
                      fieldIds.phone
                    }
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    disabled={submitting}
                    maxLength={
                      contactFormLimits
                        .phone.maximum
                    }
                    value={values.phone}
                    onChange={
                      handleInputChange
                    }
                    placeholder={
                      content
                        .phonePlaceholder
                    }
                    aria-invalid={
                      errors.phone
                        ? true
                        : undefined
                    }
                    aria-describedby={
                      errors.phone
                        ? `${fieldIds.phone}-error`
                        : undefined
                    }
                    className={
                      inputClassName
                    }
                  />

                  {errors.phone && (
                    <p
                      id={`${fieldIds.phone}-error`}
                      role="alert"
                      className="mt-2 text-sm font-bold text-red-700"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={
                      fieldIds.subject
                    }
                    className="text-sm font-extrabold text-[#263336]"
                  >
                    {content.subject} *
                  </label>

                  <select
                    id={
                      fieldIds.subject
                    }
                    name="subject"
                    required
                    disabled={submitting}
                    value={values.subject}
                    onChange={
                      handleInputChange
                    }
                    aria-invalid={
                      errors.subject
                        ? true
                        : undefined
                    }
                    aria-describedby={
                      errors.subject
                        ? `${fieldIds.subject}-error`
                        : undefined
                    }
                    className={
                      inputClassName
                    }
                  >
                    {contactSubjects.map(
                      (option) => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {isFrench
                            ? option.labelFr
                            : option.labelEn}
                        </option>
                      )
                    )}
                  </select>

                  {errors.subject && (
                    <p
                      id={`${fieldIds.subject}-error`}
                      role="alert"
                      className="mt-2 text-sm font-bold text-red-700"
                    >
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor={
                    fieldIds.message
                  }
                  className="flex items-center gap-2 text-sm font-extrabold text-[#263336]"
                >
                  <MessageSquareText
                    aria-hidden="true"
                    size={16}
                    className="text-[#0097a7]"
                  />

                  {content.message} *
                </label>

                <textarea
                  id={
                    fieldIds.message
                  }
                  name="message"
                  required
                  disabled={submitting}
                  minLength={
                    contactFormLimits
                      .message.minimum
                  }
                  maxLength={
                    contactFormLimits
                      .message.maximum
                  }
                  rows={7}
                  value={values.message}
                  onChange={
                    handleInputChange
                  }
                  placeholder={
                    content
                      .messagePlaceholder
                  }
                  aria-invalid={
                    errors.message
                      ? true
                      : undefined
                  }
                  aria-describedby={
                    errors.message
                      ? `${fieldIds.message}-error`
                      : undefined
                  }
                  className={[
                    inputClassName,
                    "resize-y py-4",
                  ].join(" ")}
                />

                <div className="mt-2 flex items-start justify-between gap-4">
                  <div>
                    {errors.message && (
                      <p
                        id={`${fieldIds.message}-error`}
                        role="alert"
                        className="text-sm font-bold text-red-700"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-[#718083]">
                    {
                      values.message
                        .length
                    }
                    /
                    {
                      contactFormLimits
                        .message.maximum
                    }
                  </span>
                </div>
              </div>

              <div
                aria-hidden="true"
                className={[
                  "absolute -left-[10000px]",
                  "top-auto h-px w-px",
                  "overflow-hidden",
                ].join(" ")}
              >
                <label
                  htmlFor={
                    fieldIds.website
                  }
                >
                  Website
                </label>

                <input
                  id={
                    fieldIds.website
                  }
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => {
                    setWebsite(
                      event.target.value
                    );
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={[
                  "button-primary mt-7",
                  "w-full sm:w-auto",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-65",
                ].join(" ")}
              >
                {submitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    size={18}
                    className="animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  <Send
                    aria-hidden="true"
                    size={18}
                  />
                )}

                <span>
                  {submitting
                    ? content.submitting
                    : content.submit}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}