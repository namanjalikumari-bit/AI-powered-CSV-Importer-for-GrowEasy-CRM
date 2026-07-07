"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiRequestError, fetchImportHistory } from "@/lib/api-client";
import { PaginatedImports } from "@/types/crm";

export function useImportHistory(page: number, limit: number) {
  const [data, setData] = useState<PaginatedImports | null>(null);
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
        const result = await fetchImportHistory(page, limit);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : "Failed to load import history.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [page, limit, refreshKey]);

  return { data, isLoading, error, refetch };
}
