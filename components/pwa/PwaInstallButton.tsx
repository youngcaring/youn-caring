"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Download,
  Share,
  Smartphone,
  X,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type BeforeInstallPromptEvent =
  Event & {
    prompt: () => Promise<void>;

    userChoice: Promise<
      Readonly<{
        outcome:
          | "accepted"
          | "dismissed";

        platform: string;
      }>
    >;
  };

function getStandaloneSnapshot():
  boolean {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  const navigatorWithStandalone =
    window.navigator as Navigator & {
      standalone?: boolean;
    };

  return (
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches ||
    navigatorWithStandalone
      .standalone === true
  );
}

function getServerStandaloneSnapshot():
  boolean {
  return false;
}

function subscribeToStandaloneMode(
  callback: () => void
): () => void {
  if (
    typeof window === "undefined"
  ) {
    return () => undefined;
  }

  const mediaQuery =
    window.matchMedia(
      "(display-mode: standalone)"
    );

  const notify = () => {
    callback();
  };

  mediaQuery.addEventListener(
    "change",
    notify
  );

  window.addEventListener(
    "appinstalled",
    notify
  );

  return () => {
    mediaQuery.removeEventListener(
      "change",
      notify
    );

    window.removeEventListener(
      "appinstalled",
      notify
    );
  };
}

function getAppleDeviceSnapshot():
  boolean {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  const userAgent =
    window.navigator.userAgent;

  const traditionalAppleDevice =
    /iphone|ipad|ipod/i.test(
      userAgent
    );

  /*
   * Certains iPad récents utilisent
   * un User-Agent semblable à macOS.
   */
  const modernIPad =
    window.navigator.platform ===
      "MacIntel" &&
    window.navigator.maxTouchPoints >
      1;

  return (
    traditionalAppleDevice ||
    modernIPad
  );
}

function getServerAppleDeviceSnapshot():
  boolean {
  return false;
}

/*
 * Le type d’appareil ne change normalement
 * pas pendant la session.
 */
function subscribeToAppleDevice():
  () => void {
  return () => undefined;
}

