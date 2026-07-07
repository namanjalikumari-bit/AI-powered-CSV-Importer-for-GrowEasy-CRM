"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function CsvDropzone({
  file,
  isParsing,
  error,
  onFileSelected,
  onClear,
}: {
  file: File | null;
  isParsing: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0];
      if (selected) onFileSelected(selected);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: isParsing,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
  });

  if (file && !error) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {isParsing ? <Loader2 className="size-5 animate-spin" /> : <FileSpreadsheet className="size-5" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {isParsing ? "Parsing file…" : formatBytes(file.size)}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClear} disabled={isParsing} aria-label="Remove file">
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors sm:px-6 sm:py-14",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
          error && "border-destructive/50 bg-destructive/5"
        )}
      >
        <input {...getInputProps()} aria-label="Upload CSV file" />
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-6" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {isDragActive ? "Drop your CSV file here" : "Drag & drop your CSV file here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse from your computer</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Supports .csv files up to 10MB · Facebook, Google Ads, Excel, or any custom export
        </p>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
