import Link from "next/link";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";

import {
  ArrowLeft,
  ImagePlus,
  Images,
  Newspaper,
  Plus,
  ShieldCheck,
  Trash2,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import NewsImagePicker from "@/components/admin/NewsImagePicker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* =========================================================
   YOUNG CARING
   ADMINISTRATION DES ACTUALITÉS
========================================================= */

const PATH = "/admin/news";

const STORAGE_BUCKET = "news-images";

const MAX_IMAGES = 3;

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

const MAX_TOTAL_SIZE = 9 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type Query = {
  notice?: string;
  remove?: string;
};

/* =========================================================
   STYLES COMMUNS
========================================================= */

const card =
  "rounded-[18px] border border-[#e3e9ea] bg-white shadow-sm";

const field =
  "mt-2 w-full rounded-xl border border-[#dbe4e5] bg-white px-4 py-3 text-sm text-[#101719] outline-none transition placeholder:text-[#94a3a5] focus:border-[#0097a7] focus:ring-2 focus:ring-[#0097a7]/15";

const button =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007d88]";

const primary =
  `${button} bg-[#007d88] text-white hover:bg-[#006873]`;

const secondary =
  `${button} border border-[#dbe4e5] bg-white text-[#101719] hover:bg-[#f5f8f8]`;

const danger =
  `${button} border border-red-200 bg-white text-red-700 hover:bg-red-50`;

/* =========================================================
   MESSAGES
========================================================= */

const NOTICES: Record<
  string,
  {
    message: string;
    success: boolean;
  }
> = {
  published: {
    message:
      "Votre actualité a été publiée avec succès.",
    success: true,
  },

  deleted: {
    message:
      "L’actualité a été supprimée définitivement.",
    success: true,
  },

  cleanup: {
    message:
      "L’actualité a été supprimée du site. Certaines images devront être nettoyées dans le stockage.",
    success: false,
  },

  title: {
    message:
      "Le titre est obligatoire et ne doit pas dépasser 250 caractères.",
    success: false,
  },

  description: {
    message:
      "La description ne doit pas dépasser 5 000 caractères.",
    success: false,
  },

  images: {
    message:
      "Vous devez sélectionner entre une et trois images.",
    success: false,
  },

  format: {
    message:
      "Sélectionnez uniquement des images JPG, PNG ou WebP valides.",
    success: false,
  },

  size: {
    message:
      "Chaque image doit peser au maximum 3 Mo.",
    success: false,
  },

  storage: {
    message:
      "Le stockage des images est indisponible. Vérifiez la configuration Supabase et le bucket public news-images.",
    success: false,
  },

  invalid: {
    message:
      "Cette opération est invalide.",
    success: false,
  },

  error: {
    message:
      "Une erreur est survenue. Veuillez réessayer.",
    success: false,
  },
};

/* =========================================================
   FONCTIONS UTILITAIRES
========================================================= */

function go(notice: string): never {
  redirect(
    `${PATH}?notice=${encodeURIComponent(notice)}`
  );
}

function readText(
  formData: FormData,
  name: string
): string {
  const value = formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Porto-Novo",
  }).format(date);
}

function refreshPages() {
  revalidatePath(PATH);
  revalidatePath("/");
}

/* =========================================================
   CONFIGURATION SUPABASE STORAGE
========================================================= */

function getStorageConfig() {
  const projectUrl = (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  ).trim();

  const secretKey = (
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""
  ).trim();

  if (!projectUrl || !secretKey) {
    throw new Error(
      "Configuration Supabase manquante."
    );
  }

  const parsed = new URL(projectUrl);

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "Adresse Supabase invalide."
    );
  }

  return {
    baseUrl: parsed.origin,
    secretKey,
  };
}

function storageHeaders(
  secretKey: string
): Record<string, string> {
  if (secretKey.startsWith("sb_secret_")) {
    return {
      apikey: secretKey,
    };
  }

  return {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
  };
}