export default function PwaInstallButton() {
  const { language } = useLanguage();

  const isFrench =
    language === "fr";

  const standaloneMode =
    useSyncExternalStore(
      subscribeToStandaloneMode,
      getStandaloneSnapshot,
      getServerStandaloneSnapshot
    );

  const isAppleDevice =
    useSyncExternalStore(
      subscribeToAppleDevice,
      getAppleDeviceSnapshot,
      getServerAppleDeviceSnapshot
    );

  const [
    installPrompt,
    setInstallPrompt,
  ] =
    useState<BeforeInstallPromptEvent | null>(
      null
    );

  const [
    installationCompleted,
    setInstallationCompleted,
  ] = useState(false);

  const [
    showAppleInstructions,
    setShowAppleInstructions,
  ] = useState(false);

  const [
    isDismissed,
    setIsDismissed,
  ] = useState(false);

  const [
    installationInProgress,
    setInstallationInProgress,
  ] = useState(false);

  const isInstalled =
    standaloneMode ||
    installationCompleted;

  useEffect(() => {
    function handleBeforeInstallPrompt(
      event: Event
    ): void {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    }

    function handleAppInstalled():
      void {
      setInstallationCompleted(true);
      setInstallPrompt(null);

      setShowAppleInstructions(
        false
      );

      setInstallationInProgress(
        false
      );
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  /*
   * Ferme la fenêtre iOS avec la touche Échap.
   */
  useEffect(() => {
    if (
      !showAppleInstructions
    ) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ): void {
      if (event.key === "Escape") {
        setShowAppleInstructions(
          false
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [showAppleInstructions]);

  async function handleInstall():
    Promise<void> {
    if (isAppleDevice) {
      setShowAppleInstructions(
        true
      );

      return;
    }

    if (
      !installPrompt ||
      installationInProgress
    ) {
      return;
    }

    setInstallationInProgress(
      true
    );

    try {
      await installPrompt.prompt();

      const choice =
        await installPrompt.userChoice;

      /*
       * Un événement beforeinstallprompt
       * ne peut être utilisé qu’une seule fois.
       */
      setInstallPrompt(null);

      if (
        choice.outcome === "accepted"
      ) {
        setInstallationCompleted(
          true
        );
      }
    } catch (error: unknown) {
      console.error(
        "PWA installation request failed:",
        error instanceof Error
          ? error.name
          : "UNKNOWN_ERROR"
      );
    } finally {
      setInstallationInProgress(
        false
      );
    }
  }

  function closeInstallMessage():
    void {
    setIsDismissed(true);

    setShowAppleInstructions(
      false
    );
  }

  function closeAppleInstructions():
    void {
    setShowAppleInstructions(
      false
    );
  }

  if (
    isInstalled ||
    isDismissed ||
    (
      !installPrompt &&
      !isAppleDevice
    )
  ) {
    return null;
  }

  return (
    <>
      <aside
        aria-label={
          isFrench
            ? "Installer l’application Young Caring"
            : "Install the Young Caring application"
        }
        className={[
          "fixed bottom-24",
          "left-4 right-4 z-[70]",
          "mx-auto max-w-md",
          "rounded-[24px] border",
          "border-[#dce7e8]",
          "bg-white p-4",
          "shadow-[0_20px_55px_rgba(7,31,33,0.20)]",
          "md:bottom-6",
          "md:left-auto md:right-6",
          "md:mx-0 md:w-[390px]",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={
            closeInstallMessage
          }
          aria-label={
            isFrench
              ? "Fermer le message d’installation"
              : "Close the installation message"
          }
          className={[
            "absolute right-3 top-3",
            "grid h-9 w-9",
            "place-items-center",
            "rounded-full",
            "text-[#59686b]",
            "transition",
            "hover:bg-[#f0f5f5]",
            "focus-visible:outline-none",
            "focus-visible:ring-4",
            "focus-visible:ring-[#0097a7]/20",
          ].join(" ")}
        >
          <X
            aria-hidden="true"
            size={18}
          />
        </button>

        <div className="flex items-start gap-4 pr-9">
          <span
            aria-hidden="true"
            className={[
              "grid h-12 w-12",
              "shrink-0",
              "place-items-center",
              "rounded-2xl",
              "bg-[#e8f7f8]",
              "text-[#007d88]",
            ].join(" ")}
          >
            <Smartphone
              size={24}
            />
          </span>

          <div>
            <h2 className="text-base font-black text-[#101719]">
              {isFrench
                ? "Installer Young Caring"
                : "Install Young Caring"}
            </h2>

            <p className="mt-1 text-sm leading-5 text-[#5f6d70]">
              {isFrench
                ? "Ajoutez Young Caring à votre téléphone pour accéder plus rapidement au site."
                : "Add Young Caring to your phone for faster access to the website."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={
            installationInProgress
          }
          aria-busy={
            installationInProgress
          }
          onClick={() => {
            void handleInstall();
          }}
          className={[
            "mt-4 inline-flex",
            "min-h-11 w-full",
            "items-center",
            "justify-center gap-2",
            "rounded-full",
            "bg-[#f36c16]",
            "px-5 text-sm",
            "font-extrabold",
            "text-white",
            "transition",
            "hover:bg-[#d9580b]",
            "disabled:cursor-not-allowed",
            "disabled:opacity-65",
            "focus-visible:outline-none",
            "focus-visible:ring-4",
            "focus-visible:ring-[#f36c16]/25",
          ].join(" ")}
        >
          <Download
            aria-hidden="true"
            size={18}
          />

          {installationInProgress
            ? isFrench
              ? "Installation en cours…"
              : "Installing…"
            : isFrench
              ? "Installer l’application"
              : "Install the application"}
        </button>
      </aside>

      {showAppleInstructions && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          aria-describedby="ios-install-description"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAppleInstructions();
            }
          }}
          className={[
            "fixed inset-0 z-[100]",
            "flex items-end",
            "justify-center",
            "bg-[#071f21]/70 p-4",
            "backdrop-blur-sm",
            "sm:items-center",
          ].join(" ")}
        >
          <div
            className={[
              "relative w-full",
              "max-w-md",
              "rounded-[28px]",
              "bg-white p-6",
              "text-[#101719]",
              "shadow-[0_24px_70px_rgba(0,0,0,0.30)]",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={
                closeAppleInstructions
              }
              aria-label={
                isFrench
                  ? "Fermer les instructions"
                  : "Close instructions"
              }
              className={[
                "absolute right-4 top-4",
                "grid h-10 w-10",
                "place-items-center",
                "rounded-full",
                "bg-[#f1f5f5]",
                "transition",
                "hover:bg-[#e3ebec]",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#0097a7]/20",
              ].join(" ")}
            >
              <X
                aria-hidden="true"
                size={19}
              />
            </button>

            <span
              aria-hidden="true"
              className={[
                "grid h-14 w-14",
                "place-items-center",
                "rounded-2xl",
                "bg-[#e8f7f8]",
                "text-[#007d88]",
              ].join(" ")}
            >
              <Share size={26} />
            </span>

            <h2
              id="ios-install-title"
              className={[
                "mt-5 pr-10",
                "text-2xl font-black",
              ].join(" ")}
            >
              {isFrench
                ? "Installation sur iPhone ou iPad"
                : "Installation on iPhone or iPad"}
            </h2>

            <p
              id="ios-install-description"
              className="mt-3 text-sm leading-6 text-[#5f6d70]"
            >
              {isFrench
                ? "L’installation s’effectue directement depuis le menu de partage du navigateur."
                : "Installation is completed directly from the browser’s sharing menu."}
            </p>

            <ol className="mt-5 space-y-4 text-sm leading-6 text-[#4f5e61]">
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="font-black text-[#f36c16]"
                >
                  1.
                </span>

                <span>
                  {isFrench
                    ? "Ouvrez cette page avec Safari."
                    : "Open this page using Safari."}
                </span>
              </li>

              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="font-black text-[#f36c16]"
                >
                  2.
                </span>

                <span>
                  {isFrench
                    ? "Appuyez sur le bouton Partager dans la barre de Safari."
                    : "Tap the Share button in the Safari toolbar."}
                </span>
              </li>

              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="font-black text-[#f36c16]"
                >
                  3.
                </span>

                <span>
                  {isFrench
                    ? "Sélectionnez « Sur l’écran d’accueil », puis appuyez sur « Ajouter »."
                    : "Select “Add to Home Screen”, then tap “Add”."}
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={
                closeAppleInstructions
              }
              className="button-primary mt-6 w-full"
            >
              {isFrench
                ? "J’ai compris"
                : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}