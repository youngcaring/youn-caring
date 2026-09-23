import "server-only";

import {
  PrismaPg,
} from "@prisma/adapter-pg";

import {
  PrismaClient,
} from "@/generated/prisma/client";

/**
 * ============================================================================
 * YOUNG CARING
 * CLIENT PRISMA — POSTGRESQL / SUPABASE
 * ============================================================================
 *
 * Ce fichier :
 *
 * - crée l’adaptateur PostgreSQL ;
 * - initialise Prisma Client ;
 * - évite les connexions multiples en développement ;
 * - conserve DATABASE_URL exclusivement côté serveur ;
 * - n’affiche jamais la chaîne de connexion dans les journaux.
 * ============================================================================
 */

type PrismaGlobal = typeof globalThis & {
  __youngCaringPrisma?:
    PrismaClient;
};

/**
 * Lit et vérifie la chaîne PostgreSQL.
 */
function getDatabaseUrl(): string {
  const databaseUrl =
    process.env.DATABASE_URL
      ?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL est absente de la configuration serveur."
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl =
      new URL(databaseUrl);
  } catch {
    throw new Error(
      "DATABASE_URL contient une adresse PostgreSQL invalide."
    );
  }

  if (
    parsedUrl.protocol !==
      "postgresql:" &&
    parsedUrl.protocol !==
      "postgres:"
  ) {
    throw new Error(
      "DATABASE_URL doit utiliser le protocole PostgreSQL."
    );
  }

  return databaseUrl;
}

/**
 * Crée une instance Prisma connectée
 * à PostgreSQL avec l’adaptateur officiel.
 */
function createPrismaClient():
  PrismaClient {
  const adapter =
    new PrismaPg({
      connectionString:
        getDatabaseUrl(),
    });

  return new PrismaClient({
    adapter,

    log:
      process.env.NODE_ENV ===
      "development"
        ? [
            "warn",
            "error",
          ]
        : [
            "error",
          ],
  });
}

/**
 * Évite la création d’un nouveau client
 * après chaque rechargement Next.js.
 */
const prismaGlobal =
  globalThis as PrismaGlobal;

export const db =
  prismaGlobal
    .__youngCaringPrisma ??
  createPrismaClient();

if (
  process.env.NODE_ENV !==
  "production"
) {
  prismaGlobal
    .__youngCaringPrisma =
    db;
}

export default db;