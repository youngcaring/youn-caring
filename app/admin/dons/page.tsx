import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Filter,
  LogOut,
  Mail,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  DonationAllocation,
  DonationCurrency,
  DonationPaymentProvider,
  DonationPaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

import {
  logoutAdmin,
  requireAdmin,
} from "@/lib/admin-auth";

import { db } from "@/lib/db";

/**
 * ============================================================================
 * YOUNG CARING
 * ADMIN â€” LISTE DES DONS
 * ============================================================================
 *
 * - page 100 % serveur ;
 * - session administrateur obligatoire ;
 * - lecture directe de DonationPayment ;
 * - recherche et filtres exÃ©cutÃ©s cÃ´tÃ© PostgreSQL ;
 * - pagination cÃ´tÃ© serveur ;
 * - aucune donnÃ©e financiÃ¨re n'est recalculÃ©e depuis le navigateur ;
 * - aucune modification de statut depuis cette page.
 * ============================================================================
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dons | Administration Young Caring",

  description:
    "Consultation sÃ©curisÃ©e des dons Young Caring.",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const PAGE_SIZE = 20;

const MAX_SEARCH_LENGTH = 120;

const STATUS_VALUES:
  readonly DonationStatus[] =
  Object.values(
    DonationPaymentStatus
  );

const CURRENCY_VALUES:
  readonly DonationCurrencyValue[] =
  Object.values(
    DonationCurrency
  );

const ALLOCATION_VALUES:
  readonly DonationAllocationValue[] =
  Object.values(
    DonationAllocation
  );

const PROVIDER_VALUES:
  readonly DonationProvider[] =
  Object.values(
    DonationPaymentProvider
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

type DonationStatus = DonationPaymentStatus;

type DonationCurrencyValue = DonationCurrency;

type DonationAllocationValue = DonationAllocation;

type DonationProvider = DonationPaymentProvider;

type Filters =
  Readonly<{
    q: string;

    status:
      DonationStatus |
      null;

    currency:
      DonationCurrencyValue |
      null;

    allocation:
      DonationAllocationValue |
      null;

    provider:
      DonationProvider |
      null;

    from: string;

    to: string;

    requestedPage: number;
  }>;

const STATUS_LABELS:
  Record<
    DonationStatus,
    string
  > = {
  pending:
    "En attente",

  processing:
    "En traitement",

  paid:
    "PayÃ©",

  failed:
    "Ã‰chouÃ©",

  cancelled:
    "AnnulÃ©",

  expired:
    "ExpirÃ©",

  refunded:
    "RemboursÃ©",
};

const STATUS_CLASSES:
  Record<
    DonationStatus,
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

const ALLOCATION_LABELS:
  Record<
    DonationAllocationValue,
    string
  > = {
  priority:
    "Besoins prioritaires",

  education:
    "Ã‰ducation",

  foodSupport:
    "Aide alimentaire",

  health:
    "SantÃ©",

  clothing:
    "VÃªtements",

  children:
    "Enfants",

  womenFamilies:
    "Femmes et familles",

  waterHygiene:
    "Eau et hygiÃ¨ne",

  emergency:
    "Urgence",
};

const PROVIDER_LABELS:
  Record<
    DonationProvider,
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

/**
 * ============================================================================
 * PARAMÃˆTRES URL
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

function normalizeSearch(
  value: string
): string {
  return value
    .replace(
      /[\u0000-\u001F\u007F]/g,
      ""
    )
    .trim()
    .slice(
      0,
      MAX_SEARCH_LENGTH
    );
}

function readEnumValue<
  T extends string
>(
  value: string,
  allowed: readonly T[]
): T | null {
  return allowed.includes(
    value as T
  )
    ? value as T
    : null;
}

function readPage(
  value: string
): number {
  const parsed =
    Number.parseInt(
      value,
      10
    );

  if (
    !Number.isSafeInteger(
      parsed
    ) ||
    parsed < 1
  ) {
    return 1;
  }

  return Math.min(
    parsed,
    100_000
  );
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
 * Convertit minuit heure du BÃ©nin
 * vers UTC pour PostgreSQL.
 *
 * Le BÃ©nin est UTC+1.
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

  const utc =
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

  const beninEquivalent =
    new Date(
      utc.getTime() +
        60 *
          60 *
          1_000
    );

  if (
    beninEquivalent
      .getUTCFullYear() !==
      year ||
    beninEquivalent
      .getUTCMonth() !==
      month - 1 ||
    beninEquivalent
      .getUTCDate() !==
      day
  ) {
    return null;
  }

  return utc;
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

function parseFilters(
  params: SearchParams
): Filters {
  const q =
    normalizeSearch(
      readFirst(
        params.q
      )
    );

  const from =
    readFirst(
      params.from
    ).trim();

  const to =
    readFirst(
      params.to
    ).trim();

  return {
    q,

    status:
      readEnumValue(
        readFirst(
          params.status
        ),
        STATUS_VALUES
      ),

    currency:
      readEnumValue(
        readFirst(
          params.currency
        ),
        CURRENCY_VALUES
      ),

    allocation:
      readEnumValue(
        readFirst(
          params.allocation
        ),
        ALLOCATION_VALUES
      ),

    provider:
      readEnumValue(
        readFirst(
          params.provider
        ),
        PROVIDER_VALUES
      ),

    from:
      isIsoDate(from)
        ? from
        : "",

    to:
      isIsoDate(to)
        ? to
        : "",

    requestedPage:
      readPage(
        readFirst(
          params.page
        )
      ),
  };
}

/**
 * ============================================================================
 * FILTRE PRISMA
 * ============================================================================
 */

