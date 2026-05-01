export default function Loading() {
  return (
    <div className="pt-32 pb-24" aria-busy="true" aria-live="polite">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-14 space-y-4 animate-pulse">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-12 w-3/4 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[3/4] w-full rounded-md bg-muted" />
              <div className="h-6 w-2/3 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
