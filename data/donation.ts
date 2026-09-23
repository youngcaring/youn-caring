import type {
  DonationAllocation,
  DonationAllocationId,
  DonationCurrency,
  DonationCurrencyOption,
  DonationPaymentMethod,
} from "@/types/donation";

/*
 * ============================================================================
 * YOUNG CARING
 * CONFIGURATION PUBLIQUE DES DONS
 * ============================================================================
 *
 * Ce fichier centralise :
 *
 * - les images de la page de don ;
 * - les devises autorisées ;
 * - les montants suggérés ;
 * - les limites par devise ;
 * - les catégories générales de paiement ;
 * - les domaines pouvant être soutenus ;
 * - les fonctions publiques de lecture et de formatage.
 *
 * Ce fichier ne doit jamais contenir :
 *
 * - une clé API ;
 * - un secret webhook ;
 * - une référence privée de transaction ;
 * - des informations bancaires ;
 * - les identifiants privés d’un agrégateur.
 *
 * La disponibilité finale d’un moyen de paiement
 * reste vérifiée par Moneroo.
 * ============================================================================
 */

export type DonationLanguage =
  | "fr"
  | "en";

/*
 * Images disponibles dans le projet.
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
 * Tous les montants sont exprimés dans
 * l’unité principale de la devise.
 *
 * Exemples :
 *
 * - 5 000 représente 5 000 XOF ;
 * - 25 représente 25 EUR ;
 * - 50 représente 50 USD.
 */
export const donationCurrencyOptions = [
  {
  id: "XOF",
  symbol: "FCFA",
  labelFr: "Franc CFA",
  labelEn: "CFA franc",
  locale: "fr-FR",
  minimumAmount: 100,
  maximumAmount: 10_000_000,
  suggestedAmounts: [
    100,
    500,
    1_000,
    5_000,
    10_000,
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
 * Ces deux exports conservent le fonctionnement
 * historique basé sur le franc CFA.
 *
 * Pour les autres devises, utiliser :
 *
 * - getDonationAmounts();
 * - getDonationLimits().
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
 * Configuration publique d’une catégorie
 * générale de moyen de paiement.
 *
 * Les opérateurs précis disponibles sont
 * déterminés par Moneroo au moment du paiement.
 */
export type DonationPaymentMethodOption =
  Readonly<{
    id: DonationPaymentMethod;
    labelFr: string;
    labelEn: string;
    descriptionFr: string;
    descriptionEn: string;
    supportedCurrencies:
      readonly DonationCurrency[];
  }>;

/*
 * Catégories générales de paiement.
 *
 * Le type explicite est volontaire.
 *
 * Il empêche TypeScript de réduire
 * supportedCurrencies à un tuple contenant
 * uniquement "XOF".
 */
export const donationPaymentMethods:
  readonly DonationPaymentMethodOption[] = [
  {
    id: "card",
    labelFr: "Carte bancaire",
    labelEn: "Bank card",
    descriptionFr:
      "Paiement sécurisé par carte bancaire sur la page du prestataire.",
    descriptionEn:
      "Secure bank card payment on the provider’s page.",
    supportedCurrencies: [
      "XOF",
      "EUR",
      "USD",
    ],
  },
  {
    id: "mobile_money",
    labelFr: "Mobile Money",
    labelEn: "Mobile Money",
    descriptionFr:
      "Paiement avec un opérateur Mobile Money disponible dans votre pays.",
    descriptionEn:
      "Payment with a Mobile Money operator available in your country.",
    supportedCurrencies: [
      "XOF",
    ],
  },
];

/*
 * Domaines pouvant être sélectionnés
 * par le donateur.
 */
export const donationAllocations = [
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
] as const satisfies
  readonly DonationAllocation[];

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
 * XOF est utilisé comme valeur de secours.
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
    getDonationCurrencyOption(
      currency
    );

  return {
    minimum:
      option.minimumAmount,

    maximum:
      option.maximumAmount,
  };
}

/*
 * Retourne le symbole court
 * d’une devise.
 */
export function getDonationCurrencySymbol(
  currency: DonationCurrency
): string {
  return getDonationCurrencyOption(
    currency
  ).symbol;
}

/*
 * Retourne le nom traduit
 * d’une devise.
 */
export function getDonationCurrencyLabel(
  currency: DonationCurrency,
  language: DonationLanguage
): string {
  const option =
    getDonationCurrencyOption(
      currency
    );

  return language === "en"
    ? option.labelEn
    : option.labelFr;
}

/*
 * Vérifie qu’un montant est un entier sûr
 * et qu’il respecte les limites de la devise.
 *
 * Cette vérification côté interface doit toujours
 * être répétée côté serveur.
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
 * à une catégorie générale de paiement.
 */
export function isDonationPaymentMethod(
  value: unknown
): value is DonationPaymentMethod {
  return (
    typeof value === "string" &&
    donationPaymentMethods.some(
      (method) =>
        method.id === value
    )
  );
}

/*
 * Retourne la configuration publique
 * d’un moyen de paiement.
 */
export function getDonationPaymentMethod(
  id: DonationPaymentMethod
): DonationPaymentMethodOption | undefined {
  return donationPaymentMethods.find(
    (method) =>
      method.id === id
  );
}

/*
 * Retourne les catégories générales de paiement
 * compatibles avec une devise.
 *
 * Cette fonction sert uniquement à l’affichage.
 *
 * La disponibilité finale d’un opérateur
 * reste vérifiée par Moneroo.
 */
export function getDonationPaymentMethods(
  currency: DonationCurrency
): readonly DonationPaymentMethodOption[] {
  return donationPaymentMethods.filter(
    (method) =>
      method.supportedCurrencies.includes(
        currency
      )
  );
}

/*
 * Retourne le libellé traduit
 * d’un moyen de paiement.
 */
export function getDonationPaymentMethodLabel(
  method: DonationPaymentMethod,
  language: DonationLanguage
): string {
  const option =
    getDonationPaymentMethod(
      method
    );

  if (!option) {
    return "";
  }

  return language === "en"
    ? option.labelEn
    : option.labelFr;
}

/*
 * Retourne la description traduite
 * d’un moyen de paiement.
 */
export function getDonationPaymentMethodDescription(
  method: DonationPaymentMethod,
  language: DonationLanguage
): string {
  const option =
    getDonationPaymentMethod(
      method
    );

  if (!option) {
    return "";
  }

  return language === "en"
    ? option.descriptionEn
    : option.descriptionFr;
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
  language: DonationLanguage
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
 *
 * - 5 000 FCFA ;
 * - 25 € ;
 * - $50.
 *
 * Cette fonction ne réalise aucune conversion.
 * Elle affiche uniquement le montant reçu.
 */
export function formatDonationAmount(
  amount: number,
  language: DonationLanguage,
  currency: DonationCurrency = "XOF"
): string {
  if (
    !Number.isSafeInteger(amount) ||
    amount < 0
  ) {
    if (currency === "XOF") {
      return "0 FCFA";
    }

    if (currency === "EUR") {
      return "0 €";
    }

    return "$0";
  }

  if (currency === "XOF") {
    const formattedAmount =
      amount.toLocaleString(
        language === "fr"
          ? "fr-FR"
          : "en-US",
        {
          minimumFractionDigits: 0,
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
