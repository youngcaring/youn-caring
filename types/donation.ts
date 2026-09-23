/**
 * ============================================================================
 * YOUNG CARING
 * TYPES DU SYSTÈME DE DONS, PAIEMENTS ET REÇUS
 * ============================================================================
 *
 * Ce fichier contient uniquement des contrats TypeScript.
 *
 * Il ne doit jamais :
 *
 * - appeler directement un prestataire de paiement ;
 * - accéder aux variables d’environnement ;
 * - lire ou écrire dans la base de données ;
 * - contenir une clé API ;
 * - contenir un secret webhook ;
 * - contenir des informations bancaires ;
 * - générer directement un reçu PDF ;
 * - envoyer directement un e-mail.
 *
 * Les numéros de carte, codes secrets et mots de passe
 * Mobile Money sont saisis uniquement sur la page
 * sécurisée du prestataire de paiement.
 * ============================================================================
 */

/**
 * Langues prises en charge par le système de don.
 */
export type DonationLanguage =
  | "fr"
  | "en";

/**
 * Devises autorisées.
 */
export type DonationCurrency =
  | "XOF"
  | "EUR"
  | "USD";

/**
 * Symboles utilisés uniquement pour l’affichage.
 */
export type DonationCurrencySymbol =
  | "FCFA"
  | "€"
  | "$";

/**
 * Configuration publique d’une devise.
 *
 * Chaque devise possède ses propres limites.
 * Aucune conversion monétaire n’est réalisée ici.
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
    suggestedAmounts:
      readonly number[];
  }>;

/**
 * Fréquence déclarée d’une contribution.
 *
 * La valeur monthly ne signifie pas automatiquement
 * qu’un abonnement a été créé chez le prestataire.
 */
export type DonationFrequency =
  | "once"
  | "monthly";

/**
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

/**
 * Configuration publique d’un domaine.
 */
export type DonationAllocation =
  Readonly<{
    id: DonationAllocationId;
    labelFr: string;
    labelEn: string;
  }>;

/**
 * Catégories générales de moyens de paiement.
 *
 * Le moyen exact disponible est déterminé par Moneroo
 * selon le pays, la devise et les connexions activées.
 */
export type DonationPaymentMethod =
  | "card"
  | "mobile_money";

/**
 * Informations brutes saisies dans le formulaire.
 *
 * Aucune donnée bancaire ne doit être ajoutée ici.
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

/**
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

/**
 * Données envoyées par le formulaire vers
 * la route de création du paiement.
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

/**
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

/**
 * Erreurs pouvant être affichées dans
 * le formulaire de don.
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

/**
 * Résultat de la validation serveur.
 */
export type DonationValidationResult =
  | Readonly<{
      success: true;
      data:
        ValidatedDonationCheckout;
      errors: Readonly<
        Record<string, never>
      >;
    }>
  | Readonly<{
      success: false;
      data: null;
      errors: DonationFieldErrors;
    }>;

/**
 * Réponse retournée au formulaire par
 * la route de création du paiement.
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

/**
 * Statuts internes possibles pour un paiement.
 *
 * Seul paid permet de considérer le don
 * comme définitivement confirmé.
 */
export type DonationPaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

/**
 * Statuts définitifs d’un paiement.
 */
export type DonationPaymentFinalStatus =
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

/**
 * Prestataires reconnus.
 *
 * Moneroo est le prestataire principal.
 *
 * Les anciens noms restent disponibles pour
 * ne pas casser les adaptateurs existants.
 */
export type DonationPaymentProviderName =
  | "moneroo"
  | "fedapay"
  | "kkiapay"
  | "paydunya"
  | "stripe";

/**
 * Données transmises à l’adaptateur
 * du prestataire de paiement.
 */
export type CreatePaymentSessionInput =
  Readonly<{
    reference: string;
    donation:
      ValidatedDonationCheckout;
    successUrl: string;
    cancelUrl: string;
  }>;

/**
 * Résultat sécurisé retourné après
 * la création d’une session de paiement.
 */
