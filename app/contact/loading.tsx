function SkeletonBlock({
  className = "",
}: Readonly<{
  className?: string;
}>) {
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

export default function ContactLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Chargement de la page contact"
      className="bg-white"
    >
      {/* Hero */}

      <section className="relative min-h-[500px] overflow-hidden bg-[#091719] md:min-h-[540px]">
        <div className="site-container flex min-h-[500px] items-end pb-14 pt-28 md:min-h-[540px] md:items-center md:py-20">
          <div className="w-full max-w-2xl">
            <SkeletonBlock className="h-4 w-24 bg-white/20" />

            <SkeletonBlock className="mt-5 h-14 w-full max-w-xl bg-white/20 sm:h-20" />

            <SkeletonBlock className="mt-3 h-14 w-4/5 max-w-lg bg-white/20 sm:h-20" />

            <div className="mt-7 space-y-3">
              <SkeletonBlock className="h-5 w-full max-w-xl bg-white/15" />
              <SkeletonBlock className="h-5 w-5/6 max-w-lg bg-white/15" />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SkeletonBlock className="h-12 w-full rounded-full bg-[#f36c16]/55 sm:w-44" />
              <SkeletonBlock className="h-12 w-full rounded-full bg-white/15 sm:w-52" />
            </div>

            <SkeletonBlock className="mt-7 h-11 w-56 rounded-full bg-white/15" />
          </div>
        </div>
      </section>

      {/* Moyens de contact */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container">
          <div className="max-w-3xl">
            <SkeletonBlock className="h-4 w-28 bg-[#0097a7]/20" />
            <SkeletonBlock className="mt-4 h-11 w-full max-w-2xl" />
            <SkeletonBlock className="mt-3 h-11 w-4/5 max-w-xl" />
            <SkeletonBlock className="mt-6 h-5 w-full max-w-2xl" />
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from(
              { length: 4 },
              (_, index) => (
                <div
                  key={index}
                  className="min-h-[250px] rounded-[26px] border border-[#e2e9ea] bg-white p-6"
                >
                  <SkeletonBlock className="h-14 w-14 rounded-2xl bg-[#0097a7]/20" />
                  <SkeletonBlock className="mt-6 h-6 w-28" />
                  <SkeletonBlock className="mt-3 h-4 w-4/5" />
                  <SkeletonBlock className="mt-14 h-4 w-32 bg-[#0097a7]/15" />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Formulaire */}

      <section className="site-section bg-white">
        <div className="site-container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SkeletonBlock className="h-4 w-24 bg-[#0097a7]/20" />
              <SkeletonBlock className="mt-4 h-11 w-full max-w-md" />
              <SkeletonBlock className="mt-3 h-11 w-4/5 max-w-sm" />

              <div className="mt-6 space-y-3">
                <SkeletonBlock className="h-5 w-full max-w-lg" />
                <SkeletonBlock className="h-5 w-5/6 max-w-md" />
              </div>

              <div className="mt-8 rounded-[26px] bg-[#eaf8f9] p-6">
                <SkeletonBlock className="h-12 w-12 rounded-full bg-[#0097a7]/25" />
                <SkeletonBlock className="mt-4 h-4 w-full bg-[#0097a7]/15" />
                <SkeletonBlock className="mt-3 h-4 w-4/5 bg-[#0097a7]/15" />
              </div>
            </div>

            <div className="rounded-[30px] border border-[#e1e9ea] bg-[#f9fbfb] p-5 sm:p-8">
              <SkeletonBlock className="h-4 w-72" />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {Array.from(
                  { length: 4 },
                  (_, index) => (
                    <div key={index}>
                      <SkeletonBlock className="h-4 w-32" />
                      <SkeletonBlock className="mt-3 h-12 w-full rounded-2xl bg-white" />
                    </div>
                  )
                )}
              </div>

              <div className="mt-5">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="mt-3 h-40 w-full rounded-2xl bg-white" />
              </div>

              <SkeletonBlock className="mt-7 h-12 w-full rounded-full bg-[#f36c16]/45 sm:w-52" />
            </div>
          </div>
        </div>
      </section>

      {/* Réseaux sociaux */}

      <section className="site-section bg-[#092124]">
        <div className="site-container">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
            <div>
              <SkeletonBlock className="h-4 w-32 bg-white/15" />
              <SkeletonBlock className="mt-4 h-11 w-full max-w-md bg-white/15" />
              <SkeletonBlock className="mt-3 h-11 w-4/5 max-w-sm bg-white/15" />
              <SkeletonBlock className="mt-6 h-5 w-full max-w-lg bg-white/10" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from(
                { length: 3 },
                (_, index) => (
                  <div
                    key={index}
                    className="flex min-h-[112px] items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.06] p-5"
                  >
                    <SkeletonBlock className="h-14 w-14 shrink-0 rounded-2xl bg-white/15" />

                    <div className="flex-1">
                      <SkeletonBlock className="h-5 w-24 bg-white/15" />
                      <SkeletonBlock className="mt-3 h-4 w-32 bg-white/10" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Localisation */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-[30px] border border-[#dfe7e8] bg-white lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <SkeletonBlock className="h-4 w-32 bg-[#0097a7]/20" />
              <SkeletonBlock className="mt-4 h-11 w-full max-w-xl" />
              <SkeletonBlock className="mt-3 h-11 w-4/5 max-w-md" />

              <div className="mt-7 space-y-3">
                <SkeletonBlock className="h-5 w-full max-w-xl" />
                <SkeletonBlock className="h-5 w-5/6 max-w-lg" />
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {Array.from(
                  { length: 3 },
                  (_, index) => (
                    <SkeletonBlock
                      key={index}
                      className="h-24 w-full rounded-2xl"
                    />
                  )
                )}
              </div>

              <SkeletonBlock className="mt-8 h-12 w-56 rounded-full bg-[#0097a7]/20" />
            </div>

            <div className="flex min-h-[340px] items-center justify-center bg-[#0097a7] p-8">
              <div className="text-center">
                <SkeletonBlock className="mx-auto h-24 w-24 rounded-full bg-white/25" />
                <SkeletonBlock className="mx-auto mt-8 h-7 w-56 bg-white/20" />
                <SkeletonBlock className="mx-auto mt-3 h-4 w-32 bg-white/15" />
              </div>
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