"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useLanguage } from "@/components/providers/LanguageProvider";

type MobileMenuProps = Readonly<{
  open: boolean;
  pathname: string;
  onClose: () => void;
}>;

const navigation = [
  { href: "/", translationKey: "Header.home" },
  { href: "/a-propos", translationKey: "Header.about" },
  { href: "/actions", translationKey: "Header.actions" },
  { href: "/transparence", translationKey: "Header.transparency" },
  { href: "/galerie", translationKey: "Header.gallery" },
  { href: "/actualites", translationKey: "Header.news" },
  { href: "/contact", translationKey: "Header.contact" },
] as const;

export default function MobileMenu({
  open,
  pathname,
  onClose,
}: MobileMenuProps) {
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("mobile-menu-open");
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.classList.add("mobile-menu-open");

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div
      id="young-caring-mobile-menu"
      className="fixed inset-0 z-[100] xl:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
    >
      {/* Arrière-plan */}

      <button
        type="button"
        aria-label={t("Header.closeMenu")}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#091719]/70 backdrop-blur-[3px]"
      />

      {/* Panneau */}

      <div className="animate-slide-left absolute inset-y-0 left-0 flex w-[min(88%,390px)] flex-col overflow-y-auto bg-white shadow-[20px_0_70px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between border-b border-[#e3e9ea] px-5 py-4">
          <Link
            href="/"
            onClick={onClose}
            aria-label={t("Common.home")}
            className="inline-flex items-center"
          >
            <Image
              src="/logo/logo.png"
              alt={t("Accessibility.logoAlt")}
              width={128}
              height={68}
              priority
              className="h-auto w-[112px] object-contain"
            />
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t("Header.closeMenu")}
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e3e9ea] text-[#101719] transition-colors hover:bg-[#eaf8f9] hover:text-[#007d88]"
          >
            <X aria-hidden="true" size={24} />
          </button>
        </div>

        <div className="border-b border-[#e3e9ea] px-5 py-4">
          <p
            id="mobile-menu-title"
            className="mb-3 text-xs font-extrabold tracking-[0.1em] text-[#007d88] uppercase"
          >
            {t("Header.menuTitle")}
          </p>

          <LanguageSwitcher />
        </div>

        <nav
          aria-label={t("Header.navigationLabel")}
          className="flex-1 px-4 py-4"
        >
          <ul className="space-y-1">
            {navigation.map((item) => {
              const active = isActiveLink(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex min-h-13 items-center justify-between",
                      "rounded-xl px-4 py-3 text-[0.96rem] font-bold",
                      "transition-colors duration-200",
                      active
                        ? "bg-[#fff1e8] text-[#f36c16]"
                        : "text-[#101719] hover:bg-[#eaf8f9] hover:text-[#007d88]",
                    ].join(" ")}
                  >
                    <span>{t(item.translationKey)}</span>

                    <ChevronRight
                      aria-hidden="true"
                      size={18}
                      className={active ? "text-[#f36c16]" : "text-[#829093]"}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[#e3e9ea] p-5">
          <Link
            href="/don"
            onClick={onClose}
            className="button-primary w-full"
          >
            <Heart
              aria-hidden="true"
              size={19}
              fill="currentColor"
            />

            {t("Header.donate")}
          </Link>

          <div className="mt-5 space-y-3 text-sm text-[#5f6d70]">
            <a
              href="tel:+2290157774673"
              className="flex items-center gap-3 transition-colors hover:text-[#007d88]"
            >
              <Phone
                aria-hidden="true"
                size={17}
                className="text-[#0097a7]"
              />

              <span>+229 01 57 77 46 73</span>
            </a>

            <a
              href="mailto:contact@young-caring.org"
              className="flex items-center gap-3 break-all transition-colors hover:text-[#007d88]"
            >
              <Mail
                aria-hidden="true"
                size={17}
                className="shrink-0 text-[#0097a7]"
              />

              <span>contact@young-caring.org</span>
            </a>

            <div className="flex items-center gap-3">
              <MapPin
                aria-hidden="true"
                size={17}
                className="shrink-0 text-[#0097a7]"
              />

              <span>Abomey-Calavi, Bénin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}