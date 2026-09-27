import "server-only";

import React from "react";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import type {
  DocumentProps,
} from "@react-pdf/renderer";

import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  DonationAllocation,
  DonationCurrency,
  DonationPaymentProvider,
  DonationPaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

import {
  getAdminSession,
} from "@/lib/admin-auth";

import {
  db,
} from "@/lib/db";

/**
 * ============================================================================
 * YOUNG CARING
 * EXPORT PDF — RAPPORT DES DONS
 * ============================================================================
 *
 * - accès administrateur obligatoire ;
 * - uniquement les paiements réellement payés ;
 * - filtres identiques à /admin/rapports ;
 * - période calculée avec l'heure du Bénin ;
 * - aucune addition entre devises différentes ;
 * - aucune donnée bancaire dans le PDF ;
 * - téléchargement privé sans cache ;
 * - limitation du nombre de lignes pour protéger le serveur.
 * ============================================================================
 */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const PDF_MIME_TYPE =
  "application/pdf";

const MAX_REPORT_ROWS =
  1_500;

const MAX_PDF_SIZE_BYTES =
  25_000_000;

const BENIN_OFFSET_MS =
  60 * 60 * 1_000;

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

type CurrencySummary =
  Readonly<{
    currency:
      DonationCurrency;

    amount:
      number;

    count:
      number;
  }>;

type PdfRow =
  Readonly<{
    id:
      string;

    reference:
      string;

    amount:
      number;

    currency:
      DonationCurrency;

    allocation:
      DonationAllocation;

    provider:
      DonationPaymentProvider;

    donorFirstName:
      string;

    donorLastName:
      string;

    donorEmail:
      string;

    anonymous:
      boolean;

    paidAt:
      Date |
      null;

    createdAt:
      Date;

    receipt:
      Readonly<{
        status:
          string;
      }> |
      null;
  }>;

class ReportRequestError
  extends Error {
  readonly code:
    string;

  readonly status:
    number;

  constructor(
    code: string,
    message: string,
    status = 400
  ) {
    super(
      message
    );

    this.name =
      "ReportRequestError";

    this.code =
      code;

    this.status =
      status;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

/**
 * ============================================================================
 * ERREURS JSON
 * ============================================================================
 */

function jsonError(
  error: string,
  status: number,
  extra?: Readonly<
    Record<
      string,
      unknown
    >
  >
): NextResponse {
  return NextResponse.json(
    {
      success:
        false,

      error,

      ...extra,
    },
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, max-age=0",

        Pragma:
          "no-cache",

        Expires:
          "0",

        "X-Content-Type-Options":
          "nosniff",
      },
    }
  );
}

/**
 * ============================================================================
 * VALIDATION DES PARAMÈTRES
 * ============================================================================
 */

function isIsoDate(
  value: string
): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  );
}

function parseEnumParam<
  T extends string
>(
  value: string | null,
  allowed:
    readonly T[],
  fieldName:
    string
): T | null {
  if (
    value === null ||
    value.trim() === ""
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    !allowed.includes(
      normalized as T
    )
  ) {
    throw new ReportRequestError(
      "INVALID_REPORT_FILTER",
      `${fieldName} est invalide.`
    );
  }

  return normalized as T;
}

/**
 * Minuit au Bénin converti
 * en UTC pour PostgreSQL.
 */
function beninDayStart(
  value: string
): Date {
  if (
    !isIsoDate(
      value
    )
  ) {
    throw new ReportRequestError(
      "INVALID_REPORT_DATE",
      "La date du rapport est invalide."
    );
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  const date =
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
        BENIN_OFFSET_MS
    );

  const verification =
    new Date(
      date.getTime() +
        BENIN_OFFSET_MS
    );

  if (
    verification.getUTCFullYear() !==
      year ||
    verification.getUTCMonth() !==
      month - 1 ||
    verification.getUTCDate() !==
      day
  ) {
    throw new ReportRequestError(
      "INVALID_REPORT_DATE",
      "La date du rapport est invalide."
    );
  }

  return date;
}

function beninNextDayStart(
  value: string
): Date {
  return new Date(
    beninDayStart(
      value
    ).getTime() +
      24 *
        60 *
        60 *
        1_000
  );
}

