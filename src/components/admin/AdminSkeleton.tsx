type Variant = "table" | "form" | "grid" | "dashboard";

type Props = {
  title?: string;
  variant?: Variant;
};

function Bar({ className }: { className?: string }) {
  return (
    <div
      className={`bg-muted rounded animate-pulse ${className ?? "h-4 w-full"}`}
    />
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border p-4 space-y-3">{children}</div>;
}

export function AdminSkeleton({ title, variant = "table" }: Props) {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {title ? (
        <h1 className="text-2xl font-semibold tracking-tight text-muted-foreground/60">
          {title}
        </h1>
      ) : (
        <Bar className="h-7 w-48 bg-muted animate-pulse rounded" />
      )}

      {variant === "dashboard" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <Bar className="h-3 w-24 bg-muted animate-pulse rounded" />
                <Bar className="h-8 w-16 bg-muted animate-pulse rounded" />
              </Card>
            ))}
          </div>
          <Card>
            <Bar className="h-4 w-40 bg-muted animate-pulse rounded mb-2" />
            {[0, 1, 2, 3].map((i) => (
              <Bar key={i} className="h-3 w-full bg-muted animate-pulse rounded" />
            ))}
          </Card>
        </>
      )}

      {variant === "table" && (
        <Card>
          <div className="space-y-3">
            <Bar className="h-3 w-48 bg-muted animate-pulse rounded" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Bar key={i} className="h-9 w-full bg-muted animate-pulse rounded" />
            ))}
          </div>
        </Card>
      )}

      {variant === "form" && (
        <div className="space-y-4 max-w-3xl">
          <Card>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Bar className="h-3 w-32 bg-muted animate-pulse rounded" />
                <Bar className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </Card>
          <Card>
            {[0, 1].map((i) => (
              <div key={i} className="space-y-2">
                <Bar className="h-3 w-40 bg-muted animate-pulse rounded" />
                <Bar className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </Card>
        </div>
      )}

      {variant === "grid" && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-muted animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
}
