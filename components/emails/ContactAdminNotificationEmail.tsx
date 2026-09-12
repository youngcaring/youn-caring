import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type ContactAdminNotificationEmailProps =
  Readonly<{
    reference: string;
    fullName: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    language: "fr" | "en";
    receivedAt: string;
  }>;

export default function ContactAdminNotificationEmail({
  reference,
  fullName,
  email,
  phone,
  subject,
  message,
  language,
  receivedAt,
}: ContactAdminNotificationEmailProps) {
  const replyUrl = `mailto:${encodeURIComponent(
    email
  )}?subject=${encodeURIComponent(
    `Re: ${subject} — ${reference}`
  )}`;

  return (
    <Html lang="fr">
      <Head />

      <Preview>
        Nouveau message reçu de {fullName} —{" "}
        {reference}
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>
              YOUNG CARING
            </Text>

            <Text style={styles.headerText}>
              Nouveau message reçu
            </Text>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.label}>
              FORMULAIRE DE CONTACT
            </Text>

            <Heading
              as="h1"
              style={styles.heading}
            >
              Une personne vient de vous écrire
            </Heading>

            <Text style={styles.introduction}>
              Un nouveau message a été envoyé depuis
              le formulaire de contact du site Young
              Caring.
            </Text>

            <Section
              style={styles.referenceBox}
            >
              <Text
                style={styles.referenceLabel}
              >
                Référence
              </Text>

              <Text
                style={styles.referenceValue}
              >
                {reference}
              </Text>
            </Section>

            <Section style={styles.details}>
              <DetailRow
                label="Nom complet"
                value={fullName}
              />

              <DetailRow
                label="Adresse email"
                value={email}
              />

              <DetailRow
                label="Téléphone"
                value={
                  phone ||
                  "Non renseigné"
                }
              />

              <DetailRow
                label="Sujet"
                value={subject}
              />

              <DetailRow
                label="Langue du formulaire"
                value={
                  language === "en"
                    ? "Anglais"
                    : "Français"
                }
              />

              <DetailRow
                label="Date de réception"
                value={receivedAt}
                last
              />
            </Section>

            <Heading
              as="h2"
              style={styles.subheading}
            >
              Message
            </Heading>

            <Section style={styles.messageBox}>
              <Text style={styles.message}>
                {message}
              </Text>
            </Section>

            <Section style={styles.buttonSection}>
              <Button
                href={replyUrl}
                style={styles.button}
              >
                Répondre à cette personne
              </Button>
            </Section>

            <Text style={styles.securityNotice}>
              Par mesure de sécurité, ne demandez
              jamais de mot de passe, de code secret
              ou d’informations bancaires par email.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Notification automatique du site Young
              Caring.
            </Text>

            <Text style={styles.footerText}>
              Vous recevez cet email parce que votre
              adresse est configurée pour recevoir
              les demandes de contact.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

type DetailRowProps = Readonly<{
  label: string;
  value: string;
  last?: boolean;
}>;

function DetailRow({
  label,
  value,
  last = false,
}: DetailRowProps) {
  return (
    <Section
      style={{
        ...styles.detailRow,
        ...(last
          ? styles.lastDetailRow
          : {}),
      }}
    >
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </Section>
  );
}

const styles = {
  body: {
    margin: "0",
    padding: "0",
    backgroundColor: "#f3f7f7",
    color: "#101719",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "640px",
    margin: "32px auto",
    overflow: "hidden",
    border: "1px solid #dfe7e8",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
  },

  header: {
    padding: "24px 32px",
    backgroundColor: "#092124",
  },

  brand: {
    margin: "0",
    color: "#42d1dc",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1.6px",
  },

  headerText: {
    margin: "8px 0 0",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
  },

  content: {
    padding: "32px",
  },

  label: {
    margin: "0",
    color: "#0097a7",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.2px",
  },

  heading: {
    margin: "10px 0 0",
    color: "#101719",
    fontSize: "28px",
    lineHeight: "36px",
  },

  introduction: {
    margin: "16px 0 0",
    color: "#5f6d70",
    fontSize: "15px",
    lineHeight: "24px",
  },

  referenceBox: {
    marginTop: "24px",
    padding: "18px",
    border: "1px solid #bfe5e8",
    borderRadius: "14px",
    backgroundColor: "#eaf8f9",
  },

  referenceLabel: {
    margin: "0",
    color: "#537174",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform:
      "uppercase" as const,
  },

  referenceValue: {
    margin: "6px 0 0",
    color: "#007d88",
    fontSize: "18px",
    fontWeight: "700",
    overflowWrap:
      "anywhere" as const,
  },

  details: {
    marginTop: "24px",
    border: "1px solid #e2e9ea",
    borderRadius: "14px",
  },

  detailRow: {
    padding: "14px 18px",
    borderBottom:
      "1px solid #e8eeee",
  },

  lastDetailRow: {
    borderBottom: "none",
  },

  detailLabel: {
    margin: "0",
    color: "#647275",
    fontSize: "12px",
    fontWeight: "700",
  },

  detailValue: {
    margin: "5px 0 0",
    color: "#101719",
    fontSize: "15px",
    lineHeight: "22px",
    overflowWrap:
      "anywhere" as const,
  },

  subheading: {
    margin: "28px 0 12px",
    color: "#101719",
    fontSize: "18px",
    lineHeight: "26px",
  },

  messageBox: {
    padding: "18px",
    borderLeft:
      "4px solid #0097a7",
    borderRadius: "0 12px 12px 0",
    backgroundColor: "#f6f9f9",
  },

  message: {
    margin: "0",
    color: "#334144",
    fontSize: "15px",
    lineHeight: "25px",
    whiteSpace:
      "pre-wrap" as const,
    overflowWrap:
      "anywhere" as const,
  },

  buttonSection: {
    marginTop: "26px",
    textAlign: "center" as const,
  },

  button: {
    display: "inline-block",
    padding: "14px 24px",
    borderRadius: "999px",
    backgroundColor: "#f36c16",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    textDecoration: "none",
  },

  securityNotice: {
    margin: "26px 0 0",
    color: "#6b7779",
    fontSize: "12px",
    lineHeight: "19px",
    textAlign: "center" as const,
  },

  divider: {
    margin: "0",
    borderColor: "#e2e9ea",
  },

  footer: {
    padding: "20px 32px 26px",
    backgroundColor: "#fafcfc",
  },

  footerText: {
    margin: "4px 0",
    color: "#758184",
    fontSize: "11px",
    lineHeight: "18px",
    textAlign: "center" as const,
  },
} as const;