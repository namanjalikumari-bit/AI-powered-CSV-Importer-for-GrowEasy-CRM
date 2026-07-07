"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, SkippedRecord } from "@/types/crm";
import { LeadsTable } from "./leads-table";
import { SkippedTable } from "./skipped-table";

export function ImportResultsTabs({
  leads,
  skipped,
}: {
  leads: Lead[];
  skipped: SkippedRecord[];
}) {
  return (
    <Tabs defaultValue="imported" className="gap-4">
      <TabsList>
        <TabsTrigger value="imported">Imported ({leads.length})</TabsTrigger>
        <TabsTrigger value="skipped">Skipped ({skipped.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="imported">
        <LeadsTable leads={leads} />
      </TabsContent>
      <TabsContent value="skipped">
        <SkippedTable records={skipped} />
      </TabsContent>
    </Tabs>
  );
}
