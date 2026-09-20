export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="bg-primary/10 h-8" />
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="w-40 h-6 bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {/* Hero skeleton */}
        <div className="w-full h-[50vh] bg-muted rounded-3xl animate-pulse" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
              <div className="h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
