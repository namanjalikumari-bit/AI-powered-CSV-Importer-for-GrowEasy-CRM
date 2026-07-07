"use client";

import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Lead } from "@/types/crm";
import { CrmStatusBadge } from "./status-badge";
import { DataSourceBadge } from "./data-source-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

const ROW_HEIGHT = 56;

function formatPhone(lead: Lead): string {
  if (!lead.mobile_without_country_code) return "—";
  return lead.country_code
    ? `${lead.country_code} ${lead.mobile_without_country_code}`
    : lead.mobile_without_country_code;
}

export const LeadsTable = memo(function LeadsTable({ leads }: { leads: Lead[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No leads imported yet"
        description="Imported leads from this file will appear here once the AI mapping completes."
      />
    );
  }

  const columns = [
    { key: "name", label: "Name", width: "w-44" },
    { key: "contact", label: "Contact", width: "w-56" },
    { key: "company", label: "Company", width: "w-40" },
    { key: "location", label: "Location", width: "w-40" },
    { key: "owner", label: "Owner", width: "w-36" },
    { key: "status", label: "Status", width: "w-48" },
    { key: "source", label: "Source", width: "w-40" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        ref={scrollRef}
        className="max-h-[32rem] overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-backdrop-filter:bg-muted/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.width} whitespace-nowrap border-b border-border px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
              display: "block",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const lead = leads[virtualRow.index];
              return (
                <tr
                  key={lead._id}
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
                  <td className="w-44 shrink-0 truncate px-3 py-2 font-medium text-foreground">
                    {lead.name ?? <span className="text-muted-foreground/50 font-normal">—</span>}
                  </td>
                  <td className="w-56 shrink-0 truncate px-3 py-2 text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="truncate text-foreground">{lead.email ?? "—"}</span>
                      <span className="truncate text-xs">{formatPhone(lead)}</span>
                    </div>
                  </td>
                  <td className="w-40 shrink-0 truncate px-3 py-2 text-muted-foreground">
                    {lead.company ?? "—"}
                  </td>
                  <td className="w-40 shrink-0 truncate px-3 py-2 text-muted-foreground">
                    {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="w-36 shrink-0 truncate px-3 py-2 text-muted-foreground">
                    {lead.lead_owner ?? "—"}
                  </td>
                  <td className="w-48 shrink-0 px-3 py-2">
                    <CrmStatusBadge status={lead.crm_status} />
                  </td>
                  <td className="w-40 shrink-0 px-3 py-2">
                    <DataSourceBadge source={lead.data_source} />
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
