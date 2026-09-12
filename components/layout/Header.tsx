"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu } from "lucide-react";

import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import MobileMenu from "@/components/layout/MobileMenu";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";

type MobileMenuState = Readonly<{
  open: boolean;
  openedAtPath: string;
}>;

const navigation = [
  {
    href: siteConfig.navigation.home,
    translationKey: "Header.home",
  },
  {
    href: siteConfig.navigation.about,
    translationKey: "Header.about",
  },
  {
    href: siteConfig.navigation.actions,
    translationKey: "Header.actions",
  },
  {
    href: siteConfig.navigation.transparency,
    translationKey: "Header.transparency",
  },
  {
    href: siteConfig.navigation.gallery,
    translationKey: "Header.gallery",
  },
  {
    href: siteConfig.navigation.news,
    translationKey: "Header.news",
  },
  {
    href: siteConfig.navigation.contact,
    translationKey: "Header.contact",
  },
] as const;

export default function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const [mobileMenu, setMobileMenu] =
    useState<MobileMenuState>({
      open: false,
      openedAtPath: "",
    });

  const [hasScrolled, setHasScrolled] = useState(false);

  /*
   * Le menu est considéré comme fermé automatiquement
   * dès que l’adresse de la page change.
   *
   * Cela évite un setState synchronisé dans un useEffect.
   */
  const mobileMenuOpen =
    mobileMenu.open &&
    mobileMenu.openedAtPath === pathname;

  useEffect(() => {
    const handleScroll = (): void => {
      setHasScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
   * Ferme le menu lorsqu’on passe à la version ordinateur.
   * Le changement d’état se produit dans l’événement resize,
   * et non directement dans le corps de l’effet.
   */
  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 1280) {
        setMobileMenu((currentMenu) => {
          if (!currentMenu.open) {
            return currentMenu;
          }

          return {
            ...currentMenu,
            open: false,
          };
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openMobileMenu = (): void => {
    setMobileMenu({
      open: true,
      openedAtPath: pathname,
    });
  };

  const closeMobileMenu = (): void => {
    setMobileMenu((currentMenu) => {
      if (!currentMenu.open) {
        return currentMenu;
      }

      return {
        ...currentMenu,
        open: false,
      };
    });
  };

  const isActiveLink = (href: string): boolean => {
    if (href === siteConfig.navigation.home) {
      return pathname === siteConfig.navigation.home;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 w-full bg-white",
          "transition-shadow duration-300",
          "max-xl:rounded-b-[32px]",
          hasScrolled
            ? "shadow-[0_10px_35px_rgba(7,31,33,0.10)]"
            : "shadow-[0_3px_16px_rgba(7,31,33,0.04)]",
        ].join(" ")}
      >
        <div className="site-container">
          <div
            className={[
              "grid h-[92px] grid-cols-[1fr_auto_1fr]",
              "items-center",
              "xl:flex xl:h-[82px] xl:justify-between xl:gap-7",
            ].join(" ")}
          >
            {/* Bouton du menu mobile */}

            <div className="flex justify-start xl:hidden">
              <button
                type="button"
                aria-label={t("Header.openMenu")}
                aria-expanded={mobileMenuOpen}
                aria-controls="young-caring-mobile-menu"
                onClick={openMobileMenu}
                className={[
                  "inline-flex h-12 w-12 items-center",
                  "justify-center rounded-full text-[#101719]",
                  "transition-colors hover:bg-[#eaf8f9]",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4",
                  "focus-visible:ring-[#0097a7]/20",
                ].join(" ")}
              >
                <Menu
                  aria-hidden="true"
                  size={29}
                  strokeWidth={2.2}
                />
              </button>
            </div>

            {/* Logo Young Caring */}

            <Link
              href={siteConfig.navigation.home}
              aria-label={`${t(
                "Accessibility.logoAlt"
              )} — ${t("Common.home")}`}
              className={[
                "relative flex shrink-0 items-center",
                "justify-center",
                "focus-visible:rounded-xl",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#0097a7]/20",
              ].join(" ")}
            >
              <Image
                src={siteConfig.organization.logo}
                alt={t("Accessibility.logoAlt")}
                width={158}
                height={78}
                priority
                sizes="(max-width: 1279px) 92px, 142px"
                className={[
                  "h-auto w-[92px] object-contain",
                  "xl:w-[142px]",
                ].join(" ")}
              />
            </Link>

            {/* Navigation ordinateur */}

            <nav
              aria-label={t("Header.navigationLabel")}
              className={[
                "hidden min-w-0 flex-1 items-center",
                "justify-center xl:flex",
              ].join(" ")}
            >
              <ul className="flex items-center justify-center gap-1 2xl:gap-2">
                {navigation.map((item) => {
                  const active = isActiveLink(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={
                          active ? "page" : undefined
                        }
                        className={[
                          "relative inline-flex min-h-11",
                          "items-center whitespace-nowrap px-3",
                          "text-[0.82rem] font-semibold",
                          "transition-colors duration-200",
                          "focus-visible:rounded-lg",
                          "focus-visible:outline-none",
                          "focus-visible:ring-4",
                          "focus-visible:ring-[#0097a7]/20",
                          active
                            ? "text-[#f36c16]"
                            : [
                                "text-[#101719]",
                                "hover:text-[#007d88]",
                              ].join(" "),
                        ].join(" ")}
                      >
                        {t(item.translationKey)}

                        <span
                          aria-hidden="true"
                          className={[
                            "absolute inset-x-3 bottom-0",
                            "h-0.5 rounded-full bg-[#f36c16]",
                            "transition-transform duration-300",
                            active
                              ? "scale-x-100"
                              : "scale-x-0",
                          ].join(" ")}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Actions ordinateur */}

            <div className="hidden shrink-0 items-center gap-3 xl:flex">
              <LanguageSwitcher />

              <Link
                href={siteConfig.navigation.donation}
                className="button-primary min-w-[142px]"
              >
                <Heart
                  aria-hidden="true"
                  size={18}
                  fill="currentColor"
                />

                <span>{t("Header.donate")}</span>
              </Link>
            </div>

            {/* Bouton de don mobile */}

            <div className="flex justify-end xl:hidden">
              <Link
                href={siteConfig.navigation.donation}
                className={[
                  "inline-flex min-h-12 items-center",
                  "justify-center gap-2 whitespace-nowrap",
                  "rounded-full bg-[#f36c16] px-4",
                  "text-[0.78rem] font-extrabold text-white",
                  "shadow-[0_10px_24px_rgba(243,108,22,0.24)]",
                  "transition-all hover:bg-[#d95709]",
                  "active:scale-[0.97]",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4",
                  "focus-visible:ring-[#f36c16]/30",
                  "sm:px-5 sm:text-sm",
                ].join(" ")}
              >
                <Heart
                  aria-hidden="true"
                  size={17}
                  fill="currentColor"
                />

                <span>{t("Header.donate")}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        pathname={pathname}
        onClose={closeMobileMenu}
      />
    </>
  );
}