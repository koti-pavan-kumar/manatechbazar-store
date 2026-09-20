export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="h-8 bg-muted rounded-lg w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
            <div className="h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
