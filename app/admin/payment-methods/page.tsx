import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATH = "/admin/payment-methods";

/* =========================================================
   MOYENS DE PAIEMENT DISPONIBLES
========================================================= */

const METHODS = [
  {
    id: "mtn",
    name: "MTN Mobile Money",
    logo: "/images/payments/mtn-momo.jpg",
    color: "#ffcb05",
  },
  {
    id: "moov",
    name: "Moov Money",
    logo: "/images/payments/moov-money.jpg",
    color: "#eaf8f9",
  },
  {
    id: "celtiis",
    name: "Celtiis Cash",
    logo: "/images/payments/celtiis-cash.jpg",
    color: "#eaf8f9",
  },
  {
    id: "bank",
    name: "Virement bancaire",
    logo: null,
    color: "#eaf8f9",
  },
  {
    id: "other",
    name: "Autre moyen de paiement",
    logo: null,
    color: "#eef4f4",
  },
] as const;

type Method = (typeof METHODS)[number];

type Query = {
  edit?: string;
  remove?: string;
  notice?: string;
};

/* =========================================================
   STYLES
========================================================= */

const card =
  "rounded-[18px] border border-[#e3e9ea] bg-white p-5 shadow-sm sm:p-6";

const field =
  "mt-2 w-full rounded-xl border border-[#dbe4e5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0097a7] focus:ring-2 focus:ring-[#0097a7]/15";

const button =
  "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007d88]";

const primary =
  `${button} bg-[#007d88] text-white hover:bg-[#006873]`;

const secondary =
  `${button} border border-[#e3e9ea] bg-white text-[#101719] hover:bg-[#eef4f4]`;

/* =========================================================
   FONCTIONS UTILITAIRES
========================================================= */

function read(
  form: FormData,
  key: string,
  max: number
) {
  const value = form.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, max + 1);
}

function go(
  notice: string,
  edit?: string
): never {
  const params = new URLSearchParams({ notice });

  if (edit) {
    params.set("edit", edit);
  }

  redirect(`${PATH}?${params}`);
}

function logoAvailable(method: Method) {
  return (
    !!method.logo &&
    existsSync(
      join(
        process.cwd(),
        "public",
        method.logo.slice(1)
      )
    )
  );
}

function methodFor(name: string): Method {
  return (
    METHODS.find(
      (method) =>
        method.id !== "other" &&
        method.name === name
    ) ?? METHODS[4]
  );
}

/* =========================================================
   LOGOS DES MOYENS DE PAIEMENT
========================================================= */

function Logo({ method }: { method: Method }) {
  const local = logoAvailable(method);

  const sprite =
    method.id === "mtn" &&
    existsSync(
      join(
        process.cwd(),
        "public/images/payments/payment-methods.png"
      )
    );

  return (
    <span
      className="
        relative flex h-14 w-20 shrink-0
        items-center justify-center overflow-hidden
        rounded-xl border border-black/5
        text-center text-[11px] font-bold
      "
      style={{
        backgroundColor: method.color,
      }}
      aria-label={method.name}
    >
      {local ? (
        <span
          role="img"
          aria-label={method.name}
          className="
            absolute inset-1 bg-contain
            bg-center bg-no-repeat
          "
          style={{
            backgroundImage: `url('${method.logo}')`,
          }}
        />
      ) : sprite ? (
        <span
          role="img"
          aria-label="MTN Mobile Money"
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage:
              "url('/images/payments/payment-methods.png')",
            backgroundSize: "1050% auto",
            backgroundPosition: "77% center",
          }}
        />
      ) : method.id === "bank" ? (
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#007d88"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9 12 3l9 6H3ZM5 10v7m5-7v7m4-7v7m5-7v7M3 20h18M4 17h16" />
        </svg>
      ) : (
        <span className="px-1 text-[#006873]">
          {method.id === "other"
            ? "AUTRE"
            : method.name}
        </span>
      )}
    </span>
  );
}

/* =========================================================
   AJOUTER OU MODIFIER UN MOYEN DE PAIEMENT
========================================================= */

