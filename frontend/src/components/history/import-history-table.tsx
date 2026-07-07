"use client";

import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ImportSummary } from "@/types/crm";
import { ImportStatusBadge } from "./import-status-badge";

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ImportHistoryTable({ imports }: { imports: ImportSummary[] }) {
  if (imports.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No imports yet"
        description="Once you import a CSV file, it will show up here with a full history of results."
        action={
          <Button render={<Link href="/import" />}>Import your first CSV</Button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/95">
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Imported</TableHead>
            <TableHead className="text-right">Skipped</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {imports.map((item) => (
            <TableRow key={item._id} className="cursor-pointer">
              <TableCell className="max-w-56 truncate font-medium text-foreground">
                <Link href={`/history/${item._id}`} className="hover:underline">
                  {item.fileName}
                </Link>
              </TableCell>
              <TableCell>
                <ImportStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{item.totalRows.toLocaleString()}</TableCell>
              <TableCell className="text-right tabular-nums text-success">
                {item.importedCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums text-warning-foreground dark:text-warning">
                {item.skippedCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
              <TableCell>
                <Link href={`/history/${item._id}`} aria-label={`View details for ${item.fileName}`}>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
