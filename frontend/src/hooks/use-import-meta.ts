"use client";

import { useEffect, useState } from "react";
import { fetchImportMeta, ImportMeta } from "@/lib/api-client";
import { CRM_STATUSES, DATA_SOURCES } from "@/types/crm";

const FALLBACK_META: ImportMeta = {
  crmStatuses: [...CRM_STATUSES],
  dataSources: [...DATA_SOURCES],
};

export function useImportMeta() {
  const [meta, setMeta] = useState<ImportMeta>(FALLBACK_META);

  useEffect(() => {
    let cancelled = false;
    fetchImportMeta()
      .then((result) => {
        if (!cancelled) setMeta(result);
      })
      .catch(() => {
        // Fall back to statically bundled enums if the API is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return meta;
}
