export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="h-4 bg-muted rounded-lg w-64 mb-6 animate-pulse" />
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="aspect-[4/5] bg-muted rounded-2xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded-lg w-3/4 animate-pulse" />
          <div className="h-6 bg-muted rounded-lg w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded-lg w-full animate-pulse" />
          <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
          <div className="h-12 bg-muted rounded-xl w-full animate-pulse mt-8" />
          <div className="h-12 bg-muted rounded-xl w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
