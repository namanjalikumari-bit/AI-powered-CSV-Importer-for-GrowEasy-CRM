"use client";

import { Check, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type ImportPhase = "uploading" | "mapping";

export function ImportProgress({
  phase,
  uploadProgress,
  totalRows,
}: {
  phase: ImportPhase;
  uploadProgress: number;
  totalRows: number;
}) {
  const stages = [
    {
      key: "uploading" as const,
      icon: UploadCloud,
      title: "Uploading CSV file",
      description: "Sending your file securely to the server.",
    },
    {
      key: "mapping" as const,
      icon: Sparkles,
      title: "Gemini AI is mapping your fields",
      description: `Analyzing ${totalRows.toLocaleString()} row${totalRows === 1 ? "" : "s"} and matching them to GrowEasy CRM fields. This may take a moment.`,
    },
  ];

  const currentIndex = stages.findIndex((s) => s.key === phase);

  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-10 text-center sm:px-6 sm:py-14">
      <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Loader2 className="size-6 animate-spin" />
      </div>

      <div className="w-full max-w-sm space-y-5">
        {stages.map((stage, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex items-start gap-3 text-left">
              <div
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                  isDone && "bg-success/20 text-success",
                  isCurrent && "bg-primary/15 text-primary",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent || isDone ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stage.title}
                </p>
                {isCurrent && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{stage.description}</p>
                )}
                {stage.key === "uploading" && isCurrent && (
                  <Progress value={uploadProgress} className="mt-2 h-1.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
