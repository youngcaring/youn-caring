export default function ActionsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Chargement de la page des actions"
      className="min-h-screen bg-[#f7f9f9]"
    >
      {/* Hero */}

      <div className="min-h-[430px] animate-pulse bg-[#13282b]">
        <div className="site-container flex min-h-[430px] items-center">
          <div className="w-full max-w-2xl">
            <div className="h-4 w-32 rounded-full bg-white/15" />
            <div className="mt-6 h-14 w-full max-w-xl rounded-2xl bg-white/15" />
            <div className="mt-3 h-14 w-4/5 rounded-2xl bg-white/15" />

            <div className="mt-6 space-y-3">
              <div className="h-4 w-full max-w-lg rounded-full bg-white/10" />
              <div className="h-4 w-4/5 max-w-lg rounded-full bg-white/10" />
            </div>

            <div className="mt-8 flex gap-3">
              <div className="h-12 w-48 rounded-full bg-[#f36c16]/40" />
              <div className="h-12 w-36 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}

      <div className="site-container py-12">
        <div className="animate-pulse">
          <div className="h-4 w-28 rounded-full bg-[#0097a7]/20" />
          <div className="mt-4 h-10 w-full max-w-lg rounded-xl bg-[#dfe7e8]" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-[#e5ebec]" />

          <div className="mt-8 flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-11 w-36 shrink-0 rounded-full bg-[#e1e8e9]"
                />
              )
            )}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[24px] bg-white shadow-sm"
                >
                  <div className="aspect-[3/2] bg-[#dfe7e8]" />

                  <div className="p-6">
                    <div className="h-3 w-40 rounded-full bg-[#e3e9ea]" />
                    <div className="mt-5 h-7 w-4/5 rounded-lg bg-[#dfe7e8]" />
                    <div className="mt-4 h-4 w-full rounded-full bg-[#edf1f1]" />
                    <div className="mt-2 h-4 w-3/4 rounded-full bg-[#edf1f1]" />
                    <div className="mt-6 h-4 w-28 rounded-full bg-[#0097a7]/20" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <span className="sr-only">
        Chargement en cours…
      </span>
    </div>
  );
}