function buildWhere(
  filters: Filters
):
  Prisma.DonationPaymentWhereInput {
  const where:
    Prisma.DonationPaymentWhereInput =
    {};

  if (
    filters.status
  ) {
    where.status =
      filters.status;
  }

  if (
    filters.currency
  ) {
    where.currency =
      filters.currency;
  }

  if (
    filters.allocation
  ) {
    where.allocation =
      filters.allocation;
  }

  if (
    filters.provider
  ) {
    where.provider =
      filters.provider;
  }

  if (
    filters.q
  ) {
    where.OR = [
      {
        reference: {
          contains:
            filters.q,

          mode:
            "insensitive",
        },
      },

      {
        providerReference: {
          contains:
            filters.q,

          mode:
            "insensitive",
        },
      },

      {
        donorFirstName: {
          contains:
            filters.q,

          mode:
            "insensitive",
        },
      },

      {
        donorLastName: {
          contains:
            filters.q,

          mode:
            "insensitive",
        },
      },

      {
        donorEmail: {
          contains:
            filters.q,

          mode:
            "insensitive",
        },
      },

      {
        donorPhone: {
          contains:
            filters.q,

          mode:
            "insensitive",
        },
      },

      {
        donorCountry: {
          contains:
            filters.q,

          mode:
            "insensitive",
        },
      },
    ];
  }

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
    from ||
    toExclusive
  ) {
    where.createdAt = {
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
  }

  return where;
}

/**
 * ============================================================================
 * FORMATAGE
 * ============================================================================
 */

