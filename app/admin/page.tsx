import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  Activity,
  Banknote,
  CheckCircle2,
  Clock3,
  ExternalLink,
  HeartHandshake,
  LogOut,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";

import {
  logoutAdmin,
  requireAdmin,
} from "@/lib/admin-auth";

import {
  db,
} from "@/lib/db";

/**
 * ============================================================================
 * YOUNG CARING
 * TABLEAU DE BORD ADMINISTRATEUR
 * ============================================================================
 *
 * Cette page :
 *
 * - est entièrement côté serveur ;
 * - exige une session administrateur valide ;
 * - lit les données réelles de PostgreSQL ;
 * - ne mélange jamais les différentes devises ;
 * - compte uniquement les paiements "paid"
 *   comme dons réellement collectés ;
 * - exclut donc automatiquement les remboursements ;
 * - affiche les paiements en attente ;
 * - surveille les incidents webhook / reçus ;
 * - n'expose aucun secret ;
 * - reste utilisable si la base rencontre
 *   temporairement une erreur.
 *
 * Aucun chiffre financier n'est inventé.
 * ============================================================================
 */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export const metadata:
  Metadata = {
  title:
    "Tableau de bord | Young Caring",

  description:
    "Administration et suivi des dons Young Caring.",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * ============================================================================
 * TYPES
 * ============================================================================
 */

const CURRENCIES = [
  "XOF",
  "EUR",
  "USD",
] as const;

type CurrencyCode =
  (typeof CURRENCIES)[number];

type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

type DonationAllocation =
  | "priority"
  | "education"
  | "foodSupport"
  | "health"
  | "clothing"
  | "children"
  | "womenFamilies"
  | "waterHygiene"
  | "emergency";

type CurrencySummary =
  Readonly<{
    amount: number;
    count: number;
  }>;

type CurrencySummaries =
  Record<
    CurrencyCode,
    CurrencySummary
  >;

type RecentPayment =
  Readonly<{
    id: string;
    reference: string;
    amount: number;
    currency: CurrencyCode;
    status: PaymentStatus;
    allocation: DonationAllocation;
    donorFirstName: string;
    donorLastName: string;
    anonymous: boolean;
    createdAt: Date;
    paidAt: Date | null;
  }>;

type DashboardData =
  Readonly<{
    paidTotals:
      CurrencySummaries;

    monthTotals:
      CurrencySummaries;

    confirmedDonations:
      number;

    confirmedThisMonth:
      number;

    uniqueDonors:
      number;

    pendingPayments:
      number;

    unsuccessfulPayments:
      number;

    failedWebhooks:
      number;

    failedReceipts:
      number;

    failedReceiptEmails:
      number;

    recentPayments:
      readonly RecentPayment[];
  }>;

type DashboardResult =
  | Readonly<{
      success: true;
      data: DashboardData;
    }>
  | Readonly<{
      success: false;
    }>;

/**
 * ============================================================================
 * LIBELLÉS
 * ============================================================================
 */

const ALLOCATION_LABELS:
  Record<
    DonationAllocation,
    string
  > = {
  priority:
    "Besoins prioritaires",

  education:
    "Éducation",

  foodSupport:
    "Aide alimentaire",

  health:
    "Santé",

  clothing:
    "Vêtements",

  children:
    "Enfants",

  womenFamilies:
    "Femmes et familles",

  waterHygiene:
    "Eau et hygiène",

  emergency:
    "Urgence",
};

const STATUS_LABELS:
  Record<
    PaymentStatus,
    string
  > = {
  pending:
    "En attente",

  processing:
    "En traitement",

  paid:
    "Payé",

  failed:
    "Échoué",

  cancelled:
    "Annulé",

  expired:
    "Expiré",

  refunded:
    "Remboursé",
};

const STATUS_CLASSES:
  Record<
    PaymentStatus,
    string
  > = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700",

  processing:
    "border-blue-200 bg-blue-50 text-blue-700",

  paid:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  failed:
    "border-red-200 bg-red-50 text-red-700",

  cancelled:
    "border-slate-200 bg-slate-100 text-slate-600",

  expired:
    "border-slate-200 bg-slate-100 text-slate-600",

  refunded:
    "border-violet-200 bg-violet-50 text-violet-700",
};

