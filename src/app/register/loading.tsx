export default function RegisterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-4 px-4">
        <div className="h-8 bg-muted rounded-lg w-48 mx-auto animate-pulse" />
        <div className="h-12 bg-muted rounded-xl w-full animate-pulse" />
        <div className="h-12 bg-muted rounded-xl w-full animate-pulse" />
        <div className="h-12 bg-muted rounded-xl w-full animate-pulse" />
        <div className="h-12 bg-muted rounded-xl w-full animate-pulse" />
      </div>
    </div>
  );
}
