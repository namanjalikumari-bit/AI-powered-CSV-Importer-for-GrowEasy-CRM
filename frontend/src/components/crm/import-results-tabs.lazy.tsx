import dynamic from "next/dynamic";
import { TableSkeleton } from "@/components/shared/table-skeleton";

/**
 * ImportResultsTabs pulls in @tanstack/react-virtual for both the leads and
 * skipped tables. Loading it on demand keeps that weight out of the initial
 * bundle for every page that doesn't end up showing results (most loads).
 */
export const LazyImportResultsTabs = dynamic(
  () => import("./import-results-tabs").then((mod) => mod.ImportResultsTabs),
  {
    loading: () => <TableSkeleton rows={8} columns={7} />,
  }
);
