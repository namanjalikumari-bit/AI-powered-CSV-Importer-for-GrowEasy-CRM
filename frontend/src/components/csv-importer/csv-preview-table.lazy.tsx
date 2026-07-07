import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/shared/table-skeleton";

/**
 * CsvPreviewTable pulls in @tanstack/react-virtual — only needed once a user
 * actually reaches the preview step, so it's loaded on demand rather than as
 * part of the (already dynamically-imported) wizard bundle.
 */
export const LazyCsvPreviewTable = dynamic(
  () => import("./csv-preview-table").then((mod) => mod.CsvPreviewTable),
  {
    loading: () => <TableSkeleton rows={8} columns={6} />,
  }
);
