import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

import {
  cookies,
  headers,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

/**
 * ============================================================================
 * YOUNG CARING
 * AUTHENTIFICATION ADMINISTRATEUR
 * ============================================================================
 *
 * Architecture volontairement simple :
 *
 * - un seul administrateur ;
 * - aucun compte admin en base de données ;
 * - email autorisé défini dans ADMIN_EMAIL ;
 * - mot de passe stocké uniquement sous forme de hash scrypt ;
 * - session signée avec HMAC-SHA256 ;
 * - cookie HttpOnly ;
 * - Secure en production ;
 * - expiration automatique ;
 * - limitation des tentatives de connexion ;
 * - aucune information sensible envoyée au navigateur.
 *
 * Variables requises :
 *
 * ADMIN_EMAIL
 * ADMIN_PASSWORD_HASH
 * ADMIN_SESSION_SECRET
 *
 * ============================================================================
 */

const ADMIN_COOKIE_NAME =
  "yc_admin_session";

const ADMIN_SESSION_VERSION =
  1;

const ADMIN_SESSION_DURATION_SECONDS =
  8 * 60 * 60;

const ADMIN_SESSION_CLOCK_TOLERANCE_SECONDS =
  60;

const ADMIN_SESSION_MAX_TOKEN_LENGTH =
  2_048;

/**
 * Limitation simple des tentatives.
 *
 * 5 échecs maximum pendant 10 minutes
 * pour une même IP + adresse email.
 *
 * Pour Young Caring avec une seule instance,
 * cette protection est suffisante pour démarrer.
 *
 * Si l'application est distribuée plus tard
 * sur plusieurs serveurs, elle pourra être
 * remplacée par Redis / Upstash.
 */
const LOGIN_RATE_LIMIT_WINDOW_MS =
  10 * 60 * 1_000;

const LOGIN_RATE_LIMIT_MAX_FAILURES =
  5;

const LOGIN_RATE_LIMIT_MAX_ENTRIES =
  5_000;

type AdminSessionPayload =
  Readonly<{
    v: 1;

    sub: string;

    iat: number;

    exp: number;

    nonce: string;
  }>;

export type AdminSession =
  Readonly<{
    email: string;

    issuedAt: Date;

    expiresAt: Date;
  }>;

export type AdminLoginResult =
  | Readonly<{
      success: true;
    }>
  | Readonly<{
      success: false;

      error:
        | "INVALID_CREDENTIALS"
        | "TOO_MANY_ATTEMPTS";

      retryAfter?: number;
    }>;

type ParsedPasswordHash =
  Readonly<{
    salt: Buffer;

    expectedHash: Buffer;
  }>;

type RateLimitEntry = {
  failures: number;

  expiresAt: number;
};

const loginRateLimitStore =
  new Map<
    string,
    RateLimitEntry
  >();

/**
 * ============================================================================
 * CONFIGURATION
 * ============================================================================
 */

function normalizeAdminEmail(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function getConfiguredAdminEmail():
  string {
  const email =
    normalizeAdminEmail(
      process.env.ADMIN_EMAIL ??
        ""
    );

  if (
    !email ||
    email.length > 320 ||
    !email.includes("@")
  ) {
    throw new Error(
      "ADMIN_EMAIL est absente ou invalide."
    );
  }

  return email;
}

function getConfiguredPasswordHash():
  string {
  const value =
    process.env
      .ADMIN_PASSWORD_HASH
      ?.trim();

  if (!value) {
    throw new Error(
      "ADMIN_PASSWORD_HASH est absente."
    );
  }

  return value;
}

function getSessionSecret():
  Buffer {
  const value =
    process.env
      .ADMIN_SESSION_SECRET
      ?.trim();

  /**
   * Minimum 32 octets.
   *
   * La commande utilisée précédemment
   * génère 48 octets / 96 caractères hex.
   */
  if (
    !value ||
    value.length < 64
  ) {
    throw new Error(
      "ADMIN_SESSION_SECRET est absente ou trop courte."
    );
  }

  /**
   * Si la valeur est hexadécimale,
   * on utilise directement les octets
   * correspondants.
   */
  if (
    /^[A-Fa-f0-9]+$/.test(
      value
    ) &&
    value.length % 2 === 0
  ) {
    const decoded =
      Buffer.from(
        value,
        "hex"
      );

    if (
      decoded.length >= 32
    ) {
      return decoded;
    }
  }

  return Buffer.from(
    value,
    "utf8"
  );
}

/**
 * ============================================================================
 * MOT DE PASSE
 * ============================================================================
 */

function parsePasswordHash(
  value: string
): ParsedPasswordHash {
  /**
   * Format généré précédemment :
   *
   * scrypt$SALT$HASH
   */
  const parts =
    value.split("$");

  if (
    parts.length !== 3 ||
    parts[0] !== "scrypt"
  ) {
    throw new Error(
      "ADMIN_PASSWORD_HASH utilise un format invalide."
    );
  }

  const [
    ,
    saltHex,
    hashHex,
  ] = parts;

  /**
   * On refuse les valeurs anormalement
   * petites ou gigantesques.
   */
  if (
    !/^[A-Fa-f0-9]{32,128}$/.test(
      saltHex
    ) ||
    saltHex.length % 2 !== 0 ||
    !/^[A-Fa-f0-9]{64,256}$/.test(
      hashHex
    ) ||
    hashHex.length % 2 !== 0
  ) {
    throw new Error(
      "ADMIN_PASSWORD_HASH utilise un format invalide."
    );
  }

  return {
    salt:
      Buffer.from(
        saltHex,
        "hex"
      ),

    expectedHash:
      Buffer.from(
        hashHex,
        "hex"
      ),
  };
}

function deriveScryptHash(
  password: string,
  salt: Buffer,
  keyLength: number
): Promise<Buffer> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      scrypt(
        password,
        salt,
        keyLength,
        (
          error,
          derivedKey
        ) => {
          if (error) {
            reject(error);

            return;
          }

          resolve(
            derivedKey
          );
        }
      );
    }
  );
}

