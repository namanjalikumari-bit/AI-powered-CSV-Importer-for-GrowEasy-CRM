import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ImportStep = "upload" | "preview" | "importing" | "result";

const STEPS: { key: ImportStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "importing", label: "AI Import" },
  { key: "result", label: "Summary" },
];

export function ImportStepper({ current }: { current: ImportStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex w-full items-center">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
