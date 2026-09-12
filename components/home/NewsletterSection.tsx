"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useId,
  useState,
} from "react";
import { Mail, Send, ShieldCheck } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export default function NewsletterSection() {
  const { language, t } = useLanguage();

  const generatedId = useId();
  const safeGeneratedId = generatedId.replace(/[^a-zA-Z0-9_-]/g, "");

  const emailInputId = `newsletter-email-${safeGeneratedId}`;
  const errorMessageId = `newsletter-error-${safeGeneratedId}`;
  const informationId =
    `newsletter-information-${safeGeneratedId}`;

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    /*
     * La longueur est limitée dans le code et dans le champ.
     * Cela évite de conserver une valeur anormalement longue.
     */
    const value = event.target.value.slice(
      0,
      MAX_EMAIL_LENGTH
    );

    setEmail(value);

    if (error.length > 0) {
      setError("");
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    const emailIsValid =
      cleanEmail.length > 0 &&
      cleanEmail.length <= MAX_EMAIL_LENGTH &&
      EMAIL_PATTERN.test(cleanEmail);

    if (!emailIsValid) {
      setError(t("Newsletter.invalidEmail"));
      return;
    }

    setError("");

    /*
     * Aucun service de newsletter n’est encore connecté.
     * Le formulaire prépare donc un message destiné à
     * l’adresse officielle de Young Caring.
     *
     * L’utilisateur doit confirmer lui-même l’envoi depuis
     * son application de messagerie.
     */
    const subject =
      language === "fr"
        ? "Demande d’inscription à la newsletter Young Caring"
        : "Young Caring newsletter subscription request";

    const body =
      language === "fr"
        ? [
            "Bonjour Young Caring,",
            "",
            "Je souhaite recevoir les actualités et les rapports de vos actions.",
            "",
            `Adresse email à inscrire : ${cleanEmail}`,
          ].join("\n")
        : [
            "Hello Young Caring,",
            "",
            "I would like to receive your latest news and action reports.",
            "",
            `Email address to subscribe: ${cleanEmail}`,
          ].join("\n");

    const mailtoLink =
      `${siteConfig.contact.email.href}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    /*
     * Utilisation d’un lien mailto temporaire.
     * Cela évite window.location.assign(), signalé par
     * la règle ESLint de Next.js.
     */
    const mailLink = document.createElement("a");

    mailLink.href = mailtoLink;
    mailLink.target = "_self";
    mailLink.setAttribute("aria-hidden", "true");
    mailLink.style.display = "none";

    document.body.appendChild(mailLink);
    mailLink.click();
    mailLink.remove();
  };

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-section-title"
      className="bg-white px-4 py-8 sm:px-0 sm:py-10"
    >
      <div className="site-container">
        <div
          className={[
            "relative isolate overflow-hidden",
            "rounded-[28px] bg-[#0097a7] text-white",
            "shadow-[0_20px_55px_rgba(0,151,167,0.20)]",
            "sm:rounded-[32px]",
          ].join(" ")}
        >
          {/* Décorations visuelles */}

          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute -right-20",
              "-top-24 -z-10 h-64 w-64 rounded-full",
              "border-[40px] border-white/10",
            ].join(" ")}
          />

          <div
            aria-hidden="true"
            className={[
              "pointer-events-none absolute -bottom-24",
              "left-1/3 -z-10 h-48 w-48",
              "rounded-full bg-white/5",
            ].join(" ")}
          />

          <div
            className={[
              "grid gap-7 px-5 py-7 sm:px-7",
              "md:grid-cols-[1fr_minmax(320px,560px)]",
              "md:items-center md:gap-10",
              "md:px-9 md:py-8",
            ].join(" ")}
          >
            {/* Présentation */}

            <div className="flex items-start gap-4">
              <span
                className={[
                  "grid h-14 w-14 shrink-0",
                  "place-items-center rounded-full",
                  "bg-white text-[#007d88]",
                  "shadow-[0_10px_25px_rgba(7,31,33,0.14)]",
                ].join(" ")}
              >
                <Mail
                  aria-hidden="true"
                  size={25}
                  strokeWidth={2}
                />
              </span>

              <div>
                <p
                  className={[
                    "text-xs font-extrabold uppercase",
                    "tracking-[0.09em] text-white/80",
                  ].join(" ")}
                >
                  {t("Newsletter.label")}
                </p>

                <h2
                  id="newsletter-section-title"
                  className={[
                    "mt-1 text-xl font-black leading-tight",
                    "tracking-[-0.025em] sm:text-2xl",
                  ].join(" ")}
                >
                  {t("Newsletter.title")}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                  {t("Newsletter.description")}
                </p>
              </div>
            </div>

            {/* Formulaire */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="w-full"
            >
              <label
                className="sr-only"
                htmlFor={emailInputId}
              >
                {t("Newsletter.emailLabel")}
              </label>

              <div
                className={[
                  "flex min-h-[58px] items-center",
                  "rounded-full bg-white p-1.5",
                  "shadow-[0_12px_30px_rgba(7,31,33,0.14)]",
                  error
                    ? "ring-[3px] ring-[#f36c16]"
                    : [
                        "focus-within:ring-[3px]",
                        "focus-within:ring-white/35",
                      ].join(" "),
                ].join(" ")}
              >
                <Mail
                  aria-hidden="true"
                  size={19}
                  className="ml-3 shrink-0 text-[#0097a7]"
                />

                <input
                  id={emailInputId}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  enterKeyHint="send"
                  required
                  maxLength={MAX_EMAIL_LENGTH}
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={t(
                    "Newsletter.emailPlaceholder"
                  )}
                  aria-invalid={error.length > 0}
                  aria-describedby={
                    error.length > 0
                      ? errorMessageId
                      : informationId
                  }
                  className={[
                    "min-w-0 flex-1 bg-transparent",
                    "px-3 py-3 text-sm text-[#101719]",
                    "outline-none",
                    "placeholder:text-[#7d898b]",
                  ].join(" ")}
                />

                <button
                  type="submit"
                  aria-label={t("Newsletter.submit")}
                  className={[
                    "group inline-flex h-11 shrink-0",
                    "items-center justify-center gap-2",
                    "rounded-full bg-[#f36c16]",
                    "px-4 font-extrabold text-white",
                    "transition-all duration-200",
                    "hover:bg-[#d95709]",
                    "focus-visible:outline-none",
                    "focus-visible:ring-4",
                    "focus-visible:ring-[#f36c16]/30",
                    "active:scale-[0.97]",
                    "sm:min-w-[130px] sm:px-5",
                  ].join(" ")}
                >
                  <span className="hidden text-sm sm:inline">
                    {t("Newsletter.submit")}
                  </span>

                  <Send
                    aria-hidden="true"
                    size={18}
                    className={[
                      "transition-transform duration-200",
                      "group-hover:translate-x-0.5",
                      "group-hover:-translate-y-0.5",
                    ].join(" ")}
                  />
                </button>
              </div>

              {error.length > 0 ? (
                <p
                  id={errorMessageId}
                  role="alert"
                  aria-live="polite"
                  className="mt-2 px-3 text-sm font-bold text-white"
                >
                  {error}
                </p>
              ) : (
                <p
                  id={informationId}
                  className={[
                    "mt-3 flex items-start gap-2 px-3",
                    "text-xs leading-5 text-white/75",
                  ].join(" ")}
                >
                  <ShieldCheck
                    aria-hidden="true"
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {language === "fr"
                      ? "Votre adresse sera transmise uniquement à Young Caring pour votre demande d’inscription."
                      : "Your address will only be sent to Young Caring for your subscription request."}
                  </span>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}