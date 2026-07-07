import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-6 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        Back to dashboard
      </Button>
    </div>
  );
}
