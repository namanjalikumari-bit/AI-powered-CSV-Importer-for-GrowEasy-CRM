"use client";

import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SkippedRecord } from "@/types/crm";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckCircle2 } from "lucide-react";

const ROW_HEIGHT = 52;

export const SkippedTable = memo(function SkippedTable({ records }: { records: SkippedRecord[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  if (records.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Nothing was skipped"
        description="Every row in this file had enough information to be imported as a lead."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        ref={scrollRef}
        className="max-h-[32rem] overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-backdrop-filter:bg-muted/80">
            <tr>
              <th className="w-16 whitespace-nowrap border-b border-border px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                Row
              </th>
              <th className="w-72 whitespace-nowrap border-b border-border px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                Reason
              </th>
              <th className="min-w-96 whitespace-nowrap border-b border-border px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                Raw data
              </th>
            </tr>
          </thead>
          <tbody
            style={{ height: rowVirtualizer.getTotalSize(), position: "relative", display: "block" }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const record = records[virtualRow.index];
              const rawPreview = Object.entries(record.raw)
                .filter(([, value]) => value)
                .slice(0, 4)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" · ");

              return (
                <tr
                  key={record._id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex items-center border-b border-border last:border-b-0 odd:bg-transparent even:bg-muted/20"
                >
                  <td className="w-16 shrink-0 px-3 py-2 text-xs text-muted-foreground">
                    {record.rowIndex + 1}
                  </td>
                  <td className="w-72 shrink-0 truncate px-3 py-2 text-warning-foreground dark:text-warning">
                    {record.reason}
                  </td>
                  <td className="min-w-96 flex-1 truncate px-3 py-2 text-muted-foreground" title={rawPreview}>
                    {rawPreview || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