/**
 * Comparaison à temps constant.
 *
 * Utilisée pour éviter les comparaisons
 * simples de valeurs sensibles.
 */
function constantTimeStringEqual(
  left: string,
  right: string
): boolean {
  const leftDigest =
    createHash("sha256")
      .update(
        left,
        "utf8"
      )
      .digest();

  const rightDigest =
    createHash("sha256")
      .update(
        right,
        "utf8"
      )
      .digest();

  return timingSafeEqual(
    leftDigest,
    rightDigest
  );
}

async function verifyPassword(
  password: string
): Promise<boolean> {
  if (
    typeof password !==
      "string" ||
    password.length === 0 ||
    password.length > 1_024
  ) {
    return false;
  }

  const parsed =
    parsePasswordHash(
      getConfiguredPasswordHash()
    );

  const derivedHash =
    await deriveScryptHash(
      password,
      parsed.salt,
      parsed.expectedHash.length
    );

  if (
    derivedHash.length !==
    parsed.expectedHash.length
  ) {
    return false;
  }

  return timingSafeEqual(
    derivedHash,
    parsed.expectedHash
  );
}

/**
 * ============================================================================
 * SESSION SIGNÉE
 * ============================================================================
 */

function encodePayload(
  payload: AdminSessionPayload
): string {
  return Buffer
    .from(
      JSON.stringify(
        payload
      ),
      "utf8"
    )
    .toString(
      "base64url"
    );
}

function signEncodedPayload(
  encodedPayload: string
): string {
  return createHmac(
    "sha256",
    getSessionSecret()
  )
    .update(
      encodedPayload,
      "utf8"
    )
    .digest(
      "base64url"
    );
}

function createSessionToken(
  email: string
): string {
  const now =
    Math.floor(
      Date.now() /
        1_000
    );

  const payload:
    AdminSessionPayload = {
    v:
      ADMIN_SESSION_VERSION,

    sub:
      email,

    iat:
      now,

    exp:
      now +
      ADMIN_SESSION_DURATION_SECONDS,

    nonce:
      randomBytes(16)
        .toString("hex"),
  };

  const encodedPayload =
    encodePayload(
      payload
    );

  const signature =
    signEncodedPayload(
      encodedPayload
    );

  return (
    `${encodedPayload}.` +
    `${signature}`
  );
}

function isAdminSessionPayload(
  value: unknown
): value is AdminSessionPayload {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const payload =
    value as Record<
      string,
      unknown
    >;

  return (
    payload.v ===
      ADMIN_SESSION_VERSION &&

    typeof payload.sub ===
      "string" &&

    payload.sub.length > 0 &&

    payload.sub.length <= 320 &&

    Number.isSafeInteger(
      payload.iat
    ) &&

    Number.isSafeInteger(
      payload.exp
    ) &&

    typeof payload.nonce ===
      "string" &&

    /^[A-Fa-f0-9]{32}$/.test(
      payload.nonce
    )
  );
}

