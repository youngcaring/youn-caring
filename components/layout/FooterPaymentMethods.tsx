"use client";

import Image from "next/image";

type FooterPaymentMethodsProps =
  Readonly<{
    className?: string;
  }>;

export default function FooterPaymentMethods({
  className = "",
}: FooterPaymentMethodsProps) {
  return (
    <div
      aria-label="Moyens de paiement disponibles"
      className={[
        "min-w-0",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "overflow-x-auto",
          "overscroll-x-contain",
          "scroll-smooth",
          "[scrollbar-width:none]",
          "[&::-webkit-scrollbar]:hidden",
        ].join(" ")}
      >
        <div
          className={[
            "relative",
            "min-w-[620px]",
            "max-w-[760px]",
          ].join(" ")}
        >
          <Image
            src="/images/payments/payment-methods.png"
            alt="Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, Google Pay, MTN Mobile Money, Orange Money et Airtel Money"
            width={2048}
            height={682}
            sizes={[
              "(max-width: 767px) 620px",
              "(max-width: 1199px) 680px",
              "760px",
            ].join(", ")}
            className={[
              "h-auto w-full",
              "select-none object-contain",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}