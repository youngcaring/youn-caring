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

export default function DonationLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page de don"
      className="min-h-screen bg-white"
    >
      {/* Hero */}

      <section className="bg-[#091719]">
        <div
          className={[
            "site-container",
            "flex min-h-[540px]",
            "items-end pb-14 pt-28",
            "md:min-h-[620px]",
            "md:items-center md:py-24",
          ].join(" ")}
        >
          <div className="w-full max-w-3xl">
            <SkeletonBlock className="h-4 w-40 rounded-full bg-white/20" />

            <SkeletonBlock
              className={[
                "mt-6 h-16 w-full",
                "max-w-2xl rounded-2xl",
                "bg-white/20",
                "sm:h-24",
              ].join(" ")}
            />

            <SkeletonBlock className="mt-5 h-6 w-full max-w-xl rounded-xl bg-white/15" />

            <SkeletonBlock className="mt-3 h-6 w-4/5 max-w-lg rounded-xl bg-white/15" />

            <SkeletonBlock className="mt-8 h-12 w-48 rounded-full bg-white/20" />

            <SkeletonBlock className="mt-8 h-5 w-full max-w-lg rounded-full bg-white/15" />
          </div>
        </div>
      </section>

      {/* Formulaire */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container">
          <SkeletonBlock className="h-4 w-40 rounded-full" />

          <SkeletonBlock className="mt-5 h-12 w-full max-w-2xl rounded-xl" />

          <SkeletonBlock className="mt-4 h-6 w-full max-w-xl rounded-lg" />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div
              className={[
                "rounded-[28px]",
                "border border-[#e0e8e9]",
                "bg-white p-5",
                "sm:p-8",
              ].join(" ")}
            >
              <SkeletonBlock className="h-6 w-44 rounded-lg" />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SkeletonBlock className="h-20 rounded-[20px]" />
                <SkeletonBlock className="h-20 rounded-[20px]" />
              </div>

              <div className="mt-8 border-t border-[#e5ebec] pt-8">
                <SkeletonBlock className="h-6 w-48 rounded-lg" />

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from(
                    { length: 6 },
                    (_, index) => (
                      <SkeletonBlock
                        key={index}
                        className="h-12 rounded-[18px]"
                      />
                    )
                  )}
                </div>
              </div>

              <div className="mt-8 border-t border-[#e5ebec] pt-8">
                <SkeletonBlock className="h-6 w-56 rounded-lg" />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {Array.from(
                    { length: 4 },
                    (_, index) => (
                      <SkeletonBlock
                        key={index}
                        className="h-13 rounded-[18px]"
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="h-fit rounded-[28px] bg-[#092124] p-6">
              <SkeletonBlock className="h-12 w-12 rounded-full bg-white/20" />

              <SkeletonBlock className="mt-5 h-8 w-44 rounded-lg bg-white/20" />

              <SkeletonBlock className="mt-8 h-20 w-full rounded-xl bg-white/15" />

              <SkeletonBlock className="mt-6 h-13 w-full rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      <span className="sr-only">
        Chargement en cours…
      </span>
    </div>
  );
}