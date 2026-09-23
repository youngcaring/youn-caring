"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
} from "lucide-react";

import DonationAllocationSelector from "@/components/donation/DonationAllocationSelector";
import DonationAmountSelector from "@/components/donation/DonationAmountSelector";
import DonationCurrencySelector from "@/components/donation/DonationCurrencySelector";
import DonationFrequencySelector from "@/components/donation/DonationFrequencySelector";
import DonationPaymentMethods from "@/components/donation/DonationPaymentMethods";
import DonationStickySubmit from "@/components/donation/DonationStickySubmit";
import DonationSummary from "@/components/donation/DonationSummary";
import DonorInformationFields from "@/components/donation/DonorInformationFields";

import {
  useLanguage,
} from "@/components/providers/LanguageProvider";

import {
  defaultDonationCurrency,
  formatDonationAmount,
  getDonationAmounts,
  getDonationLimits,
} from "@/data/donation";

import type {
  DonationAllocationId,
  DonationCheckoutResponse,
  DonationCurrency,
  DonationDonor,
  DonationFieldErrors,
  DonationFrequency,
  DonationPaymentMethod,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * FORMULAIRE PRINCIPAL DE DON
 * ============================================================================
 *
 * Ce composant :
 *
 * - sélectionne la fréquence du don ;
 * - sélectionne la devise ;
 * - valide le montant ;
 * - sélectionne le domaine soutenu ;
 * - sélectionne la catégorie du moyen de paiement ;
 * - collecte uniquement les informations nécessaires ;
 * - ne collecte aucune donnée bancaire ;
 * - transmet les données à la route serveur ;
 * - redirige uniquement vers Young Caring ou Moneroo.
 *
 * Toutes les données sont validées une seconde fois côté serveur.
 * ============================================================================
 */

const MAX_FIRST_NAME_LENGTH = 60;
const MAX_LAST_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 30;
const MAX_COUNTRY_LENGTH = 80;
const MAX_CUSTOM_AMOUNT_LENGTH = 10;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^\+?[0-9\s().-]+$/;

const MONEROO_ROOT_DOMAIN =
  "moneroo.io";

const initialDonor:
  DonationDonor = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  anonymous: false,
  consent: false,
};

/**
 * Autorise uniquement :
 *
 * - une URL HTTP ou HTTPS appartenant au site actuel ;
 * - une URL HTTPS appartenant à Moneroo.
 *
 * Une URL HTTPS externe arbitraire est refusée.
 */