function parseFilters(
  request:
    NextRequest
): ReportFilters {
  const params =
    request
      .nextUrl
      .searchParams;

  let from =
    params
      .get(
        "from"
      )
      ?.trim() ??
    "";

  let to =
    params
      .get(
        "to"
      )
      ?.trim() ??
    "";

  if (
    from &&
    !isIsoDate(
      from
    )
  ) {
    throw new ReportRequestError(
      "INVALID_REPORT_DATE",
      "La date de début est invalide."
    );
  }

  if (
    to &&
    !isIsoDate(
      to
    )
  ) {
    throw new ReportRequestError(
      "INVALID_REPORT_DATE",
      "La date de fin est invalide."
    );
  }

  /**
   * Remet automatiquement
   * une période inversée dans l'ordre.
   */
  if (
    from &&
    to &&
    from > to
  ) {
    const previousFrom =
      from;

    from =
      to;

    to =
      previousFrom;
  }

  /**
   * Vérifie également les jours
   * réellement inexistants.
   *
   * Exemple :
   * 2026-02-31
   */
  if (
    from
  ) {
    beninDayStart(
      from
    );
  }

  if (
    to
  ) {
    beninDayStart(
      to
    );
  }

  return {
    from,

    to,

    currency:
      parseEnumParam(
        params.get(
          "currency"
        ),
        CURRENCIES,
        "currency"
      ),

    allocation:
      parseEnumParam(
        params.get(
          "allocation"
        ),
        ALLOCATIONS,
        "allocation"
      ),

    provider:
      parseEnumParam(
        params.get(
          "provider"
        ),
        PROVIDERS,
        "provider"
      ),
  };
}

/**
 * ============================================================================
 * FILTRE FINANCIER
 * ============================================================================
 */