/* =========================================================
   VÉRIFICATION DU BUCKET PUBLIC
========================================================= */

async function verifyStorageBucket() {
  const config = getStorageConfig();

  const response = await fetch(
    `${config.baseUrl}/storage/v1/bucket/${STORAGE_BUCKET}`,
    {
      method: "GET",

      headers: storageHeaders(
        config.secretKey
      ),

      cache: "no-store",

      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Bucket des actualités indisponible."
    );
  }

  const bucket = await response.json();

  if (bucket.public !== true) {
    throw new Error(
      "Le bucket des actualités doit être public."
    );
  }
}

/* =========================================================
   OPTIMISATION DES IMAGES
========================================================= */

async function optimizeImage(
  file: File
): Promise<Buffer> {
  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const metadata = await sharp(buffer, {
    limitInputPixels: 30_000_000,
    failOn: "error",
  }).metadata();

  if (
    !metadata.format ||
    !["jpeg", "png", "webp"].includes(
      metadata.format
    ) ||
    !metadata.width ||
    !metadata.height
  ) {
    throw new Error(
      "Format d’image invalide."
    );
  }

  return sharp(buffer, {
    limitInputPixels: 30_000_000,
    failOn: "error",
  })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 4,
    })
    .toBuffer();
}

/* =========================================================
   TÉLÉVERSEMENT D'UNE IMAGE
========================================================= */

async function uploadImage(
  buffer: Buffer,
  storagePath: string
): Promise<string> {
  const config = getStorageConfig();

  const response = await fetch(
    `${config.baseUrl}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`,
    {
      method: "POST",

      headers: {
        ...storageHeaders(
          config.secretKey
        ),

        "Content-Type": "image/webp",

        "Cache-Control":
          "public, max-age=31536000",

        "x-upsert": "false",
      },

      body: new Uint8Array(buffer),

      cache: "no-store",

      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de téléverser l’image."
    );
  }

  return `${config.baseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

/* =========================================================
   SUPPRESSION DES IMAGES DU STOCKAGE
========================================================= */

async function removeStoredImages(
  paths: string[]
): Promise<void> {
  if (paths.length === 0) {
    return;
  }

  const config = getStorageConfig();

  const safePaths = paths.filter(
    (path) =>
      /^posts\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(
        path
      )
  );

  if (safePaths.length === 0) {
    return;
  }

  const response = await fetch(
    `${config.baseUrl}/storage/v1/object/${STORAGE_BUCKET}`,
    {
      method: "DELETE",

      headers: {
        ...storageHeaders(
          config.secretKey
        ),

        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        prefixes: safePaths,
      }),

      cache: "no-store",

      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de supprimer les images."
    );
  }
}

/* =========================================================
   EXTRACTION DU CHEMIN D'UNE IMAGE
========================================================= */

function getStoragePath(
  imageUrl: string
): string | null {
  try {
    const config = getStorageConfig();

    const url = new URL(imageUrl);

    if (url.origin !== config.baseUrl) {
      return null;
    }

    const prefix =
      `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    if (!url.pathname.startsWith(prefix)) {
      return null;
    }

    const storagePath =
      url.pathname.slice(prefix.length);

    if (
      !/^posts\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(
        storagePath
      )
    ) {
      return null;
    }

    return storagePath;
  } catch {
    return null;
  }
}

/* =========================================================
   VÉRIFICATION DES URL D'IMAGES
========================================================= */

function isSafeImageUrl(
  imageUrl: string
): boolean {
  try {
    const url = new URL(imageUrl);

    const config = getStorageConfig();

    return (
      url.protocol === "https:" &&
      url.origin === config.baseUrl &&
      getStoragePath(imageUrl) !== null
    );
  } catch {
    return false;
  }
}

/* =========================================================
   SERVER ACTION
   PUBLICATION D'UNE ACTUALITÉ
========================================================= */