function getSafeRedirectUrl(
  value: string
): URL | null {
  try {
    const url =
      new URL(
        value,
        window.location.origin
      );

    if (
      url.username.length > 0 ||
      url.password.length > 0
    ) {
      return null;
    }

    const hostname =
      url.hostname.toLowerCase();

    const belongsToMoneroo =
      hostname === MONEROO_ROOT_DOMAIN ||
      hostname.endsWith(
        `.${MONEROO_ROOT_DOMAIN}`
      );

    const isMonerooUrl =
      url.protocol === "https:" &&
      belongsToMoneroo;

    const isSameOriginUrl =
      url.origin ===
        window.location.origin &&
      (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );

    if (
      !isMonerooUrl &&
      !isSameOriginUrl
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

/**
 * Retourne un montant initial adapté
 * à la devise sélectionnée.
 */
function getDefaultAmount(
  currency: DonationCurrency
): number {
  const suggestedAmounts =
    getDonationAmounts(
      currency
    );

  const limits =
    getDonationLimits(
      currency
    );

  return (
    suggestedAmounts[1] ??
    suggestedAmounts[0] ??
    limits.minimum
  );
}

/**
 * Vérifie un numéro de téléphone optionnel.
 *
 * Le signe + est autorisé uniquement au début.
 */
function isValidOptionalPhone(
  phone: string
): boolean {
  if (phone.length === 0) {
    return true;
  }

  if (
    phone.length >
      MAX_PHONE_LENGTH ||
    !PHONE_PATTERN.test(phone)
  ) {
    return false;
  }

  const digits =
    phone.replace(
      /\D/g,
      ""
    );

  return (
    digits.length >= 6 &&
    digits.length <= 20
  );
}

/**
 * Retourne le champ d’erreur correspondant
 * à une propriété du donateur.
 */
function getDonorErrorField(
  field: keyof DonationDonor
): keyof DonationFieldErrors {
  if (field === "anonymous") {
    return "general";
  }

  return field;
}

/**
 * Extrait un code d’erreur non sensible.
 */
function getSafeErrorCode(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message
      .trim()
      .slice(0, 100);
  }

  return "UNKNOWN_DONATION_CHECKOUT_ERROR";
}

export default function DonationForm() {
  const { language } =
    useLanguage();

  const isFrench =
    language === "fr";

  const [
    currency,
    setCurrency,
  ] = useState<DonationCurrency>(
    defaultDonationCurrency
  );

  const [
    frequency,
    setFrequency,
  ] = useState<DonationFrequency>(
    "once"
  );

  const [
    selectedAmount,
    setSelectedAmount,
  ] = useState<number | null>(
    () =>
      getDefaultAmount(
        defaultDonationCurrency
      )
  );

  const [
    customAmount,
    setCustomAmount,
  ] = useState("");

  const [
    allocation,
    setAllocation,
  ] = useState<DonationAllocationId>(
    "priority"
  );

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<
    DonationPaymentMethod | null
  >(null);

  const [
    paymentMethodError,
    setPaymentMethodError,
  ] = useState("");

  const [
    donor,
    setDonor,
  ] = useState<DonationDonor>(
    initialDonor
  );

  const [
    errors,
    setErrors,
  ] = useState<DonationFieldErrors>(
    {}
  );

  const [
    generalError,
    setGeneralError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /**
   * Champ invisible utilisé comme honeypot
   * contre certaines soumissions automatiques.
   */
  const [
    website,
    setWebsite,
  ] = useState("");

  const currencyLimits =
    useMemo(
      () =>
        getDonationLimits(
          currency
        ),
      [currency]
    );

  const finalAmount =
    useMemo(() => {
      if (
        customAmount.length > 0
      ) {
        const parsedAmount =
          Number(
            customAmount
          );

        return Number.isSafeInteger(
          parsedAmount
        )
          ? parsedAmount
          : 0;
      }

      return selectedAmount ?? 0;
    }, [
      customAmount,
      selectedAmount,
    ]);

  const amountIsValid =
    Number.isSafeInteger(
      finalAmount
    ) &&
    finalAmount >=
      currencyLimits.minimum &&
    finalAmount <=
      currencyLimits.maximum;

  const formCanBeSubmitted =
    amountIsValid &&
    paymentMethod !== null &&
    !submitting;

  const updateDonor = <
    Key extends keyof DonationDonor
  >(
    field: Key,
    value: DonationDonor[Key]
  ): void => {
    setDonor(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    const errorField =
      getDonorErrorField(
        field
      );

    setErrors(
      (current) => ({
        ...current,
        [errorField]:
          undefined,
      })
    );

    setGeneralError("");
  };

  const clearAmountError =
    (): void => {
      setErrors(
        (current) => ({
          ...current,
          amount: undefined,
          currency: undefined,
        })
      );

      setGeneralError("");
    };

  /**
   * Réinitialise le montant lorsque
   * la devise change.
   */
  const handleCurrencyChange = (
    nextCurrency:
      DonationCurrency
  ): void => {
    if (
      submitting ||
      nextCurrency === currency
    ) {
      return;
    }

    setCurrency(
      nextCurrency
    );

    setSelectedAmount(
      getDefaultAmount(
        nextCurrency
      )
    );

    setCustomAmount("");

    setErrors(
      (current) => ({
        ...current,
        amount: undefined,
        currency: undefined,
      })
    );

    setGeneralError("");
  };

  const handleCustomAmountChange = (
    value: string
  ): void => {
    if (submitting) {
      return;
    }

    const sanitizedValue =
      value
        .replace(/\D/g, "")
        .slice(
          0,
          MAX_CUSTOM_AMOUNT_LENGTH
        );

    setCustomAmount(
      sanitizedValue
    );

    if (
      sanitizedValue.length > 0
    ) {
      setSelectedAmount(null);
    }

    clearAmountError();
  };

  const handlePaymentMethodChange = (
    method:
      DonationPaymentMethod
  ): void => {
    if (submitting) {
      return;
    }

    setPaymentMethod(
      method
    );

    setPaymentMethodError("");
    setGeneralError("");
  };

  /**
   * Validation exécutée dans le navigateur.
   *
   * Cette validation améliore l’expérience
   * utilisateur, mais ne remplace jamais
   * la validation côté serveur.
   */
  const validateForm =
    (): boolean => {
      const nextErrors:
        Partial<
          Record<
            keyof DonationFieldErrors,
            string
          >
        > = {};

      let nextPaymentMethodError =
        "";

      const firstName =
        donor.firstName
          .normalize("NFKC")
          .trim();

      const lastName =
        donor.lastName
          .normalize("NFKC")
          .trim();

      const email =
        donor.email
          .normalize("NFKC")
          .trim()
          .toLowerCase();

      const phone =
        donor.phone
          .normalize("NFKC")
          .trim();

      const country =
        donor.country
          .normalize("NFKC")
          .trim();

      if (
        firstName.length < 2 ||
        firstName.length >
          MAX_FIRST_NAME_LENGTH
      ) {
        nextErrors.firstName =
          isFrench
            ? "Veuillez saisir un prénom valide."
            : "Please enter a valid first name.";
      }

      if (
        lastName.length < 2 ||
        lastName.length >
          MAX_LAST_NAME_LENGTH
      ) {
        nextErrors.lastName =
          isFrench
            ? "Veuillez saisir un nom valide."
            : "Please enter a valid last name.";
      }

      if (
        email.length === 0 ||
        email.length >
          MAX_EMAIL_LENGTH ||
        !EMAIL_PATTERN.test(email)
      ) {
        nextErrors.email =
          isFrench
            ? "Veuillez saisir une adresse e-mail valide."
            : "Please enter a valid email address.";
      }

      if (
        !isValidOptionalPhone(
          phone
        )
      ) {
        nextErrors.phone =
          isFrench
            ? "Veuillez saisir un numéro de téléphone valide."
            : "Please enter a valid telephone number.";
      }

      if (
        country.length >
        MAX_COUNTRY_LENGTH
      ) {
        nextErrors.country =
          isFrench
            ? "Le nom du pays est trop long."
            : "The country name is too long.";
      }

      if (!amountIsValid) {
        const formattedMinimum =
          formatDonationAmount(
            currencyLimits.minimum,
            language,
            currency
          );

        const formattedMaximum =
          formatDonationAmount(
            currencyLimits.maximum,
            language,
            currency
          );

        nextErrors.amount =
          isFrench
            ? `Le montant doit être compris entre ${formattedMinimum} et ${formattedMaximum}.`
            : `The amount must be between ${formattedMinimum} and ${formattedMaximum}.`;
      }

      if (!paymentMethod) {
        nextPaymentMethodError =
          isFrench
            ? "Veuillez sélectionner un moyen de paiement."
            : "Please select a payment method.";
      }

      if (!donor.consent) {
        nextErrors.consent =
          isFrench
            ? "Votre accord est nécessaire pour continuer."
            : "Your consent is required to continue.";
      }

      setErrors(
        nextErrors
      );

      setPaymentMethodError(
        nextPaymentMethodError
      );

      return (
        Object.keys(
          nextErrors
        ).length === 0 &&
        nextPaymentMethodError.length ===
          0
      );
    };

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setGeneralError("");

    /**
     * Si un robot remplit le honeypot,
     * aucune requête n’est envoyée.
     */
    if (
      website.trim().length > 0
    ) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    /**
     * Cette vérification garantit également
     * le type de paymentMethod.
     */
    if (!paymentMethod) {
      return;
    }

    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/donations/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            credentials:
              "same-origin",

            cache:
              "no-store",

            body:
              JSON.stringify({
                frequency,

                amount:
                  finalAmount,

                currency,

                allocation,

                paymentMethod,

                donor: {
                  firstName:
                    donor.firstName
                      .normalize("NFKC")
                      .trim(),

                  lastName:
                    donor.lastName
                      .normalize("NFKC")
                      .trim(),

                  email:
                    donor.email
                      .normalize("NFKC")
                      .trim()
                      .toLowerCase(),

                  phone:
                    donor.phone
                      .normalize("NFKC")
                      .trim() ||
                    null,

                  country:
                    donor.country
                      .normalize("NFKC")
                      .trim() ||
                    null,

                  anonymous:
                    donor.anonymous,

                  consent:
                    donor.consent,
                },
              }),
          }
        );

      let result:
        DonationCheckoutResponse | null =
        null;

      try {
        result =
          (await response.json()) as
            DonationCheckoutResponse;
      } catch {
        result = null;
      }

      if (
        result?.fieldErrors &&
        Object.keys(
          result.fieldErrors
        ).length > 0
      ) {
        setErrors(
          result.fieldErrors
        );
      }

      if (
        !response.ok ||
        result?.success !== true ||
        typeof result.checkoutUrl !==
          "string" ||
        result.checkoutUrl.length === 0
      ) {
        throw new Error(
          result?.error ??
            "PAYMENT_INITIALIZATION_FAILED"
        );
      }

      const redirectUrl =
        getSafeRedirectUrl(
          result.checkoutUrl
        );

      if (!redirectUrl) {
        throw new Error(
          "INVALID_REDIRECT_URL"
        );
      }

      window.location.assign(
        redirectUrl.href
      );
    } catch (error: unknown) {
      const errorCode =
        getSafeErrorCode(
          error
        );

      /**
       * console.warn permet de conserver une trace
       * en développement sans déclencher l’overlay
       * rouge provoqué par console.error.
       */
      if (
        process.env.NODE_ENV !==
        "production"
      ) {
        console.warn(
          "Donation checkout failed:",
          errorCode
        );
      }

      setGeneralError(
        isFrench
          ? "Le paiement n’a pas pu être préparé. Vérifiez les informations saisies, puis réessayez."
          : "The payment could not be prepared. Check the information entered and try again."
      );

      setSubmitting(false);
    }
  };

  return (
    <section
      id="formulaire-don"
      aria-labelledby="donation-form-title"
      className={[
        "site-section scroll-mt-28",
        "bg-[#f7f9f9]",
      ].join(" ")}
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {isFrench
              ? "Votre contribution"
              : "Your contribution"}
          </p>

          <h2
            id="donation-form-title"
            className="section-title"
          >
            {isFrench
              ? "Préparez votre "
              : "Prepare your "}

            <span className="text-[#0097a7]">
              {isFrench
                ? "don"
                : "donation"}
            </span>
          </h2>

          <p className="section-description">
            {isFrench
              ? "Choisissez votre devise, votre montant et renseignez uniquement les informations nécessaires. Les données bancaires ne sont jamais saisies sur ce formulaire."
              : "Choose your currency and amount, then provide only the necessary information. Banking details are never entered on this form."}
          </p>
        </div>

        <div
          className={[
            "mt-10 grid gap-8",
            "lg:grid-cols-[minmax(0,1fr)_360px]",
            "lg:items-start",
          ].join(" ")}
        >
          <form
            id="donation-form"
            noValidate
            onSubmit={(event) => {
              void handleSubmit(
                event
              );
            }}
            className={[
              "relative space-y-8",
              "rounded-[28px]",
              "border border-[#e0e8e9]",
              "bg-white p-5",
              "shadow-[0_16px_45px_rgba(7,31,33,0.07)]",
              "sm:p-8",
            ].join(" ")}
          >
            <div
              aria-hidden="true"
              className={[
                "absolute -left-[10000px]",
                "top-auto h-px w-px",
                "overflow-hidden",
              ].join(" ")}
            >
              <label
                htmlFor="donation-website"
              >
                Website
              </label>

              <input
                id="donation-website"
                type="text"
                name="website"
                value={website}
                tabIndex={-1}
                autoComplete="off"
                disabled={submitting}
                onChange={(event) => {
                  setWebsite(
                    event.target.value
                  );
                }}
              />
            </div>

            <DonationFrequencySelector
              value={frequency}
              onChange={(value) => {
                if (submitting) {
                  return;
                }

                setFrequency(value);
                setGeneralError("");
              }}
              disabled={submitting}
            />

            <div className="border-t border-[#e5ebec] pt-8">
              <DonationCurrencySelector
                value={currency}
                onChange={
                  handleCurrencyChange
                }
                disabled={submitting}
              />

              {errors.currency ? (
                <p
                  role="alert"
                  className="mt-3 text-sm font-bold text-red-700"
                >
                  {errors.currency}
                </p>
              ) : null}
            </div>

            <div className="border-t border-[#e5ebec] pt-8">
              <DonationAmountSelector
                currency={currency}
                selectedAmount={
                  selectedAmount
                }
                customAmount={
                  customAmount
                }
                disabled={submitting}
                error={errors.amount}
                onSelectAmount={(
                  amount
                ) => {
                  if (submitting) {
                    return;
                  }

                  setSelectedAmount(
                    amount
                  );

                  setCustomAmount("");
                  clearAmountError();
                }}
                onCustomAmountChange={
                  handleCustomAmountChange
                }
              />
            </div>

            <div className="border-t border-[#e5ebec] pt-8">
              <DonationAllocationSelector
                value={allocation}
                onChange={(value) => {
                  if (submitting) {
                    return;
                  }

                  setAllocation(value);

                  setErrors(
                    (current) => ({
                      ...current,
                      allocation:
                        undefined,
                    })
                  );

                  setGeneralError("");
                }}
                disabled={submitting}
              />

              {errors.allocation ? (
                <p
                  role="alert"
                  className="mt-3 text-sm font-bold text-red-700"
                >
                  {errors.allocation}
                </p>
              ) : null}
            </div>

            <div className="border-t border-[#e5ebec] pt-8">
              <DonationPaymentMethods
                value={paymentMethod}
                onChange={
                  handlePaymentMethodChange
                }
                disabled={submitting}
                error={
                  paymentMethodError ||
                  null
                }
                language={
                  isFrench
                    ? "fr"
                    : "en"
                }
                name="paymentMethod"
                required
              />
            </div>

            <div className="border-t border-[#e5ebec] pt-8">
              <DonorInformationFields
                value={donor}
                errors={errors}
                onChange={updateDonor}
                disabled={submitting}
              />
            </div>

            {generalError.length > 0 ? (
              <div
                role="alert"
                aria-live="assertive"
                className={[
                  "flex items-start gap-3",
                  "rounded-[18px]",
                  "border border-red-200",
                  "bg-red-50 p-4",
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
                  {generalError}
                </p>
              </div>
            ) : null}
          </form>

          <DonationSummary
            frequency={frequency}
            amount={finalAmount}
            currency={currency}
            allocation={allocation}
            submitting={submitting}
            paymentMethod={
              paymentMethod
            }
          />
        </div>

        <div
          aria-hidden="true"
          className="h-40 lg:h-28"
        />
      </div>

      <DonationStickySubmit
        amount={finalAmount}
        currency={currency}
        submitting={submitting}
        disabled={
          !formCanBeSubmitted
        }
        formId="donation-form"
      />
    </section>
  );
}