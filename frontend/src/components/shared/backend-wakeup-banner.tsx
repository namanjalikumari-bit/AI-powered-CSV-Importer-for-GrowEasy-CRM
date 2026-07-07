"use client";

import { Loader2, ServerCrash } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BackendStatus } from "@/hooks/use-backend-status";

export function BackendWakeUpBanner({
  status,
  onRetry,
}: {
  status: BackendStatus;
  onRetry?: () => void;
}) {
  if (status === "checking" || status === "awake") return null;

  if (status === "waking") {
    return (
      <Alert className="mb-6 border-primary/20 bg-primary/5 animate-in-fast">
        <Loader2 className="size-4 animate-spin text-primary" />
        <AlertTitle>Waking up the backend&hellip;</AlertTitle>
        <AlertDescription>
          This app runs on a free-tier server that sleeps when idle. The first request can take
          up to a minute to spin back up — your dashboard layout is ready, data will fill in
          automatically as soon as it responds.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="mb-6 animate-in-fast">
      <ServerCrash className="size-4" />
      <AlertTitle>Can&apos;t reach the backend right now</AlertTitle>
      <AlertDescription>
        The API didn&apos;t respond. It may still be starting up, or your connection may have
        dropped.
      </AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
