"use client";

import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ParsedCsvRow } from "@/hooks/use-csv-parser";

const ROW_HEIGHT = 40;

export const CsvPreviewTable = memo(function CsvPreviewTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ParsedCsvRow[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div ref={scrollRef} className="max-h-[28rem] overflow-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-backdrop-filter:bg-muted/80">
            <tr>
              <th className="whitespace-nowrap border-b border-border px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap border-b border-border px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ height: rowVirtualizer.getTotalSize(), position: "relative", display: "block" }}>
            {virtualItems.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.rowIndex}
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
                  <td className="w-12 shrink-0 whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                    {row.rowIndex + 1}
                  </td>
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="w-48 shrink-0 truncate px-3 py-2 text-foreground"
                      title={row.raw[header]}
                    >
                      {row.raw[header] || <span className="text-muted-foreground/50">—</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