function buildPaidWhere(
  filters:
    ReportFilters
):
  Prisma.DonationPaymentWhereInput {
  const paidAt:
    Prisma.DateTimeNullableFilter<
      "DonationPayment"
    > = {
    not:
      null,
  };

  if (
    filters.from
  ) {
    paidAt.gte =
      beninDayStart(
        filters.from
      );
  }

  if (
    filters.to
  ) {
    paidAt.lt =
      beninNextDayStart(
        filters.to
      );
  }

  return {
    /**
     * Important :
     * seuls les paiements confirmés
     * entrent dans le PDF.
     */
    status:
      DonationPaymentStatus
        .paid,

    paidAt,

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
 * ============================================================================
 * FORMATAGE
 * ============================================================================
 */

function formatAmount(
  amount:
    number,
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

function formatPdfDate(
  date:
    Date
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone:
        "Africa/Porto-Novo",

      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    }
  ).format(
    date
  );
}

function formatGeneratedAt(
  date:
    Date
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      timeZone:
        "Africa/Porto-Novo",

      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    date
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

function getFilterLabel(
  filters:
    ReportFilters
): string {
  const values:
    string[] = [];

  if (
    filters.currency
  ) {
    values.push(
      `Devise : ${filters.currency}`
    );
  }

  if (
    filters.allocation
  ) {
    values.push(
      `Destination : ${
        ALLOCATION_LABELS[
          filters.allocation
        ]
      }`
    );
  }

  if (
    filters.provider
  ) {
    values.push(
      `Prestataire : ${
        PROVIDER_LABELS[
          filters.provider
        ]
      }`
    );
  }

  if (
    values.length ===
    0
  ) {
    return (
      "Aucun filtre supplémentaire"
    );
  }

  return values.join(
    " · "
  );
}

function normalizeDonorName(
  row:
    PdfRow
): string {
  /**
   * Respect du choix d'anonymat
   * dans le document exporté.
   */
  if (
    row.anonymous
  ) {
    return (
      "Donateur anonyme"
    );
  }

  const name =
    `${row.donorFirstName} ${row.donorLastName}`
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return (
    name ||
    "Donateur"
  );
}

function createFileName(
  filters:
    ReportFilters,
  generatedAt:
    Date
): string {
  const date =
    new Intl.DateTimeFormat(
      "fr-CA",
      {
        timeZone:
          "Africa/Porto-Novo",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    )
      .format(
        generatedAt
      )
      .replaceAll(
        "/",
        "-"
      );

  const period =
    filters.from ||
    filters.to
      ? `${filters.from || "debut"}-${filters.to || "fin"}`
      : "complet";

  return (
    "young-caring-rapport-dons-" +
    `${period}-${date}.pdf`
  );
}

/**
 * ============================================================================
 * RÉSUMÉS PAR DEVISE
 * ============================================================================
 */

function buildCurrencySummaries(
  rows:
    readonly PdfRow[]
): CurrencySummary[] {
  const map =
    new Map<
      DonationCurrency,
      {
        amount:
          number;

        count:
          number;
      }
    >();

  for (
    const row of rows
  ) {
    const current =
      map.get(
        row.currency
      ) ?? {
        amount:
          0,

        count:
          0,
      };

    current.amount +=
      row.amount;

    current.count +=
      1;

    map.set(
      row.currency,
      current
    );
  }

  return CURRENCIES
    .filter(
      (
        currency
      ) =>
        map.has(
          currency
        )
    )
    .map(
      (
        currency
      ) => {
        const value =
          map.get(
            currency
          );

        return {
          currency,

          amount:
            value?.amount ??
            0,

          count:
            value?.count ??
            0,
        };
      }
    );
}

/**
 * ============================================================================
 * STYLES DU PDF
 * ============================================================================
 */

const styles =
  StyleSheet.create({
    page: {
      paddingTop:
        28,

      paddingRight:
        28,

      paddingBottom:
        38,

      paddingLeft:
        28,

      fontFamily:
        "Helvetica",

      fontSize:
        8.5,

      color:
        "#172033",

      backgroundColor:
        "#FFFFFF",
    },

    header: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#DDE5E8",

      paddingBottom:
        14,

      marginBottom:
        14,
    },

    brand: {
      fontSize:
        18,

      fontWeight:
        700,

      color:
        "#12212B",
    },

    brandSub: {
      marginTop:
        3,

      fontSize:
        8.5,

      color:
        "#65747C",
    },

    reportTitle: {
      fontSize:
        13,

      fontWeight:
        700,

      textAlign:
        "right",

      color:
        "#0B7777",
    },

    reportMeta: {
      marginTop:
        3,

      fontSize:
        8,

      color:
        "#65747C",

      textAlign:
        "right",
    },

    infoBox: {
      borderWidth:
        1,

      borderColor:
        "#DDE5E8",

      backgroundColor:
        "#F7FAFA",

      borderRadius:
        5,

      padding:
        10,

      marginBottom:
        12,
    },

    infoTitle: {
      fontSize:
        9,

      fontWeight:
        700,

      marginBottom:
        3,

      color:
        "#12212B",
    },

    infoText: {
      fontSize:
        8,

      color:
        "#58666E",

      lineHeight:
        1.35,
    },

    summaryRow: {
      flexDirection:
        "row",

      marginBottom:
        12,

      gap:
        8,
    },

    summaryCard: {
      flexGrow:
        1,

      flexBasis:
        0,

      borderWidth:
        1,

      borderColor:
        "#CFE5E4",

      backgroundColor:
        "#F0FAF9",

      borderRadius:
        5,

      padding:
        9,
    },

    summaryLabel: {
      fontSize:
        7.5,

      color:
        "#65747C",

      marginBottom:
        4,
    },

    summaryValue: {
      fontSize:
        12,

      fontWeight:
        700,

      color:
        "#0B7777",
    },

    summaryDetail: {
      marginTop:
        3,

      fontSize:
        7.5,

      color:
        "#65747C",
    },

    sectionTitle: {
      fontSize:
        10.5,

      fontWeight:
        700,

      marginBottom:
        7,

      marginTop:
        3,

      color:
        "#12212B",
    },

    table: {
      borderWidth:
        1,

      borderColor:
        "#DDE5E8",

      borderBottomWidth:
        0,
    },

    tableHeader: {
      flexDirection:
        "row",

      backgroundColor:
        "#12212B",

      color:
        "#FFFFFF",

      minHeight:
        24,

      alignItems:
        "center",
    },

    tableRow: {
      flexDirection:
        "row",

      minHeight:
        25,

      alignItems:
        "center",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#DDE5E8",

      backgroundColor:
        "#FFFFFF",
    },

    tableRowAlt: {
      backgroundColor:
        "#FAFCFC",
    },

    cell: {
      padding:
        5,

      fontSize:
        7.2,

      lineHeight:
        1.25,
    },

    headCell: {
      padding:
        5,

      fontSize:
        7.2,

      fontWeight:
        700,
    },

    dateColumn: {
      width:
        "11%",
    },

    referenceColumn: {
      width:
        "19%",
    },

    donorColumn: {
      width:
        "21%",
    },

    allocationColumn: {
      width:
        "20%",
    },

    amountColumn: {
      width:
        "17%",

      textAlign:
        "right",
    },

    providerColumn: {
      width:
        "12%",
    },

    empty: {
      padding:
        18,

      textAlign:
        "center",

      color:
        "#65747C",

      borderWidth:
        1,

      borderColor:
        "#DDE5E8",

      borderRadius:
        5,
    },

    privacyNotice: {
      marginTop:
        12,

      padding:
        8,

      borderRadius:
        4,

      backgroundColor:
        "#FFF8E8",

      color:
        "#765A12",

      fontSize:
        7.3,

      lineHeight:
        1.35,
    },

    footer: {
      position:
        "absolute",

      left:
        28,

      right:
        28,

      bottom:
        18,

      paddingTop:
        6,

      borderTopWidth:
        1,

      borderTopColor:
        "#DDE5E8",

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      color:
        "#7A878D",

      fontSize:
        7,
    },
  });

/**
 * ============================================================================
 * COMPOSANTS PDF SANS JSX
 *
 * Le fichier est route.ts et non route.tsx.
 * React.createElement évite donc toute
 * dépendance à JSX dans une Route Handler.
 * ============================================================================
 */

function createSummaryCard(
  key:
    string,
  label:
    string,
  value:
    string,
  detail:
    string
): React.ReactElement {
  return React.createElement(
    View,
    {
      key,

      style:
        styles.summaryCard,
    },

    React.createElement(
      Text,
      {
        style:
          styles.summaryLabel,
      },
      label
    ),

    React.createElement(
      Text,
      {
        style:
          styles.summaryValue,
      },
      value
    ),

    React.createElement(
      Text,
      {
        style:
          styles.summaryDetail,
      },
      detail
    )
  );
}

function createTableCell(
  key:
    string,
  value:
    string,
  style:
    | typeof styles.dateColumn
    | typeof styles.referenceColumn
    | typeof styles.donorColumn
    | typeof styles.allocationColumn
    | typeof styles.amountColumn
    | typeof styles.providerColumn,
  header =
    false
): React.ReactElement {
  return React.createElement(
    Text,
    {
      key,

      style: [
        header
          ? styles.headCell
          : styles.cell,

        style,
      ],
    },

    value
  );
}

function buildPdfDocument(
  rows:
    readonly PdfRow[],
  filters:
    ReportFilters,
  generatedAt:
    Date
):
  React.ReactElement<
    DocumentProps
  > {
  const currencySummaries =
    buildCurrencySummaries(
      rows
    );

  /**
   * E-mails utilisés uniquement
   * pour calculer les donateurs uniques.
   *
   * Ils ne sont pas imprimés dans le PDF.
   */
  const uniqueDonors =
    new Set(
      rows.map(
        (
          row
        ) =>
          row
            .donorEmail
            .trim()
            .toLowerCase()
      )
    ).size;

  const receiptsReady =
    rows.filter(
      (
        row
      ) =>
        row
          .receipt
          ?.status ===
        "ready"
    ).length;

  const summaryCards:
    React.ReactElement[] = [
    createSummaryCard(
      "donations",
      "Dons confirmés",
      String(
        rows.length
      ),
      "Paiements serveur au statut paid"
    ),

    createSummaryCard(
      "donors",
      "Donateurs uniques",
      String(
        uniqueDonors
      ),
      "Donateurs ayant un paiement confirmé"
    ),

    createSummaryCard(
      "receipts",
      "Reçus PDF prêts",
      String(
        receiptsReady
      ),
      `${
        rows.length -
        receiptsReady
      } sans reçu prêt`
    ),
  ];

  for (
    const item of
      currencySummaries
  ) {
    summaryCards.push(
      createSummaryCard(
        `currency-${item.currency}`,

        `Collecté — ${item.currency}`,

        formatAmount(
          item.amount,
          item.currency
        ),

        `${item.count} don(s)`
      )
    );
  }

  const tableHeader =
    React.createElement(
      View,
      {
        style:
          styles.tableHeader,

        fixed:
          true,
      },

      createTableCell(
        "date",
        "Date",
        styles.dateColumn,
        true
      ),

      createTableCell(
        "reference",
        "Référence",
        styles.referenceColumn,
        true
      ),

      createTableCell(
        "donor",
        "Donateur",
        styles.donorColumn,
        true
      ),

      createTableCell(
        "allocation",
        "Destination",
        styles.allocationColumn,
        true
      ),

      createTableCell(
        "amount",
        "Montant",
        styles.amountColumn,
        true
      ),

      createTableCell(
        "provider",
        "Prestataire",
        styles.providerColumn,
        true
      )
    );

  const tableRows =
    rows.map(
      (
        row,
        index
      ) =>
        React.createElement(
          View,
          {
            key:
              row.id,

            wrap:
              false,

            style: [
              styles.tableRow,

              ...(index %
                2 ===
              1
                ? [
                    styles.tableRowAlt,
                  ]
                : []),
            ],
          },

          createTableCell(
            `${row.id}-date`,

            formatPdfDate(
              row.paidAt ??
                row.createdAt
            ),

            styles.dateColumn
          ),

          createTableCell(
            `${row.id}-reference`,

            row.reference,

            styles.referenceColumn
          ),

          createTableCell(
            `${row.id}-donor`,

            normalizeDonorName(
              row
            ),

            styles.donorColumn
          ),

          createTableCell(
            `${row.id}-allocation`,

            ALLOCATION_LABELS[
              row.allocation
            ],

            styles.allocationColumn
          ),

          createTableCell(
            `${row.id}-amount`,

            formatAmount(
              row.amount,
              row.currency
            ),

            styles.amountColumn
          ),

          createTableCell(
            `${row.id}-provider`,

            PROVIDER_LABELS[
              row.provider
            ],

            styles.providerColumn
          )
        )
    );

  const table =
    rows.length >
    0
      ? React.createElement(
          View,
          {
            style:
              styles.table,
          },

          tableHeader,

          ...tableRows
        )
      : React.createElement(
          Text,
          {
            style:
              styles.empty,
          },

          "Aucun don confirmé ne correspond aux filtres sélectionnés."
        );

  return React.createElement(
    Document,
    {
      title:
        "Rapport des dons - Young Caring",

      author:
        "Young Caring",

      subject:
        "Rapport administratif des dons confirmés",

      creator:
        "Young Caring",
    },

    React.createElement(
      Page,
      {
        size:
          "A4",

        orientation:
          "landscape",

        style:
          styles.page,
      },

      /**
       * En-tête.
       */
      React.createElement(
        View,
        {
          style:
            styles.header,
        },

        React.createElement(
          View,
          null,

          React.createElement(
            Text,
            {
              style:
                styles.brand,
            },

            "YOUNG CARING"
          ),

          React.createElement(
            Text,
            {
              style:
                styles.brandSub,
            },

            "Administration · Suivi des dons"
          )
        ),

        React.createElement(
          View,
          null,

          React.createElement(
            Text,
            {
              style:
                styles.reportTitle,
            },

            "RAPPORT DES DONS"
          ),

          React.createElement(
            Text,
            {
              style:
                styles.reportMeta,
            },

            `Généré le ${
              formatGeneratedAt(
                generatedAt
              )
            }`
          )
        )
      ),

      /**
       * Période et filtres.
       */
      React.createElement(
        View,
        {
          style:
            styles.infoBox,
        },

        React.createElement(
          Text,
          {
            style:
              styles.infoTitle,
          },

          getPeriodLabel(
            filters
          )
        ),

        React.createElement(
          Text,
          {
            style:
              styles.infoText,
          },

          getFilterLabel(
            filters
          )
        )
      ),

      /**
       * Statistiques.
       */
      React.createElement(
        View,
        {
          style:
            styles.summaryRow,
        },

        ...summaryCards
      ),

      React.createElement(
        Text,
        {
          style:
            styles.sectionTitle,
        },

        "Liste des dons confirmés"
      ),

      table,

      /**
       * Confidentialité.
       */
      React.createElement(
        Text,
        {
          style:
            styles.privacyNotice,
        },

        "Document administratif privé. Les montants proviennent uniquement des paiements confirmés côté serveur. Les devises sont présentées séparément. Les donateurs ayant demandé l'anonymat sont affichés comme anonymes dans ce rapport."
      ),

      /**
       * Pied de page répété.
       */
      React.createElement(
        View,
        {
          fixed:
            true,

          style:
            styles.footer,
        },

        React.createElement(
          Text,
          null,

          "Young Caring · Document administratif privé"
        ),

        React.createElement(
          Text,
          {
            render: ({
              pageNumber,
              totalPages,
            }) =>
              `Page ${pageNumber} / ${totalPages}`,
          }
        )
      )
    )
  );
}

/**
 * ============================================================================
 * GET /api/admin/rapports/pdf
 * ============================================================================
 */

export async function GET(
  request:
    NextRequest
): Promise<Response> {
  /**
   * Pour une API :
   * 401 au lieu d'une redirection HTML.
   */
  const session =
    await getAdminSession();

  if (
    !session
  ) {
    return jsonError(
      "UNAUTHORIZED",
      401
    );
  }

  let filters:
    ReportFilters;

  try {
    filters =
      parseFilters(
        request
      );
  } catch (
    error: unknown
  ) {
    if (
      error instanceof
      ReportRequestError
    ) {
      return jsonError(
        error.code,
        error.status
      );
    }

    return jsonError(
      "INVALID_REPORT_REQUEST",
      400
    );
  }

  const where =
    buildPaidWhere(
      filters
    );

  try {
    /**
     * On compte avant de charger
     * les lignes afin de protéger
     * la mémoire et le CPU.
     */
    const totalRows =
      await db
        .donationPayment
        .count({
          where,
        });

    /**
     * Un très gros rapport doit être
     * découpé par période.
     */
    if (
      totalRows >
      MAX_REPORT_ROWS
    ) {
      return jsonError(
        "REPORT_TOO_LARGE",
        422,
        {
          maximumRows:
            MAX_REPORT_ROWS,

          matchingRows:
            totalRows,
        }
      );
    }

    const rows:
      PdfRow[] =
      await db
        .donationPayment
        .findMany({
          where,

          orderBy: [
            {
              paidAt:
                "asc",
            },

            {
              id:
                "asc",
            },
          ],

          take:
            MAX_REPORT_ROWS,

          select: {
            id:
              true,

            reference:
              true,

            amount:
              true,

            currency:
              true,

            allocation:
              true,

            provider:
              true,

            donorFirstName:
              true,

            donorLastName:
              true,

            /**
             * Nécessaire uniquement au
             * comptage des donateurs uniques.
             */
            donorEmail:
              true,

            anonymous:
              true,

            paidAt:
              true,

            createdAt:
              true,

            receipt: {
              select: {
                status:
                  true,
              },
            },
          },
        });

    const generatedAt =
      new Date();

    const document =
      buildPdfDocument(
        rows,
        filters,
        generatedAt
      );

    const pdfBuffer =
      await renderToBuffer(
        document
      );

    if (
      !Buffer.isBuffer(
        pdfBuffer
      ) ||
      pdfBuffer.length ===
        0
    ) {
      console.error(
        "Admin donation report PDF generation returned an empty buffer."
      );

      return jsonError(
        "PDF_GENERATION_FAILED",
        500
      );
    }

    if (
      pdfBuffer.length >
      MAX_PDF_SIZE_BYTES
    ) {
      console.error(
        "Admin donation report PDF exceeded maximum size.",
        {
          sizeBytes:
            pdfBuffer.length,
        }
      );

      return jsonError(
        "PDF_TOO_LARGE",
        500
      );
    }

    const fileName =
      createFileName(
        filters,
        generatedAt
      );

    /**
     * Conversion explicite vers Uint8Array
     * pour la Web Response de Next.js.
     */
    const body =
      new Uint8Array(
        pdfBuffer
      );

    return new Response(
      body,
      {
        status:
          200,

        headers: {
          "Content-Type":
            PDF_MIME_TYPE,

          /**
           * Force le téléchargement.
           */
          "Content-Disposition":
            `attachment; filename="${fileName}"`,

          "Content-Length":
            String(
              body.byteLength
            ),

          /**
           * Rapport privé :
           * jamais de cache navigateur/CDN.
           */
          "Cache-Control":
            "private, no-store, max-age=0, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (
    error: unknown
  ) {
    /**
     * Ne jamais logger :
     *
     * - DATABASE_URL ;
     * - PAYMENT_SECRET_KEY ;
     * - informations personnelles ;
     * - contenu des transactions.
     */
    console.error(
      "Admin donation report PDF generation failed:",
      {
        name:
          error instanceof
          Error
            ? error.name
            : "UnknownError",
      }
    );

    return jsonError(
      "REPORT_GENERATION_FAILED",
      500
    );
  }
}