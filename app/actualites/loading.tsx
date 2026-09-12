export default function NewsLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Chargement des actualités"
      className="bg-white"
    >
      {/* Hero */}

      <section className="relative min-h-[430px] overflow-hidden bg-[#091719]">
        <div className="site-container flex min-h-[430px] items-end pb-12 pt-24 md:items-center md:py-16">
          <div className="w-full max-w-2xl animate-pulse">
            <div className="h-4 w-28 rounded-full bg-white/20" />

            <div className="mt-5 h-12 w-full max-w-xl rounded-xl bg-white/20 sm:h-16" />

            <div className="mt-3 h-12 w-4/5 rounded-xl bg-white/20 sm:h-16" />

            <div className="mt-6 h-5 w-full max-w-lg rounded-full bg-white/15" />

            <div className="mt-3 h-5 w-3/4 max-w-md rounded-full bg-white/15" />

            <div className="mt-8 h-12 w-52 rounded-full bg-[#f36c16]/60" />
          </div>
        </div>
      </section>

      {/* Actualité mise en avant */}

      <section className="site-section bg-white">
        <div className="site-container">
          <div className="grid animate-pulse overflow-hidden rounded-[30px] bg-[#092124] lg:grid-cols-2">
            <div className="min-h-[310px] bg-white/10 lg:min-h-[430px]" />

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <div className="h-4 w-32 rounded-full bg-white/20" />

              <div className="mt-5 h-10 w-full rounded-lg bg-white/20" />

              <div className="mt-3 h-10 w-3/4 rounded-lg bg-white/20" />

              <div className="mt-6 h-4 w-full rounded-full bg-white/15" />

              <div className="mt-3 h-4 w-5/6 rounded-full bg-white/15" />

              <div className="mt-8 h-12 w-44 rounded-full bg-[#f36c16]/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Liste */}

      <section className="site-section bg-[#f7f9f9]">
        <div className="site-container animate-pulse">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="h-4 w-24 rounded-full bg-[#0097a7]/20" />
              <div className="mt-4 h-10 w-72 rounded-lg bg-[#dfe7e8]" />
            </div>

            <div className="h-12 w-full rounded-full bg-white md:w-[330px]" />
          </div>

          <div className="mt-7 flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-11 w-32 shrink-0 rounded-full bg-white"
              />
            ))}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[24px] bg-white"
              >
                <div className="aspect-[3/2] bg-[#e3e9ea]" />

                <div className="p-6">
                  <div className="h-5 w-3/4 rounded bg-[#e3e9ea]" />
                  <div className="mt-4 h-4 w-full rounded bg-[#edf1f2]" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-[#edf1f2]" />
                  <div className="mt-6 h-4 w-28 rounded bg-[#0097a7]/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <span className="sr-only">Chargement en cours…</span>
    </main>
  );
}