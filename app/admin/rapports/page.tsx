import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartHandshake,
  LogOut,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  DonationAllocation,
  DonationCurrency,
  DonationFrequency,
  DonationPaymentProvider,
  DonationPaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

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
 * ADMIN — RAPPORTS DES DONS
 * ============================================================================
 *
 * Cette page :
 *
 * - est entièrement rendue côté serveur ;
 * - exige une session administrateur valide ;
 * - lit directement les données PostgreSQL via Prisma ;
 * - utilise paidAt pour les chiffres financiers ;
 * - ne mélange jamais XOF, EUR et USD ;
 * - permet de filtrer par période, devise, destination et prestataire ;
 * - n'autorise aucune modification de paiement ;
 * - prépare proprement la future couche d'export PDF / CSV / Excel.
 *
 * Important :
 * seul le statut `paid` représente un don confirmé.
 * ============================================================================
 */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export const metadata:
  Metadata = {
  title:
    "Rapports | Administration Young Caring",

  description:
    "Rapports financiers et statistiques des dons Young Caring.",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const CURRENCIES:
  readonly DonationCurrency[] = [
  DonationCurrency.XOF,
  DonationCurrency.EUR,
  DonationCurrency.USD,
];

const ALLOCATIONS:
  readonly DonationAllocation[] =
  Object.values(
    DonationAllocation
  );

const PROVIDERS:
  readonly DonationPaymentProvider[] =
  Object.values(
    DonationPaymentProvider
  );

const STATUSES:
  readonly DonationPaymentStatus[] =
  Object.values(
    DonationPaymentStatus
  );

const FREQUENCIES:
  readonly DonationFrequency[] =
  Object.values(
    DonationFrequency
  );

type SearchParams =
  Record<
    string,
    string |
      string[] |
      undefined
  >;

type PageProps =
  Readonly<{
    searchParams?: Promise<
      SearchParams
    >;
  }>;

type ReportFilters =
  Readonly<{
    from: string;

    to: string;

    currency:
      DonationCurrency |
      null;

    allocation:
      DonationAllocation |
      null;

    provider:
      DonationPaymentProvider |
      null;
  }>;

type CurrencyStats =
  Readonly<{
    currency:
      DonationCurrency;

    count: number;

    amount: number;

    average: number;
  }>;

type StatusStats =
  Readonly<{
    status:
      DonationPaymentStatus;

    count: number;
  }>;

type AllocationStats =
  Readonly<{
    allocation:
      DonationAllocation;

    currency:
      DonationCurrency;

    count: number;

    amount: number;
  }>;

type ProviderStats =
  Readonly<{
    provider:
      DonationPaymentProvider;

    count: number;
  }>;

type FrequencyStats =
  Readonly<{
    frequency:
      DonationFrequency;

    count: number;
  }>;

type ReportData =
  Readonly<{
    currencyStats:
      readonly CurrencyStats[];

    statusStats:
      readonly StatusStats[];

    allocationStats:
      readonly AllocationStats[];

    providerStats:
      readonly ProviderStats[];

    frequencyStats:
      readonly FrequencyStats[];

    confirmedDonations:
      number;

    uniqueDonors:
      number;

    transactionCount:
      number;

    receiptsReady:
      number;

    receiptsMissing:
      number;
  }>;

type ReportResult =
  | Readonly<{
      success: true;

      data:
        ReportData;
    }>
  | Readonly<{
      success: false;
    }>;

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

const PROVIDER_LABELS:
  Record<
    DonationPaymentProvider,
    string
  > = {
  moneroo:
    "Moneroo",

  fedapay:
    "FedaPay",

  kkiapay:
    "KKiaPay",

  paydunya:
    "PayDunya",

  stripe:
    "Stripe",
};

const STATUS_LABELS:
  Record<
    DonationPaymentStatus,
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

const FREQUENCY_LABELS:
  Record<
    DonationFrequency,
    string
  > = {
  once:
    "Ponctuel",

  monthly:
    "Mensuel déclaré",
};

/**
 * ============================================================================
 * PARAMÈTRES URL
 * ============================================================================
 */

function readFirst(
  value:
    | string
    | string[]
    | undefined
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    Array.isArray(value) &&
    typeof value[0] ===
      "string"
  ) {
    return value[0];
  }

  return "";
}

function readEnumValue<
  T extends string
>(
  value: string,
  allowed:
    readonly T[]
): T | null {
  return allowed.includes(
    value as T
  )
    ? value as T
    : null;
}

function isIsoDate(
  value: string
): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  );
}

/**
 * ============================================================================
 * DATES BÉNIN
 * ============================================================================
 *
 * Le Bénin utilise UTC+1
 * sans changement saisonnier.
 */

