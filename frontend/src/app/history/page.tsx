import type { Metadata } from "next";
import { ImportHistoryView } from "@/components/history/import-history-view";

export const metadata: Metadata = {
  title: "Import History | GrowEasy CRM",
};

export default function HistoryPage() {
  return <ImportHistoryView />;
}
