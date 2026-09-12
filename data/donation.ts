import type {
  DonationAllocation,
  DonationAllocationId,
  DonationCurrency,
  DonationCurrencyOption,
} from "@/types/donation";

/*
 * Images déjà disponibles dans le projet.
 */
export const donationPageImages = {
  hero:
    "/images/home/donation-background.jpg",

  callToAction:
    "/images/actions/actions-donation-banner.jpg",
} as const;

/*
 * Configuration des devises disponibles.
 *
 * Chaque devise possède :
 * - ses propres montants suggérés ;
 * - son montant minimum ;
 * - son montant maximum ;
 * - son symbole d’affichage ;
 * - sa locale de formatage.
 *
 * Les montants restent exprimés dans l’unité
 * principale de chaque devise.
 */
export const donationCurrencyOptions =
  [
    {
      id: "XOF",
      symbol: "FCFA",
      labelFr: "Franc CFA",
      labelEn: "CFA franc",
      locale: "fr-FR",
      minimumAmount: 1_000,
      maximumAmount: 10_000_000,
      suggestedAmounts: [
        5_000,
        10_000,
        25_000,
        50_000,
        100_000,
      ],
    },
    {
      id: "EUR",
      symbol: "€",
      labelFr: "Euro",
      labelEn: "Euro",
      locale: "fr-FR",
      minimumAmount: 5,
      maximumAmount: 20_000,
      suggestedAmounts: [
        10,
        25,
        50,
        100,
        250,
      ],
    },
    {
      id: "USD",
      symbol: "$",
      labelFr: "Dollar américain",
      labelEn: "US dollar",
      locale: "en-US",
      minimumAmount: 5,
      maximumAmount: 20_000,
      suggestedAmounts: [
        10,
        25,
        50,
        100,
        250,
      ],
    },
  ] as const satisfies
    readonly DonationCurrencyOption[];

/*
 * Devise sélectionnée par défaut.
 */
export const defaultDonationCurrency:
  DonationCurrency = "XOF";

/*
 * Compatibilité avec les composants existants.
 *
 * Ces deux exports conservent le format précédent
 * basé sur le franc CFA. Ils pourront continuer
 * à être utilisés pendant la mise à jour progressive
 * des composants du formulaire.
 */
export const donationAmounts =
  donationCurrencyOptions[0]
    .suggestedAmounts;

export const donationLimits = {
  minimum:
    donationCurrencyOptions[0]
      .minimumAmount,

  maximum:
    donationCurrencyOptions[0]
      .maximumAmount,
} as const;

/*
 * Domaines pouvant être sélectionnés.
 */
export const donationAllocations:
  readonly DonationAllocation[] = [
  {
    id: "priority",
    labelFr: "Action prioritaire",
    labelEn: "Priority action",
  },
  {
    id: "education",
    labelFr: "Éducation",
    labelEn: "Education",
  },
  {
    id: "foodSupport",
    labelFr: "Aide alimentaire",
    labelEn: "Food support",
  },
  {
    id: "health",
    labelFr: "Santé",
    labelEn: "Health",
  },
  {
    id: "clothing",
    labelFr: "Vêtements et kits",
    labelEn: "Clothing and kits",
  },
  {
    id: "children",
    labelFr: "Enfance",
    labelEn: "Children",
  },
  {
    id: "womenFamilies",
    labelFr: "Femmes et familles",
    labelEn: "Women and families",
  },
  {
    id: "waterHygiene",
    labelFr: "Eau et hygiène",
    labelEn: "Water and hygiene",
  },
  {
    id: "emergency",
    labelFr: "Urgences",
    labelEn: "Emergencies",
  },
];

/*
 * Vérifie qu’une valeur correspond
 * à une devise autorisée.
 */
export function isDonationCurrency(
  value: unknown
): value is DonationCurrency {
  return (
    typeof value === "string" &&
    donationCurrencyOptions.some(
      (currency) =>
        currency.id === value
    )
  );
}

