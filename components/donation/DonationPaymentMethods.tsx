"use client";

import {
  CreditCard,
  Info,
  Smartphone,
} from "lucide-react";

import {
  useId,
} from "react";

import type {
  DonationPaymentMethod,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * SÉLECTION DU MOYEN DE PAIEMENT
 * ============================================================================
 *
 * Ce composant :
 *
 * - permet de choisir entre carte et Mobile Money ;
 * - ne collecte aucune donnée bancaire ;
 * - reste entièrement contrôlé par le formulaire parent ;
 * - utilise de véritables champs radio accessibles ;
 * - fonctionne au clavier et avec les lecteurs d’écran ;
 * - affiche une erreur de validation sans casser la mise en page ;
 * - peut être désactivé pendant la création du paiement ;
 * - prend en charge le français et l’anglais ;
 * - laisse Moneroo déterminer les opérateurs réellement disponibles.
 *
 * Les numéros de carte, codes Mobile Money, mots de passe
 * et codes secrets doivent être saisis uniquement sur la
 * page de paiement hébergée par Moneroo.
 * ============================================================================
 */

type DonationPaymentMethodsLanguage =
  | "fr"
  | "en";

export type DonationPaymentMethodsProps =
  Readonly<{
    /**
     * Moyen de paiement actuellement sélectionné.
     *
     * null signifie qu’aucun moyen n’a encore
     * été sélectionné.
     */
    value:
      DonationPaymentMethod | null;

    /**
     * Appelé lorsqu’un moyen de paiement
     * est sélectionné.
     */
    onChange: (
      method: DonationPaymentMethod
    ) => void;

    /**
     * Désactive les choix pendant une opération
     * ou lorsque le formulaire est indisponible.
     */
    disabled?: boolean;

    /**
     * Message de validation affiché sous les choix.
     */
    error?: string | null;

    /**
     * Langue utilisée par le composant.
     */
    language?:
      DonationPaymentMethodsLanguage;

    /**
     * Nom HTML envoyé avec le formulaire.
     */
    name?: string;

    /**
     * Classe CSS optionnelle appliquée
     * au conteneur principal.
     */
    className?: string;

    /**
     * Indique qu’un choix est obligatoire.
     */
    required?: boolean;
  }>;

/**
 * Configuration interne des moyens de paiement.
 *
 * Aucun opérateur précis n’est annoncé ici :
 * la disponibilité réelle dépend de Moneroo,
 * du pays et de la devise sélectionnée.
 */
const PAYMENT_METHODS:
  readonly DonationPaymentMethod[] = [
  "mobile_money",
  "card",
];

/**
 * Textes locaux du composant.
 */
const CONTENT = {
  fr: {
    legend:
      "Choisissez votre moyen de paiement",

    required:
      "Champ obligatoire",

    mobileMoneyTitle:
      "Mobile Money",

    mobileMoneyDescription:
      "Payez avec un service Mobile Money disponible pour votre pays et votre devise.",

    cardTitle:
      "Carte bancaire",

    cardDescription:
      "Payez avec une carte acceptée sur la page de paiement Moneroo.",

    information:
      "Les options exactes seront affichées par Moneroo selon votre pays, votre devise et les services disponibles.",

    redirectInformation:
      "Aucune donnée bancaire n’est saisie ou conservée sur le site Young Caring.",
  },

  en: {
    legend:
      "Choose your payment method",

    required:
      "Required field",

    mobileMoneyTitle:
      "Mobile Money",

    mobileMoneyDescription:
      "Pay with a Mobile Money service available for your country and currency.",

    cardTitle:
      "Bank card",

    cardDescription:
      "Pay with an accepted card on the Moneroo payment page.",

    information:
      "The available options will be displayed by Moneroo according to your country, currency and available services.",

    redirectInformation:
      "No banking information is entered or stored on the Young Caring website.",
  },
} as const;

/**
 * Assemble proprement plusieurs classes CSS.
 */
function joinClassNames(
  ...classNames:
    Array<string | false | null | undefined>
): string {
  return classNames
    .filter(Boolean)
    .join(" ");
}

/**
 * Sélecteur accessible du moyen de paiement.
 */
export function DonationPaymentMethods({
  value,
  onChange,
  disabled = false,
  error = null,
  language = "fr",
  name = "paymentMethod",
  className,
  required = true,
}: DonationPaymentMethodsProps) {
  const generatedId =
    useId();

  const legendId =
    `${generatedId}-legend`;

  const descriptionId =
    `${generatedId}-description`;

  const errorId =
    `${generatedId}-error`;

  const content =
    CONTENT[language];

  const describedBy =
    error
      ? `${descriptionId} ${errorId}`
      : descriptionId;

  return (
    <section
      className={joinClassNames(
        "donation-payment-methods",
        className
      )}
      aria-labelledby={legendId}
    >
      <fieldset
        className="donation-payment-methods__fieldset"
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={
          error
            ? true
            : undefined
        }
      >
        <legend
          id={legendId}
          className="donation-payment-methods__legend"
        >
          <span>
            {content.legend}
          </span>

          {required ? (
            <span
              className="donation-payment-methods__required"
              aria-label={content.required}
              title={content.required}
            >
              *
            </span>
          ) : null}
        </legend>

        <div className="donation-payment-methods__options">
          {PAYMENT_METHODS.map(
            (method) => {
              const inputId =
                `${generatedId}-${method}`;

              const isSelected =
                value === method;

              const isMobileMoney =
                method ===
                "mobile_money";

              const title =
                isMobileMoney
                  ? content.mobileMoneyTitle
                  : content.cardTitle;

              const description =
                isMobileMoney
                  ? content.mobileMoneyDescription
                  : content.cardDescription;

              return (
                <label
                  key={method}
                  htmlFor={inputId}
                  className={joinClassNames(
                    "donation-payment-methods__option",
                    isSelected &&
                      "donation-payment-methods__option--selected",
                    disabled &&
                      "donation-payment-methods__option--disabled"
                  )}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name={name}
                    value={method}
                    checked={isSelected}
                    required={required}
                    disabled={disabled}
                    className="donation-payment-methods__input"
                    onChange={() => {
                      if (!disabled) {
                        onChange(method);
                      }
                    }}
                  />

                  <span
                    className="donation-payment-methods__icon"
                    aria-hidden="true"
                  >
                    {isMobileMoney ? (
                      <Smartphone
                        size={24}
                        strokeWidth={1.9}
                      />
                    ) : (
                      <CreditCard
                        size={24}
                        strokeWidth={1.9}
                      />
                    )}
                  </span>

                  <span className="donation-payment-methods__content">
                    <span className="donation-payment-methods__title">
                      {title}
                    </span>

                    <span className="donation-payment-methods__description">
                      {description}
                    </span>
                  </span>

                  <span
                    className="donation-payment-methods__indicator"
                    aria-hidden="true"
                  >
                    <span className="donation-payment-methods__indicator-dot" />
                  </span>
                </label>
              );
            }
          )}
        </div>
      </fieldset>

      <div
        id={descriptionId}
        className="donation-payment-methods__notice"
      >
        <Info
          className="donation-payment-methods__notice-icon"
          size={18}
          strokeWidth={1.9}
          aria-hidden="true"
        />

        <div className="donation-payment-methods__notice-content">
          <p>
            {content.information}
          </p>

          <p>
            {content.redirectInformation}
          </p>
        </div>
      </div>

      {error ? (
        <p
          id={errorId}
          className="donation-payment-methods__error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      <style jsx>{`
        .donation-payment-methods {
          width: 100%;
          color: #15261d;
        }

        .donation-payment-methods__fieldset {
          min-width: 0;
          margin: 0;
          padding: 0;
          border: 0;
        }

        .donation-payment-methods__legend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          width: 100%;
          margin: 0 0 0.875rem;
          padding: 0;
          color: #15261d;
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.4;
        }

        .donation-payment-methods__required {
          color: #b42318;
          font-weight: 800;
        }

        .donation-payment-methods__options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.875rem;
        }

        .donation-payment-methods__option {
          position: relative;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.875rem;
          min-height: 112px;
          padding: 1rem;
          border: 1px solid #d7e2dc;
          border-radius: 16px;
          background: #ffffff;
          cursor: pointer;
          transition:
            border-color 160ms ease,
            background-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .donation-payment-methods__option:hover {
          border-color: #77a68b;
          background: #fbfdfc;
          box-shadow:
            0 8px 24px
            rgba(17, 63, 39, 0.08);
        }

        .donation-payment-methods__option:focus-within {
          border-color: #176b3a;
          box-shadow:
            0 0 0 3px
            rgba(23, 107, 58, 0.15);
        }

        .donation-payment-methods__option--selected {
          border-color: #176b3a;
          background: #f2faf5;
          box-shadow:
            0 8px 24px
            rgba(17, 63, 39, 0.1);
        }

        .donation-payment-methods__option--disabled {
          cursor: not-allowed;
          opacity: 0.58;
          box-shadow: none;
        }

        .donation-payment-methods__option--disabled:hover {
          border-color: #d7e2dc;
          background: #ffffff;
          box-shadow: none;
          transform: none;
        }

        .donation-payment-methods__input {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }

        .donation-payment-methods__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 14px;
          color: #176b3a;
          background: #e8f5ec;
        }

        .donation-payment-methods__option--selected
          .donation-payment-methods__icon {
          color: #ffffff;
          background: #176b3a;
        }

        .donation-payment-methods__content {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 0.3rem;
        }

        .donation-payment-methods__title {
          color: #15261d;
          font-size: 0.98rem;
          font-weight: 750;
          line-height: 1.35;
        }

        .donation-payment-methods__description {
          color: #5c6d63;
          font-size: 0.82rem;
          font-weight: 450;
          line-height: 1.5;
        }

        .donation-payment-methods__indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 21px;
          height: 21px;
          flex-shrink: 0;
          border: 2px solid #aabbb1;
          border-radius: 999px;
          background: #ffffff;
          transition:
            border-color 160ms ease,
            background-color 160ms ease;
        }

        .donation-payment-methods__indicator-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: transparent;
          transform: scale(0);
          transition:
            background-color 160ms ease,
            transform 160ms ease;
        }

        .donation-payment-methods__option--selected
          .donation-payment-methods__indicator {
          border-color: #176b3a;
        }

        .donation-payment-methods__option--selected
          .donation-payment-methods__indicator-dot {
          background: #176b3a;
          transform: scale(1);
        }

        .donation-payment-methods__notice {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          margin-top: 0.875rem;
          padding: 0.875rem 1rem;
          border: 1px solid #dce8e1;
          border-radius: 13px;
          color: #476054;
          background: #f7faf8;
        }

        .donation-payment-methods__notice-icon {
          flex-shrink: 0;
          margin-top: 0.1rem;
          color: #26754a;
        }

        .donation-payment-methods__notice-content {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 0.25rem;
        }

        .donation-payment-methods__notice-content p {
          margin: 0;
          font-size: 0.79rem;
          line-height: 1.5;
        }

        .donation-payment-methods__error {
          margin: 0.65rem 0 0;
          color: #b42318;
          font-size: 0.82rem;
          font-weight: 650;
          line-height: 1.45;
        }

        @media (max-width: 700px) {
          .donation-payment-methods__options {
            grid-template-columns: minmax(0, 1fr);
          }

          .donation-payment-methods__option {
            min-height: 104px;
          }
        }

        @media (max-width: 420px) {
          .donation-payment-methods__option {
            gap: 0.75rem;
            padding: 0.875rem;
            border-radius: 14px;
          }

          .donation-payment-methods__icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
          }

          .donation-payment-methods__description {
            font-size: 0.78rem;
          }

          .donation-payment-methods__notice {
            padding: 0.8rem 0.875rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .donation-payment-methods__option,
          .donation-payment-methods__icon,
          .donation-payment-methods__indicator,
          .donation-payment-methods__indicator-dot {
            transition: none;
          }
        }

        @media (forced-colors: active) {
          .donation-payment-methods__option {
            border: 1px solid CanvasText;
          }

          .donation-payment-methods__option--selected {
            outline: 2px solid Highlight;
            outline-offset: 2px;
          }

          .donation-payment-methods__indicator {
            border-color: CanvasText;
          }

          .donation-payment-methods__option--selected
            .donation-payment-methods__indicator-dot {
            background: Highlight;
          }
        }
      `}</style>
    </section>
  );
}

export default DonationPaymentMethods;