async function savePayment(form: FormData) {
  "use server";

  await requireAdmin();

  const id = read(form, "id", 100);

  const method = METHODS.find(
    (item) =>
      item.id === read(form, "method", 20)
  );

  const holder = read(form, "holder", 200);

  const name =
    method?.id === "other"
      ? read(form, "name", 150)
      : method?.name;

  const account = read(
    form,
    "accountNumber",
    255
  );

  const bank = read(form, "bankName", 150);

  const swift = read(
    form,
    "swift",
    11
  ).toUpperCase();

  const notes = read(form, "notes", 1000);

  const orderText = read(
    form,
    "displayOrder",
    8
  );

  const order =
    orderText === ""
      ? 0
      : Number(orderText);

  const mobile =
    method &&
    ["mtn", "moov", "celtiis"].includes(
      method.id
    );

  const reserved =
    method?.id === "other" &&
    METHODS.some(
      (item) =>
        item.id !== "other" &&
        item.name.toLowerCase() ===
          name?.toLowerCase()
    );

  /* Validation des informations */

  if (
    !method ||
    !name ||
    name.length > 150 ||
    reserved ||
    !holder ||
    holder.length > 200 ||
    !account ||
    account.length > 255 ||
    id.length > 100 ||
    notes.length > 1000 ||
    !Number.isSafeInteger(order) ||
    order < 0 ||
    order > 9999
  ) {
    go("invalid", id || undefined);
  }

  /* Validation du numÃ©ro Mobile Money */

  if (
    mobile &&
    (
      !/^\+?[\d\s().-]+$/.test(account) ||
      account.replace(/\D/g, "").length < 8 ||
      account.replace(/\D/g, "").length > 15
    )
  ) {
    go("phone", id || undefined);
  }

  /* Validation des coordonnÃ©es bancaires */

  if (
    method.id === "bank" &&
    (
      !bank ||
      bank.length > 150 ||
      /[\r\n]/.test(bank) ||
      (
        swift &&
        !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(
          swift
        )
      )
    )
  ) {
    go("bank", id || undefined);
  }

  /* PrÃ©paration des informations bancaires */

  const detailsFr =
    method.id === "bank"
      ? [
          `Banque : ${bank}`,
          swift && `SWIFT/BIC : ${swift}`,
          notes,
        ]
          .filter(Boolean)
          .join("\n")
      : notes;

  const detailsEn =
    method.id === "bank"
      ? [
          `Bank: ${bank}`,
          swift && `SWIFT/BIC: ${swift}`,
          notes,
        ]
          .filter(Boolean)
          .join("\n")
      : null;

  const data = {
    name,
    accountHolder: holder,
    accountNumber: account,

    logoUrl: logoAvailable(method)
      ? method.logo
      : null,

    descriptionFr: detailsFr || null,
    descriptionEn: detailsEn,

    displayOrder: order,

    isActive:
      form.get("isActive") === "on",
  };

  /* Enregistrement dans PostgreSQL */

  try {
    if (id) {
      await db.paymentMethod.update({
        where: { id },
        data,
      });
    } else {
      await db.paymentMethod.create({
        data,
      });
    }
  } catch {
    go("error", id || undefined);
  }

  /* Actualisation des pages */

  revalidatePath("/");
  revalidatePath(PATH);

  go(id ? "updated" : "created");
}

/* =========================================================
   ACTIVER OU DÃ‰SACTIVER
========================================================= */

async function togglePayment(form: FormData) {
  "use server";

  await requireAdmin();

  const id = read(form, "id", 100);

  const active = read(form, "active", 5);

  if (
    !id ||
    id.length > 100 ||
    !["true", "false"].includes(active)
  ) {
    go("invalid");
  }

  try {
    await db.paymentMethod.update({
      where: { id },
      data: {
        isActive: active === "true",
      },
    });
  } catch {
    go("error");
  }

  revalidatePath("/");
  revalidatePath(PATH);

  go("updated");
}

/* =========================================================
   SUPPRESSION DÃ‰FINITIVE
========================================================= */

async function deletePayment(form: FormData) {
  "use server";

  await requireAdmin();

  const id = read(form, "id", 100);

  if (
    !id ||
    id.length > 100 ||
    form.get("confirm") !== "on"
  ) {
    go("invalid");
  }

  try {
    await db.paymentMethod.delete({
      where: { id },
    });
  } catch {
    go("error");
  }

  revalidatePath("/");
  revalidatePath(PATH);

  go("deleted");
}

