import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/table-skeleton";

export const metadata: Metadata = {
  title: "Import Leads | GrowEasy CRM",
};

const ImportWizard = dynamic(() =>
  import("@/components/csv-importer/import-wizard").then((mod) => mod.ImportWizard)
);

export default function ImportPage() {
  return (
    <div>
      <PageHeader
        title="Import Leads"
        description="Upload a CSV from any source — Facebook, Google Ads, Excel, or a custom export. AI maps the columns for you."
      />
      <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
        <ImportWizard />
      </Suspense>
    </div>
  );
}
