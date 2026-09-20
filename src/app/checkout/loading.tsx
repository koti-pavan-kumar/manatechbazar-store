export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="h-8 bg-muted rounded-lg w-48 mb-6 animate-pulse" />
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
          <div className="h-48 bg-muted rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-80 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
