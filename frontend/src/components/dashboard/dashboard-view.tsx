"use client";

import Link from "next/link";
import { CheckCircle2, Database, UploadCloud, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { ImportHistoryTable } from "@/components/history/import-history-table";
import { useOverallStats } from "@/hooks/use-overall-stats";
import { useImportHistory } from "@/hooks/use-import-history";

export function DashboardView() {
  const stats = useOverallStats();
  const history = useImportHistory(1, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your GrowEasy AI-powered CSV import activity."
        actions={
          <Button render={<Link href="/import" />}>
            <UploadCloud className="size-4" />
            New Import
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats.error ? (
          <div className="sm:col-span-3">
            <ErrorState description={stats.error} />
          </div>
        ) : (
          <>
            <StatCard label="Total Imports" value={stats.data?.totalImports ?? 0} icon={Database} tone="default" />
            <StatCard
              label="Leads Imported"
              value={(stats.data?.totalLeads ?? 0).toLocaleString()}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="Records Skipped"
              value={(stats.data?.totalSkipped ?? 0).toLocaleString()}
              icon={XCircle}
              tone="warning"
            />
          </>
        )}
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
