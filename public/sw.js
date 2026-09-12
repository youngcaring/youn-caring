/*
 * Service Worker officiel de Young Caring.
 *
 * Principes :
 * - réseau prioritaire pour les pages ;
 * - cache prioritaire pour les ressources statiques ;
 * - aucune mise en cache des API ;
 * - aucun traitement des requêtes externes ;
 * - suppression des anciennes versions du cache.
 */

const CACHE_PREFIX = "young-caring-";
const CACHE_NAME = `${CACHE_PREFIX}v3`;

const OFFLINE_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
];

/*
 * Vérifie qu’une réponse peut être placée dans le cache.
 */
function isCacheableResponse(response) {
  if (!response) {
    return false;
  }

  if (!response.ok) {
    return false;
  }

  if (response.type !== "basic") {
    return false;
  }

  const cacheControl =
    response.headers.get("cache-control") ?? "";

  return !cacheControl
    .toLowerCase()
    .includes("no-store");
}

/*
 * Ajoute une réponse dans le cache sans empêcher
 * la navigation si la mise en cache échoue.
 */
async function storeResponse(
  request,
  response
) {
  if (!isCacheableResponse(response)) {
    return;
  }

  try {
    const cache =
      await caches.open(CACHE_NAME);

    await cache.put(
      request,
      response.clone()
    );
  } catch {
    /*
     * Une erreur de cache ne doit jamais
     * bloquer le fonctionnement du site.
     */
  }
}

/*
 * Installation du service worker.
 *
 * Chaque ressource est traitée séparément :
 * une image manquante ne bloque donc pas
 * toute l’installation de l’application.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          OFFLINE_ASSETS.map((asset) =>
            cache.add(asset)
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

/*
 * Activation et suppression uniquement
 * des anciennes caches de Young Caring.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        const obsoleteCaches =
          cacheNames.filter(
            (cacheName) =>
              cacheName.startsWith(
                CACHE_PREFIX
              ) &&
              cacheName !== CACHE_NAME
          );

        return Promise.all(
          obsoleteCaches.map((cacheName) =>
            caches.delete(cacheName)
          )
        );
      })
      .then(() => self.clients.claim())
  );
});

/*
 * Gestion des requêtes GET du site.
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  /*
   * Le service worker ignore :
   * - les requêtes autres que GET ;
   * - les domaines externes ;
   * - les API ;
   * - les requêtes contenant une autorisation ;
   * - les requêtes partielles audio ou vidéo.
   */
  if (
    request.method !== "GET" ||
    requestUrl.origin !==
      self.location.origin ||
    requestUrl.pathname.startsWith(
      "/api/"
    ) ||
    request.headers.has("authorization") ||
    request.headers.has("range")
  ) {
    return;
  }

  /*
   * Les pages utilisent une stratégie réseau prioritaire.
   *
   * L’utilisateur reçoit toujours la version récente
   * lorsque la connexion fonctionne.
   */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (
            isCacheableResponse(
              networkResponse
            )
          ) {
            event.waitUntil(
              storeResponse(
                request,
                networkResponse
              )
            );
          }

          return networkResponse;
        })
        .catch(async () => {
          /*
           * En absence de connexion, recherche
           * d’abord la page visitée dans le cache.
           */
          const cachedPage =
            await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }

          /*
           * La page d’accueil est utilisée seulement
           * si elle a déjà été visitée et mise en cache.
           */
          const cachedHome =
            await caches.match("/");

          if (cachedHome) {
            return cachedHome;
          }

          return new Response(
            [
              "<!doctype html>",
              '<html lang="fr">',
              "<head>",
              '<meta charset="utf-8">',
              '<meta name="viewport" content="width=device-width,initial-scale=1">',
              "<title>Young Caring — Hors connexion</title>",
              "<style>",
              "body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;font-family:Arial,sans-serif;background:#f7f9f9;color:#101719;text-align:center}",
              "main{max-width:480px;background:#fff;padding:40px 28px;border-radius:28px;box-shadow:0 20px 55px rgba(7,31,33,.12)}",
              "h1{margin:0;font-size:28px}",
              "p{margin:16px 0 0;line-height:1.6;color:#5f6d70}",
              "button{margin-top:24px;border:0;border-radius:999px;background:#f36c16;color:#fff;padding:14px 22px;font-weight:800;cursor:pointer}",
              "</style>",
              "</head>",
              "<body>",
              "<main>",
              "<h1>Connexion indisponible</h1>",
              "<p>Vérifiez votre connexion Internet, puis réessayez pour accéder au site Young Caring.</p>",
              '<button onclick="window.location.reload()">Réessayer</button>',
              "</main>",
              "</body>",
              "</html>",
            ].join(""),
            {
              status: 503,
              statusText:
                "Service Unavailable",
              headers: {
                "Content-Type":
                  "text/html; charset=utf-8",
                "Cache-Control":
                  "no-store",
              },
            }
          );
        })
    );

    return;
  }

  /*
   * Seules les ressources statiques utiles
   * peuvent être conservées dans le cache.
   */
  const cacheableDestinations = [
    "image",
    "style",
    "script",
    "font",
  ];

  const isStaticResource =
    cacheableDestinations.includes(
      request.destination
    ) ||
    requestUrl.pathname ===
      "/manifest.webmanifest";

  if (!isStaticResource) {
    return;
  }

  /*
   * Ressources statiques :
   * cache prioritaire, puis réseau.
   */
  event.respondWith(
    caches.match(request).then(
      async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        const networkResponse =
          await fetch(request);

        if (
          isCacheableResponse(
            networkResponse
          )
        ) {
          event.waitUntil(
            storeResponse(
              request,
              networkResponse
            )
          );
        }

        return networkResponse;
      }
    )
  );
});