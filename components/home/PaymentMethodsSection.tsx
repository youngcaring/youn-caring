"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Wallet,
  Heart,
  Landmark,
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Info,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

/* =========================================================
   YOUNG CARING
   SECTION PUBLIQUE DES MOYENS DE PAIEMENT
========================================================= */

/* =========================================================
   TYPES
========================================================= */

export type PublicPaymentMethod = {
  id: string;

  name: string;

  accountNumber: string;

  accountHolder: string | null;

  logoUrl: string | null;

  descriptionFr: string | null;

  descriptionEn: string | null;

  displayOrder: number;
};

type PaymentMethodsSectionProps = {
  methods: PublicPaymentMethod[];
};

type PaymentType =
  | "mtn"
  | "moov"
  | "celtiis"
  | "bank"
  | "other";

/* =========================================================
   CONFIGURATION
========================================================= */

const REFRESH_INTERVAL = 15_000;

/* =========================================================
   TRADUCTIONS
========================================================= */

const translations = {
  fr: {
    label: "Faire un don",

    title: "Nos moyens de paiement",

    description:
      "Soutenez les actions de Young Caring en effectuant votre don directement depuis l’un de nos moyens de paiement disponibles.",

    accountHolder: "Nom du bénéficiaire",

    paymentNumber: "Numéro de paiement",

    bankAccount: "Numéro de compte / IBAN",

    bankTransfer: "Virement bancaire",

    mobileMoney: "Mobile Money",

    otherPayment: "Paiement direct",

    copy: "Copier",

    copied: "Copié !",

    copyError:
      "Impossible de copier automatiquement. Sélectionnez les coordonnées pour les copier.",

    details: "Informations complémentaires",

    securityTitle: "Vérifiez les coordonnées",

    securityText:
      "Avant de confirmer votre transfert, assurez-vous que le nom du bénéficiaire et le numéro correspondent aux informations affichées.",

    thanks:
      "Merci pour votre générosité et votre soutien.",

    copyNumber: "Copier les coordonnées de paiement",
  },

  en: {
    label: "Make a donation",

    title: "Our payment methods",

    description:
      "Support Young Caring’s activities by making a donation directly through one of our available payment methods.",

    accountHolder: "Account holder",

    paymentNumber: "Payment number",

    bankAccount: "Account number / IBAN",

    bankTransfer: "Bank transfer",

    mobileMoney: "Mobile Money",

    otherPayment: "Direct payment",

    copy: "Copy",

    copied: "Copied!",

    copyError:
      "Unable to copy automatically. Select the payment details to copy them.",

    details: "Additional information",

    securityTitle: "Verify payment details",

    securityText:
      "Before confirming your transfer, make sure the recipient name and number match the information displayed.",

    thanks:
      "Thank you for your generosity and support.",

    copyNumber: "Copy payment details",
  },
};

/* =========================================================
   IDENTIFICATION DU MOYEN DE PAIEMENT
========================================================= */

function getPaymentType(
  name: string
): PaymentType {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    normalized.includes("mtn") ||
    normalized.includes("momo")
  ) {
    return "mtn";
  }

  if (normalized.includes("moov")) {
    return "moov";
  }

  if (
    normalized.includes("celtiis") ||
    normalized.includes("celtis")
  ) {
    return "celtiis";
  }

  if (
    normalized.includes("virement bancaire") ||
    normalized.includes("bank transfer") ||
    normalized === "banque"
  ) {
    return "bank";
  }

  return "other";
}

/* =========================================================
   COULEURS DES MOYENS DE PAIEMENT
========================================================= */

const paymentColors: Record<
  PaymentType,
  {
    background: string;
    foreground: string;
    border: string;
  }
> = {
  mtn: {
    background: "#fff8d6",
    foreground: "#111111",
    border: "#f4ce46",
  },

  moov: {
    background: "#edf5ff",
    foreground: "#0056a6",
    border: "#dbeafe",
  },

  celtiis: {
    background: "#eef9f8",
    foreground: "#007d88",
    border: "#ccebea",
  },

  bank: {
    background: "#eaf8f9",
    foreground: "#007d88",
    border: "#ccebea",
  },

  other: {
    background: "#f3f6f6",
    foreground: "#007d88",
    border: "#e3e9ea",
  },
};

/* =========================================================
   EMPLACEMENT DES LOGOS
========================================================= */

const defaultLogos: Partial<
  Record<PaymentType, string>
> = {
  mtn: "/images/payments/mtn-momo.jpg",

  moov: "/images/payments/moov-money.jpg",

  celtiis: "/images/payments/celtiis-cash.jpg",
};

/* =========================================================
   VALIDATION DES CHEMINS D'IMAGES
========================================================= */

