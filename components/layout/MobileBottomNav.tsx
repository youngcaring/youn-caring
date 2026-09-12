"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HandHeart,
  Heart,
  Home,
  Newspaper,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type NavigationItem = Readonly<{
  href: string;
  translationKey: string;
  icon: LucideIcon;
  primary: boolean;
}>;

const navigation: readonly NavigationItem[] = [
  {
    href: "/",
    translationKey: "MobileNavigation.home",
    icon: Home,
    primary: false,
  },
  {
    href: "/actions",
    translationKey: "MobileNavigation.actions",
    icon: HandHeart,
    primary: false,
  },
  {
    href: "/don",
    translationKey: "MobileNavigation.donate",
    icon: Heart,
    primary: true,
  },
  {
    href: "/actualites",
    translationKey: "MobileNavigation.news",
    icon: Newspaper,
    primary: false,
  },
  {
    href: "/contact",
    translationKey: "MobileNavigation.contact",
    icon: UserRound,
    primary: false,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const currentPathname = pathname || "/";

  const isActiveLink = (href: string): boolean => {
    if (href === "/") {
      return currentPathname === "/";
    }

    return (
      currentPathname === href ||
      currentPathname.startsWith(`${href}/`)
    );
  };

  return (
    <nav
      aria-label={t("MobileNavigation.navigationLabel")}
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#e3e9ea] bg-white/95 shadow-[0_-10px_35px_rgba(7,31,33,0.10)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-[76px] max-w-[620px] grid-cols-5 px-1">
        {navigation.map((item) => {
          const active = isActiveLink(item.href);
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={t(item.translationKey)}
                className="relative flex min-w-0 flex-col items-center justify-end pb-2 focus-visible:z-10"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "absolute -top-6 inline-flex h-[62px] w-[76px]",
                    "items-center justify-center rounded-[30px]",
                    "bg-[#f36c16] text-white",
                    "shadow-[0_12px_28px_rgba(243,108,22,0.34)]",
                    "transition-all duration-200",
                    "hover:bg-[#d95709] active:scale-95",
                    active
                      ? "ring-4 ring-[#f36c16]/20"
                      : "",
                  ].join(" ")}
                >
                  <Icon
                    size={29}
                    strokeWidth={2.2}
                    fill="currentColor"
                  />
                </span>

                <span className="max-w-full truncate px-1 text-center text-[0.68rem] font-extrabold text-[#f36c16]">
                  {t(item.translationKey)}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={t(item.translationKey)}
              className={[
                "relative flex min-w-0 flex-col",
                "items-center justify-center gap-1 px-1 pt-1",
                "transition-colors duration-200",
                "focus-visible:z-10",
                active
                  ? "text-[#f36c16]"
                  : "text-[#101719] hover:text-[#007d88]",
              ].join(" ")}
            >
              <Icon
                aria-hidden="true"
                size={23}
                strokeWidth={active ? 2.5 : 2}
                fill={
                  active && item.href === "/"
                    ? "currentColor"
                    : "none"
                }
              />

              <span className="max-w-full truncate text-center text-[0.66rem] font-bold">
                {t(item.translationKey)}
              </span>

              {active && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 h-[3px] w-7 rounded-full bg-[#f36c16]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}