import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border">
      <div className="flex gap-4 border-b border-border bg-muted/40 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" style={{ animationDelay: `${(r * columns + c) * 30}ms` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-5">
      <Skeleton className="size-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
