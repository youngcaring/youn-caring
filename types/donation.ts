/*
 * Devises autorisées pour les dons.
 *
 * XOF correspond au franc CFA BCEAO.
 * EUR correspond à l’euro.
 * USD correspond au dollar américain.
 */
export type DonationCurrency =
  | "XOF"
  | "EUR"
  | "USD";

/*
 * Symbole utilisé pour afficher une devise.
 */
export type DonationCurrencySymbol =
  | "FCFA"
  | "€"
  | "$";

/*
 * Configuration publique d’une devise.
 *
 * Les montants proposés et les limites sont définis
 * séparément pour chaque devise afin de ne jamais
 * remplacer uniquement le symbole d’un montant.
 */
export type DonationCurrencyOption =
  Readonly<{
    id: DonationCurrency;
    symbol: DonationCurrencySymbol;
    labelFr: string;
    labelEn: string;
    locale: string;
    minimumAmount: number;
    maximumAmount: number;
    suggestedAmounts: readonly number[];
  }>;

/*
 * Fréquence d’une contribution.
 */
export type DonationFrequency =
  | "once"
  | "monthly";

/*
 * Domaines pouvant être soutenus.
 */
export type DonationAllocationId =
  | "priority"
  | "education"
  | "foodSupport"
  | "health"
  | "clothing"
  | "children"
  | "womenFamilies"
  | "waterHygiene"
  | "emergency";

export type DonationAllocation =
  Readonly<{
    id: DonationAllocationId;
    labelFr: string;
    labelEn: string;
  }>;

/*
 * Informations saisies dans le formulaire.
 *
 * Aucun numéro de carte, code secret, mot de passe
 * ou autre champ bancaire ne doit être ajouté ici.
 */
export type DonationDonor =
  Readonly<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    anonymous: boolean;
    consent: boolean;
  }>;

/*
 * Informations du donateur après nettoyage
 * et validation par le serveur.
 */
export type ValidatedDonationDonor =
  Readonly<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    country: string | null;
    anonymous: boolean;
    consent: true;
  }>;

/*
 * Données envoyées depuis le formulaire
 * vers /api/donations/checkout.
 *
 * La devise doit toujours être transmise avec
 * le montant réellement choisi.
 */
export type DonationCheckoutRequest =
  Readonly<{
    frequency: DonationFrequency;
    amount: number;
    currency: DonationCurrency;
    allocation: DonationAllocationId;

    donor: Readonly<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      country: string | null;
      anonymous: boolean;
      consent: boolean;
    }>;
  }>;

/*
 * Données garanties après validation serveur.
 */
export type ValidatedDonationCheckout =
  Readonly<{
    frequency: DonationFrequency;
    amount: number;
    currency: DonationCurrency;
    allocation: DonationAllocationId;
    donor: ValidatedDonationDonor;
  }>;

/*
 * Erreurs pouvant être affichées dans
 * le formulaire de don.
 *
 * Ce type reste en lecture seule. Pour ajouter
 * une erreur, le code doit créer un nouvel objet
 * avec la syntaxe :
 *
 * {
 *   ...errors,
 *   email: "Message"
 * }
 */
export type DonationFieldErrors =
  Readonly<
    Partial<{
      frequency: string;
      amount: string;
      currency: string;
      allocation: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      country: string;
      consent: string;
      general: string;
    }>
  >;

/*
 * Résultat de la validation serveur.
 */
export type DonationValidationResult =
  | Readonly<{
      success: true;
      data: ValidatedDonationCheckout;
      errors: Readonly<
        Record<string, never>
      >;
    }>
  | Readonly<{
      success: false;
      data: null;
      errors: DonationFieldErrors;
    }>;

/*
 * Réponse retournée au formulaire
 * par /api/donations/checkout.
 */
export type DonationCheckoutResponse =
  Readonly<{
    success: boolean;
    checkoutUrl?: string;
    reference?: string;
    error?: string;
    fieldErrors?:
      DonationFieldErrors;
  }>;

/*
 * Statuts internes possibles
 * pour une transaction.
 */
export type DonationPaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

/*
 * Prestataires de paiement envisagés.
 *
 * Un seul prestataire doit être configuré
 * et activé en production.
 */
export type DonationPaymentProviderName =
  | "fedapay"
  | "kkiapay"
  | "paydunya"
  | "stripe";

/*
 * Données envoyées à l’adaptateur
 * du prestataire de paiement.
 */
export type CreatePaymentSessionInput =
  Readonly<{
    reference: string;
    donation: ValidatedDonationCheckout;
    successUrl: string;
    cancelUrl: string;
  }>;

/*
 * Résultat sécurisé retourné par le prestataire
 * après la création d’une session de paiement.
 */
export type PaymentSessionResult =
  Readonly<{
    provider:
      DonationPaymentProviderName;
    reference: string;
    providerReference: string;
    checkoutUrl: string;
    status: "pending";
  }>;

/*
 * Résultat de vérification d’une transaction.
 *
 * Le montant et la devise reçus du prestataire
 * doivent être comparés avec la transaction attendue
 * avant de confirmer définitivement le paiement.
 */
export type PaymentVerificationResult =
  Readonly<{
    provider:
      DonationPaymentProviderName;
    reference: string;
    providerReference: string | null;
    amount: number;
    currency: DonationCurrency;
    status: DonationPaymentStatus;
  }>;

/*
 * Contrat que doit respecter chaque véritable
 * adaptateur de paiement.
 *
 * Les données bancaires sont collectées uniquement
 * sur la page sécurisée du prestataire.
 */
export interface DonationPaymentProvider {
  readonly name:
    DonationPaymentProviderName;

  createPaymentSession(
    input: CreatePaymentSessionInput
  ): Promise<PaymentSessionResult>;

  verifyPayment(
    providerReference: string
  ): Promise<PaymentVerificationResult>;

  verifyWebhookSignature(
    rawBody: string,
    signature: string
  ): Promise<boolean>;
}