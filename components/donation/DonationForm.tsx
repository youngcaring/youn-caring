"use client";

import { useState, type FormEvent } from "react";
import { Heart, LockKeyhole } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getDonationLimits } from "@/data/donation";
import type { DonationCheckoutResponse, DonationCurrency } from "@/types/donation";

export default function DonationForm() {
  const { language } = useLanguage();
  const fr = language === "fr";
  const [currency, setCurrency] = useState<DonationCurrency>("XOF");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const limits = getDonationLimits(currency);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    const value = Number(amount);
    const digits = phone.replace(/\D/g, "");
    if (!Number.isSafeInteger(value) || value < limits.minimum || value > limits.maximum) {
      setError(fr ? `Le montant doit être compris entre ${limits.minimum} et ${limits.maximum} ${currency}.` : `The amount must be between ${limits.minimum} and ${limits.maximum} ${currency}.`);
      return;
    }
    if (!/^\+?[0-9\s().-]+$/.test(phone) || digits.length < 6 || digits.length > 20) {
      setError(fr ? "Veuillez saisir un numéro de téléphone valide." : "Please enter a valid telephone number.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/donations/checkout", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin", cache: "no-store",
        body: JSON.stringify({ frequency: "once", amount: value, currency, allocation: "priority",
          donor: { firstName: "", lastName: "", email: email.trim(), phone: phone.trim(), country: null, anonymous: true, consent } }),
      });
      const result = await response.json() as DonationCheckoutResponse;
      if (!response.ok || !result.success || !result.checkoutUrl) throw new Error(["PAYMENT_STORAGE_ERROR", "PAYMENT_SERVICE_NOT_CONFIGURED", "PAYMENT_SERVICE_UNAVAILABLE"].includes(result.error ?? "") ? "service-unavailable" : "checkout");
      const url = new URL(result.checkoutUrl, window.location.origin);
      const moneroo = url.protocol === "https:" && (url.hostname === "moneroo.io" || url.hostname.endsWith(".moneroo.io"));
      if (url.username || url.password || (!moneroo && url.origin !== window.location.origin)) throw new Error("url");
      window.location.assign(url.href);
    } catch (cause) {
      const unavailable = cause instanceof Error && cause.message === "service-unavailable";
      setError(unavailable ? (fr ? "Le service de paiement est temporairement indisponible. Veuillez r\u00e9essayer plus tard." : "The payment service is temporarily unavailable. Please try again later.") : (fr ? "Le paiement n\u2019a pas pu \u00eatre pr\u00e9par\u00e9. Veuillez r\u00e9essayer." : "The payment could not be prepared. Please try again."));
      setSubmitting(false);
    }
  }

  const field = "mt-2 h-12 w-full rounded-xl border border-[#ccd9da] bg-white px-4 outline-none focus:border-[#0097a7] focus:ring-4 focus:ring-[#0097a7]/10";
  return (
    <section id="formulaire-don" className="site-section bg-[#f7f9f9]">
      <div className="site-container mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <p className="section-label">Young Caring</p>
          <h1 className="section-title">{fr ? "Faire un don" : "Make a donation"}</h1>
          <p className="mt-3 text-[#5f6d70]">{fr ? "Votre générosité nous aide à agir. Merci !" : "Your generosity helps us take action. Thank you!"}</p>
        </div>
        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-[#e0e8e9] bg-white p-5 shadow-[0_12px_35px_rgba(7,31,33,0.07)] sm:p-8">
          <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
            <label className="block text-sm font-bold">{fr ? "Montant du don" : "Donation amount"}
              <input className={field} type="text" inputMode="numeric" required maxLength={10} value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder={fr ? "Votre montant" : "Your amount"} />
            </label>
            <label className="block text-sm font-bold">{fr ? "Devise" : "Currency"}
              <select className={field} value={currency} onChange={(e) => setCurrency(e.target.value as DonationCurrency)}><option value="XOF">FCFA</option><option value="EUR">EUR</option><option value="USD">USD</option></select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">{fr ? "Adresse e-mail" : "Email address"}
              <input className={field} type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@email.com" />
            </label>
            <label className="block text-sm font-bold">{fr ? "Téléphone" : "Telephone"}
              <input className={field} type="tel" autoComplete="tel" required maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 01 00 00 00 00" />
            </label>
          </div>
          <label className="flex items-start gap-3 text-sm leading-6 text-[#526366]">
            <input className="mt-1 h-4 w-4 shrink-0 accent-[#0097a7]" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            {fr ? "J’accepte l’utilisation de mes informations pour traiter et confirmer mon don." : "I agree to the use of my information to process and confirm my donation."}
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="button-primary w-full"><Heart size={18} aria-hidden="true" />{submitting ? (fr ? "Préparation…" : "Preparing…") : (fr ? "Continuer vers le paiement" : "Continue to payment")}</button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-[#647275]"><LockKeyhole size={15} aria-hidden="true" />{fr ? "Paiement sécurisé par Moneroo" : "Secure payment by Moneroo"}</p>
        </form>
      </div>
    </section>
  );
}