function getSafeLogoUrl(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  value = value.replace(/^(\/images\/payments\/(?:mtn-momo|moov-money|celtiis-cash))\.png$/i, "$1.jpg");

  /*
   * Les logos locaux sont autorisés.
   * Les URL arbitraires et les protocoles
   * non sécurisés sont refusés.
   */

  if (
    /^\/images\/payments\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|svg)$/i.test(
      value
    )
  ) {
    return value;
  }

  return null;
}

/* =========================================================
   COMPOSANT LOGO
========================================================= */

function PaymentLogo({
  method,
  type,
}: {
  method: PublicPaymentMethod;
  type: PaymentType;
}) {
  const colors = paymentColors[type];

  const source =
    getSafeLogoUrl(method.logoUrl) ??
    defaultLogos[type] ??
    null;

  const [failedSource, setFailedSource] =
    useState<string | null>(null);

  const showImage =
    source !== null &&
    failedSource !== source;

  return (
    <div
      className="
        relative flex h-19 w-27.5
        shrink-0 items-center justify-center
        overflow-hidden rounded-2xl
        border p-2
      "
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.foreground,
      }}
    >
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={source}
          alt={method.name}
          loading="lazy"
          decoding="async"
          className="
            h-full w-full object-contain
          "
          onError={() => {
            setFailedSource(source);
          }}
        />
      ) : type === "mtn" ? (

        /*
         * Réutilisation du logo MTN présent
         * dans l'image de paiement du projet.
         */

        <div
          role="img"
          aria-label="MTN Mobile Money"
          className="
            h-15 w-24
            rounded-lg bg-no-repeat
          "
          style={{
            backgroundImage:
              "url('/images/payments/payment-methods.png')",

            backgroundSize: "1067px auto",

            backgroundPosition:
              "-753px -16px",
          }}
        />

      ) : type === "moov" ? (

        <div className="text-center">
          <Smartphone
            size={24}
            className="mx-auto mb-1"
          />

          <span className="text-xs font-black">
            Moov Money
          </span>
        </div>

      ) : type === "celtiis" ? (

        <div className="text-center">
          <Smartphone
            size={24}
            className="mx-auto mb-1"
          />

          <span className="text-xs font-black">
            Celtiis Cash
          </span>
        </div>

      ) : type === "bank" ? (

        <Landmark
          size={36}
          strokeWidth={1.7}
        />

      ) : (

        <Wallet
          size={36}
          strokeWidth={1.7}
        />

      )}
    </div>
  );
}

/* =========================================================
   CARTE D'UN MOYEN DE PAIEMENT
========================================================= */

