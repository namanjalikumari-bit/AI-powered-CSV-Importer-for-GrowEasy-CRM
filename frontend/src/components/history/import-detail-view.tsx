"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton, StatCardSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { ImportSummaryCards } from "@/components/csv-importer/import-summary-cards";
import { LazyImportResultsTabs } from "@/components/crm/import-results-tabs.lazy";
import { BackendWakeUpBanner } from "@/components/shared/backend-wakeup-banner";
import { ImportStatusBadge } from "./import-status-badge";
import { useImportDetail } from "@/hooks/use-import-detail";
import { useBackendStatus } from "@/hooks/use-backend-status";

export function ImportDetailView({ importId }: { importId: string }) {
  const { data, isLoading, error, refetch } = useImportDetail(importId);
  const backend = useBackendStatus();

  return (
    <div>
      <PageHeader
        title={isLoading ? "Import details" : data?.import.fileName ?? "Import details"}
        description={
          data ? `Started ${new Date(data.import.startedAt).toLocaleString()}` : undefined
        }
        actions={
          <Button
            variant="outline"
            render={<Link href="/history" />}
            className="w-full justify-center sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Back to history
          </Button>
        }
      />

      <BackendWakeUpBanner status={backend.status} onRetry={backend.retry} />

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <TableSkeleton rows={8} columns={7} />
        </div>
      )}

      {!isLoading && error && <ErrorState description={error} onRetry={refetch} />}

      {!isLoading && !error && data && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ImportStatusBadge status={data.import.status} />
            {data.import.errorMessage && (
              <span className="text-sm text-destructive">{data.import.errorMessage}</span>
            )}
          </div>

          <ImportSummaryCards
            totalRows={data.import.totalRows}
            importedCount={data.import.importedCount}
            skippedCount={data.import.skippedCount}
          />

          <LazyImportResultsTabs leads={data.leads} skipped={data.skipped} />
        </div>
      )}
    </div>
  );
}
