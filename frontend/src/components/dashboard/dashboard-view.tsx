"use client";

import { memo } from "react";
import Link from "next/link";
import { CheckCircle2, Database, UploadCloud, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { BackendWakeUpBanner } from "@/components/shared/backend-wakeup-banner";
import { ImportHistoryTable } from "@/components/history/import-history-table";
import { useOverallStats } from "@/hooks/use-overall-stats";
import { useImportHistory } from "@/hooks/use-import-history";
import { useBackendStatus } from "@/hooks/use-backend-status";
import { OverallStats } from "@/lib/api-client";

const StatsSection = memo(function StatsSection({
  isLoading,
  error,
  data,
  onRetry,
}: {
  isLoading: boolean;
  error: string | null;
  data: OverallStats | null;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <div className="sm:col-span-3">
        <ErrorState description={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <>
      <StatCard label="Total Imports" value={data?.totalImports ?? 0} icon={Database} tone="default" />
      <StatCard
        label="Leads Imported"
        value={(data?.totalLeads ?? 0).toLocaleString()}
        icon={CheckCircle2}
        tone="success"
      />
      <StatCard
        label="Records Skipped"
        value={(data?.totalSkipped ?? 0).toLocaleString()}
        icon={XCircle}
        tone="warning"
      />
    </>
  );
});

export function DashboardView() {
  const stats = useOverallStats();
  const history = useImportHistory(1, 5);
  const backend = useBackendStatus();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your GrowEasy AI-powered CSV import activity."
        actions={
          <Button render={<Link href="/import" />} className="w-full justify-center sm:w-auto">
            <UploadCloud className="size-4" />
            New Import
          </Button>
        }
      />

      <BackendWakeUpBanner status={backend.status} onRetry={backend.retry} />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsSection
          isLoading={stats.isLoading}
          error={stats.error}
          data={stats.data}
          onRetry={stats.refetch}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recent Imports</h2>
        <Link href="/history" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {history.isLoading && <TableSkeleton rows={5} columns={7} />}
      {!history.isLoading && history.error && <ErrorState description={history.error} onRetry={history.refetch} />}
      {!history.isLoading && !history.error && history.data && (
        <ImportHistoryTable imports={history.data.items} />
      )}
    </div>
  );
}