export type PaymentSessionResult =
  Readonly<{
    provider:
      DonationPaymentProviderName;

    /**
     * Référence interne Young Caring.
     */
    reference: string;

    /**
     * Identifiant attribué par le prestataire.
     */
    providerReference: string;

    /**
     * Adresse HTTPS de la page sécurisée
     * du prestataire.
     */
    checkoutUrl: string;

    status: "pending";
  }>;

/**
 * Résultat normalisé de vérification
 * d’une transaction.
 *
 * Le serveur doit comparer :
 *
 * - la référence interne ;
 * - la référence du prestataire ;
 * - le montant ;
 * - la devise ;
 * - le statut.
 */
export type PaymentVerificationResult =
  Readonly<{
    provider:
      DonationPaymentProviderName;
    reference: string;
    providerReference:
      string | null;
    amount: number;
    currency: DonationCurrency;
    status:
      DonationPaymentStatus;
  }>;

/**
 * Événement normalisé après lecture
 * d’un webhook de paiement.
 *
 * Un webhook ne confirme jamais directement
 * un paiement. Une vérification auprès du
 * prestataire reste obligatoire.
 */
export type DonationPaymentWebhookEvent =
  Readonly<{
    provider:
      DonationPaymentProviderName;

    eventId:
      string | null;

    providerReference:
      string;

    eventType:
      string | null;
  }>;

/**
 * Paiement conservé dans le stockage interne.
 *
 * Les noms du donateur sont nécessaires à la
 * production du reçu PDF privé.
 */
export type DonationPaymentRecord =
  Readonly<{
    id: string;

    /**
     * Référence interne Young Caring.
     */
    reference: string;

    provider:
      DonationPaymentProviderName;

    /**
     * Référence Moneroo ou autre prestataire.
     *
     * Elle peut être absente avant la création
     * réussie de la session de paiement.
     */
    providerReference:
      string | null;

    amount: number;
    currency: DonationCurrency;
    frequency:
      DonationFrequency;
    allocation:
      DonationAllocationId;

    donorFirstName: string;
    donorLastName: string;
    donorEmail: string;
    donorPhone: string | null;
    donorCountry: string | null;
    anonymous: boolean;

    status:
      DonationPaymentStatus;

    createdAt: Date;
    updatedAt: Date;
    paidAt: Date | null;
  }>;

/**
 * Données nécessaires à la création
 * d’un paiement interne.
 */
export type CreateDonationPaymentRecordInput =
  Readonly<{
    reference: string;

    provider:
      DonationPaymentProviderName;

    amount: number;
    currency: DonationCurrency;
    frequency:
      DonationFrequency;
    allocation:
      DonationAllocationId;

    donorFirstName: string;
    donorLastName: string;
    donorEmail: string;
    donorPhone: string | null;
    donorCountry: string | null;
    anonymous: boolean;
  }>;

/**
 * Données autorisées lors de la mise à jour
 * d’un paiement.
 */
export type UpdateDonationPaymentRecordInput =
  Readonly<{
    providerReference?: string;
    status?:
      DonationPaymentStatus;
    paidAt?: Date | null;
  }>;

/**
 * Résultat public de consultation du statut.
 *
 * Aucune information personnelle du donateur
 * ne doit être retournée.
 */
export type DonationPaymentStatusResponse =
  Readonly<{
    success: boolean;
    reference?: string;
    status?:
      DonationPaymentStatus;
    amount?: number;
    currency?:
      DonationCurrency;
    error?: string;
  }>;

/**
 * Statuts internes du traitement d’un webhook.
 */
export type DonationWebhookStatus =
  | "received"
  | "processing"
  | "processed"
  | "ignored"
  | "failed";

/**
 * Événement webhook conservé dans la base.
 *
 * Le corps brut complet n’est jamais conservé.
 */
export type DonationWebhookRecord =
  Readonly<{
    id: string;

    provider:
      DonationPaymentProviderName;

    eventId:
      string | null;

    deduplicationKey:
      string;

    providerReference:
      string;

    eventType:
      string | null;

    payloadHash:
      string;

    signatureVerified:
      boolean;

    status:
      DonationWebhookStatus;

    attemptCount:
      number;

    lastError:
      string | null;

    paymentId:
      string | null;

    receivedAt:
      Date;

    processingStartedAt:
      Date | null;

    processedAt:
      Date | null;

    createdAt:
      Date;

    updatedAt:
      Date;
  }>;

