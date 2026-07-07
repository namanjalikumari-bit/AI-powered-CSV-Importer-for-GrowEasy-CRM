import type { Metadata } from "next";
import { ImportDetailView } from "@/components/history/import-detail-view";

export const metadata: Metadata = {
  title: "Import Details | GrowEasy CRM",
};

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ImportDetailView importId={id} />;
}
