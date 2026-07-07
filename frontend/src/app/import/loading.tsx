import { Skeleton } from "@/components/ui/skeleton";

export default function ImportLoading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-card px-5 py-5">
          <Skeleton className="h-7 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
