export default function GalleryLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Chargement de la galerie"
      className="min-h-screen bg-[#f7f9f9]"
    >
      <section className="min-h-[480px] animate-pulse bg-[#091719] md:min-h-[540px]">
        <div className="site-container flex min-h-[480px] items-end pb-14 pt-28 md:min-h-[540px] md:items-center md:py-20">
          <div className="w-full max-w-3xl">
            <div className="h-4 w-36 rounded-full bg-white/20" />
            <div className="mt-5 h-16 w-full max-w-2xl rounded-xl bg-white/20" />
            <div className="mt-4 h-5 w-full max-w-xl rounded-full bg-white/15" />
            <div className="mt-3 h-5 w-4/5 max-w-lg rounded-full bg-white/15" />
            <div className="mt-8 h-12 w-56 rounded-full bg-[#f36c16]/50" />
          </div>
        </div>
      </section>

      <section className="site-section">
        <div className="site-container animate-pulse">
          <div className="h-4 w-36 rounded-full bg-[#0097a7]/20" />
          <div className="mt-4 h-11 w-full max-w-xl rounded-xl bg-[#dfe7e8]" />

          <div className="mt-8 flex gap-2 overflow-hidden">
            {Array.from(
              { length: 6 },
              (_, index) => (
                <div
                  key={index}
                  className="h-11 w-32 shrink-0 rounded-full bg-white"
                />
              )
            )}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from(
              { length: 6 },
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[26px] bg-white"
                >
                  <div className="aspect-[4/3] bg-[#dfe7e8]" />

                  <div className="p-5">
                    <div className="h-5 w-3/4 rounded bg-[#dfe7e8]" />
                    <div className="mt-4 h-4 w-full rounded bg-[#edf1f2]" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-[#edf1f2]" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <span className="sr-only">
        Chargement en cours…
      </span>
    </main>
  );
}