/*
 * Retourne la configuration d’une devise.
 *
 * XOF est utilisé comme valeur de secours si
 * une valeur incorrecte atteint cette fonction.
 */
export function getDonationCurrencyOption(
  currency: DonationCurrency
): DonationCurrencyOption {
  return (
    donationCurrencyOptions.find(
      (option) =>
        option.id === currency
    ) ??
    donationCurrencyOptions[0]
  );
}

/*
 * Retourne les montants suggérés
 * pour une devise précise.
 */
export function getDonationAmounts(
  currency: DonationCurrency
): readonly number[] {
  return getDonationCurrencyOption(
    currency
  ).suggestedAmounts;
}

/*
 * Retourne les limites autorisées
 * pour une devise précise.
 */
export function getDonationLimits(
  currency: DonationCurrency
): Readonly<{
  minimum: number;
  maximum: number;
}> {
  const option =
    getDonationCurrencyOption(currency);

  return {
    minimum: option.minimumAmount,
    maximum: option.maximumAmount,
  };
}

/*
 * Retourne le symbole court d’une devise.
 */
export function getDonationCurrencySymbol(
  currency: DonationCurrency
): string {
  return getDonationCurrencyOption(
    currency
  ).symbol;
}

/*
 * Retourne le nom traduit d’une devise.
 */
export function getDonationCurrencyLabel(
  currency: DonationCurrency,
  language: "fr" | "en"
): string {
  const option =
    getDonationCurrencyOption(currency);

  return language === "en"
    ? option.labelEn
    : option.labelFr;
}

/*
 * Vérifie qu’un montant est un entier sûr
 * et qu’il respecte les limites de la devise.
 *
 * Cette vérification côté interface devra être
 * répétée côté serveur avant tout paiement.
 */
export function isValidDonationAmount(
  amount: unknown,
  currency: DonationCurrency
): amount is number {
  if (
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount)
  ) {
    return false;
  }

  const limits =
    getDonationLimits(currency);

  return (
    amount >= limits.minimum &&
    amount <= limits.maximum
  );
}

/*
 * Vérifie qu’une valeur correspond
 * à un domaine autorisé.
 */
export function isDonationAllocationId(
  value: unknown
): value is DonationAllocationId {
  return (
    typeof value === "string" &&
    donationAllocations.some(
      (allocation) =>
        allocation.id === value
    )
  );
}

/*
 * Retourne un domaine précis.
 */
export function getDonationAllocation(
  id: DonationAllocationId
): DonationAllocation | undefined {
  return donationAllocations.find(
    (allocation) =>
      allocation.id === id
  );
}

/*
 * Retourne le libellé du domaine
 * dans la langue demandée.
 */
export function getDonationAllocationLabel(
  id: DonationAllocationId,
  language: "fr" | "en"
): string {
  const allocation =
    getDonationAllocation(id);

  if (!allocation) {
    return "";
  }

  return language === "en"
    ? allocation.labelEn
    : allocation.labelFr;
}

/*
 * Formate un montant avec sa devise.
 *
 * Exemples :
 * - 5 000 FCFA
 * - 25 €
 * - $50
 *
 * Cette fonction ne réalise aucune conversion.
 * Elle affiche uniquement le montant reçu.
 */
export function formatDonationAmount(
  amount: number,
  language: "fr" | "en",
  currency: DonationCurrency = "XOF"
): string {
  if (
    !Number.isSafeInteger(amount) ||
    amount < 0
  ) {
    return currency === "XOF"
      ? "0 FCFA"
      : currency === "EUR"
        ? "0 €"
        : "$0";
  }

  if (currency === "XOF") {
    const formattedAmount =
      amount.toLocaleString(
        language === "fr"
          ? "fr-FR"
          : "en-US",
        {
          maximumFractionDigits: 0,
        }
      );

    return `${formattedAmount} FCFA`;
  }

  return new Intl.NumberFormat(
    language === "fr"
      ? "fr-FR"
      : "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(amount);
}