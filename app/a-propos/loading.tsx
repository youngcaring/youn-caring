type SkeletonProps = Readonly<{
  className?: string;
}>;

function Skeleton({
  className = "",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse rounded-xl",
        "bg-[#dfe7e8]",
        className,
      ].join(" ")}
    />
  );
}

export default function AboutLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Chargement de la page À propos"
      className="bg-white"
    >
      {/* Hero */}

      <section className="min-h-[520px] bg-[#091719] md:min-h-[580px]">
        <div className="site-container flex min-h-[520px] items-end pb-14 pt-28 md:min-h-[580px] md:items-center md:py-20">
          <div className="w-full max-w-3xl">
            <Skeleton className="h-4 w-36 bg-white/20" />

            <Skeleton className="mt-5 h-14 w-full max-w-2xl bg-white/20 sm:h-20" />

            <Skeleton className="mt-3 h-14 w-4/5 max-w-xl bg-white/20 sm:h-20" />

            <div className="mt-7 space-y-3">
              <Skeleton className="h-5 w-full max-w-2xl bg-white/15" />
              <Skeleton className="h-5 w-5/6 max-w-xl bg-white/15" />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-12 w-full rounded-full bg-[#f36c16]/55 sm:w-56" />
              <Skeleton className="h-12 w-full rounded-full bg-white/15 sm:w-48" />
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}

      <section className="site-section bg-white">
        <div className="site-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Skeleton className="aspect-[4/3] w-full rounded-[36px]" />

          <div>
            <Skeleton className="h-4 w-36 bg-[#0097a7]/20" />

            <Skeleton className="mt-4 h-11 w-full max-w-xl" />

            <Skeleton className="mt-3 h-11 w-4/5 max-w-lg" />

            <div className="mt-7 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>

            <div className="mt-8 space-y-4">
              {Array.from(
                { length: 3 },
                (_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <Skeleton className="h-5 w-5 shrink-0 rounded-full bg-[#f36c16]/25" />
                    <Skeleton className="h-5 w-64 max-w-full" />
                  </div>
                )
              )}
            </div>

            <Skeleton className="mt-8 h-12 w-52 rounded-full bg-[#0097a7]/20" />
          </div>
        </div>
      </section>

      {/* Mission et vision */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <Skeleton className="mx-auto h-14 w-14 rounded-full bg-[#0097a7]/20" />

            <Skeleton className="mx-auto mt-5 h-4 w-36 bg-[#0097a7]/20" />

            <Skeleton className="mx-auto mt-4 h-11 w-full max-w-xl" />

            <Skeleton className="mx-auto mt-5 h-5 w-full max-w-2xl" />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {Array.from(
              { length: 2 },
              (_, index) => (
                <div
                  key={index}
                  className="rounded-[30px] border border-[#e1e9ea] bg-white p-7 sm:p-9"
                >
                  <Skeleton
                    className={[
                      "h-16 w-16 rounded-2xl",
                      index === 0
                        ? "bg-[#0097a7]/25"
                        : "bg-[#f36c16]/25",
                    ].join(" ")}
                  />

                  <Skeleton className="mt-6 h-8 w-44" />

                  <div className="mt-5 space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Bénéficiaires */}

      <section className="site-section bg-white">
        <div className="site-container">
          <Skeleton className="h-4 w-36 bg-[#0097a7]/20" />

          <Skeleton className="mt-4 h-11 w-full max-w-2xl" />

          <Skeleton className="mt-3 h-11 w-4/5 max-w-xl" />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from(
              { length: 3 },
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[26px] border border-[#e1e9ea] bg-white"
                >
                  <Skeleton className="aspect-[3/2] w-full rounded-none" />

                  <div className="p-6">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="mt-4 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Objectifs */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <Skeleton className="mx-auto h-4 w-32 bg-[#0097a7]/20" />
            <Skeleton className="mx-auto mt-4 h-11 w-full max-w-xl" />
            <Skeleton className="mx-auto mt-5 h-5 w-full max-w-2xl" />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from(
              { length: 6 },
              (_, index) => (
                <div
                  key={index}
                  className="rounded-[26px] border border-[#e1e9ea] bg-white p-6"
                >
                  <div className="flex justify-between gap-4">
                    <Skeleton className="h-14 w-14 rounded-2xl bg-[#0097a7]/20" />
                    <Skeleton className="h-8 w-10" />
                  </div>

                  <Skeleton className="mt-6 h-6 w-3/4" />
                  <Skeleton className="mt-4 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Valeurs */}

      <section className="site-section bg-white">
        <div className="site-container grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <Skeleton className="h-4 w-28 bg-[#0097a7]/20" />
            <Skeleton className="mt-4 h-11 w-full max-w-md" />
            <Skeleton className="mt-3 h-11 w-4/5 max-w-sm" />
            <Skeleton className="mt-6 h-5 w-full" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from(
              { length: 4 },
              (_, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-[#e1e9ea] bg-[#f7f9f9] p-6"
                >
                  <Skeleton className="h-12 w-12 rounded-full bg-[#0097a7]/20" />
                  <Skeleton className="mt-5 h-6 w-32" />
                  <Skeleton className="mt-4 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Gouvernance */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <Skeleton className="mx-auto h-14 w-14 rounded-full bg-[#0097a7]/20" />
            <Skeleton className="mx-auto mt-5 h-4 w-32 bg-[#0097a7]/20" />
            <Skeleton className="mx-auto mt-4 h-11 w-full max-w-lg" />
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {Array.from(
              { length: 3 },
              (_, index) => (
                <div
                  key={index}
                  className="rounded-[28px] border border-[#e1e9ea] bg-white p-6 text-center"
                >
                  <Skeleton className="mx-auto h-20 w-20 rounded-full bg-[#0097a7]/20" />
                  <Skeleton className="mx-auto mt-5 h-4 w-28" />
                  <Skeleton className="mx-auto mt-3 h-6 w-48 max-w-full" />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Identité juridique */}

      <section className="site-section bg-white">
        <div className="site-container">
          <div className="rounded-[32px] bg-[#092124] p-7 sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
              <div>
                <Skeleton className="h-16 w-16 rounded-2xl bg-[#f36c16]/50" />
                <Skeleton className="mt-6 h-4 w-36 bg-white/15" />
                <Skeleton className="mt-4 h-11 w-full max-w-md bg-white/15" />
                <Skeleton className="mt-3 h-11 w-4/5 max-w-sm bg-white/15" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from(
                  { length: 6 },
                  (_, index) => (
                    <div
                      key={index}
                      className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5"
                    >
                      <Skeleton className="h-4 w-28 bg-white/15" />
                      <Skeleton className="mt-3 h-5 w-full bg-white/15" />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appel à l’action */}

      <section className="bg-[#f7f9f9] px-4 py-10 sm:px-0 sm:py-14">
        <div className="site-container">
          <div className="rounded-[32px] bg-[#091719] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <Skeleton className="h-4 w-36 bg-[#f36c16]/40" />
            <Skeleton className="mt-5 h-12 w-full max-w-2xl bg-white/15" />
            <Skeleton className="mt-3 h-12 w-4/5 max-w-xl bg-white/15" />
            <Skeleton className="mt-6 h-5 w-full max-w-2xl bg-white/10" />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-12 w-full rounded-full bg-[#f36c16]/50 sm:w-56" />
              <Skeleton className="h-12 w-full rounded-full bg-white/15 sm:w-44" />
            </div>
          </div>
        </div>
      </section>

      <span className="sr-only">
        Chargement en cours…
      </span>
    </main>
  );
}