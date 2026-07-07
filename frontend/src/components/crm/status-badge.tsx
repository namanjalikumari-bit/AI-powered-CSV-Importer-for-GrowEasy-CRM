import { Ban, CheckCircle2, PhoneMissed, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CRM_STATUS_LABELS, CrmStatus } from "@/types/crm";

const STATUS_STYLES: Record<CrmStatus, { className: string; icon: typeof CheckCircle2 }> = {
  GOOD_LEAD_FOLLOW_UP: {
    className: "bg-success/15 text-success",
    icon: ThumbsUp,
  },
  SALE_DONE: {
    className: "bg-primary/15 text-primary",
    icon: CheckCircle2,
  },
  DID_NOT_CONNECT: {
    className: "bg-warning/20 text-warning-foreground dark:text-warning",
    icon: PhoneMissed,
  },
  BAD_LEAD: {
    className: "bg-destructive/10 text-destructive",
    icon: Ban,
  },
};

export function CrmStatusBadge({ status }: { status: CrmStatus | null }) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unclassified
      </Badge>
    );
  }

  const style = STATUS_STYLES[status];
  const Icon = style.icon;

  return (
    <Badge variant="outline" className={cn("border-transparent", style.className)}>
      <Icon className="size-3" />
      {CRM_STATUS_LABELS[status]}
    </Badge>
  );
}
