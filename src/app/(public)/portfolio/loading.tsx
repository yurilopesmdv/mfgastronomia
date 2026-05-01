export default function Loading() {
  return (
    <div className="pt-32 pb-24" aria-busy="true" aria-live="polite">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-14 space-y-4 animate-pulse">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-12 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
