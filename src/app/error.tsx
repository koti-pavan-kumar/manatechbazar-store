"use client";

import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        An unexpected error occurred. Your cart and data are safe — please try again.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="rounded-xl">
          <RotateCcw className="h-4 w-4 mr-2" /> Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="rounded-xl">
            <Home className="h-4 w-4 mr-2" /> Go Home
          </Button>
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-6">Ref: {error.digest}</p>
      )}
    </div>
  );
}
