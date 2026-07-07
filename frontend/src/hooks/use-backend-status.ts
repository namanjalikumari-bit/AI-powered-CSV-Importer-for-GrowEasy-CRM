"use client";

import { useEffect, useState } from "react";
import { pingHealth } from "@/lib/api-client";

export type BackendStatus = "checking" | "awake" | "waking" | "unreachable";

const WAKING_HINT_DELAY_MS = 2500;

/**
 * Pings the backend health endpoint in the background (never blocks render)
 * and reports whether it looks like a cold Render instance is spinning up.
 * Consumers use this purely for messaging — real data hooks fetch independently
 * and are the source of truth for actual content.
 */
export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus((prev) => (attempt === 0 ? prev : "checking"));

    const wakingTimer = setTimeout(() => {
      if (!cancelled) setStatus((prev) => (prev === "checking" ? "waking" : prev));
    }, WAKING_HINT_DELAY_MS);

    pingHealth().then((ok) => {
      if (cancelled) return;
      clearTimeout(wakingTimer);
      setStatus(ok ? "awake" : "unreachable");
    });

    return () => {
      cancelled = true;
      clearTimeout(wakingTimer);
    };
  }, [attempt]);

  const retry = () => setAttempt((a) => a + 1);

  return { status, retry };
}