function beninDayStart(
  value: string
): Date | null {
  if (
    !isIsoDate(value)
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  const result =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        0,
        0,
        0,
        0
      ) -
        60 *
          60 *
          1_000
    );

  const localCheck =
    new Date(
      result.getTime() +
        60 *
          60 *
          1_000
    );

  if (
    localCheck
      .getUTCFullYear() !==
      year ||
    localCheck
      .getUTCMonth() !==
      month - 1 ||
    localCheck
      .getUTCDate() !==
      day
  ) {
    return null;
  }

  return result;
}

function beninNextDayStart(
  value: string
): Date | null {
  const start =
    beninDayStart(
      value
    );

  if (!start) {
    return null;
  }

  return new Date(
    start.getTime() +
      24 *
        60 *
        60 *
        1_000
  );
}

function normalizeFilters(
  params:
    SearchParams
): ReportFilters {
  let from =
    readFirst(
      params.from
    ).trim();

  let to =
    readFirst(
      params.to
    ).trim();

  if (
    !isIsoDate(
      from
    )
  ) {
    from = "";
  }

  if (
    !isIsoDate(
      to
    )
  ) {
    to = "";
  }

  /**
   * Si l'administrateur inverse
   * accidentellement les dates,
   * nous les remettons dans l'ordre.
   */
  if (
    from &&
    to &&
    from > to
  ) {
    const oldFrom =
      from;

    from =
      to;

    to =
      oldFrom;
  }

  return {
    from,

    to,

    currency:
      readEnumValue(
        readFirst(
          params.currency
        ),
        CURRENCIES
      ),

    allocation:
      readEnumValue(
        readFirst(
          params.allocation
        ),
        ALLOCATIONS
      ),

    provider:
      readEnumValue(
        readFirst(
          params.provider
        ),
        PROVIDERS
      ),
  };
}

/**
 * ============================================================================
 * FILTRES PRISMA
 * ============================================================================
 */

function buildDateFilter(
  field:
    "createdAt" |
    "paidAt",

  filters:
    ReportFilters
):
  Prisma.DonationPaymentWhereInput {
  const from =
    filters.from
      ? beninDayStart(
          filters.from
        )
      : null;

  const toExclusive =
    filters.to
      ? beninNextDayStart(
          filters.to
        )
      : null;

  if (
    !from &&
    !toExclusive
  ) {
    return {};
  }

  const range = {
    ...(from
      ? {
          gte:
            from,
        }
      : {}),

    ...(toExclusive
      ? {
          lt:
            toExclusive,
        }
      : {}),
  };

  if (
    field ===
    "paidAt"
  ) {
    return {
      paidAt:
        range,
    };
  }

  return {
    createdAt:
      range,
  };
}

function buildCommonFilter(
  filters:
    ReportFilters
):
  Prisma.DonationPaymentWhereInput {
  return {
    ...(filters.currency
      ? {
          currency:
            filters.currency,
        }
      : {}),

    ...(filters.allocation
      ? {
          allocation:
            filters.allocation,
        }
      : {}),

    ...(filters.provider
      ? {
          provider:
            filters.provider,
        }
      : {}),
  };
}

/**
 * Toutes les transactions créées
 * dans la période.
 */
function buildTransactionWhere(
  filters:
    ReportFilters
):
  Prisma.DonationPaymentWhereInput {
  return {
    ...buildCommonFilter(
      filters
    ),

    ...buildDateFilter(
      "createdAt",
      filters
    ),
  };
}

/**
 * Uniquement les dons réellement
 * confirmés et payés dans la période.
 */
function buildPaidWhere(
  filters:
    ReportFilters
):
  Prisma.DonationPaymentWhereInput {
  return {
    ...buildCommonFilter(
      filters
    ),

    status:
      DonationPaymentStatus
        .paid,

    ...buildDateFilter(
      "paidAt",
      filters
    ),
  };
}

/**
 * ============================================================================
 * FORMATAGE
 * ============================================================================
 */

function formatAmount(
  amount: number,

  currency:
    DonationCurrency
): string {
  if (
    currency ===
    DonationCurrency.XOF
  ) {
    return (
      `${new Intl.NumberFormat(
        "fr-FR",
        {
          maximumFractionDigits:
            0,
        }
      ).format(
        amount
      )} FCFA`
    );
  }

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style:
        "currency",

      currency,

      maximumFractionDigits:
        2,
    }
  ).format(
    amount
  );
}

function formatNumber(
  value: number
): string {
  return new Intl.NumberFormat(
    "fr-FR"
  ).format(
    value
  );
}

