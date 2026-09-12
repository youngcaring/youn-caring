function SkeletonBlock({
  className,
}: Readonly<{
  className: string;
}>) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse",
        "bg-[#dfe8e9]",
        className,
      ].join(" ")}
    />
  );
}

export default function TransparencyLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page Dons et transparence"
      className="min-h-screen bg-white"
    >
      {/* Hero */}

      <section className="bg-[#091719]">
        <div
          className={[
            "site-container",
            "flex min-h-[520px]",
            "items-end pb-14 pt-28",
            "md:min-h-[600px]",
            "md:items-center md:py-24",
          ].join(" ")}
        >
          <div className="w-full max-w-3xl">
            <SkeletonBlock className="h-4 w-40 rounded-full bg-white/20" />

            <SkeletonBlock
              className={[
                "mt-6 h-14 w-full",
                "max-w-2xl rounded-2xl",
                "bg-white/20",
                "sm:h-20",
              ].join(" ")}
            />

            <SkeletonBlock
              className={[
                "mt-4 h-14 w-full",
                "max-w-xl rounded-xl",
                "bg-white/15",
              ].join(" ")}
            />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SkeletonBlock className="h-12 w-full rounded-full bg-white/20 sm:w-52" />

              <SkeletonBlock className="h-12 w-full rounded-full bg-white/15 sm:w-56" />
            </div>

            <SkeletonBlock className="mt-8 h-5 w-full max-w-lg rounded-full bg-white/15" />
          </div>
        </div>
      </section>

      {/* Navigation rapide */}

      <section className="border-b border-[#e2e9ea] bg-white">
        <div className="site-container">
          <div className="flex gap-2 overflow-hidden py-3 lg:justify-center">
            {Array.from(
              { length: 5 },
              (_, index) => (
                <SkeletonBlock
                  key={index}
                  className="h-11 w-36 shrink-0 rounded-full"
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* Première section */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container">
          <SkeletonBlock className="h-4 w-36 rounded-full" />

          <SkeletonBlock className="mt-5 h-12 w-full max-w-2xl rounded-xl" />

          <SkeletonBlock className="mt-4 h-6 w-full max-w-xl rounded-lg" />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(
              { length: 6 },
              (_, index) => (
                <div
                  key={index}
                  className={[
                    "rounded-[26px]",
                    "border border-[#e0e8e9]",
                    "bg-white p-6",
                  ].join(" ")}
                >
                  <SkeletonBlock className="h-12 w-12 rounded-2xl" />

                  <SkeletonBlock className="mt-5 h-6 w-36 rounded-lg" />

                  <SkeletonBlock className="mt-4 h-4 w-full rounded-full" />

                  <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-full" />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Deuxième section */}

      <section className="site-section bg-white">
        <div className="site-container">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SkeletonBlock className="h-4 w-36 rounded-full" />

              <SkeletonBlock className="mt-5 h-12 w-full max-w-xl rounded-xl" />

              <SkeletonBlock className="mt-4 h-6 w-full max-w-lg rounded-lg" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from(
                { length: 4 },
                (_, index) => (
                  <div
                    key={index}
                    className={[
                      "rounded-[24px]",
                      "border border-[#e0e8e9]",
                      "bg-[#f9fbfb] p-5",
                    ].join(" ")}
                  >
                    <SkeletonBlock className="h-7 w-7 rounded-lg" />

                    <SkeletonBlock className="mt-4 h-5 w-32 rounded-lg" />

                    <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />

                    <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-full" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <span className="sr-only">
        Chargement de la page en cours…
      </span>
    </div>
  );
}