function PaymentCard({
  method,
  language,
}: {
  method: PublicPaymentMethod;
  language: "fr" | "en";
}) {
  const text = translations[language];

  const type = getPaymentType(method.name);

  const isBank = type === "bank";

  const isMobileMoney = [
    "mtn",
    "moov",
    "celtiis",
  ].includes(type);

  const [copied, setCopied] =
    useState(false);

  const [copyError, setCopyError] =
    useState(false);

  const colors = paymentColors[type];

  const description =
    language === "en"
      ? method.descriptionEn?.trim() ||
        method.descriptionFr?.trim() ||
        ""
      : method.descriptionFr?.trim() ||
        "";

  const name = isBank
    ? text.bankTransfer
    : method.name;

  const category = isBank
    ? text.bankTransfer
    : isMobileMoney
      ? text.mobileMoney
      : text.otherPayment;

  useEffect(() => {
    if (!copied && !copyError) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        setCopied(false);
        setCopyError(false);
      },
      3000
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copied, copyError]);

  /* =======================================================
     COPIER LES COORDONNÉES
  ======================================================= */

  async function copyAccountNumber() {
    const value =
      method.accountNumber.trim();

    if (!value) {
      return;
    }

    setCopyError(false);

    try {
      if (
        !navigator.clipboard ||
        !window.isSecureContext
      ) {
        throw new Error(
          "Clipboard unavailable"
        );
      }

      await navigator.clipboard.writeText(
        value
      );

      setCopied(true);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <article
      className="
        group relative flex h-full
        min-w-0 flex-col overflow-hidden
        rounded-[22px] border
        border-[#e0e8e9] bg-white
        shadow-[0_5px_24px_rgba(16,23,25,0.035)]
        transition-all duration-300
        hover:border-[#a7dadd]
        hover:shadow-[0_10px_32px_rgba(0,125,136,0.08)]
      "
    >

      {/* Ligne de couleur supérieure */}

      <div
        aria-hidden="true"
        className="h-1.5 w-full"
        style={{
          backgroundColor:
            type === "mtn"
              ? "#ffcb05"
              : type === "moov"
                ? "#0064c8"
                : type === "celtiis"
                  ? "#00a6a6"
                  : "#0097a7",
        }}
      />

      <div
        className="
          flex flex-1 flex-col
          p-5 sm:p-6
        "
      >

        {/* ================================================
            LOGO ET NOM DU MOYEN DE PAIEMENT
        ================================================ */}

        <div className="flex items-center gap-4">

          <PaymentLogo
            method={method}
            type={type}
          />

          <div className="min-w-0 flex-1">

            <span
              className="
                inline-flex rounded-full
                px-2.5 py-1
                text-[10px] font-bold
                uppercase tracking-wide
              "
              style={{
                backgroundColor:
                  colors.background,

                color:
                  colors.foreground,
              }}
            >
              {category}
            </span>

            <h3
              className="
                mt-2 wrap-break-word
                text-lg font-black
                leading-tight
                tracking-tight
                text-[#101719]
                sm:text-xl
              "
            >
              {name}
            </h3>
          </div>
        </div>

        {/* ================================================
            INFORMATIONS DU BÉNÉFICIAIRE
        ================================================ */}

        <div
          className="
            mt-6 flex-1 space-y-4
            border-t border-[#e8eeee]
            pt-5
          "
        >

          {method.accountHolder?.trim() && (
            <div>
              <p
                className="
                  text-xs font-semibold
                  text-[#637477]
                "
              >
                {text.accountHolder}
              </p>

              <p
                className="
                  mt-1 wrap-break-word
                  text-base font-bold
                  leading-relaxed
                  text-[#101719]
                "
              >
                {method.accountHolder}
              </p>
            </div>
          )}

          {/* ==============================================
              NUMÉRO OU COORDONNÉES BANCAIRES
          ============================================== */}

          <div
            className="
              rounded-2xl border
              border-[#dcebed]
              bg-[#f5fafa]
              p-4
            "
          >
            <p
              className="
                text-xs font-semibold
                text-[#637477]
              "
            >
              {isBank
                ? text.bankAccount
                : text.paymentNumber}
            </p>

            <div
              className="
                mt-3 flex flex-wrap
                items-center justify-between
                gap-3
              "
            >

              <p
                className="
                  min-w-0 flex-1
                  select-all break-all
                  text-lg font-black
                  leading-relaxed
                  tracking-wide
                  text-[#007d88]
                  sm:text-xl
                "
              >
                {method.accountNumber}
              </p>

              <button
                type="button"
                onClick={copyAccountNumber}
                aria-label={text.copyNumber}
                title={text.copyNumber}
                className={`
                  inline-flex min-h-10
                  shrink-0 items-center
                  justify-center gap-1.5
                  rounded-xl px-3 py-2
                  text-xs font-bold
                  transition-all
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#007d88]
                  active:scale-95

                  ${
                    copied
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-[#007d88] text-white hover:bg-[#006873]"
                  }
                `}
              >
                {copied ? (
                  <Check size={15} />
                ) : (
                  <Copy size={15} />
                )}

                {copied
                  ? text.copied
                  : text.copy}
              </button>
            </div>

            <span
              aria-live="polite"
              className="sr-only"
            >
              {copied
                ? text.copied
                : ""}
            </span>

            {copyError && (
              <p
                role="status"
                className="
                  mt-3 text-xs
                  leading-relaxed
                  text-[#a34a00]
                "
              >
                {text.copyError}
              </p>
            )}
          </div>

          {/* ==============================================
              INFORMATIONS COMPLÉMENTAIRES
          ============================================== */}

          {description && (
            <div
              className="
                rounded-xl
                bg-[#f7f9f9] p-4
              "
            >
              <div
                className="
                  flex items-center
                  gap-2
                "
              >
                <Info
                  size={15}
                  className="
                    shrink-0
                    text-[#0097a7]
                  "
                />

                <p
                  className="
                    text-xs font-bold
                    text-[#405356]
                  "
                >
                  {text.details}
                </p>
              </div>

              <p
                className="
                  mt-2 whitespace-pre-wrap
                  wrap-break-word text-sm
                  leading-relaxed
                  text-[#5f6d70]
                "
              >
                {description}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SECTION PRINCIPALE
========================================================= */

export default function PaymentMethodsSection({
  methods,
}: PaymentMethodsSectionProps) {
  const router = useRouter();

  const { language } = useLanguage();

  const currentLanguage =
    language === "en"
      ? "en"
      : "fr";

  const text =
    translations[currentLanguage];

  /* =======================================================
     ACTUALISATION AUTOMATIQUE DES INFORMATIONS
  ======================================================= */

  useEffect(() => {
    function refreshPayments() {
      if (
        document.visibilityState === "visible" &&
        navigator.onLine
      ) {
        router.refresh();
      }
    }

    /*
     * Actualisation toutes les 15 secondes.
     */

    const interval = window.setInterval(
      refreshPayments,
      REFRESH_INTERVAL
    );

    /*
     * Actualisation immédiate lorsque
     * le visiteur revient sur la page.
     */

    document.addEventListener(
      "visibilitychange",
      refreshPayments
    );

    /*
     * Actualisation après rétablissement
     * de la connexion Internet.
     */

    window.addEventListener(
      "online",
      refreshPayments
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        refreshPayments
      );

      window.removeEventListener(
        "online",
        refreshPayments
      );
    };
  }, [router]);

  /* =======================================================
     TRI ET VALIDATION DES MOYENS DE PAIEMENT
  ======================================================= */

  const availableMethods = methods
    .filter(
      (method) =>
        method.name.trim().length > 0 &&
        method.accountNumber.trim().length > 0
    )
    .slice()
    .sort(
      (first, second) =>
        first.displayOrder -
        second.displayOrder
    );

  /*
   * Aucune section vide ne sera affichée.
   * Si aucun moyen de paiement n'est actif,
   * la section disparaît automatiquement.
   */

  if (availableMethods.length === 0) {
    return null;
  }

  return (
    <section
      id="moyens-de-paiement"
      aria-labelledby="payment-methods-title"
      className="
        site-section relative isolate
        overflow-hidden bg-white
      "
    >

      {/* ================================================
          ÉLÉMENTS DÉCORATIFS
      ================================================ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -left-48 top-0 -z-10
          h-105 w-105
          rounded-full bg-[#eaf8f9]
          opacity-80 blur-[100px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -bottom-40 -right-40 -z-10
          h-95 w-95
          rounded-full bg-[#fff0e5]
          opacity-60 blur-[100px]
        "
      />

      <div className="site-container relative">

        {/* ================================================
            EN-TÊTE DE LA SECTION
        ================================================ */}

        <div
          className="
            mx-auto max-w-3xl
            text-center
          "
        >
          <div
            className="
              inline-flex items-center
              justify-center gap-2
            "
          >
            <Heart
              size={18}
              aria-hidden="true"
              className="text-[#f36c16]"
            />

            <p className="section-label">
              {text.label}
            </p>
          </div>

          <h2
            id="payment-methods-title"
            className="section-title !text-[clamp(1.8rem,3.5vw,2.75rem)]"
          >
            {text.title}
          </h2>

          <p
            className="
              mx-auto mt-4 max-w-2xl
              text-sm leading-relaxed
              text-[#5f6d70]
              sm:text-base
              sm:leading-relaxed
            "
          >
            {text.description}
          </p>
        </div>

        {/* ================================================
            MOYENS DE PAIEMENT DYNAMIQUES
        ================================================ */}

        <div
          className={`
            mt-8 grid items-stretch
            gap-4 sm:mt-10 sm:gap-6

            ${
              availableMethods.length === 1
                ? "mx-auto max-w-lg grid-cols-1"
                : "mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2"
            }
          `}
        >
          {availableMethods.map(
            (method) => (
              <PaymentCard
                key={JSON.stringify([method.id, method.accountNumber])}
                method={method}
                language={
                  currentLanguage
                }
              />
            )
          )}
        </div>

        {/* ================================================
            INFORMATION DE SÉCURITÉ
        ================================================ */}

        <div
          className="
            mt-6 flex flex-col
            gap-4 rounded-2xl
            border border-[#d8eaec]
            bg-[#f3fafa] p-5

            sm:mt-8 sm:flex-row
            sm:items-center sm:gap-5
            sm:p-6
          "
        >
          <div
            className="
              flex h-12 w-12
              shrink-0 items-center
              justify-center
              rounded-xl bg-[#e0f2f3]
              text-[#007d88]
            "
          >
            <ShieldCheck
              size={27}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="
                text-sm font-bold
                text-[#101719]
                sm:text-base
              "
            >
              {text.securityTitle}
            </h3>

            <p
              className="
                mt-1 text-xs
                leading-relaxed
                text-[#5f6d70]
                sm:text-sm
              "
            >
              {text.securityText}
            </p>
          </div>

          <CreditCard
            size={30}
            aria-hidden="true"
            strokeWidth={1.5}
            className="
              hidden shrink-0
              text-[#8ec8cd]
              sm:block
            "
          />
        </div>

        {/* ================================================
            REMERCIEMENTS
        ================================================ */}

        <div
          className="
            mt-6 flex items-center
            justify-center gap-2
            text-center
          "
        >
          <Heart
            size={16}
            aria-hidden="true"
            className="
              shrink-0 fill-[#f36c16]
              text-[#f36c16]
            "
          />

          <p
            className="
              text-xs font-medium
              text-[#5f6d70]
              sm:text-sm
            "
          >
            {text.thanks}
          </p>
        </div>
      </div>
    </section>
  );
}
