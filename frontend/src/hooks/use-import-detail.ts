"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, fetchImportDetail } from "@/lib/api-client";
import { ImportDetail } from "@/types/crm";

export function useImportDetail(importId: string) {
  const [data, setData] = useState<ImportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchImportDetail(importId);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : "Failed to load import details.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [importId, refreshKey]);

  return { data, isLoading, error, refetch };
}
