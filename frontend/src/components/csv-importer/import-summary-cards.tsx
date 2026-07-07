import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

export function ImportSummaryCards({
  totalRows,
  importedCount,
  skippedCount,
}: {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Rows" value={totalRows.toLocaleString()} icon={FileText} tone="default" />
      <StatCard label="Imported" value={importedCount.toLocaleString()} icon={CheckCircle2} tone="success" />
      <StatCard label="Skipped" value={skippedCount.toLocaleString()} icon={XCircle} tone="warning" />
    </div>
  );
}