async function publishNews(
  formData: FormData
) {
  "use server";

  /* Vérification administrateur */

  await requireAdmin();

  /* Récupération des informations */

  const titleFr = readText(
    formData,
    "title"
  );

  const descriptionFr = readText(
    formData,
    "description"
  );

  /* Validation du titre */

  if (
    !titleFr ||
    titleFr.length > 250
  ) {
    go("title");
  }

  /* La description est facultative */

  if (descriptionFr.length > 5000) {
    go("description");
  }

  /* Récupération des images */

  const images = formData
    .getAll("images")
    .filter(
      (item): item is File =>
        item instanceof File &&
        item.size > 0
    );

  /* Minimum 1 image, maximum 3 images */

  if (
    images.length < 1 ||
    images.length > MAX_IMAGES
  ) {
    go("images");
  }

  const primaryIndex = Number(readText(formData, "primaryImage"));
  if (!Number.isInteger(primaryIndex) || primaryIndex < 0 || primaryIndex >= images.length) {
    go("images");
  }
  const [primaryImage] = images.splice(primaryIndex, 1);
  images.unshift(primaryImage);

  /* Vérification des formats */

  if (
    images.some(
      (image) =>
        !ALLOWED_IMAGE_TYPES.includes(
          image.type
        )
    )
  ) {
    go("format");
  }

  /* Vérification des tailles */

  const totalSize = images.reduce(
    (total, image) =>
      total + image.size,
    0
  );

  if (
    totalSize > MAX_TOTAL_SIZE ||
    images.some(
      (image) =>
        image.size > MAX_IMAGE_SIZE
    )
  ) {
    go("size");
  }

  /* Optimisation de toutes les images */

  const optimizedImages: Buffer[] = [];

  try {
    for (const image of images) {
      const optimized =
        await optimizeImage(image);

      optimizedImages.push(optimized);
    }
  } catch {
    go("format");
  }

  /* Vérification du stockage */

  try {
    await verifyStorageBucket();
  } catch {
    go("storage");
  }

  /* Préparation de la publication */

  const publicationId = randomUUID();

  const uploadedPaths: string[] = [];

  const imageUrls: string[] = [];

  /* Téléversement des images */

  try {
    for (const buffer of optimizedImages) {
      const storagePath =
        `posts/${publicationId}/${randomUUID()}.webp`;

      uploadedPaths.push(storagePath);

      const imageUrl = await uploadImage(
        buffer,
        storagePath
      );

      imageUrls.push(imageUrl);
    }
  } catch {
    /*
     * Nettoyage des images si un
     * téléversement échoue.
     */

    try {
      await removeStoredImages(
        uploadedPaths
      );
    } catch {
      console.error(
        "[Young Caring News] Nettoyage du stockage incomplet."
      );
    }

    go("storage");
  }

  /* Enregistrement dans PostgreSQL */

  try {
    await db.newsPost.create({
      data: {
        id: publicationId,

        titleFr,

        titleEn: null,

        /*
         * Une description vide est
         * parfaitement autorisée.
         */

        descriptionFr,

        descriptionEn: null,

        images: imageUrls,

        isPublished: true,

        publishedAt: new Date(),
      },
    });
  } catch {
    /*
     * Vérifie si la création a réellement
     * échoué avant de supprimer les images.
     */

    let existingPost;

    try {
      existingPost =
        await db.newsPost.findUnique({
          where: {
            id: publicationId,
          },

          select: {
            id: true,
          },
        });
    } catch {
      /*
       * Si la base est indisponible, on
       * conserve les images pour éviter
       * de casser une publication qui
       * aurait été enregistrée.
       */

      go("error");
    }

    if (!existingPost) {
      try {
        await removeStoredImages(
          uploadedPaths
        );
      } catch {
        console.error(
          "[Young Caring News] Nettoyage du stockage incomplet."
        );
      }

      go("error");
    }
  }

  /* Actualisation du site */

  refreshPages();

  go("published");
}

