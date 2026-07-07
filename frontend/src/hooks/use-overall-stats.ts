"use client";

import { useEffect, useState } from "react";
import { ApiRequestError, fetchOverallStats, OverallStats } from "@/lib/api-client";

export function useOverallStats() {
  const [data, setData] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchOverallStats()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : "Failed to load stats.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