/**
 * ============================================================================
 * OUTILS
 * ============================================================================
 */

function isCurrencyCode(
  value: string
): value is CurrencyCode {
  return (
    value === "XOF" ||
    value === "EUR" ||
    value === "USD"
  );
}

function createEmptyCurrencySummaries():
  CurrencySummaries {
  return {
    XOF: {
      amount: 0,
      count: 0,
    },

    EUR: {
      amount: 0,
      count: 0,
    },

    USD: {
      amount: 0,
      count: 0,
    },
  };
}

function formatAmount(
  amount: number,
  currency: CurrencyCode
): string {
  if (currency === "XOF") {
    return (
      `${new Intl.NumberFormat(
        "fr-FR",
        {
          maximumFractionDigits: 0,
        }
      ).format(amount)} FCFA`
    );
  }

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

function formatNumber(
  value: number
): string {
  return new Intl.NumberFormat(
    "fr-FR"
  ).format(value);
}

function formatDateTime(
  value: Date
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone:
        "Africa/Porto-Novo",

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(value);
}

/**
 * Retourne le début du mois courant
 * selon l'heure du Bénin.
 *
 * Le Bénin utilise UTC+1 sans changement
 * saisonnier.
 */
function getCurrentBeninMonthStart(
  now = new Date()
): Date {
  const BENIN_OFFSET_MS =
    60 * 60 * 1_000;

  const beninNow =
    new Date(
      now.getTime() +
        BENIN_OFFSET_MS
    );

  const year =
    beninNow.getUTCFullYear();

  const month =
    beninNow.getUTCMonth();

  return new Date(
    Date.UTC(
      year,
      month,
      1,
      0,
      0,
      0,
      0
    ) -
      BENIN_OFFSET_MS
  );
}

/**
 * ============================================================================
 * CHARGEMENT DES DONNÉES
 * ============================================================================
 */

async function loadDashboardData():
  Promise<DashboardResult> {
  const monthStart =
    getCurrentBeninMonthStart();

  try {
    const [
      paidByCurrency,
      monthPaidByCurrency,
      pendingPayments,
      unsuccessfulPayments,
      uniqueDonorGroups,
      recentPaymentRows,
      failedWebhooks,
      failedReceipts,
      failedReceiptEmails,
    ] =
      await Promise.all([
        /**
         * Total réellement encaissé.
         *
         * Seuls les paiements ayant encore
         * le statut paid sont comptabilisés.
         */
        db.donationPayment.groupBy({
          by: [
            "currency",
          ],

          where: {
            status:
              "paid",
          },

          _sum: {
            amount:
              true,
          },

          _count: {
            _all:
              true,
          },
        }),

        /**
         * Dons confirmés du mois courant.
         */
        db.donationPayment.groupBy({
          by: [
            "currency",
          ],

          where: {
            status:
              "paid",

            paidAt: {
              gte:
                monthStart,
            },
          },

          _sum: {
            amount:
              true,
          },

          _count: {
            _all:
              true,
          },
        }),

        /**
         * Paiements encore en cours.
         */
        db.donationPayment.count({
          where: {
            status: {
              in: [
                "pending",
                "processing",
              ],
            },
          },
        }),

        /**
         * Paiements non aboutis.
         *
         * Un remboursement est volontairement
         * exclu de cette métrique.
         */
        db.donationPayment.count({
          where: {
            status: {
              in: [
                "failed",
                "cancelled",
                "expired",
              ],
            },
          },
        }),

        /**
         * Nombre de donateurs uniques
         * ayant au moins un don confirmé.
         */
        db.donationPayment.groupBy({
          by: [
            "donorEmail",
          ],

          where: {
            status:
              "paid",
          },
        }),

        /**
         * Derniers paiements.
         */
        db.donationPayment.findMany({
          take:
            8,

          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id:
              true,

            reference:
              true,

            amount:
              true,

            currency:
              true,

            status:
              true,

            allocation:
              true,

            donorFirstName:
              true,

            donorLastName:
              true,

            anonymous:
              true,

            createdAt:
              true,

            paidAt:
              true,
          },
        }),

        /**
         * Surveillance technique.
         */
        db.donationWebhookEvent.count({
          where: {
            status:
              "failed",
          },
        }),

        db.donationReceipt.count({
          where: {
            status:
              "failed",
          },
        }),

        db.donationReceipt.count({
          where: {
            emailStatus:
              "failed",
          },
        }),
      ]);

    const paidTotals =
      createEmptyCurrencySummaries();

    for (
      const item of paidByCurrency
    ) {
      const currency =
        String(
          item.currency
        );

      if (
        !isCurrencyCode(
          currency
        )
      ) {
        continue;
      }

      paidTotals[
        currency
      ] = {
        amount:
          item._sum.amount ??
          0,

        count:
          item._count._all,
      };
    }

    const monthTotals =
      createEmptyCurrencySummaries();

    for (
      const item of
        monthPaidByCurrency
    ) {
      const currency =
        String(
          item.currency
        );

      if (
        !isCurrencyCode(
          currency
        )
      ) {
        continue;
      }

      monthTotals[
        currency
      ] = {
        amount:
          item._sum.amount ??
          0,

        count:
          item._count._all,
      };
    }

    const confirmedDonations =
      CURRENCIES.reduce(
        (
          total,
          currency
        ) =>
          total +
          paidTotals[
            currency
          ].count,

        0
      );

    const confirmedThisMonth =
      CURRENCIES.reduce(
        (
          total,
          currency
        ) =>
          total +
          monthTotals[
            currency
          ].count,

        0
      );

    const recentPayments:
      RecentPayment[] =
      recentPaymentRows.map(
        (payment) => ({
          id:
            payment.id,

          reference:
            payment.reference,

          amount:
            payment.amount,

          currency:
            payment
              .currency as
              CurrencyCode,

          status:
            payment
              .status as
              PaymentStatus,

          allocation:
            payment
              .allocation as
              DonationAllocation,

          donorFirstName:
            payment
              .donorFirstName,

          donorLastName:
            payment
              .donorLastName,

          anonymous:
            payment.anonymous,

          createdAt:
            payment.createdAt,

          paidAt:
            payment.paidAt,
        })
      );

    return {
      success:
        true,

      data: {
        paidTotals,

        monthTotals,

        confirmedDonations,

        confirmedThisMonth,

        uniqueDonors:
          uniqueDonorGroups.length,

        pendingPayments,

        unsuccessfulPayments,

        failedWebhooks,

        failedReceipts,

        failedReceiptEmails,

        recentPayments,
      },
    };
  } catch (
    error: unknown
  ) {
    /**
     * Ne jamais écrire DATABASE_URL,
     * les données donateurs ou les
     * détails des transactions dans
     * les logs.
     */
    console.error(
      "Admin dashboard data loading failed:",
      {
        name:
          error instanceof
          Error
            ? error.name
            : "UnknownError",
      }
    );

    return {
      success:
        false,
    };
  }
}

