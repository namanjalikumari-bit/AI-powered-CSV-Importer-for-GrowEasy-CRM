"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertOctagon className="size-6 text-destructive" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try again or head back to the dashboard.
      </p>
      <Button className="mt-6" onClick={reset}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