/**
 * Données nécessaires à l’enregistrement
 * sécurisé d’un webhook.
 */
export type CreateDonationWebhookRecordInput =
  Readonly<{
    provider:
      DonationPaymentProviderName;

    eventId:
      string | null;

    deduplicationKey:
      string;

    providerReference:
      string;

    eventType:
      string | null;

    payloadHash:
      string;

    signatureVerified:
      boolean;

    paymentId?:
      string | null;
  }>;

/**
 * Données autorisées lors de la mise à jour
 * d’un événement webhook.
 */
export type UpdateDonationWebhookRecordInput =
  Readonly<{
    status?:
      DonationWebhookStatus;

    attemptCount?:
      number;

    lastError?:
      string | null;

    paymentId?:
      string | null;

    processingStartedAt?:
      Date | null;

    processedAt?:
      Date | null;
  }>;

/**
 * Langue du reçu PDF et de l’e-mail.
 */
export type DonationReceiptLanguage =
  DonationLanguage;

/**
 * Statut de génération du reçu PDF.
 */
export type DonationReceiptStatus =
  | "pending"
  | "generating"
  | "ready"
  | "failed";

/**
 * Statut d’envoi de l’e-mail contenant le reçu.
 */
export type DonationReceiptEmailStatus =
  | "pending"
  | "sending"
  | "sent"
  | "failed";

/**
 * Reçu conservé dans le stockage interne.
 *
 * Le contenu binaire du PDF n’est pas enregistré
 * directement dans PostgreSQL.
 */
export type DonationReceiptRecord =
  Readonly<{
    id: string;

    /**
     * Numéro officiel du reçu.
     */
    receiptNumber:
      string;

    /**
     * Identifiant du paiement associé.
     */
    paymentId:
      string;

    language:
      DonationReceiptLanguage;

    status:
      DonationReceiptStatus;

    /**
     * Clé privée du PDF dans le stockage.
     *
     * Elle ne doit pas être une URL publique
     * permanente.
     */
    pdfStorageKey:
      string | null;

    /**
     * Empreinte SHA-256 du PDF.
     */
    pdfSha256:
      string | null;

    /**
     * Taille du document en octets.
     */
    pdfSizeBytes:
      number | null;

    pdfGeneratedAt:
      Date | null;

    generationError:
      string | null;

    emailStatus:
      DonationReceiptEmailStatus;

    emailRecipient:
      string;

    /**
     * Identifiant du message retourné par Resend.
     */
    emailProviderMessageId:
      string | null;

    emailAttemptCount:
      number;

    emailLastAttemptAt:
      Date | null;

    emailSentAt:
      Date | null;

    emailLastError:
      string | null;

    createdAt:
      Date;

    updatedAt:
      Date;
  }>;

/**
 * Données nécessaires à la création
 * d’un reçu.
 *
 * Un reçu ne doit être créé que pour
 * un paiement réellement confirmé.
 */
export type CreateDonationReceiptRecordInput =
  Readonly<{
    receiptNumber:
      string;

    paymentId:
      string;

    language:
      DonationReceiptLanguage;

    emailRecipient:
      string;
  }>;

/**
 * Données autorisées lors de la mise à jour
 * de la génération du PDF.
 */
export type UpdateDonationReceiptPdfInput =
  Readonly<{
    status?:
      DonationReceiptStatus;

    pdfStorageKey?:
      string | null;

    pdfSha256?:
      string | null;

    pdfSizeBytes?:
      number | null;

    pdfGeneratedAt?:
      Date | null;

    generationError?:
      string | null;
  }>;

/**
 * Données autorisées lors de la mise à jour
 * de l’envoi de l’e-mail.
 */
export type UpdateDonationReceiptEmailInput =
  Readonly<{
    emailStatus?:
      DonationReceiptEmailStatus;

    emailProviderMessageId?:
      string | null;

    emailAttemptCount?:
      number;

    emailLastAttemptAt?:
      Date | null;

    emailSentAt?:
      Date | null;

    emailLastError?:
      string | null;
  }>;