function getPeriodLabel(
  filters:
    ReportFilters
): string {
  if (
    filters.from &&
    filters.to
  ) {
    return (
      `Du ${filters.from} ` +
      `au ${filters.to}`
    );
  }

  if (
    filters.from
  ) {
    return (
      `Depuis le ${filters.from}`
    );
  }

  if (
    filters.to
  ) {
    return (
      `Jusqu'au ${filters.to}`
    );
  }

  return (
    "Toutes les périodes"
  );
}

function hasActiveFilters(
  filters:
    ReportFilters
): boolean {
  return Boolean(
    filters.from ||
      filters.to ||
      filters.currency ||
      filters.allocation ||
      filters.provider
  );
}

/**
 * ============================================================================
 * LECTURE DU RAPPORT
 * ============================================================================
 */

async function loadReportData(
  filters:
    ReportFilters
):
  Promise<ReportResult> {
  const transactionWhere =
    buildTransactionWhere(
      filters
    );

  const paidWhere =
    buildPaidWhere(
      filters
    );

  try {
    const [
      currencyRows,
      statusRows,
      allocationRows,
      providerRows,
      frequencyRows,
      uniqueDonorRows,
      transactionCount,
      receiptsReady,
      receiptsMissing,
    ] =
      await Promise.all([
        /**
         * Montants réellement encaissés
         * séparés par devise.
         */
        db.donationPayment
          .groupBy({
            by: [
              "currency",
            ],

            where:
              paidWhere,

            _count: {
              _all:
                true,
            },

            _sum: {
              amount:
                true,
            },

            _avg: {
              amount:
                true,
            },
          }),

        /**
         * Statuts des transactions.
         */
        db.donationPayment
          .groupBy({
            by: [
              "status",
            ],

            where:
              transactionWhere,

            _count: {
              _all:
                true,
            },
          }),

        /**
         * Destination des dons.
         *
         * La devise est incluse
         * pour ne jamais mélanger
         * XOF, EUR et USD.
         */
        db.donationPayment
          .groupBy({
            by: [
              "allocation",
              "currency",
            ],

            where:
              paidWhere,

            _count: {
              _all:
                true,
            },

            _sum: {
              amount:
                true,
            },
          }),

        /**
         * Prestataires utilisés
         * pour les paiements confirmés.
         */
        db.donationPayment
          .groupBy({
            by: [
              "provider",
            ],

            where:
              paidWhere,

            _count: {
              _all:
                true,
            },
          }),

        /**
         * Fréquence déclarée
         * dans le formulaire.
         */
        db.donationPayment
          .groupBy({
            by: [
              "frequency",
            ],

            where:
              paidWhere,

            _count: {
              _all:
                true,
            },
          }),

        /**
         * Donateurs uniques.
         */
        db.donationPayment
          .groupBy({
            by: [
              "donorEmail",
            ],

            where:
              paidWhere,
          }),

        /**
         * Nombre total de transactions
         * créées dans le rapport.
         */
        db.donationPayment
          .count({
            where:
              transactionWhere,
          }),

        /**
         * Reçus PDF déjà prêts.
         */
        db.donationReceipt
          .count({
            where: {
              status:
                "ready",

              payment:
                paidWhere,
            },
          }),

        /**
         * Dons payés qui n'ont
         * encore aucun reçu associé.
         */
        db.donationPayment
          .count({
            where: {
              ...paidWhere,

              receipt:
                null,
            },
          }),
      ]);

    const currencyStats:
      CurrencyStats[] =
      currencyRows.map(
        (
          row
        ) => ({
          currency:
            row.currency,

          count:
            row
              ._count
              ._all,

          amount:
            row
              ._sum
              .amount ??
            0,

          average:
            Math.round(
              row
                ._avg
                .amount ??
                0
            ),
        })
      );

    const statusStats:
      StatusStats[] =
      statusRows.map(
        (
          row
        ) => ({
          status:
            row.status,

          count:
            row
              ._count
              ._all,
        })
      );

    const allocationStats:
      AllocationStats[] =
      allocationRows.map(
        (
          row
        ) => ({
          allocation:
            row.allocation,

          currency:
            row.currency,

          count:
            row
              ._count
              ._all,

          amount:
            row
              ._sum
              .amount ??
            0,
        })
      );

    const providerStats:
      ProviderStats[] =
      providerRows.map(
        (
          row
        ) => ({
          provider:
            row.provider,

          count:
            row
              ._count
              ._all,
        })
      );

    const frequencyStats:
      FrequencyStats[] =
      frequencyRows.map(
        (
          row
        ) => ({
          frequency:
            row.frequency,

          count:
            row
              ._count
              ._all,
        })
      );

    const confirmedDonations =
      currencyStats.reduce(
        (
          total,
          item
        ) =>
          total +
          item.count,

        0
      );

    return {
      success:
        true,

      data: {
        currencyStats,

        statusStats,

        allocationStats,

        providerStats,

        frequencyStats,

        confirmedDonations,

        uniqueDonors:
          uniqueDonorRows
            .length,

        transactionCount,

        receiptsReady,

        receiptsMissing,
      },
    };
  } catch (
    error: unknown
  ) {
    /**
     * Ne jamais écrire :
     *
     * - DATABASE_URL ;
     * - données privées ;
     * - secrets ;
     * - informations bancaires.
     */
    console.error(
      "Admin reports loading failed:",
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
 * PAGE
 * ============================================================================
 */

export default async function AdminReportsPage({
  searchParams,
}: PageProps) {
  /**
   * La session est contrôlée
   * AVANT toute lecture financière.
   */
  const session =
    await requireAdmin();

  const params =
    searchParams
      ? await searchParams
      : {};

  const filters =
    normalizeFilters(
      params
    );

  const report =
    await loadReportData(
      filters
    );

  const paidCount =
    report.success
      ? (
          report
            .data
            .statusStats
            .find(
              (
                item
              ) =>
                item.status ===
                DonationPaymentStatus
                  .paid
            )
            ?.count ??
          0
        )
      : 0;

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
            <Link
              href="/admin"
              aria-label="Retour au tableau de bord"
              className="
                inline-flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[var(--yc-border)]
                bg-white
                transition
                hover:border-[var(--yc-turquoise)]
                hover:text-[var(--yc-turquoise-dark)]
              "
            >
              <ArrowLeft
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />
            </Link>

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
                Administration · Rapports
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
            <div
              className="
                hidden
                max-w-[240px]
                truncate
                text-xs
                font-semibold
                text-[var(--yc-text-muted)]
                md:block
              "
            >
              {session.email}
            </div>

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
                  rounded-xl
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
          lg:px-8
        "
      >
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
              <BarChart3
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />

              Analyse des dons
            </div>

            <h1
              className="
                text-3xl
                font-extrabold
                tracking-tight
                sm:text-4xl
              "
            >
              Rapports
            </h1>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-[var(--yc-text-muted)]
                sm:text-base
              "
            >
              Consultez les chiffres réels
              des dons confirmés, les
              répartitions et les indicateurs
              utiles à la transparence
              financière de Young Caring.
            </p>
          </div>

          <Link
            href="/admin/dons"
            className="
              inline-flex
              h-11
              items-center
              justify-center
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
            <ReceiptText
              aria-hidden="true"
              className="
                h-4
                w-4
              "
            />

            Voir les dons
          </Link>
        </section>

        {/*
         * ==============================================================
         * FILTRES
         * ==============================================================
         */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-[var(--yc-border)]
            bg-white
            p-4
            shadow-sm
            sm:p-5
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              gap-2
            "
          >
            <Filter
              aria-hidden="true"
              className="
                h-4
                w-4
                text-[var(--yc-turquoise-dark)]
              "
            />

            <h2
              className="
                font-extrabold
              "
            >
              Période et filtres
            </h2>
          </div>

          <form
            method="get"
            action="/admin/rapports"
            className="
              grid
              gap-3
              md:grid-cols-2
              xl:grid-cols-5
            "
          >
            <DateField
              id="from"
              name="from"
              label="Du"
              value={
                filters.from
              }
            />

            <DateField
              id="to"
              name="to"
              label="Au"
              value={
                filters.to
              }
            />

            <SelectField
              id="currency"
              name="currency"
              label="Devise"
              value={
                filters.currency ??
                ""
              }
              options={
                CURRENCIES.map(
                  (
                    currency
                  ) => ({
                    value:
                      currency,

                    label:
                      currency,
                  })
                )
              }
            />

            <SelectField
              id="allocation"
              name="allocation"
              label="Destination"
              value={
                filters.allocation ??
                ""
              }
              options={
                ALLOCATIONS.map(
                  (
                    allocation
                  ) => ({
                    value:
                      allocation,

                    label:
                      ALLOCATION_LABELS[
                        allocation
                      ],
                  })
                )
              }
            />

            <SelectField
              id="provider"
              name="provider"
              label="Prestataire"
              value={
                filters.provider ??
                ""
              }
              options={
                PROVIDERS.map(
                  (
                    provider
                  ) => ({
                    value:
                      provider,

                    label:
                      PROVIDER_LABELS[
                        provider
                      ],
                  })
                )
              }
            />

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
                md:col-span-2
                xl:col-span-5
              "
            >
              <button
                type="submit"
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[var(--yc-turquoise)]
                  px-5
                  text-sm
                  font-extrabold
                  text-white
                  transition
                  hover:bg-[var(--yc-turquoise-dark)]
                "
              >
                <BarChart3
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                  "
                />

                Générer le rapport
              </button>

              {hasActiveFilters(
                filters
              ) ? (
                <Link
                  href="/admin/rapports"
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[var(--yc-border)]
                    bg-white
                    px-4
                    text-sm
                    font-bold
                    transition
                    hover:border-slate-400
                  "
                >
                  <RotateCcw
                    aria-hidden="true"
                    className="
                      h-4
                      w-4
                    "
                  />

                  Réinitialiser
                </Link>
              ) : null}

              <div
                className="
                  ml-0
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[var(--yc-surface)]
                  px-3
                  py-2.5
                  text-xs
                  font-semibold
                  text-[var(--yc-text-muted)]
                  xl:ml-auto
                "
              >
                <CalendarDays
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                  "
                />

                {getPeriodLabel(
                  filters
                )}
              </div>
            </div>
          </form>
        </section>

        {/*
         * ==============================================================
         * ERREUR
         * ==============================================================
         */}

        {!report.success ? (
          <section
            role="alert"
            className="
              mt-6
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-6
            "
          >
            <h2
              className="
                font-extrabold
                text-red-900
              "
            >
              Rapport indisponible
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-red-700
              "
            >
              Les données n&apos;ont pas
              pu être lues depuis la base.
              Aucun montant ou indicateur
              n&apos;a été inventé.
            </p>
          </section>
        ) : (
          <>
            {/*
             * ==========================================================
             * INDICATEURS
             * ==========================================================
             */}

            <section
              aria-label="Indicateurs du rapport"
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              <MetricCard
                icon={
                  <CheckCircle2
                    aria-hidden="true"
                    className="
                      h-5
                      w-5
                    "
                  />
                }
                label="Dons confirmés"
                value={
                  formatNumber(
                    report
                      .data
                      .confirmedDonations
                  )
                }
                description="
                  Paiements dont le statut
                  serveur est paid.
                "
              />

              <MetricCard
                icon={
                  <Users
                    aria-hidden="true"
                    className="
                      h-5
                      w-5
                    "
                  />
                }
                label="Donateurs uniques"
                value={
                  formatNumber(
                    report
                      .data
                      .uniqueDonors
                  )
                }
                description="
                  Adresses e-mail uniques
                  avec au moins un don confirmé.
                "
              />

              <MetricCard
                icon={
                  <CircleDollarSign
                    aria-hidden="true"
                    className="
                      h-5
                      w-5
                    "
                  />
                }
                label="Transactions créées"
                value={
                  formatNumber(
                    report
                      .data
                      .transactionCount
                  )
                }
                description="
                  Toutes les transactions
                  enregistrées dans la période.
                "
              />

              <MetricCard
                icon={
                  <ReceiptText
                    aria-hidden="true"
                    className="
                      h-5
                      w-5
                    "
                  />
                }
                label="Reçus PDF prêts"
                value={
                  formatNumber(
                    report
                      .data
                      .receiptsReady
                  )
                }
                description={
                  report
                    .data
                    .receiptsMissing >
                  0
                    ? `${formatNumber(
                        report
                          .data
                          .receiptsMissing
                      )} don(s) payé(s) sans reçu associé.`
                    : "Tous les dons payés disposent d'un enregistrement de reçu."
                }
              />
            </section>

            {/*
             * ==========================================================
             * MONTANTS PAR DEVISE
             * ==========================================================
             */}

            <section
              className="
                mt-6
                rounded-2xl
                border
                border-[var(--yc-border)]
                bg-white
                p-5
                shadow-sm
                sm:p-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <h2
                    className="
                      text-lg
                      font-extrabold
                    "
                  >
                    Montants collectés
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[var(--yc-text-muted)]
                    "
                  >
                    Les devises restent
                    séparées pour éviter
                    toute somme financière
                    incorrecte.
                  </p>
                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    bg-emerald-50
                    px-3
                    py-1.5
                    text-xs
                    font-extrabold
                    text-emerald-700
                  "
                >
                  <ShieldCheck
                    aria-hidden="true"
                    className="
                      h-4
                      w-4
                    "
                  />

                  Paiements confirmés uniquement
                </span>
              </div>

              {report
                .data
                .currencyStats
                .length ===
              0 ? (
                <EmptyState
                  text="
                    Aucun don confirmé
                    ne correspond à ces filtres.
                  "
                />
              ) : (
                <div
                  className="
                    mt-5
                    grid
                    gap-4
                    md:grid-cols-3
                  "
                >
                  {report
                    .data
                    .currencyStats
                    .map(
                      (
                        item
                      ) => (
                        <article
                          key={
                            item.currency
                          }
                          className="
                            rounded-2xl
                            border
                            border-[var(--yc-border)]
                            bg-[var(--yc-surface)]
                            p-5
                          "
                        >
                          <p
                            className="
                              text-xs
                              font-extrabold
                              uppercase
                              tracking-wider
                              text-[var(--yc-text-muted)]
                            "
                          >
                            {
                              item.currency
                            }
                          </p>

                          <p
                            className="
                              mt-2
                              text-2xl
                              font-extrabold
                              tracking-tight
                            "
                          >
                            {formatAmount(
                              item.amount,
                              item.currency
                            )}
                          </p>

                          <div
                            className="
                              mt-4
                              grid
                              grid-cols-2
                              gap-3
                              text-sm
                            "
                          >
                            <div>
                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  text-[var(--yc-text-muted)]
                                "
                              >
                                Dons
                              </p>

                              <p
                                className="
                                  mt-1
                                  font-extrabold
                                "
                              >
                                {formatNumber(
                                  item.count
                                )}
                              </p>
                            </div>

                            <div>
                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  text-[var(--yc-text-muted)]
                                "
                              >
                                Don moyen
                              </p>

                              <p
                                className="
                                  mt-1
                                  font-extrabold
                                "
                              >
                                {formatAmount(
                                  item.average,
                                  item.currency
                                )}
                              </p>
                            </div>
                          </div>
                        </article>
                      )
                    )}
                </div>
              )}
            </section>

            {/*
             * ==========================================================
             * DESTINATION + STATUTS
             * ==========================================================
             */}

            <section
              className="
                mt-6
                grid
                gap-6
                xl:grid-cols-2
              "
            >
              <ReportPanel
                title="Répartition par destination"
                description="
                  Montants et nombre de
                  dons confirmés pour chaque
                  domaine soutenu.
                "
              >
                {report
                  .data
                  .allocationStats
                  .length ===
                0 ? (
                  <EmptyState
                    text="
                      Aucune destination
                      à afficher.
                    "
                  />
                ) : (
                  <div
                    className="
                      space-y-3
                    "
                  >
                    {report
                      .data
                      .allocationStats
                      .map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              `${item.allocation}-${item.currency}`
                            }
                            className="
                              flex
                              flex-col
                              gap-2
                              rounded-xl
                              border
                              border-[var(--yc-border)]
                              px-4
                              py-3
                              sm:flex-row
                              sm:items-center
                              sm:justify-between
                            "
                          >
                            <div>
                              <p
                                className="
                                  text-sm
                                  font-extrabold
                                "
                              >
                                {
                                  ALLOCATION_LABELS[
                                    item.allocation
                                  ]
                                }
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-xs
                                  text-[var(--yc-text-muted)]
                                "
                              >
                                {formatNumber(
                                  item.count
                                )}{" "}
                                don(s)
                                {" · "}
                                {
                                  item.currency
                                }
                              </p>
                            </div>

                            <strong
                              className="
                                text-sm
                                sm:text-right
                              "
                            >
                              {formatAmount(
                                item.amount,
                                item.currency
                              )}
                            </strong>
                          </div>
                        )
                      )}
                  </div>
                )}
              </ReportPanel>

              <ReportPanel
                title="État des transactions"
                description="
                  Statuts des transactions
                  créées pendant la période
                  sélectionnée.
                "
              >
                <div
                  className="
                    space-y-3
                  "
                >
                  {STATUSES.map(
                    (
                      status
                    ) => {
                      const count =
                        report
                          .data
                          .statusStats
                          .find(
                            (
                              item
                            ) =>
                              item.status ===
                              status
                          )
                          ?.count ??
                        0;

                      const percentage =
                        report
                          .data
                          .transactionCount >
                        0
                          ? Math.round(
                              (
                                count /
                                report
                                  .data
                                  .transactionCount
                              ) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={
                            status
                          }
                          className="
                            rounded-xl
                            border
                            border-[var(--yc-border)]
                            px-4
                            py-3
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-4
                            "
                          >
                            <span
                              className="
                                text-sm
                                font-bold
                              "
                            >
                              {
                                STATUS_LABELS[
                                  status
                                ]
                              }
                            </span>

                            <span
                              className="
                                text-sm
                                font-extrabold
                              "
                            >
                              {formatNumber(
                                count
                              )}
                            </span>
                          </div>

                          <div
                            className="
                              mt-2
                              h-2
                              overflow-hidden
                              rounded-full
                              bg-slate-100
                            "
                          >
                            <div
                              className="
                                h-full
                                rounded-full
                                bg-[var(--yc-turquoise)]
                              "
                              style={{
                                width:
                                  `${percentage}%`,
                              }}
                            />
                          </div>

                          <p
                            className="
                              mt-1.5
                              text-right
                              text-[11px]
                              font-semibold
                              text-[var(--yc-text-muted)]
                            "
                          >
                            {
                              percentage
                            }%
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </ReportPanel>
            </section>

            {/*
             * ==========================================================
             * PRESTATAIRES + FRÉQUENCE
             * ==========================================================
             */}

            <section
              className="
                mt-6
                grid
                gap-6
                xl:grid-cols-2
              "
            >
              <ReportPanel
                title="Prestataires"
                description="
                  Origine des paiements
                  confirmés du rapport.
                "
              >
                {report
                  .data
                  .providerStats
                  .length ===
                0 ? (
                  <EmptyState
                    text="
                      Aucun prestataire
                      à afficher.
                    "
                  />
                ) : (
                  <SimpleCountList
                    rows={
                      report
                        .data
                        .providerStats
                        .map(
                          (
                            item
                          ) => ({
                            key:
                              item.provider,

                            label:
                              PROVIDER_LABELS[
                                item.provider
                              ],

                            count:
                              item.count,
                          })
                        )
                    }
                  />
                )}
              </ReportPanel>

              <ReportPanel
                title="Fréquence déclarée"
                description="
                  Information enregistrée
                  dans le formulaire du donateur.
                "
              >
                {report
                  .data
                  .frequencyStats
                  .length ===
                0 ? (
                  <EmptyState
                    text="
                      Aucune fréquence
                      à afficher.
                    "
                  />
                ) : (
                  <SimpleCountList
                    rows={
                      FREQUENCIES.map(
                        (
                          frequency
                        ) => ({
                          key:
                            frequency,

                          label:
                            FREQUENCY_LABELS[
                              frequency
                            ],

                          count:
                            report
                              .data
                              .frequencyStats
                              .find(
                                (
                                  item
                                ) =>
                                  item.frequency ===
                                  frequency
                              )
                              ?.count ??
                            0,
                        })
                      )
                    }
                  />
                )}
              </ReportPanel>
            </section>

            {/*
             * ==========================================================
             * EXPORTS
             * ==========================================================
             */}

            <section
              className="
                mt-6
                rounded-2xl
                border
                border-[var(--yc-border)]
                bg-white
                p-5
                shadow-sm
                sm:p-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-5
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                <div>
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Download
                      aria-hidden="true"
                      className="
                        h-5
                        w-5
                        text-[var(--yc-turquoise-dark)]
                      "
                    />

                    <h2
                      className="
                        text-lg
                        font-extrabold
                      "
                    >
                      Exporter le rapport
                    </h2>
                  </div>

                  <p
                    className="
                      mt-2
                      max-w-2xl
                      text-sm
                      leading-6
                      text-[var(--yc-text-muted)]
                    "
                  >
                    Les exports utiliseront
                    exactement les filtres et
                    les données du rapport
                    affiché. Les routes
                    d&apos;export seront ajoutées
                    séparément afin de garder
                    cette page simple et sûre.
                  </p>
                </div>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  <DisabledExportButton
                    icon={
                      <FileText
                        aria-hidden="true"
                        className="
                          h-4
                          w-4
                        "
                      />
                    }
                    label="PDF"
                  />

                  <DisabledExportButton
                    icon={
                      <FileSpreadsheet
                        aria-hidden="true"
                        className="
                          h-4
                          w-4
                        "
                      />
                    }
                    label="CSV"
                  />

                  <DisabledExportButton
                    icon={
                      <FileSpreadsheet
                        aria-hidden="true"
                        className="
                          h-4
                          w-4
                        "
                      />
                    }
                    label="Excel"
                  />
                </div>
              </div>
            </section>

            {/*
             * ==========================================================
             * RÈGLE FINANCIÈRE
             * ==========================================================
             */}

            <section
              className="
                mt-6
                rounded-2xl
                bg-[var(--yc-dark)]
                p-5
                text-white
                sm:p-6
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="
                    mt-0.5
                    h-5
                    w-5
                    shrink-0
                    text-[var(--yc-orange)]
                  "
                />

                <div>
                  <h2
                    className="
                      font-extrabold
                    "
                  >
                    Règle de lecture financière
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-4xl
                      text-sm
                      leading-6
                      text-white/65
                    "
                  >
                    Les montants de ce rapport
                    proviennent uniquement des
                    paiements dont le statut
                    actuel est{" "}
                    <strong
                      className="
                        text-white
                      "
                    >
                      paid
                    </strong>
                    . Les remboursements,
                    échecs, annulations et
                    paiements en attente ne
                    sont pas ajoutés aux
                    montants collectés. Les
                    devises ne sont jamais
                    additionnées entre elles.
                  </p>

                  <p
                    className="
                      mt-3
                      text-xs
                      font-semibold
                      text-white/50
                    "
                  >
                    Transactions payées visibles
                    dans la répartition des
                    statuts :{" "}
                    {formatNumber(
                      paidCount
                    )}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/**
 * ============================================================================
 * COMPOSANTS INTERNES
 * ============================================================================
 */

function DateField({
  id,
  name,
  label,
  value,
}: Readonly<{
  id: string;

  name: string;

  label: string;

  value: string;
}>) {
  return (
    <div>
      <label
        htmlFor={
          id
        }
        className="
          mb-1.5
          block
          text-xs
          font-bold
          text-[var(--yc-text-muted)]
        "
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type="date"
        defaultValue={
          value
        }
        className="
          h-11
          w-full
          rounded-xl
          border
          border-[var(--yc-border)]
          bg-white
          px-3
          text-sm
          outline-none
          transition
          focus:border-[var(--yc-turquoise)]
          focus:ring-4
          focus:ring-[var(--yc-turquoise)]/10
        "
      />
    </div>
  );
}

function SelectField({
  id,
  name,
  label,
  value,
  options,
}: Readonly<{
  id: string;

  name: string;

  label: string;

  value: string;

  options:
    readonly Readonly<{
      value: string;

      label: string;
    }>[];
}>) {
  return (
    <div>
      <label
        htmlFor={
          id
        }
        className="
          mb-1.5
          block
          text-xs
          font-bold
          text-[var(--yc-text-muted)]
        "
      >
        {label}
      </label>

      <select
        id={id}
        name={name}
        defaultValue={
          value
        }
        className="
          h-11
          w-full
          rounded-xl
          border
          border-[var(--yc-border)]
          bg-white
          px-3
          text-sm
          outline-none
          transition
          focus:border-[var(--yc-turquoise)]
          focus:ring-4
          focus:ring-[var(--yc-turquoise)]/10
        "
      >
        <option
          value=""
        >
          Tous
        </option>

        {options.map(
          (
            option
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: Readonly<{
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;

  description:
    string;
}>) {
  return (
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
            {label}
          </p>

          <p
            className="
              mt-3
              text-3xl
              font-extrabold
              tracking-tight
            "
          >
            {value}
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
            bg-[var(--yc-turquoise-light)]
            text-[var(--yc-turquoise-dark)]
          "
        >
          {icon}
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
        {description}
      </p>
    </article>
  );
}

function ReportPanel({
  title,
  description,
  children,
}: Readonly<{
  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}>) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-[var(--yc-border)]
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <h2
        className="
          text-lg
          font-extrabold
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-1
          text-sm
          leading-6
          text-[var(--yc-text-muted)]
        "
      >
        {description}
      </p>

      <div
        className="
          mt-5
        "
      >
        {children}
      </div>
    </article>
  );
}

function SimpleCountList({
  rows,
}: Readonly<{
  rows:
    readonly Readonly<{
      key:
        string;

      label:
        string;

      count:
        number;
    }>[];
}>) {
  return (
    <div
      className="
        space-y-3
      "
    >
      {rows.map(
        (
          row
        ) => (
          <div
            key={
              row.key
            }
            className="
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-[var(--yc-border)]
              px-4
              py-3
            "
          >
            <span
              className="
                text-sm
                font-bold
              "
            >
              {
                row.label
              }
            </span>

            <strong>
              {formatNumber(
                row.count
              )}
            </strong>
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({
  text,
}: Readonly<{
  text:
    string;
}>) {
  return (
    <div
      className="
        rounded-xl
        border
        border-dashed
        border-[var(--yc-border)]
        bg-[var(--yc-surface)]
        px-4
        py-8
        text-center
      "
    >
      <HeartHandshake
        aria-hidden="true"
        className="
          mx-auto
          h-6
          w-6
          text-[var(--yc-text-muted)]
        "
      />

      <p
        className="
          mt-3
          text-sm
          font-semibold
          text-[var(--yc-text-muted)]
        "
      >
        {text}
      </p>
    </div>
  );
}

function DisabledExportButton({
  icon,
  label,
}: Readonly<{
  icon:
    React.ReactNode;

  label:
    string;
}>) {
  return (
    <button
      type="button"
      disabled
      title="L'export sera activé avec la route serveur dédiée."
      className="
        inline-flex
        h-10
        cursor-not-allowed
        items-center
        gap-2
        rounded-xl
        border
        border-[var(--yc-border)]
        bg-slate-50
        px-4
        text-sm
        font-bold
        text-slate-400
      "
    >
      {icon}

      {label}
    </button>
  );
}