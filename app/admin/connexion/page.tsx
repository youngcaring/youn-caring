import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  getAdminSession,
  loginAdmin,
} from "@/lib/admin-auth";

/**
 * ============================================================================
 * YOUNG CARING
 * CONNEXION À L'ESPACE ADMINISTRATEUR
 * ============================================================================
 *
 * Cette page :
 *
 * - reste publique pour permettre la connexion ;
 * - redirige vers /admin si l'administrateur est déjà connecté ;
 * - utilise uniquement une Server Action ;
 * - ne stocke jamais le mot de passe côté client ;
 * - n'expose jamais ADMIN_EMAIL ;
 * - retourne volontairement un message générique en cas d'échec ;
 * - profite du rate limiting défini dans lib/admin-auth.ts.
 *
 * ============================================================================
 */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export const metadata:
  Metadata = {
  title:
    "Administration | Young Caring",

  description:
    "Connexion sécurisée à l’espace d’administration Young Caring.",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type AdminLoginPageProps =
  Readonly<{
    searchParams?: Promise<
      Record<
        string,
        string |
          string[] |
          undefined
      >
    >;
  }>;

type ErrorMessage =
  Readonly<{
    title: string;

    description: string;
  }>;

/**
 * Retourne une valeur unique depuis
 * les paramètres d'URL.
 */
function readSearchParam(
  value:
    | string
    | string[]
    | undefined
): string | null {
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

  return null;
}

/**
 * Messages volontairement génériques.
 *
 * Nous ne révélons jamais :
 *
 * - si l'adresse administrateur existe ;
 * - si le mot de passe seul est incorrect ;
 * - les détails de configuration serveur.
 */
function getErrorMessage(
  errorCode: string | null
): ErrorMessage | null {
  switch (errorCode) {
    case "invalid_credentials":
      return {
        title:
          "Connexion impossible",

        description:
          "L’adresse e-mail ou le mot de passe est incorrect.",
      };

    case "too_many_attempts":
      return {
        title:
          "Trop de tentatives",

        description:
          "Plusieurs tentatives de connexion ont échoué. Patientez quelques minutes avant de réessayer.",
      };

    case "service_unavailable":
      return {
        title:
          "Connexion temporairement indisponible",

        description:
          "Le service d’administration n’est pas disponible pour le moment. Réessayez dans quelques instants.",
      };

    default:
      return null;
  }
}

/**
 * ============================================================================
 * SERVER ACTION
 * ============================================================================
 */

async function loginAction(
  formData: FormData
): Promise<never> {
  "use server";

  const rawEmail =
    formData.get(
      "email"
    );

  const rawPassword =
    formData.get(
      "password"
    );

  /**
   * Nous contrôlons les types avant
   * de transmettre les données au
   * module d'authentification.
   */
  if (
    typeof rawEmail !==
      "string" ||
    typeof rawPassword !==
      "string"
  ) {
    redirect(
      "/admin/connexion?error=invalid_credentials"
    );
  }

  const email =
    rawEmail
      .trim()
      .slice(
        0,
        320
      );

  const password =
    rawPassword.slice(
      0,
      1_024
    );

  /**
   * Refus immédiat des entrées vides.
   *
   * Le message reste générique.
   */
  if (
    email.length === 0 ||
    password.length === 0
  ) {
    redirect(
      "/admin/connexion?error=invalid_credentials"
    );
  }

  try {
    const result =
      await loginAdmin(
        email,
        password
      );

    if (!result.success) {
      if (
        result.error ===
        "TOO_MANY_ATTEMPTS"
      ) {
        redirect(
          "/admin/connexion?error=too_many_attempts"
        );
      }

      redirect(
        "/admin/connexion?error=invalid_credentials"
      );
    }

    /**
     * loginAdmin() a déjà installé
     * le cookie sécurisé.
     */
    redirect(
      "/admin"
    );
  } catch (error: unknown) {
    /**
     * redirect() fonctionne en lançant
     * une exception interne Next.js.
     *
     * Il ne faut donc pas intercepter
     * une redirection réussie.
     */
    if (
      error &&
      typeof error ===
        "object" &&
      "digest" in error &&
      typeof (
        error as {
          digest?: unknown;
        }
      ).digest ===
        "string" &&
      (
        error as {
          digest: string;
        }
      ).digest.startsWith(
        "NEXT_REDIRECT"
      )
    ) {
      throw error;
    }

    /**
     * Aucun secret ou mot de passe
     * n'est écrit dans les logs.
     */
    console.error(
      "Admin login failed because of an internal error:",
      {
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    redirect(
      "/admin/connexion?error=service_unavailable"
    );
  }
}

/**
 * ============================================================================
 * PAGE
 * ============================================================================
 */

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  /**
   * Si une session admin valide existe déjà,
   * inutile de montrer le formulaire.
   */
  const existingSession =
    await getAdminSession();

  if (existingSession) {
    redirect(
      "/admin"
    );
  }

  const params =
    searchParams
      ? await searchParams
      : {};

  const errorCode =
    readSearchParam(
      params.error
    );

  const errorMessage =
    getErrorMessage(
      errorCode
    );

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        text-slate-950
      "
    >
      <div
        className="
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-7xl
          items-center
          justify-center
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >
        <section
          className="
            grid
            w-full
            max-w-5xl
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-xl
            shadow-slate-200/50
            lg:grid-cols-2
          "
        >
          {/*
           * ================================================================
           * PRÉSENTATION
           * ================================================================
           */}

          <div
            className="
              relative
              hidden
              min-h-[640px]
              overflow-hidden
              bg-slate-950
              p-10
              text-white
              lg:flex
              lg:flex-col
              lg:justify-between
            "
          >
            <div
              className="
                absolute
                -right-32
                -top-32
                h-80
                w-80
                rounded-full
                bg-white/5
              "
            />

            <div
              className="
                absolute
                -bottom-24
                -left-24
                h-72
                w-72
                rounded-full
                bg-white/5
              "
            />

            <div
              className="
                relative
                z-10
              "
            >
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-white/70
                  transition
                  hover:text-white
                "
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Retour au site
              </Link>
            </div>

            <div
              className="
                relative
                z-10
                max-w-md
              "
            >
              <div
                className="
                  mb-7
                  inline-flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                "
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="h-7 w-7"
                />
              </div>

              <p
                className="
                  mb-3
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/50
                "
              >
                Young Caring
              </p>

              <h1
                className="
                  text-4xl
                  font-semibold
                  tracking-tight
                "
              >
                Espace
                administrateur
              </h1>

              <p
                className="
                  mt-5
                  max-w-sm
                  text-base
                  leading-7
                  text-white/65
                "
              >
                Accédez au suivi des
                dons, aux rapports et
                aux outils internes de
                Young Caring.
              </p>
            </div>

            <div
              className="
                relative
                z-10
                flex
                items-center
                gap-3
                text-sm
                text-white/50
              "
            >
              <LockKeyhole
                aria-hidden="true"
                className="h-4 w-4"
              />

              Accès réservé
            </div>
          </div>

          {/*
           * ================================================================
           * FORMULAIRE
           * ================================================================
           */}

          <div
            className="
              flex
              min-h-[620px]
              items-center
              px-6
              py-10
              sm:px-10
              lg:px-14
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-md
              "
            >
              {/*
               * Logo mobile / formulaire.
               */}

              <div
                className="
                  mb-8
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    relative
                    h-12
                    w-12
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                  "
                >
                  <Image
                    src="/logo/logo.png"
                    alt="Young Caring"
                    fill
                    priority
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>

                <div>
                  <p
                    className="
                      text-base
                      font-bold
                      tracking-tight
                      text-slate-950
                    "
                  >
                    Young Caring
                  </p>

                  <p
                    className="
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    Administration
                  </p>
                </div>
              </div>

              <div
                className="mb-8"
              >
                <h2
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    text-slate-950
                  "
                >
                  Connexion
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Entrez vos
                  identifiants
                  administrateur pour
                  continuer.
                </p>
              </div>

              {errorMessage ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="
                    mb-6
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-4
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-red-800
                    "
                  >
                    {
                      errorMessage.title
                    }
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-5
                      text-red-700
                    "
                  >
                    {
                      errorMessage.description
                    }
                  </p>
                </div>
              ) : null}

              <form
                action={
                  loginAction
                }
                className="
                  space-y-5
                "
              >
                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    Adresse e-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    maxLength={320}
                    spellCheck={false}
                    placeholder="Votre adresse e-mail"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      px-4
                      text-[15px]
                      text-slate-950
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-400
                      focus:border-slate-950
                      focus:ring-4
                      focus:ring-slate-950/5
                    "
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    Mot de passe
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    maxLength={1024}
                    placeholder="Votre mot de passe"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      bg-white
                      px-4
                      text-[15px]
                      text-slate-950
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-400
                      focus:border-slate-950
                      focus:ring-4
                      focus:ring-slate-950/5
                    "
                  />
                </div>

                <button
                  type="submit"
                  className="
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-950
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-slate-800
                    focus:outline-none
                    focus:ring-4
                    focus:ring-slate-950/15
                    active:scale-[0.99]
                  "
                >
                  Se connecter
                </button>
              </form>

              <div
                className="
                  mt-8
                  border-t
                  border-slate-100
                  pt-6
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
                      mt-0.5
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-slate-100
                    "
                  >
                    <LockKeyhole
                      aria-hidden="true"
                      className="
                        h-4
                        w-4
                        text-slate-600
                      "
                    />
                  </div>

                  <p
                    className="
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Cette zone est
                    réservée à
                    l’administration
                    Young Caring. Les
                    tentatives de
                    connexion sont
                    limitées pour
                    protéger l’accès.
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="
                  mt-8
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:text-slate-950
                  lg:hidden
                "
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Retour au site
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}