/**
 * ============================================================================
 * DÉCONNEXION
 * ============================================================================
 */

async function logoutAction():
  Promise<void> {
  "use server";

  await logoutAdmin();
}

/**
 * ============================================================================
 * COMPOSANTS INTERNES
 * ============================================================================
 */

function MoneySummary({
  totals,
}: Readonly<{
  totals:
    CurrencySummaries;
}>) {
  const activeCurrencies =
    CURRENCIES.filter(
      (currency) =>
        totals[
          currency
        ].amount > 0
    );

  if (
    activeCurrencies.length ===
    0
  ) {
    return (
      <p
        className="
          mt-3
          text-2xl
          font-extrabold
          tracking-tight
          text-[var(--yc-text)]
        "
      >
        0 FCFA
      </p>
    );
  }

  return (
    <div
      className="
        mt-3
        space-y-1
      "
    >
      {activeCurrencies.map(
        (currency) => (
          <p
            key={
              currency
            }
            className="
              text-2xl
              font-extrabold
              tracking-tight
              text-[var(--yc-text)]
            "
          >
            {formatAmount(
              totals[
                currency
              ].amount,
              currency
            )}
          </p>
        )
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: Readonly<{
  status:
    PaymentStatus;
}>) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-bold
        ${STATUS_CLASSES[
          status
        ]}
      `}
    >
      {
        STATUS_LABELS[
          status
        ]
      }
    </span>
  );
}

/**
 * ============================================================================
 * PAGE
 * ============================================================================
 */

export default async function AdminDashboardPage() {
  /**
   * La vérification de session intervient
   * avant toute lecture des données.
   */
  const session =
    await requireAdmin();

  const dashboard =
    await loadDashboardData();

  const now =
    new Date();

  return (
    <main
      className="
        min-h-screen
        bg-[var(--yc-surface)]
        text-[var(--yc-text)]
      "
    >
      {/*
       * ================================================================
       * HEADER
       * ================================================================
       */}

      <header
        className="
          border-b
          border-[var(--yc-border)]
          bg-white
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1440px]
            items-center
            justify-between
            gap-4
            px-4
            py-4
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-[var(--yc-border)]
                bg-white
              "
            >
              <Image
                src="/logo/logo.png"
                alt="Young Caring"
                width={44}
                height={44}
                priority
                className="
                  h-full
                  w-full
                  object-contain
                  p-1
                "
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  truncate
                  text-base
                  font-extrabold
                  tracking-tight
                "
              >
                Young Caring
              </p>

              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-[var(--yc-text-muted)]
                "
              >
                Administration
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                hidden
                h-10
                items-center
                gap-2
                rounded-full
                border
                border-[var(--yc-border)]
                bg-white
                px-4
                text-sm
                font-bold
                text-[var(--yc-text)]
                transition
                hover:border-[var(--yc-turquoise)]
                hover:text-[var(--yc-turquoise-dark)]
                sm:inline-flex
              "
            >
              Voir le site

              <ExternalLink
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />
            </Link>

            <form
              action={
                logoutAction
              }
            >
              <button
                type="submit"
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-full
                  bg-[var(--yc-dark)]
                  px-4
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[var(--yc-dark-soft)]
                "
              >
                <LogOut
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                  "
                />

                <span
                  className="
                    hidden
                    sm:inline
                  "
                >
                  Déconnexion
                </span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/*
       * ================================================================
       * CONTENU
       * ================================================================
       */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]
          px-4
          py-7
          sm:px-6
          sm:py-9
          lg:px-8
        "
      >
        {/*
         * ==============================================================
         * INTRODUCTION
         * ==============================================================
         */}

        <section
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                mb-3
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[var(--yc-turquoise-light)]
                px-3
                py-1.5
                text-xs
                font-extrabold
                text-[var(--yc-turquoise-deep)]
              "
            >
              <ShieldCheck
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />

              Espace sécurisé
            </div>

            <h1
              className="
                text-3xl
                font-extrabold
                tracking-tight
                sm:text-4xl
              "
            >
              Tableau de bord
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-[var(--yc-text-muted)]
                sm:text-base
              "
            >
              Suivez les dons,
              les paiements confirmés
              et l’état technique
              du système Young Caring.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <div
              className="
                rounded-xl
                border
                border-[var(--yc-border)]
                bg-white
                px-4
                py-2.5
              "
            >
              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-[var(--yc-text-muted)]
                "
              >
                Connecté
              </p>

              <p
                className="
                  mt-0.5
                  max-w-[230px]
                  truncate
                  text-sm
                  font-bold
                "
              >
                {
                  session.email
                }
              </p>
            </div>

            <Link
              href="/admin"
              className="
                inline-flex
                h-11
                items-center
                gap-2
                rounded-xl
                border
                border-[var(--yc-border)]
                bg-white
                px-4
                text-sm
                font-bold
                transition
                hover:border-[var(--yc-turquoise)]
                hover:text-[var(--yc-turquoise-dark)]
              "
            >
              <RefreshCw
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />

              Actualiser
            </Link>
          </div>
        </section>

        {/*
         * ==============================================================
         * ERREUR BDD
         * ==============================================================
         */}

        {!dashboard.success ? (
          <section
            role="alert"
            className="
              mt-7
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-5
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <TriangleAlert
                aria-hidden="true"
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-red-700
                "
              />

              <div>
                <h2
                  className="
                    font-extrabold
                    text-red-900
                  "
                >
                  Données temporairement
                  indisponibles
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-red-700
                  "
                >
                  L’espace administrateur
                  reste sécurisé, mais les
                  statistiques n’ont pas pu
                  être chargées depuis la
                  base de données.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/*
             * ==========================================================
             * STATISTIQUES
             * ==========================================================
             */}

            <section
              aria-label="Statistiques des dons"
              className="
                mt-7
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              {/*
               * Total collecté
               */}

              <article
                className="
                  rounded-2xl
                  border
                  border-[var(--yc-border)]
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-[var(--yc-text-muted)]
                      "
                    >
                      Total collecté
                    </p>

                    <MoneySummary
                      totals={
                        dashboard
                          .data
                          .paidTotals
                      }
                    />
                  </div>

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--yc-turquoise-light)]
                      text-[var(--yc-turquoise-dark)]
                    "
                  >
                    <Banknote
                      aria-hidden="true"
                      className="
                        h-5
                        w-5
                      "
                    />
                  </div>
                </div>

                <p
                  className="
                    mt-4
                    text-xs
                    leading-5
                    text-[var(--yc-text-muted)]
                  "
                >
                  Uniquement les dons
                  confirmés par le
                  prestataire de paiement.
                </p>
              </article>

              {/*
               * Ce mois
               */}

              <article
                className="
                  rounded-2xl
                  border
                  border-[var(--yc-border)]
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-[var(--yc-text-muted)]
                      "
                    >
                      Ce mois
                    </p>

                    <MoneySummary
                      totals={
                        dashboard
                          .data
                          .monthTotals
                      }
                    />
                  </div>

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[var(--yc-orange-light)]
                      text-[var(--yc-orange)]
                    "
                  >
                    <HeartHandshake
                      aria-hidden="true"
                      className="
                        h-5
                        w-5
                      "
                    />
                  </div>
                </div>

                <p
                  className="
                    mt-4
                    text-xs
                    leading-5
                    text-[var(--yc-text-muted)]
                  "
                >
                  {
                    formatNumber(
                      dashboard
                        .data
                        .confirmedThisMonth
                    )
                  }{" "}
                  don
                  {
                    dashboard
                      .data
                      .confirmedThisMonth >
                    1
                      ? "s"
                      : ""
                  }{" "}
                  confirmé
                  {
                    dashboard
                      .data
                      .confirmedThisMonth >
                    1
                      ? "s"
                      : ""
                  }{" "}
                  ce mois.
                </p>
              </article>

              {/*
               * Dons confirmés
               */}

              <article
                className="
                  rounded-2xl
                  border
                  border-[var(--yc-border)]
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-[var(--yc-text-muted)]
                      "
                    >
                      Dons confirmés
                    </p>

                    <p
                      className="
                        mt-3
                        text-3xl
                        font-extrabold
                        tracking-tight
                      "
                    >
                      {
                        formatNumber(
                          dashboard
                            .data
                            .confirmedDonations
                        )
                      }
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-50
                      text-emerald-700
                    "
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="
                        h-5
                        w-5
                      "
                    />
                  </div>
                </div>

                <p
                  className="
                    mt-4
                    text-xs
                    leading-5
                    text-[var(--yc-text-muted)]
                  "
                >
                  Statut réel :
                  {" "}
                  <strong>
                    paid
                  </strong>.
                </p>
              </article>

              {/*
               * Donateurs
               */}

              <article
                className="
                  rounded-2xl
                  border
                  border-[var(--yc-border)]
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-[var(--yc-text-muted)]
                      "
                    >
                      Donateurs
                    </p>

                    <p
                      className="
                        mt-3
                        text-3xl
                        font-extrabold
                        tracking-tight
                      "
                    >
                      {
                        formatNumber(
                          dashboard
                            .data
                            .uniqueDonors
                        )
                      }
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-700
                    "
                  >
                    <Users
                      aria-hidden="true"
                      className="
                        h-5
                        w-5
                      "
                    />
                  </div>
                </div>

                <p
                  className="
                    mt-4
                    text-xs
                    leading-5
                    text-[var(--yc-text-muted)]
                  "
                >
                  Adresses e-mail uniques
                  ayant au moins un don
                  confirmé.
                </p>
              </article>
            </section>

            {/*
             * ==========================================================
             * ÉTAT DES PAIEMENTS
             * ==========================================================
             */}

            <section
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <article
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-2xl
                  border
                  border-amber-200
                  bg-amber-50
                  p-5
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                      text-amber-800
                    "
                  >
                    Paiements en cours
                  </p>

                  <p
                    className="
                      mt-1
                      text-2xl
                      font-extrabold
                      text-amber-950
                    "
                  >
                    {
                      formatNumber(
                        dashboard
                          .data
                          .pendingPayments
                      )
                    }
                  </p>
                </div>

                <Clock3
                  aria-hidden="true"
                  className="
                    h-7
                    w-7
                    text-amber-700
                  "
                />
              </article>

              <article
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                      text-[var(--yc-text-muted)]
                    "
                  >
                    Paiements non aboutis
                  </p>

                  <p
                    className="
                      mt-1
                      text-2xl
                      font-extrabold
                    "
                  >
                    {
                      formatNumber(
                        dashboard
                          .data
                          .unsuccessfulPayments
                      )
                    }
                  </p>
                </div>

                <Activity
                  aria-hidden="true"
                  className="
                    h-7
                    w-7
                    text-slate-500
                  "
                />
              </article>
            </section>

            {/*
             * ==========================================================
             * CONTENU PRINCIPAL
             * ==========================================================
             */}

            <section
              className="
                mt-7
                grid
                gap-6
                xl:grid-cols-[minmax(0,1fr)_340px]
              "
            >
              {/*
               * ========================================================
               * DERNIERS DONS
               * ========================================================
               */}

              <article
                className="
                  min-w-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[var(--yc-border)]
                  bg-white
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    border-b
                    border-[var(--yc-border)]
                    px-5
                    py-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                  "
                >
                  <div>
                    <h2
                      className="
                        text-lg
                        font-extrabold
                      "
                    >
                      Derniers dons
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-[var(--yc-text-muted)]
                      "
                    >
                      Les 8 dernières
                      transactions enregistrées.
                    </p>
                  </div>

                  <span
                    className="
                      text-xs
                      font-semibold
                      text-[var(--yc-text-muted)]
                    "
                  >
                    Mise à jour :
                    {" "}
                    {
                      formatDateTime(
                        now
                      )
                    }
                  </span>
                </div>

                {dashboard
                  .data
                  .recentPayments
                  .length === 0 ? (
                  <div
                    className="
                      flex
                      min-h-64
                      flex-col
                      items-center
                      justify-center
                      px-6
                      py-12
                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[var(--yc-turquoise-light)]
                        text-[var(--yc-turquoise-dark)]
                      "
                    >
                      <HeartHandshake
                        aria-hidden="true"
                        className="
                          h-6
                          w-6
                        "
                      />
                    </div>

                    <h3
                      className="
                        mt-4
                        font-extrabold
                      "
                    >
                      Aucun don enregistré
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-md
                        text-sm
                        leading-6
                        text-[var(--yc-text-muted)]
                      "
                    >
                      Les nouvelles
                      transactions apparaîtront
                      automatiquement ici.
                    </p>
                  </div>
                ) : (
                  <div
                    className="
                      overflow-x-auto
                    "
                  >
                    <table
                      className="
                        w-full
                        min-w-[850px]
                        border-collapse
                        text-left
                      "
                    >
                      <thead
                        className="
                          bg-[var(--yc-surface)]
                        "
                      >
                        <tr>
                          <th
                            className="
                              px-6
                              py-3
                              text-xs
                              font-extrabold
                              uppercase
                              tracking-wide
                              text-[var(--yc-text-muted)]
                            "
                          >
                            Donateur
                          </th>

                          <th
                            className="
                              px-4
                              py-3
                              text-xs
                              font-extrabold
                              uppercase
                              tracking-wide
                              text-[var(--yc-text-muted)]
                            "
                          >
                            Référence
                          </th>

                          <th
                            className="
                              px-4
                              py-3
                              text-xs
                              font-extrabold
                              uppercase
                              tracking-wide
                              text-[var(--yc-text-muted)]
                            "
                          >
                            Destination
                          </th>

                          <th
                            className="
                              px-4
                              py-3
                              text-xs
                              font-extrabold
                              uppercase
                              tracking-wide
                              text-[var(--yc-text-muted)]
                            "
                          >
                            Montant
                          </th>

                          <th
                            className="
                              px-4
                              py-3
                              text-xs
                              font-extrabold
                              uppercase
                              tracking-wide
                              text-[var(--yc-text-muted)]
                            "
                          >
                            Statut
                          </th>

                          <th
                            className="
                              px-4
                              py-3
                              pr-6
                              text-xs
                              font-extrabold
                              uppercase
                              tracking-wide
                              text-[var(--yc-text-muted)]
                            "
                          >
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {dashboard
                          .data
                          .recentPayments
                          .map(
                            (
                              payment
                            ) => (
                              <tr
                                key={
                                  payment.id
                                }
                                className="
                                  border-t
                                  border-[var(--yc-border)]
                                  transition
                                  hover:bg-[var(--yc-surface)]
                                "
                              >
                                <td
                                  className="
                                    px-6
                                    py-4
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-3
                                    "
                                  >
                                    <div
                                      className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[var(--yc-turquoise-light)]
                                        text-xs
                                        font-extrabold
                                        uppercase
                                        text-[var(--yc-turquoise-deep)]
                                      "
                                    >
                                      {
                                        payment
                                          .donorFirstName
                                          .slice(
                                            0,
                                            1
                                          )
                                      }
                                      {
                                        payment
                                          .donorLastName
                                          .slice(
                                            0,
                                            1
                                          )
                                      }
                                    </div>

                                    <div
                                      className="
                                        min-w-0
                                      "
                                    >
                                      <p
                                        className="
                                          max-w-[190px]
                                          truncate
                                          text-sm
                                          font-bold
                                        "
                                      >
                                        {
                                          payment
                                            .donorFirstName
                                        }{" "}
                                        {
                                          payment
                                            .donorLastName
                                        }
                                      </p>

                                      {payment
                                        .anonymous ? (
                                        <p
                                          className="
                                            mt-0.5
                                            text-xs
                                            font-semibold
                                            text-[var(--yc-text-muted)]
                                          "
                                        >
                                          Anonyme publiquement
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>

                                <td
                                  className="
                                    px-4
                                    py-4
                                    font-mono
                                    text-xs
                                    font-semibold
                                    text-[var(--yc-text-muted)]
                                  "
                                >
                                  {
                                    payment.reference
                                  }
                                </td>

                                <td
                                  className="
                                    px-4
                                    py-4
                                    text-sm
                                    font-medium
                                  "
                                >
                                  {
                                    ALLOCATION_LABELS[
                                      payment
                                        .allocation
                                    ]
                                  }
                                </td>

                                <td
                                  className="
                                    whitespace-nowrap
                                    px-4
                                    py-4
                                    text-sm
                                    font-extrabold
                                  "
                                >
                                  {
                                    formatAmount(
                                      payment.amount,
                                      payment.currency
                                    )
                                  }
                                </td>

                                <td
                                  className="
                                    px-4
                                    py-4
                                  "
                                >
                                  <StatusBadge
                                    status={
                                      payment.status
                                    }
                                  />
                                </td>

                                <td
                                  className="
                                    whitespace-nowrap
                                    px-4
                                    py-4
                                    pr-6
                                    text-sm
                                    text-[var(--yc-text-muted)]
                                  "
                                >
                                  {
                                    formatDateTime(
                                      payment
                                        .paidAt ??
                                        payment
                                          .createdAt
                                    )
                                  }
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>

              {/*
               * ========================================================
               * SURVEILLANCE
               * ========================================================
               */}

              <aside
                className="
                  space-y-5
                "
              >
                <article
                  className="
                    rounded-2xl
                    border
                    border-[var(--yc-border)]
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-[var(--yc-turquoise-light)]
                        text-[var(--yc-turquoise-dark)]
                      "
                    >
                      <ShieldCheck
                        aria-hidden="true"
                        className="
                          h-5
                          w-5
                        "
                      />
                    </div>

                    <div>
                      <h2
                        className="
                          font-extrabold
                        "
                      >
                        Surveillance
                      </h2>

                      <p
                        className="
                          text-xs
                          text-[var(--yc-text-muted)]
                        "
                      >
                        État technique
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-5
                      space-y-3
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-xl
                        bg-[var(--yc-surface)]
                        px-4
                        py-3
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-semibold
                          text-[var(--yc-text-muted)]
                        "
                      >
                        Webhooks en échec
                      </span>

                      <strong>
                        {
                          dashboard
                            .data
                            .failedWebhooks
                        }
                      </strong>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-xl
                        bg-[var(--yc-surface)]
                        px-4
                        py-3
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-semibold
                          text-[var(--yc-text-muted)]
                        "
                      >
                        Reçus PDF en échec
                      </span>

                      <strong>
                        {
                          dashboard
                            .data
                            .failedReceipts
                        }
                      </strong>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-xl
                        bg-[var(--yc-surface)]
                        px-4
                        py-3
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-semibold
                          text-[var(--yc-text-muted)]
                        "
                      >
                        E-mails en échec
                      </span>

                      <strong>
                        {
                          dashboard
                            .data
                            .failedReceiptEmails
                        }
                      </strong>
                    </div>
                  </div>

                  {dashboard
                    .data
                    .failedWebhooks ===
                    0 &&
                  dashboard
                    .data
                    .failedReceipts ===
                    0 &&
                  dashboard
                    .data
                    .failedReceiptEmails ===
                    0 ? (
                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-3
                        py-3
                        text-sm
                        font-bold
                        text-emerald-700
                      "
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="
                          h-4
                          w-4
                          shrink-0
                        "
                      />

                      Aucun incident détecté
                    </div>
                  ) : (
                    <div
                      className="
                        mt-4
                        flex
                        items-start
                        gap-2
                        rounded-xl
                        border
                        border-amber-200
                        bg-amber-50
                        px-3
                        py-3
                        text-sm
                        font-semibold
                        text-amber-800
                      "
                    >
                      <TriangleAlert
                        aria-hidden="true"
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                        "
                      />

                      Une vérification technique
                      est recommandée.
                    </div>
                  )}
                </article>

                <article
                  className="
                    rounded-2xl
                    bg-[var(--yc-dark)]
                    p-5
                    text-white
                    shadow-sm
                  "
                >
                  <HeartHandshake
                    aria-hidden="true"
                    className="
                      h-7
                      w-7
                      text-[var(--yc-orange)]
                    "
                  />

                  <h2
                    className="
                      mt-4
                      text-lg
                      font-extrabold
                    "
                  >
                    Règle financière
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-white/65
                    "
                  >
                    Seul un paiement dont
                    le statut serveur est
                    réellement{" "}
                    <strong
                      className="
                        text-white
                      "
                    >
                      paid
                    </strong>{" "}
                    est inclus dans les
                    montants collectés.
                  </p>
                </article>
              </aside>
            </section>
          </>
        )}

        {/*
         * ==============================================================
         * PIED ADMIN
         * ==============================================================
         */}

        <footer
          className="
            mt-8
            flex
            flex-col
            gap-3
            border-t
            border-[var(--yc-border)]
            py-6
            text-xs
            text-[var(--yc-text-muted)]
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            Young Caring —
            Administration interne
          </p>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <ShieldCheck
              aria-hidden="true"
              className="
                h-4
                w-4
              "
            />

            Données privées —
            accès administrateur uniquement
          </div>
        </footer>
      </div>
    </main>
  );
}