/* =========================================================
   SERVER ACTION
   SUPPRESSION DÉFINITIVE
========================================================= */

async function deleteNews(
  formData: FormData
) {
  "use server";

  await requireAdmin();

  const id = readText(
    formData,
    "id"
  );

  const confirmed =
    formData.get("confirm") === "on";

  if (
    !id ||
    id.length > 100 ||
    !confirmed
  ) {
    go("invalid");
  }

  /* Suppression de la publication */

  let deletedPost;

  try {
    deletedPost =
      await db.newsPost.delete({
        where: {
          id,
        },

        select: {
          images: true,
        },
      });
  } catch {
    go("error");
  }

  /* Récupération des images à supprimer */

  const paths = deletedPost.images
    .map(getStoragePath)
    .filter(
      (path): path is string =>
        path !== null
    );

  /* Nettoyage du stockage Supabase */

  let cleanupFailed =
    paths.length !== deletedPost.images.length;

  try {
    await removeStoredImages(paths);
  } catch {
    cleanupFailed = true;
  }

  /* Retrait de la publication du site */

  refreshPages();

  go(
    cleanupFailed
      ? "cleanup"
      : "deleted"
  );
}

/* =========================================================
   COMPOSANT D'AFFICHAGE DES IMAGES
========================================================= */

