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

export type ContactAcknowledgementEmailProps =
  Readonly<{
    reference: string;
    fullName: string;
    subject: string;
    language: "fr" | "en";
    siteUrl: string;
    contactEmail: string;
  }>;

export default function ContactAcknowledgementEmail({
  reference,
  fullName,
  subject,
  language,
  siteUrl,
  contactEmail,
}: ContactAcknowledgementEmailProps) {
  const isFrench = language === "fr";

  const normalizedSiteUrl =
    normalizeSiteUrl(siteUrl);

  const firstName =
    getFirstName(fullName);

  return (
    <Html lang={isFrench ? "fr" : "en"}>
      <Head />

      <Preview>
        {isFrench
          ? `Votre message a bien été reçu — ${reference}`
          : `Your message has been received — ${reference}`}
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>
              YOUNG CARING
            </Text>

            <Text style={styles.headerText}>
              {isFrench
                ? "Confirmation de réception"
                : "Message received"}
            </Text>
          </Section>

          <Section style={styles.content}>
            <Section
              style={styles.successIcon}
            >
              <Text
                style={styles.successIconText}
              >
                ✓
              </Text>
            </Section>

            <Heading
              as="h1"
              style={styles.heading}
            >
              {isFrench
                ? `Merci${
                    firstName
                      ? ` ${firstName}`
                      : ""
                  }, votre message est bien reçu`
                : `Thank you${
                    firstName
                      ? ` ${firstName}`
                      : ""
                  }, we received your message`}
            </Heading>

            <Text style={styles.introduction}>
              {isFrench
                ? "Notre équipe a bien reçu votre demande. Nous allons l’examiner et vous répondre dans les meilleurs délais."
                : "Our team has received your request. We will review it and reply as soon as possible."}
            </Text>

            <Section
              style={styles.summaryBox}
            >
              <Text style={styles.summaryLabel}>
                {isFrench
                  ? "Référence de votre demande"
                  : "Your request reference"}
              </Text>

              <Text style={styles.reference}>
                {reference}
              </Text>

              <Hr style={styles.innerDivider} />

              <Text style={styles.summaryLabel}>
                {isFrench
                  ? "Sujet"
                  : "Subject"}
              </Text>

              <Text style={styles.subject}>
                {subject}
              </Text>
            </Section>

            <Text style={styles.instruction}>
              {isFrench
                ? "Conservez cette référence. Elle pourra nous aider à retrouver plus rapidement votre demande si vous nous contactez à nouveau."
                : "Please keep this reference. It can help us locate your request more quickly if you contact us again."}
            </Text>

            <Section style={styles.buttonSection}>
              <Button
                href={normalizedSiteUrl}
                style={styles.button}
              >
                {isFrench
                  ? "Visiter le site Young Caring"
                  : "Visit the Young Caring website"}
              </Button>
            </Section>

            <Section style={styles.securityBox}>
              <Text
                style={styles.securityTitle}
              >
                {isFrench
                  ? "Rappel de sécurité"
                  : "Security reminder"}
              </Text>

              <Text style={styles.securityText}>
                {isFrench
                  ? "Young Caring ne vous demandera jamais votre mot de passe, votre code secret ou vos informations bancaires par email ou par messagerie."
                  : "Young Caring will never ask for your password, security code or banking information by email or messaging service."}
              </Text>
            </Section>

            <Text style={styles.contactText}>
              {isFrench
                ? "Besoin d’ajouter une information ? Écrivez-nous à"
                : "Need to add more information? Contact us at"}{" "}
              <a
                href={`mailto:${contactEmail}`}
                style={styles.contactLink}
              >
                {contactEmail}
              </a>
            </Text>

            <Text style={styles.signature}>
              {isFrench
                ? "Avec toute notre considération,"
                : "Kind regards,"}
              <br />
              <strong>
                {isFrench
                  ? "L’équipe Young Caring"
                  : "The Young Caring team"}
              </strong>
            </Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              {isFrench
                ? "Cet email est une confirmation automatique envoyée après l’utilisation du formulaire de contact."
                : "This is an automatic confirmation sent after using the contact form."}
            </Text>

            <Text style={styles.footerText}>
              © {new Date().getUTCFullYear()} Young
              Caring.{" "}
              {isFrench
                ? "Tous droits réservés."
                : "All rights reserved."}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function getFirstName(
  fullName: string
): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .at(0)
      ?.slice(0, 60) ?? ""
  );
}

function normalizeSiteUrl(
  siteUrl: string
): string {
  try {
    const url = new URL(siteUrl);

    if (
      url.protocol === "https:" ||
      url.protocol === "http:"
    ) {
      return url.origin;
    }
  } catch {
    // L’URL de secours est utilisée.
  }

  return "https://young-caring.org";
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
    textAlign: "center" as const,
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
    fontSize: "18px",
    fontWeight: "700",
  },

  content: {
    padding: "34px 32px",
  },

  successIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto",
    borderRadius: "999px",
    backgroundColor: "#e7f8ee",
    textAlign: "center" as const,
  },

  successIconText: {
    margin: "0",
    color: "#167340",
    fontSize: "36px",
    fontWeight: "700",
    lineHeight: "64px",
  },

  heading: {
    margin: "24px auto 0",
    maxWidth: "520px",
    color: "#101719",
    fontSize: "28px",
    lineHeight: "37px",
    textAlign: "center" as const,
  },

  introduction: {
    margin: "16px auto 0",
    maxWidth: "520px",
    color: "#5f6d70",
    fontSize: "15px",
    lineHeight: "25px",
    textAlign: "center" as const,
  },

  summaryBox: {
    marginTop: "28px",
    padding: "20px",
    border: "1px solid #bfe5e8",
    borderRadius: "16px",
    backgroundColor: "#eaf8f9",
    textAlign: "center" as const,
  },

  summaryLabel: {
    margin: "0",
    color: "#537174",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform:
      "uppercase" as const,
  },

  reference: {
    margin: "7px 0 0",
    color: "#007d88",
    fontSize: "20px",
    fontWeight: "700",
    overflowWrap:
      "anywhere" as const,
  },

  innerDivider: {
    margin: "18px 0",
    borderColor: "#c9e5e7",
  },

  subject: {
    margin: "7px 0 0",
    color: "#101719",
    fontSize: "15px",
    fontWeight: "700",
    lineHeight: "23px",
    overflowWrap:
      "anywhere" as const,
  },

  instruction: {
    margin: "22px 0 0",
    color: "#5f6d70",
    fontSize: "14px",
    lineHeight: "23px",
    textAlign: "center" as const,
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

  securityBox: {
    marginTop: "28px",
    padding: "17px 18px",
    borderLeft:
      "4px solid #0097a7",
    borderRadius: "0 12px 12px 0",
    backgroundColor: "#f4f8f8",
  },

  securityTitle: {
    margin: "0",
    color: "#315d62",
    fontSize: "13px",
    fontWeight: "700",
  },

  securityText: {
    margin: "7px 0 0",
    color: "#5f6d70",
    fontSize: "12px",
    lineHeight: "20px",
  },

  contactText: {
    margin: "25px 0 0",
    color: "#5f6d70",
    fontSize: "13px",
    lineHeight: "21px",
    textAlign: "center" as const,
  },

  contactLink: {
    color: "#007d88",
    fontWeight: "700",
    textDecoration: "underline",
  },

  signature: {
    margin: "26px 0 0",
    color: "#334144",
    fontSize: "14px",
    lineHeight: "23px",
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
    margin: "5px 0",
    color: "#758184",
    fontSize: "11px",
    lineHeight: "18px",
    textAlign: "center" as const,
  },
} as const;