/* =========================================================
   MESSAGES DE NOTIFICATION
========================================================= */

const notices: Record<string, string> = {
  created:
    "Le moyen de paiement a Ã©tÃ© ajoutÃ© avec succÃ¨s.",

  updated:
    "Les modifications ont Ã©tÃ© enregistrÃ©es.",

  deleted:
    "Le moyen de paiement a Ã©tÃ© supprimÃ© dÃ©finitivement.",

  invalid:
    "VÃ©rifiez les champs obligatoires et les valeurs saisies.",

  phone:
    "Veuillez saisir un numÃ©ro Mobile Money valide.",

  bank:
    "VÃ©rifiez les informations bancaires et le code SWIFT/BIC.",

  error:
    "Impossible d'enregistrer la modification. Veuillez rÃ©essayer.",
};

/* =========================================================
   PAGE PRINCIPALE
========================================================= */

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  await requireAdmin();

  const query = await searchParams;

  const methods = await db.paymentMethod.findMany({
    orderBy: [
      { displayOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  const editing = methods.find(
    (item) => item.id === query.edit
  );

  const removing = methods.find(
    (item) => item.id === query.remove
  );

  const selected = editing
    ? methodFor(editing.name)
    : METHODS[0];

  const description =
    editing?.descriptionFr ?? "";

  const bankName =
    selected.id === "bank"
      ? description.match(
          /^Banque : (.*)$/m
        )?.[1] ?? ""
      : "";

  const swift =
    selected.id === "bank"
      ? description.match(
          /^SWIFT\/BIC : (.*)$/m
        )?.[1] ?? ""
      : "";

  const notes =
    selected.id === "bank"
      ? description
          .replace(/^Banque : .*\n?/m, "")
          .replace(/^SWIFT\/BIC : .*\n?/m, "")
      : description;

  const notice =
    typeof query.notice === "string" &&
    Object.hasOwn(notices, query.notice)
      ? notices[query.notice]
      : null;

  const successful = [
    "created",
    "updated",
    "deleted",
  ].includes(query.notice ?? "");

  const activeCount = methods.filter(
    (item) => item.isActive
  ).length;

  const inactiveCount = methods.filter(
    (item) => !item.isActive
  ).length;

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
          px-4 py-7 sm:px-8 lg:py-10
        "
      >

        {/* ================================================
            EN-TÃŠTE DE LA PAGE
        ================================================ */}

        <div
          className="
            mb-7 flex flex-wrap
            items-end justify-between gap-4
          "
        >
          <div>
            <span
              className="
                inline-flex items-center gap-2
                rounded-full bg-[#eaf8f9]
                px-3 py-1.5 text-xs
                font-bold text-[#006873]
              "
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>

              Espace sÃ©curisÃ©
            </span>

            <h1
              className="
                mt-3 text-3xl font-bold
                tracking-tight sm:text-4xl
              "
            >
              Moyens de paiement
            </h1>

            <p
              className="
                mt-1 text-sm
                text-[#5f6d70] sm:text-base
              "
            >
              GÃ©rez les coordonnÃ©es de paiement
              affichÃ©es sur le site Young Caring.
            </p>
          </div>

          <Link
            href="/admin"
            className={secondary}
          >
            Retour au tableau de bord
          </Link>
        </div>

        {/* ================================================
            NOTIFICATIONS
        ================================================ */}

        {notice && (
          <div
            role="status"
            className={`
              mb-5 rounded-xl border p-4
              text-sm font-medium
              ${
                successful
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }
            `}
          >
            {notice}
          </div>
        )}

        {/* ================================================
            STATISTIQUES
        ================================================ */}

        <div
          className="
            mb-6 grid grid-cols-2
            gap-3 sm:gap-5 lg:grid-cols-3
          "
        >
          {[
            {
              label: "Moyens enregistrÃ©s",
              count: methods.length,
            },
            {
              label: "Moyens actifs",
              count: activeCount,
            },
            {
              label: "Moyens inactifs",
              count: inactiveCount,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={card}
            >
              <p
                className="
                  text-sm font-medium
                  text-[#5f6d70]
                "
              >
                {item.label}
              </p>

              <p
                className="
                  mt-2 text-3xl
                  font-bold tabular-nums
                "
              >
                {item.count}
              </p>
            </div>
          ))}
        </div>

        {/* ================================================
            CONFIRMATION DE SUPPRESSION
        ================================================ */}

        {removing && (
          <section
            className={`${card} mb-6 border-red-200`}
          >
            <h2
              className="
                text-lg font-bold
                text-red-800
              "
            >
              Confirmer la suppression
            </h2>

            <p className="mt-2 text-sm">
              Voulez-vous supprimer dÃ©finitivement
              ce moyen de paiement ?
            </p>

            <div
              className="
                mt-3 rounded-xl
                bg-red-50 p-4
              "
            >
              <p className="font-bold">
                {removing.name}
              </p>

              <p className="mt-1 text-sm">
                {removing.accountHolder}
              </p>

              <p className="break-all text-sm">
                {removing.accountNumber}
              </p>
            </div>

            <form
              action={deletePayment}
              className="mt-4 space-y-4"
            >
              <input
                type="hidden"
                name="id"
                value={removing.id}
              />

              <label
                className="
                  flex items-center gap-2
                  text-sm
                "
              >
                <input
                  type="checkbox"
                  name="confirm"
                  required
                  className="accent-red-600"
                />

                Je confirme la suppression dÃ©finitive.
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
                  Supprimer dÃ©finitivement
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
            xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]
          "
        >

          {/* ==============================================
              FORMULAIRE D'AJOUT ET DE MODIFICATION
          ============================================== */}

          <section className={card}>
            <h2 className="text-xl font-bold">
              {editing
                ? "Modifier le moyen de paiement"
                : "Ajouter un moyen de paiement"}
            </h2>

            <p className="mt-1 text-sm text-[#5f6d70]">
              SÃ©lectionnez un moyen de paiement
              et renseignez les informations du bÃ©nÃ©ficiaire.
            </p>

            <form
              key={editing?.id ?? "new"}
              action={savePayment}
              className="group mt-6 space-y-5"
            >
              <input
                type="hidden"
                name="id"
                value={editing?.id ?? ""}
              />

              {/* SÃ©lection du moyen de paiement */}

              <fieldset>
                <legend className="mb-3 text-sm font-semibold">
                  Moyen de paiement *
                </legend>

                <div
                  className="
                    grid gap-2
                    sm:grid-cols-2
                  "
                >
                  {METHODS.map((method) => (
                    <label
                      key={method.id}
                      className="
                        flex cursor-pointer items-center
                        gap-2 rounded-xl
                        border border-[#e3e9ea]
                        p-2 text-sm font-medium
                        transition
                        hover:bg-[#f5f8f8]
                        has-checked:border-[#0097a7]
                        has-checked:bg-[#eaf8f9]
                        focus-within:ring-2
                        focus-within:ring-[#0097a7]
                      "
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method.id}
                        defaultChecked={
                          selected.id === method.id
                        }
                        required
                        className="
                          shrink-0
                          accent-[#007d88]
                        "
                      />

                      <Logo method={method} />

                      <span className="min-w-0 wrap-break-word">
                        {method.name}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Autre moyen de paiement */}

              <label
                className="
                  hidden text-sm font-semibold
                  group-has-[input[value=other]:checked]:block
                "
              >
                Nom du moyen de paiement *

                <input
                  name="name"
                  className={field}
                  maxLength={150}
                  defaultValue={
                    selected.id === "other"
                      ? editing?.name
                      : ""
                  }
                  placeholder="Nom du service"
                />
              </label>

              {/* Nom du bÃ©nÃ©ficiaire */}

              <label className="block text-sm font-semibold">
                Nom et prÃ©nom du titulaire *

                <input
                  name="holder"
                  type="text"
                  className={field}
                  required
                  maxLength={200}
                  defaultValue={
                    editing?.accountHolder ?? ""
                  }
                  placeholder="Nom complet du bÃ©nÃ©ficiaire"
                />
              </label>

              {/* Nom de la banque */}

              <label
                className="
                  hidden text-sm font-semibold
                  group-has-[input[value=bank]:checked]:block
                "
              >
                Nom de la banque *

                <input
                  name="bankName"
                  type="text"
                  className={field}
                  maxLength={150}
                  defaultValue={bankName}
                  placeholder="Ex. Ecobank, BOA, UBA..."
                />
              </label>

              {/* NumÃ©ro Mobile Money ou compte bancaire */}

              <label className="block text-sm font-semibold">

                <span
                  className="
                    group-has-[input[value=bank]:checked]:hidden
                  "
                >
                  NumÃ©ro de paiement ou identifiant *
                </span>

                <span
                  className="
                    hidden
                    group-has-[input[value=bank]:checked]:inline
                  "
                >
                  NumÃ©ro de compte / IBAN *
                </span>

                <input
                  name="accountNumber"
                  type="text"
                  className={field}
                  required
                  maxLength={255}
                  defaultValue={
                    editing?.accountNumber ?? ""
                  }
                  placeholder="NumÃ©ro ou coordonnÃ©es du compte"
                />
              </label>

              {/* Code bancaire SWIFT/BIC */}

              <label
                className="
                  hidden text-sm font-semibold
                  group-has-[input[value=bank]:checked]:block
                "
              >
                Code SWIFT / BIC (facultatif)

                <input
                  name="swift"
                  type="text"
                  className={`${field} uppercase`}
                  maxLength={11}
                  defaultValue={swift}
                  placeholder="Code SWIFT de la banque"
                />
              </label>

              {/* Informations complÃ©mentaires */}

              <label className="block text-sm font-semibold">
                Informations complÃ©mentaires (facultatif)

                <textarea
                  name="notes"
                  className={`${field} resize-y`}
                  rows={3}
                  maxLength={1000}
                  defaultValue={notes}
                  placeholder="Agence bancaire, instructions de transfert..."
                />
              </label>

              {/* Ordre d'affichage */}

              <label className="block text-sm font-semibold">
                Ordre dâ€™affichage

                <input
                  name="displayOrder"
                  type="number"
                  className={field}
                  min={0}
                  max={9999}
                  step={1}
                  defaultValue={
                    editing?.displayOrder ?? 0
                  }
                />
              </label>

              {/* VisibilitÃ© publique */}

              <label
                className="
                  flex cursor-pointer items-start
                  gap-3 rounded-xl bg-[#eef4f4]
                  p-4 text-sm font-medium
                "
              >
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={
                    editing?.isActive ?? true
                  }
                  className="
                    mt-1 h-4 w-4
                    accent-[#007d88]
                  "
                />

                <span>
                  Afficher sur le site public
                </span>
              </label>

              <p className="text-xs text-[#5f6d70]">
                Renseignez uniquement les coordonnÃ©es
                publiques du bÃ©nÃ©ficiaire. Ne communiquez
                jamais de code PIN, de mot de passe
                ou de code de sÃ©curitÃ©.
              </p>

              {/* Boutons */}

              <div className="flex flex-wrap gap-2">

                <button
                  type="submit"
                  className={`${primary} flex-1 gap-2`}
                >
                  {editing ? (
                    "Enregistrer les modifications"
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>

                      Ajouter le moyen de paiement
                    </>
                  )}
                </button>

                {editing && (
                  <Link
                    href={PATH}
                    className={secondary}
                  >
                    Annuler
                  </Link>
                )}
              </div>
            </form>
          </section>

          {/* ==============================================
              LISTE DES MOYENS DE PAIEMENT
          ============================================== */}

          <section className={card}>

            <div
              className="
                flex items-center
                justify-between gap-3
              "
            >
              <h2 className="text-xl font-bold">
                Moyens de paiement enregistrÃ©s
              </h2>

              <span
                className="
                  rounded-full bg-[#eaf8f9]
                  px-3 py-1 text-sm
                  font-bold text-[#007d88]
                "
              >
                {methods.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-[#5f6d70]">
              GÃ©rez les coordonnÃ©es disponibles
              pour les dons directs Ã  Young Caring.
            </p>

            <div className="mt-5 space-y-3">

              {methods.length === 0 ? (

                /* Aucun moyen de paiement */

                <div
                  className="
                    rounded-xl border border-dashed
                    border-[#dbe4e5] p-8
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto flex h-16 w-16
                      items-center justify-center
                      rounded-2xl bg-[#eaf8f9]
                      text-[#007d88]
                    "
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="3"
                      />

                      <path d="M3 10h18M7 15h3" />
                    </svg>
                  </div>

                  <h3 className="mt-4 font-bold">
                    Aucun moyen de paiement
                  </h3>

                  <p className="mt-2 text-sm text-[#5f6d70]">
                    Ajoutez votre premier moyen de paiement
                    Ã  partir du formulaire.
                  </p>
                </div>

              ) : (

                /* Affichage de chaque moyen */

                methods.map((item) => (
                  <article
                    key={item.id}
                    className="
                      rounded-xl border
                      border-[#e3e9ea]
                      bg-white p-4
                    "
                  >
                    <div className="flex items-start gap-3">

                      <Logo
                        method={methodFor(item.name)}
                      />

                      <div className="min-w-0 flex-1">

                        <div
                          className="
                            flex flex-wrap items-center
                            justify-between gap-2
                          "
                        >
                          <h3 className="wrap-break-word font-bold">
                            {item.name}
                          </h3>

                          <span
                            className={`
                              inline-flex rounded-full
                              px-2.5 py-1 text-xs
                              font-semibold
                              ${
                                item.isActive
                                  ? "bg-emerald-50 text-emerald-800"
                                  : "bg-slate-100 text-slate-700"
                              }
                            `}
                          >
                            {item.isActive
                              ? "Actif"
                              : "Inactif"}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1 wrap-break-word text-xs
                            text-[#5f6d70]
                          "
                        >
                          Titulaire du compte
                        </p>

                        <p className="wrap-break-word text-sm font-semibold">
                          {item.accountHolder}
                        </p>

                        <div
                          className="
                            mt-3 rounded-lg
                            bg-[#f5f8f8] p-3
                          "
                        >
                          <p className="text-xs text-[#5f6d70]">
                            {item.name === "Virement bancaire"
                              ? "NumÃ©ro de compte / IBAN"
                              : "NumÃ©ro de paiement"}
                          </p>

                          <p
                            className="
                              mt-1 break-all
                              font-bold text-[#007d88]
                            "
                          >
                            {item.accountNumber}
                          </p>
                        </div>

                        {item.descriptionFr && (
                          <p
                            className="
                              mt-3 whitespace-pre-line
                              wrap-break-word text-sm
                              text-[#5f6d70]
                            "
                          >
                            {item.descriptionFr}
                          </p>
                        )}

                        <p className="mt-3 text-xs text-[#5f6d70]">
                          Ordre dâ€™affichage : {item.displayOrder}
                        </p>
                      </div>
                    </div>

                    {/* Actions disponibles */}

                    <div
                      className="
                        mt-4 flex flex-wrap gap-2
                        border-t border-[#e3e9ea]
                        pt-3
                      "
                    >

                      {/* Modifier */}

                      <Link
                        href={`${PATH}?edit=${encodeURIComponent(item.id)}`}
                        className={`${secondary} gap-2`}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m14 5 5 5M4 20l4-1 12-12-4-4L4 15v5Z" />
                        </svg>

                        Modifier
                      </Link>

                      {/* Activer ou dÃ©sactiver */}

                      <form action={togglePayment}>
                        <input
                          type="hidden"
                          name="id"
                          value={item.id}
                        />

                        <input
                          type="hidden"
                          name="active"
                          value={String(!item.isActive)}
                        />

                        <button
                          type="submit"
                          className={secondary}
                        >
                          {item.isActive
                            ? "DÃ©sactiver"
                            : "Activer"}
                        </button>
                      </form>

                      {/* Supprimer */}

                      <Link
                        href={`${PATH}?remove=${encodeURIComponent(item.id)}`}
                        className={`
                          ${button}
                          gap-2 border border-red-200
                          text-red-700 hover:bg-red-50
                        `}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
                        </svg>

                        Supprimer
                      </Link>

                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}