function formatAmount(
  amount: number,
  currency:
    DonationCurrencyValue
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

function formatDate(
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
  ).format(
    value
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

function hasActiveFilters(
  filters: Filters
): boolean {
  return Boolean(
    filters.q ||
      filters.status ||
      filters.currency ||
      filters.allocation ||
      filters.provider ||
      filters.from ||
      filters.to
  );
}

/**
 * Conserve tous les filtres lors
 * du changement de page.
 */
function buildPageHref(
  filters: Filters,
  page: number
): string {
  const params =
    new URLSearchParams();

  if (
    filters.q
  ) {
    params.set(
      "q",
      filters.q
    );
  }

  if (
    filters.status
  ) {
    params.set(
      "status",
      filters.status
    );
  }

  if (
    filters.currency
  ) {
    params.set(
      "currency",
      filters.currency
    );
  }

  if (
    filters.allocation
  ) {
    params.set(
      "allocation",
      filters.allocation
    );
  }

  if (
    filters.provider
  ) {
    params.set(
      "provider",
      filters.provider
    );
  }

  if (
    filters.from
  ) {
    params.set(
      "from",
      filters.from
    );
  }

  if (
    filters.to
  ) {
    params.set(
      "to",
      filters.to
    );
  }

  if (
    page > 1
  ) {
    params.set(
      "page",
      String(page)
    );
  }

  const query =
    params.toString();

  return query
    ? `/admin/dons?${query}`
    : "/admin/dons";
}

/**
 * Ã‰vite d'afficher une trÃ¨s longue
 * rÃ©fÃ©rence prestataire dans la table.
 *
 * La vraie valeur reste accessible
 * dans le title HTML.
 */
function maskProviderReference(
  value: string | null
): string {
  if (!value) {
    return "â€”";
  }

  if (
    value.length <= 16
  ) {
    return value;
  }

  return (
    `${value.slice(
      0,
      8
    )}` +
    "â€¦" +
    `${value.slice(
      -6
    )}`
  );
}

/**
 * ============================================================================
 * REÃ‡U
 * ============================================================================
 */

function getReceiptLabel(
  receipt:
    | {
        status: string;
        emailStatus:
          string;
      }
    | null
): string {
  if (!receipt) {
    return (
      "Pas encore crÃ©Ã©"
    );
  }

  if (
    receipt.status ===
    "failed"
  ) {
    return (
      "PDF en Ã©chec"
    );
  }

  if (
    receipt.status !==
    "ready"
  ) {
    return (
      "PDF en prÃ©paration"
    );
  }

  if (
    receipt.emailStatus ===
    "sent"
  ) {
    return (
      "PDF + e-mail envoyÃ©s"
    );
  }

  if (
    receipt.emailStatus ===
    "failed"
  ) {
    return (
      "PDF prÃªt, e-mail en Ã©chec"
    );
  }

  return "PDF prÃªt";
}

/**
 * ============================================================================
 * DÃ‰CONNEXION
 * ============================================================================
 */

async function logoutAction():
  Promise<void> {
  "use server";

  await logoutAdmin();
}

/**
 * ============================================================================
 * REQUÃŠTE PRINCIPALE
 * ============================================================================
 */

async function loadRows(
  where:
    Prisma.DonationPaymentWhereInput,
  page: number
) {
  return db
    .donationPayment
    .findMany({
      where,

      take:
        PAGE_SIZE,

      skip:
        (
          page - 1
        ) *
        PAGE_SIZE,

      orderBy: [
        {
          createdAt:
            "desc",
        },

        {
          id:
            "desc",
        },
      ],

      select: {
        id:
          true,

        reference:
          true,

        provider:
          true,

        providerReference:
          true,

        amount:
          true,

        currency:
          true,

        frequency:
          true,

        allocation:
          true,

        donorFirstName:
          true,

        donorLastName:
          true,

        donorEmail:
          true,

        donorPhone:
          true,

        donorCountry:
          true,

        anonymous:
          true,

        status:
          true,

        paidAt:
          true,

        lastVerifiedAt:
          true,

        verificationCount:
          true,

        createdAt:
          true,

        updatedAt:
          true,

        receipt: {
          select: {
            receiptNumber:
              true,

            status:
              true,

            emailStatus:
              true,

            pdfGeneratedAt:
              true,

            emailSentAt:
              true,
          },
        },
      },
    });
}

/**
 * ============================================================================
 * PAGE
 * ============================================================================
 */

export default async function AdminDonationsPage({
  searchParams,
}: PageProps) {
  /**
   * Aucune requÃªte financiÃ¨re avant
   * validation de la session admin.
   */
  const session =
    await requireAdmin();

  const params =
    searchParams
      ? await searchParams
      : {};

  const filters =
    parseFilters(
      params
    );

  const where =
    buildWhere(
      filters
    );

  let totalCount =
    0;

  let page =
    1;

  let totalPages =
    1;

  let rows:
    Awaited<
      ReturnType<
        typeof loadRows
      >
    > = [];

  let statusCounts =
    new Map<
      DonationStatus,
      number
    >();

  let loadFailed =
    false;

  try {
    /**
     * Le comptage et les groupes
     * utilisent exactement les mÃªmes
     * filtres que le tableau.
     */
    const [
      count,
      groupedStatuses,
    ] =
      await Promise.all([
        db
          .donationPayment
          .count({
            where,
          }),

        db
          .donationPayment
          .groupBy({
            by: [
              "status",
            ],

            where,

            _count: {
              _all:
                true,
            },
          }),
      ]);

    totalCount =
      count;

    totalPages =
      Math.max(
        1,
        Math.ceil(
          totalCount /
            PAGE_SIZE
        )
      );

    /**
     * EmpÃªche une URL ?page=999999
     * d'afficher artificiellement
     * une page inexistante.
     */
    page =
      Math.min(
        filters.requestedPage,
        totalPages
      );

    rows =
      await loadRows(
        where,
        page
      );

    statusCounts =
      new Map(
        groupedStatuses.map(
          (item) => [
            item.status,
            item
              ._count
              ._all,
          ]
        )
      );
  } catch (
    error: unknown
  ) {
    loadFailed =
      true;

    /**
     * Ne jamais logger les donnÃ©es
     * personnelles du donateur.
     */
    console.error(
      "Admin donations list loading failed:",
      {
        name:
          error instanceof
          Error
            ? error.name
            : "UnknownError",
      }
    );
  }

  const firstVisible =
    totalCount === 0
      ? 0
      : (
          page - 1
        ) *
          PAGE_SIZE +
        1;

  const lastVisible =
    Math.min(
      page *
        PAGE_SIZE,
      totalCount
    );

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
                Administration Â· Dons
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
                  DÃ©connexion
                </span>
              </button>
            </form>
          </div>
        </div>
      </header>

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
        {/*
         * ==============================================================
         * TITRE
         * ==============================================================
         */}

        <section
          className="
            flex
            flex-col
            gap-4
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

              DonnÃ©es privÃ©es
            </div>

            <h1
              className="
                text-3xl
                font-extrabold
                tracking-tight
                sm:text-4xl
              "
            >
              Dons
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
              Consultez les transactions
              enregistrÃ©es par Young Caring,
              leur statut rÃ©el, le donateur,
              la destination du don et
              lâ€™Ã©tat du reÃ§u.
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-[var(--yc-border)]
              bg-white
              px-4
              py-3
              shadow-sm
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-[var(--yc-text-muted)]
              "
            >
              RÃ©sultats
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-extrabold
              "
            >
              {formatNumber(
                totalCount
              )}
            </p>
          </div>
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
              Recherche et filtres
            </h2>
          </div>

          <form
            method="get"
            action="/admin/dons"
            className="
              grid
              gap-3
              md:grid-cols-2
              xl:grid-cols-7
            "
          >
            <div
              className="
                md:col-span-2
                xl:col-span-2
              "
            >
              <label
                htmlFor="q"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-bold
                  text-[var(--yc-text-muted)]
                "
              >
                Recherche
              </label>

              <div
                className="
                  relative
                "
              >
                <Search
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={
                    filters.q
                  }
                  maxLength={
                    MAX_SEARCH_LENGTH
                  }
                  placeholder="Nom, e-mail, tÃ©lÃ©phone, rÃ©fÃ©renceâ€¦"
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-[var(--yc-border)]
                    bg-white
                    pl-10
                    pr-3
                    text-sm
                    outline-none
                    transition
                    focus:border-[var(--yc-turquoise)]
                    focus:ring-4
                    focus:ring-[var(--yc-turquoise)]/10
                  "
                />
              </div>
            </div>

            <FilterSelect
              id="status"
              label="Statut"
              name="status"
              value={
                filters.status ??
                ""
              }
              options={
                STATUS_VALUES.map(
                  (
                    value
                  ) => ({
                    value,

                    label:
                      STATUS_LABELS[
                        value
                      ],
                  })
                )
              }
            />

            <FilterSelect
              id="currency"
              label="Devise"
              name="currency"
              value={
                filters.currency ??
                ""
              }
              options={
                CURRENCY_VALUES.map(
                  (
                    value
                  ) => ({
                    value,
                    label:
                      value,
                  })
                )
              }
            />

            <FilterSelect
              id="allocation"
              label="Destination"
              name="allocation"
              value={
                filters.allocation ??
                ""
              }
              options={
                ALLOCATION_VALUES.map(
                  (
                    value
                  ) => ({
                    value,

                    label:
                      ALLOCATION_LABELS[
                        value
                      ],
                  })
                )
              }
            />

            <FilterSelect
              id="provider"
              label="Prestataire"
              name="provider"
              value={
                filters.provider ??
                ""
              }
              options={
                PROVIDER_VALUES.map(
                  (
                    value
                  ) => ({
                    value,

                    label:
                      PROVIDER_LABELS[
                        value
                      ],
                  })
                )
              }
            />

            <div>
              <label
                htmlFor="from"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-bold
                  text-[var(--yc-text-muted)]
                "
              >
                Du
              </label>

              <input
                id="from"
                name="from"
                type="date"
                defaultValue={
                  filters.from
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

            <div>
              <label
                htmlFor="to"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-bold
                  text-[var(--yc-text-muted)]
                "
              >
                Au
              </label>

              <input
                id="to"
                name="to"
                type="date"
                defaultValue={
                  filters.to
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

            <div
              className="
                flex
                items-end
                gap-2
                md:col-span-2
                xl:col-span-7
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
                <Search
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                  "
                />

                Appliquer
              </button>

              {hasActiveFilters(
                filters
              ) ? (
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

                  RÃ©initialiser
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        {/*
         * ==============================================================
         * COMPTEURS DES RÃ‰SULTATS FILTRÃ‰S
         * ==============================================================
         */}

        {!loadFailed ? (
          <section
            className="
              mt-4
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <MiniStat
              label="PayÃ©s"
              value={
                statusCounts.get(
                  DonationPaymentStatus
                    .paid
                ) ??
                0
              }
              className="
                border-emerald-200
                bg-emerald-50
                text-emerald-800
              "
            />

            <MiniStat
              label="En attente / traitement"
              value={
                (
                  statusCounts.get(
                    DonationPaymentStatus
                      .pending
                  ) ??
                  0
                ) +
                (
                  statusCounts.get(
                    DonationPaymentStatus
                      .processing
                  ) ??
                  0
                )
              }
              className="
                border-amber-200
                bg-amber-50
                text-amber-800
              "
            />

            <MiniStat
              label="Ã‰chouÃ©s / annulÃ©s / expirÃ©s"
              value={
                (
                  statusCounts.get(
                    DonationPaymentStatus
                      .failed
                  ) ??
                  0
                ) +
                (
                  statusCounts.get(
                    DonationPaymentStatus
                      .cancelled
                  ) ??
                  0
                ) +
                (
                  statusCounts.get(
                    DonationPaymentStatus
                      .expired
                  ) ??
                  0
                )
              }
              className="
                border-red-200
                bg-red-50
                text-red-800
              "
            />

            <MiniStat
              label="RemboursÃ©s"
              value={
                statusCounts.get(
                  DonationPaymentStatus
                    .refunded
                ) ??
                0
              }
              className="
                border-violet-200
                bg-violet-50
                text-violet-800
              "
            />
          </section>
        ) : null}

        {/*
         * ==============================================================
         * TABLEAU
         * ==============================================================
         */}

        <section
          className="
            mt-6
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
                Transactions
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--yc-text-muted)]
                "
              >
                {totalCount ===
                0
                  ? "Aucun rÃ©sultat"
                  : (
                      `${formatNumber(
                        firstVisible
                      )}â€“` +
                      `${formatNumber(
                        lastVisible
                      )} sur ` +
                      `${formatNumber(
                        totalCount
                      )}`
                    )}
              </p>
            </div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                text-xs
                font-semibold
                text-[var(--yc-text-muted)]
              "
            >
              <CircleDollarSign
                aria-hidden="true"
                className="
                  h-4
                  w-4
                "
              />

              Seul le statut
              Â« PayÃ© Â» confirme
              rÃ©ellement un don.
            </div>
          </div>

          {loadFailed ? (
            <div
              role="alert"
              className="
                px-6
                py-12
                text-center
              "
            >
              <h3
                className="
                  font-extrabold
                  text-red-800
                "
              >
                Impossible de charger
                les dons
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-[var(--yc-text-muted)]
                "
              >
                La session administrateur
                reste active, mais la base
                de donnÃ©es nâ€™a pas rÃ©pondu
                correctement. Aucun chiffre
                nâ€™a Ã©tÃ© inventÃ©.
              </p>

              <Link
                href={
                  buildPageHref(
                    filters,
                    page
                  )
                }
                className="
                  mt-5
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[var(--yc-border)]
                  px-4
                  text-sm
                  font-bold
                "
              >
                <RotateCcw
                  aria-hidden="true"
                  className="
                    h-4
                    w-4
                  "
                />

                RÃ©essayer
              </Link>
            </div>
          ) : rows.length ===
            0 ? (
            <div
              className="
                px-6
                py-14
                text-center
              "
            >
              <Search
                aria-hidden="true"
                className="
                  mx-auto
                  h-8
                  w-8
                  text-slate-400
                "
              />

              <h3
                className="
                  mt-4
                  font-extrabold
                "
              >
                Aucun don trouvÃ©
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-[var(--yc-text-muted)]
                "
              >
                Modifiez les filtres
                ou attendez
                lâ€™enregistrement de
                nouvelles transactions.
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
                  min-w-[1280px]
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
                    <TableHead>
                      Donateur
                    </TableHead>

                    <TableHead>
                      RÃ©fÃ©rence
                    </TableHead>

                    <TableHead>
                      Montant
                    </TableHead>

                    <TableHead>
                      Destination
                    </TableHead>

                    <TableHead>
                      Prestataire
                    </TableHead>

                    <TableHead>
                      Statut
                    </TableHead>

                    <TableHead>
                      ReÃ§u
                    </TableHead>

                    <TableHead>
                      Date
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {rows.map(
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
                          align-top
                          transition
                          hover:bg-[var(--yc-surface)]
                        "
                      >
                        <td
                          className="
                            px-5
                            py-4
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
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
                                text-[var(--yc-turquoise-deep)]
                              "
                            >
                              <UserRound
                                aria-hidden="true"
                                className="
                                  h-4
                                  w-4
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
                                  max-w-[220px]
                                  truncate
                                  text-sm
                                  font-extrabold
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

                              <p
                                className="
                                  mt-0.5
                                  max-w-[230px]
                                  truncate
                                  text-xs
                                  text-[var(--yc-text-muted)]
                                "
                              >
                                {
                                  payment
                                    .donorEmail
                                }
                              </p>

                              <div
                                className="
                                  mt-1
                                  flex
                                  flex-wrap
                                  gap-x-2
                                  gap-y-1
                                  text-[11px]
                                  font-semibold
                                  text-[var(--yc-text-muted)]
                                "
                              >
                                {payment
                                  .donorPhone ? (
                                  <span>
                                    {
                                      payment
                                        .donorPhone
                                    }
                                  </span>
                                ) : null}

                                {payment
                                  .donorCountry ? (
                                  <span>
                                    Â·{" "}
                                    {
                                      payment
                                        .donorCountry
                                    }
                                  </span>
                                ) : null}

                                {payment
                                  .anonymous ? (
                                  <span
                                    className="
                                      text-amber-700
                                    "
                                  >
                                    Â· Anonyme
                                    publiquement
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                          "
                        >
                          <p
                            className="
                              font-mono
                              text-xs
                              font-bold
                            "
                          >
                            {
                              payment
                                .reference
                            }
                          </p>

                          <p
                            title={
                              payment
                                .providerReference ??
                              undefined
                            }
                            className="
                              mt-1
                              font-mono
                              text-[11px]
                              text-[var(--yc-text-muted)]
                            "
                          >
                            {
                              maskProviderReference(
                                payment
                                  .providerReference
                              )
                            }
                          </p>
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
                              payment
                                .amount,

                              payment
                                .currency
                            )
                          }
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-sm
                            font-semibold
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
                            px-4
                            py-4
                            text-sm
                            font-semibold
                          "
                        >
                          {
                            PROVIDER_LABELS[
                              payment
                                .provider
                            ]
                          }
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                          "
                        >
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              border
                              px-2.5
                              py-1
                              text-xs
                              font-extrabold
                              ${
                                STATUS_CLASSES[
                                  payment
                                    .status
                                ]
                              }
                            `}
                          >
                            {
                              STATUS_LABELS[
                                payment
                                  .status
                              ]
                            }
                          </span>
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                          "
                        >
                          <div
                            className="
                              max-w-[190px]
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                text-xs
                                font-bold
                              "
                            >
                              <ReceiptText
                                aria-hidden="true"
                                className="
                                  h-4
                                  w-4
                                  text-[var(--yc-text-muted)]
                                "
                              />

                              {
                                getReceiptLabel(
                                  payment
                                    .receipt
                                )
                              }
                            </div>

                            {payment
                              .receipt
                              ?.receiptNumber ? (
                              <p
                                className="
                                  mt-1
                                  font-mono
                                  text-[11px]
                                  text-[var(--yc-text-muted)]
                                "
                              >
                                {
                                  payment
                                    .receipt
                                    .receiptNumber
                                }
                              </p>
                            ) : null}

                            {payment
                              .receipt
                              ?.emailStatus ===
                            "sent" ? (
                              <p
                                className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-1
                                  text-[11px]
                                  font-semibold
                                  text-emerald-700
                                "
                              >
                                <Mail
                                  aria-hidden="true"
                                  className="
                                    h-3.5
                                    w-3.5
                                  "
                                />

                                EnvoyÃ©
                              </p>
                            ) : null}
                          </div>
                        </td>

                        <td
                          className="
                            whitespace-nowrap
                            px-4
                            py-4
                            text-sm
                            text-[var(--yc-text-muted)]
                          "
                        >
                          <p>
                            {
                              formatDate(
                                payment
                                  .paidAt ??
                                  payment
                                    .createdAt
                              )
                            }
                          </p>

                          {payment
                            .paidAt ? (
                            <p
                              className="
                                mt-1
                                text-[11px]
                                font-semibold
                                text-emerald-700
                              "
                            >
                              Confirmation
                              paiement
                            </p>
                          ) : (
                            <p
                              className="
                                mt-1
                                text-[11px]
                              "
                            >
                              CrÃ©ation
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/*
           * ============================================================
           * PAGINATION
           * ============================================================
           */}

          {!loadFailed &&
          totalPages > 1 ? (
            <div
              className="
                flex
                flex-col
                gap-3
                border-t
                border-[var(--yc-border)]
                px-5
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--yc-text-muted)]
                "
              >
                Page{" "}
                {
                  formatNumber(
                    page
                  )
                }{" "}
                sur{" "}
                {
                  formatNumber(
                    totalPages
                  )
                }
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                {page > 1 ? (
                  <Link
                    href={
                      buildPageHref(
                        filters,
                        page - 1
                      )
                    }
                    className="
                      inline-flex
                      h-10
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
                      hover:border-slate-400
                    "
                  >
                    <ChevronLeft
                      aria-hidden="true"
                      className="
                        h-4
                        w-4
                      "
                    />

                    PrÃ©cÃ©dent
                  </Link>
                ) : (
                  <span
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
                    <ChevronLeft
                      aria-hidden="true"
                      className="
                        h-4
                        w-4
                      "
                    />

                    PrÃ©cÃ©dent
                  </span>
                )}

                {page <
                totalPages ? (
                  <Link
                    href={
                      buildPageHref(
                        filters,
                        page + 1
                      )
                    }
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
                    Suivant

                    <ChevronRight
                      aria-hidden="true"
                      className="
                        h-4
                        w-4
                      "
                    />
                  </Link>
                ) : (
                  <span
                    className="
                      inline-flex
                      h-10
                      cursor-not-allowed
                      items-center
                      gap-2
                      rounded-xl
                      bg-slate-100
                      px-4
                      text-sm
                      font-bold
                      text-slate-400
                    "
                  >
                    Suivant

                    <ChevronRight
                      aria-hidden="true"
                      className="
                        h-4
                        w-4
                      "
                    />
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

/**
 * ============================================================================
 * COMPOSANTS INTERNES
 * ============================================================================
 */

function FilterSelect({
  id,
  label,
  name,
  value,
  options,
}: Readonly<{
  id: string;

  label: string;

  name: string;

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
        htmlFor={id}
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
        defaultValue={value}
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
        <option value="">
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

function MiniStat({
  label,
  value,
  className,
}: Readonly<{
  label: string;

  value: number;

  className: string;
}>) {
  return (
    <article
      className={`
        rounded-2xl
        border
        p-4
        ${className}
      `}
    >
      <p
        className="
          text-xs
          font-bold
          uppercase
          tracking-wide
          opacity-80
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-2xl
          font-extrabold
        "
      >
        {formatNumber(
          value
        )}
      </p>
    </article>
  );
}

function TableHead({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <th
      className="
        px-4
        py-3
        text-xs
        font-extrabold
        uppercase
        tracking-wide
        text-[var(--yc-text-muted)]
        first:pl-5
      "
    >
      {children}
    </th>
  );
}
