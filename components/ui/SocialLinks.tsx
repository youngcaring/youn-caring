"use client";

import type { SVGProps } from "react";

import { siteConfig, type SocialNetwork } from "@/config/site";
import { useLanguage } from "@/components/providers/LanguageProvider";

type BrandIconProps = SVGProps<SVGSVGElement>;

function FacebookIcon(props: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.438H7.078v-3.489h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.974h-1.513c-1.49 0-1.956.931-1.956 1.887v2.26h3.328l-.532 3.489h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}

function InstagramIcon(props: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM17 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

function TikTokIcon(props: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M16.6 2c.2 1.7 1.2 3.2 2.7 4.1A7.2 7.2 0 0 0 22 7v3.4a10.6 10.6 0 0 1-5.4-1.5v7.2a6.1 6.1 0 1 1-5.3-6.1v3.5a2.7 2.7 0 1 0 1.9 2.6V2h3.4Z" />
    </svg>
  );
}

const brandIcons: Partial<
  Record<SocialNetwork, (props: BrandIconProps) => React.ReactNode>
> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

type SocialLinksProps = Readonly<{
  className?: string;
  showLabels?: boolean;
}>;

export default function SocialLinks({
  className = "",
  showLabels = false,
}: SocialLinksProps) {
  const { t } = useLanguage();

  const activeSocialLinks = siteConfig.socialLinks.filter(
    (socialLink) => socialLink.enabled && Boolean(socialLink.url)
  );

  if (activeSocialLinks.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${className}`.trim()}
      aria-label={t("Footer.followUsTitle")}
    >
      {activeSocialLinks.map((socialLink) => {
        const Icon = brandIcons[socialLink.name];

        if (!Icon || !socialLink.url) {
          return null;
        }

        const translationKey =
          `Footer.${socialLink.name}Label`;

        return (
          <a
            key={socialLink.name}
            href={socialLink.url}
            target="_blank"
            rel={siteConfig.security.externalLinksRel}
            aria-label={t(translationKey)}
            title={socialLink.label}
            className={[
              "group inline-flex min-h-11 items-center gap-2",
              "rounded-full border border-white/15",
              "bg-white/[0.06] px-3 text-white/75",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:border-[#0097a7]",
              "hover:bg-[#0097a7] hover:text-white",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />

            {showLabels && (
              <span className="text-xs font-bold">
                {socialLink.label}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}