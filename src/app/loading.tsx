/**
 * Loading UI global — affiché par App Router pendant la résolution des
 * Server Components. On reste minimaliste : un squelette aligné sur le
 * gabarit éditorial.
 */
export default function GlobalLoading() {
  return (
    <div className="container py-12 md:py-16">
      <div className="space-y-4">
        <div className="h-3 w-32 animate-pulse rounded-full bg-surface-warm" />
        <div className="h-12 w-3/4 animate-pulse rounded-md bg-surface-warm md:h-16 md:w-1/2" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface-warm md:w-1/3" />
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] animate-pulse rounded-md bg-surface-warm"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
