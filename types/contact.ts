/*
 * Langues prises en charge par
 * le formulaire de contact.
 */

export type ContactLanguage =
  | "fr"
  | "en";

/*
 * Sujets disponibles dans le formulaire.
 */

export type ContactSubjectId =
  | "general"
  | "help"
  | "volunteer"
  | "partnership"
  | "donation"
  | "media";

/*
 * Moyens de contact affichés sur la page.
 */

export type ContactMethodId =
  | "phone"
  | "whatsapp"
  | "email"
  | "address";

/*
 * Valeurs principales du formulaire.
 *
 * Ces propriétés ne sont pas readonly
 * individuellement dans l’état React.
 * Le composant peut donc créer une nouvelle
 * version du formulaire sans erreur TypeScript.
 */

export type ContactFormValues = {
  fullName: string;
  email: string;
  phone: string;
  subject: ContactSubjectId;
  message: string;
};

/*
 * Champs pouvant produire une erreur
 * visible dans le formulaire.
 */

export type ContactFormField =
  keyof ContactFormValues;

/*
 * Erreurs directement liées aux champs
 * visibles du formulaire.
 */

export type ContactFormErrors =
  Partial<
    Record<
      ContactFormField,
      string
    >
  >;

/*
 * Erreurs complètes pouvant être retournées
 * par la validation serveur.
 *
 * website correspond au champ anti-robot.
 * general correspond à une erreur globale.
 */

export type ContactFieldErrors =
  Partial<
    Record<
      | ContactFormField
      | "website"
      | "general",
      string
    >
  >;

/*
 * Option affichée dans la liste des sujets.
 */

export type ContactSubjectOption =
  Readonly<{
    id: ContactSubjectId;
    labelFr: string;
    labelEn: string;
  }>;

/*
 * Moyen de contact affiché sur la page.
 */

export type ContactMethod =
  Readonly<{
    id: ContactMethodId;
    label: string;
    value: string;
    href: string;
    external: boolean;
  }>;

/*
 * Données envoyées par ContactForm.tsx
 * vers POST /api/contact.
 *
 * website est un champ invisible anti-robot.
 * Il doit rester vide pour un visiteur normal.
 */

export type ContactSubmissionRequest =
  Readonly<{
    fullName: string;
    email: string;
    phone: string;
    subject: ContactSubjectId;
    message: string;
    language: ContactLanguage;
    website?: string;
  }>;

/*
 * Données garanties après la validation serveur.
 *
 * Le téléphone reste facultatif.
 */

export type ValidatedContactMessage =
  Readonly<{
    fullName: string;
    email: string;
    phone: string | null;
    subject: ContactSubjectId;
    message: string;
    language: ContactLanguage;
  }>;

/*
 * Résultat retourné lorsque les informations
 * envoyées sont valides.
 */

export type ContactValidationSuccess =
  Readonly<{
    success: true;
    data: ValidatedContactMessage;
    errors: Readonly<
      Record<string, never>
    >;
  }>;

/*
 * Résultat retourné lorsque les informations
 * envoyées sont invalides.
 */

export type ContactValidationFailure =
  Readonly<{
    success: false;
    data: null;
    errors: ContactFieldErrors;
  }>;

/*
 * Résultat complet de la validation.
 */

export type ContactValidationResult =
  | ContactValidationSuccess
  | ContactValidationFailure;

/*
 * Codes publics pouvant être retournés
 * par la route de contact.
 *
 * Aucun détail technique sensible ne doit
 * être placé dans ces valeurs.
 */

export type ContactApiErrorCode =
  | "CONTACT_VALIDATION_FAILED"
  | "CONTACT_SERVICE_NOT_CONFIGURED"
  | "CONTACT_MESSAGE_DELIVERY_FAILED"
  | "CONTACT_SUBMISSION_FAILED"
  | "INVALID_REQUEST_ORIGIN"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "REQUEST_TOO_LARGE"
  | "EMPTY_REQUEST_BODY"
  | "INVALID_REQUEST_BODY"
  | "INVALID_JSON"
  | "TOO_MANY_CONTACT_REQUESTS"
  | "METHOD_NOT_ALLOWED";

/*
 * Réponse reçue après un envoi réussi.
 */

export type ContactSubmissionSuccessResponse =
  Readonly<{
    success: true;
    reference: string;
    acknowledgementEmailSent: boolean;
    message?: string;
  }>;

/*
 * Réponse reçue lorsque l’envoi échoue.
 */

export type ContactSubmissionErrorResponse =
  Readonly<{
    success: false;
    error: ContactApiErrorCode;
    message?: string;
    fieldErrors?: ContactFieldErrors;
  }>;

/*
 * Réponse complète de POST /api/contact.
 */

export type ContactSubmissionResponse =
  | ContactSubmissionSuccessResponse
  | ContactSubmissionErrorResponse;

/*
 * Résultat interne de l’envoi des deux emails.
 *
 * Les identifiants du fournisseur restent
 * uniquement disponibles côté serveur.
 */

export type ContactEmailDeliveryResult =
  Readonly<{
    adminEmailId: string;

    acknowledgementEmailId:
      | string
      | null;

    acknowledgementEmailSent:
      boolean;
  }>;

/*
 * États possibles du formulaire pendant
 * son utilisation.
 */

export type ContactSubmissionStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";