function NewsImages({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const safeImages = images
    .filter(isSafeImageUrl)
    .slice(0, MAX_IMAGES);

  if (safeImages.length === 0) {
    return (
      <div
        className="
          flex aspect-video w-full
          items-center justify-center
          bg-[#eef4f4]
        "
      >
        <Images
          size={38}
          className="text-[#94a3a5]"
        />
      </div>
    );
  }

  /* Une seule image */

  if (safeImages.length === 1) {
    return (
      <div
        className="
          aspect-video w-full
          overflow-hidden bg-[#eef4f4]
        "
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeImages[0]}
          alt={title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="
            h-full w-full object-cover
          "
        />
      </div>
    );
  }

  /* Deux images */

  if (safeImages.length === 2) {
    return (
      <div
        className="
          grid aspect-video
          grid-cols-2 gap-1
          overflow-hidden bg-white
        "
      >
        {safeImages.map(
          (image, index) => (
            <div
              key={`${image}-${index}`}
              className="
                min-h-0 min-w-0
                overflow-hidden
              "
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${title} — Image ${index + 1}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="
                  h-full w-full
                  object-cover
                "
              />
            </div>
          )
        )}
      </div>
    );
  }

  /* Trois images */

  return (
    <div
      className="
        grid aspect-video
        grid-cols-2 grid-rows-2
        gap-1 overflow-hidden
        bg-white
      "
    >
      {safeImages.map(
        (image, index) => (
          <div
            key={`${image}-${index}`}
            className={`
              min-h-0 min-w-0
              overflow-hidden
              ${
                index === 0
                  ? "row-span-2"
                  : ""
              }
            `}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${title} — Image ${index + 1}`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="
                h-full w-full
                object-cover
              "
            />
          </div>
        )
      )}
    </div>
  );
}

/* =========================================================
   PAGE PRINCIPALE
========================================================= */

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  /* Protection de la page */

  await requireAdmin();

  const query = await searchParams;

  /* Chargement des publications */

  const posts = await db.newsPost.findMany({
    orderBy: [
      {
        publishedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  /* Publication à supprimer */

  const removing = posts.find(
    (post) =>
      post.id === query.remove
  );

  /* Notification */

  const notice =
    typeof query.notice === "string" &&
    Object.prototype.hasOwnProperty.call(
      NOTICES,
      query.notice
    )
      ? NOTICES[query.notice]
      : null;

  /* Statistiques */

  const publishedCount = posts.filter(
    (post) => post.isPublished
  ).length;

  const imageCount = posts.reduce(
    (total, post) =>
      total + post.images.length,
    0
  );

  return (
    <main
      className="
        min-h-screen
        bg-[#f5f8f8]
        text-[#101719]
      "
    >
      <div
        className="
          mx-auto max-w-360
          px-4 py-7
          sm:px-8 lg:py-10
        "
      >

        {/* ================================================
            EN-TÊTE
        ================================================ */}

        <div
          className="
            mb-7 flex flex-wrap
            items-end justify-between
            gap-4
          "
        >
          <div>
            <span
              className="
                inline-flex items-center
                gap-2 rounded-full
                bg-[#e7f6f7]
                px-3 py-1.5
                text-xs font-bold
                text-[#006873]
              "
            >
              <ShieldCheck size={15} />

              Espace sécurisé
            </span>

            <h1
              className="
                mt-3 text-3xl
                font-bold tracking-tight
                sm:text-4xl
              "
            >
              Actualités
            </h1>

            <p
              className="
                mt-1 text-sm
                text-[#5f6d70]
                sm:text-base
              "
            >
              Publiez et gérez les actualités
              de Young Caring.
            </p>
          </div>

          <Link
            href="/admin"
            className={secondary}
          >
            <ArrowLeft size={17} />

            Tableau de bord
          </Link>
        </div>

        {/* ================================================
            NOTIFICATIONS
        ================================================ */}

        {notice && (
          <div
            role="status"
            className={`
              mb-6 flex items-start
              gap-3 rounded-xl
              border p-4 text-sm
              font-medium
              ${
                notice.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }
            `}
          >
            {notice.success ? (
              <CheckCircle2
                size={20}
                className="shrink-0"
              />
            ) : (
              <AlertCircle
                size={20}
                className="shrink-0"
              />
            )}

            <p className="flex-1">
              {notice.message}
            </p>

            <Link
              href={PATH}
              aria-label="Fermer la notification"
              className="
                rounded-md p-1
                hover:bg-black/5
              "
            >
              <X size={17} />
            </Link>
          </div>
        )}

        {/* ================================================
            STATISTIQUES
        ================================================ */}

        <section
          className="
            mb-7 grid grid-cols-1
            gap-3 sm:grid-cols-3
            sm:gap-5
          "
        >
          {/* Total des actualités */}

          <div className={`${card} p-5`}>
            <div
              className="
                flex items-start
                justify-between gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm font-semibold
                    text-[#5f6d70]
                  "
                >
                  Total des actualités
                </p>

                <p
                  className="
                    mt-2 text-3xl
                    font-bold tabular-nums
                  "
                >
                  {posts.length}
                </p>
              </div>

              <div
                className="
                  rounded-xl bg-[#e7f6f7]
                  p-3 text-[#007d88]
                "
              >
                <Newspaper size={22} />
              </div>
            </div>
          </div>

          {/* Actualités publiées */}

          <div className={`${card} p-5`}>
            <div
              className="
                flex items-start
                justify-between gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm font-semibold
                    text-[#5f6d70]
                  "
                >
                  Actualités publiées
                </p>

                <p
                  className="
                    mt-2 text-3xl
                    font-bold tabular-nums
                  "
                >
                  {publishedCount}
                </p>
              </div>

              <div
                className="
                  rounded-xl bg-emerald-50
                  p-3 text-emerald-700
                "
              >
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* Nombre total d'images */}

          <div className={`${card} p-5`}>
            <div
              className="
                flex items-start
                justify-between gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm font-semibold
                    text-[#5f6d70]
                  "
                >
                  Images enregistrées
                </p>

                <p
                  className="
                    mt-2 text-3xl
                    font-bold tabular-nums
                  "
                >
                  {imageCount}
                </p>
              </div>

              <div
                className="
                  rounded-xl bg-orange-50
                  p-3 text-[#ff6900]
                "
              >
                <Images size={22} />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            CONFIRMATION DE SUPPRESSION
        ================================================ */}

        {removing && (
          <section
            className={`
              ${card}
              mb-7 border-red-200
              p-5 sm:p-6
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  rounded-xl bg-red-50
                  p-3 text-red-700
                "
              >
                <Trash2 size={23} />
              </div>

              <div className="flex-1">
                <h2
                  className="
                    text-lg font-bold
                    text-red-800
                  "
                >
                  Supprimer cette actualité
                </h2>

                <p
                  className="
                    mt-1 text-sm
                    text-[#5f6d70]
                  "
                >
                  Cette action retirera
                  définitivement la publication
                  du site public.
                </p>
              </div>
            </div>

            <div
              className="
                mt-4 rounded-xl
                bg-red-50 p-4
              "
            >
              <p className="wrap-break-word font-bold">
                {removing.titleFr}
              </p>

              <p
                className="
                  mt-1 text-xs
                  text-[#5f6d70]
                "
              >
                {removing.images.length}
                {" "}
                image(s) associée(s)
              </p>
            </div>

            <form
              action={deleteNews}
              className="mt-5 space-y-4"
            >
              <input
                type="hidden"
                name="id"
                value={removing.id}
              />

              <label
                className="
                  flex items-start
                  gap-3 text-sm
                  font-medium
                "
              >
                <input
                  type="checkbox"
                  name="confirm"
                  required
                  className="
                    mt-0.5 h-4 w-4
                    accent-red-600
                  "
                />

                Je confirme la suppression
                définitive de cette actualité
                et de ses images.
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className={`
                    ${button}
                    bg-red-700 text-white
                    hover:bg-red-800
                  `}
                >
                  <Trash2 size={17} />

                  Supprimer définitivement
                </button>

                <Link
                  href={PATH}
                  className={secondary}
                >
                  Annuler
                </Link>
              </div>
            </form>
          </section>
        )}

        {/* ================================================
            CONTENU PRINCIPAL
        ================================================ */}

        <div
          className="
            grid items-start gap-6
            xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]
          "
        >

          {/* ==============================================
              FORMULAIRE DE PUBLICATION
          ============================================== */}

          <section
            className={`${card} p-5 sm:p-6`}
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  rounded-xl bg-[#e7f6f7]
                  p-3 text-[#007d88]
                "
              >
                <ImagePlus size={24} />
              </div>

              <div>
                <h2
                  className="
                    text-lg font-bold
                    sm:text-xl
                  "
                >
                  Nouvelle actualité
                </h2>

                <p
                  className="
                    mt-1 text-sm
                    text-[#5f6d70]
                  "
                >
                  Partagez les actions
                  de votre organisation.
                </p>
              </div>
            </div>

            <form
              key={
                query.notice === "published"
                  ? "published"
                  : "new"
              }
              action={publishNews}
              className="mt-6 space-y-6"
            >

              {/* ==========================================
                  TITRE OBLIGATOIRE
              ========================================== */}

              <div>
                <label
                  htmlFor="news-title"
                  className="
                    block text-sm
                    font-semibold
                  "
                >
                  Titre de l’actualité

                  <span className="ml-1 text-red-600">
                    *
                  </span>
                </label>

                <input
                  id="news-title"
                  name="title"
                  type="text"
                  required
                  maxLength={250}
                  autoComplete="off"
                  placeholder="Ex. Distribution de kits scolaires"
                  className={field}
                />

                <p
                  className="
                    mt-2 text-xs
                    text-[#5f6d70]
                  "
                >
                  Maximum 250 caractères.
                </p>
              </div>

              {/* ==========================================
                  DESCRIPTION FACULTATIVE
              ========================================== */}

              <div>
                <label
                  htmlFor="news-description"
                  className="
                    block text-sm
                    font-semibold
                  "
                >
                  Description

                  <span
                    className="
                      ml-2 text-xs
                      font-normal
                      text-[#5f6d70]
                    "
                  >
                    Facultatif
                  </span>
                </label>

                <textarea
                  id="news-description"
                  name="description"
                  rows={5}
                  maxLength={5000}
                  placeholder="Écrivez quelques mots sur cette actualité..."
                  className={`
                    ${field}
                    min-h-32.5
                    resize-y
                  `}
                />

                <p
                  className="
                    mt-2 text-xs
                    text-[#5f6d70]
                  "
                >
                  Vous pouvez publier sans
                  ajouter de description.
                </p>
              </div>

              {/* ==========================================
                  IMAGES OBLIGATOIRES
              ========================================== */}

              <div>
                <label
                  htmlFor="news-images"
                  className="
                    block text-sm
                    font-semibold
                  "
                >
                  Images de l’actualité

                  <span className="ml-1 text-red-600">
                    *
                  </span>
                </label>

                <div
                  className="
                    mt-3 rounded-2xl
                    border-2 border-dashed
                    border-[#cbdfe1]
                    bg-[#f8fbfb]
                    p-5 text-center
                    transition
                    hover:border-[#0097a7]
                  "
                >
                  <div
                    className="
                      mx-auto flex
                      h-16 w-16 items-center
                      justify-center
                      rounded-2xl
                      bg-[#e7f6f7]
                      text-[#007d88]
                    "
                  >
                    <ImagePlus size={30} />
                  </div>

                  <h3
                    className="
                      mt-3 text-sm
                      font-bold
                    "
                  >
                    Ajouter des images
                  </h3>

                  <p
                    className="
                      mt-1 text-xs
                      text-[#5f6d70]
                    "
                  >
                    Sélectionnez de 1 à 3 images.
                  </p>

                  <NewsImagePicker />

                  <p
                    className="
                      mt-3 text-xs
                      leading-relaxed
                      text-[#5f6d70]
                    "
                  >
                    JPG, PNG ou WebP.
                    <br />
                    Maximum 3 Mo par image.
                  </p>
                </div>

                <div
                  className="
                    mt-3 flex items-start
                    gap-2 rounded-xl
                    bg-[#eef7f7] p-3
                    text-xs leading-relaxed
                    text-[#006873]
                  "
                >
                  <Images
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  Les images sont automatiquement
                  optimisées lors de la publication.
                </div>
              </div>

              {/* ==========================================
                  INFORMATIONS DE PUBLICATION
              ========================================== */}

              <div
                className="
                  flex items-center
                  gap-3 rounded-xl
                  border border-[#e3e9ea]
                  p-4
                "
              >
                <CheckCircle2
                  size={22}
                  className="
                    shrink-0 text-emerald-600
                  "
                />

                <div>
                  <p
                    className="
                      text-sm font-semibold
                    "
                  >
                    Publication immédiate
                  </p>

                  <p
                    className="
                      mt-1 text-xs
                      text-[#5f6d70]
                    "
                  >
                    L’actualité sera visible
                    sur la page d’accueil publique
                    dès son enregistrement.
                  </p>
                </div>
              </div>

              {/* ==========================================
                  BOUTON PUBLIER
              ========================================== */}

              <button
                type="submit"
                className={`
                  ${primary}
                  w-full py-3.5
                `}
              >
                <Plus size={20} />

                Publier l’actualité
              </button>
            </form>
          </section>

          {/* ==============================================
              LISTE DES PUBLICATIONS
          ============================================== */}

          <section
            className={`${card} p-5 sm:p-6`}
          >
            <div
              className="
                flex items-center
                justify-between gap-3
              "
            >
              <div>
                <h2
                  className="
                    text-lg font-bold
                    sm:text-xl
                  "
                >
                  Actualités enregistrées
                </h2>

                <p
                  className="
                    mt-1 text-sm
                    text-[#5f6d70]
                  "
                >
                  Retrouvez et gérez
                  toutes vos publications.
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-[#e7f6f7]
                  px-3 py-1.5
                  text-sm font-bold
                  text-[#007d88]
                "
              >
                {posts.length}
              </span>
            </div>

            {/* ============================================
                AUCUNE ACTUALITÉ
            ============================================ */}

            {posts.length === 0 ? (
              <div
                className="
                  mt-6 rounded-2xl
                  border border-dashed
                  border-[#dbe4e5]
                  px-5 py-12
                  text-center
                "
              >
                <div
                  className="
                    mx-auto flex
                    h-20 w-20
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#e7f6f7]
                    text-[#007d88]
                  "
                >
                  <Newspaper size={36} />
                </div>

                <h3
                  className="
                    mt-5 text-base
                    font-bold
                  "
                >
                  Aucune actualité
                </h3>

                <p
                  className="
                    mx-auto mt-2
                    max-w-sm text-sm
                    leading-relaxed
                    text-[#5f6d70]
                  "
                >
                  Publiez votre première
                  actualité à partir du
                  formulaire de publication.
                </p>
              </div>
            ) : (

              /* ==========================================
                  AFFICHAGE DES PUBLICATIONS
              ========================================== */

              <div className="mt-6 space-y-5">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="
                      overflow-hidden
                      rounded-2xl border
                      border-[#e3e9ea]
                      bg-white
                      transition
                      hover:shadow-sm
                    "
                  >

                    {/* Images */}

                    <div className="relative">
                      <NewsImages
                        images={post.images}
                        title={post.titleFr}
                      />

                      <span
                        className="
                          absolute bottom-3
                          right-3 inline-flex
                          items-center gap-1.5
                          rounded-lg bg-black/70
                          px-2.5 py-1.5
                          text-xs font-semibold
                          text-white
                        "
                      >
                        <Images size={14} />

                        {post.images.length}
                        {" "}
                        image(s)
                      </span>
                    </div>

                    {/* Informations */}

                    <div className="p-4 sm:p-5">

                      {/* Statut et date */}

                      <div
                        className="
                          flex flex-wrap
                          items-center
                          justify-between
                          gap-2
                        "
                      >
                        <span
                          className={`
                            inline-flex
                            items-center gap-1.5
                            rounded-full
                            px-2.5 py-1
                            text-xs font-semibold
                            ${
                              post.isPublished
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }
                          `}
                        >
                          {post.isPublished && (
                            <CheckCircle2 size={13} />
                          )}

                          {post.isPublished
                            ? "Publié"
                            : "Non publié"}
                        </span>

                        <span
                          className="
                            inline-flex items-center
                            gap-1.5 text-xs
                            text-[#5f6d70]
                          "
                        >
                          <CalendarDays size={14} />

                          {formatDate(
                            post.publishedAt ??
                            post.createdAt
                          )}
                        </span>
                      </div>

                      {/* Titre obligatoire */}

                      <h3
                        className="
                          mt-3 wrap-break-word
                          text-lg font-bold
                          leading-snug
                          sm:text-xl
                        "
                      >
                        {post.titleFr}
                      </h3>

                      {/* Description facultative */}

                      {post.descriptionFr.trim() && (
                        <p
                          className="
                            mt-3 whitespace-pre-wrap
                            wrap-break-word text-sm
                            leading-relaxed
                            text-[#5f6d70]
                          "
                        >
                          {post.descriptionFr}
                        </p>
                      )}

                      {/* Actions */}

                      <div
                        className="
                          mt-5 flex flex-wrap
                          items-center
                          justify-between
                          gap-3 border-t
                          border-[#e3e9ea]
                          pt-4
                        "
                      >
                        <span
                          className="
                            text-xs
                            text-[#5f6d70]
                          "
                        >
                          {post.isPublished
                            ? "Visible sur le site public"
                            : "Non visible sur le site public"}
                        </span>

                        <Link
                          href={`${PATH}?remove=${encodeURIComponent(post.id)}`}
                          className={danger}
                        >
                          <Trash2 size={16} />

                          Supprimer
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