/**
 * Données utilisées pour générer le reçu PDF.
 *
 * Ces informations sont privées et doivent
 * rester exclusivement côté serveur.
 */
export type DonationReceiptDocumentData =
  Readonly<{
    receiptNumber:
      string;

    donationReference:
      string;

    providerReference:
      string;

    donorFirstName:
      string;

    donorLastName:
      string;

    donorEmail:
      string;

    donorCountry:
      string | null;

    anonymous:
      boolean;

    amount:
      number;

    currency:
      DonationCurrency;

    frequency:
      DonationFrequency;

    allocation:
      DonationAllocationId;

    paidAt:
      Date;

    language:
      DonationReceiptLanguage;
  }>;

/**
 * Résultat de la génération du reçu PDF.
 */
export type DonationReceiptPdfResult =
  Readonly<{
    receiptNumber:
      string;

    storageKey:
      string;

    sha256:
      string;

    sizeBytes:
      number;

    generatedAt:
      Date;
  }>;

/**
 * Résultat de l’envoi du reçu par e-mail.
 */
export type DonationReceiptEmailResult =
  Readonly<{
    recipient:
      string;

    providerMessageId:
      string;

    sentAt:
      Date;
  }>;

/**
 * Contrat que doit respecter chaque adaptateur
 * de paiement.
 */
export interface DonationPaymentProvider {
  readonly name:
    DonationPaymentProviderName;

  /**
   * Crée une session de paiement et retourne
   * l’adresse de redirection sécurisée.
   */
  createPaymentSession(
    input:
      CreatePaymentSessionInput
  ): Promise<PaymentSessionResult>;

  /**
   * Vérifie une transaction directement
   * auprès du prestataire.
   */
  verifyPayment(
    providerReference: string
  ): Promise<PaymentVerificationResult>;

  /**
   * Vérifie la signature du corps brut
   * reçu par la route webhook.
   */
  verifyWebhookSignature(
    rawBody: string,
    signature: string
  ): Promise<boolean>;
}

/**
 * Contrat du stockage interne des paiements.
 *
 * L’implémentation doit utiliser PostgreSQL.
 * Une Map JavaScript ne doit pas être utilisée
 * en production.
 */
export interface DonationPaymentStore {
  create(
    input:
      CreateDonationPaymentRecordInput
  ): Promise<DonationPaymentRecord>;

  findByReference(
    reference: string
  ): Promise<
    DonationPaymentRecord | null
  >;

  findByProviderReference(
    providerReference: string
  ): Promise<
    DonationPaymentRecord | null
  >;

  updateByReference(
    reference: string,
    input:
      UpdateDonationPaymentRecordInput
  ): Promise<DonationPaymentRecord>;
}

/**
 * Contrat du stockage interne des webhooks.
 */
export interface DonationWebhookStore {
  create(
    input:
      CreateDonationWebhookRecordInput
  ): Promise<DonationWebhookRecord>;

  findByDeduplicationKey(
    deduplicationKey: string
  ): Promise<
    DonationWebhookRecord | null
  >;

  updateById(
    id: string,
    input:
      UpdateDonationWebhookRecordInput
  ): Promise<DonationWebhookRecord>;
}

/**
 * Contrat du stockage interne des reçus.
 */
export interface DonationReceiptStore {
  create(
    input:
      CreateDonationReceiptRecordInput
  ): Promise<DonationReceiptRecord>;

  findByReceiptNumber(
    receiptNumber: string
  ): Promise<
    DonationReceiptRecord | null
  >;

  findByPaymentId(
    paymentId: string
  ): Promise<
    DonationReceiptRecord | null
  >;

  updatePdfByReceiptNumber(
    receiptNumber: string,
    input:
      UpdateDonationReceiptPdfInput
  ): Promise<DonationReceiptRecord>;

  updateEmailByReceiptNumber(
    receiptNumber: string,
    input:
      UpdateDonationReceiptEmailInput
  ): Promise<DonationReceiptRecord>;
}