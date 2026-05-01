export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <section className="relative isolate min-h-[60svh] flex items-end overflow-hidden bg-secondary">
        <div className="absolute inset-0 -z-10 bg-secondary animate-pulse" />
        <div className="container mx-auto px-4 pb-12 md:pb-16 pt-32">
          <div className="space-y-4 max-w-3xl animate-pulse">
            <div className="h-3 w-24 rounded bg-background/30" />
            <div className="h-16 w-3/4 rounded bg-background/30" />
            <div className="h-6 w-32 rounded bg-background/30" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div className="space-y-6 animate-pulse">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="grid grid-cols-2 gap-2 mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-muted" />
              ))}
            </div>
          </div>
          <div className="h-[480px] rounded-md bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
