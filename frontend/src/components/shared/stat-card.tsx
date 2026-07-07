import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-4 px-5 py-5">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
