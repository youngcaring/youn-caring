"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  Newspaper,
  Share2,
  X,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

/* =========================================================
   YOUNG CARING
   SECTION PUBLIQUE DES ACTUALITÉS
========================================================= */

/* =========================================================
   TYPES
========================================================= */

export type PublicNewsPost = {
  id: string;

  titleFr: string;

  titleEn: string | null;

  descriptionFr: string;

  descriptionEn: string | null;

  images: string[];

  publishedAt: string | null;

  createdAt: string;
};

type NewsFeedSectionProps = {
  posts: PublicNewsPost[];
};

type Language = "fr" | "en";

type ImageViewerData = {
  title: string;

  images: string[];

  index: number;
};

/* =========================================================
   CONFIGURATION
========================================================= */

const REFRESH_INTERVAL = 15_000;

const MAX_IMAGES = 3;

/* =========================================================
   TRADUCTIONS
========================================================= */

const translations = {
  fr: {
    label: "Nos actualités",

    title: "Young Caring en action",

    description:
      "Découvrez nos dernières initiatives, nos actions sur le terrain et les moments forts de notre engagement auprès des communautés.",

    publishedBy: "Young Caring",

    officialPublication:
      "Publication de Young Caring",

    share: "Partager",

    copied: "Lien copié",

    shareError:
      "Impossible de partager automatiquement cette publication.",

    readMore: "Lire la suite",

    readLess: "Voir moins",

    previous: "Image précédente",

    next: "Image suivante",

    close: "Fermer",

    openImage: "Agrandir l’image",

    unavailable:
      "Image indisponible",

    image: "Image",

    publication: "publication",

    publications: "publications",

    allNews: "Toutes nos actualités",

    latest: "Les plus récentes",

    photo: "photo",

    photos: "photos",
  },

  en: {
    label: "Our news",

    title: "Young Caring in action",

    description:
      "Discover our latest initiatives, activities in the field and highlights of our commitment to communities.",

    publishedBy: "Young Caring",

    officialPublication:
      "Young Caring publication",

    share: "Share",

    copied: "Link copied",

    shareError:
      "Unable to share this publication automatically.",

    readMore: "Read more",

    readLess: "Read less",

    previous: "Previous image",

    next: "Next image",

    close: "Close",

    openImage: "Enlarge image",

    unavailable:
      "Image unavailable",

    image: "Image",

    publication: "publication",

    publications: "publications",

    allNews: "All our news",

    latest: "Most recent",

    photo: "photo",

    photos: "photos",
  },
};

/* =========================================================
   VALIDATION DES IMAGES
========================================================= */

function getSafeImages(
  images: string[]
): string[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return Array.from(
    new Set(
      images.filter((image) => {
        if (
          typeof image !== "string" ||
          !image.trim()
        ) {
          return false;
        }

        try {
          const url = new URL(image);

          return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password &&
            url.pathname.includes(
              "/storage/v1/object/public/news-images/"
            )
          );
        } catch {
          return false;
        }
      })
    )
  ).slice(0, MAX_IMAGES);
}

/* =========================================================
   FORMATAGE DES DATES
========================================================= */

function formatDate(
  value: string | null,
  language: Language
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    language === "en"
      ? "en-GB"
      : "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Porto-Novo",
    }
  ).format(date);
}