function verifySessionToken(
  token: string
):
  AdminSessionPayload |
  null {
  if (
    !token ||
    token.length >
      ADMIN_SESSION_MAX_TOKEN_LENGTH
  ) {
    return null;
  }

  const parts =
    token.split(".");

  if (
    parts.length !== 2
  ) {
    return null;
  }

  const [
    encodedPayload,
    receivedSignature,
  ] = parts;

  if (
    !encodedPayload ||
    !receivedSignature
  ) {
    return null;
  }

  let receivedSignatureBuffer:
    Buffer;

  let expectedSignatureBuffer:
    Buffer;

  try {
    receivedSignatureBuffer =
      Buffer.from(
        receivedSignature,
        "base64url"
      );

    expectedSignatureBuffer =
      Buffer.from(
        signEncodedPayload(
          encodedPayload
        ),
        "base64url"
      );
  } catch {
    return null;
  }

  /**
   * SHA-256 produit exactement
   * 32 octets.
   */
  if (
    receivedSignatureBuffer.length !==
      expectedSignatureBuffer.length ||

    receivedSignatureBuffer.length !==
      32 ||

    !timingSafeEqual(
      receivedSignatureBuffer,
      expectedSignatureBuffer
    )
  ) {
    return null;
  }

  let payload: unknown;

  try {
    payload =
      JSON.parse(
        Buffer
          .from(
            encodedPayload,
            "base64url"
          )
          .toString(
            "utf8"
          )
      ) as unknown;
  } catch {
    return null;
  }

  if (
    !isAdminSessionPayload(
      payload
    )
  ) {
    return null;
  }

  const now =
    Math.floor(
      Date.now() /
        1_000
    );

  /**
   * Vérifications temporelles :
   *
   * - session non expirée ;
   * - date de création cohérente ;
   * - durée maximale impossible à augmenter
   *   en manipulant le cookie.
   */
  if (
    payload.iat >
      now +
        ADMIN_SESSION_CLOCK_TOLERANCE_SECONDS ||

    payload.exp <= now ||

    payload.exp <=
      payload.iat ||

    payload.exp -
      payload.iat >
      ADMIN_SESSION_DURATION_SECONDS +
        ADMIN_SESSION_CLOCK_TOLERANCE_SECONDS
  ) {
    return null;
  }

  /**
   * Même si quelqu'un récupérait un cookie
   * correctement signé pour une ancienne
   * configuration, l'adresse doit encore
   * correspondre à ADMIN_EMAIL.
   */
  const configuredEmail =
    getConfiguredAdminEmail();

  if (
    !constantTimeStringEqual(
      normalizeAdminEmail(
        payload.sub
      ),
      configuredEmail
    )
  ) {
    return null;
  }

  return payload;
}

/**
 * ============================================================================
 * RATE LIMIT CONNEXION
 * ============================================================================
 */

function cleanExpiredRateLimitEntries(
  now: number
): void {
  for (
    const [
      key,
      entry,
    ] of loginRateLimitStore
  ) {
    if (
      entry.expiresAt <=
      now
    ) {
      loginRateLimitStore.delete(
        key
      );
    }
  }
}

async function getLoginRateLimitKey(
  email: string
): Promise<string> {
  const requestHeaders =
    await headers();

  const forwardedFor =
    requestHeaders.get(
      "x-forwarded-for"
    );

  const realIp =
    requestHeaders.get(
      "x-real-ip"
    );

  const ip =
    forwardedFor
      ?.split(",")
      .at(0)
      ?.trim() ||

    realIp?.trim() ||

    "unknown";

  /**
   * On ne conserve pas directement
   * l'adresse IP dans la Map.
   */
  return createHash(
    "sha256"
  )
    .update(
      `${ip}|${normalizeAdminEmail(
        email
      )}`,
      "utf8"
    )
    .digest("hex");
}

function getRateLimitState(
  key: string
): {
  limited: boolean;

  retryAfter: number;
} {
  const now =
    Date.now();

  if (
    loginRateLimitStore.size >=
      LOGIN_RATE_LIMIT_MAX_ENTRIES
  ) {
    cleanExpiredRateLimitEntries(
      now
    );
  }

  const entry =
    loginRateLimitStore.get(
      key
    );

  if (
    !entry ||
    entry.expiresAt <= now
  ) {
    if (entry) {
      loginRateLimitStore.delete(
        key
      );
    }

    return {
      limited: false,
      retryAfter: 0,
    };
  }

  if (
    entry.failures <
      LOGIN_RATE_LIMIT_MAX_FAILURES
  ) {
    return {
      limited: false,
      retryAfter: 0,
    };
  }

  return {
    limited: true,

    retryAfter:
      Math.max(
        1,

        Math.ceil(
          (
            entry.expiresAt -
            now
          ) /
            1_000
        )
      ),
  };
}

