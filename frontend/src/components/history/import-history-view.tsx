"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { useImportHistory } from "@/hooks/use-import-history";
import { ImportHistoryTable } from "./import-history-table";

const PAGE_SIZE = 15;

export function ImportHistoryView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useImportHistory(page, PAGE_SIZE);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div>
      <PageHeader
        title="Import History"
        description="Every CSV import you've run, with results and record counts."
        actions={
          <Button render={<Link href="/import" />}>
            <UploadCloud className="size-4" />
            New Import
          </Button>
        }
      />

      {isLoading && <TableSkeleton rows={8} columns={7} />}
      {!isLoading && error && <ErrorState description={error} onRetry={refetch} />}
      {!isLoading && !error && data && (
        <div className="space-y-4">
          <ImportHistoryTable imports={data.items} />
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
