import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DATA_SOURCE_LABELS, DataSource } from "@/types/crm";

export function DataSourceBadge({ source }: { source: DataSource | null }) {
  if (!source) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unknown source
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <Tag className="size-3" />
      {DATA_SOURCE_LABELS[source]}
    </Badge>
  );
}