function registerLoginFailure(
  key: string
): void {
  const now =
    Date.now();

  const current =
    loginRateLimitStore.get(
      key
    );

  if (
    !current ||
    current.expiresAt <=
      now
  ) {
    if (
      loginRateLimitStore.size >=
        LOGIN_RATE_LIMIT_MAX_ENTRIES
    ) {
      cleanExpiredRateLimitEntries(
        now
      );
    }

    /**
     * Évite une croissance illimitée
     * en mémoire.
     */
    if (
      loginRateLimitStore.size >=
        LOGIN_RATE_LIMIT_MAX_ENTRIES
    ) {
      return;
    }

    loginRateLimitStore.set(
      key,
      {
        failures: 1,

        expiresAt:
          now +
          LOGIN_RATE_LIMIT_WINDOW_MS,
      }
    );

    return;
  }

  current.failures += 1;
}

/**
 * ============================================================================
 * COOKIE ADMIN
 * ============================================================================
 */

async function setAdminSessionCookie(
  email: string
): Promise<void> {
  const cookieStore =
    await cookies();

  const token =
    createSessionToken(
      email
    );

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    token,
    {
      httpOnly: true,

      secure:
        process.env
          .NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        ADMIN_SESSION_DURATION_SECONDS,
    }
  );
}

/**
 * ============================================================================
 * CONNEXION ADMIN
 * ============================================================================
 *
 * Cette fonction doit être appelée depuis
 * une Server Action ou une Route Handler.
 */

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const normalizedEmail =
    normalizeAdminEmail(
      email ?? ""
    );

  const configuredEmail =
    getConfiguredAdminEmail();

  const rateLimitKey =
    await getLoginRateLimitKey(
      normalizedEmail
    );

  const rateLimit =
    getRateLimitState(
      rateLimitKey
    );

  if (
    rateLimit.limited
  ) {
    return {
      success: false,

      error:
        "TOO_MANY_ATTEMPTS",

      retryAfter:
        rateLimit.retryAfter,
    };
  }

  /**
   * Le mot de passe est vérifié même lorsque
   * l'adresse email est incorrecte.
   *
   * Cela évite de créer une différence trop
   * évidente entre email valide et invalide.
   */
  const emailMatches =
    constantTimeStringEqual(
      normalizedEmail,
      configuredEmail
    );

  const passwordMatches =
    await verifyPassword(
      password ?? ""
    );

  if (
    !emailMatches ||
    !passwordMatches
  ) {
    registerLoginFailure(
      rateLimitKey
    );

    /**
     * Message volontairement générique.
     *
     * Ne jamais dire :
     * "email incorrect"
     * ou
     * "mot de passe incorrect".
     */
    return {
      success: false,

      error:
        "INVALID_CREDENTIALS",
    };
  }

  /**
   * Une connexion réussie supprime
   * les échecs précédents pour cette IP.
   */
  loginRateLimitStore.delete(
    rateLimitKey
  );

  await setAdminSessionCookie(
    configuredEmail
  );

  return {
    success: true,
  };
}

/**
 * ============================================================================
 * LECTURE DE SESSION
 * ============================================================================
 *
 * Peut être utilisée dans :
 *
 * - layout serveur ;
 * - page serveur ;
 * - Route Handler.
 *
 * Retourne null si la session n'est pas valide.
 */

export async function getAdminSession():
  Promise<
    AdminSession |
    null
  > {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      ADMIN_COOKIE_NAME
    )?.value;

  if (!token) {
    return null;
  }

  let payload:
    AdminSessionPayload |
    null;

  try {
    payload =
      verifySessionToken(
        token
      );
  } catch {
    /**
     * Une mauvaise configuration ou
     * un cookie invalide ne doit jamais
     * authentifier l'utilisateur.
     */
    return null;
  }

  if (!payload) {
    return null;
  }

  return {
    email:
      payload.sub,

    issuedAt:
      new Date(
        payload.iat *
          1_000
      ),

    expiresAt:
      new Date(
        payload.exp *
          1_000
      ),
  };
}

/**
 * ============================================================================
 * PROTECTION DES PAGES ADMIN
 * ============================================================================
 *
 * Exemple :
 *
 * const session = await requireAdmin();
 *
 * Sans session valide :
 *
 * /admin/connexion
 */

export async function requireAdmin():
  Promise<AdminSession> {
  const session =
    await getAdminSession();

  if (!session) {
    redirect(
      "/admin/connexion"
    );
  }

  return session;
}

/**
 * ============================================================================
 * DÉCONNEXION
 * ============================================================================
 *
 * Cette fonction doit être appelée depuis
 * une Server Action ou Route Handler.
 */

export async function logoutAdmin():
  Promise<never> {
  const cookieStore =
    await cookies();

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    "",
    {
      httpOnly: true,

      secure:
        process.env
          .NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        0,

      expires:
        new Date(0),
    }
  );

  redirect(
    "/admin/connexion"
  );
}