import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImportStatus } from "@/types/crm";

const STYLES: Record<ImportStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  COMPLETED: { label: "Completed", className: "bg-success/15 text-success", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", className: "bg-primary/15 text-primary", icon: Loader2 },
  FAILED: { label: "Failed", className: "bg-destructive/10 text-destructive", icon: XCircle },
};

export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const style = STYLES[status];
  const Icon = style.icon;

  return (
    <Badge variant="outline" className={`border-transparent ${style.className}`}>
      <Icon className={`size-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {style.label}
    </Badge>
  );
}