function getTimestamp(
  value: string | null
): number {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

/* =========================================================
   TITRE ET DESCRIPTION SELON LA LANGUE
========================================================= */

function getPostContent(
  post: PublicNewsPost,
  language: Language
) {
  const title =
    language === "en"
      ? post.titleEn?.trim() ||
        post.titleFr.trim()
      : post.titleFr.trim();

  const description =
    language === "en"
      ? post.descriptionEn?.trim() ||
        post.descriptionFr?.trim() ||
        ""
      : post.descriptionFr?.trim() ||
        "";

  return {
    title,
    description,
  };
}

/* =========================================================
   COMPOSANT IMAGE SÉCURISÉ
========================================================= */

function SafeNewsImage({
  src,
  alt,
  language,
  className = "",
  eager = false,
}: {
  src: string;

  alt: string;

  language: Language;

  className?: string;

  eager?: boolean;
}) {
  const [failedSource, setFailedSource] =
    useState<string | null>(null);

  const failed = failedSource === src;

  if (failed) {
    return (
      <div
        className={`
          flex h-full w-full
          flex-col items-center
          justify-center gap-2
          bg-[#eef4f4]
          p-4 text-center
          text-[#637477]
          ${className}
        `}
      >
        <Images
          size={32}
          strokeWidth={1.5}
        />

        <span className="text-xs font-medium">
          {
            translations[language]
              .unavailable
          }
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      loading={
        eager ? "eager" : "lazy"
      }
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => {
        setFailedSource(src);
      }}
      className={`
        h-full w-full object-cover
        ${className}
      `}
    />
  );
}

/* =========================================================
   GALERIE D'IMAGES D'UNE PUBLICATION
========================================================= */

function NewsGallery({
  images,
  title,
  language,
  onOpen,
}: {
  images: string[];

  title: string;

  language: Language;

  onOpen: (index: number) => void;
}) {
  const text = translations[language];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);
  if (images.length === 0) return null;
  const current = index % images.length;
  return (
    <div className="relative overflow-hidden bg-[#eef4f4]">
      <button type="button" onClick={() => onOpen(current)}
        aria-label={text.openImage + " " + (current + 1)}
        className="block aspect-4/3 w-full cursor-zoom-in focus-visible:outline-4 focus-visible:outline-[#0097a7] sm:aspect-video">
        <SafeNewsImage src={images[current]} alt={title + " — " + text.image + " " + (current + 1)}
          language={language} className="!object-contain" />
      </button>
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-3 py-1.5 text-xs font-semibold text-white" aria-hidden="true">
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   VISIONNEUSE D'IMAGES EN PLEIN ÉCRAN
========================================================= */

function ImageViewer({
  viewer,
  language,
  onClose,
  onNavigate,
}: {
  viewer: ImageViewerData;

  language: Language;

  onClose: () => void;

  onNavigate: (index: number) => void;
}) {
  const text = translations[language];

  const dialogRef =
    useRef<HTMLDialogElement>(null);

  const count = viewer.images.length;

  const currentIndex = viewer.index;

  const currentImage =
    viewer.images[currentIndex];

  /* =======================================================
     OUVERTURE ET PROTECTION DU DÉFILEMENT
  ======================================================= */

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      document.body.style.overflow =
        previousOverflow;

      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  function previousImage() {
    onNavigate(
      (currentIndex - 1 + count) %
        count
    );
  }

  function nextImage() {
    onNavigate(
      (currentIndex + 1) % count
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={viewer.title}
      onCancel={(event) => {
        event.preventDefault();

        onClose();
      }}
      onKeyDown={(event) => {
        if (count <= 1) {
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();

          previousImage();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();

          nextImage();
        }
      }}
      className="
        fixed inset-0 m-0
        h-dvh max-h-none
        w-screen max-w-none
        overflow-hidden
        border-0 bg-[#071011]
        p-0 text-white
        backdrop:bg-black/95
      "
    >
      <div className="flex h-full flex-col">

        {/* ================================================
            EN-TÊTE DE LA VISIONNEUSE
        ================================================ */}

        <div
          className="
            flex shrink-0 items-center
            justify-between gap-4
            border-b border-white/10
            px-4 py-4 sm:px-7
          "
        >
          <div className="min-w-0">
            <p
              className="
                truncate text-sm
                font-semibold sm:text-base
              "
            >
              {viewer.title}
            </p>

            <p
              className="
                mt-1 text-xs
                text-white/60
              "
            >
              {currentIndex + 1}

              {" / "}

              {count}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={text.close}
            autoFocus
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-full bg-white/10
              text-white transition
              hover:bg-white/20
              focus-visible:ring-2
              focus-visible:ring-white
            "
          >
            <X size={24} />
          </button>
        </div>

        {/* ================================================
            IMAGE PRINCIPALE
        ================================================ */}

        <div
          className="
            relative flex min-h-0
            flex-1 items-center
            justify-center overflow-hidden
            p-3 sm:p-7
          "
        >
          <SafeNewsImage
            src={currentImage}
            alt={
              `${viewer.title} — ${text.image} ${currentIndex + 1}`
            }
            language={language}
            eager
            className="
              h-full! w-full!
              object-contain!
            "
          />

          {/* Navigation précédente */}

          {count > 1 && (
            <button
              type="button"
              onClick={previousImage}
              aria-label={text.previous}
              className="
                absolute left-3 top-1/2
                flex h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full bg-black/60
                text-white backdrop-blur-sm
                transition hover:bg-white/25
                focus-visible:ring-2
                focus-visible:ring-white
                sm:left-6 sm:h-14 sm:w-14
              "
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Navigation suivante */}

          {count > 1 && (
            <button
              type="button"
              onClick={nextImage}
              aria-label={text.next}
              className="
                absolute right-3 top-1/2
                flex h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full bg-black/60
                text-white backdrop-blur-sm
                transition hover:bg-white/25
                focus-visible:ring-2
                focus-visible:ring-white
                sm:right-6 sm:h-14 sm:w-14
              "
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>

        {/* ================================================
            MINIATURES DES IMAGES
        ================================================ */}

        {count > 1 && (
          <div
            className="
              flex shrink-0
              items-center justify-center
              gap-3 border-t
              border-white/10
              p-4
            "
          >
            {viewer.images.map(
              (image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    onNavigate(index);
                  }}
                  aria-label={
                    `${text.image} ${index + 1}`
                  }
                  aria-pressed={
                    currentIndex === index
                  }
                  className={`
                    h-14 w-20
                    overflow-hidden
                    rounded-lg border-2
                    transition
                    sm:h-16 sm:w-24

                    ${
                      currentIndex === index
                        ? "border-[#00b7c5] opacity-100"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }
                  `}
                >
                  <SafeNewsImage
                    src={image}
                    alt={
                      `${viewer.title} — ${text.image} ${index + 1}`
                    }
                    language={language}
                  />
                </button>
              )
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}

/* =========================================================
   CARTE D'UNE ACTUALITÉ
========================================================= */

function NewsCard({
  post,
  language,
  onOpenImages,
}: {
  post: PublicNewsPost;

  language: Language;

  onOpenImages: (
    data: ImageViewerData
  ) => void;
}) {
  const text = translations[language];

  const {
    title,
    description,
  } = getPostContent(
    post,
    language
  );

  const images = getSafeImages(
    post.images
  );

  const [expanded, setExpanded] =
    useState(false);

  const [shareStatus, setShareStatus] =
    useState<
      "idle" | "copied" | "error"
    >("idle");

  const descriptionLimit = 260;

  const longDescription =
    description.length >
    descriptionLimit;

  const visibleDescription =
    expanded || !longDescription
      ? description
      : `${description
          .slice(0, descriptionLimit)
          .trimEnd()}…`;

  const publishedDate =
    post.publishedAt ??
    post.createdAt;

  /* =======================================================
     RÉINITIALISER LE BOUTON DE PARTAGE
  ======================================================= */

  useEffect(() => {
    if (shareStatus === "idle") {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setShareStatus("idle");
      }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [shareStatus]);

  /* =======================================================
     PARTAGER LA PUBLICATION
  ======================================================= */

  async function sharePublication() {
    const url = new URL(
      window.location.href
    );

    url.hash = `actualite-${post.id}`;

    const shareUrl = url.toString();

    setShareStatus("idle");

    try {
      if (
        typeof navigator.share ===
        "function"
      ) {
        await navigator.share({
          title,

          text: description
            ? description.slice(0, 200)
            : title,

          url: shareUrl,
        });

        return;
      }

      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setShareStatus("copied");

        return;
      }

      setShareStatus("error");

    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return;
      }

      setShareStatus("error");
    }
  }

  return (
    <article
      id={`actualite-${post.id}`}
      className="
        flex h-full min-w-0
        scroll-mt-28 flex-col
        overflow-hidden
        rounded-[22px]
        border border-[#e0e8e9]
        bg-white
        shadow-[0_5px_24px_rgba(16,23,25,0.035)]
        transition-shadow
        duration-300
        hover:shadow-[0_10px_35px_rgba(0,125,136,0.08)]
        target:ring-2
        target:ring-[#0097a7]
      "
    >

      {/* ================================================
          IDENTITÉ DE LA PUBLICATION
      ================================================ */}

      <div
        className="
          flex items-center
          gap-3 px-4 py-4
          sm:px-5
        "
      >
        <div
          className="
            flex h-11 w-11
            shrink-0 items-center
            justify-center
            rounded-xl
            bg-[#e7f6f7]
            text-[#007d88]
          "
        >
          <Newspaper
            size={23}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              text-sm font-bold
              text-[#101719]
            "
          >
            {text.publishedBy}
          </p>

          <div
            className="
              mt-1 flex items-center
              gap-1.5 text-xs
              text-[#637477]
            "
          >
            <CalendarDays
              size={13}
              className="shrink-0"
            />

            <time dateTime={publishedDate}>
              {formatDate(
                publishedDate,
                language
              )}
            </time>
          </div>
        </div>
      </div>

      {/* ================================================
          IMAGES DE LA PUBLICATION
      ================================================ */}

      <NewsGallery
        images={images}
        title={title}
        language={language}
        onOpen={(index) => {
          onOpenImages({
            title,
            images,
            index,
          });
        }}
      />

      {/* ================================================
          CONTENU DE LA PUBLICATION
      ================================================ */}

      <div
        className="
          flex flex-1 flex-col
          px-5 pb-5 pt-5
          sm:px-6 sm:pb-6
        "
      >

        {/* Titre obligatoire */}

        <h3
          className="
            wrap-break-word text-xl
            font-extrabold
            leading-snug
            tracking-tight
            text-[#101719]
            sm:text-[22px]
          "
        >
          {title}
        </h3>

        {/* Description facultative */}

        {description && (
          <div className="mt-3">
            <p
              className="
                whitespace-pre-wrap
                wrap-break-word text-sm
                leading-[1.8]
                text-[#5f6d70]
                sm:text-[15px]
              "
            >
              {visibleDescription}
            </p>

            {longDescription && (
              <button
                type="button"
                onClick={() => {
                  setExpanded(
                    (previous) =>
                      !previous
                  );
                }}
                aria-expanded={expanded}
                className="
                  mt-3 inline-flex
                  items-center gap-1.5
                  text-sm font-bold
                  text-[#007d88]
                  hover:text-[#005e68]
                  hover:underline
                "
              >
                {expanded
                  ? text.readLess
                  : text.readMore}

                {expanded ? (
                  <ArrowLeft size={15} />
                ) : (
                  <ArrowRight size={15} />
                )}
              </button>
            )}
          </div>
        )}

        {/* ==============================================
            ACTIONS DE PUBLICATION
        ============================================== */}

        <div className="mt-auto pt-5">
          <div
            className="
              flex flex-wrap items-center
              justify-between gap-3
              border-t border-[#e8eeee]
              pt-4
            "
          >
            <span
              className="
                inline-flex items-center
                gap-1.5 text-xs
                font-medium
                text-[#637477]
              "
            >
              <Images
                size={15}
                className="text-[#0097a7]"
              />

              {images.length}

              {" "}

              {images.length === 1
                ? text.photo
                : text.photos}
            </span>

            <button
              type="button"
              onClick={sharePublication}
              className={`
                inline-flex items-center
                justify-center gap-2
                rounded-xl px-3.5 py-2.5
                text-xs font-bold
                transition
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#007d88]

                ${
                  shareStatus === "copied"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-[#eaf8f9] text-[#007d88] hover:bg-[#d7eff0]"
                }
              `}
            >
              {shareStatus === "copied" ? (
                <Check size={16} />
              ) : (
                <Share2 size={16} />
              )}

              {shareStatus === "copied"
                ? text.copied
                : text.share}
            </button>
          </div>

          <span
            aria-live="polite"
            className="sr-only"
          >
            {shareStatus === "copied"
              ? text.copied
              : ""}
          </span>

          {shareStatus === "error" && (
            <p
              role="status"
              className="
                mt-3 text-xs
                leading-relaxed
                text-[#a34a00]
              "
            >
              {text.shareError}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SECTION PRINCIPALE DES ACTUALITÉS
========================================================= */

export default function NewsFeedSection({
  posts,
}: NewsFeedSectionProps) {
  const router = useRouter();

  const { language } = useLanguage();

  const currentLanguage: Language =
    language === "en"
      ? "en"
      : "fr";

  const text =
    translations[currentLanguage];

  const [viewer, setViewer] =
    useState<ImageViewerData | null>(
      null
    );

  /* =======================================================
     TRI DES ACTUALITÉS

     Toutes les publications sont affichées.
     Les plus récentes apparaissent en premier.
  ======================================================= */

  const availablePosts = posts
    .filter(
      (post) =>
        typeof post.titleFr === "string" &&
        post.titleFr.trim().length > 0 &&
        getSafeImages(post.images).length > 0
    )
    .slice()
    .sort((first, second) => {
      const firstDate = getTimestamp(
        first.publishedAt ??
        first.createdAt
      );

      const secondDate = getTimestamp(
        second.publishedAt ??
        second.createdAt
      );

      return (
        secondDate - firstDate
      );
    });

  /* =======================================================
     ACTUALISATION AUTOMATIQUE

     PaymentMethodsSection possède déjà un
     rafraîchissement global de l'accueil.

     Si ce composant est monté, nous réutilisons
     son actualisation afin d'éviter deux requêtes
     simultanées toutes les 15 secondes.
  ======================================================= */

  useEffect(() => {
    function refreshNews() {
      if (
        document.visibilityState !==
          "visible" ||
        !navigator.onLine
      ) {
        return;
      }

      /*
       * Si la section des paiements est
       * rendue sur la page, son actualisation
       * rafraîchit déjà toutes les données.
       */

      const paymentSection =
        document.getElementById(
          "moyens-de-paiement"
        );

      if (paymentSection) {
        return;
      }

      router.refresh();
    }

    const interval =
      window.setInterval(
        refreshNews,
        REFRESH_INTERVAL
      );

    document.addEventListener(
      "visibilitychange",
      refreshNews
    );

    window.addEventListener(
      "online",
      refreshNews
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        refreshNews
      );

      window.removeEventListener(
        "online",
        refreshNews
      );
    };
  }, [router]);

  /* =======================================================
     NAVIGATION DE LA VISIONNEUSE
  ======================================================= */

  function navigateImage(
    index: number
  ) {
    setViewer((previous) => {
      if (!previous) {
        return null;
      }

      if (
        index < 0 ||
        index >= previous.images.length
      ) {
        return previous;
      }

      return {
        ...previous,
        index,
      };
    });
  }

  /* =======================================================
     AUCUNE ACTUALITÉ

     La section reste invisible si aucune
     publication n'est disponible.
  ======================================================= */

  if (availablePosts.length === 0) {
    return null;
  }

  return (
    <>
      <section
        id="actualites"
        aria-labelledby="news-feed-title"
        className="
          site-section relative
          isolate overflow-hidden
          bg-[#f6f9f9]
        "
      >

        {/* ================================================
            ÉLÉMENTS DÉCORATIFS
        ================================================ */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -left-52 -top-40
            -z-10 h-112.5 w-112.5
            rounded-full bg-[#dff3f4]
            opacity-70 blur-[110px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -bottom-52 -right-40
            -z-10 h-100 w-100
            rounded-full bg-[#fff0e5]
            opacity-60 blur-[110px]
          "
        />

        <div className="site-container relative">

          {/* ==============================================
              EN-TÊTE DE LA SECTION
          ============================================== */}

          <div
            className="
              mx-auto max-w-3xl
              text-center
            "
          >
            <div
              className="
                inline-flex items-center
                justify-center gap-2
              "
            >
              <Newspaper
                size={18}
                aria-hidden="true"
                className="text-[#f36c16]"
              />

              <p className="section-label">
                {text.label}
              </p>
            </div>

            <h2
              id="news-feed-title"
              className="section-title"
            >
              {text.title}
            </h2>

            <p
              className="
                mx-auto mt-4 max-w-2xl
                text-sm leading-relaxed
                text-[#5f6d70]
                sm:text-base
                sm:leading-relaxed
              "
            >
              {text.description}
            </p>
          </div>

          {/* ==============================================
              INFORMATIONS DES PUBLICATIONS
          ============================================== */}

          <div
            className="
              mb-5 mt-8 flex
              flex-wrap items-center
              justify-between gap-3
              sm:mb-6 sm:mt-10
            "
          >
            <div
              className="
                flex items-center
                gap-2
              "
            >
              <span
                aria-hidden="true"
                className="
                  h-2.5 w-2.5
                  rounded-full
                  bg-[#0097a7]
                "
              />

              <h3
                className="
                  text-sm font-bold
                  text-[#101719]
                  sm:text-base
                "
              >
                {text.allNews}
              </h3>

              <span
                className="
                  rounded-full
                  bg-[#e2f1f2]
                  px-2.5 py-1
                  text-xs font-bold
                  text-[#007d88]
                "
              >
                {availablePosts.length}
              </span>
            </div>

            <p
              className="
                text-xs font-medium
                text-[#637477]
              "
            >
              {text.latest}
            </p>
          </div>

          {/* ==============================================
              GRILLE DE TOUTES LES ACTUALITÉS

              Mobile : 1 colonne
              Tablette : 2 colonnes
              PC : 3 colonnes
          ============================================== */}

          <div
            className={`
              grid items-stretch
              gap-5 sm:gap-6

              ${
                availablePosts.length === 1
                  ? "mx-auto max-w-170 grid-cols-1"
                  : availablePosts.length === 2
                    ? "mx-auto max-w-5xl grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              }
            `}
          >
            {availablePosts.map(
              (post) => (
                <NewsCard
                  key={post.id}
                  post={post}
                  language={
                    currentLanguage
                  }
                  onOpenImages={
                    setViewer
                  }
                />
              )
            )}
          </div>

          {/* ==============================================
              NOMBRE TOTAL DES ACTUALITÉS
          ============================================== */}

          <div
            className="
              mt-8 flex items-center
              justify-center
              gap-2 text-center
            "
          >
            <span
              aria-hidden="true"
              className="
                h-px w-8
                bg-[#cbdfe1]
                sm:w-14
              "
            />

            <p
              className="
                text-xs font-medium
                text-[#637477]
                sm:text-sm
              "
            >
              {availablePosts.length}

              {" "}

              {availablePosts.length === 1
                ? text.publication
                : text.publications}
            </p>

            <span
              aria-hidden="true"
              className="
                h-px w-8
                bg-[#cbdfe1]
                sm:w-14
              "
            />
          </div>
        </div>
      </section>

      {/* ================================================
          VISIONNEUSE PLEIN ÉCRAN
      ================================================ */}

      {viewer && (
        <ImageViewer
          viewer={viewer}
          language={currentLanguage}
          onClose={() => {
            setViewer(null);
          }}
          onNavigate={navigateImage}
        />
      )}
    </>
  );
}
